<#
.SYNOPSIS
Instala DOUTRINA-ENGENHARIA-TRANSVERSAL.md na memoria base do Claude Code.

.DESCRIPTION
Escreve uma linha de import em ~/.claude/CLAUDE.md. Nao copia conteudo:
a fonte unica continua sendo o arquivo do repositorio.

.EXAMPLE
./instalar-doutrina.ps1
./instalar-doutrina.ps1 -Verificar
./instalar-doutrina.ps1 -Remover
./instalar-doutrina.ps1 -Destino C:\caminho\CLAUDE.md
#>
[CmdletBinding()]
param(
    [switch]$Verificar,
    [switch]$Remover,
    [string]$Destino
)

$ErrorActionPreference = 'Stop'

$inicio = '<!-- raiz-engine:doutrina:inicio -->'
$fim    = '<!-- raiz-engine:doutrina:fim -->'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir   = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$doutrina  = Join-Path $repoDir 'DOUTRINA-ENGENHARIA-TRANSVERSAL.md'

if (-not (Test-Path -LiteralPath $doutrina)) {
    throw "doutrina nao encontrada em $doutrina"
}

if (-not $Destino) {
    $configDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
    $Destino = Join-Path $configDir 'CLAUDE.md'
}

function Get-LinhasSemBloco {
    param([string[]]$Linhas)
    $saida = New-Object System.Collections.Generic.List[string]
    $dentro = $false
    foreach ($linha in $Linhas) {
        if ($linha -eq $inicio) { $dentro = $true; continue }
        if ($linha -eq $fim)    { $dentro = $false; continue }
        if (-not $dentro)       { $saida.Add($linha) }
    }
    return $saida.ToArray()
}

$existentes = @()
if (Test-Path -LiteralPath $Destino) {
    $existentes = @(Get-Content -LiteralPath $Destino)
}

if ($Verificar) {
    Write-Host "doutrina: $doutrina"
    Write-Host "destino:  $Destino"
    if ($existentes -contains $inicio) {
        Write-Host 'estado:   instalada'
        if ($existentes -contains "@$doutrina") {
            Write-Host 'caminho:  atual'
        } else {
            Write-Host 'caminho:  desatualizado - rode sem argumentos para corrigir'
        }
    } else {
        Write-Host 'estado:   ausente'
    }
    return
}

$pasta = Split-Path -Parent $Destino
if ($pasta -and -not (Test-Path -LiteralPath $pasta)) {
    New-Item -ItemType Directory -Path $pasta -Force | Out-Null
}

$linhas = @(Get-LinhasSemBloco -Linhas $existentes)

if ($Remover) {
    Set-Content -LiteralPath $Destino -Value $linhas -Encoding UTF8
    Write-Host "removido de $Destino"
    return
}

# remove linhas em branco no fim, para nao acumular a cada reinstalacao
while ($linhas.Count -gt 0 -and [string]::IsNullOrWhiteSpace($linhas[-1])) {
    if ($linhas.Count -eq 1) {
        $linhas = @()
    } else {
        $linhas = @($linhas[0..($linhas.Count - 2)])
    }
}

$bloco = @()
if ($linhas.Count -gt 0) { $bloco += '' }
$bloco += $inicio
$bloco += '# Memoria base - Doutrina de Engenharia e Arquitetura Transversal'
$bloco += ''
$bloco += "@$doutrina"
$bloco += $fim

Set-Content -LiteralPath $Destino -Value ($linhas + $bloco) -Encoding UTF8
Write-Host "instalada em $Destino"
Write-Host "import: @$doutrina"
