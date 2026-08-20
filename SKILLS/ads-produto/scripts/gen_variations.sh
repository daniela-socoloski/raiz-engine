#!/usr/bin/env bash
#
# gen_variations.sh — Gera as 4 variações ANCORADAS na hero aprovada, em paralelo.
#
# A hero entra como imagem de referência (--image), então cada variação herda cena, luz,
# paleta, grade e textura. O prompt deve pedir pra mudar SÓ o ângulo/enquadramento.
#
# Uso:
#   gen_variations.sh <hero_png> <prompts_file> <out_dir> [names_csv]
#
# prompts_file: 1 linha por variação (# = comentário), na ordem de names_csv.
# names_csv default: 01-hook,02-reveal,03-detail,04-action
# Saída: <name>.png em <out_dir>.
#
# Env: IMG_MODEL=nano_banana_flash  RESOLUTION=2k  WAIT_TIMEOUT=10m

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

HERO="${1:?uso: gen_variations.sh <hero_png> <prompts_file> <out_dir> [names_csv]}"
PROMPTS_FILE="${2:?uso: gen_variations.sh <hero_png> <prompts_file> <out_dir> [names_csv]}"
OUT_DIR="${3:?uso: gen_variations.sh <hero_png> <prompts_file> <out_dir> [names_csv]}"
NAMES_CSV="${4:-01-hook,02-reveal,03-detail,04-action}"

IMG_MODEL="${IMG_MODEL:-nano_banana_flash}"
RESOLUTION="${RESOLUTION:-2k}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-10m}"

[[ -f "$HERO" ]] || { echo "ERRO: hero não encontrada: $HERO" >&2; exit 1; }
mkdir -p "$OUT_DIR"

IFS=',' read -ra NAMES <<< "$NAMES_CSV"
read_prompts "$PROMPTS_FILE"

if [[ "${#PROMPTS[@]}" -ne "${#NAMES[@]}" ]]; then
  echo "ERRO: esperava ${#NAMES[@]} prompts (${NAMES_CSV}), recebi ${#PROMPTS[@]}" >&2
  exit 1
fi

gen_one() {
  local name="$1" prompt="$2"
  local out="$OUT_DIR/$name.png" log="$OUT_DIR/$name.log"

  if already_done "$out"; then
    echo "[$name] já existe, pulando" >&2
    return 0
  fi

  echo "[$name] gerando (ancorado na hero)..." >&2
  local resp
  if ! resp=$(higgsfield generate create "$IMG_MODEL" \
        --prompt "$prompt" \
        --image "$HERO" \
        --aspect_ratio 9:16 \
        --resolution "$RESOLUTION" \
        --wait --wait-timeout "$WAIT_TIMEOUT" \
        --json 2>"$log"); then
    echo "[$name] FALHOU na geração — veja $log" >&2
    return 1
  fi

  local url
  url=$(extract_url "$resp")
  if [[ -z "$url" ]]; then
    echo "$resp" > "$log"
    echo "[$name] FALHOU — resposta sem URL. JSON em $log" >&2
    return 1
  fi

  if ! download_to "$url" "$out"; then
    echo "[$name] download falhou de $url" >&2
    return 1
  fi

  rm -f "$log"
  echo "[$name] pronto → $out" >&2
}

PIDS=()
for i in "${!NAMES[@]}"; do
  gen_one "${NAMES[$i]}" "${PROMPTS[$i]}" &
  PIDS+=($!)
done

FAILED=0
for pid in "${PIDS[@]}"; do
  wait "$pid" || FAILED=$((FAILED+1))
done

if [[ $FAILED -gt 0 ]]; then
  echo "$FAILED variação(ões) falharam. Confira os .log em $OUT_DIR" >&2
  exit 1
fi

echo "${#NAMES[@]} variações geradas em $OUT_DIR (+ 05-hero.png deve estar lá)" >&2
