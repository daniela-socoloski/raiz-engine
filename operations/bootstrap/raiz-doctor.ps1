<#
.SYNOPSIS
  raiz doctor — verificacao somente de leitura do ambiente Raiz Engine.

.DESCRIPTION
  Nao instala, nao altera, nao baixa nada. Le operations/bootstrap/toolchain.json
  e relata o que falta para a maquina estar pronta.

  Codigos de saida:
    0  tudo pronto
    1  falta ferramenta obrigatoria ou versao abaixo do minimo
    2  manifesto ausente ou ilegivel

.EXAMPLE
  pwsh -File operations/bootstrap/raiz-doctor.ps1
  pwsh -File operations/bootstrap/raiz-doctor.ps1 -Profile developer
#>

[CmdletBinding()]
param(
  [ValidateSet('developer', 'creator')]
  [string]$Profile = 'developer',
  [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$manifestPath = Join-Path $PSScriptRoot 'toolchain.json'

# Somente o processo: enxerga ferramentas instaladas por winget depois que o
# Codex/VS Code foi aberto, sem escrever em configuração alguma da máquina.
$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = (@($machinePath, $userPath) | Where-Object { $_ }) -join [IO.Path]::PathSeparator

function Write-Line { param($t, $c = 'Gray') if (-not $Quiet) { Write-Host $t -ForegroundColor $c } }
function Write-Head { param($t) Write-Line "" ; Write-Line $t 'Cyan' }

if (-not (Test-Path $manifestPath)) {
  Write-Host "manifesto nao encontrado: $manifestPath" -ForegroundColor Red
  exit 2
}
$m = Get-Content $manifestPath -Raw | ConvertFrom-Json

Write-Line "raiz doctor  ·  perfil $Profile" 'White'
Write-Line "repositorio: $repoRoot"

# ---------------------------------------------------------------- plataforma
Write-Head "Plataforma"
$arch = if ([Environment]::Is64BitOperatingSystem) { 'x64' } else { 'x86' }
$plat = "win32-$arch"
if ($m.platforms.supported -contains $plat) {
  Write-Line "  OK       $plat" 'Green'
} else {
  Write-Line "  AVISO    $plat nao esta na lista de plataformas comprovadas" 'Yellow'
}

if ($Profile -eq 'creator') {
  Write-Head "Artefato creator"
  $artifactDirectory = Join-Path $repoRoot "apps/cena-raiz-desktop/out/creator/$plat"
  $setup = Join-Path $artifactDirectory 'CenaRaizSetup.exe'
  $checksum = "$setup.sha256"
  $report = Join-Path $artifactDirectory 'creator-build.json'
  $smoke = Join-Path $artifactDirectory 'creator-smoke.json'
  $creatorMissing = @()

  foreach ($entry in @(
    @{ Name = 'instalador'; Path = $setup },
    @{ Name = 'checksum'; Path = $checksum },
    @{ Name = 'relatorio'; Path = $report },
    @{ Name = 'smoke'; Path = $smoke }
  )) {
    if (Test-Path -LiteralPath $entry.Path -PathType Leaf) {
      Write-Line ("  OK       {0,-10} {1}" -f $entry.Name, $entry.Path) 'Green'
    } else {
      Write-Line ("  FALTA    {0,-10} {1}" -f $entry.Name, $entry.Path) 'Red'
      $creatorMissing += $entry.Name
    }
  }

  if ((Test-Path -LiteralPath $setup) -and (Test-Path -LiteralPath $checksum)) {
    $expected = ((Get-Content -LiteralPath $checksum -Raw).Trim() -split '\s+')[0]
    $actual = (Get-FileHash -LiteralPath $setup -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($expected -eq $actual) {
      Write-Line "  OK       SHA-256 do instalador confere" 'Green'
    } else {
      Write-Line "  INVALIDO SHA-256 do instalador nao confere" 'Red'
      $creatorMissing += 'integridade'
    }
  }

  if (Test-Path -LiteralPath $report) {
    try {
      $buildReport = Get-Content -LiteralPath $report -Raw | ConvertFrom-Json
      if ($buildReport.distributionUnit -ne 'directory' -or
          $buildReport.selfContainedRuntimes -ne $true) {
        throw 'relatorio nao descreve um pacote creator autonomo em diretorio'
      }
      foreach ($artifact in $buildReport.artifacts) {
        $artifactPath = Join-Path $artifactDirectory $artifact.file
        if (-not (Test-Path -LiteralPath $artifactPath -PathType Leaf)) {
          Write-Line "  FALTA    artefato   $($artifact.file)" 'Red'
          $creatorMissing += "artefato:$($artifact.file)"
          continue
        }
        $artifactHash = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($artifactHash -ne $artifact.sha256) {
          Write-Line "  INVALIDO artefato   $($artifact.file)" 'Red'
          $creatorMissing += "hash:$($artifact.file)"
        } else {
          Write-Line "  OK       artefato   $($artifact.file)" 'Green'
        }
      }
    } catch {
      Write-Line "  INVALIDO relatorio creator: $($_.Exception.Message)" 'Red'
      $creatorMissing += 'relatorio-invalido'
    }
  }

  Write-Head "Veredito"
  if ($creatorMissing.Count -eq 0) {
    Write-Line "  Perfil creator construido e verificado localmente." 'Green'
    Write-Line "  A prova em VM limpa e a assinatura ainda sao gates separados." 'Yellow'
    exit 0
  }
  Write-Line "  Perfil creator incompleto: $($creatorMissing -join ', ')" 'Red'
  Write-Line "  Rode operations/bootstrap/build-creator.ps1." 'DarkGray'
  exit 1
}

# ---------------------------------------------------------------- ferramentas
Write-Head "Ferramentas"
$faltando = @()
$desatualizadas = @()

# Cada verificacao roda isolada com limite de tempo. Uma ferramenta ausente ou
# um stub que abre a Microsoft Store nao pode pendurar o doctor.
function Get-ToolVersion {
  param($cmd, $regex, [int]$TimeoutSec = 10)

  $exe = [string]$cmd[0]
  $rest = @()
  if ($cmd.Count -gt 1) { $rest = @($cmd[1..($cmd.Count - 1)] | ForEach-Object { [string]$_ }) }

  $found = Get-Command $exe -ErrorAction SilentlyContinue
  if (-not $found) { return $null }
  # Stub da Microsoft Store: existe no PATH mas abre a loja e bloqueia.
  if ($found.Source -and $found.Source -like '*\WindowsApps\*' -and -not (Test-Path $found.Source -PathType Leaf)) {
    return 'stub-store'
  }

  $job = Start-Job -ScriptBlock {
    param($e, $a)
    try { (& $e @a 2>&1 | Out-String) } catch { '' }
  } -ArgumentList $exe, (, $rest)

  $out = ''
  if (Wait-Job $job -Timeout $TimeoutSec) { $out = [string](Receive-Job $job) }
  else { Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -Force -ErrorAction SilentlyContinue; return 'timeout' }
  Remove-Job $job -Force -ErrorAction SilentlyContinue

  if ($regex -and $out -match $regex) { return $Matches[1] }
  # Fallback: qualquer coisa que se pareca com uma versao.
  if ($out -match '(\d+\.\d+(?:\.\d+)?)') { return $Matches[1] }
  return 'desconhecida'
}

$requeridas = $m.profiles.$Profile.requires
$opcionais = $m.profiles.$Profile.optional

foreach ($nome in $m.tools.PSObject.Properties.Name) {
  $t = $m.tools.$nome
  $ehRequerida = $requeridas -contains $nome
  $ehOpcional = $opcionais -contains $nome
  if (-not $ehRequerida -and -not $ehOpcional) { continue }

  $v = Get-ToolVersion $t.check $t.parse

  if (-not $v) {
    if ($ehRequerida) {
      $faltando += $nome
      $crit = if ($t.critical) { ' [CRITICA]' } else { '' }
      Write-Line ("  FALTA    {0,-10}{1}  -> winget install {2}" -f $nome, $crit, $t.winget) 'Red'
      if ($t.why) { Write-Line "           $($t.why)" 'DarkGray' }
    } else {
      Write-Line ("  ausente  {0,-10} opcional  -> winget install {1}" -f $nome, $t.winget) 'DarkGray'
    }
    continue
  }

  if ($v -eq 'stub-store') {
    $faltando += $nome
    Write-Line ("  STUB     {0,-10} atalho da Microsoft Store, nao a ferramenta real" -f $nome) 'Red'
    Write-Line "           desative em Configuracoes > Aplicativos > Aliases de execucao" 'DarkGray'
    continue
  }
  if ($v -eq 'timeout') {
    $faltando += $nome
    Write-Line ("  TRAVOU   {0,-10} nao respondeu em 10s" -f $nome) 'Red'
    continue
  }

  $abaixo = $false
  if ($v -ne 'desconhecida' -and $t.min) {
    try { $abaixo = [version]$v -lt [version]$t.min } catch { $abaixo = $false }
  }
  $acima = $false
  if ($v -ne 'desconhecida' -and $t.max) {
    try { $acima = [version]$v -gt [version]$t.max } catch { $acima = $false }
  }

  if ($abaixo) {
    $desatualizadas += $nome
    Write-Line ("  VELHA    {0,-10} {1}  (minimo {2})" -f $nome, $v, $t.min) 'Yellow'
  } elseif ($acima) {
    Write-Line ("  AVISO    {0,-10} {1}  (maximo suportado {2})" -f $nome, $v, $t.max) 'Yellow'
  } else {
    Write-Line ("  OK       {0,-10} {1}" -f $nome, $v) 'Green'
  }
}

# ---------------------------------------------------------------- git e LFS
Write-Head "Repositorio"
Push-Location $repoRoot
try {
  $top = (git rev-parse --show-toplevel 2>$null)
  if ($top) {
    Write-Line "  OK       fronteira Git em $top" 'Green'
    $commits = (git rev-list --all --count 2>$null)
    Write-Line "  OK       $commits commit(s)" 'Green'

    $lfsCount = (git lfs ls-files 2>$null | Measure-Object -Line).Lines
    if ($lfsCount -gt 0) {
      Write-Line "  OK       $lfsCount caminho(s) em Git LFS" 'Green'
      # ponteiro nao resolvido = corpus nao baixado
      $amostra = git lfs ls-files 2>$null | Select-Object -First 1
      if ($amostra -match '^\s*\S+\s+(-)\s') {
        Write-Line "  AVISO    objetos LFS nao baixados: o corpus contem apenas ponteiros" 'Yellow'
        Write-Line "           rode: git lfs pull" 'DarkGray'
      }
    }
  } else {
    Write-Line "  FALTA    nao e um repositorio Git" 'Red'
    $faltando += 'repositorio'
  }
} finally { Pop-Location }

# ---------------------------------------------------------------- componentes
Write-Head "Componentes"
foreach ($nome in $m.components.PSObject.Properties.Name) {
  $c = $m.components.$nome
  $p = Join-Path $repoRoot $c.path
  if (-not (Test-Path $p)) {
    Write-Line ("  FALTA    {0,-8} {1}" -f $nome, $c.path) 'Red'
    $faltando += "componente:$nome"
    continue
  }
  $deps = if ($nome -eq 'desktop') { Test-Path (Join-Path $p 'node_modules') }
          else { Test-Path (Join-Path $p '.venv') }
  if ($deps) {
    Write-Line ("  OK       {0,-8} dependencias instaladas" -f $nome) 'Green'
  } else {
    Write-Line ("  PENDENTE {0,-8} dependencias nao instaladas -> {1}" -f $nome, ($c.install -join ' ')) 'Yellow'
    $faltando += "dependencias:$nome"
  }
}

# ---------------------------------------------------------------- skills de agentes
Write-Head "Skills dos agentes"
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$agentTargets = @(
  @{ Name = 'Claude Code'; Root = (Join-Path $env:USERPROFILE '.claude/skills') },
  @{ Name = 'Codex'; Root = (Join-Path $codexHome 'skills') }
)
foreach ($target in $agentTargets) {
  $skillRoot = Join-Path $target.Root 'cena-raiz'
  $skillManifest = Join-Path $skillRoot 'SKILL.md'
  $skillEnvironment = Join-Path $skillRoot '.venv'
  $remotionManifest = Join-Path (Join-Path $target.Root 'remotion-best-practices') 'SKILL.md'
  if ((Test-Path -LiteralPath $skillManifest) -and (Test-Path -LiteralPath $skillEnvironment)) {
    Write-Line ("  OK       {0,-11} cena-raiz + ambiente Python" -f $target.Name) 'Green'
  } else {
    Write-Line ("  FALTA    {0,-11} {1}" -f $target.Name, $skillRoot) 'Red'
    $faltando += "skill:$($target.Name)"
  }
  if (Test-Path -LiteralPath $remotionManifest) {
    Write-Line ("  OK       {0,-11} remotion-best-practices" -f $target.Name) 'Green'
  } else {
    Write-Line ("  FALTA    {0,-11} remotion-best-practices" -f $target.Name) 'Red'
    $faltando += "skill-remotion:$($target.Name)"
  }
}

# ---------------------------------------------------------------- autenticacao
Write-Head "Autenticacao"
if (Get-Command gh -ErrorAction SilentlyContinue) {
  $auth = gh auth status 2>&1 | Out-String
  if ($auth -match 'Logged in to') {
    Write-Line "  OK       gh autenticado" 'Green'
  } else {
    Write-Line "  PENDENTE gh nao autenticado -> gh auth login" 'Yellow'
  }
} else {
  Write-Line "  FALTA    gh nao instalado" 'Red'
}

# ---------------------------------------------------------------- veredito
Write-Head "Veredito"
if ($faltando.Count -eq 0 -and $desatualizadas.Count -eq 0) {
  Write-Line "  Ambiente pronto." 'Green'
  exit 0
}
if ($faltando.Count -gt 0) { Write-Line "  Faltando: $($faltando -join ', ')" 'Red' }
if ($desatualizadas.Count -gt 0) { Write-Line "  Desatualizadas: $($desatualizadas -join ', ')" 'Yellow' }
Write-Line "  Rode operations/bootstrap/raiz-bootstrap.ps1 para instalar o que falta." 'DarkGray'
exit 1
