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
  left it implicit — "additional", "in place of", "any model", "the whole
  squad", "up to N", "exactly N" are all distinct and all said. Where the
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
  semantics as `unit_profile_weapons.alternative`.
- `mastery_level` and `wargear_cards_max` render as a sub-line under the
  profile name ("Mastery 4 · 1 wargear card").
- `points` is per model of this profile (the graded-character and
  per-model-priced-mob mechanism); not rendered on `/profiles`.
- The nine characteristics are nullable integers; null renders as an
  en-dash, distinct from 0.

**`unit_profile_weapons`** — the printed base loadout. `alternative` groups
either/or sets (*"Bolt Pistol, Axe —or— Boltgun"*) and is a **per-model
choice only** — a whole-squad substitution is an option, not a loadout
alternative, even when free (the Guardian laspistol call). `quantity` covers
"two laspistols". Position is explicit and follows the printed order.

**`unit_profile_armour`** — per profile; mixed suits/fields/shields are
multiple rows.

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
  - `take_any` — open access to the listed sections.
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
- `restriction` — a short qualifying line rendered under the row ("The
  leader and/or one other model.").
- `note` — gate-clean prose for what structure cannot hold; voice per
  `style-conventions.md`.

**`wargear_categories`** — faction-scoped section vocabulary
(`faction_id`, `category`, `note`); the note is the section's own printed
rule ("One per model. May not be chosen for Character models."). Insert a
faction's sections as its first unit needs them; item-less categories do not
render on the faction page.

**Upgrades are both a linked entry and an inline option.** A printed
upgrade with its own statline (Veteran Sergeants) is authored as its own
unit — it owns its statline, loadout, armour and wargear access once,
however many squads share it — and each applicable squad carries an option
row with `to_unit_profile_id` pointing at it, rendering *"Sergeant –
upgraded to Veteran Sergeant"* with the name linking to the entry's anchor.
The upgrade price differs per list and belongs to army list entries.

## Rendering

One `ProfileFrame` per entry: the statline table (`text-base` body), a 4px
divider, then the labelled band (`text-sm`) — WEAPONS, ARMOUR, WARGEAR,
SPECIAL, SUPPORT, in that order, one `tbody` per section, **shading per
section** (sections alternate base/stripe, so the shade changes exactly at
each label), one row per item, labels repeated `sr-only` on continuation
rows. Every lead-in joins its content with ` – `.

Statline: model counts inline (`×1`, `×5–10`); sub-line for Mastery and
wargear cards; **"—or—"** straddles the boundary between alternative rows
(absolutely positioned, `aria-hidden`, an `sr-only` "or" kept for screen
readers), and the rows flanking that boundary take `pt-4`/`pb-4` so it sits
in clear space.

WEAPONS and ARMOUR deduplicate to a single unnamed row when every profile
carries the identical set; otherwise one named row per profile. Loadout
alternatives join with an inline **"—or—"**; quantities print as "2 ×".

Option rows compose as: scope lead-in (`font-subtitle`) – grant – note –
restriction. The phrasings:

| data | renders |
| --- | --- |
| `whole_unit` | the whole squad |
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

**The noun follows the sections**: weapon/weapons when every granted
section's name contains "Weapons"; item/equipment otherwise ("additional
equipment from Armour, Assault Weapons, Special Weapons, Grenades").

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

Schema changes to these tables have so far been applied as plain SQL with
explicit approval and are **not in the Supabase migrations history**; the
statements are recorded in the project docs named above.
