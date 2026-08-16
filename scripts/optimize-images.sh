#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")
OUTPUT_DIR="$PROJECT_DIR/assets/images/optimized"
CWEBP_BIN=${CWEBP_BIN:-}

if [ -z "$CWEBP_BIN" ]; then
  CWEBP_BIN=$(command -v cwebp || true)
fi

if [ -z "$CWEBP_BIN" ] || [ ! -x "$CWEBP_BIN" ]; then
  echo "cwebp non trovato: imposta CWEBP_BIN con il percorso corretto." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR/team"

encode() {
  input=$1
  output=$2
  width=$3
  quality=$4
  "$CWEBP_BIN" -quiet -mt -m 6 -q "$quality" -resize "$width" 0 "$PROJECT_DIR/$input" -o "$PROJECT_DIR/$output"
}

encode assets/images/webp/logo-new.webp assets/images/optimized/logo-96.webp 96 80
encode assets/images/home.webp assets/images/optimized/home-640.webp 640 78
encode assets/images/home.webp assets/images/optimized/home-1280.webp 1280 78
encode assets/images/rosy-ornella.webp assets/images/optimized/rosy-ornella-640.webp 640 78
encode assets/images/rosy-ornella.webp assets/images/optimized/rosy-ornella-960.webp 960 78
encode assets/images/vane-france.webp assets/images/optimized/vane-france-640.webp 640 78
encode assets/images/webp/homePotrait.webp assets/images/optimized/home-portrait-640.webp 640 78
encode assets/images/webp/homePotrait.webp assets/images/optimized/home-portrait-960.webp 960 78
encode assets/images/webp/img_2391.webp assets/images/optimized/testimonianze-640.webp 640 78
encode assets/images/webp/img_2391.webp assets/images/optimized/testimonianze-960.webp 960 78
encode assets/images/app.png assets/images/optimized/app-379.webp 379 80

for name in manuela rosamaria ornella francesca vanessa mariaG maria; do
  encode "assets/images/team/$name.webp" "assets/images/optimized/team/$name-260.webp" 260 78
  encode "assets/images/team/$name.webp" "assets/images/optimized/team/$name-520.webp" 520 78
done

echo "Immagini responsive generate in assets/images/optimized/."
