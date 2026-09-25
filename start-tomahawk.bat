@echo off
title Udonarium Tomahawk Server

cd /d "%~dp0"

echo ========================================
echo   Udonarium Tomahawk
echo ========================================
echo.
echo Starting server...
echo.

start "" "http://localhost:12081"

node unified-server.js

echo.
echo Server stopped.
pause