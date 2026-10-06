# Unit profiles — data model and authoring conventions

How a unit profile is stored, how it renders, and the calls that shaped both.
The narrative behind each decision lives in the Claude project docs
(`troop-profiles-design-review-2026-08-23`, `unit-options-model-2026-08-24`,
`unit-profile-codex-layout-2026-08-26`, `test-profiles-authoring-2026-08-26`);
this file is the standing reference. Text style is governed by
`style-conventions.md`, which applies to every prose field below.

The governing principles, all ruled by Thomas:

- **Mechanics exact, expression new** — numbers, dice, triggers and effects
  keep their substance precisely; sentences are written fresh. The verbatim
  gate (`scripts/verbatim/`) enforces it: no run of 8 or more consecutive
  words shared with a source.
- **Always be specific.** A mechanic is never left implicit because the book
  left it implicit — "additional", "in place of", "any model", "all
  models", "up to N", "exactly N" are all distinct and all said. Where the
  book's wording is ambiguous ("one model"), authoring resolves it and the
  data carries the resolution.
- **No prose unless strictly necessary.** Structure first; `note` carries
  only what the columns cannot.
- **`/profiles` names and links; it does not restate what another page
  owns.** Points are omitted everywhere on a profile — they belong to army
  list entries (and datafaxes, which are self-contained by exception).
  A note may say a cost exists ("priced per mastery level") but never the
  number.

## The model

**`units`** — one row per distinct model or squad, reconciled across books:
the same unit printed twice is one row; the same name with different content
is two (the Weirdboy test). `faction_id` records the source's attribution;
the unit renders on its top-level ancestor's page
(`/profiles/<top-level-faction>#<Unit_Name>`). `unit_type_id` buckets the
page (Characters, Squads, Vehicles, …). `profile_description` is a
last-resort prose field and should normally be null.

**`unit_profiles`** — one row per printed statline row within an entry.

- `models_min` / `models_max` are **composition** (1/1 Sergeant, 9/9
  Guardsman, 5/10 Guardian, null max = unbounded). Army-level allowance
  ("0-1") is NOT composition and belongs to `army_list_entries`.
- `alternative` — profiles with equal values coexist; different values are
  **alternative compositions**. The graded character is the case: Inquisitor
  0, Master Inquisitor 1, Inquisitor Lord 2 — one model at one grade. Same
  semantics as `unit_profile_weapons.alternative`. A negative `alternative`
  (−1) marks an escort present in every composition: it never takes a "—or—"
  and needs no grade price.
- `mastery_level` and `wargear_cards_max` render as a sub-line under the
  profile name ("Mastery 4 · 1 wargear card"). A psyker character with no
  printed level takes its psi-level from `w` — the hero level, 1 to 4 — and
  `mastery_level` is set from it.
- `strategy_rating` is the rating a character brings when it leads the army.
  The default belongs to the faction (`factions.strategy_rating`, from the
  Default Strategy Ratings table in The Game Steps) and every army list of the
  faction takes it; a faction with a parent and no rating of its own takes the
  parent's. Imperial Agents and Necrons have none: the Black Codex prints none
  for Imperial Agents, whose list other armies draw on, and Necrons have a rule
  in place of a rating, to be entered with their list. The list page prints the
  default once, in the summary between the composition chart and Allies, and a
  profile's rating only where it differs from the list's, as a line in the
  entry's SPECIAL row ("Strategy Rating – 6 when commanding the army."),
  because the rating applies only when that character commands. A rating the
  book gives as a roll or a bonus (Macharius's D6, the Ancestor Lord's +D3) is
  a special rule and the column stays null. Sources: Rulebook p10 for the
  table; Codex Tyranids p74 and the Black Codex p23 for Genestealer Cults at 1;
  Codex Chaos for Chaos at 3 with the Chaos Space Marine Commander at 5.
- `points` is per model of this profile (the graded-character and
  per-model-priced-mob mechanism); not rendered on `/profiles`.
- The nine characteristics are nullable **text**, as `weapon_profiles` and
  `armour_profiles` are, and hold what the card prints: "4" where the card
  prints 4, "D6" where the Beast of Nurgle rolls for Attacks. Null renders as
  an en-dash, distinct from "0". Nothing computes with them.

**`unit_profile_weapons`** — the printed base loadout. `alternative` groups
either/or sets (*"Bolt Pistol, Axe —or— Boltgun"*) and is a **per-model
choice only** — a whole-squad substitution is an option, not a loadout
alternative, even when free (the Guardian laspistol call). `quantity` covers
"two laspistols". Position is explicit and follows the printed order.

A weapon the book names but prints no profile for is a `weapons` row with
`counts_as_weapon_id` pointing at the weapon it fights as (ruling 48: the
Force Staff counts as a Force Rod). Loadouts, options and wargear lists print
the book's name and link to its own strip on `/wargear/weapons`, which carries
the other weapon's profile under a "Counts as Force Rod" line; nothing is
copied.

**`unit_profile_armour`** — per profile; mixed suits/fields/shields are
multiple rows. `save_override` carries the save where the printed entry gives
one the armour itself does not (the Rough Riders mounted 5+, the Eldar aspect
saves); null means the armour's own save stands.

**`unit_options`** — everything printed under WARGEAR, SPECIAL and SUPPORT.
One row per item. The columns:

- `option_group` — `wargear` / `special` / `support`, the sources' own row
  labels; check-constrained.
- `grant_mode` — how the grant relates to what is carried; check-constrained:
  - `add` — in addition to the current loadout;
  - `replace` — one-for-one, `replaces_weapon_id`/`replaces_armour_id`
    naming the displaced item (constraint: a row naming a `replaces_*` must
    be mode `replace`);
  - `add_or_replace` — the combination ("additional or alternative");
  - `take_any` — open access to the listed sections;
  - `crew` — the models man one item from the sections rather than carry it
    ("Servitor – crews one weapon from Support Weapons", "Gretchin, all
    models – crew one piece from Runtherd Artillery"), or man the one weapon
    the row names ("All models – crew a Rapier Laser Destroyer").
- `quantity` — how many of the granted thing; **null means unbounded**
  ("additional weapons" rather than "an additional weapon").
- Scope, exactly one reading:
  - `whole_unit = true` — a uniform squad-wide choice;
  - `unit_profile_id` with no count — each model of that profile decides
    individually;
  - `models_min`/`models_max` — a count: min = max is **exactly N**
    ("2 models"), min null is **up to N**, both set and unequal is a range;
  - `models_per` — ratios ("up to 1 in 3").
- The grant, at most one of: `weapon_id` (+ quantity), `armour_id`,
  section access via `unit_option_categories` → `wargear_categories`,
  `granted_unit_id` (an accompanying unit, e.g. a transport once it exists),
  `to_unit_profile_id` (a **profile upgrade** — the Veteran Sergeant
  pattern).
- `alternative` — options sharing a non-zero value are alternatives: the
  model or unit takes one of them (the Beastmen shield or two-handed weapon,
  the Tarantula's five pairs). 0 is not part of a choice. The semantics are
  `datafax_weapons.alternative`'s, not the loadout's: a lone non-zero value
  pairs with nothing.
- `optional` — false where the option is not a choice. On a row that grants
  something, the grant is compulsory (a forced card); a `crew` row is
  compulsory by nature; on a note-only row it is a standing statement (who commands) and
  changes nothing on the page.
- `restriction` — a short qualifying line rendered under the row ("The
  leader and/or one other model.").
- `note` — gate-clean prose for what structure cannot hold; voice per
  `style-conventions.md`.

**`unit_special_rules` / `unit_special_rule_assignments`** — the printed
special rules that say what a model *is*, on the shape `weapon_special_rules`
and `armour_special_rules` already use. A `unit_special_rules` row either
carries its own prose (`rule`, HTML), points at a rules-chapter rule
(`rule_id`), or does both where a printed entry states an exception to a
shared rule; at least one of the two is required. A row with `rule_id` and no
prose is a **signpost**; a row with both is **prose plus pointer** (Commander
(Avatar) and Command (Macharius) at Commanders, Save (Boarboyz) at Cavalry).
`anchor` overrides the fragment the link lands on where the rule is a
subsection of its target (Dispersed Formation sits inside Squad Coherency).
`name` is unique, so a rule the book prints twice for different bearers
carries a parenthesised qualifier — `Break (Electro Priests)` — and the unit
entry displays only the part before the first " (". `faction_id` is grouping
only: nothing renders from it. The faction rules pages are built from
assignments through `units.faction_id`, not from this column, so the ten
Veteran Abilities rows carry `faction_id` 1 and reach the site through
`wargear_items.special_rule_id` alone. The assignment carries the association
— one rule, many units, across factions where the book shares it (Repair
reaches Space Marines, Imperial Guard, Imperial Agents and Squats) — with
`position` for printed order and `note` for the per-unit variable (Hive Mind's
12" against 18"). `unit_profile_id` gives the rule to one profile rather than
the whole unit (ruling 46: the Wolf Scout Sergeant is a full Space Marine and
the Wolf Scouts are not); a composite foreign key keeps the profile inside the
same unit, and null means every model. A rule still appears once per unit.
Rules that the core chapters hold are pointers, not copies; faction-specific
rules are prose; the reader follows the link to the chapter for the full
text. A rule that more than one faction carries is a core chapter with a
signpost, never prose on the row: Repair is a `rules` row in `vehicle-rules`,
and row 14 points at it.

**The faction rules pages show what the faction's units carry.** A faction
category (`rule_categories.faction_id` set) renders its authored `rules` rows
in `position` order, then one chapter per prose row reached through
`unit_special_rule_assignments` and `units.faction_id`, alphabetically, each
closing with a "Carried by" line that links every carrier to its army-list
entry. Settled 18 September:

- **Signposts do not render** — no chapter on the faction page, no entry on
  the `/rules` index. The unit entry still links them to the core chapter
  through `ruleHref`. The Chaos signposts that point at authored chapters on
  the same page drop like any other, so those chapters carry no "Carried by"
  line.
- **The Chaos Marks are one authored chapter, `rules` 116 "Chaos
  Champions"**, first in `chaos-rules`, with an h3 for each Mark. The four
  Mark rows are signposts into it (`anchor` `Mark_of_Khorne` and so on). A
  character who serves a god of the player's choice carries the "Chaos
  Champion" signpost, with a `note`; the Noise Marine Champion carries Mark of
  Slaanesh. A Mark with no carrier keeps its row for the Codex Chaos list.
- **Prose-plus-pointer rows render as chapters**, opening with "See X in Y."
- **The chapter heading and its anchor use the full row name**, qualifier
  included — "Leadership (Macharius)", id `Leadership_Macharius`
  (`generateAnchorId` drops the brackets). The index lists the same names and
  links the same anchors; the unit entry keeps the stripped name and links to
  the full-name anchor.
- **An empty faction category is hidden.** With no authored rules and no
  prose chapters, the index omits it and the page and its metadata return
  not-found; the `rule_categories` row stays. Genestealer Cults is the live
  case, its units carrying only Fear and Immunity to Psychology.
- **Veteran Abilities stay on the army-list page**, where they are bought;
  the faction page is about what units carry.
- **A rule that is also an item in an Equipment section has no chapter
  here.** Where a `unit_special_rules` row is the `special_rule_id` of any
  `wargear_items` row, the faction page, the `/rules` index and the sitemap
  leave it out. A unit that carries it links to the rule's article at the foot
  of the Equipment section on the list page being read, at the row's `anchor`
  or the anchor of its name, and prints the name and any assignment note but
  not the prose, which appears once, in the article. On a list that does not
  stock the rule, the name prints unlinked and the prose prints in full. Live,
  this covers Swooping Hawk Wings, Dark Reaper Range Finder and Warp Spider
  Jump Generator on the Codex Eldar squads; batch 14e adds the Exarch Warrior
  Powers the Phoenix Lords carry (ELD-67).
- **The Space Marine Rapid Fire Rule and The Space Marine Shaken Rule are
  authored rows in `space-marines-rules`.** `shooting` and
  `breaking-rallying` each keep one linked sentence pointing at them, on the
  rule each sat beside; nothing is copied.

**The rule of thumb: `unit_options` for army-list mechanics,
`unit_special_rules` for what the model is.** Who commands, who carries the
standard, whose Leadership a squad tests on, what may be bought and in place
of what — those are options. Fear, Terror, Daemonic Aura, Iron Body, Repair —
those are special rules. Nothing is said twice; a rule that has moved to
`unit_special_rules` leaves its `unit_options` row behind.

**`wargear_categories`** — army-list-scoped section vocabulary
(`army_list_id`, `category`, `note`); the note is the section's own printed
rule ("One per model. May not be chosen for Character models."). Insert an
army list's sections as its first unit needs them; item-less categories do not
render on the list page.

**Combination items** — a priced `wargear_items` row that comes with extra
parts (Terminator Armour with Storm Bolter, Targeter and Power Fist) records
those parts in `wargear_item_components` and nowhere else: one row per part,
naming exactly one of `weapon_id`, `armour_id` or `wargear_card_id`, with
`quantity` and `position`. Position follows the order the book prints the
parts in. The list page builds the bracket after the item's name from those
rows in `position` order, "with A, B and C", each part linked to its own entry
as item names are. A quantity above one prints as a word and a plural ("with
two Death Spinner Monofilament Guns"); the plural adds an s, as the allowance
lines do. A pair the book prices as one item is one part at quantity 1: Codex
Space Wolves p55 prints "Lightning Claws (Pair, no other weapons)", so
Terminator armour with Lightning Claws carries Lightning Claws once.
`restriction` keeps only what a component cannot say, such as "Harlequins
only" or the Frag and Krak missiles of the Dark Reaper Exarch's Missile
Launcher, and follows the parts in the same bracket after a semicolon. Writing
a part in both places was rejected, because two records of one fact can
disagree. Ruled by Thomas 4 October 2026.

**Upgrades are both a linked entry and an inline option.** A printed
upgrade with its own statline (Veteran Sergeants) is authored as its own
unit — it owns its statline, loadout, armour and wargear access once,
however many squads share it — and each applicable squad carries an option
row with `to_unit_profile_id` pointing at it, rendering *"Sergeant –
upgraded to Veteran Sergeant"* with the name linking to the entry's anchor.
The upgrade price differs per list and belongs to army list entries.

**Army list names read book first, faction second.** `army_lists.name` is
"Codex: Eldar" or "Codex Army Lists: Eldar", split at the first ": " into
subtitle and title on the list page, so the logo shows the faction large with
the book beneath it. Slugs do not change with the name. The year of
publication is `army_lists.published_year`, kept out of the name. The faction
page orders lists by it, newest first, undated lists last, then by name. It
shows in two places: on the faction page beside each list, and in the list
page eyebrow after a middle dot. The browser title, the logo and the
breadcrumb do not carry it, and nothing prints where it is null. Ruled by
Thomas 5 October 2026.

## Rendering

One `ProfileFrame` per entry: the statline table (`text-base` body), a 4px
divider, then the labelled band (`text-sm`) — WEAPONS, ARMOUR, WARGEAR,
SPECIAL, SUPPORT, in that order, SPECIAL leading with the
`unit_special_rule_assignments` rows in `position` order and the
`unit_options` SPECIAL rows under them, then a Strategy Rating line where the
profile's rating differs from the list's, one `tbody` per section, **shading
per section** (sections alternate base/stripe, so the shade changes exactly at
each label), one row per item, labels repeated `sr-only` on continuation
rows. Every lead-in joins its content with ` – `.

Statline: model counts inline (`×1`, `×5–10`, `×9+` where there is no maximum); sub-line for Mastery and
wargear cards; **"—or—"** straddles the boundary between alternative rows
(absolutely positioned, `aria-hidden`, an `sr-only` "or" kept for screen
readers), and the rows flanking that boundary take `pt-4`/`pb-4` so it sits in
clear space.

WEAPONS and ARMOUR deduplicate to a single unnamed row when every profile
carries the identical set; otherwise one named row per profile. Loadout
alternatives join with an inline **"—or—"**; quantities print as "2 ×".

Option rows compose as: scope lead-in (`font-subtitle`) – grant – note –
restriction. The phrasings:

| data | renders |
| --- | --- |
| `whole_unit` | All models |
| profile, no count, multi-model profile | Guardian, any model |
| profile, no count, single-model profile | Sergeant |
| min = max = N | Guardian, 2 models |
| max = N, min null | up to 1 model |
| `add`, quantity null | additional weapons from X |
| `add`, quantity 1 | an additional weapon from X |
| `replace` + sections | one weapon from X, in place of Y |
| `add_or_replace` | additional or alternative weapons from X |
| `take_any` | any combination from X, Y, Z |
| named grant + `replaces` | Boltgun, in place of Bolt Pistol |
| `to_unit_profile_id` | upgraded to Veteran Sergeant (linked) |

A special-rule row renders as the bold rule name, stripped of any bearer
qualifier — linked to `/rules/<category slug>#<fragment>` by `ruleHref` where
`rule_id` is set. The fragment is the row's `anchor` where it has one, else
`generateAnchorId` of the target rule's name, which is the `id` the rules
page puts on that rule's section. A prose-only row links to the faction's
rules page instead, at `generateAnchorId` of the full row name, which is the
`id` the faction page puts on its chapter. Then ` – `, the rule's own prose,
and the assignment's note after it. Prose carrying a
`<section class="chart">` gets a block container and no lead-in dash: the
chart is a grid and the cell holds it as its own line under the name.

Options sharing a non-zero `alternative` sit together in the order of the
first, and each after the first opens with an inline **"—or—"**, dropping the
lead-in when it repeats (*"Servitor, any model – equipped with Hand Flamer"*,
*"—or— equipped with Laspistol"*). A compulsory grant (`optional` false) reads
**"must take"** in place of "equipped with" (*"must take Medi-Pack"*),
except on a `crew` row; in an alternative group the first
row carries it for the whole choice. A profile-scoped special rule leads with
the profile, as a per-profile loadout does: *"Wolf Scout Sergeant – Rapid
Fire"*.

**The noun follows the sections**: weapon/weapons when every granted
section's name contains "Weapons"; item/equipment otherwise ("additional
equipment from Armour, Assault Weapons, Special Weapons, Grenades").

**An option can open a section of abilities.** A section whose items are all
special rules (`wargear_items.special_rule_id` set on every item) is read as a
list of abilities, and the noun is the last word of its name, made singular:
"ability" for Veteran Abilities, "power" for Exarch Warrior Powers. `add` with a
`quantity` takes exactly that many, `take_any` with a `quantity` takes up to that
many, and `take_any` with no `quantity` takes any number. A count above one
reads "different". `whole_unit` true means the unit buys the ability once,
whatever its size, and the line leads with "The unit" ("The unit – one ability
from Veteran Abilities"); otherwise the usual lead-ins apply and the ability is
per model. `optional` false reads "must take" as elsewhere. The Imperial Guard
squads carry `add`, quantity 1, `whole_unit` true; the Exarch carries
`take_any`, quantity 2, `whole_unit` false ("up to two different powers from
Exarch Warrior Powers"). Both sit under SPECIAL, as the codexes print them
(VET-3, ELD-62).

**`army_list_entries.note` groups adjacent byte-identical notes.** On the
list page, consecutive entries within a category whose `note` values are the
same string are rendered as one block on the group surface with the note
printed once beneath them (`groupBlocks` in the list page). The comparison
is exact: a note that differs by a character, or an entry between two
matching notes with no note of its own, breaks the block and each note
prints again under its own entry. Author a shared note identically on every
entry it covers, and keep those entries adjacent in `position`.

**A named allowance set lists its members in brackets.** Wherever an
allowance line prints a set's name, the members follow it in brackets in
`position` order: "Anti-grav platforms (Lascannon, Scatter Laser, Heavy Plasma
Gun, Distort Cannon and Vibro-cannon on Anti-grav Platform): up to one per
Guardian Squad". Member names in the bracket are always singular. They are
joined with "and" in the set's own lead and with "or" after "per" ("per clan
mob (Bad Moons, Blood Axe, Death Skull, Evil Sunz or Snakebite Mob)"). Words
that end every member's name print once. The bracket repeats on every line
that names the set, so each line reads on its own, and no separate sentence
defines the set. A set with no name, or whose
members are exactly the entries of one band, takes no bracket, because its name
or the band heading already says what it holds (ELD-46).

**An allowance rule can set a minimum.** `army_list_allowance_rules.min_count`
is the fewest the army must take per target, on the pattern of `allowance_min`
on the entry. Null leaves the line as it was, "Up to one per …". Equal to
`count` the line reads "Exactly one per Eldar Pirates", and below it the line
prints a range, "One to three per …". "More" follows the number as before
("Exactly one more per …") and a qualifier still follows a comma. Rules with
different minimums never share a target list; where the parts of a merged line
differ, each part states its own amount ("Up to one per Guardian Squad, or
exactly one per Eldar Pirates"). A rule counted per rule takes no minimum, and
the database refuses one (ELD-47).

## The calls

| Date | Call | Ruling |
| --- | --- | --- |
| 23 Aug | Statline dictionary | `characteristic_profiles` dropped; nine nullable columns inlined on the profile. |
| 23 Aug | Composition vs allowance | `models_min`/`models_max` on the profile are composition; allowance belongs to the army list entry. |
| 23 Aug | Reconcile to one entry | A unit printed in more than one book is one row; same name with different content is two units (Weirdboy). |
| 23 Aug | No prose unless strictly necessary | Reversed display-now; the deferred option shapes were designed as structure. |
| 23 Aug | Free vs priced choices | A printed free alternative is a loadout alternative; anything priced is an option. |
| 24 Aug | Options are unit-level | Units live under their most general parentage; generic units get generic wargear options; per-list variation waits on army list entries. |
| 24 Aug | Points off profiles | `/profiles` names and links; prices live with army list entries and datafaxes. |
| 26 Aug | Codex four-label layout | Statline carries the nine characteristics only; WEAPONS/ARMOUR/WARGEAR/SPECIAL are labelled rows in the source's words, one frame, per-item rows, per-section shading. |
| 26 Aug | Options split by source label | `option_group`: wargear / special / support (Eldar's own label), never an invented heading. |
| 26 Aug | Exact counts | "Two Guardsmen may form a weapons team" is exactly 2 — `models_min`; "up to" only when the book says up to. |
| 26 Aug | Grant modes | Every grant states its mode — add, replace, add_or_replace, take_any — as data (`grant_mode`), not prose. |
| 26 Aug | "Model" resolves to a profile | The book's bare "one model" is stored against the profile it means when the entry makes that determinable (Tactical → Space Marine, the Sergeant having its own grant). |
| 26 Aug | Whole squad vs any model | Uniform squad-wide choices are `whole_unit` ("the whole squad"); per-model discretion is profile-scoped with no count ("any model"). The codex prints "the entire squad" for both; the site distinguishes them. |
| 26 Aug | Whole-squad substitutions are options | Even free ones — a loadout alternative is per-model only (Guardian laspistols). |
| 26 Aug | Graded profiles are alternatives | `unit_profiles.alternative`; rendered with "—or—" on the row boundary, flanking rows padded. |
| 26 Aug | Upgrades | A printed upgrade entry is its own unit plus an inline `to_unit_profile_id` option on each squad it applies to (Veteran Sergeant). |
| 26 Aug | Red generalised | `2ed-dark-red` at `text-xl` or above anywhere on the site — the page background measures the same as the card face (4.22 light / 3.12 dark). |
| 2 Sep | Psi-level is the hero level | A psyker character's psi-level is its Wounds value, 1 to 4, unless the profile prints a mastery level; `mastery_level` is set from `w` in that case, the Prime Psyker grades included. |
| 2 Sep | Characteristics are text | The nine columns are text, not integers, and store the printed value — a rolled characteristic (`D6`) is stored as printed rather than resolved or left null. |
| 3 Sep | Unit special rules get a join | `unit_special_rules` and `unit_special_rule_assignments`, on the weapon and armour special-rule shape. `rule_id` points at a rules-chapter rule, `rule` carries faction-specific prose, both together carry a printed exception, and the assignment's `note` carries the per-unit variable. |
| 18 Sep | Faction pages show carried prose | Signposts and empty faction categories do not render; chapter headings and anchors use the full row name; a rule shared across factions is a core chapter with a signpost (Repair to `vehicle-rules`); the Space Marine Rapid Fire and Shaken rules are `space-marines-rules` rows, each leaving one linked sentence behind. |
| 18 Sep | Whole-unit phrase | The `whole_unit` lead-in reads "All models" ("Guardian, all models" with a profile). Unit-wide special notes on a multi-model unit (a Chimera transport, a mounted save, a squad-wide rule) are `whole_unit`, never bare "Any model". |
| 24 Sep | Profile-scoped rules, option choices, counts-as weapons | `unit_special_rule_assignments.unit_profile_id` (ruling 46) prints the rule against its profile; `unit_options.alternative` groups either/or options under "—or—" and `optional` false reads "must take"; `grant_mode` `crew` marks a crew manning a support weapon; `weapons.counts_as_weapon_id` (ruling 48) prints the book's name with the other weapon's profile. |
| 2 Oct | Strategy Rating | The default sits on `factions` and every list of the faction takes it, inherited from the parent where a faction has none; a character's rating shows only where it differs. |
| 4 Oct | Open-ended sizes | A profile with no `models_max` prints its minimum with a plus (`×9+`), so it no longer reads as a fixed count; a minimum of 0 with no maximum still prints `×0`. |
| 4 Oct | Combination items | `wargear_item_components` is the one record of an item's extra parts, in printed order, and the list page builds the bracket from it; `restriction` keeps only what a component cannot say, after a semicolon in the same bracket. |
| 5 Oct | Set members in brackets | A named set's members print in brackets, always singular, after its name on every allowance line that names it, shared final words once; the sentence defining the set is dropped. An unnamed set, or one that is exactly a band, takes no bracket. |
| 5 Oct | Allowance minimums | `army_list_allowance_rules.min_count`: null prints "Up to", equal to `count` prints "Exactly", below it a range; the parts of a merged line with different minimums each state their own amount. |
| 5 Oct | Ability sections | An option that opens a section of special-rule items reads "one ability from …" (`add`) or "up to two different powers from …" (`take_any` with `quantity`); `whole_unit` true means bought once for the unit and leads with "The unit –". |
| 5 Oct | Army list names and years | Book first, faction second ("Codex: Eldar", "Codex Army Lists: Eldar"); the list page swaps the split so the logo is unchanged. `army_lists.published_year` orders the faction page, newest first, then name, and shows on the faction page and in the list page eyebrow only; the title, logo and breadcrumb do not carry it. |
| 5 Oct | Section rules | A special rule that is an item in an Equipment section links from a unit entry to that section's article on the list page and has no chapter on the faction rules page; on a list that does not stock it, the name prints unlinked and the prose prints in full. Where it is stocked, the entry prints the name and any assignment note, not the prose, and the article spaces its paragraphs as the entry does. |

Schema changes to these tables were applied as plain SQL with explicit
approval up to 27 August and are absent from the Supabase migrations history;
the statements are recorded in the project docs named above and were backfilled
by a 2 September migration. All migrations up to 5 October were folded into a
single baseline on 6 October; from then on every schema change goes in as a
migration.
