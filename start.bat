@echo off
title LearnMosaic
cd /d "%~dp0"

echo.
echo ========================================
echo    LearnMosaic - Starting...
echo ========================================
echo.

:: Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

:: Start PocketBase
echo [1/3] Starting PocketBase...
start "PocketBase" cmd /c "pocketbase\pocketbase.exe serve --http=127.0.0.1:8090"
timeout /t 2 /nobreak >nul

:: Start Server
echo [2/3] Starting Server...
start "Server" cmd /c "npm run dev:server"
timeout /t 3 /nobreak >nul

:: Start Client
echo [3/3] Starting Client...
start "Client" cmd /c "npm run dev:client"

echo.
echo ========================================
echo    LearnMosaic is running!
echo ========================================
echo.
echo    PocketBase:  http://localhost:8090/_
echo    Server:      http://localhost:3001
echo    Client:      http://localhost:5174
echo.
echo    Close all windows to stop
echo    or run stop.bat
echo.
pause
