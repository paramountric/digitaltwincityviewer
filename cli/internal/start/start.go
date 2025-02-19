package start

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"github.com/go-errors/errors"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/spf13/afero"
	"github.com/supabase/cli/internal/db/start"
	"github.com/supabase/cli/internal/functions/serve"
	"github.com/supabase/cli/internal/seed/buckets"
	"github.com/supabase/cli/internal/services"
	"github.com/supabase/cli/internal/status"
	"github.com/supabase/cli/internal/utils"
	"github.com/supabase/cli/internal/utils/flags"
	"github.com/supabase/cli/pkg/config"
	"golang.org/x/mod/semver"
)

func Run(ctx context.Context, fsys afero.Fs, excludedContainers []string, ignoreHealthCheck bool) error {
	// Sanity checks.
	{
		if err := utils.LoadConfigFS(fsys); err != nil {
			return err
		}
		if err := utils.AssertSupabaseDbIsRunning(); err == nil {
			fmt.Fprintln(os.Stderr, utils.Aqua("supabase start")+" is already running.")
			utils.CmdSuggestion = fmt.Sprintf("Run %s to show status of local Supabase containers.", utils.Aqua("supabase status"))
			return nil
		} else if !errors.Is(err, utils.ErrNotRunning) {
			return err
		}
		if err := flags.LoadProjectRef(fsys); err == nil {
			_ = services.CheckVersions(ctx, fsys)
		}
	}

	if err := utils.RunProgram(ctx, func(p utils.Program, ctx context.Context) error {
		dbConfig := pgconn.Config{
			Host:     utils.DbId,
			Port:     5432,
			User:     "postgres",
			Password: utils.Config.Db.Password,
			Database: "postgres",
		}
		return run(p, ctx, fsys, excludedContainers, dbConfig)
	}); err != nil {
		if ignoreHealthCheck && start.IsUnhealthyError(err) {
			fmt.Fprintln(os.Stderr, err)
		} else {
			if err := utils.DockerRemoveAll(context.Background(), os.Stderr, utils.Config.ProjectId); err != nil {
				fmt.Fprintln(os.Stderr, err)
			}
			return err
		}
	}

	fmt.Fprintf(os.Stderr, "Started %s local development setup.\n\n", utils.Aqua("supabase"))
	status.PrettyPrint(os.Stdout, excludedContainers...)
	return nil
}

type kongConfig struct {
	GotrueId          string
	RestId            string
	RealtimeId        string
	StorageId         string
	PgmetaId          string
	EdgeRuntimeId     string
	LogflareId        string
	PoolerId          string
	RedisId           string
	SpeckleServerId   string
	SpeckleFrontendId string
	ApiHost           string
	ApiPort          uint16
}

// TODO: deprecate after removing storage headers from kong
func StorageVersionBelow(target string) bool {
	parts := strings.Split(utils.Config.Storage.Image, ":v")
	return semver.Compare(parts[len(parts)-1], target) < 0
}

var (
	//go:embed templates/kong.yml
	kongConfigEmbed    string
	kongConfigTemplate = template.Must(template.New("kongConfig").Funcs(template.FuncMap{
		"StorageVersionBelow": StorageVersionBelow,
	}).Parse(kongConfigEmbed))

	//go:embed templates/custom_nginx.template
	nginxConfigEmbed string
	// Hardcoded configs which match nginxConfigEmbed
	nginxEmailTemplateDir   = "/home/kong/templates/email"
	nginxTemplateServerPort = 8088
)

type vectorConfig struct {
	ApiKey        string
	VectorId      string
	LogflareId    string
	KongId        string
	GotrueId      string
	RestId        string
	RealtimeId    string
	StorageId     string
	EdgeRuntimeId string
	DbId          string
}

var (
	//go:embed templates/vector.yaml
	vectorConfigEmbed    string
	vectorConfigTemplate = template.Must(template.New("vectorConfig").Parse(vectorConfigEmbed))
)

type poolerTenant struct {
	DbHost            string
	DbPort            uint16
	DbDatabase        string
	DbPassword        string
	ExternalId        string
	ModeType          config.PoolMode
	DefaultMaxClients uint
	DefaultPoolSize   uint
}

var (
	//go:embed templates/pooler.exs
	poolerTenantEmbed    string
	poolerTenantTemplate = template.Must(template.New("poolerTenant").Parse(poolerTenantEmbed))
)

var serviceTimeout = 30 * time.Second

func run(p utils.Program, ctx context.Context, fsys afero.Fs, excludedContainers []string, dbConfig pgconn.Config, options ...func(*pgx.ConnConfig)) error {
	excluded := make(map[string]bool)
	for _, name := range excludedContainers {
		excluded[name] = true
	}

	jwks, err := utils.Config.Auth.ResolveJWKS(ctx)
	if err != nil {
		return err
	}

	// Start Postgres.
	w := utils.StatusWriter{Program: p}
	if dbConfig.Host == utils.DbId {
		if err := start.StartDatabase(ctx, fsys, w, options...); err != nil {
			return err
		}
	}

	var started []string
	var isStorageEnabled = utils.Config.Storage.Enabled && !isContainerExcluded(utils.Config.Storage.Image, excluded)
	p.Send(utils.StatusMsg("Starting containers..."))

	// Start Logflare
	if utils.Config.Analytics.Enabled && !isContainerExcluded(utils.Config.Analytics.Image, excluded) {
		env := []string{
			"DB_DATABASE=_supabase",
			"DB_HOSTNAME=" + dbConfig.Host,
			fmt.Sprintf("DB_PORT=%d", dbConfig.Port),
			"DB_SCHEMA=_analytics",
			"DB_USERNAME=supabase_admin",
			"DB_PASSWORD=" + dbConfig.Password,
			"LOGFLARE_MIN_CLUSTER_SIZE=1",
			"LOGFLARE_SINGLE_TENANT=true",
			"LOGFLARE_SUPABASE_MODE=true",
			"LOGFLARE_API_KEY=" + utils.Config.Analytics.ApiKey,
			"LOGFLARE_LOG_LEVEL=warn",
			"LOGFLARE_NODE_HOST=127.0.0.1",
			"LOGFLARE_FEATURE_FLAG_OVERRIDE='multibackend=true'",
			"RELEASE_COOKIE=cookie",
		}
		bind := []string{}

		switch utils.Config.Analytics.Backend {
		case config.LogflareBigQuery:
			workdir, err := os.Getwd()
			if err != nil {
				return errors.Errorf("failed to get working directory: %w", err)
			}
			hostJwtPath := filepath.Join(workdir, utils.Config.Analytics.GcpJwtPath)
			bind = append(bind, hostJwtPath+":/opt/app/rel/logflare/bin/gcloud.json")
			// This is hardcoded in studio frontend
			env = append(env,
				"GOOGLE_DATASET_ID_APPEND=_prod",
				"GOOGLE_PROJECT_ID="+utils.Config.Analytics.GcpProjectId,
				"GOOGLE_PROJECT_NUMBER="+utils.Config.Analytics.GcpProjectNumber,
			)
		case config.LogflarePostgres:
			env = append(env,
				fmt.Sprintf("POSTGRES_BACKEND_URL=postgresql://%s:%s@%s:%d/%s", dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, "_supabase"),
				"POSTGRES_BACKEND_SCHEMA=_analytics",
			)
		}

		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Hostname: "127.0.0.1",
				Image:    utils.Config.Analytics.Image,
				Env:      env,
				// Original entrypoint conflicts with healthcheck due to 15 seconds sleep:
				// https://github.com/Logflare/logflare/blob/staging/run.sh#L35
				Entrypoint: []string{"sh", "-c", `cat <<'EOF' > run.sh && sh run.sh
./logflare eval Logflare.Release.migrate
./logflare start --sname logflare
EOF
`},
				Healthcheck: &container.HealthConfig{
					Test: []string{"CMD", "curl", "-sSfL", "--head", "-o", "/dev/null",
						"http://127.0.0.1:4000/health",
					},
					Interval:    10 * time.Second,
					Timeout:     2 * time.Second,
					Retries:     3,
					StartPeriod: 10 * time.Second,
				},
				ExposedPorts: nat.PortSet{"4000/tcp": {}},
			},
			container.HostConfig{
				Binds:         bind,
				PortBindings:  nat.PortMap{"4000/tcp": []nat.PortBinding{{HostPort: strconv.FormatUint(uint64(utils.Config.Analytics.Port), 10)}}},
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.LogflareAliases,
					},
				},
			},
			utils.LogflareId,
		); err != nil {
			return err
		}
		started = append(started, utils.LogflareId)
	}

	// Start vector
	if utils.Config.Analytics.Enabled && !isContainerExcluded(utils.Config.Analytics.VectorImage, excluded) {
		var vectorConfigBuf bytes.Buffer
		if err := vectorConfigTemplate.Option("missingkey=error").Execute(&vectorConfigBuf, vectorConfig{
			ApiKey:        utils.Config.Analytics.ApiKey,
			VectorId:      utils.VectorId,
			LogflareId:    utils.LogflareId,
			KongId:        utils.KongId,
			GotrueId:      utils.GotrueId,
			RestId:        utils.RestId,
			RealtimeId:    utils.RealtimeId,
			StorageId:     utils.StorageId,
			EdgeRuntimeId: utils.EdgeRuntimeId,
			DbId:          utils.DbId,
		}); err != nil {
			return errors.Errorf("failed to exec template: %w", err)
		}
		var binds, env []string
		// Special case for GitLab pipeline
		parsed, err := client.ParseHostURL(utils.Docker.DaemonHost())
		if err != nil {
			return errors.Errorf("failed to parse docker host: %w", err)
		}
		// Ref: https://vector.dev/docs/reference/configuration/sources/docker_logs/#docker_host
		dindHost := url.URL{Scheme: "http", Host: net.JoinHostPort(utils.DinDHost, "2375")}
		switch parsed.Scheme {
		case "tcp":
			if _, port, err := net.SplitHostPort(parsed.Host); err == nil {
				dindHost.Host = net.JoinHostPort(utils.DinDHost, port)
			}
			env = append(env, "DOCKER_HOST="+dindHost.String())
		case "npipe":
			fmt.Fprintln(os.Stderr, utils.Yellow("WARNING:"), "analytics requires docker daemon exposed on tcp://localhost:2375")
			env = append(env, "DOCKER_HOST="+dindHost.String())
		case "unix":
			if parsed, err = client.ParseHostURL(client.DefaultDockerHost); err != nil {
				return errors.Errorf("failed to parse default host: %w", err)
			}
			if utils.Docker.DaemonHost() != client.DefaultDockerHost {
				fmt.Fprintln(os.Stderr, utils.Yellow("WARNING:"), "analytics requires mounting default docker socket:", parsed.Host)
			}
			binds = append(binds, fmt.Sprintf("%[1]s:%[1]s:ro", parsed.Host))
		}
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Analytics.VectorImage,
				Env:   env,
				Entrypoint: []string{"sh", "-c", `cat <<'EOF' > /etc/vector/vector.yaml && vector --config /etc/vector/vector.yaml
` + vectorConfigBuf.String() + `
EOF
`},
				Healthcheck: &container.HealthConfig{
					Test: []string{"CMD", "curl", "-sSfL", "--head", "-o", "/dev/null",
						"http://127.0.0.1:9001/health",
					},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				Binds:         binds,
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.VectorAliases,
					},
				},
			},
			utils.VectorId,
		); err != nil {
			return err
		}
		started = append(started, utils.VectorId)
	}

	// Start Kong.
	if !isContainerExcluded(utils.Config.Api.KongImage, excluded) {
		var kongConfigBuf bytes.Buffer
		if err := kongConfigTemplate.Option("missingkey=error").Execute(&kongConfigBuf, kongConfig{
			GotrueId:      utils.GotrueId,
			RestId:        utils.RestId,
			RealtimeId:    utils.Config.Realtime.TenantId,
			StorageId:     utils.StorageId,
			PgmetaId:      utils.PgmetaId,
			EdgeRuntimeId: utils.EdgeRuntimeId,
			LogflareId:    utils.LogflareId,
			PoolerId:      utils.PoolerId,
			RedisId:       utils.RedisId,
			SpeckleServerId:   utils.SpeckleServerId,
			SpeckleFrontendId: utils.SpeckleFrontendId,
			ApiHost:       utils.Config.Hostname,
			ApiPort:       utils.Config.Api.Port,
		}); err != nil {
			return errors.Errorf("failed to exec template: %w", err)
		}

		binds := []string{}
		for id, tmpl := range utils.Config.Auth.Email.Template {
			if len(tmpl.ContentPath) == 0 {
				continue
			}
			hostPath := tmpl.ContentPath
			if !filepath.IsAbs(tmpl.ContentPath) {
				var err error
				hostPath, err = filepath.Abs(hostPath)
				if err != nil {
					return errors.Errorf("failed to resolve absolute path: %w", err)
				}
			}
			dockerPath := path.Join(nginxEmailTemplateDir, id+filepath.Ext(hostPath))
			binds = append(binds, fmt.Sprintf("%s:%s:rw", hostPath, dockerPath))
		}

		dockerPort := uint16(8000)
		if utils.Config.Api.Tls.Enabled {
			dockerPort = 8443
		}
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Api.KongImage,
				Env: []string{
					"KONG_DATABASE=off",
					"KONG_DECLARATIVE_CONFIG=/home/kong/kong.yml",
					"KONG_DNS_ORDER=LAST,A,CNAME",
					"KONG_PLUGINS=request-transformer,cors",
					fmt.Sprintf("KONG_PORT_MAPS=%d:8000", utils.Config.Api.Port),
					// Need to increase the nginx buffers in kong to avoid it rejecting the rather
					// sizeable response headers azure can generate
					// Ref: https://github.com/Kong/kong/issues/3974#issuecomment-482105126
					"KONG_NGINX_PROXY_PROXY_BUFFER_SIZE=160k",
					"KONG_NGINX_PROXY_PROXY_BUFFERS=64 160k",
					"KONG_NGINX_WORKER_PROCESSES=1",
					// Use modern TLS certificate
					"KONG_SSL_CERT=/home/kong/localhost.crt",
					"KONG_SSL_CERT_KEY=/home/kong/localhost.key",
					"KONG_DNS_RESOLVER=127.0.0.11:53",
					"KONG_DNS_ORDER=LAST,A,CNAME",
					"KONG_DNS_NOT_FOUND_TTL=0s",
					"KONG_DNS_ERROR_TTL=0s",
					"KONG_DNS_STALE_TTL=0s",
				},
				Entrypoint: []string{"sh", "-c", `cat <<'EOF' > /home/kong/kong.yml && \
cat <<'EOF' > /home/kong/custom_nginx.template && \
cat <<'EOF' > /home/kong/localhost.crt && \
cat <<'EOF' > /home/kong/localhost.key && \
./docker-entrypoint.sh kong docker-start --nginx-conf /home/kong/custom_nginx.template
` + kongConfigBuf.String() + `
EOF
` + nginxConfigEmbed + `
EOF
` + status.KongCert + `
EOF
` + status.KongKey + `
EOF
`},
				ExposedPorts: nat.PortSet{
					"8000/tcp": {},
					"8443/tcp": {},
					nat.Port(fmt.Sprintf("%d/tcp", nginxTemplateServerPort)): {},
				},
			},
			container.HostConfig{
				Binds: binds,
				PortBindings: nat.PortMap{nat.Port(fmt.Sprintf("%d/tcp", dockerPort)): []nat.PortBinding{{
					HostPort: strconv.FormatUint(uint64(utils.Config.Api.Port), 10)},
				}},
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.KongAliases,
					},
				},
			},
			utils.KongId,
		); err != nil {
			return err
		}
		started = append(started, utils.KongId)
	}

	// Start GoTrue.
	if utils.Config.Auth.Enabled && !isContainerExcluded(utils.Config.Auth.Image, excluded) {
		var testOTP bytes.Buffer
		if len(utils.Config.Auth.Sms.TestOTP) > 0 {
			formatMapForEnvConfig(utils.Config.Auth.Sms.TestOTP, &testOTP)
		}

		env := []string{
			"API_EXTERNAL_URL=" + utils.Config.Api.ExternalUrl,

			"GOTRUE_API_HOST=0.0.0.0",
			"GOTRUE_API_PORT=9999",

			"GOTRUE_DB_DRIVER=postgres",
			fmt.Sprintf("GOTRUE_DB_DATABASE_URL=postgresql://supabase_auth_admin:%s@%s:%d/%s", dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Database),

			"GOTRUE_SITE_URL=" + utils.Config.Auth.SiteUrl,
			"GOTRUE_URI_ALLOW_LIST=" + strings.Join(utils.Config.Auth.AdditionalRedirectUrls, ","),
			fmt.Sprintf("GOTRUE_DISABLE_SIGNUP=%v", !utils.Config.Auth.EnableSignup),

			"GOTRUE_JWT_ADMIN_ROLES=service_role",
			"GOTRUE_JWT_AUD=authenticated",
			"GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated",
			fmt.Sprintf("GOTRUE_JWT_EXP=%v", utils.Config.Auth.JwtExpiry),
			"GOTRUE_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
			"GOTRUE_JWT_ISSUER=" + utils.GetApiUrl("/auth/v1"),

			fmt.Sprintf("GOTRUE_EXTERNAL_EMAIL_ENABLED=%v", utils.Config.Auth.Email.EnableSignup),
			fmt.Sprintf("GOTRUE_MAILER_SECURE_EMAIL_CHANGE_ENABLED=%v", utils.Config.Auth.Email.DoubleConfirmChanges),
			fmt.Sprintf("GOTRUE_MAILER_AUTOCONFIRM=%v", !utils.Config.Auth.Email.EnableConfirmations),
			fmt.Sprintf("GOTRUE_MAILER_OTP_LENGTH=%v", utils.Config.Auth.Email.OtpLength),
			fmt.Sprintf("GOTRUE_MAILER_OTP_EXP=%v", utils.Config.Auth.Email.OtpExpiry),

			fmt.Sprintf("GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=%v", utils.Config.Auth.EnableAnonymousSignIns),

			fmt.Sprintf("GOTRUE_SMTP_MAX_FREQUENCY=%v", utils.Config.Auth.Email.MaxFrequency),

			"GOTRUE_MAILER_URLPATHS_INVITE=" + utils.GetApiUrl("/auth/v1/verify"),
			"GOTRUE_MAILER_URLPATHS_CONFIRMATION=" + utils.GetApiUrl("/auth/v1/verify"),
			"GOTRUE_MAILER_URLPATHS_RECOVERY=" + utils.GetApiUrl("/auth/v1/verify"),
			"GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=" + utils.GetApiUrl("/auth/v1/verify"),
			"GOTRUE_RATE_LIMIT_EMAIL_SENT=360000",

			fmt.Sprintf("GOTRUE_EXTERNAL_PHONE_ENABLED=%v", utils.Config.Auth.Sms.EnableSignup),
			fmt.Sprintf("GOTRUE_SMS_AUTOCONFIRM=%v", !utils.Config.Auth.Sms.EnableConfirmations),
			fmt.Sprintf("GOTRUE_SMS_MAX_FREQUENCY=%v", utils.Config.Auth.Sms.MaxFrequency),
			"GOTRUE_SMS_OTP_EXP=6000",
			"GOTRUE_SMS_OTP_LENGTH=6",
			fmt.Sprintf("GOTRUE_SMS_TEMPLATE=%v", utils.Config.Auth.Sms.Template),
			"GOTRUE_SMS_TEST_OTP=" + testOTP.String(),

			fmt.Sprintf("GOTRUE_PASSWORD_MIN_LENGTH=%v", utils.Config.Auth.MinimumPasswordLength),
			fmt.Sprintf("GOTRUE_PASSWORD_REQUIRED_CHARACTERS=%v", utils.Config.Auth.PasswordRequirements.ToChar()),
			fmt.Sprintf("GOTRUE_SECURITY_REFRESH_TOKEN_ROTATION_ENABLED=%v", utils.Config.Auth.EnableRefreshTokenRotation),
			fmt.Sprintf("GOTRUE_SECURITY_REFRESH_TOKEN_REUSE_INTERVAL=%v", utils.Config.Auth.RefreshTokenReuseInterval),
			fmt.Sprintf("GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=%v", utils.Config.Auth.EnableManualLinking),
			fmt.Sprintf("GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION=%v", utils.Config.Auth.Email.SecurePasswordChange),
			fmt.Sprintf("GOTRUE_MFA_PHONE_ENROLL_ENABLED=%v", utils.Config.Auth.MFA.Phone.EnrollEnabled),
			fmt.Sprintf("GOTRUE_MFA_PHONE_VERIFY_ENABLED=%v", utils.Config.Auth.MFA.Phone.VerifyEnabled),
			fmt.Sprintf("GOTRUE_MFA_TOTP_ENROLL_ENABLED=%v", utils.Config.Auth.MFA.TOTP.EnrollEnabled),
			fmt.Sprintf("GOTRUE_MFA_TOTP_VERIFY_ENABLED=%v", utils.Config.Auth.MFA.TOTP.VerifyEnabled),
			fmt.Sprintf("GOTRUE_MFA_WEB_AUTHN_ENROLL_ENABLED=%v", utils.Config.Auth.MFA.WebAuthn.EnrollEnabled),
			fmt.Sprintf("GOTRUE_MFA_WEB_AUTHN_VERIFY_ENABLED=%v", utils.Config.Auth.MFA.WebAuthn.VerifyEnabled),
			fmt.Sprintf("GOTRUE_MFA_MAX_ENROLLED_FACTORS=%v", utils.Config.Auth.MFA.MaxEnrolledFactors),
		}

		if utils.Config.Auth.Email.Smtp != nil && utils.Config.Auth.Email.Smtp.IsEnabled() {
			env = append(env,
				fmt.Sprintf("GOTRUE_SMTP_HOST=%s", utils.Config.Auth.Email.Smtp.Host),
				fmt.Sprintf("GOTRUE_SMTP_PORT=%d", utils.Config.Auth.Email.Smtp.Port),
				fmt.Sprintf("GOTRUE_SMTP_USER=%s", utils.Config.Auth.Email.Smtp.User),
				fmt.Sprintf("GOTRUE_SMTP_PASS=%s", utils.Config.Auth.Email.Smtp.Pass),
				fmt.Sprintf("GOTRUE_SMTP_ADMIN_EMAIL=%s", utils.Config.Auth.Email.Smtp.AdminEmail),
				fmt.Sprintf("GOTRUE_SMTP_SENDER_NAME=%s", utils.Config.Auth.Email.Smtp.SenderName),
			)
		} else if utils.Config.Inbucket.Enabled {
			env = append(env,
				"GOTRUE_SMTP_HOST="+utils.InbucketId,
				"GOTRUE_SMTP_PORT=2500",
				fmt.Sprintf("GOTRUE_SMTP_ADMIN_EMAIL=%s", utils.Config.Inbucket.AdminEmail),
				fmt.Sprintf("GOTRUE_SMTP_SENDER_NAME=%s", utils.Config.Inbucket.SenderName),
			)
		}

		if utils.Config.Auth.Sessions.Timebox > 0 {
			env = append(env, fmt.Sprintf("GOTRUE_SESSIONS_TIMEBOX=%v", utils.Config.Auth.Sessions.Timebox))
		}
		if utils.Config.Auth.Sessions.InactivityTimeout > 0 {
			env = append(env, fmt.Sprintf("GOTRUE_SESSIONS_INACTIVITY_TIMEOUT=%v", utils.Config.Auth.Sessions.InactivityTimeout))
		}

		for id, tmpl := range utils.Config.Auth.Email.Template {
			if len(tmpl.ContentPath) > 0 {
				env = append(env, fmt.Sprintf("GOTRUE_MAILER_TEMPLATES_%s=http://%s:%d/email/%s",
					strings.ToUpper(id),
					utils.KongId,
					nginxTemplateServerPort,
					id+filepath.Ext(tmpl.ContentPath),
				))
			}
			if tmpl.Subject != nil {
				env = append(env, fmt.Sprintf("GOTRUE_MAILER_SUBJECTS_%s=%s",
					strings.ToUpper(id),
					*tmpl.Subject,
				))
			}
		}

		switch {
		case utils.Config.Auth.Sms.Twilio.Enabled:
			env = append(
				env,
				"GOTRUE_SMS_PROVIDER=twilio",
				"GOTRUE_SMS_TWILIO_ACCOUNT_SID="+utils.Config.Auth.Sms.Twilio.AccountSid,
				"GOTRUE_SMS_TWILIO_AUTH_TOKEN="+utils.Config.Auth.Sms.Twilio.AuthToken,
				"GOTRUE_SMS_TWILIO_MESSAGE_SERVICE_SID="+utils.Config.Auth.Sms.Twilio.MessageServiceSid,
			)
		case utils.Config.Auth.Sms.TwilioVerify.Enabled:
			env = append(
				env,
				"GOTRUE_SMS_PROVIDER=twilio_verify",
				"GOTRUE_SMS_TWILIO_VERIFY_ACCOUNT_SID="+utils.Config.Auth.Sms.TwilioVerify.AccountSid,
				"GOTRUE_SMS_TWILIO_VERIFY_AUTH_TOKEN="+utils.Config.Auth.Sms.TwilioVerify.AuthToken,
				"GOTRUE_SMS_TWILIO_VERIFY_MESSAGE_SERVICE_SID="+utils.Config.Auth.Sms.TwilioVerify.MessageServiceSid,
			)
		case utils.Config.Auth.Sms.Messagebird.Enabled:
			env = append(
				env,
				"GOTRUE_SMS_PROVIDER=messagebird",
				"GOTRUE_SMS_MESSAGEBIRD_ACCESS_KEY="+utils.Config.Auth.Sms.Messagebird.AccessKey,
				"GOTRUE_SMS_MESSAGEBIRD_ORIGINATOR="+utils.Config.Auth.Sms.Messagebird.Originator,
			)
		case utils.Config.Auth.Sms.Textlocal.Enabled:
			env = append(
				env,
				"GOTRUE_SMS_PROVIDER=textlocal",
				"GOTRUE_SMS_TEXTLOCAL_API_KEY="+utils.Config.Auth.Sms.Textlocal.ApiKey,
				"GOTRUE_SMS_TEXTLOCAL_SENDER="+utils.Config.Auth.Sms.Textlocal.Sender,
			)
		case utils.Config.Auth.Sms.Vonage.Enabled:
			env = append(
				env,
				"GOTRUE_SMS_PROVIDER=vonage",
				"GOTRUE_SMS_VONAGE_API_KEY="+utils.Config.Auth.Sms.Vonage.ApiKey,
				"GOTRUE_SMS_VONAGE_API_SECRET="+utils.Config.Auth.Sms.Vonage.ApiSecret,
				"GOTRUE_SMS_VONAGE_FROM="+utils.Config.Auth.Sms.Vonage.From,
			)
		}

		if hook := utils.Config.Auth.Hook.MFAVerificationAttempt; hook != nil && hook.Enabled {
			env = append(
				env,
				"GOTRUE_HOOK_MFA_VERIFICATION_ATTEMPT_ENABLED=true",
				"GOTRUE_HOOK_MFA_VERIFICATION_ATTEMPT_URI="+hook.URI,
				"GOTRUE_HOOK_MFA_VERIFICATION_ATTEMPT_SECRETS="+hook.Secrets,
			)
		}
		if hook := utils.Config.Auth.Hook.PasswordVerificationAttempt; hook != nil && hook.Enabled {
			env = append(
				env,
				"GOTRUE_HOOK_PASSWORD_VERIFICATION_ATTEMPT_ENABLED=true",
				"GOTRUE_HOOK_PASSWORD_VERIFICATION_ATTEMPT_URI="+hook.URI,
				"GOTRUE_HOOK_PASSWORD_VERIFICATION_ATTEMPT_SECRETS="+hook.Secrets,
			)
		}
		if hook := utils.Config.Auth.Hook.CustomAccessToken; hook != nil && hook.Enabled {
			env = append(
				env,
				"GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_ENABLED=true",
				"GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_URI="+hook.URI,
				"GOTRUE_HOOK_CUSTOM_ACCESS_TOKEN_SECRETS="+hook.Secrets,
			)
		}
		if hook := utils.Config.Auth.Hook.SendSMS; hook != nil && hook.Enabled {
			env = append(
				env,
				"GOTRUE_HOOK_SEND_SMS_ENABLED=true",
				"GOTRUE_HOOK_SEND_SMS_URI="+hook.URI,
				"GOTRUE_HOOK_SEND_SMS_SECRETS="+hook.Secrets,
			)
		}
		if hook := utils.Config.Auth.Hook.SendEmail; hook != nil && hook.Enabled {
			env = append(
				env,
				"GOTRUE_HOOK_SEND_EMAIL_ENABLED=true",
				"GOTRUE_HOOK_SEND_EMAIL_URI="+hook.URI,
				"GOTRUE_HOOK_SEND_EMAIL_SECRETS="+hook.Secrets,
			)
		}

		if utils.Config.Auth.MFA.Phone.EnrollEnabled || utils.Config.Auth.MFA.Phone.VerifyEnabled {
			env = append(
				env,
				"GOTRUE_MFA_PHONE_TEMPLATE="+utils.Config.Auth.MFA.Phone.Template,
				fmt.Sprintf("GOTRUE_MFA_PHONE_OTP_LENGTH=%v", utils.Config.Auth.MFA.Phone.OtpLength),
				fmt.Sprintf("GOTRUE_MFA_PHONE_MAX_FREQUENCY=%v", utils.Config.Auth.MFA.Phone.MaxFrequency),
			)
		}

		for name, config := range utils.Config.Auth.External {
			env = append(
				env,
				fmt.Sprintf("GOTRUE_EXTERNAL_%s_ENABLED=%v", strings.ToUpper(name), config.Enabled),
				fmt.Sprintf("GOTRUE_EXTERNAL_%s_CLIENT_ID=%s", strings.ToUpper(name), config.ClientId),
				fmt.Sprintf("GOTRUE_EXTERNAL_%s_SECRET=%s", strings.ToUpper(name), config.Secret),
				fmt.Sprintf("GOTRUE_EXTERNAL_%s_SKIP_NONCE_CHECK=%t", strings.ToUpper(name), config.SkipNonceCheck),
			)

			redirectUri := config.RedirectUri
			if redirectUri == "" {
				redirectUri = utils.GetApiUrl("/auth/v1/callback")
			}
			env = append(env, fmt.Sprintf("GOTRUE_EXTERNAL_%s_REDIRECT_URI=%s", strings.ToUpper(name), redirectUri))

			if config.Url != "" {
				env = append(env, fmt.Sprintf("GOTRUE_EXTERNAL_%s_URL=%s", strings.ToUpper(name), config.Url))
			}
		}

		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image:        utils.Config.Auth.Image,
				Env:          env,
				ExposedPorts: nat.PortSet{"9999/tcp": {}},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "curl", "-sSfL", "--head", "-o", "/dev/null", "http://127.0.0.1:9999/health"},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.GotrueAliases,
					},
				},
			},
			utils.GotrueId,
		); err != nil {
			return err
		}
		started = append(started, utils.GotrueId)
	}

	// Start Inbucket.
	if utils.Config.Inbucket.Enabled && !isContainerExcluded(utils.Config.Inbucket.Image, excluded) {
		inbucketPortBindings := nat.PortMap{"9000/tcp": []nat.PortBinding{{HostPort: strconv.FormatUint(uint64(utils.Config.Inbucket.Port), 10)}}}
		if utils.Config.Inbucket.SmtpPort != 0 {
			inbucketPortBindings["2500/tcp"] = []nat.PortBinding{{HostPort: strconv.FormatUint(uint64(utils.Config.Inbucket.SmtpPort), 10)}}
		}
		if utils.Config.Inbucket.Pop3Port != 0 {
			inbucketPortBindings["1100/tcp"] = []nat.PortBinding{{HostPort: strconv.FormatUint(uint64(utils.Config.Inbucket.Pop3Port), 10)}}
		}
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Inbucket.Image,
			},
			container.HostConfig{
				Binds: []string{
					// Override default mount points to avoid creating multiple anonymous volumes
					// Ref: https://github.com/inbucket/inbucket/blob/v3.0.4/Dockerfile#L52
					utils.InbucketId + ":/config",
					utils.InbucketId + ":/storage",
				},
				PortBindings:  inbucketPortBindings,
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.InbucketAliases,
					},
				},
			},
			utils.InbucketId,
		); err != nil {
			return err
		}
		started = append(started, utils.InbucketId)
	}

	// Start Realtime.
	if utils.Config.Realtime.Enabled && !isContainerExcluded(utils.Config.Realtime.Image, excluded) {
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Realtime.Image,
				Env: []string{
					"PORT=4000",
					"DB_HOST=" + dbConfig.Host,
					fmt.Sprintf("DB_PORT=%d", dbConfig.Port),
					"DB_USER=supabase_admin",
					"DB_PASSWORD=" + dbConfig.Password,
					"DB_NAME=" + dbConfig.Database,
					"DB_AFTER_CONNECT_QUERY=SET search_path TO _realtime",
					"DB_ENC_KEY=" + utils.Config.Realtime.EncryptionKey,
					"API_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
					fmt.Sprintf("API_JWT_JWKS=%s", jwks),
					"METRICS_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
					"APP_NAME=realtime",
					"SECRET_KEY_BASE=" + utils.Config.Realtime.SecretKeyBase,
					"ERL_AFLAGS=" + utils.ToRealtimeEnv(utils.Config.Realtime.IpVersion),
					"DNS_NODES=''",
					"RLIMIT_NOFILE=",
					"SEED_SELF_HOST=true",
					"RUN_JANITOR=true",
					fmt.Sprintf("MAX_HEADER_LENGTH=%d", utils.Config.Realtime.MaxHeaderLength),
				},
				ExposedPorts: nat.PortSet{"4000/tcp": {}},
				Healthcheck: &container.HealthConfig{
					// Podman splits command by spaces unless it's quoted, but curl header can't be quoted.
					Test: []string{"CMD", "curl", "-sSfL", "--head", "-o", "/dev/null",
						"-H", "Host:" + utils.Config.Realtime.TenantId,
						"http://127.0.0.1:4000/api/ping",
					},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.RealtimeAliases,
					},
				},
			},
			utils.RealtimeId,
		); err != nil {
			return err
		}
		started = append(started, utils.RealtimeId)
	}

	// Start PostgREST.
	if utils.Config.Api.Enabled && !isContainerExcluded(utils.Config.Api.Image, excluded) {
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Api.Image,
				Env: []string{
					fmt.Sprintf("PGRST_DB_URI=postgresql://authenticator:%s@%s:%d/%s", dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Database),
					"PGRST_DB_SCHEMAS=" + strings.Join(utils.Config.Api.Schemas, ","),
					"PGRST_DB_EXTRA_SEARCH_PATH=" + strings.Join(utils.Config.Api.ExtraSearchPath, ","),
					fmt.Sprintf("PGRST_DB_MAX_ROWS=%d", utils.Config.Api.MaxRows),
					"PGRST_DB_ANON_ROLE=anon",
					fmt.Sprintf("PGRST_JWT_SECRET=%s", jwks),
					"PGRST_ADMIN_SERVER_PORT=3001",
				},
				// PostgREST does not expose a shell for health check
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.RestAliases,
					},
				},
			},
			utils.RestId,
		); err != nil {
			return err
		}
		started = append(started, utils.RestId)
	}

	// Start Storage.
	if isStorageEnabled {
		dockerStoragePath := "/mnt"
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Storage.Image,
				Env: []string{
					"ANON_KEY=" + utils.Config.Auth.AnonKey,
					"SERVICE_KEY=" + utils.Config.Auth.ServiceRoleKey,
					"AUTH_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
					fmt.Sprintf("AUTH_JWT_JWKS=%s", jwks),
					fmt.Sprintf("DATABASE_URL=postgresql://supabase_storage_admin:%s@%s:%d/%s", dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Database),
					fmt.Sprintf("FILE_SIZE_LIMIT=%v", utils.Config.Storage.FileSizeLimit),
					"STORAGE_BACKEND=file",
					"FILE_STORAGE_BACKEND_PATH=" + dockerStoragePath,
					"TENANT_ID=stub",
					// TODO: https://github.com/supabase/storage-api/issues/55
					"STORAGE_S3_REGION=" + utils.Config.Storage.S3Credentials.Region,
					"GLOBAL_S3_BUCKET=stub",
					fmt.Sprintf("ENABLE_IMAGE_TRANSFORMATION=%t", utils.Config.Storage.ImageTransformation.Enabled),
					fmt.Sprintf("IMGPROXY_URL=http://%s:5001", utils.ImgProxyId),
					"TUS_URL_PATH=/storage/v1/upload/resumable",
					"S3_PROTOCOL_ACCESS_KEY_ID=" + utils.Config.Storage.S3Credentials.AccessKeyId,
					"S3_PROTOCOL_ACCESS_KEY_SECRET=" + utils.Config.Storage.S3Credentials.SecretAccessKey,
					"S3_PROTOCOL_PREFIX=/storage/v1",
					fmt.Sprintf("S3_ALLOW_FORWARDED_HEADER=%v", StorageVersionBelow("1.10.1")),
					"UPLOAD_FILE_SIZE_LIMIT=52428800000",
					"UPLOAD_FILE_SIZE_LIMIT_STANDARD=5242880000",
				},
				Healthcheck: &container.HealthConfig{
					// For some reason, localhost resolves to IPv6 address on GitPod which breaks healthcheck.
					Test: []string{"CMD", "curl", "-sSfL", "--head", "-o", "/dev/null",
						"http://127.0.0.1:5000/status",
					},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
				Binds:         []string{utils.StorageId + ":" + dockerStoragePath},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.StorageAliases,
					},
				},
			},
			utils.StorageId,
		); err != nil {
			return err
		}
		started = append(started, utils.StorageId)
	}

	// Start Storage ImgProxy.
	if isStorageEnabled && utils.Config.Storage.ImageTransformation.Enabled && !isContainerExcluded(utils.Config.Storage.ImageTransformation.Image, excluded) {
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Storage.ImageTransformation.Image,
				Env: []string{
					"IMGPROXY_BIND=:5001",
					"IMGPROXY_LOCAL_FILESYSTEM_ROOT=/",
					"IMGPROXY_USE_ETAG=/",
				},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "imgproxy", "health"},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				VolumesFrom:   []string{utils.StorageId},
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.ImgProxyAliases,
					},
				},
			},
			utils.ImgProxyId,
		); err != nil {
			return err
		}
		started = append(started, utils.ImgProxyId)
	}

	// Start all functions.
	if utils.Config.EdgeRuntime.Enabled && !isContainerExcluded(utils.Config.EdgeRuntime.Image, excluded) {
		dbUrl := fmt.Sprintf("postgresql://%s:%s@%s:%d/%s", dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Database)
		if err := serve.ServeFunctions(ctx, "", nil, "", dbUrl, serve.RuntimeOption{}, fsys); err != nil {
			return err
		}
		started = append(started, utils.EdgeRuntimeId)
	}

	// Start pg-meta.
	if utils.Config.Studio.Enabled && !isContainerExcluded(utils.Config.Studio.PgmetaImage, excluded) {
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Studio.PgmetaImage,
				Env: []string{
					"PG_META_PORT=8080",
					"PG_META_DB_HOST=" + dbConfig.Host,
					"PG_META_DB_NAME=" + dbConfig.Database,
					"PG_META_DB_USER=" + dbConfig.User,
					fmt.Sprintf("PG_META_DB_PORT=%d", dbConfig.Port),
					"PG_META_DB_PASSWORD=" + dbConfig.Password,
				},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD-SHELL", `node --eval="fetch('http://127.0.0.1:8080/health').then((r) => {if (!r.ok) throw new Error(r.status)})"`},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.PgmetaAliases,
					},
				},
			},
			utils.PgmetaId,
		); err != nil {
			return err
		}
		started = append(started, utils.PgmetaId)
	}

	// Start Studio.
	if utils.Config.Studio.Enabled && !isContainerExcluded(utils.Config.Studio.Image, excluded) {
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Studio.Image,
				Env: []string{
					"STUDIO_PG_META_URL=http://" + utils.PgmetaId + ":8080",
					"POSTGRES_PASSWORD=" + dbConfig.Password,
					"SUPABASE_URL=http://" + utils.KongId + ":8000",
					"SUPABASE_PUBLIC_URL=" + utils.Config.Studio.ApiUrl,
					"AUTH_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
					"SUPABASE_ANON_KEY=" + utils.Config.Auth.AnonKey,
					"SUPABASE_SERVICE_KEY=" + utils.Config.Auth.ServiceRoleKey,
					"LOGFLARE_API_KEY=" + utils.Config.Analytics.ApiKey,
					"OPENAI_API_KEY=" + utils.Config.Studio.OpenaiApiKey,
					fmt.Sprintf("LOGFLARE_URL=http://%v:4000", utils.LogflareId),
					fmt.Sprintf("NEXT_PUBLIC_ENABLE_LOGS=%v", utils.Config.Analytics.Enabled),
					fmt.Sprintf("NEXT_ANALYTICS_BACKEND_PROVIDER=%v", utils.Config.Analytics.Backend),
					// Ref: https://github.com/vercel/next.js/issues/51684#issuecomment-1612834913
					"HOSTNAME=0.0.0.0",
				},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"},
					Interval: 10 * time.Second,
					Timeout:  5 * time.Second,
					Retries:  5,
					StartPeriod: 30 * time.Second,
				},
			},
			container.HostConfig{
				PortBindings:  nat.PortMap{"3000/tcp": []nat.PortBinding{{HostPort: strconv.FormatUint(uint64(utils.Config.Studio.Port), 10)}}},
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.StudioAliases,
					},
				},
			},
			utils.StudioId,
		); err != nil {
			return err
		}
		started = append(started, utils.StudioId)
	}

	// Start pooler.
	if utils.Config.Db.Pooler.Enabled && !isContainerExcluded(utils.Config.Db.Pooler.Image, excluded) {
		portSession := uint16(5432)
		portTransaction := uint16(6543)
		dockerPort := portTransaction
		if utils.Config.Db.Pooler.PoolMode == config.SessionMode {
			dockerPort = portSession
		}
		// Create pooler tenant
		var poolerTenantBuf bytes.Buffer
		if err := poolerTenantTemplate.Option("missingkey=error").Execute(&poolerTenantBuf, poolerTenant{
			DbHost:            dbConfig.Host,
			DbPort:            dbConfig.Port,
			DbDatabase:        dbConfig.Database,
			DbPassword:        dbConfig.Password,
			ExternalId:        utils.Config.Db.Pooler.TenantId,
			ModeType:          utils.Config.Db.Pooler.PoolMode,
			DefaultMaxClients: utils.Config.Db.Pooler.MaxClientConn,
			DefaultPoolSize:   utils.Config.Db.Pooler.DefaultPoolSize,
		}); err != nil {
			return errors.Errorf("failed to exec template: %w", err)
		}
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Db.Pooler.Image,
				Env: []string{
					"PORT=4000",
					fmt.Sprintf("PROXY_PORT_SESSION=%d", portSession),
					fmt.Sprintf("PROXY_PORT_TRANSACTION=%d", portTransaction),
					fmt.Sprintf("DATABASE_URL=ecto://%s:%s@%s:%d/%s", dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, "_supabase"),
					"CLUSTER_POSTGRES=true",
					"SECRET_KEY_BASE=" + utils.Config.Db.Pooler.SecretKeyBase,
					"VAULT_ENC_KEY=" + utils.Config.Db.Pooler.EncryptionKey,
					"API_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
					"METRICS_JWT_SECRET=" + utils.Config.Auth.JwtSecret,
					"REGION=local",
					"RUN_JANITOR=true",
					"ERL_AFLAGS=-proto_dist inet_tcp",
				},
				Cmd: []string{
					"/bin/sh", "-c",
					fmt.Sprintf("/app/bin/migrate && /app/bin/supavisor eval '%s' && /app/bin/server", poolerTenantBuf.String()),
				},
				ExposedPorts: nat.PortSet{
					"4000/tcp": {},
					nat.Port(fmt.Sprintf("%d/tcp", portSession)):     {},
					nat.Port(fmt.Sprintf("%d/tcp", portTransaction)): {},
				},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "curl", "-sSfL", "--head", "-o", "/dev/null", "http://127.0.0.1:4000/api/health"},
					Interval: 10 * time.Second,
					Timeout:  2 * time.Second,
					Retries:  3,
				},
			},
			container.HostConfig{
				PortBindings: nat.PortMap{nat.Port(fmt.Sprintf("%d/tcp", dockerPort)): []nat.PortBinding{{
					HostPort: strconv.FormatUint(uint64(utils.Config.Db.Pooler.Port), 10)},
				}},
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.PoolerAliases,
					},
				},
			},
			utils.PoolerId,
		); err != nil {
			return err
		}
		started = append(started, utils.PoolerId)
	}

	// Start Redis if not already started
	if utils.Config.Redis.Enabled && !isContainerExcluded(utils.Config.Redis.Image, excluded) {
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Redis.Image,
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "redis-cli", "ping"},
					Interval: 10 * time.Second,
					Timeout:  5 * time.Second,
					Retries:  5,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.RedisAliases,
					},
				},
			},
			utils.RedisId,
		); err != nil {
			return err
		}
		started = append(started, utils.RedisId)
	}

	// Start Speckle Server
	if utils.Config.Speckle.Server.Enabled {
		env := []string{
			"CANONICAL_URL=" + utils.Config.Speckle.CanonicalUrl,
			"SESSION_SECRET=" + utils.Config.Speckle.SessionSecret,
			"STRATEGY_LOCAL=" + strconv.FormatBool(utils.Config.Speckle.Server.StrategyLocal),
			"LOG_LEVEL=" + utils.Config.Speckle.LogLevel,

			fmt.Sprintf("POSTGRES_URL=postgresql://%s:%s@%s:%d/%s",
				dbConfig.User,
				dbConfig.Password,
				dbConfig.Host,
				dbConfig.Port,
				dbConfig.Database),
			
			// // Postgres settings
			// "POSTGRES_HOST=" + utils.Config.Speckle.Server.PostgresHost,
			// "POSTGRES_PORT=" + strconv.FormatUint(uint64(utils.Config.Speckle.Server.PostgresPort), 10),
			// "POSTGRES_USER=" + utils.Config.Speckle.Server.PostgresUser,
			// "POSTGRES_PASSWORD=" + utils.Config.Speckle.Server.PostgresPassword,
			// "POSTGRES_DB=" + utils.Config.Speckle.Server.PostgresDb,

			// // Alternative: use connection string
			// "PG_CONNECTION_STRING=postgres://" + utils.Config.Speckle.Server.PostgresUser + ":" + 
            // utils.Config.Speckle.Server.PostgresPassword + "@" + 
            // utils.Config.Speckle.Server.PostgresHost + ":" + 
            // strconv.FormatUint(uint64(utils.Config.Speckle.Server.PostgresPort), 10) + "/" + 
            // utils.Config.Speckle.Server.PostgresDb,
			
			// Redis settings
			"REDIS_URL=" + utils.Config.Speckle.Server.RedisUrl,
			
			// S3 settings
			"S3_ENDPOINT=" + utils.Config.Speckle.Server.S3Endpoint,
			"S3_ACCESS_KEY=" + utils.Config.Speckle.Server.S3AccessKey,
			"S3_SECRET_KEY=" + utils.Config.Speckle.Server.S3SecretKey,
			"S3_BUCKET=" + utils.Config.Speckle.Server.S3Bucket,
			"S3_CREATE_BUCKET=" + strconv.FormatBool(utils.Config.Speckle.Server.S3CreateBucket),
			"S3_REGION=" + utils.Config.Speckle.Server.S3Region,
			"FILE_SIZE_LIMIT_MB=" + strconv.Itoa(utils.Config.Speckle.Server.FileSizeLimitMb),
			
			// Email settings
			"EMAIL=" + strconv.FormatBool(utils.Config.Speckle.Server.Email),
			"EMAIL_HOST=" + utils.Config.Speckle.Server.EmailHost,
			"EMAIL_FROM=" + utils.Config.Speckle.Server.EmailFrom,
			"EMAIL_PORT=" + strconv.FormatUint(uint64(utils.Config.Speckle.Server.EmailPort), 10),
			
			// Frontend settings
			"USE_FRONTEND_2=" + strconv.FormatBool(utils.Config.Speckle.Server.UseFrontend2),
			"FRONTEND_ORIGIN=" + utils.Config.Speckle.Server.FrontendOrigin,
			"ONBOARDING_STREAM_URL=" + utils.Config.Speckle.Server.OnboardingStreamUrl,
			"ONBOARDING_STREAM_CACHE_BUST_NUMBER=" + strconv.Itoa(utils.Config.Speckle.Server.OnboardingStreamCacheBustNumber),
			"ENABLE_FE2_MESSAGING=" + strconv.FormatBool(utils.Config.Speckle.Server.EnableFe2Messaging),
			
			// Notifications
			"DISABLE_NOTIFICATIONS_CONSUMPTION=" + strconv.FormatBool(utils.Config.Speckle.Server.DisableNotificationsConsumption),
			
			// File upload settings
			"DISABLE_FILE_UPLOADS=" + strconv.FormatBool(utils.Config.Speckle.Server.DisableFileUploads),
		}
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Speckle.Server.Image,
				Env:   env,
				ExposedPorts: nat.PortSet{"3000/tcp": {}},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "curl", "-f", "http://127.0.0.1:3000/health"},
					Interval: 10 * time.Second,
					Timeout:  5 * time.Second,
					Retries:  5,
					StartPeriod: 30 * time.Second,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
				PortBindings: nat.PortMap{
					"3000/tcp": []nat.PortBinding{{HostPort: "54330"}},
				},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: []string{"speckle-server"},
					},
				},
			},
			utils.SpeckleServerId,
		); err != nil {
			return err
		}
		started = append(started, utils.SpeckleServerId)
	}

	// Start Speckle Frontend
	if utils.Config.Speckle.Frontend.Enabled {
		env := []string{
			"NUXT_PUBLIC_SERVER_NAME=" + utils.Config.Speckle.Frontend.ServerName,
			"NUXT_PUBLIC_API_ORIGIN=" + utils.Config.Speckle.Frontend.ApiOrigin,
			"NUXT_PUBLIC_BASE_URL=" + utils.Config.Speckle.Frontend.BaseUrl,
			"NUXT_PUBLIC_BACKEND_API_ORIGIN=" + utils.Config.Speckle.Frontend.BackendApiOrigin,
			"NUXT_PUBLIC_LOG_LEVEL=" + utils.Config.Speckle.Frontend.LogLevel,
			"NUXT_REDIS_URL=" + utils.Config.Speckle.Frontend.RedisUrl,
			"LOG_LEVEL=" + utils.Config.Speckle.LogLevel,
			"USE_FRONTEND_2=" + strconv.FormatBool(utils.Config.Speckle.Frontend.UseFrontend2),
			"NODE_ENV=production",
			"HOST=0.0.0.0",
        	"PORT=8080",
		}
		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.Speckle.Frontend.Image,
				Env:   env,
				ExposedPorts: nat.PortSet{
					"8080/tcp": {},
				},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "curl", "-f", "http://127.0.0.1:8080/health"},
					Interval: 10 * time.Second,
					Timeout:  5 * time.Second,
					Retries:  5,
					StartPeriod: 30 * time.Second,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
				PortBindings: nat.PortMap{
					"8080/tcp": []nat.PortBinding{{
						HostIP: "0.0.0.0",
						HostPort: strconv.Itoa(int(utils.Config.Speckle.FrontendPort)),
					}},
				},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.SpeckleFrontendAliases,
					},
				},
			},
			utils.SpeckleFrontendId,
		); err != nil {
			return err
		}
		started = append(started, utils.SpeckleFrontendId)
	}

	// Start n8n
	if utils.Config.N8n.Enabled && !isContainerExcluded(utils.Config.N8n.Image, excluded) {
		// Start main n8n node
		mainEnv := []string{
			// Queue configuration
			"N8N_MODE=queue",
			"QUEUE_BULL_REDIS_HOST=" + utils.RedisId,
			"QUEUE_BULL_REDIS_PORT=6379",

			// Database Configuration
			"DB_TYPE=postgresdb",
			"DB_POSTGRESDB_HOST=" + dbConfig.Host,
			"DB_POSTGRESDB_PORT=" + strconv.FormatUint(uint64(dbConfig.Port), 10),
			"DB_POSTGRESDB_DATABASE=" + dbConfig.Database,
			"DB_POSTGRESDB_USER=" + dbConfig.User,
			"DB_POSTGRESDB_PASSWORD=" + dbConfig.Password,
			"DB_POSTGRESDB_SCHEMA=n8n",
			
			// Security & Authentication
			"N8N_API_KEY=1234567890",// + utils.Config.N8n.ApiKey,
			// "N8N_ENCRYPTION_KEY=" + utils.Config.N8n.EncryptionKey,
			
			// API Access Configuration
			"N8N_PUBLIC_API_ENABLED=true",
			"N8N_PUBLIC_API_DISABLED=false",
			"N8N_BASIC_AUTH_ACTIVE=false",
			"N8N_USER_MANAGEMENT_DISABLED=false",
			
			// Host Configuration
			"N8N_HOST=0.0.0.0",
			fmt.Sprintf("N8N_PORT=%d", utils.Config.N8n.Port),
			fmt.Sprintf("N8N_WEBHOOK_URL=http://localhost:%d", utils.Config.N8n.Port),
			"N8N_PROTOCOL=http",
			
			// SMTP Configuration
			"N8N_EMAIL_MODE=smtp",
			"N8N_SMTP_HOST=" + utils.Config.N8n.SmtpHost,
			fmt.Sprintf("N8N_SMTP_PORT=%d", utils.Config.N8n.SmtpPort),
			"N8N_SMTP_USER=" + utils.Config.N8n.SmtpUser,
			"N8N_SMTP_PASS=" + utils.Config.N8n.SmtpPass,
			"N8N_SMTP_SENDER=" + utils.Config.N8n.SmtpSender,
			"N8N_SMTP_SSL=true",
			"N8N_SMTP_IGNORE_TLS=false",
		}

		if _, err := utils.DockerStart(
			ctx,
			container.Config{
				Image: utils.Config.N8n.Image,
				Env:   mainEnv,
				ExposedPorts: nat.PortSet{"5678/tcp": {}},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "wget", "--spider", "--quiet", "http://127.0.0.1:5678/api/v1/docs"},
					Interval: 10 * time.Second,
					Timeout:  5 * time.Second,
					Retries:  5,
					StartPeriod: 30 * time.Second,
				},
			},
			container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "always"},
				PortBindings: nat.PortMap{
					"5678/tcp": []nat.PortBinding{{HostPort: strconv.FormatUint(uint64(utils.Config.N8n.Port), 10)}},
				},
				Binds: []string{
					utils.Config.N8n.Volume + ":/home/node/.n8n:Z",
				},
			},
			network.NetworkingConfig{
				EndpointsConfig: map[string]*network.EndpointSettings{
					utils.NetId: {
						Aliases: utils.N8nAliases,
					},
				},
			},
			utils.N8nId,
		); err != nil {
			return err
		}
		started = append(started, utils.N8nId)
		fmt.Println("n8n container is waiting for health check...")

		// Check container status directly
		cli, err := client.NewClientWithOpts(client.FromEnv)
		if err != nil {
			fmt.Printf("Failed to create Docker client: %v\n", err)
			return err
		}

		maxAttempts := 30
		for i := 0; i < maxAttempts; i++ {
			container, err := cli.ContainerInspect(ctx, utils.N8nId)
			if err != nil {
				fmt.Printf("Failed to inspect container: %v\n", err)
				time.Sleep(2 * time.Second)
				continue
			}

			fmt.Printf("Container status: %s, Health: %s\n", container.State.Status, container.State.Health.Status)
			
			if container.State.Status == "running" {
				if container.State.Health.Status == "healthy" || container.State.Health.Status == "none" {
					fmt.Println("Container is running and healthy, proceeding with setup...")
					break
				}
				if container.State.Health.Status == "unhealthy" {
					fmt.Printf("Last health check: %s\n", container.State.Health.Log[len(container.State.Health.Log)-1].Output)
				}
			}

			if i == maxAttempts-1 {
				return fmt.Errorf("container failed to become healthy after %d attempts", maxAttempts)
			}

			fmt.Printf("Waiting for container to be ready (attempt %d/%d)...\n", i+1, maxAttempts)
			time.Sleep(2 * time.Second)
		}

		fmt.Println("Container is ready, waiting additional 10 seconds for full initialization...")
		p.Send(utils.StatusMsg("Waiting 10 seconds for n8n to fully initialize migrations..."))
		
		time.Sleep(10 * time.Second)

		fmt.Println("Checking n8n owner status...")
		p.Send(utils.StatusMsg("Checking if n8n owner is already setup..."))

		// Check owner status first
		checkUrl := fmt.Sprintf("http://localhost:%d/api/v1/owner", utils.Config.N8n.Port)
		checkResp, err := http.Get(checkUrl)
		if err != nil {
			fmt.Printf("Failed to check owner status: %v\n", err)
			return errors.Errorf("failed to check owner status: %w", err)
		}
		defer checkResp.Body.Close()

		// If we get a 200, owner is already set up
		if checkResp.StatusCode == http.StatusOK {
			fmt.Println("n8n owner already configured, skipping setup")
			p.Send(utils.StatusMsg("n8n owner already configured, skipping setup"))
			return nil
		}

		// If we get here, we need to create the owner
		fmt.Println("Starting n8n owner user setup...")
		p.Send(utils.StatusMsg("Attempting to create n8n owner user..."))

		// Create owner user
		n8nUrl := fmt.Sprintf("http://localhost:%d/rest/owner/setup", utils.Config.N8n.Port)
		fmt.Printf("Sending setup request to: %s\n", n8nUrl)
		payload := strings.NewReader(`{
			"email": "admin@digitaltwincityviewer.com",
			"firstName": "ADMIN",
			"lastName": "USER",
			"password": "Very_secret_password_1234567890"
		}`)

		req, err := http.NewRequestWithContext(ctx, "POST", n8nUrl, payload)
		if err != nil {
			fmt.Printf("Failed to create request: %v\n", err)
			p.Send(utils.StatusMsg(fmt.Sprintf("Failed to create request: %v", err)))
			return errors.Errorf("failed to create request: %w", err)
		}

		// Set required headers
		req.Header.Add("Content-Type", "application/json")

		fmt.Printf("Sending request to %s\n", n8nUrl)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			fmt.Printf("Request failed: %v\n", err)
			p.Send(utils.StatusMsg(fmt.Sprintf("Request failed: %v", err)))
			return err
		}

		if resp.StatusCode == http.StatusOK {
			fmt.Println("Owner setup successful, getting auth cookie...")
			// Get auth cookie for survey submission
			authCookie := resp.Header.Get("Set-Cookie")
			if authCookie == "" {
				resp.Body.Close()
				fmt.Println("Failed to get authentication token")
				p.Send(utils.StatusMsg("Failed to get authentication token"))
				return errors.New("failed to get n8n authentication token")
			}

			fmt.Println("Submitting setup survey...")
			p.Send(utils.StatusMsg("Submitting setup survey..."))
			// Submit survey to complete setup - using localhost instead of container name
			surveyUrl := fmt.Sprintf("http://localhost:%d/rest/me/survey", utils.Config.N8n.Port)
			surveyPayload := strings.NewReader(`{
				"personalizationAnswers": {
					"codingSkill": "none",
					"companySize": "none",
					"companyRole": "none",
					"nodeTypes": [],
					"automationGoal": "",
					"otherGoals": []
				},
				"version": "v4",
				"personalization_survey_submitted_at": "` + time.Now().Format(time.RFC3339) + `",
				"personalization_survey_n8n_version": "1.0.0"
			}`)

			surveyReq, err := http.NewRequestWithContext(ctx, "POST", surveyUrl, surveyPayload)
			if err != nil {
				resp.Body.Close()
				fmt.Printf("Failed to create survey request: %v\n", err)
				p.Send(utils.StatusMsg(fmt.Sprintf("Failed to create survey request: %v", err)))
				return errors.Errorf("failed to create survey request: %w", err)
			}

			surveyReq.Header.Add("Content-Type", "application/json")
			surveyReq.Header.Add("Cookie", authCookie)

			fmt.Printf("Sending survey request to: %s\n", surveyUrl)
			surveyResp, err := http.DefaultClient.Do(surveyReq)
			if err != nil {
				resp.Body.Close()
				fmt.Printf("Failed to submit survey: %v\n", err)
				p.Send(utils.StatusMsg(fmt.Sprintf("Failed to submit survey: %v", err)))
				return errors.Errorf("failed to submit n8n survey: %w", err)
			}

			if surveyResp.StatusCode != http.StatusOK {
				body, _ := io.ReadAll(surveyResp.Body)
				surveyResp.Body.Close()
				resp.Body.Close()
				fmt.Printf("Survey submission failed with status %d: %s\n", surveyResp.StatusCode, string(body))
				p.Send(utils.StatusMsg(fmt.Sprintf("Survey submission failed with status %d: %s", surveyResp.StatusCode, string(body))))
				return errors.Errorf("failed to complete n8n setup: %s", string(body))
			}

			fmt.Println("n8n setup completed successfully!")
			p.Send(utils.StatusMsg("n8n setup completed successfully!"))
			surveyResp.Body.Close()
			resp.Body.Close()
		} else {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			fmt.Printf("Setup failed with status %d: %s\n", resp.StatusCode, string(body))
			return errors.Errorf("failed to create n8n owner user: %s", string(body))
		}
	}

	p.Send(utils.StatusMsg("Waiting for health checks..."))
	if utils.NoBackupVolume && utils.SliceContains(started, utils.StorageId) {
		if err := start.WaitForHealthyService(ctx, serviceTimeout, utils.StorageId); err != nil {
			return err
		}
		// Disable prompts when seeding
		if err := buckets.Run(ctx, "", false, fsys); err != nil {
			return err
		}
	}
	return start.WaitForHealthyService(ctx, serviceTimeout, started...)
}

func isContainerExcluded(imageName string, excluded map[string]bool) bool {
	short := utils.ShortContainerImageName(imageName)
	val, ok := excluded[short]
	return ok && val
}

func ExcludableContainers() []string {
	return []string{
		utils.Config.Api.KongImage,
		utils.Config.Auth.Image,
		utils.Config.Inbucket.Image,
		utils.Config.Realtime.Image,
		utils.Config.Api.Image,
		utils.Config.Storage.Image,
		utils.Config.Storage.ImageTransformation.Image,
		utils.Config.EdgeRuntime.Image,
		utils.Config.Studio.PgmetaImage,
		utils.Config.Studio.Image,
		utils.Config.Analytics.Image,
		utils.Config.Analytics.VectorImage,
		utils.Config.Redis.Image,
		utils.Config.Speckle.Server.Image,
		utils.Config.Speckle.Frontend.Image,
		utils.Config.N8n.Image,
	}
}

func formatMapForEnvConfig(input map[string]string, output *bytes.Buffer) {
	numOfKeyPairs := len(input)
	i := 0
	for k, v := range input {
		output.WriteString(k)
		output.WriteString(":")
		output.WriteString(v)
		i++
		if i < numOfKeyPairs {
			output.WriteString(",")
		}
	}
}
