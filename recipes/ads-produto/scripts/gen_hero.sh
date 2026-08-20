#!/usr/bin/env bash
#
# gen_hero.sh — Gera a HERO da campanha a partir da foto de celular do produto.
#
# Uso:
#   gen_hero.sh <foto_original> <prompt_file> <saida_png>
#
# A hero é a âncora visual de todo o resto: as 4 variações são geradas A PARTIR dela.
# Por isso aqui vale a resolução mais alta e o modelo mais forte.
#
# Env (com defaults):
#   IMG_MODEL=nano_banana_flash   modelo de imagem (Nano Banana 2)
#   RESOLUTION=2k             resolução da hero
#   WAIT_TIMEOUT=10m

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

INPUT="${1:?uso: gen_hero.sh <foto_original> <prompt_file> <saida_png>}"
PROMPT_FILE="${2:?uso: gen_hero.sh <foto_original> <prompt_file> <saida_png>}"
OUT="${3:?uso: gen_hero.sh <foto_original> <prompt_file> <saida_png>}"

IMG_MODEL="${IMG_MODEL:-nano_banana_flash}"
RESOLUTION="${RESOLUTION:-2k}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-10m}"

[[ -f "$INPUT" ]] || { echo "ERRO: foto não encontrada: $INPUT" >&2; exit 1; }
read_prompts "$PROMPT_FILE"
PROMPT="${PROMPTS[*]}"

mkdir -p "$(dirname "$OUT")"
LOG="${OUT%.png}.log"

echo "[hero] gerando com $IMG_MODEL a partir de $(basename "$INPUT") ..." >&2

if ! resp=$(higgsfield generate create "$IMG_MODEL" \
      --prompt "$PROMPT" \
      --image "$INPUT" \
      --aspect_ratio 9:16 \
      --resolution "$RESOLUTION" \
      --wait --wait-timeout "$WAIT_TIMEOUT" \
      --json 2>"$LOG"); then
  echo "[hero] FALHOU na geração — veja $LOG" >&2
  exit 1
fi

url=$(extract_url "$resp")
if [[ -z "$url" ]]; then
  echo "$resp" > "$LOG"
  echo "[hero] FALHOU — resposta sem URL. JSON salvo em $LOG" >&2
  exit 1
fi

if ! download_to "$url" "$OUT"; then
  echo "[hero] download falhou de $url" >&2
  exit 1
fi

rm -f "$LOG"
echo "[hero] pronto → $OUT" >&2
