@echo off
title USDT KG P2P Platform Launcher
color 0A
echo ===================================================
echo     Starting USDT Kyrgyzstan P2P Platform
echo ===================================================

set NODE_PATH=c:\Users\User\Desktop\P2P\.tools\node-v20.17.0-win-x64
set PATH=%NODE_PATH%;%PATH%

echo [1/2] Launching Backend API (FastAPI) on port 8000...
start "KG USDT Backend API" /min cmd /c "cd /d c:\Users\User\Desktop\P2P\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend (Next.js 14) on port 3000...
start "KG USDT Frontend Web" /min cmd /c "cd /d c:\Users\User\Desktop\P2P\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo   Platform is RUNNING!
echo   Main Website:    http://localhost:3000
echo   Admin Panel:     http://localhost:3000/admin
echo   Backend API:     http://127.0.0.1:8000/docs
echo ===================================================
echo.
pause
