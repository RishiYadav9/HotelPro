@echo off
title HotelPro Frontend Dev Server
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"
echo Starting Frontend Vite Dev Server on http://localhost:5173...
call npm.cmd run dev
pause
