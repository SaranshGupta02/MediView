# start_servers.ps1

Write-Host "Starting MediView Services..." -ForegroundColor Cyan

# 1. Node.js Backend (port 4000)
Write-Host "1. Starting Node.js Backend on Port 4000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\mediview\backend'; npm run server`""

# 2. Python AI Server (port 5000) — uses the Python 3.12 venv
Write-Host "2. Starting Python AI Server on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\ai-model\VideoAudio'; .\venv\Scripts\Activate.ps1; cd backend; python server.py`""

# 3. React Frontend (port 5173)
Write-Host "3. Starting Unified React Frontend on Port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\mediview\frontend'; npm run dev`""

Write-Host "All 3 services launched in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend  ->  http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend   ->  http://localhost:4000" -ForegroundColor Cyan
Write-Host "  AI Server ->  http://localhost:5000" -ForegroundColor Cyan
