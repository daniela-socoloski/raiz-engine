<#
.SYNOPSIS
  Entrada minima da Fase 0 para preparar uma maquina Windows e obter o Raiz Engine.

.DESCRIPTION
  Instala somente o seed necessario para acessar o repositorio privado: Git,
  Git LFS e GitHub CLI. Autentica pelo fluxo oficial do gh, clona o repositorio
  sem materializar LFS durante o clone e transfere o controle para o bootstrap
  canonico versionado dentro do checkout.

  Este launcher nao contem a toolchain do produto. Depois do clone,
  raiz-bootstrap.ps1 e toolchain.json sao a unica autoridade de instalacao.

.EXAMPLE
  pwsh -File install.ps1 -Path C:\work

.EXAMPLE
  pwsh -File install.ps1 -Path C:\work -SkipCorpus -DryRun
#>

[CmdletBinding()]
param(
  [string]$Path = (Get-Location).Path,
  [ValidateSet('ssh', 'https')]
  [string]$GitProtocol = 'ssh',
  [switch]$SkipCorpus,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoSlug = 'daniela-socoloski/raiz-engine'
$repoDir = Join-Path $Path 'raiz-engine'

function Write-Step { param($text) Write-Host "   ->       $text" -ForegroundColor White }
function Write-Ok { param($text) Write-Host "   OK       $text" -ForegroundColor Green }
function Write-Warn { param($text) Write-Host "   AVISO    $text" -ForegroundColor Yellow }
function Stop-Install { param($text) Write-Host "   ERRO     $text" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  Raiz Engine - entrada da Fase 0" -ForegroundColor White
Write-Host "  destino: $repoDir"
if ($DryRun) { Write-Host "  modo: simulacao; nenhuma alteracao sera feita" -ForegroundColor DarkGray }

$isWindowsHost = [Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT
if (-not $isWindowsHost) {
  Stop-Install 'a primeira plataforma comprovada e Windows 11 x64'
}
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Stop-Install 'winget nao encontrado; instale o App Installer oficial e tente novamente'
}

# Seed minimo inevitavel antes de o manifesto privado poder ser lido. Versoes,
# ferramentas restantes e reparos pertencem ao toolchain.json depois do clone.
$seedTools = @(
  @{ name = 'Git'; id = 'Git.Git'; test = { $null -ne (Get-Command git -ErrorAction SilentlyContinue) } },
  @{ name = 'Git LFS'; id = 'GitHub.GitLFS'; test = { git lfs version *> $null; $LASTEXITCODE -eq 0 } },
  @{ name = 'GitHub CLI'; id = 'GitHub.cli'; test = { $null -ne (Get-Command gh -ErrorAction SilentlyContinue) } },
  @{ name = 'PowerShell 7'; id = 'Microsoft.PowerShell'; test = { $null -ne (Get-Command pwsh -ErrorAction SilentlyContinue) } }
)

$installedSeed = $false
$missingSeedInDryRun = $false
foreach ($tool in $seedTools) {
  $available = [bool](& $tool.test)
  if ($available) { Write-Ok "$($tool.name) disponivel"; continue }

  Write-Step "instalar $($tool.name) com winget"
  if ($DryRun) { $missingSeedInDryRun = $true; continue }
  winget install --id $tool.id --exact --silent --accept-source-agreements --accept-package-agreements | Out-Null
  if ($LASTEXITCODE -ne 0) { Stop-Install "falha ao instalar $($tool.name)" }
  $installedSeed = $true
}

if ($installedSeed -and -not $DryRun) {
  Write-Warn 'o seed foi instalado; feche este terminal, abra outro e execute install.ps1 novamente'
  exit 0
}
if ($missingSeedInDryRun) {
  Write-Warn 'a simulacao termina aqui porque o seed ausente so existira depois da instalacao e reabertura do terminal'
  exit 0
}

$authenticated = $false
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh auth status --hostname github.com *> $null
  $authenticated = $LASTEXITCODE -eq 0
}

if (-not $authenticated) {
  Write-Step "autenticar no GitHub com gh usando protocolo $GitProtocol"
  if (-not $DryRun) {
    gh auth login --hostname github.com --git-protocol $GitProtocol --web
    if ($LASTEXITCODE -ne 0) { Stop-Install 'autenticacao GitHub nao concluida' }
    gh auth setup-git --hostname github.com
    if ($LASTEXITCODE -ne 0) { Stop-Install 'gh nao conseguiu configurar o acesso do Git' }
  }
} else {
  Write-Ok 'GitHub CLI autenticado'
}

if (Test-Path (Join-Path $repoDir '.git')) {
  Write-Ok "checkout existente em $repoDir"
} else {
  Write-Step "clonar o repositorio privado $repoSlug"
  if (-not $DryRun) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    $env:GIT_LFS_SKIP_SMUDGE = '1'
    try {
      gh repo clone $repoSlug $repoDir
    } finally {
      Remove-Item Env:\GIT_LFS_SKIP_SMUDGE -ErrorAction SilentlyContinue
    }
    if (-not (Test-Path (Join-Path $repoDir '.git'))) { Stop-Install 'clone nao foi criado' }
  }
}

$bootstrap = Join-Path $repoDir 'operations/bootstrap/raiz-bootstrap.ps1'
if ($DryRun -and -not (Test-Path $bootstrap)) {
  Write-Step 'depois do clone, executar o bootstrap canonico do checkout em modo DryRun'
  exit 0
}
if (-not (Test-Path $bootstrap)) { Stop-Install "bootstrap canonico nao encontrado em $bootstrap" }

Write-Step 'transferir o controle para o bootstrap canonico'
Push-Location $repoDir
try {
  $bootstrapArgs = @('-NoProfile', '-File', $bootstrap, '-Profile', 'developer', '-GitProtocol', $GitProtocol)
  if ($SkipCorpus) { $bootstrapArgs += '-SkipCorpus' }
  if ($DryRun) { $bootstrapArgs += '-DryRun' }
  & pwsh @bootstrapArgs
  $bootstrapExitCode = $LASTEXITCODE
  exit $bootstrapExitCode
} finally {
  Pop-Location
}
