# 2ed1993

A record of **Warhammer 40,000, 2nd edition (1993)** — its rules, weapons,
wargear, card decks and artwork — published at
[2ed1993.com](https://2ed1993.com).

The rules are transcribed from the original books rather than copied: mechanics
exact, expression new. That standard is enforced, not aspirational — see
[Standing controls](#standing-controls).

## Stack

Next.js 16 (App Router, `output: "standalone"`) · React 19 · Tailwind CSS 4 ·
Supabase Postgres · pnpm · deployed on Vercel.

TypeScript throughout. No test framework: the standing controls below take that
role, because the risk in this project is wrong or badly-formed *content*, not
wrong code paths.

## Getting started

```bash
pnpm install
git config core.hooksPath .githooks   # once per clone — see Standing controls
pnpm dev
```

`.env.local` needs:

| Variable | Used by |
| --- | --- |
| `SUPABASE_URL` | `lib/supabase.ts`, `scripts/verbatim/dump-texts.py` |
| `SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `lib/supabase.ts`, `scripts/verbatim/dump-texts.py` |
| `NEXT_PUBLIC_SUPABASE_PROJECT_ID` | `supabase-image-loader.ts` |
| `DATABASE_URL` | only `dump-texts.sql`, the psql equivalent of `dump-texts.py` |

The publishable key is read-only by RLS policy. Every table needs RLS enabled
and a public select policy or its rows will simply not appear.

## The important thing about this repo

**The content is in the database, not the tree.** There is no MDX, no content
directory, no CMS. Prose lives as **stored HTML** in Postgres columns and is
rendered through `dangerouslySetInnerHTML`, styled by the `.dynamic-content`
block in `app/globals.css` — about half that file.

Two consequences that catch people out:

- **Grepping the tree tells you nothing about the site's text.** Dump it first:
  `python3 scripts/verbatim/dump-texts.py` writes every prose column to
  `scripts/verbatim/texts.json`. Search that.
- **A markup or typography convention is a data rule, not a code rule.** Stored
  HTML uses entities only (`&quot;` `&apos;` `&mdash;` …), never literal
  characters. Two plain-JSX fields are the standing exception:
  `psychic_power_cards.note` and `wargear_categories.note`.

Roughly 40 tables. The shapes worth knowing: `rules` / `rule_categories` /
`rule_sections`; `weapons` / `weapon_profiles` / `weapon_special_rules`;
`armour` and its parallel set; `wargear_cards` and the four card decks
(`mission_cards`, `strategy_cards`, `psychic_power_cards`,
`special_warp_cards`); `factions`; `images` and the gallery tables.

`2ed1993-schema.sql` is **not** a reliable record of the live database. Read the
live shape from `information_schema` and `pg_type`.

## Layout

```
app/                 routes; one folder per section
  rules/[slug]         the eleven rules chapters
  wargear/             weapons, armour, wargear-cards
  card-decks/          four decks
  factions/[slug]
  gallery/
  design/              component and token showcase (noindex)
  globals.css          palette, scheme variables, .dynamic-content, print
  robots.ts sitemap.ts manifest.ts
components/          shared primitives — Panel, SectionBar, Chip, JumpBar,
                     Cards, FilterField, RowFilter, Logos, Gallery, TopNav …
lib/
  supabase.ts          client + assertNoQueryErrors
  sections.ts          parses stored HTML for jump-bar and chip navigation
  anchors.ts           generateAnchorId — the one anchor derivation
scripts/
  verify/              standing verification suite
  verbatim/            verbatim gate and corpus tooling
docs/
  style-conventions.md the normative reference for prose and markup
```

Anchors are hand-authored in stored HTML and derived in code by
`generateAnchorId`. Both must agree; `verify.py` checks that they do.

## Standing controls

Run all four before pushing prose or schema changes.

```bash
pnpm build                                # or: pnpm exec tsc --noEmit
pnpm lint                                 # eslint
pnpm exec prettier --check .
python3 scripts/verbatim/dump-texts.py    # refresh texts.json first
python3 scripts/verify/verify.py          # markup, typography, voice
bash scripts/verbatim/gate.sh             # verbatim runs against the corpus
```

**`verify.py`** mechanises `docs/style-conventions.md` across every prose
column: tag balance, heading ids, chart-title naming, the entity whitelist,
gendered terms, "die" as a noun, second person, duplicate ids, dead
`/rules/…#fragment` links. Exit 1 on any unexempt finding. Exemptions live in
`scripts/verify/exemptions.json`, each with a reason.

Order matters: `verify.py` reads `texts.json`, so dump before verifying. And
verify a slice against the **full** dump — running against a single-text JSON
reports false dead links, because the anchor population is derived from the
input.

**The verbatim gate** fails any run of 8+ words identical to a source. It is
wired into `.githooks/pre-push`, which is why the `core.hooksPath` line above
matters. The corpus is ~400k words of OCR from copyrighted PDFs and is
gitignored: on a machine without it the hook says so and lets the push through.
`GATE_SKIP=1 git push` skips deliberately. Building it takes hours — see
`scripts/verbatim/README.md`.

**A convention sweep can create verbatim runs**, and a rewrite pass drifts the
conventions it is not looking at. Run the suite *and* the gate after any batch
prose change, not one or the other.

## Conventions

**`docs/style-conventions.md` is the single reference**, and the canonical copy —
it is what `verify.py` mechanises. Every item in it is verified true site-wide
rather than aspirational. Read it before writing any prose or markup. The three
most often broken by someone who has not:

- **Entities only** in stored HTML, and `&mdash;` is always tight.
- **No code comments.** Reasoning belongs in the docs, not in the source. Only
  eslint directives and deliberately commented-out code survive a sweep.
- **Ask before writing to the database**, and treat DDL as separate permission
  from row writes.

Also standing: borders stay black in both colour schemes (deliberate, and
counter-intuitive); a schema change and the code that reads it ship together;
identity sequences lag across this schema, so check
`pg_sequences.last_value` before any insert.

## The decision record

Only `docs/style-conventions.md` is committed here. **The rest of the decision
record — roughly fifty documents — lives in the 2ed1993 Claude project and is not
on disk.** It is the history rather than the rules: why things are the way they
are, what was tried and rejected, what is still open. Worth reading before
changing anything visual or structural.

| Document | For |
| --- | --- |
| `status-<date>` | what happened in a session, and what is open |
| `ui-revamp-plan-2026-08-10` | why the components are shaped as they are |
| `phase-7-audit-2026-08-12` | colour, keyboard, touch and print |
| `design-system-plan-2026-08-17` | where `/design` is going |
| `image-usage-matrix-2026-08-15` | which artwork is used where, and by whom |

Source hierarchy for content: base rulebook, then faction codexes and
supplements, then White Dwarf Q&A. **Fan compilations are never a source** —
their one permitted use is as clean-text detectors in the verbatim gate.

## Not built yet

Tables exist without pages behind them: `units`, `unit_profiles`, `vehicles`,
`army_lists`, `equipment_weapons`. The unit and vehicle data models are the two
largest open pieces of work. `equipment_weapons` denormalisation is parked by
decision until the army-lists rework.

## Deployment

Vercel, from `main`. `next.config.ts` carries the `www` → apex redirect, three
security headers, and a custom Supabase image loader
(`supabase-image-loader.ts`) — images are served from Supabase storage, not
`public/`.
