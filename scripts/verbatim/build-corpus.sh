#!/bin/bash
# Rebuild the source corpus for measure.py.
#
#   ./build-corpus.sh                    # uses the default library path below
#   ./build-corpus.sh /path/to/2ed1993   # or point it somewhere else
#
# Writes corpus/gw/*.txt and corpus/fan/*.txt, one file per source. Skips
# anything already present, so it is resumable — safe to interrupt and re-run.
#
# GW sources are the finding. Fan compilations are a DETECTOR ONLY: they are
# clean text where GW is noisy OCR, so they catch runs OCR breaks apart. Never
# write site content from them.
set -u
DEFAULT_SRC="$HOME/Library/CloudStorage/ProtonDrive-tom.reddington@pm.me/WH/2ed/2ed1993"
SRC="${1:-$DEFAULT_SRC}"
[ -d "$SRC" ] || { echo "not a directory: $SRC"; echo "usage: build-corpus.sh [source-library-dir]"; exit 1; }
for tool in pdftoppm pdftotext tesseract; do
  command -v "$tool" >/dev/null || { echo "missing $tool — brew install poppler tesseract"; exit 1; }
done
echo "source: $SRC"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HERE/corpus/gw" "$HERE/corpus/fan"

# Fan compilations — detector only.
FAN=("W40K 2nd Ed BattleBible 1.8.4" "2nd Ed Wargear" "weapons")
# Genuine text layers: extract, do not OCR. Everything else is image-only and
# carries a text layer that is unusable OCR sludge — see style-conventions.
TEXT_LAYER=("Codex Imperialis" "Angels of Death (2ed)" "White Dwarf Q&A" \
            "W40K 2nd Ed BattleBible 1.8.4" "2nd Ed Wargear" "weapons")
# Duplicate of the full book and OCRs badly.
SKIP=("Basegame Wargear book_compressed")

contains() { local n="$1"; shift; for x in "$@"; do [ "$x" = "$n" ] && return 0; done; return 1; }

for pdf in "$SRC"/*.pdf; do
  [ -f "$pdf" ] || continue
  base="$(basename "$pdf" .pdf)"
  contains "$base" "${SKIP[@]}" && continue
  dir="gw"; contains "$base" "${FAN[@]}" && dir="fan"
  out="$HERE/corpus/$dir/$(echo "$base" | tr -cd 'A-Za-z0-9').txt"
  [ -f "$out" ] && continue

  if contains "$base" "${TEXT_LAYER[@]}"; then
    echo "text  $base"
    pdftotext -layout "$pdf" - 2>/dev/null > "$out.tmp"
  else
    pages="$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages/{print $2}')"
    echo "ocr   $base (${pages:-?}pp)"
    : > "$out.tmp"
    for p in $(seq 1 "${pages:-0}"); do
      pdftoppm -r 150 -gray -png -f "$p" -l "$p" "$pdf" "/tmp/vb$$" 2>/dev/null
      for img in /tmp/vb$$-*.png; do
        [ -f "$img" ] && tesseract "$img" - --psm 6 2>/dev/null >> "$out.tmp"
      done
      rm -f /tmp/vb$$-*.png
    done
  fi
  mv "$out.tmp" "$out"
done
echo "corpus: $(cat "$HERE"/corpus/gw/*.txt 2>/dev/null | wc -w) GW words, $(cat "$HERE"/corpus/fan/*.txt 2>/dev/null | wc -w) fan words"
