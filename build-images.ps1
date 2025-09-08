Write-Host "Building Docker images for Minikube..." -ForegroundColor Green

Write-Host "Setting Minikube Docker environment..." -ForegroundColor Yellow
& minikube docker-env --shell powershell | Invoke-Expression

Write-Host "Building backend image..." -ForegroundColor Yellow
Set-Location backend
if (!(docker build -t vallmere-backend:latest .)) {
    Write-Host "ERROR: Backend image build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "Building frontend image..." -ForegroundColor Yellow
Set-Location frontend
if (!(docker build -t vallmere-frontend:latest .)) {
    Write-Host "ERROR: Frontend image build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "Docker images built successfully!" -ForegroundColor Green

Write-Host "Verifying images..." -ForegroundColor Yellow
docker images | Select-String "vallmere"

Write-Host "Build complete! You can now deploy to Minikube." -ForegroundColor Green 