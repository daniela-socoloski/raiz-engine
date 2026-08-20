#!/usr/bin/env bash
#
# stitch.sh — Monta os takes num ad vertical com duração EXATA (default 15s).
#
# Uso:
#   stitch.sh <takes_dir> <saida_mp4> [order_csv] [target_seconds]
#
# order_csv default:      01-hook,02-reveal,03-detail,04-action,05-hero
# target_seconds default: 15
#
# O Seedance entrega takes de 5s; 5 takes = 25s. Este script corta cada take pra
# TARGET/N segundos (5 takes -> 3.0s cada) e concatena, fechando o alvo na bala.
#
# Qual pedaço de cada take sobrevive é escolhido pelo ANCHOR:
#   start   — os primeiros N segundos (a energia inicial do movimento)
#   middle  — o miolo, descartando entrada e saída
#   end     — os últimos N segundos (onde o movimento resolve e assenta)  [default]
#
# Env:
#   ANCHOR=end                     âncora global do corte
#   ANCHOR_OVERRIDES="01-hook:start,03-detail:middle"   exceções por take
#   CRF=16                         qualidade do corte (16 = visualmente sem perda)
#   FPS=                           força um fps comum (ex. 24). Vazio = mantém o original.
#   KEEP_TRIMS=0                   1 = mantém os trechos cortados em <out_dir>/_trims

set -euo pipefail

TAKES_DIR="${1:?uso: stitch.sh <takes_dir> <saida_mp4> [order_csv] [target_seconds]}"
OUT="${2:?uso: stitch.sh <takes_dir> <saida_mp4> [order_csv] [target_seconds]}"
ORDER_CSV="${3:-01-hook,02-reveal,03-detail,04-action,05-hero}"
TARGET="${4:-15}"

ANCHOR="${ANCHOR:-end}"
ANCHOR_OVERRIDES="${ANCHOR_OVERRIDES:-}"
CRF="${CRF:-16}"
FPS="${FPS:-}"
KEEP_TRIMS="${KEEP_TRIMS:-0}"

[[ -d "$TAKES_DIR" ]] || { echo "ERRO: pasta de takes não encontrada: $TAKES_DIR" >&2; exit 1; }
mkdir -p "$(dirname "$OUT")"

IFS=',' read -ra ORDER <<< "$ORDER_CSV"
N=${#ORDER[@]}
[[ $N -gt 0 ]] || { echo "ERRO: order_csv vazio" >&2; exit 1; }

# Fatia por take, com 3 casas — usada só para posicionar o corte (-ss).
SLICE=$(awk -v t="$TARGET" -v n="$N" 'BEGIN{printf "%.3f", t/n}')

# O corte é feito por CONTAGEM DE FRAMES, não por tempo: cortar com -t deixa o ffmpeg
# fechar um frame antes, e o erro se acumula (5 takes = 5 frames = ~0.2s a menos).
# Frames por take = round(TARGET * fps / N), garantindo soma exata no alvo.
FIRST_CLIP="$TAKES_DIR/${ORDER[0]}.mp4"
[[ -f "$FIRST_CLIP" ]] || { echo "ERRO: take faltando: $FIRST_CLIP" >&2; exit 1; }
SRC_FPS_R=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$FIRST_CLIP")
FPS=${FPS:-$(awk -F/ '{ if (NF==2 && $2>0) printf "%.6f", $1/$2; else printf "%.6f", $1 }' <<< "$SRC_FPS_R")}
TOTAL_FRAMES=$(awk -v t="$TARGET" -v f="$FPS" 'BEGIN{printf "%d", int(t*f + 0.5)}')
FRAMES_PER=$(awk -v tf="$TOTAL_FRAMES" -v n="$N" 'BEGIN{printf "%d", int(tf/n + 0.5)}')
# Distribui o resto (quando TOTAL_FRAMES não divide por N) nos primeiros takes.
REMAINDER=$((TOTAL_FRAMES - FRAMES_PER * N))

echo "fps=$FPS | alvo=${TOTAL_FRAMES} frames | ${FRAMES_PER} frames por take (+${REMAINDER} distribuídos)" >&2

TRIMDIR="$(dirname "$OUT")/_trims"
mkdir -p "$TRIMDIR"
TRIMS=()
cleanup() { [[ "$KEEP_TRIMS" == "1" ]] || rm -rf "$TRIMDIR"; }
trap cleanup EXIT

anchor_for() {
  local name="$1" pair
  IFS=',' read -ra PAIRS <<< "$ANCHOR_OVERRIDES"
  for pair in "${PAIRS[@]:-}"; do
    [[ -z "$pair" ]] && continue
    if [[ "${pair%%:*}" == "$name" ]]; then echo "${pair##*:}"; return; fi
  done
  echo "$ANCHOR"
}

echo "Alvo: ${TARGET}s em $N takes → ${SLICE}s por take" >&2
echo >&2

IDX=0
for name in "${ORDER[@]}"; do
  clip="$TAKES_DIR/$name.mp4"
  # Os primeiros REMAINDER takes levam 1 frame extra, fechando o total exato.
  NF_THIS=$FRAMES_PER
  [[ $IDX -lt $REMAINDER ]] && NF_THIS=$((FRAMES_PER + 1))
  IDX=$((IDX + 1))
  [[ -f "$clip" ]] || { echo "ERRO: take faltando: $clip" >&2; exit 1; }

  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$clip")
  if awk -v d="$dur" -v s="$SLICE" 'BEGIN{exit !(d < s - 0.05)}'; then
    echo "ERRO: $name tem ${dur}s, menor que a fatia de ${SLICE}s. Regere esse take mais longo." >&2
    exit 1
  fi

  # Posiciona o corte pela contagem de frames da ORIGEM, não pela duração em segundos.
  # Com anchor=end, calcular ss por tempo cai exatamente no último frame e o ffmpeg
  # acaba lendo um frame a menos. Meio frame de folga elimina esse off-by-one.
  SRC_FRAMES=$(ffprobe -v error -count_frames -select_streams v:0 \
    -show_entries stream=nb_read_frames -of default=nk=1:nw=1 "$clip")
  if [[ "$SRC_FRAMES" -lt "$NF_THIS" ]]; then
    echo "ERRO: $name tem $SRC_FRAMES frames, menos que os $NF_THIS necessários." >&2
    exit 1
  fi

  a=$(anchor_for "$name")
  case "$a" in
    start)  start_frame=0 ;;
    middle) start_frame=$(( (SRC_FRAMES - NF_THIS) / 2 )) ;;
    end)    start_frame=$(( SRC_FRAMES - NF_THIS )) ;;
    *) echo "ERRO: ANCHOR inválido para $name: $a (use start|middle|end)" >&2; exit 1 ;;
  esac
  ss=$(awk -v sf="$start_frame" -v f="$FPS" 'BEGIN{ v=(sf-0.5)/f; if (v<0) v=0; printf "%.4f", v }')

  printf "  %-12s %ss → %s frames  (anchor=%s, corte em %ss)\n" "$name" "$dur" "$NF_THIS" "$a" "$ss" >&2

  trim="$TRIMDIR/$name.mp4"
  # Re-encode uniforme com contagem de frames exata: garante que a soma feche o alvo
  # e que os parâmetros batam entre os trechos, deixando o concat seguinte ser -c copy.
  ffmpeg -y -loglevel error -ss "$ss" -i "$clip" -frames:v "$NF_THIS" \
    -r "$FPS" \
    -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p \
    -video_track_timescale 90000 -an "$trim"

  TRIMS+=("$trim")
done

echo >&2
echo "Concatenando (filtro concat, preserva a contagem de frames)..." >&2
# O demuxer concat com -c copy descarta um frame em cada emenda; o filtro concat não.
INPUTS=(); FILTER=""
for i in "${!TRIMS[@]}"; do
  INPUTS+=(-i "${TRIMS[$i]}")
  FILTER+="[$i:v]"
done
FILTER+="concat=n=${#TRIMS[@]}:v=1:a=0[out]"

ffmpeg -y -loglevel error "${INPUTS[@]}" \
  -filter_complex "$FILTER" -map "[out]" \
  -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p \
  -r "$FPS" -movflags +faststart -an "$OUT"

DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT")
RES=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUT")
CODEC=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$OUT")
RFPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)

echo >&2
echo "Ad final: $OUT" >&2
echo "Duração: ${DUR}s (alvo ${TARGET}s) | Resolução: $RES | Codec: $CODEC @ $RFPS | Tamanho: $SIZE" >&2

if awk -v d="$DUR" -v t="$TARGET" 'BEGIN{exit !((d-t)>0.15 || (t-d)>0.15)}'; then
  echo "AVISO: duração final desviou mais de 0.15s do alvo." >&2
fi
