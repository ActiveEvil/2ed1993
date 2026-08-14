#!/bin/bash
# Add the magazine run to the corpus: White Dwarf 166-226 and Citadel Journal.
#
#   ./build-corpus-magazines.sh              # WD 166-226 plus every Citadel Journal
#   FROM=166 TO=226 ./build-corpus-magazines.sh
#   JOBS=8 ./build-corpus-magazines.sh       # default 4
#
# WD 166 is October 1993 and WD 226 October 1998, the span 2nd edition was the
# current game. Checked 13 August: none of the 111 PDFs carries a usable text
# layer, so every page is OCR'd — 10,299 pages, several hours. Resumable:
# build-corpus.sh skips any corpus file already written and non-empty, so an
# interrupted run picks up where it stopped.
#
# Symlinks are staged into a scratch directory because build-corpus.sh takes one
# source directory and the two libraries sit apart, under names it would OCR in
# full otherwise.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
WH="${WH:-$HOME/Library/CloudStorage/ProtonDrive-tom.reddington@pm.me/WH}"
FROM="${FROM:-166}"
TO="${TO:-226}"
JOBS="${JOBS:-4}"

WD="$WH/Magazine - White Dwarf"
CJ="$WH/Magazine - Citadel Journal"
for dir in "$WD" "$CJ"; do
  [ -d "$dir" ] || { echo "not a directory: $dir"; echo "set WH to the library root"; exit 1; }
done

STAGE="${TMPDIR:-/tmp}/2ed1993-magazines"
rm -rf "$STAGE"; mkdir -p "$STAGE"

wd=0
for issue in $(seq "$FROM" "$TO"); do
  for pdf in "$WD/White Dwarf #$issue"*.pdf; do
    [ -f "$pdf" ] || continue
    ln -sf "$pdf" "$STAGE/$(basename "$pdf")"
    wd=$((wd + 1))
  done
done

cj=0
for pdf in "$CJ"/*.pdf; do
  [ -f "$pdf" ] || continue
  ln -sf "$pdf" "$STAGE/$(basename "$pdf")"
  cj=$((cj + 1))
done

echo "staged: $wd White Dwarf (#$FROM-$TO), $cj Citadel Journal"
[ "$((wd + cj))" -gt 0 ] || { echo "nothing staged"; exit 1; }

JOBS="$JOBS" "$HERE/build-corpus.sh" "$STAGE"
status=$?
rm -rf "$STAGE"
exit $status
