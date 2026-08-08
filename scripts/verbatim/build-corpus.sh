#!/bin/bash
# Rebuild the source corpus for measure.py.
#
#   ./build-corpus.sh                    # uses the default library path below
#   ./build-corpus.sh /path/to/2ed1993   # or point it somewhere else
#   JOBS=4 ./build-corpus.sh             # OCR four books at once (default 2)
#
# Writes corpus/gw/*.txt and corpus/fan/*.txt, one file per source. Skips
# anything already present AND NON-EMPTY, so it is resumable — safe to
# interrupt and re-run, and a failed book is retried rather than cached.
#
# GW sources are the finding. Fan compilations are a DETECTOR ONLY: they are
# clean text where GW is noisy OCR, so they catch runs OCR breaks apart. Never
# write site content from them.
#
# OMP_THREAD_LIMIT=1 is deliberate. Multi-threaded tesseract measured 13.6s a
# page against 4.4s single-threaded; its thread pool costs more than it saves.
# Parallelism belongs at the book level, via JOBS.
set -u
export OMP_THREAD_LIMIT=1
DEFAULT_SRC="$HOME/Library/CloudStorage/ProtonDrive-tom.reddington@pm.me/WH/2ed/2ed1993"
SRC="${1:-$DEFAULT_SRC}"
JOBS="${JOBS:-2}"
[ -d "$SRC" ] || { echo "not a directory: $SRC"; echo "usage: build-corpus.sh [source-library-dir]"; exit 1; }
for tool in pdftoppm pdftotext pdfinfo tesseract; do
  command -v "$tool" >/dev/null || { echo "missing $tool — brew install poppler tesseract"; exit 1; }
done
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HERE/corpus/gw" "$HERE/corpus/fan"

# Prove the OCR chain works before spending hours discovering it does not.
# The old version suppressed stderr on both stages and moved empty output into
# place, so a broken tesseract produced a corpus of zero-word files and a
# cheerful total. 8 August.
probe() {
  local pdf; pdf="$(ls "$SRC"/*.pdf 2>/dev/null | head -1)"
  [ -n "$pdf" ] || { echo "no PDFs in $SRC"; exit 1; }
  local tmp; tmp="$(mktemp -d)"
  pdftoppm -r 150 -gray -png -f 1 -l 1 "$pdf" "$tmp/probe" || { echo "pdftoppm failed"; exit 1; }
  local img; img="$(ls "$tmp"/probe-*.png 2>/dev/null | head -1)"
  [ -n "$img" ] || { echo "pdftoppm wrote no image — check poppler"; exit 1; }
  local words; words="$(tesseract "$img" - --psm 6 | wc -w | tr -d ' ')"
  rm -rf "$tmp"
  [ "${words:-0}" -gt 0 ] || { echo "tesseract read 0 words from a rendered page."
    echo "Check language data: tesseract --list-langs (needs eng)"; exit 1; }
  echo "probe: OCR chain OK (${words} words from one page)"
}

# Fan compilations — detector only.
FAN=("W40K 2nd Ed BattleBible 1.8.4" "2nd Ed Wargear" "weapons")
# Genuine text layers: extract, do not OCR. Everything else is image-only and
# carries a text layer that is unusable OCR sludge — see style-conventions.
TEXT_LAYER=("Codex Imperialis" "Angels of Death (2ed)" "White Dwarf Q&A" \
            "W40K 2nd Ed BattleBible 1.8.4" "2nd Ed Wargear" "weapons")
# Duplicate of the full book and OCRs badly.
SKIP=("Basegame Wargear book_compressed")

contains() { local n="$1"; shift; for x in "$@"; do [ "$x" = "$n" ] && return 0; done; return 1; }

one() {
  local pdf="$1" base out pages tmp img
  base="$(basename "$pdf" .pdf)"
  local dir="gw"; contains "$base" "${FAN[@]}" && dir="fan"
  out="$HERE/corpus/$dir/$(echo "$base" | tr -cd 'A-Za-z0-9').txt"
  [ -s "$out" ] && return 0

  tmp="$(mktemp -d)"
  if contains "$base" "${TEXT_LAYER[@]}"; then
    pdftotext -layout "$pdf" - > "$tmp/out.txt" 2>"$tmp/err"
  else
    pages="$(pdfinfo "$pdf" | awk '/^Pages/{print $2}')"
    : > "$tmp/out.txt"
    for p in $(seq 1 "${pages:-0}"); do
      pdftoppm -r 150 -gray -png -f "$p" -l "$p" "$pdf" "$tmp/pg" 2>>"$tmp/err"
      img="$(ls "$tmp"/pg-*.png 2>/dev/null | head -1)"
      [ -n "$img" ] && tesseract "$img" - --psm 6 2>>"$tmp/err" >> "$tmp/out.txt"
      rm -f "$tmp"/pg-*.png
    done
  fi

  local words; words="$(wc -w < "$tmp/out.txt" | tr -d ' ')"
  if [ "${words:-0}" -eq 0 ]; then
    printf '  FAILED %-42s 0 words\n' "$base"
    head -3 "$tmp/err" 2>/dev/null | sed 's/^/         /'
  else
    mv "$tmp/out.txt" "$out"
    printf '  %-8s %-42s %8s words\n' "$dir" "$base" "$words"
  fi
  rm -rf "$tmp"
}

echo "source: $SRC"
probe
echo "jobs:   $JOBS"

# Batches of JOBS, waiting for each batch. `wait -n` is bash 4+; macOS ships
# bash 3.2, so do not use it.
running=0
for pdf in "$SRC"/*.pdf; do
  [ -f "$pdf" ] || continue
  contains "$(basename "$pdf" .pdf)" "${SKIP[@]}" && continue
  one "$pdf" &
  running=$((running + 1))
  if [ "$running" -ge "$JOBS" ]; then wait; running=0; fi
done
wait

gw=$(cat "$HERE"/corpus/gw/*.txt 2>/dev/null | wc -w | tr -d ' ')
fan=$(cat "$HERE"/corpus/fan/*.txt 2>/dev/null | wc -w | tr -d ' ')
empty=$(find "$HERE/corpus" -name '*.txt' -size -1k | wc -l | tr -d ' ')
echo "corpus: $gw GW words, $fan fan words"
[ "$empty" -gt 0 ] && echo "warning: $empty corpus file(s) under 1k — re-run to retry them"
exit 0
