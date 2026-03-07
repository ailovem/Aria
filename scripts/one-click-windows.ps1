Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "[one-click-windows] Step 1/2: setup"
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot/setup-windows.ps1"

Write-Host "[one-click-windows] Step 2/2: doctor"
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot/doctor-windows.ps1"

Write-Host "[one-click-windows] Complete."
