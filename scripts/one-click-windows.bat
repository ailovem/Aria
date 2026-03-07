@echo off
setlocal

set SCRIPT_DIR=%~dp0

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%one-click-windows.ps1"

echo.
echo Done. Press any key to close.
pause >nul
