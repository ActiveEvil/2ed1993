#!/usr/bin/env python3
"""Longest-common-word-run check between site text and the source library.

The site's standing rule is "mechanics exact, expression new". This measures
compliance: for each stored text, the longest run of consecutive words it shares
with any source. See claude/style-conventions.md and
claude/verbatim-audit-2026-08-08.md.

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


def words(text):
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

    def longest_run(self, draft):
        best, at = 0, -1
        for i in range(len(draft) - NGRAM + 1):
            for j in self.index.get(tuple(draft[i:i + NGRAM]), ()):
                length = NGRAM
                while (i + length < len(draft) and j + length < len(self.tokens)
                       and draft[i + length] == self.tokens[j + length]):
                    length += 1
                if length > best:
                    best, at = length, j
        if at < 0:
            return 0, "-", ""
        return best, self.source(at), " ".join(self.tokens[at:at + best])


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
        g, gsrc, grun = gw.longest_run(draft)
        f, fsrc, _ = fan.longest_run(draft)
        results.append((g, f, row["k"], row["n"], len(draft), gsrc, fsrc, grun))
    results.sort(reverse=True)

    print(f"gw corpus {len(gw.tokens):,}w over {len(gw.spans)} sources | "
          f"fan corpus {len(fan.tokens):,}w over {len(fan.spans)} sources")
    print(f"{len(results)} texts, {sum(r[4] for r in results):,} words, threshold {args.threshold}\n")

    failures = []
    for g, f, kind, name, length, gsrc, fsrc, grun in results:
        reason = exempt.get((kind, name))
        flagged = g >= args.threshold or f >= args.threshold
        if not flagged:
            continue
        mark = f"exempt: {reason}" if reason else "FAIL"
        if not reason:
            failures.append((kind, name))
        print(f"  gw{g:3} fan{f:3}  {kind:20} {name[:30]:30} {mark}")
        if grun and not reason:
            print(f'{"":26}<- {gsrc}  "{grun[:78]}"')

    clean = len(results) - sum(1 for r in results if r[0] >= args.threshold or r[1] >= args.threshold)
    print(f"\nclean {clean}/{len(results)} | flagged {len(results) - clean} | unexempt failures {len(failures)}")
    if args.gate and failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
