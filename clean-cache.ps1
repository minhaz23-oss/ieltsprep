# Clean Next.js cache script
# Run this if you get ENOENT errors or internal server errors

Write-Host "🧹 Cleaning Next.js cache..." -ForegroundColor Cyan

# Stop all node processes
Write-Host "1️⃣ Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Delete .next folder
Write-Host "2️⃣ Deleting .next folder..." -ForegroundColor Yellow
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue

# Clear node_modules cache
Write-Host "3️⃣ Clearing node_modules cache..." -ForegroundColor Yellow
Remove-Item -Path ".\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Cache cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
