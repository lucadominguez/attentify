# Build native-host.exe — a self-contained Single Executable Application (SEA).
# Bundles native-host.js into a copy of the Node runtime so end users don't
# need Node.js installed. Requires Node 20+ (uses the built-in SEA toolchain)
# and network access on first run (npx fetches postject).
#
# Usage:  .\build-exe.ps1
# Output: native-host.exe  (next to this script)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { Write-Error 'Node.js not found in PATH.'; exit 1 }

Write-Host '[1/4] Generating SEA blob...'
& $node --experimental-sea-config sea-config.json

Write-Host '[2/4] Copying Node runtime -> native-host.exe...'
Copy-Item $node 'native-host.exe' -Force

Write-Host '[3/4] Removing Authenticode signature (best-effort)...'
$signtool = (Get-Command signtool.exe -ErrorAction SilentlyContinue).Source
if ($signtool) {
  try { & $signtool remove /s 'native-host.exe' | Out-Null } catch { Write-Host '   (signtool remove skipped)' }
} else {
  Write-Host '   (signtool not found — leaving signature; injection still works)'
}

Write-Host '[4/4] Injecting blob with postject...'
& npx --yes postject 'native-host.exe' NODE_SEA_BLOB sea-prep.blob `
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --overwrite

Remove-Item 'sea-prep.blob' -ErrorAction SilentlyContinue
Write-Host ''
Write-Host 'Done -> native-host.exe' -ForegroundColor Green
