# Productivity Daemon — Native Messaging Host Installer (Windows)
# Optional — only needed if you prefer native messaging over HTTP polling.
# Run after installing the Chrome extension. Requires Node.js in PATH.
#
# Usage: .\install.ps1 -ExtensionId "abcdefghijklmnopabcdefghijklmnop"

param(
  [Parameter(Mandatory=$true)]
  [string]$ExtensionId
)

$ErrorActionPreference = 'Stop'

$NodeExe = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $NodeExe) {
  Write-Error "Node.js not found in PATH. Install Node.js first: https://nodejs.org"
  exit 1
}
$NodePath = $NodeExe.Source

$HostName    = "com.productivitydaemon.blocker"
$HostScript  = Join-Path $PSScriptRoot "native-host.js"
$ManifestDir = Join-Path $env:APPDATA "ProductivityDaemon"
$ManifestPath = Join-Path $ManifestDir "native-host.json"
$LauncherPath = Join-Path $ManifestDir "native-host-launcher.bat"

# Create app data dir
New-Item -ItemType Directory -Force $ManifestDir | Out-Null

# Write a .bat launcher (Chrome requires .exe or .bat on Windows)
"@echo off`r`n""$NodePath"" ""$HostScript"" %*" | Out-File -FilePath $LauncherPath -Encoding ascii

# Write native messaging manifest
$manifest = [ordered]@{
  name        = $HostName
  description = "Productivity Daemon Native Messaging Host"
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
