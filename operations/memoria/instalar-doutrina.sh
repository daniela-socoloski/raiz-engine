#!/usr/bin/env sh
# Instala DOUTRINA-ENGENHARIA-TRANSVERSAL.md na memoria base do Claude Code.
# Escreve uma linha de import em ~/.claude/CLAUDE.md. Nao copia conteudo:
# a fonte unica continua sendo o arquivo do repositorio.
#
# Uso:
#   ./instalar-doutrina.sh                 instala ou atualiza
#   ./instalar-doutrina.sh --verificar     mostra o estado, sem escrever
#   ./instalar-doutrina.sh --remover       remove o bloco
#   ./instalar-doutrina.sh --destino ARQ   usa outro arquivo de memoria

set -eu

INICIO='<!-- raiz-engine:doutrina:inicio -->'
FIM='<!-- raiz-engine:doutrina:fim -->'

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_dir=$(CDPATH= cd -- "$script_dir/../.." && pwd)
doutrina="$repo_dir/DOUTRINA-ENGENHARIA-TRANSVERSAL.md"

config_dir=${CLAUDE_CONFIG_DIR:-"$HOME/.claude"}
destino="$config_dir/CLAUDE.md"
acao=instalar

while [ $# -gt 0 ]; do
  case $1 in
    --remover) acao=remover ;;
    --verificar) acao=verificar ;;
    --destino)
      [ $# -ge 2 ] || { echo "erro: --destino exige um caminho" >&2; exit 2; }
      destino=$2
      shift
      ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "erro: opcao desconhecida: $1" >&2; exit 2 ;;
  esac
  shift
done

[ -f "$doutrina" ] || { echo "erro: doutrina nao encontrada em $doutrina" >&2; exit 1; }

remover_bloco() {
  # $1 = arquivo de entrada, $2 = arquivo de saida
  awk -v ini="$INICIO" -v fim="$FIM" '
    $0 == ini { dentro = 1; next }
    $0 == fim { dentro = 0; next }
    !dentro { print }
  ' "$1" > "$2"
}

if [ "$acao" = verificar ]; then
  echo "doutrina: $doutrina"
  echo "destino:  $destino"
  if [ -f "$destino" ] && grep -Fq "$INICIO" "$destino"; then
    echo "estado:   instalada"
    grep -F "$doutrina" "$destino" >/dev/null 2>&1 \
      && echo "caminho:  atual" \
      || echo "caminho:  desatualizado — rode sem argumentos para corrigir"
  else
    echo "estado:   ausente"
  fi
  exit 0
fi

mkdir -p "$(dirname -- "$destino")"
[ -f "$destino" ] || : > "$destino"

tmp=$(mktemp "${TMPDIR:-/tmp}/doutrina.XXXXXX")
trap 'rm -f "$tmp"' EXIT

remover_bloco "$destino" "$tmp"

if [ "$acao" = remover ]; then
  cat "$tmp" > "$destino"
  echo "removido de $destino"
  exit 0
fi

# remove linhas em branco no fim, para nao acumular a cada reinstalacao
{
  awk 'BEGIN { vazias = 0 }
       /^[[:space:]]*$/ { vazias++; next }
       { while (vazias-- > 0) print ""; vazias = 0; print }' "$tmp"
  if [ -s "$tmp" ]; then echo ""; fi
  echo "$INICIO"
  echo "# Memoria base — Doutrina de Engenharia e Arquitetura Transversal"
  echo ""
  echo "@$doutrina"
  echo "$FIM"
} > "$destino"

echo "instalada em $destino"
echo "import: @$doutrina"
