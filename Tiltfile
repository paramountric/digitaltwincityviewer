# Create namespace using kubectl
local('kubectl create namespace dtcv-development --dry-run=client -o yaml | kubectl apply -f -')

# Apply local secrets if they exist
if os.path.exists('./helm/dtcv/secrets.local.yaml'):
    k8s_yaml('./helm/dtcv/secrets.local.yaml')

# Then load Helm chart
helm_values = [
    './helm/dtcv/values.yaml',
    './helm/dtcv/values.local.yaml'
]

k8s_yaml(helm(
    './helm/dtcv',
    name='dtcv',
    values=helm_values,
    namespace='dtcv-development'  # Specify namespace for Helm
))

# Build using development Dockerfile
docker_build(
    'ghcr.io/paramountric/dtcv',
    '.',
    dockerfile='apps/dtcv/Dockerfile.dev',
    live_update=[
        sync('apps/dtcv/src', '/app/apps/dtcv/src'),
        sync('apps/dtcv/public', '/app/apps/dtcv/public'),
        sync('packages/viewport/src', '/app/packages/viewport/src')
    ]
)
