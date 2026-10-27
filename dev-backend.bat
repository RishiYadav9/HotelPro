@echo off
title HotelPro Backend Server
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0backend"
echo Starting Backend API on http://localhost:5000...
node server.js
pause
