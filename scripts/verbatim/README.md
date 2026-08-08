# Verbatim gate

Measures how much of the site's published text is word-for-word identical to its
sources. The standing rule is **mechanics exact, expression new** — every number,
dice, trigger and effect keeps its substance precisely; every sentence is written
fresh. See `claude/style-conventions.md` for the rule and
`claude/verbatim-audit-2026-08-08.md` for the audit that produced this tool.

**Run it before any text goes into the database, and over everything after each
batch.** It exists because the standard arrived on 3 August 2026 and most of the
site predates it; an audit somebody has to remember to run will drift again.

## Setup

The corpus is not committed — it is ~400k words of OCR derived from copyrighted
PDFs. Build it locally from the source library:

    ./build-corpus.sh ~/Library/CloudStorage/ProtonDrive-.../WH/2ed/2ed1993

Resumable: it skips anything already extracted, so interrupt and re-run freely.
Needs `pdftoppm`, `pdftotext` and `tesseract` (`brew install poppler tesseract`).

**This takes hours.** Roughly 1,900 pages, most of them image-only. Six files
have genuine text layers and are extracted instantly; the rest are OCR at 150dpi,
about 10&ndash;20 seconds a page depending on cores.

## Running

    psql "$DATABASE_URL" -At -f dump-texts.sql > texts.json

    python3 measure.py texts.json                 # audit, worst first
    python3 measure.py texts.json --gate          # exit 1 on unexempt failure
    python3 measure.py texts.json --only weapon   # one kind
    python3 measure.py texts.json --threshold 10  # loosen for triage

Stdlib only, no install.

## How it works

Strip markup, normalise entities, lowercase, tokenise to words. Build a 5-gram
index over the corpus and extend each hit greedily. A text scores the **longest
run of consecutive words** it shares with any source. **8 or more is a failure**
unless exempted.

Runs of 5&ndash;7 are normal — game-term sequences and stock phrases. Anything
longer means the sentence kept the source's syntax.

## Two corpora

`corpus/gw` — Games Workshop publications. **This is the finding.**

`corpus/fan` — fan compilations. **A detector, never a source.** Nothing on this
site may be written from them. They earn their place because they reproduce GW's
text as *clean* text, where GW's own scans are noisy OCR: one misread word cuts a
30-word run into two runs of 14 that never reach the threshold, so the GW corpus
systematically under-reports. The fan files catch what OCR breaks apart.

A fan match does not prove a fan source — the compilations copy GW, so our text
and theirs may independently descend from the same GW sentence. What a match
establishes is that the text is **verbatim**, not from whom.

## Exemptions

`exemptions.json` has two mechanisms, because the exempt cases are of two kinds.

**`formulas`** — phrases masked out of both draft and corpus before matching, so
a run made only of them cannot score. Use this for wording that recurs across
many texts: "saving throw of 4, 5 or 6 on a D6", "may only be chosen for
character models". The words *are* the rule, and the rule is not the protectable
part. Before masking, one save formula was failing a dozen psychic cards on its
own and drowning the real findings.

**`texts`** — a per-text allowlist with a reason, for whole texts whose length is
unavoidable: the damage table, speed charts, characteristic lines. The digits are
the content.

Keep the formula list short and strictly formulaic. Masking is powerful and cuts
both ways — an over-broad phrase hides real copying, and nothing will tell you.

**Never exempt prose.** Flavour carries no mechanics, so there is always another
way to write it, and it is the most exposed thing on the site.

**The target is not zero.** "No protectable expression copied" is achievable; "no
eight-word run anywhere" would mangle rules text for no benefit.

## Limits, stated plainly

1. **The GW figure is a floor.** OCR noise breaks exact matching, so the true
   figure is higher than reported.
2. **Runs, not paraphrase.** A sentence keeping the source's clause order with
   substituted words scores low and is still derivative. The tool cannot see it.
3. **A clean score against a source not in the corpus means nothing.** Check
   coverage before trusting a zero.

## Gotchas

- `pkill -f <pattern>` kills the calling shell if the pattern appears in its own
  command line. Kill by PID. This cost two shells during the original audit.
- Rendering is the bottleneck on large PDFs, not OCR. Locate pages at 150dpi and
  only re-render the ones that matter at 300&ndash;400.
- White-on-black title bands need inverting before OCR (`ImageOps.invert`), and
  profile rows often resist OCR entirely at any resolution — ask a human to read
  the number rather than run a seventh pass.
