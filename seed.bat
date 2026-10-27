@echo off
title HotelPro Database Seeder
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0backend"
echo Seeding Demo Accounts and Hotel Rooms...
node seed.js
pause
