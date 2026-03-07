Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

function Write-Ok {
  param([string]$Name, [string]$Details)
  Write-Host "[ok]   $Name: $Details"
}

function Write-Fail {
  param([string]$Name, [string]$Details)
  Write-Host "[fail] $Name: $Details"
}

$script:Passed = 0
$script:Failed = 0

function Test-Command {
  param([string]$Name, [string]$Command, [string]$VersionArgs = "--version")

  $cmd = Get-Command $Command -ErrorAction SilentlyContinue
  if ($null -eq $cmd) {
    Write-Fail $Name "missing ($Command)"
    $script:Failed++
    return
  }

  $version = ""
  try {
    $version = (& $Command $VersionArgs 2>$null | Select-Object -First 1)
  } catch {
    $version = "found"
  }

  if ([string]::IsNullOrWhiteSpace($version)) {
    $version = "found"
  }

  Write-Ok $Name $version
  $script:Passed++
}

Write-Host "== Aria Windows doctor =="

Test-Command -Name "winget" -Command "winget" -VersionArgs "--version"
Test-Command -Name "Git" -Command "git"
Test-Command -Name "Node.js" -Command "node"
Test-Command -Name "pnpm" -Command "pnpm"
Test-Command -Name "Rust" -Command "rustc"
Test-Command -Name "Cargo" -Command "cargo"
Test-Command -Name "Tauri CLI" -Command "tauri" -VersionArgs "--version"
Test-Command -Name "Flutter" -Command "flutter"

Write-Host ""
Write-Host "Passed: $script:Passed"
Write-Host "Failed: $script:Failed"

if ($script:Failed -gt 0) {
  Write-Host "Some dependencies are missing. Run setup-windows.ps1 as Administrator."
  exit 1
}

Write-Host "Environment looks good."
