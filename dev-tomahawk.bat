@echo off
title Udonarium Tomahawk Development

cd /d "%~dp0"

echo ========================================
echo   Udonarium Tomahawk - Development
echo ========================================
echo.
echo Building Tomahawk...
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo ========================================
    echo   BUILD FAILED
    echo ========================================
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD SUCCESS
echo ========================================
echo.
echo Starting Tomahawk server...
echo.

start "" "http://localhost:12081"

node unified-server.js

echo.
echo Server stopped.
pause