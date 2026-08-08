#!/usr/bin/env python3
"""Common-word-run check between site text and the source library.

The site's standing rule is "mechanics exact, expression new". This measures
compliance: for each stored text, EVERY run of consecutive words at or over the
threshold that it shares with any source — not merely the longest. See
claude/style-conventions.md and claude/verbatim-audit-2026-08-08.md.

  python3 measure.py texts.json                 # audit, ranked worst first
  python3 measure.py texts.json --gate          # exit 1 if anything unexempt fails
  python3 measure.py texts.json --only weapon   # one kind

Corpus lives in corpus/gw and corpus/fan as .txt. GW is the finding; fan
compilations are a DETECTOR ONLY and never a source to write from — they are
clean text where GW is noisy OCR, so they catch runs OCR breaks apart.
"""
import argparse, itertools, json, os, re, sys

THRESHOLD = 8
NGRAM = 5
HERE = os.path.dirname(os.path.abspath(__file__))


BLOCKQUOTES_STRIPPED = 0


def words(text):
    """Tokenise, dropping markup — and attributed quotations entirely.

    A <blockquote> on this site is verbatim source text BY INTENTION, always
    closed by a <p class="credit"> naming the authors. Measuring it would flag
    deliberate, credited quotation; exempting whole texts instead would hide any
    real copying elsewhere in the same rule. The count is logged so stripping
    cannot quietly grow."""
    global BLOCKQUOTES_STRIPPED
    text, stripped = re.subn(r"<blockquote\b.*?</blockquote>", " ", text,
                             flags=re.S | re.I)
    BLOCKQUOTES_STRIPPED += stripped
    text = re.sub(r"<[^>]+>", " ", text)
    for entity, char in (("&apos;", "'"), ("&mdash;", " "), ("&ndash;", " "),
                         ("&quot;", '"'), ("&amp;", "&"), ("&deg;", " ")):
        text = text.replace(entity, char)
    return re.findall(r"[a-z0-9+\-']+", text.lower())


class Corpus:
    def __init__(self, directory, formulas=()):
        self.tokens, self.spans = [], []
        for name in sorted(os.listdir(directory)) if os.path.isdir(directory) else []:
            if not name.endswith(".txt"):
                continue
            with open(os.path.join(directory, name), encoding="utf-8", errors="ignore") as handle:
                chunk = mask(words(handle.read()), formulas)
            self.spans.append((len(self.tokens), len(self.tokens) + len(chunk), name[:-4]))
            self.tokens += chunk
        self.index = {}
        for i in range(len(self.tokens) - NGRAM + 1):
            self.index.setdefault(tuple(self.tokens[i:i + NGRAM]), []).append(i)

    def source(self, position):
        for start, end, name in self.spans:
            if start <= position < end:
                return name
        return "-"

    def _match_at(self, draft, i):
        """Longest corpus run starting at draft position i, and where it sits."""
        best, at = 0, -1
        for j in self.index.get(tuple(draft[i:i + NGRAM]), ()):
            length = NGRAM
            while (i + length < len(draft) and j + length < len(self.tokens)
                   and draft[i + length] == self.tokens[j + length]):
                length += 1
            if length > best:
                best, at = length, j
        return best, at

    def longest_run(self, draft):
        best, at = 0, -1
        for i in range(len(draft) - NGRAM + 1):
            length, j = self._match_at(draft, i)
            if length > best:
                best, at = length, j
        if at < 0:
            return 0, "-", ""
        return best, self.source(at), " ".join(self.tokens[at:at + best])

    def runs_over(self, draft, threshold):
        """Every run at or over threshold, left to right, non-overlapping.

        Reporting only the longest run per text is how a patched text passes
        while still carrying copied spans: fixing the worst run of 10 left
        Cyclone Missile Launcher with three more at 8, 9 and 10, one of them in
        a chart cell nobody had looked at. 8 August."""
        found, i = [], 0
        while i <= len(draft) - NGRAM:
            length, j = self._match_at(draft, i)
            if length >= threshold:
                found.append((length, self.source(j),
                              " ".join(self.tokens[j:j + length])))
                i += length
            else:
                i += 1
        return found


def load_exemptions():
    path = os.path.join(HERE, "exemptions.json")
    if not os.path.exists(path):
        return [], {}
    data = json.load(open(path, encoding="utf-8"))
    formulas = [tuple(f.split()) for f in data.get("formulas", [])]
    texts = {(e["kind"], e["name"]): e["reason"] for e in data.get("texts", [])}
    return formulas, texts


_sentinel = itertools.count()


def mask(tokens, formulas):
    """Blank out mechanical formulas so a run made only of them cannot score.

    Sentinels come from a process-wide counter, never a per-call one: two masked
    spans must not match each other, in the same stream or across streams."""
    out, i = list(tokens), 0
    while i < len(out):
        for phrase in formulas:
            if tuple(tokens[i:i + len(phrase)]) == phrase:
                for k in range(len(phrase)):
                    out[i + k] = "\x00%d" % next(_sentinel)
                i += len(phrase) - 1
                break
        i += 1
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("texts", help='JSON: [{"k": kind, "n": name, "t": text}, ...]')
    parser.add_argument("--gate", action="store_true", help="exit 1 on any unexempt failure")
    parser.add_argument("--only", help="filter by kind prefix")
    parser.add_argument("--threshold", type=int, default=THRESHOLD)
    args = parser.parse_args()

    rows = json.load(open(args.texts, encoding="utf-8"))
    if isinstance(rows, dict):
        rows = rows["texts"]
    if args.only:
        rows = [r for r in rows if r["k"].startswith(args.only)]

    formulas, exempt = load_exemptions()
    gw = Corpus(os.path.join(HERE, "corpus", "gw"), formulas)
    fan = Corpus(os.path.join(HERE, "corpus", "fan"), formulas)
    if not gw.tokens:
        sys.exit("corpus/gw is empty — run build-corpus.sh first")

    results = []
    for row in rows:
        draft = mask(words(row["t"]), formulas)
        runs = ([("gw",) + r for r in gw.runs_over(draft, args.threshold)]
                + [("fan",) + r for r in fan.runs_over(draft, args.threshold)])
        runs.sort(key=lambda r: -r[1])
        worst = runs[0][1] if runs else 0
        results.append((worst, row["k"], row["n"], len(draft), runs))
    results.sort(reverse=True, key=lambda r: (r[0], r[1], r[2]))

    print(f"gw corpus {len(gw.tokens):,}w over {len(gw.spans)} sources | "
          f"fan corpus {len(fan.tokens):,}w over {len(fan.spans)} sources")
    print(f"{len(results)} texts, {sum(r[3] for r in results):,} words, threshold {args.threshold}\n")

    failures, total_runs = [], 0
    for worst, kind, name, length, runs in results:
        if not runs:
            continue
        reason = exempt.get((kind, name))
        mark = f"exempt: {reason}" if reason else "FAIL"
        if not reason:
            failures.append((kind, name))
            total_runs += len(runs)
        plural = "" if len(runs) == 1 else f", {len(runs)} runs"
        print(f"  worst {worst:3}  {kind:20} {name[:30]:30} {mark}{plural}")
        if not reason:
            # Every run, not just the worst: a text is only clean when they all go.
            for which, n, src, run in runs:
                print(f'{"":14}{which:3}{n:3}  {src[:22]:22} "{run[:64]}"')

    flagged = sum(1 for r in results if r[4])
    print(f"\nclean {len(results) - flagged}/{len(results)} | flagged {flagged} | "
          f"unexempt failures {len(failures)} across {total_runs} runs")
    if BLOCKQUOTES_STRIPPED:
        print(f"({BLOCKQUOTES_STRIPPED} attributed blockquote(s) stripped before measuring)")
    if args.gate and failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
