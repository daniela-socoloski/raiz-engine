#!/usr/bin/env bash
#
# gen_takes.sh — Anima os 5 frames em 5 takes via Seedance 2.0, em paralelo.
#
# Uso:
#   gen_takes.sh <frames_dir> <movimento_file> <out_dir> [names_csv]
#
# Espera em <frames_dir>: 01-hook.png 02-reveal.png 03-detail.png 04-action.png 05-hero.png
# movimento_file: 1 linha por frame (# = comentário), na ordem de names_csv.
#                 Cada linha descreve só o MOVIMENTO — a cena já está no frame.
# Saída: <name>.mp4 em <out_dir>.
#
# Env (com defaults):
#   VID_MODEL=seedance_2_0   modelo de vídeo
#   DURATION=5               segundos por take (o stitch.sh corta pra fechar 15s exatos)
#   RESOLUTION=1080p         480p | 720p | 1080p | 4k
#   MODE=std                 std | fast
#   BITRATE_MODE=high        standard | high
#   GENRE=auto               auto | action | horror | comedy | noir | drama | epic
#   AUDIO=false              Seedance gera áudio por padrão; pro ad mudo mantenha false
#   WAIT_TIMEOUT=20m

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

FRAMES_DIR="${1:?uso: gen_takes.sh <frames_dir> <movimento_file> <out_dir> [names_csv]}"
MOV_FILE="${2:?uso: gen_takes.sh <frames_dir> <movimento_file> <out_dir> [names_csv]}"
OUT_DIR="${3:?uso: gen_takes.sh <frames_dir> <movimento_file> <out_dir> [names_csv]}"
NAMES_CSV="${4:-01-hook,02-reveal,03-detail,04-action,05-hero}"

VID_MODEL="${VID_MODEL:-seedance_2_0}"
DURATION="${DURATION:-5}"
RESOLUTION="${RESOLUTION:-1080p}"
MODE="${MODE:-std}"
BITRATE_MODE="${BITRATE_MODE:-high}"
GENRE="${GENRE:-auto}"
AUDIO="${AUDIO:-false}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-20m}"

[[ -d "$FRAMES_DIR" ]] || { echo "ERRO: pasta de frames não encontrada: $FRAMES_DIR" >&2; exit 1; }
mkdir -p "$OUT_DIR"

IFS=',' read -ra NAMES <<< "$NAMES_CSV"
read_prompts "$MOV_FILE"

if [[ "${#PROMPTS[@]}" -ne "${#NAMES[@]}" ]]; then
  echo "ERRO: esperava ${#NAMES[@]} linhas de movimento, recebi ${#PROMPTS[@]}" >&2
  exit 1
fi

# Confere que todos os frames existem ANTES de gastar crédito em qualquer um.
for name in "${NAMES[@]}"; do
  [[ -f "$FRAMES_DIR/$name.png" ]] || { echo "ERRO: frame faltando: $FRAMES_DIR/$name.png" >&2; exit 1; }
done

anim_one() {
  local name="$1" prompt="$2"
  local frame="$FRAMES_DIR/$name.png"
  local out="$OUT_DIR/$name.mp4" log="$OUT_DIR/$name.log"

  if already_done "$out" 50000; then
    echo "[$name] já existe, pulando" >&2
    return 0
  fi

  echo "[$name] animando ${DURATION}s em $RESOLUTION ($VID_MODEL)..." >&2
  local resp
  if ! resp=$(higgsfield generate create "$VID_MODEL" \
        --prompt "$prompt" \
        --image "$frame" \
        --aspect_ratio 9:16 \
        --duration "$DURATION" \
        --resolution "$RESOLUTION" \
        --mode "$MODE" \
        --bitrate_mode "$BITRATE_MODE" \
        --genre "$GENRE" \
        --generate_audio "$AUDIO" \
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
  local dur
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$out" 2>/dev/null || echo "?")
  echo "[$name] pronto → $out (${dur}s)" >&2
}

PIDS=()
for i in "${!NAMES[@]}"; do
  anim_one "${NAMES[$i]}" "${PROMPTS[$i]}" &
  PIDS+=($!)
done

FAILED=0
for pid in "${PIDS[@]}"; do
  wait "$pid" || FAILED=$((FAILED+1))
done

if [[ $FAILED -gt 0 ]]; then
  echo "$FAILED take(s) falharam. Confira os .log em $OUT_DIR" >&2
  exit 1
fi

echo "Todos os ${#NAMES[@]} takes gerados em $OUT_DIR" >&2
