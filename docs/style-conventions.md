# 2ed1993 — style conventions

The single reference for how rules on this site are written and marked up. Every
item here is settled and verified true site-wide, not aspirational. Supersedes
the convention sections scattered through the audit documents.

Last verified 29 July 2026. Heading-level rule (Markup 2) and the Sources
section revised 2 August 2026; source-hierarchy rule and the series-enumeration
exemption added 3 August 2026. Two schema facts added to Working practice
3 August 2026. Revised 8 August 2026: the card-face chart rule (Markup 7),
the em-dash spacing rule (Markup 9), the codex-over-base-game ruling (Sources),
the OCR section, and five Working practice entries. **Revised 13 August 2026:**
Markup 1 scoped honestly; the entity whitelist completed (Markup 9); typography
now enforced and clean across every HTML column, not just `rules`; the noun/verb
clarification on "die"; the pronoun rule's named-character boundary; the
verification suite is now a script (`scripts/verify/verify.py`) and its section
here rewritten; two new Working practice traps; the fan-compilation detector
role made permanent (Sources §4). **Revised 14 August 2026:** the pronoun rule
refined and the dice-naming rule added (Voice); the named-dice markup rule
added (Emphasis); one verbatim formula added (`hits on a d6 roll of`).
**Revised 15 August 2026:** the no-code-comments instruction restated by Thomas
a third time and its Working practice entry hardened; a duplicate
`images.file_name` added to Known data defects. **Revised 17 August 2026:** this
file moved into the repo at `docs/style-conventions.md` and is canonical there;
two Working practice entries added (git stash over the bridge, Prettier and
markdown); the `/design` second-person exception added (Voice); the
custom-property substitution trap added (Working practice); the
justification-and-table-advice rule added (Sources). **Revised 19 August
2026:** the `/design` second-person exception dropped from Voice — granted
17 August, never used once the page's copy pass removed every instance, so
second person is now permitted only in asides and `the-golden-rule`.
**Revised 22 August 2026:** the datafax rule and the points-in-rules ruling
added to Sources; the chart-suffix rule extended in Heading naming to name
whatever roll resolves a chart; the exemption-rekeying trap added to Working
practice; the section-naming rule added to Heading naming after the
`Rules by subject` rename; the
`--no-optional-locks` entry corrected in Working practice; two Known data
defects closed on re-measurement — the leading spaces in
`weapon_profiles.short_to_hit` (zero rows now) and the duplicate
`images.file_name` (no file name is shared by two rows anywhere in the table).

*Dating note: an earlier version of this file dated the 8 August revisions as
6 August. Corrected 8 August.*

---

## Markup

1. **Paragraphs** — `<p>` on its own line, content indented 4 spaces, `</p>` on
   its own line. Exception: inside `<li>`, the inline form `<p>text</p>` stands.
   **Scope, corrected 13 August: this formatting is a `rules`-deck convention.**
   The weapons and card decks store the inline form freely (81 instances) and
   render identically; that is their established format, not a defect. The
   verify script enforces the rule on `rule:*` kinds only.
2. **Headings** — `<h3 id="X">Text</h3>`, inline on one line. **Every heading
   carries an id.** Verified: zero id-less headings site-wide — as of 13 August
   verified by script across every text column, not just `rules`.
   **`<h4>` is legitimate for a genuine sub-section nested under an `<h3>`**,
   and is in use in five rules: each individual characteristic under
   `Characteristics`; the blast-path cases (`Strikes the First Model in its
   Path`, `Draws a Straight Line`) under `Resolving Psychic Powers` and
   `psychic:Vehicles`; `Mission Cards` / `Scenarios` / `Win Conditions` under
   `The Game Steps`; and `Discarding &amp; Redrawing` under `Dealing Psychic
   Powers`. Reach for h4 only when the content is a step or case *within* the
   parent section — not merely because it follows one.
3. **Anchor placement** — ids go on the heading, never the `<li>`. Verified:
   no `<li>` on the site carries an id.
4. **Ids are hand-authored, not derived from heading text.** They may differ
   where that reads better — `Game_Length` for the heading "Decide Game Length",
   `Points` for "Agree on Points", `Winning` for "Determine the Winner",
   `Skimmer_Altitude_Chart` for "Altitude Chart (D6)",
   `Firing_From_a_Fortification` for "Firing Out". Keep them coherent, not
   mechanical.
5. **Scope an id only to disambiguate within a page.** `Victory_Points_Squads`
   and `Vehicle_Draws_a_Straight_Line` exist because their bare forms would
   collide on the same rendered page. **Duplicate anchors across different
   pages are fine and already common** — `psychic#Armour_Penetration` and
   `vehicle-rules#Armour_Penetration` coexist. Do not prefix for that reason
   alone.
6. **Nesting** — a `<p>` inside a `<section>` indents one level, and its
   `<small>` / `<em>` children step in from there. Closing tags each get their
   own line; `</em></small></p>` on one line is wrong.
7. **Charts** — `<section class="chart">`, always `max-width: 36rem`, always
   `grid-template-columns: repeat(6, minmax(0, 1fr))`. A chart *title* spans all
   six columns and carries an id; a *column header* spans fewer and carries none.

   **Inside a card face** (the wargear cards page renders at roughly half page
   width) the constraint is width per cell, not column count, and the two cases
   differ:

   - **Label/value charts run their pairs *down*, span 3 + span 3, never
     across.** A four-band row that reads fine on a rules page collapses into
     wrapped labels and run-together dice at card width. Added 3 August after
     Armour Piercing Ammo's chart failed on mobile.
   - **A characteristics profile runs across, at nine columns**, with the grid
     overridden inline and padding and font size reduced per cell. Single-letter
     headings (M, WS, BS…) and single-digit values fit where "Armour
     Penetration | D6+4" does not, and breaking the line into pairs would
     destroy the one thing a profile is for — being read as a row. Added
     8 August for **Night Wing the Psyber Raven**, the first card whose subject
     is a model rather than an item.

   Note that **weapon profiles on a card face are not charts at all.** They are
   a bespoke banded table in the page component, not `.chart` HTML — see the
   wargear cards design doc §4d.

   **Chart titles always include the word "Chart"** (see Heading naming). Now
   true site-wide: the last four holdouts, all in `weapons` texts (Inferno
   Cannon Hit Table, Catastrophic Coil Burnout, Shokk Attack Gun's Misfire
   Table and its Dreadnoughts/Robots/Wraithguard size chart), were renamed with
   their ids on 13 August after confirming zero inbound links.
8. **Tables** — `max-width: 36rem` at **3 columns or fewer**; omitted above
   that. Functional, not cosmetic: 36rem would crush a twelve-column move chart.
9. **Typography** — entities only, in every column rendered via
   `dangerouslySetInnerHTML`. No curly quotes, no primes, no straight quotes in
   copy, no literal em-dashes, no bare `&` — including inside `href` values.
   **The full permitted-entity list, settled 13 August:** `&quot;` `&apos;`
   `&mdash;` `&ndash;` `&deg;` `&amp;` `&dagger;` `&Dagger;` `&sect;`
   `&times;` `&divide;` `&ldquo;` `&rdquo;` `&half;` `&uarr;` `&sup2;`
   `&AElig;`. Footnote markers run `&dagger;` → `&Dagger;` → `&sect;`, each in
   a `<sup>`.

   **Enforced and clean site-wide as of 13 August**: 29 deck texts (psychic,
   warp, faction, mission, wargear card, weapon and the four Blast rules) held
   literal inch marks, apostrophes, em-dashes and one `↑`; all converted to
   entities by a tag-aware pass that left attribute quotes untouched. **The two
   plain-JSX fields are the standing exception** and must keep literal
   characters: `psychic_power_cards.note` and `wargear_categories.note` render
   as `{value}`, where an entity would display as text.

   **`&mdash;` is always tight — no space on either side.** Ruled by Thomas
   8 August. The one permitted exception is markup whitespace: three
   `<p class="credit">` blocks put a newline and indentation before the dash,
   which HTML collapses, so they render tight and are left alone.

## Voice

Baseline: **`/general-rules`**.

- **Third person, impersonal.** The subject is the model, the squad, the unit.
  Not "you"; not "the player" unless the decision genuinely belongs to a person
  rather than a piece.
- **Declarative, not imperative.** "A cavalry model moves 10 inches", not "move
  the cavalry model 10 inches". Imperative steps inside an ordered procedure
  list are the established exception (Mole Mortar, Thudd Gun).
- **~19-word sentences**, one clause of qualification, semicolon for a second.
- **Second person is permitted only in asides** and in `the-golden-rule`, which
  is direct address by design. The three vetted asides (Psykers, Running, To
  Hit The Target) are recorded in `scripts/verify/exemptions.json`.
- **Asides are plain `<p>`** — no marker, no dedicated class. Decided 29 July.
- **"dice", never "die", as the noun.** Clarified 13 August: the *verb* is
  ordinary English — "should that model die" stands. The script flags only
  determiner+die and "die roll".
- **A roll always names its dice.** Never "a roll of 4 or more" — "a D6 roll
  of 4+". Ruled by Thomas 14 August and swept site-wide the same day.
- **No gendered terms.** "crew member", not "crewman" — the last nine
  "crewman"s site-wide (three weapon texts, six psychic cards) were purged
  13 August. Singular *they* for a model or player of unstated gender.
  **Boundary, 13 August: pronouns for a named character are correct** — card
  flavour about Leman Russ keeps "his". The script therefore checks pronouns in
  `rules` only, and crewman/crewmen everywhere.
  **Refined by Thomas 14 August: "Pronouns are allowed only when it is correct
  for the model referenced. If there is no clear pronoun or the reference is
  general to models pronouns are assumed they/them."** Applications settled the
  same day: named characters keep their own pronoun; the Imperial Assassins are
  canonically either gender, so the Assassin card texts use they/them (applied
  across the Callidus, Eversor and Culexus cards); and a noun still beats a
  pronoun where the referent would be ambiguous — Poison Blades keeps "the
  Assassin may strike one of them" because "they" would collide with the enemy
  "them", and the Neural Shredder weapon keeps "touching the Assassin" beside
  "no enemy model".

## Emphasis and linking

- **First mention links, later mentions bold** — per rule, site-wide.
- **No numeric emphasis target.** Mark terms as and when it is logical. The
  `general-rules` figure of ~72 marks per 1,000 words is a description of a
  definitional chapter, not a goal for procedural ones.
- **A term whose definition exists elsewhere should link on first mention**, not
  merely bold. Characteristics link to `/rules/general-rules#<Characteristic>`.
- **Named dice are always title case and bold** — `<strong>Sustained Fire
  Dice</strong>`, `<strong>Scatter Dice</strong>`, `<strong>Artillery
  Dice</strong>`. Ruled by Thomas 14 August; the nine lowercase or unbolded
  prose occurrences were fixed the same day. Two standing exceptions: a linked
  mention keeps the link and drops the bold, since links and strong never nest
  (Space Marine Dreadnoughts), and chart headings carry no strong (Plasma
  Overload Chart). Profile stat cells ("Art. Dice") are cells, not prose.

Four standing exemptions from the first-mention rule:

1. **Navigational anchors** — "here", "this", "below", "above" stay links
   wherever they fall.
2. **A second distinct term sharing one target** keeps its own link. "Force
   Cards" and "Warp Cards" point at the same page but are different things.
   Inflections are *not* distinct terms: Psyker / Psykers / Psyker's is one.
3. **Chart and table cells are left alone entirely.** They neither consume a
   rule's first-mention link nor get converted to bold.
4. **A series that enumerates members of a set marks uniformly** — all link, or
   none. Where a sentence selects from a catalogue the reader could look up —
   cards, weapons, wargear, units, missions — mixed marking reads as a category
   distinction ("those two must be different somehow"), not as a spent first
   mention, and that misread survives any reading order. The series therefore
   overrides first-mention, duplicate link and all: `general-rules:Mission
   Cards` links **The Assassins** and **Witch Hunt** twice, once per paragraph,
   deliberately. **Two limits.** A run that merely *coordinates clauses* is out
   of scope — `shooting:Hiding` keeps "Moves or Shoots" as it stands. And **a
   member with no target anywhere does not drag its siblings down to bold** —
   see `Terminator Armour`. Added and audited site-wide 3 August: two surviving
   hits, both named here, both intended.

Not every bold term wants a link. A word can be marked because it is a *category
label* rather than a cross-reference — `Choosing a Target` bolds **Vehicles**
alongside **Monstrous Creatures** and **Human-sized Creatures** as target size
bands, and linking it to the vehicle combat rules would mislead.

> **Charts contain prose.** Result cells hold full sentences. Any text-shaped
> operation must strip chart sections *first*. **And one rule embeds a
> `<script>`**: `how-to-play:The Game Steps` carries the scalable-diagram
> script inline, so any text check must strip script blocks too, or JavaScript
> string quotes read as typography violations. Learned 13 August.

## Heading naming

Settled 29 July.

| Form | Use for | Examples |
| --- | --- | --- |
| **Imperative** | a step in an ordered sequence the reader performs | `Place Terrain`, `Declare Charges`, `Roll Attack Dice`, `Calculate Combat Score` |
| **Noun phrase** | a thing the reader looks up — the default | `Armour Value`, `Hard Cover`, `Vision Slit`, `Penetration Tests` |
| **`<Name> Chart`** | any chart title, always including the word "Chart" | `Skid Test Chart (D6)`, `Structure Damage Chart (D6)`, `Turning Chart` |

- **The resolving roll is named in brackets** where the chart is resolved by a
  roll: `(D6)`, `(2D6)`, and so on. **Extended by Thomas 22 August**, when the
  `Drop Pod Scatter Chart (2D6)` needed a form the convention did not grant; until
  then only `(D6)` was sanctioned. Swept the same day across all 57 live charts:
  none needed a new suffix, and none carried one that its body contradicted.
  `Turning Chart` and `Range Chart` are lookups and carry no suffix. Two charts
  bracket what resolves them without naming dice at all — `Bonus Penetration Dice
  Chart (Attack Strength)` and `Plasma Overload Chart (Sustained Fire Dice)` —
  which is the same convention read widely.
- **Gerunds are not a third form.** They survive only where every noun phrasing
  is worse: `Going into Hiding`, `Dealing Psychic Powers`, `Dealing Warp Cards`,
  `Keeping Powers Secret`, `Leading Squads`, `Determining the Warp Flux`,
  `Firing Out`, `Firing Into Hand-to-Hand Combat`, `Firing On Overwatch`,
  `Shooting From Bikes`.
- **Attack topics take "Attacks on X"**; **test topics take "X Tests"**.
- **A source's own section name is kept** where it is the recognisable handle
  for a reader cross-referencing the book — `The Loss of Psykers`, `Waaagh!
  Power`, `Vehicle Squadrons & Support Weapon Batteries`. This exception does
  *not* excuse a chart title from carrying "Chart" (ruled 13 August, when the
  four Table/bare titles were renamed rather than exempted).
- `Characteristics` uses a fourth pattern carrying the abbreviation —
  `Attacks (A)`, `Ballistic Skill (BS)`. Consistent within that rule; leave it.
- **Card names drop a leading definite article.** Ruled 8 August.
- **A section names a concept, never its contents.** `Before the game`,
  `The turn sequence` and `Factions` all name what the section is. The fourth
  enumerated its categories — `General rules, weapons, psychology & vehicles` —
  and so went stale the moment a fifth category joined it, besides being the only
  one of the four that wrapped to two lines on a phone. **Renamed
  `Rules by subject` 22 August**, the reading being that the first two sections
  organise rules by *when* they apply and this one by *what they are about*. A
  name that lists its members has to be edited every time the list changes, which
  the faction categories would have forced again immediately. Sentence case
  throughout; the index renders them upper case itself.

## Sources

**Source hierarchy — standing instruction, 3 August.** Primary published
material outranks fan compilation, always:

1. **Base rulebook** — the spine.
2. **Faction codexes and supplements** (Dark Millennium, Codex Chaos, Codex
   Orks, Codex Imperialis, Citadel Journal) — authoritative in their domain,
   and a codex may supersede a supplement.
3. **White Dwarf Q&A** — official errata and clarification; use it to resolve
   ambiguity in 1 and 2, not to contradict them.
4. **Fan compilations — never an authority, and never a source.** Three are
   known: `W40K 2nd Ed BattleBible`, `2nd Ed Wargear.pdf` (deleted 8 August),
   and `weapons.pdf` ("The Complete, Concise Rules…", Jason E. Payne). **One
   permitted use, ruled permanent by Thomas 13 August: pure detectors in the
   verbatim gate**, because they are clean text where GW's own scans are noisy
   OCR. The standing justification is the shared-typo provenance finding
   (`Force Weapons`, "that be may be used"), which only a clean-text detector
   could have caught. Nothing more, ever — not a source, not a tiebreaker, not
   a fallback when a GW page is missing.

**For wargear cards, the codex outranks the base game.** Ruled by Thomas
8 August. Wording, content and legibility conflicts all resolve codex-first;
the codex is also more complete.

- **Dark Millennium is in scope.** Two DM gaps remained after 2 August; gap 2
  (Space Marine Dreadnoughts) closed 8 August; gap 1 folds into the vehicle
  data model.
- Fortifications come from the Citadel Journal "Assault" articles, two
  families.
- Where a rule departs from its source, say so in an aside rather than silently
  house-ruling.
- **Check the faction codex before authoring a supplement's rule.**
- **Rules chapters carry system; factions carry entries.**
- **A source's justification and table advice are out of scope.** Author the
  mechanic and the permissions the source grants; leave behind the reasoning
  for a rule, the modelling suggestions, and the advice on how to handle dice
  and models at the table. Ruled by Thomas 17 August on the shooting drafts,
  where "Dice of different colours let both batches be thrown at once" was
  flagged as a house rule rather than a rule. Six further lines went with it in
  the same pass — in-fiction reasons ("amid the smoke and the explosions no one
  picks a particular target"), pace advice ("speeds the game considerably"),
  and the closing justification of the cover-averaging steps — cutting the
  three drafts from 502 words to 335. The same test had already removed Model
  Buildings and the Buildings chapter's closing Special Rules, and it took one
  sentence back out of `general-rules:Buildings` after that rule went live.
  **Permission is not advice**: "players may agree X" is scope and stays.
- **Nothing a datafax carries is restated in a rule.** Ruled by Thomas 22 August,
  and it outranks the points rule below. Capacity, access, fire arcs, deployment,
  points, armour values and a structure's own damage chart all belong to its
  datafax. The rule carries the mechanics, names the datafax, and leaves the
  figures there — **dangling the reference on purpose** until the datafaxes are
  built, at which point every deferral becomes a link.
  `general-rules:Fortifications` already worked this way and is the model. Applied
  22 August across the field defences, the fortification types and the drop pods,
  which cost the field defences four damage charts and every figure it had.
- **A points cost that is not on a datafax belongs in a rule only where it is
  generic.** Ruled the same day. A cost every army pays for the thing the rule
  describes stays — 50 points for a stronghold's teleport jammer. A cost tied to
  one army's list goes with that list: the Imperial Guard command relay and the
  per-army anti-skimmer weapon options were stripped of their prices in the same
  pass and keep their rules, each closing on a sentence saying the cost sits with
  the army list.
- **Content comes from the one page being transcribed, not its army-list
  cousins.** Added 13 August after a Tarantula draft imported "fitted with a
  targeter" from the Codex Ultramarines entry into the Wargear-book rules text.
  "Mechanics exact, expression new" has a blind side: expression-new must not
  become content-new.
- **Six files have genuine text layers** and need no OCR: the three fan
  compilations, Codex Imperialis, Angels of Death, White Dwarf Q&A. Everything
  else is image-only and needs rendering plus OCR.
- **A text layer can be real for only part of a book.** The Basegame Wargear
  book PDF carries a genuine text layer for ~31 of its 120 pages — the whole
  front half, support weapons included, is image-only. A grep miss proves
  nothing until coverage is confirmed *per page*, not per file. (The corpus is
  unaffected: `build-corpus.sh` classed the book image-only and OCR'd all 120
  pages — 75,254 words, front-half content verified present 13 August.)
- **Image-only PDFs carry a text layer of OCR sludge** that `pdftotext` happily
  returns; confirm a text layer is real before trusting a miss.

**OCR reads prose well and profile rows badly** — established 3–8 August; the
three techniques that help (invert white-on-black, locate by tsv bounding box,
re-render at higher dpi) and the stop-and-ask-Thomas rule stand unchanged.

**Source text is never reproduced verbatim.** Standing instruction, 3 August:
**mechanics exact, expression new.** The whole-site backlog was cleared
8 August (84 unexempt failures → 0; `verbatim-audit-2026-08-08` in the Claude
project, closed) and **the gate is the standing control**:
`bash scripts/verbatim/gate.sh`, wired into the versioned pre-push hook. A run
of 8+ words against the corpus fails unless exempt; 5–7 is normal. Three limits
on the measurement (corpus coverage, paraphrase blindness, OCR noise) are
stated in the audit doc and still apply.

---

## Working practice — hard-won

**No code comments.** Standing instruction, 3 August; restated by Thomas
13 August when gallery components drifted, and **again 15 August** — "I have
asked you not to leave code comments before, go through and remove any that you
have left" — after 87 comment lines had accumulated across ten files during the
13–14 August sessions. Application code and CSS get short comments or none;
reasoning belongs in the project docs. Only eslint directives and
deliberately commented-out code survive a sweep. Three restatements means this
is not a preference to be re-litigated: **write no comment unless it is a
directive.**

**Ask before writing to the database.** Standing instruction from 29 July.
Treat **DDL as a separate permission from row writes**.

**A rewrite pass drifts the conventions it is not looking at.** 8 August:
seventeen spaced `&mdash;` crept in during the verbatim rewrites. 13 August:
new support-weapon texts arrived with "crewman" and duplicate links. 14 August:
the dice-naming sweep itself minted an 8-word fan-corpus run ("blade hits on a
D6 roll of 3+") — a convention sweep can create verbatim runs, so **run the
suite *and* the gate after any batch prose change.**

**Thomas edits the repo too. Check `git status` before touching a file.**
**He edits the database directly too** — 15 August he added eight `images` rows
and wrapped three `factions.description` values in `<p>` while a session was
running. Re-read a table before assuming the shape you last measured.

**Scope every string replacement to the block it belongs to**, and check the
removal count against what you expected.

**Entity conversion must be tag-aware.** A blind `replace('"', '&quot;')` over
stored HTML destroys every attribute delimiter in the column. The 13 August
literal-to-entity pass walked each value tag-by-tag (split on `(?=<)`, convert
text bodies only) and was verified with an attribute-damage query afterwards.

**The bridge cannot unlink files**, so `git checkout -- <path>` fails; restore
with `git show HEAD:path > path`. **A plain `git status` leaves an
index.lock** the bridge cannot remove. **The flag belongs to `git`, not to the
subcommand** — `git --no-optional-locks status` works and leaves nothing behind,
while `git status --no-optional-locks` is rejected as an unknown option.
Corrected 22 August, after the wrong form was tried and the plain one then left a
stale lock behind.
**And `git stash` is unusable over the bridge** for the same reason: it half
runs, reports "the stash entry is kept", and leaves whatever was already
stashed in place. 17 August it was reached for to compare a file against its
committed state; the comparison that actually works is
`git show HEAD:path | diff - path`. Never stash to answer a question.

**`pkill -f <pattern>` kills the calling shell** if the pattern appears in its
own command line. Kill by PID.

**The editor's TypeScript is not the repo's.** Write explicit type predicates;
point the editor at `node_modules/typescript/lib`.

**A custom property is substituted where it is DECLARED, not where it is
used.** Found 17 August, and it had been wrong in `globals.css` since the
variable was introduced — with a comment asserting the opposite.
`--stripe` was declared once on `:root` as
`color-mix(in oklab, var(--background) 85%, var(--foreground))`, so both `var()`
calls resolved against `:root` and **a nested `[data-theme]` could not change
it**. The zebra always carried the page's stripe, so a light specimen inside a
dark page struck its rows in dark grey and vice versa; the print block reset the
other four variables and left the stripe on whatever scheme the reader was in.
The fix is to declare `--stripe` inside every scheme block — light, the
OS-dark media query, forced dark, and the print reset — rather than once.
**The reason the other four never showed this** is Tailwind's `@theme inline`:
`inline` means the alias is substituted at use, which is exactly the behaviour
a plain `:root` declaration does not have. Verified in headless Chromium across
both schemes and print.

**`getComputedStyle` returns `oklab()` for a `color-mix()` value, not `rgb()`.**
Found 17 August on the `/design` contrast table, which read `--stripe` back from
the DOM and parsed the first three numbers of
`oklab(0.88187 0.0000401683 0.0000176661)` as if they were 0–255 channels.
The zebra pair reported 1.52:1 against a true 9.66:1, and reported it as a
failure. **Never regex a computed colour.** Round-trip it through a 1×1
canvas — `fillStyle = value; fillRect; getImageData` — which returns
sRGB bytes and lets the browser own the conversion. Plain hex tokens return
`rgb()` and hid the fault, so it only appeared on the one derived colour.

**Prettier does not format the markdown or the JSON here, by decision.**
`.prettierignore` carries `*.md`, `scripts/verify/exemptions.json`, the lock
file and the generated dumps. Two reasons, both found 17 August: on markdown,
Prettier de-indents a continuation line inside a numbered list item wherever a
backtick span wraps across the line break, which silently changes the rendered
output of this file; and it would explode `exemptions.json` from one readable
entry per line into multi-line objects. Everything else is formatted, and
`npx prettier --check .` passes clean — keep it that way.

**`2ed1993-schema.sql` is not a true record of the live database.** Read the
live shape from `information_schema` and `pg_type`.

**A new table needs RLS enabled and a public select policy.**

**A schema change and the code that reads it must ship together.**

**Identity sequences lag across this schema.** `rules` (2 Aug), `weapons` and
`weapon_profiles` (3 Aug), `weapon_special_rules` (13 Aug — 31 against max 32).
**Assume every table has it until checked**, and check before any insert:

```sql
select last_value from pg_sequences where sequencename = '<table>_id_seq';
```

**Moving a rule between categories silently breaks its exemptions.** Both
exemption files key on `kind`, and `kind` is `rule:<category-slug>` — so a rule
that changes category stops matching its own entry, and the gate begins failing
on runs that were deliberately allowed. Found 22 August, when `Buildings` moved
into `buildings-fortifications` and its whole-text exemption, keyed
`rule:general-rules`, stopped applying: the full-dump gate went from clean to one
unexempt failure across eight runs, all of them the armour-value table the
exemption exists for. **Re-key every exemption for any rule that moves, and run
the gate over the whole dump rather than the changed texts** — measuring only
what you wrote would have missed this entirely.

**Scope every verification query to the whole table**, never to the chapter
being worked in.

**A negative result is only as wide as its pattern.** Fire the pattern at a
synthetic positive before believing a zero. (The verify script was shaken down
on a synthetic five-text sample before its first real run.)

**The Postgres greediness trap** — the first quantifier sets the greediness of
the whole expression; write `[^>]*?` throughout. `.` matches newlines in
Postgres by default.

**Check what a capture group actually swallowed.** **Escape hyphens in
generated patterns.** **Use `\s+`-tolerant patterns for every copy edit.**
**Prefer positional replacement to counted regex.**

**Derive anchors with the full rule, not the shorthand:**

```sql
replace(regexp_replace(regexp_replace(replace(x,'&','and'),
  '[^A-Za-z0-9 ._-]','','g'),'\s+',' ','g'),' ','_')
```

**Line-broken `<a` tags are not a defect.** Count `<a` openers
whitespace-tolerantly or the tally misreports.

## Parked by decision — do not raise piecemeal

- **`equipment_weapons` denormalisation** — ruled 8 August: folds into the
  army-lists rework.
- **A `Twin-Linked` sweep beyond the Tarantula** — ruled 13 August: "park
  until there is an elsewhere." The rule (`weapon_special_rules` id 33) exists
  and applies the moment attack bikes, vehicle datafaxes or further codex
  options are modelled; nothing on the site today needs it beyond the four
  Tarantula profiles.

## Known data defects

- **Mole Mortar profile cells** store empty strings where the printed chart
  says "See special rules" across S/Dmg/Save. Cosmetic, undecided, 13 August.

*The two defects recorded here on 8 and 15 August — the leading spaces and the
duplicate `Blood-Angels.jpg` — were re-measured 22 August and are closed.*
**`images.file_name` still has no unique constraint**, which is what let the
duplicate in.

## Standing verification suite

**The suite is now a script** — added 13 August, superseding the manual table
that stood here. It covers **every prose column**, not just `rules`:

```
python3 scripts/verify/verify.py          # reads scripts/verbatim/texts.json
python3 scripts/verify/verify.py --list   # show exempt hits too
```

It reads the same `texts.json` the gate dumps, so the working order is:
`dump-texts.py` (or `gate.sh`, which runs it) → `verify.py`. Exit 1 on any
unexempt finding. Exemptions live in `scripts/verify/exemptions.json`, each
with a reason; currently: three vetted second-person asides, the Game Steps
chart arrows, the Frenzy/Stupidity shared paragraph, and the standard
secondary objective identical on four mission cards.

Scripted checks: tag balance (`<p[ >]`-style counters, `<a` wrap-tolerant),
heading ids (with the `span 6` chart-column qualifier), empty ids, ids on
`<li>`, stray whitespace in tags, chart titles lacking "Chart", spaced
`&mdash;`, the entity whitelist, literal characters (HTML columns only, script
blocks stripped), gendered terms (crewman everywhere; pronouns in `rules`
only), "die" as a noun (determiner+die and "die roll" — the verb passes),
second person outside the Golden Rule, inline `<p>` outside `<li>` (`rules`
only), nested `<a>`/`<strong>`, duplicate ids within a category, dead
`/rules/…#fragment` links, and duplicate paragraphs across texts.

**Known artefact:** running `verify.py` against a single-text JSON reports a
false `dead_link`, because the anchor population it checks against is derived
from the input file. Verify a slice against the full dump, not a slice.

**Still manual, by design** — they need judgment: first-mention
links-then-bold discipline, repeat link groups, mixed-marking series
(exemption 4), links landing inside charts, and fragment links into non-rules
pages (`/wargear/…#X`), whose anchor population isn't derivable from
`texts.json`.

**Baseline, 13 August: the full suite passes at zero unexempt findings** after
the day's fixes (crewman purge, 29-text entity conversion, four chart-title
renames). The verbatim gate is a separate, complementary control:
`bash scripts/verbatim/gate.sh`.
