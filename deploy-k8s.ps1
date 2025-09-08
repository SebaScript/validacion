Write-Host "Deploying Vallmere application to Minikube..." -ForegroundColor Green

Write-Host "Creating namespace..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml

Write-Host "Applying secrets and configmaps..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/backend-configmap.yaml

Write-Host "Creating persistent volumes..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-pv.yaml

Write-Host "Deploying PostgreSQL..." -ForegroundColor Yellow
kubectl apply -f k8s/postgres-deployment.yaml

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=postgres -n vallmere --timeout=300s

Write-Host "Deploying Backend..." -ForegroundColor Yellow
kubectl apply -f k8s/backend-deployment.yaml

Write-Host "Waiting for Backend to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=backend -n vallmere --timeout=300s

Write-Host "Deploying Frontend..." -ForegroundColor Yellow
kubectl apply -f k8s/frontend-deployment.yaml

Write-Host "Waiting for Frontend to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=frontend -n vallmere --timeout=300s

Write-Host "Getting service information..." -ForegroundColor Yellow
kubectl get services -n vallmere

Write-Host "Getting frontend URL..." -ForegroundColor Green
$frontendUrl = minikube service frontend-service -n vallmere --url
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Green

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Access your application at: $frontendUrl" -ForegroundColor Cyan 