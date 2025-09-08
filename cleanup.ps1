Write-Host "Cleaning up Vallmere deployment..." -ForegroundColor Red

Write-Host "Deleting all resources..." -ForegroundColor Yellow
kubectl delete namespace vallmere

Write-Host "Cleaning up persistent volumes..." -ForegroundColor Yellow
kubectl delete pv postgres-pv --ignore-not-found=true

Write-Host "Cleanup complete!" -ForegroundColor Green 