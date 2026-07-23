@echo off
echo Stopping LearnMosaic...
taskkill /fi "WindowTitle eq LearnMosaic Server*" /f >nul 2>&1
taskkill /fi "WindowTitle eq LearnMosaic Client*" /f >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo LearnMosaic stopped.
