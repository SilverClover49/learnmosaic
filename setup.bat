@echo off
title LearnMosaic Setup
echo.
echo ========================================
echo    LearnMosaic - First Time Setup
echo ========================================
echo.

cd /d "%~dp0"

:: Check Node.js
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo    Node.js %NODE_VER% found!

:: Check npm
echo [2/6] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)
echo    npm OK!

:: Install root dependencies
echo [3/6] Installing root dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)
echo    Root dependencies installed!

:: Install client dependencies
echo [4/6] Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)
cd ..
echo    Client dependencies installed!

:: Install server dependencies
echo [5/6] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)
cd ..
echo    Server dependencies installed!

:: Setup .env
echo [6/6] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo    Created .env from template
    echo    IMPORTANT: Edit .env and add your OPENROUTER_API_KEY
) else (
    echo    .env already exists
)

:: Setup PocketBase
echo.
echo Setting up PocketBase...
if not exist server\pb_data mkdir server\pb_data
if exist server\setup-pb.js (
    cd server
    node setup-pb.js
    cd ..
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env and add your OPENROUTER_API_KEY
echo 2. Run start.bat to launch the app
echo.
echo Ports:
echo    PocketBase: http://localhost:8090/_
echo    Server:     http://localhost:3001
echo    Client:     http://localhost:5173
echo.
pause
