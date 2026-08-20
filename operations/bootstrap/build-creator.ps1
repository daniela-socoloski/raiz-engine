<#
.SYNOPSIS
  Constroi e verifica o primeiro instalador autonomo do perfil creator.

.DESCRIPTION
  Executa o build local sem publicar. Por padrao prepara todos os runtimes,
  gera o Squirrel Setup, copia o artefato canonico para out/creator e abre o
  aplicativo empacotado em um smoke controlado.
#>
[CmdletBinding()]
param(
  [switch]$Prepared,
  [switch]$SkipSmoke,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$desktopRoot = Join-Path $repoRoot 'apps/cena-raiz-desktop'
$scriptName = if ($Prepared) { 'make:creator:prepared' } else { 'make:creator' }

Write-Host "Raiz Engine — build do perfil creator" -ForegroundColor Cyan
Write-Host "  desktop: $desktopRoot"
Write-Host "  comando: npm run $scriptName"
if ($DryRun) {
  Write-Host "  simulacao: nenhuma alteracao executada" -ForegroundColor Yellow
  exit 0
}
if (-not (Test-Path (Join-Path $desktopRoot 'node_modules'))) {
  throw 'Dependencias do desktop ausentes. Rode o bootstrap developer primeiro.'
}

Push-Location $desktopRoot
try {
  & npm.cmd run $scriptName
  if ($LASTEXITCODE -ne 0) { throw "Build creator terminou com codigo $LASTEXITCODE." }
  if (-not $SkipSmoke) {
    & npm.cmd run smoke:creator
    if ($LASTEXITCODE -ne 0) { throw "Smoke creator terminou com codigo $LASTEXITCODE." }
  }
} finally {
  Pop-Location
}

& (Join-Path $PSScriptRoot 'raiz-doctor.ps1') -Profile creator
exit $LASTEXITCODE
