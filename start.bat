@echo off
title HotelPro Fullstack Platform
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

:: If port 5000 is occupied by a previous process, free it automatically
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo ========================================================
echo Starting HotelPro Fullstack Platform on http://localhost:5000
echo ========================================================
node backend/server.js
pause
