@echo off
setlocal enabledelayedexpansion
echo Stopping LearnMosaic...

for %%p in (8090 3001 5173) do (
  for /f "tokens=*" %%a in ('netstat -ano ^| findstr ":%%p "') do (
    for %%b in (%%a) do set "pid=%%b"
    if defined pid (
      taskkill /f /pid !pid! >nul 2>&1
      set "pid="
    )
  )
)

echo LearnMosaic stopped.
