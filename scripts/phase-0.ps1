[CmdletBinding()]
param(
    [switch]$CreateNextcloudServiceAccount
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker Desktop is required. Install it, start it, then run this script again.'
}

# Docker Desktop 4.44+ exposes this CLI. Starting it is harmless when it is
# already running, and avoids relying on the Desktop UI for local bootstrap.
$desktopStatus = & docker desktop status 2>$null
if ($LASTEXITCODE -ne 0 -or $desktopStatus -notmatch 'running') {
    & docker desktop start --detach
}

$deadline = (Get-Date).AddMinutes(2)
do {
    & docker info *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)

if ($LASTEXITCODE -ne 0) {
    throw 'Docker Engine did not become ready within two minutes. Open Docker Desktop and resolve its diagnostic error before retrying.'
}

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Warning 'Created .env from .env.example. Replace all change-me-* values before sharing or deploying this environment.'
}

$placeholderSecrets = Select-String -Path .env -Pattern '=change-me-' -SimpleMatch
if ($placeholderSecrets) {
    Write-Warning 'The local .env still contains development placeholder secrets. They are acceptable only for an isolated local stack.'
}

& docker compose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose configuration is invalid.' }

& docker compose up -d --build
if ($LASTEXITCODE -ne 0) { throw 'The local stack did not start successfully.' }

& docker compose ps

if ($CreateNextcloudServiceAccount) {
    $envValues = @{}
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*?)\s*$') {
            $envValues[$matches[1].Trim()] = $matches[2].Trim()
        }
    }

    $serviceUser = $envValues['NEXTCLOUD_SERVICE_USER']
    $servicePassword = $envValues['NEXTCLOUD_SERVICE_PASSWORD']
    if (-not $serviceUser -or -not $servicePassword) {
        throw 'NEXTCLOUD_SERVICE_USER and NEXTCLOUD_SERVICE_PASSWORD must be set in .env.'
    }

    & docker compose exec -T --user 33 nextcloud php occ user:info $serviceUser *> $null
    if ($LASTEXITCODE -ne 0) {
        & docker compose exec -T --user 33 -e "OC_PASS=$servicePassword" nextcloud php occ user:add --password-from-env --display-name='SeVR API service' $serviceUser
        if ($LASTEXITCODE -ne 0) { throw 'Unable to create the Nextcloud service account.' }
    }
}

Write-Host 'Phase 0 foundation is running. Verify FastAPI readiness with: curl.exe http://localhost:8000/health/ready'
