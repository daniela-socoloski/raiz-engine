<#
.SYNOPSIS
  raiz bootstrap — transforma uma maquina Windows limpa em ambiente Raiz Engine.

.DESCRIPTION
  Entrada unica e oficial. Idempotente: rodar de novo nao quebra nada, apenas
  completa o que falta. Retomavel: se parar no meio, rode outra vez.

  Perfis:
    developer  constroi e evolui o Raiz Engine (VS Code, Codex, Claude Code)
    creator    apenas usa o aplicativo — atendido pelo instalador, nao por aqui

  Nada e feito em silencio: cada passo declara o que vai fazer antes de fazer.

.PARAMETER Profile
  developer (padrao) ou creator.

.PARAMETER Path
  Onde clonar o repositorio. Padrao: a pasta atual.

.PARAMETER GitProtocol
  Protocolo configurado pelo fluxo oficial do gh. Padrao: ssh.

.PARAMETER SkipCorpus
  Nao baixa os objetos Git LFS (cerca de 398 MB de casos de marca).
  Util para quem so vai compilar o aplicativo.

.PARAMETER DryRun
  Mostra o que faria, sem instalar nem clonar nada.

.EXAMPLE
  pwsh -File operations/bootstrap/raiz-bootstrap.ps1 -SkipCorpus
#>

[CmdletBinding()]
param(
  [ValidateSet('developer', 'creator')]
  [string]$Profile = 'developer',
  [ValidateSet('ssh', 'https')]
  [string]$GitProtocol = 'ssh',
  [string]$Path = (Get-Location).Path,
  [switch]$SkipCorpus,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# O processo do Codex/VS Code pode ter sido aberto antes de uma instalação via
# winget. Releia apenas o PATH persistido; isso não altera a máquina e evita
# exigir que o usuário encerre todo o trabalho para continuar o bootstrap.
function Sync-ProcessPath {
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = (@($machinePath, $userPath) | Where-Object { $_ }) -join [IO.Path]::PathSeparator
}
Sync-ProcessPath

function Say  { param($t, $c = 'Gray')  Write-Host $t -ForegroundColor $c }
function Head { param($t) Say ""; Say "── $t" 'Cyan' }
function Ok   { param($t) Say "   OK       $t" 'Green' }
function Do_  { param($t) Say "   ->       $t" 'White' }
function Warn { param($t) Say "   AVISO    $t" 'Yellow' }
function Die  { param($t) Say "   ERRO     $t" 'Red'; exit 1 }

$manifestPath = Join-Path $PSScriptRoot 'toolchain.json'
if (-not (Test-Path $manifestPath)) {
  Die "manifesto canonico nao encontrado ao lado do bootstrap: $manifestPath"
}
$m = Get-Content $manifestPath -Raw | ConvertFrom-Json
$SLUG = $m.repository.slug

# Executado de dentro de um checkout, o bootstrap prepara esse checkout. O
# parametro -Path e usado somente quando a pessoa pede explicitamente outro
# diretorio de clone. Isso impede raiz-engine/raiz-engine por acidente.
$scriptRepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$insideCheckout = (Test-Path (Join-Path $scriptRepoRoot '.git'))
if (-not $PSBoundParameters.ContainsKey('Path') -and $insideCheckout) {
  $REPO_DIR = $scriptRepoRoot
} else {
  $REPO_DIR = Join-Path $Path 'raiz-engine'
}

Say ""
Say "  Raiz Engine — bootstrap" 'White'
Say "  perfil: $Profile$(if ($DryRun) { '   (simulacao)' })"
Say "  destino: $REPO_DIR"

if ($Profile -eq 'creator') {
  Head "Perfil creator"
  Warn "Este perfil nao usa o bootstrap."
  Say  "   A maquina do usuario final recebe o diretorio creator completo," 'DarkGray'
  Say  "   com Setup.exe, RELEASES e .nupkg. Nao exige Git, VS Code nem Node." 'DarkGray'
  Say  "   Para construir: operations/bootstrap/build-creator.ps1" 'DarkGray'
  Say  "   Use -Profile developer para preparar uma maquina de desenvolvimento." 'DarkGray'
  exit 0
}

# ---------------------------------------------------------------------------
# 1. Ferramentas
# ---------------------------------------------------------------------------
Head "Ferramentas"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Die "winget nao encontrado. Instale o App Installer pela Microsoft Store e rode de novo."
}

function Get-ToolVersion {
  param($tool)

  $check = @($tool.check)
  $exe = [string]$check[0]
  [string[]]$toolArgs = @()
  if ($check.Count -gt 1) {
    $toolArgs = @($check[1..($check.Count - 1)] | ForEach-Object { [string]$_ })
  }
  $found = Get-Command $exe -ErrorAction SilentlyContinue
  if (-not $found) { return $null }
  if ($found.Source -and $found.Source -like '*\WindowsApps\*' -and
      -not (Test-Path $found.Source -PathType Leaf)) { return $null }

  $out = (& $exe @toolArgs 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0) { return $null }
  if ($tool.parse -and $out -match $tool.parse) { return $Matches[1] }
  if ($out -match '(\d+\.\d+(?:\.\d+)?)') { return $Matches[1] }
  return 'desconhecida'
}

$requiredTools = @($m.profiles.$Profile.requires)
$optionalTools = @($m.profiles.$Profile.optional)
$selectedTools = @($requiredTools + $optionalTools | Select-Object -Unique)

$instalou = $false
foreach ($nome in $selectedTools) {
  $t = $m.tools.$nome
  $required = $requiredTools -contains $nome
  $version = Get-ToolVersion $t
  $outsideRange = $false
  if ($version -and $version -ne 'desconhecida') {
    try {
      if ($t.min -and ([version]$version -lt [version]$t.min)) { $outsideRange = $true }
      if ($t.max -and ([version]$version -gt [version]$t.max)) { $outsideRange = $true }
    } catch { $outsideRange = $false }
  }

  if ($version -and -not $outsideRange) { Ok "$nome $version ja instalado"; continue }
  if (-not $required -and -not $version) {
    Say "   ausente  $nome — opcional, pulando" 'DarkGray'
    continue
  }

  $acao = if ($version) { "corrigir versao de $nome ($version)" } else { "instalar $nome" }
  Do_ "$acao  (winget install $($t.winget))"
  if ($t.why) { Say "            $($t.why)" 'DarkGray' }
  if ($DryRun) { continue }

  winget install --id $t.winget --exact --silent --accept-source-agreements --accept-package-agreements | Out-Null
  if ($LASTEXITCODE -ne 0) { Die "winget falhou ao instalar $nome" }
  $instalou = $true
  Sync-ProcessPath
  $installedVersion = Get-ToolVersion $t
  if (-not $installedVersion -and $required) {
    Die "$nome foi instalado, mas ainda nao pode ser executado pelo PATH persistido"
  }
}

if ($instalou -and -not $DryRun) {
  Ok "ferramentas novas instaladas; PATH do processo foi atualizado"
}

# ---------------------------------------------------------------------------
# 2. Autenticacao
# ---------------------------------------------------------------------------
Head "Autenticacao"
gh auth status --hostname github.com *> $null
if ($LASTEXITCODE -eq 0) {
  Ok "gh autenticado"
} else {
  Do_ "autenticar no GitHub  (gh auth login)"
  Say "            O repositorio e privado: sem autenticacao o clone falha." 'DarkGray'
  if (-not $DryRun) {
    gh auth login --hostname github.com --git-protocol $GitProtocol --web
    if ($LASTEXITCODE -ne 0) { Die "autenticacao nao concluida" }
  }
}

# ---------------------------------------------------------------------------
# 3. Clone
# ---------------------------------------------------------------------------
Head "Repositorio"
if (Test-Path (Join-Path $REPO_DIR '.git')) {
  Ok "ja existe em $REPO_DIR"
} else {
  Do_ "clonar $SLUG"
  if (-not $DryRun) {
    # GIT_LFS_SKIP_SMUDGE evita baixar 398 MB durante o clone; o corpus vem depois,
    # so se o perfil pedir. Assim um clone de codigo leva segundos, nao minutos.
    $env:GIT_LFS_SKIP_SMUDGE = '1'
    gh repo clone $SLUG $REPO_DIR
    Remove-Item Env:\GIT_LFS_SKIP_SMUDGE -ErrorAction SilentlyContinue
    if (-not (Test-Path (Join-Path $REPO_DIR '.git'))) { Die "clone falhou" }
  }
}

if (-not $DryRun) { Set-Location $REPO_DIR }

# ---------------------------------------------------------------------------
# 4. Corpus de marcas
# ---------------------------------------------------------------------------
Head "Corpus de marcas"
if ($SkipCorpus) {
  Warn "pulado por -SkipCorpus"
  Say  "   Os arquivos de marca-raiz-prisma/projetos e ASSETS ficam como ponteiros." 'DarkGray'
  Say  "   Sao arquivos de poucas linhas, nao as imagens. Rode 'git lfs pull' quando precisar." 'DarkGray'
} else {
  Do_ "baixar objetos Git LFS  (cerca de 398 MB)"
  if (-not $DryRun) {
    git lfs install --local | Out-Null
    git lfs pull
    if ($LASTEXITCODE -ne 0) { Warn "git lfs pull falhou; o corpus continua como ponteiros" }
    else { Ok "corpus materializado" }
  }
}

# ---------------------------------------------------------------------------
# 5. Dependencias
# ---------------------------------------------------------------------------
Head "Dependencias"
# Procura o manifesto no checkout; em simulacao, cai para o proprio diretorio do script.
$manifest = Join-Path $REPO_DIR 'operations/bootstrap/toolchain.json'
if (-not (Test-Path $manifest)) { $manifest = Join-Path $PSScriptRoot 'toolchain.json' }
$comp = if (Test-Path $manifest) { (Get-Content $manifest -Raw | ConvertFrom-Json).components } else { $null }

if (-not $comp) {
  Warn "manifesto nao encontrado; pulando instalacao de dependencias"
} else {
  foreach ($nome in $comp.PSObject.Properties.Name) {
    $c = $comp.$nome
    $p = Join-Path $REPO_DIR $c.path
    if (-not (Test-Path $p)) { Warn "$nome nao encontrado em $($c.path)"; continue }
    Do_ "$nome  ($($c.install -join ' '))  em $($c.path)"
    if ($DryRun) { continue }
    Push-Location $p
    try {
      & $c.install[0] @($c.install[1..($c.install.Count - 1)])
      if ($LASTEXITCODE -eq 0) { Ok "$nome pronto" } else { Warn "$nome terminou com codigo $LASTEXITCODE" }
    } finally { Pop-Location }
  }
}

# ---------------------------------------------------------------------------
# 6. Skills dos agentes
# ---------------------------------------------------------------------------
Head "Skills dos agentes"
$skillSource = Join-Path $REPO_DIR 'skills/cena-raiz'
$skillInstaller = Join-Path $skillSource 'cenaraiz_install.py'
if (-not (Test-Path $skillInstaller)) {
  Warn "instalador da skill nao encontrado: $skillInstaller"
} else {
  Do_ "instalar/atualizar cena-raiz para Codex e Claude Code"
  if (-not $DryRun) {
    & uv run --python 3.12 python $skillInstaller --source $skillSource
    if ($LASTEXITCODE -eq 0) { Ok "skills dos agentes prontas" }
    else { Warn "instalacao das skills terminou com codigo $LASTEXITCODE" }
  }
}

# ---------------------------------------------------------------------------
# 7. Verificacao
# ---------------------------------------------------------------------------
Head "Verificacao"
$doctor = Join-Path $REPO_DIR 'operations/bootstrap/raiz-doctor.ps1'
if ($DryRun) {
  Do_ "rodar raiz doctor"
} elseif (Test-Path $doctor) {
  & $doctor -Profile $Profile
  $rc = $LASTEXITCODE
  Say ""
  if ($rc -eq 0) {
    Say "  Ambiente Raiz pronto." 'Green'
    Say "  Para abrir o aplicativo:" 'DarkGray'
    Say "    cd $($comp.desktop.path)" 'DarkGray'
    Say "    npm start" 'DarkGray'
  } else {
    Say "  Ambiente incompleto. Veja o relatorio acima." 'Yellow'
  }
  exit $rc
} else {
  Warn "raiz-doctor.ps1 nao encontrado"
}
