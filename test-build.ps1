Write-Host "Testing Angular build locally..." -ForegroundColor Green

Set-Location frontend

if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Testing npm run build..." -ForegroundColor Yellow
npm run build -- --configuration=production

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Angular build successful!" -ForegroundColor Green
    Write-Host "Output directory:" -ForegroundColor Cyan
    Get-ChildItem "dist" -Recurse | Select-Object Name, Length | Format-Table
} else {
    Write-Host "❌ Angular build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}

Set-Location .. 