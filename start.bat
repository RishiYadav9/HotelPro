@echo off
title HotelPro Fullstack Platform
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo ========================================================
echo Starting HotelPro Fullstack Platform on http://localhost:5000
echo ========================================================
node backend/server.js
pause
