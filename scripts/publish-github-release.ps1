<#
.SYNOPSIS
  Creates a public GitHub release and uploads NEXUS LAB Windows builds.

.NOTES
  Prerequisites:
    - git + GitHub CLI (gh) authenticated: gh auth login
    - Built artifacts in .\release\
#>
param(
  [string]$Tag = "v2.0.0",
  [string]$Repo = "",
  [string]$Title = "NEXUS LAB v2.0.0"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$setup = Join-Path $root "release\NEXUS_LAB_Setup.exe"
$portable = Join-Path $root "release\NEXUS_LAB_Portable.exe"

if (-not (Test-Path $setup) -or -not (Test-Path $portable)) {
  throw "Missing release EXEs. Run: npm run dist"
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI (gh) not found. Install from https://cli.github.com/ then run: gh auth login"
}

$auth = gh auth status 2>&1 | Out-String
if ($auth -notmatch "Logged in") {
  throw "Not logged into GitHub CLI. Run: gh auth login"
}

if (-not $Repo) {
  $Repo = (gh repo view --json nameWithOwner -q .nameWithOwner 2>$null)
  if (-not $Repo) {
    throw "Pass -Repo owner/name or set git remote to a GitHub repository."
  }
}

$notes = @"
## NEXUS LAB $Tag

Professional offline Windows sandbox control panel.

### Downloads
- **NEXUS_LAB_Setup.exe** — full installer
- **NEXUS_LAB_Portable.exe** — portable EXE

### Install
1. Download Setup or Portable
2. Run Setup (or double-click Portable)
3. Press `` ` `` or F1 for the control panel

### Security
Sandbox only — no third-party injection, memory access, or anti-cheat interference.
"@

gh release create $Tag `
  --repo $Repo `
  --title $Title `
  --notes $notes `
  $setup `
  $portable

Write-Host ""
Write-Host "Release URL:"
Write-Host "https://github.com/$Repo/releases/tag/$Tag"
Write-Host "Latest URL:"
Write-Host "https://github.com/$Repo/releases/latest"
