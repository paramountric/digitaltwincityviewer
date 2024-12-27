# Create namespaces using kubectl
local('kubectl create namespace dtcv-development --dry-run=client -o yaml | kubectl apply -f -')
local('kubectl create namespace supabase-development --dry-run=client -o yaml | kubectl apply -f -')

# Disable secret scrubbing
secret_settings(disable_scrub=True)

# Apply secrets first
k8s_yaml('./helm/supabase/secrets.local.yaml')

# Then apply Helm chart
helm_values_supabase = ['./helm/supabase/values.yaml']
helm_values = read_yaml('helm/supabase/values.yaml')
helm_values['meta']['image']['repository'] = 'supabase/postgres-meta'
helm_values['meta']['image']['tag'] = 'v0.68.0'

k8s_yaml(helm(
    './helm/supabase',
    name='supabase',
    namespace='supabase-development',
    values=helm_values_supabase,
    set=[
        'meta.image.repository=supabase/postgres-meta',
        'meta.image.tag=v0.68.0'
    ]
))

# Set up resource dependencies
k8s_resource('supabase-supabase-meta', resource_deps=['supabase-supabase-db'])

# Apply DTCV secrets and deploy components
if os.path.exists('./helm/dtcv/secrets.local.yaml'):
    k8s_yaml('./helm/dtcv/secrets.local.yaml')

helm_values_dtcv = [
    './helm/dtcv/values.yaml',
    './helm/dtcv/values.local.yaml'
]

k8s_yaml(helm(
    './helm/dtcv',
    name='dtcv',
    values=helm_values_dtcv,
    namespace='dtcv-development'
))

# Build DTCV docker image
docker_build(
    'ghcr.io/paramountric/dtcv',
    '.',
    dockerfile='apps/dtcv/Dockerfile.dev',
    live_update=[
        sync('apps/dtcv', '/app/apps/dtcv'),
        sync('packages/viewport/src', '/app/packages/viewport/src')
    ]
)

# Configure port forwards for Supabase services
k8s_resource('supabase-supabase-auth', port_forwards=['9999:9999'])
k8s_resource('supabase-supabase-db', port_forwards=['5432:5432'])
k8s_resource('supabase-supabase-rest', port_forwards=['8000:8000'])
k8s_resource('supabase-supabase-storage', port_forwards=['5000:5000'])
k8s_resource('supabase-supabase-studio', port_forwards=['3000:3000'])
k8s_resource('supabase-supabase-meta', port_forwards=['8080:8080'])

# Configure port forward for DTCV app
k8s_resource('dtcv-app', port_forwards=['3001:3000'])