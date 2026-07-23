@echo off
cd /d "%~dp0"
echo Starting LearnMosaic...
start "LearnMosaic PocketBase" cmd /c "pocketbase\pocketbase.exe serve --http=127.0.0.1:8090"
timeout /t 2 /nobreak >nul
start "LearnMosaic Server" cmd /c "npm run dev:server"
timeout /t 2 /nobreak >nul
start "LearnMosaic Client" cmd /c "npm run dev:client"
echo.
echo LearnMosaic is running!
echo PocketBase: http://localhost:8090/_
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
echo Close all windows to stop, or run stop.bat
