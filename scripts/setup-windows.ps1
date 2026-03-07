Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Info {
  param([string]$Message)
  Write-Host "[setup-windows] $Message"
}

function Ensure-Winget {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "winget is required. Update App Installer from Microsoft Store first."
  }
}

function Install-PackageIfMissing {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [string]$OverrideArgs = ""
  )

  $installed = winget list --id $Id -e | Out-String
  if ($installed -match $Id) {
    Write-Info "$Id already installed."
    return
  }

  Write-Info "Installing $Id ..."
  if ([string]::IsNullOrWhiteSpace($OverrideArgs)) {
    winget install -e --id $Id --accept-source-agreements --accept-package-agreements
  } else {
    winget install -e --id $Id --accept-source-agreements --accept-package-agreements --override $OverrideArgs
  }
}

Ensure-Winget

Write-Info "Installing base toolchain..."
Install-PackageIfMissing -Id "Git.Git"
Install-PackageIfMissing -Id "OpenJS.NodeJS.LTS"
Install-PackageIfMissing -Id "Rustlang.Rustup"
Install-PackageIfMissing -Id "Microsoft.EdgeWebView2Runtime"
Install-PackageIfMissing -Id "Flutter.Flutter"

Write-Info "Installing Visual Studio Build Tools (C++ workload)..."
Install-PackageIfMissing -Id "Microsoft.VisualStudio.2022.BuildTools" -OverrideArgs "--quiet --wait --norestart --nocache --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"

Write-Info "Installing pnpm and Tauri CLI..."
npm install -g pnpm
cargo install tauri-cli --locked

Write-Info "Running flutter doctor (informational)..."
flutter doctor

Write-Info "Done. Next run:"
Write-Info "  powershell -ExecutionPolicy Bypass -File scripts/doctor-windows.ps1"
