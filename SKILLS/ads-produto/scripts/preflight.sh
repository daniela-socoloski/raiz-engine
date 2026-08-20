#!/usr/bin/env bash
#
# preflight.sh — Confere que tudo que o pipeline precisa está no lugar ANTES de gastar crédito.
#
# Uso: preflight.sh [pasta_de_trabalho]
#
# Checa: higgsfield logado, ffmpeg, ffprobe, jq, curl, e a foto em input/.
# Sai com código != 0 na primeira falha, com uma mensagem que diz o que fazer.

set -uo pipefail

WORKDIR="${1:-.}"
FAIL=0

need() {
  local bin="$1" fix="$2"
  if command -v "$bin" >/dev/null 2>&1; then
    echo "  ok    $bin"
  else
    echo "  FALTA $bin  →  $fix"
    FAIL=1
  fi
}

echo "Ferramentas:"
need higgsfield "instale o Higgsfield CLI"
need ffmpeg     "brew install ffmpeg"
need ffprobe    "brew install ffmpeg"
need jq         "brew install jq"
need curl       "já vem no macOS; PATH quebrado?"

echo
echo "Higgsfield:"
if command -v higgsfield >/dev/null 2>&1; then
  if acct=$(higgsfield account status 2>&1); then
    echo "$acct" | sed 's/^/  /'
  else
    echo "  NÃO LOGADO  →  rode: higgsfield auth login"
    FAIL=1
  fi
fi

echo
echo "Foto de entrada ($WORKDIR/input):"
mkdir -p "$WORKDIR/input" "$WORKDIR/output"
shopt -s nullglob nocaseglob
PHOTOS=("$WORKDIR"/input/*.jpg "$WORKDIR"/input/*.jpeg "$WORKDIR"/input/*.png "$WORKDIR"/input/*.heic "$WORKDIR"/input/*.webp)
shopt -u nullglob nocaseglob

if [[ ${#PHOTOS[@]} -eq 0 ]]; then
  echo "  VAZIO  →  coloque 1 foto do produto em $WORKDIR/input/"
  FAIL=1
else
  for p in "${PHOTOS[@]}"; do
    dim=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$p" 2>/dev/null || echo "?")
    echo "  ok    $(basename "$p")  ($dim)"
  done
  [[ ${#PHOTOS[@]} -gt 1 ]] && echo "  NOTA: mais de uma foto — pergunte ao usuário qual usar."
fi

echo
if [[ $FAIL -eq 0 ]]; then
  echo "Preflight OK — pode gerar."
else
  echo "Preflight FALHOU — resolva os itens acima antes de gerar."
fi
exit $FAIL
