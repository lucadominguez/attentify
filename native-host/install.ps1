# Attentify — Native Messaging Host Installer (Windows)
# Optional — only needed if you prefer native messaging over HTTP polling.
# Run after installing the Chrome extension.
#
# Prefers the bundled native-host.exe (no Node.js required). If the exe is
# absent, falls back to launching native-host.js via Node.js in PATH (dev mode).
# Build the exe with: .\build-exe.ps1
#
# Usage: .\install.ps1 -ExtensionId "abcdefghijklmnopabcdefghijklmnop"

param(
  [Parameter(Mandatory=$true)]
  [string]$ExtensionId
)

$ErrorActionPreference = 'Stop'

$HostName    = "com.attentify.blocker"
$ExePath     = Join-Path $PSScriptRoot "native-host.exe"
$ManifestDir = Join-Path $env:APPDATA "Attentify"
$ManifestPath = Join-Path $ManifestDir "native-host.json"

# Create app data dir
New-Item -ItemType Directory -Force $ManifestDir | Out-Null

if (Test-Path $ExePath) {
  # Standalone exe — Chrome launches it directly, no Node.js needed.
  $LauncherPath = $ExePath
  Write-Host "Using bundled native-host.exe (no Node.js required)."
} else {
  # Dev fallback: launch the .js via Node through a .bat shim
  # (Chrome requires an .exe or .bat as the host path on Windows).
  $NodeExe = (Get-Command node -ErrorAction SilentlyContinue)
  if (-not $NodeExe) {
    Write-Error "native-host.exe not found and Node.js not in PATH. Run .\build-exe.ps1 or install Node.js: https://nodejs.org"
    exit 1
  }
  $NodePath    = $NodeExe.Source
  $HostScript  = Join-Path $PSScriptRoot "native-host.js"
  $LauncherPath = Join-Path $ManifestDir "native-host-launcher.bat"
  "@echo off`r`n""$NodePath"" ""$HostScript"" %*" | Out-File -FilePath $LauncherPath -Encoding ascii
  Write-Host "native-host.exe not found — using Node.js fallback ($NodePath)."
}

# Write native messaging manifest
$manifest = [ordered]@{
  name        = $HostName
  description = "Attentify Native Messaging Host"
  path        = $LauncherPath
  type        = "stdio"
  allowed_origins = @("chrome-extension://$ExtensionId/")
} | ConvertTo-Json -Depth 5

$manifest | Out-File -FilePath $ManifestPath -Encoding utf8

# Register for Chrome
$chromePath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName"
New-Item -Force -Path $chromePath | Out-Null
Set-ItemProperty -Path $chromePath -Name "(Default)" -Value $ManifestPath

# Register for Edge (Chromium)
$edgePath = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts\$HostName"
New-Item -Force -Path $edgePath | Out-Null
Set-ItemProperty -Path $edgePath -Name "(Default)" -Value $ManifestPath

Write-Host ""
Write-Host "Native Messaging Host installed successfully!" -ForegroundColor Green
Write-Host "  Host:        $HostName"
Write-Host "  Manifest:    $ManifestPath"
Write-Host "  Launcher:    $LauncherPath"
Write-Host "  Extension:   $ExtensionId"
Write-Host ""
Write-Host "Restart Chrome/Edge for the registration to take effect."
