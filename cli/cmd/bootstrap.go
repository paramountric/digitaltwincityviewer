package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"path/filepath"

	"github.com/spf13/afero"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/supabase/cli/internal/bootstrap"
	_init "github.com/supabase/cli/internal/init"
	"github.com/supabase/cli/internal/utils"
)

var (
	starter = bootstrap.StarterTemplate{
		Name:        "dtcv-template",
		Description: "Digital Twin City Viewer template.",
		Start:       "npm run dev",
	}

	bootstrapCmd = &cobra.Command{
		GroupID: groupLocalDev,
		Use:     "bootstrap [template]",
		Short:   "Bootstrap a project from the DTCV template",
		Args:    cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, _ := signal.NotifyContext(cmd.Context(), os.Interrupt)
			if !viper.IsSet("WORKDIR") {
				title := fmt.Sprintf("Enter a directory to bootstrap your project (or leave blank to use %s): ", utils.Bold(utils.CurrentDirAbs))
				if workdir, err := utils.NewConsole().PromptText(ctx, title); err != nil {
					return err
				} else {
					viper.Set("WORKDIR", workdir)
				}
			}

			// Get template directory
			exe, err := os.Executable()
			if err != nil {
				return err
			}
			binDir := filepath.Dir(exe)
			templatePath := filepath.Join(binDir, "..", "..", "apps", "nextjs-slack-clone")
			fmt.Printf("Using template from: %s\n", templatePath)

			// Verify template directory exists
			if _, err := os.Stat(templatePath); os.IsNotExist(err) {
				return fmt.Errorf("template directory not found at: %s", templatePath)
			}
			starter.Url = templatePath

			// Skip init if template exists
			initParams.Overwrite = true
			if err := _init.Run(ctx, afero.NewOsFs(), nil, nil, initParams); err != nil {
				return err
			}

			return bootstrap.Run(ctx, starter, afero.NewOsFs())
		},
	}
)

func init() {
	bootstrapFlags := bootstrapCmd.Flags()
	bootstrapFlags.StringVarP(&dbPassword, "password", "p", "", "Password to your local Postgres database.")
	cobra.CheckErr(viper.BindPFlag("DB_PASSWORD", bootstrapFlags.Lookup("password")))
	rootCmd.AddCommand(bootstrapCmd)
}
