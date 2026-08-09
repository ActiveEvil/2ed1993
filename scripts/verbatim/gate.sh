#!/bin/bash
# Verbatim gate: dump the live texts, measure against the corpus, fail on any
# unexempt run. Safe to run from anywhere; paths resolve relative to this file.
#
#   bash scripts/verbatim/gate.sh
#
# Exit 0: clean (exempt rows still print — that is the intended shape).
# Exit 1: an unexempt run survives, or the corpus/dump is missing.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
python3 "$HERE/dump-texts.py"
python3 "$HERE/measure.py" "$HERE/texts.json" --gate
