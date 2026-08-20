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

.PARAMETER SkipCorpus
  Nao baixa os objetos Git LFS (cerca de 398 MB de casos de marca).
  Util para quem so vai compilar o aplicativo.

.PARAMETER DryRun
  Mostra o que faria, sem instalar nem clonar nada.

.EXAMPLE
  irm https://raw.githubusercontent.com/daniela-socoloski/raiz-engine/main/operations/bootstrap/raiz-bootstrap.ps1 | iex

.EXAMPLE
  pwsh -File operations/bootstrap/raiz-bootstrap.ps1 -SkipCorpus
#>

[CmdletBinding()]
param(
  [ValidateSet('developer', 'creator')]
  [string]$Profile = 'developer',
  [string]$Path = (Get-Location).Path,
  [switch]$SkipCorpus,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$SLUG = 'daniela-socoloski/raiz-engine'
$REPO_DIR = Join-Path $Path 'raiz-engine'

function Say  { param($t, $c = 'Gray')  Write-Host $t -ForegroundColor $c }
function Head { param($t) Say ""; Say "── $t" 'Cyan' }
function Ok   { param($t) Say "   OK       $t" 'Green' }
function Do_  { param($t) Say "   ->       $t" 'White' }
function Warn { param($t) Say "   AVISO    $t" 'Yellow' }
function Die  { param($t) Say "   ERRO     $t" 'Red'; exit 1 }

Say ""
Say "  Raiz Engine — bootstrap" 'White'
Say "  perfil: $Profile$(if ($DryRun) { '   (simulacao)' })"
Say "  destino: $REPO_DIR"

if ($Profile -eq 'creator') {
  Head "Perfil creator"
  Warn "Este perfil nao usa o bootstrap."
  Say  "   A maquina do usuario final recebe o instalador CenaRaizSetup.exe," 'DarkGray'
  Say  "   que ainda nao foi construido. Nao exige Git, VS Code nem Node." 'DarkGray'
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

# id winget, comando de verificacao, se e obrigatoria
$TOOLS = @(
  @{ nome = 'Git';         id = 'Git.Git';            cmd = 'git';     req = $true },
  @{ nome = 'Git LFS';     id = 'GitHub.GitLFS';      cmd = 'git-lfs'; req = $true
     porque = 'O corpus de marcas e versionado por LFS. Sem ele o clone traz ponteiros, nao os assets.' },
  @{ nome = 'GitHub CLI';  id = 'GitHub.cli';         cmd = 'gh';      req = $true },
  @{ nome = 'Node LTS';    id = 'OpenJS.NodeJS.LTS';  cmd = 'node';    req = $true },
  @{ nome = 'uv';          id = 'astral-sh.uv';       cmd = 'uv';      req = $true },
  @{ nome = 'Python 3.12'; id = 'Python.Python.3.12'; cmd = 'python';  req = $true
     porque = 'A skill exige >=3.10 e <3.14. Python 3.14 ou mais novo nao serve.' },
  @{ nome = 'FFmpeg';      id = 'Gyan.FFmpeg';        cmd = 'ffmpeg';  req = $false }
)

$instalou = $false
foreach ($t in $TOOLS) {
  $tem = Get-Command $t.cmd -ErrorAction SilentlyContinue
  if ($tem) { Ok "$($t.nome) ja instalado"; continue }
  if (-not $t.req) { Say "   ausente  $($t.nome) — opcional, pulando" 'DarkGray'; continue }

  Do_ "instalar $($t.nome)  (winget install $($t.id))"
  if ($t.porque) { Say "            $($t.porque)" 'DarkGray' }
  if ($DryRun) { continue }

  winget install --id $t.id --exact --silent --accept-source-agreements --accept-package-agreements | Out-Null
  $instalou = $true
}

if ($instalou -and -not $DryRun) {
  Warn "Ferramentas novas foram instaladas."
  Say  "   Feche este terminal, abra outro e rode o bootstrap de novo." 'DarkGray'
  Say  "   O PATH so e relido na abertura do terminal." 'DarkGray'
  exit 0
}

# Python novo demais e falha silenciosa: uv sync escolhe outro interpretador ou falha.
if (-not $DryRun -and (Get-Command python -ErrorAction SilentlyContinue)) {
  $pv = (python --version 2>&1 | Out-String)
  if ($pv -match '(\d+)\.(\d+)') {
    $maj = [int]$Matches[1]; $min = [int]$Matches[2]
    if ($maj -gt 3 -or ($maj -eq 3 -and $min -ge 14)) {
      Warn "Python $maj.$min esta acima do suportado pela skill (>=3.10, <3.14)."
      Say  "   O uv vai procurar um interpretador compativel; se nao houver, instale o 3.12." 'DarkGray'
    }
  }
}

# ---------------------------------------------------------------------------
# 2. Autenticacao
# ---------------------------------------------------------------------------
Head "Autenticacao"
$auth = if ($DryRun) { '' } else { (gh auth status 2>&1 | Out-String) }
if ($auth -match 'Logged in to') {
  Ok "gh autenticado"
} else {
  Do_ "autenticar no GitHub  (gh auth login)"
  Say "            O repositorio e privado: sem autenticacao o clone falha." 'DarkGray'
  if (-not $DryRun) {
    gh auth login --hostname github.com --git-protocol https --web
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
# Procura o manifesto no clone; em simulacao, cai para o proprio diretorio do script.
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
# 6. Verificacao
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
