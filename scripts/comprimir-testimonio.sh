#!/usr/bin/env bash
# Comprime un video a MP4 (H.264) listo para Testimonios.
#
# Uso:
#   ./scripts/comprimir-testimonio.sh ~/Downloads/entrevista.mov
#   ./scripts/comprimir-testimonio.sh ~/Downloads/entrevista.mov damian-dreizik
#   ./scripts/comprimir-testimonio.sh ~/Downloads/entrevista.mov damian-dreizik --light
#   ./scripts/comprimir-testimonio.sh ~/Downloads/entrevista.mov damian-dreizik --hq
#
# Salida por defecto: static/img/testimonios/<nombre>.mp4
# Requiere: ffmpeg (brew install ffmpeg)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT}/static/img/testimonios"

CRF=23
SCALE=1280
AUDIO_BR="128k"
PRESET="slow"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/comprimir-testimonio.sh <entrada> [nombre-salida] [--light|--hq]

Ejemplos:
  ./scripts/comprimir-testimonio.sh ~/Desktop/pablo.mov
  ./scripts/comprimir-testimonio.sh ~/Desktop/pablo.mov pablo-messiez
  ./scripts/comprimir-testimonio.sh ~/Desktop/pablo.mov pablo-messiez --light

Opciones:
  --light   Más liviano (CRF 28, ancho máx. 960)
  --hq      Más calidad / más peso (CRF 20, ancho máx. 1920)

Sin nombre-salida, usa el nombre del archivo de entrada (sin extensión),
convertido a slug (minúsculas, guiones, sin espacios).
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  usage
  exit 0
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Error: no está instalado ffmpeg."
  echo "Instalalo con: brew install ffmpeg"
  exit 1
fi

INPUT="$1"
shift

if [[ ! -f "$INPUT" ]]; then
  echo "Error: no encuentro el archivo: $INPUT"
  exit 1
fi

SLUG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --light)
      CRF=28
      SCALE=960
      AUDIO_BR="96k"
      PRESET="medium"
      ;;
    --hq)
      CRF=20
      SCALE=1920
      AUDIO_BR="160k"
      PRESET="slow"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Error: opción desconocida: $1"
      usage
      exit 1
      ;;
    *)
      if [[ -n "$SLUG" ]]; then
        echo "Error: solo un nombre de salida."
        exit 1
      fi
      SLUG="$1"
      ;;
  esac
  shift
done

if [[ -z "$SLUG" ]]; then
  BASE="$(basename "$INPUT")"
  BASE="${BASE%.*}"
  SLUG="$(printf '%s' "$BASE" \
    | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"
fi

# Normalizar slug si el usuario pasó espacios o mayúsculas
SLUG="$(printf '%s' "$SLUG" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"

if [[ -z "$SLUG" ]]; then
  echo "Error: no pude generar un nombre de salida válido."
  exit 1
fi

mkdir -p "$OUT_DIR"
OUTPUT="${OUT_DIR}/${SLUG}.mp4"

if [[ -f "$OUTPUT" ]]; then
  echo "Ya existe: $OUTPUT"
  read -r -p "¿Sobrescribir? [y/N] " ANSWER
  case "$ANSWER" in
    y|Y|yes|YES) ;;
    *)
      echo "Cancelado."
      exit 1
      ;;
  esac
fi

echo "Entrada : $INPUT"
echo "Salida  : $OUTPUT"
echo "Perfil  : CRF=${CRF} · ancho máx. ${SCALE} · audio ${AUDIO_BR} · preset ${PRESET}"
echo

ffmpeg -y -i "$INPUT" \
  -c:v libx264 -preset "$PRESET" -crf "$CRF" \
  -vf "scale='min(${SCALE},iw)':-2" \
  -c:a aac -b:a "$AUDIO_BR" \
  -movflags +faststart \
  "$OUTPUT"

BYTES=$(wc -c < "$OUTPUT" | tr -d ' ')
MB=$(awk -v b="$BYTES" 'BEGIN { printf "%.1f", b/1024/1024 }')

echo
echo "Listo: $OUTPUT (${MB} MB)"
echo
echo "En la ficha Markdown usá:"
echo "video:"
echo "  titulo: \"Nombre — testimonio\""
echo "  src: \"/img/testimonios/${SLUG}.mp4\""
