#!/usr/bin/env python3
"""Standing verification suite over every prose column, from texts.json.

The checks in docs/style-conventions.md, mechanised and extended beyond
`rules` to every kind dump-texts.py emits. Run after any batch change:

  python3 scripts/verify/verify.py                  # texts.json beside dump-texts.py
  python3 scripts/verify/verify.py path/texts.json
  python3 scripts/verify/verify.py --list           # show exempt hits too

Exit 1 on any unexempt finding. Exemptions live in exemptions.json beside this
file, keyed by check name; entries are "kind:name" or "kind:name:detail" and
each needs a reason. Checks that need human judgment (series marking, repeat
link groups, first-mention-links) stay manual — see the doc.

Entity and non-ASCII checks apply only to HTML columns. Rendered fields that are
plain JSX take literal characters, and an entity there renders as its own
characters: psychic_power_cards.note, wargear_categories.note and
rules_heading, and the army-list note columns other than army_list_entries.note.
The plain_entity check catches those; it is the mirror of ampersand and runs
only off HTML.
The dump joins the psychic note into the card's text, so `psychic` stays in
HTML_KINDS and any note needing literal characters belongs in exemptions.
unit_options.note, damage_charts.note, datafax_locations.note,
unit_special_rules.rule, unit_special_rule_assignments.note,
wargear_categories.rules_intro, army_lists.description and, since 4 November,
army_list_entries.note are rendered through dangerouslySetInnerHTML, so
`unit_wargear`, `damage_chart`, `datafax_location`, `unit_rule`,
`unit_rule_note`, `wargear_cat_intro`, `army_list` and `entry` are HTML kinds.
A unit rule's prose may carry a D6 chart, so `unit_rule` ids join the
duplicate_id cross-check under a namespace of their own — every unit rule on
an army-list page shares that page.
Kinds not rendered anywhere yet (unit, equipment_weapon) get voice checks only.
Links into the two card pages are checked against the card anchors, built
from the `cards` list the dump carries as lib/anchors.ts builds them: the
name, each availability in position order, then the origin. A page's sections are
`available-<name>` for each availability that is some card's first.
card_points, double_grant and priced_grant read the `grants` block and hold
the card-pricing ruling of 3 November: a compulsory unit_options card grant
adds the card's points to the entry, and a profile grant is included in the
unit's price.
magazine_citation and unit_on_magazine_list read the `sources` block: every
rules.source, units.source and army_lists.source takes the citation form, and
no unit on a list that has a source carries a source of its own (MAG-5).
The checks named section_* and requirement_*, entry_option_compulsory and
alternative_max read the `requirements` block and hold LB-14 (the design of
4 November, sections 2 and 4.2). section_limit reads a section note's opening
sentence against its limit columns through LIMIT_VOCABULARY. section_opener
reports a section no unit option opens, and an "X only" sentence that
disagrees with the units and profiles that open it; sections 78 to 80 are
held to FIXED_OPENERS instead. The requirement checks repeat the table's
per-kind constraints so that a dump from any branch reports by list.
The second LB-14 migration (army_list_requirements_2) adds the rest.
requirement_profile holds a row's subject_profile_id to the subject entry's
unit, and requirement_points an ally_scope points row to a percentage.
item_eligibility holds LB14D-9 (b): an item with eligibility rows has a
restriction, and a restriction saying "only" or "Not" has eligibility rows or
an affiliation_id. affiliation_list holds LB14D-4: an affiliation gates or
fixes only rows on its own list, and an entry's affiliation_label names a
label some affiliation on that list carries. mastery_level_max holds BF-3 (a):
an entry that buys Mastery Levels at a per-level price states its cap, and
only such an entry does. replaced_weapons reports an option that holds
weapons both in replaces_weapon_id and in unit_option_replaced_weapons.
requirement_profile also holds a substitution's target_profile_id to the
target entry's unit (BF-18).
The third migration (army_list_requirements_3) adds the attachment mode
leads. requirement_leader holds BF-32: a leads row carries no count, and no
entry has both a must and a leads row to the same target.
armour_bars holds BF-17 and BF-19: an armour flagged bars_bike is on no
profile of a unit whose datafax has the Bikes & Trikes motive type,
BIKE_MOTIVE_TYPE, and on no profile that a compulsory unit option gives such a
unit to ride, and an armour flagged bars_jump_pack is on no profile that is also granted the
Jump Pack card, JUMP_PACK_CARD, and on no wargear item that bundles it.
weapon_replaces holds BF-38, and reads the `alternatives` rows: the rows of one
alternative group agree on replaces_datafax_weapon_id, grant_mode and
add_points, a row replaces only a row on its own datafax, and a row that
replaces another is optional.
The cross-list checks read the `lineup` block and hold the consistency
rulings XL-1 to XL-7. requirement_commander wants a commander row with count
0 on every list with entries, and reports a substitution row whose subject or
target is a commander row's subject or has a note saying it commands.
ride_option wants a whole-unit support option on every squad a ride open to
squads can carry: the targets of its squads-side transport rows, or without
them every entry in the list's SQUAD_BANDS, less any squad every profile of
which wears armour that bars bikes when the ride is a bike (BF-14, BF-17).
requirement_attachment wants attachment rows covering every profile of a
character whose entry note or unit option notes match JOINS, magazine asides
left out; allowance rules play no part (XL-4). A finding on a list in UNWRITTEN_LISTS is held, not failed, and shows
with --list. unwritten_lists keeps that set honest and is never held.
"""
import json, os, re, sys, unicodedata
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

HTML_KINDS = ("rule:", "weapon", "weapon_rule", "armour", "armour_rule",
              "wargear_card", "vehicle_card", "mission", "strategy",
              "psychic", "warp",
              "faction", "damage_result", "unit_wargear", "damage_chart",
              "datafax_location", "unit_rule", "unit_rule_note", "unit_cat",
              "wargear_cat_intro", "army_list", "entry")
ENTITIES = {"quot", "apos", "mdash", "ndash", "deg", "amp",
            "dagger", "Dagger", "sect", "times", "divide",
            "ldquo", "rdquo", "uarr", "sup2", "AElig"}
PAIRED = ("p", "a", "li", "em", "h3", "h4", "strong", "tr", "td", "th",
          "sup", "section", "div", "table", "thead", "tbody", "ol", "ul",
          "blockquote", "small")


def is_html(kind):
    return kind.startswith("rule:") or kind in HTML_KINDS


def strip_scripts(text):
    return re.sub(r"<script\b.*?</script>", " ", text, flags=re.S | re.I)


def strip_tags(text):
    return re.sub(r"<[^>]+>", " ", strip_scripts(text))


def strip_blockquotes(text):
    return re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S | re.I)


def strip_charts(text):
    return re.sub(r'<section[^>]*class="chart"[^>]*>.*?</section>', " ", text, flags=re.S)


def anchor(name):
    x = name.replace("&amp;", "and").replace("&", "and")
    x = re.sub(r"[^A-Za-z0-9 ._-]", "", x)
    x = re.sub(r"\s+", " ", x).strip()
    return x.replace(" ", "_")


CARD_PAGES = {"wargear_card": "wargear-cards", "vehicle_card": "vehicle-cards"}


def slug(text):
    """generateAnchorId: @sindresorhus/slugify, `_` separator, case kept,
    `-` and `.` preserved."""
    text = unicodedata.normalize("NFKD", text.replace("&", " and "))
    text = text.encode("ascii", "ignore").decode()
    text = re.sub(r"([a-zA-Z\d]+)['\u2019]([ts])(\s|$)", r"\1\2\3", text)
    text = re.sub(r"[^a-zA-Z\d.-]+", "_", text).replace("\\", "")
    return re.sub(r"_{2,}", "_", text).strip("_")


def card_anchors(texts, cards):
    found = {page: set() for page in CARD_PAGES.values()}
    for page, rows in cards.items():
        for card in rows:
            found[page].add(slug(" ".join([card["n"], *card["a"], card["o"]])))
            if card["a"]:
                found[page].add("available-" + "-".join(card["a"][0].lower().split()))
    for row in texts:
        if row["k"] in CARD_PAGES:
            found[CARD_PAGES[row["k"]]].update(re.findall(r'id="([^"]+)"', row["t"]))
    return found


def check_tag_balance(k, n, t):
    for tag in PAIRED:
        opens = len(re.findall(rf"<{tag}(?=[\s>])", t))
        closes = t.count(f"</{tag}>")
        if opens != closes:
            yield f"<{tag}> {opens} opened, {closes} closed"


def check_heading_id(k, n, t):
    for match in re.finditer(r"<h([34])([^>]*)>", t):
        attrs = match.group(2)
        if 'id="' in attrs:
            continue
        span = re.search(r"span ([1-6]) / span", attrs)
        if span and int(span.group(1)) < 6:
            continue
        yield f"h{match.group(1)} with no id ({attrs.strip()[:40] or 'no attrs'})"


def check_empty_id(k, n, t):
    if re.search(r'id=""', t):
        yield 'empty id=""'


def check_li_id(k, n, t):
    for _ in re.finditer(r"<li[^>]*\sid=", t):
        yield "<li> carrying an id"


def check_stray_ws(k, n, t):
    for match in re.finditer(r"<[a-z][a-z0-9]*\s+>", t):
        yield f"stray whitespace: {match.group(0)!r}"


def check_chart_title(k, n, t):
    for match in re.finditer(r"<h3([^>]*span 6[^>]*)>([^<]*)</h3>", t):
        if "Chart" not in match.group(2):
            yield f'chart title lacking "Chart": {match.group(2).strip()[:40]}'


def check_spaced_mdash(k, n, t):
    for match in re.finditer(r"\S &mdash;|&mdash; ", t):
        at = max(0, match.start() - 30)
        yield f"spaced &mdash;: …{t[at:match.end() + 10]!r}"


def check_ampersand(k, n, t):
    t = strip_scripts(t)
    for match in re.finditer(r"&([A-Za-z][A-Za-z0-9]*);|&(?![A-Za-z][A-Za-z0-9]*;)", t):
        name = match.group(1)
        if name is None:
            yield "bare & (not an entity)"
        elif name not in ENTITIES:
            yield f"&{name}; not a permitted entity"


def check_plain_entity(k, n, t):
    for match in re.finditer(r"&(?:[A-Za-z][A-Za-z0-9]*|#[0-9]+);", t):
        yield f"{match.group(0)} renders literally in a plain-JSX column"


def check_non_ascii(k, n, t):
    text = strip_tags(t)
    bad = sorted({c for c in text if ord(c) > 126 or c in "'\""})
    if bad:
        yield "literal characters: " + " ".join(repr(c) for c in bad)


def check_gendered(k, n, t):
    """crewman/crewmen everywhere; pronouns only in rules, where no named
    character exists to earn them — card flavour about Leman Russ keeps 'his'."""
    text = strip_tags(strip_blockquotes(t)).lower()
    words = ["crewman", "crewmen"]
    if k.startswith("rule:"):
        words += ["he", "him", "his", "she", "her"]
    for word in words:
        count = len(re.findall(rf"\b{word}\b", text))
        if count:
            yield f"{word!r} x{count}"


def check_die(k, n, t):
    """The noun is banned ('dice, never die'); the verb is ordinary English.
    Flag only determiner+die and 'die roll' — 'should that model die' passes."""
    text = strip_tags(strip_blockquotes(t))
    count = len(re.findall(
        r"\b(?:a|the|each|every|one|per|single)\s+die\b|\bdie\s+roll",
        text, re.I))
    if count:
        yield f"'die' as noun x{count}"


def check_second_person(k, n, t):
    if k == "rule:the-golden-rule":
        return
    count = len(re.findall(r"\byou\b|\byour\b", strip_tags(strip_blockquotes(t)), re.I))
    if count:
        yield f"you/your x{count}"


def check_inline_p(k, n, t):
    """Markup 1 holds for the rules decks; weapons and cards store the inline
    form freely, so this only runs on rule:* kinds. Inside an open <li> the
    inline form always stands, headings between <li> and <p> included."""
    if not k.startswith("rule:"):
        return
    for match in re.finditer(r"<p>[^\n<]", t):
        before = t[:match.start()]
        if len(re.findall(r"<li(?=[\s>])", before)) > before.count("</li>"):
            continue
        yield f"inline <p> outside <li>: {t[match.start():match.start() + 40]!r}"


ASIDE_KINDS = {"removal"}


def check_magazine_source(k, n, t):
    """A magazine aside keeps its citation in data-source, which the renderer
    lifts into the head; the paragraph no longer opens with it. data-kind, where
    present, names a form the renderer knows."""
    for match in re.finditer(
            r'<section class="house-rule"([^>]*)>\s*<span class="label">'
            r'(Citadel Journal|White Dwarf)', t):
        if not re.search(r'\sdata-source="[^"]+"', match.group(1)):
            yield f"{match.group(2)} aside with no data-source"
        kind = re.search(r'\sdata-kind="([^"]*)"', match.group(1))
        if kind and kind.group(1) not in ASIDE_KINDS:
            yield f"{match.group(2)} aside with data-kind {kind.group(1)!r}"


def check_nesting(k, n, t):
    for tag in ("a", "strong"):
        depth = 0
        for match in re.finditer(rf"<{tag}(?=[\s>])|</{tag}>", t):
            depth += 1 if not match.group(0).startswith("</") else -1
            if depth > 1:
                yield f"nested <{tag}>"
                break


PER_TEXT = {
    "tag_balance": check_tag_balance, "heading_id": check_heading_id,
    "empty_id": check_empty_id, "li_id": check_li_id,
    "stray_ws": check_stray_ws, "chart_title": check_chart_title,
    "spaced_mdash": check_spaced_mdash, "ampersand": check_ampersand,
    "non_ascii": check_non_ascii, "plain_entity": check_plain_entity,
    "gendered": check_gendered,
    "die_noun": check_die, "second_person": check_second_person,
    "inline_p": check_inline_p, "nesting": check_nesting,
    "magazine_source": check_magazine_source,
}
HTML_ONLY = {"tag_balance", "heading_id", "empty_id", "li_id", "stray_ws",
             "chart_title", "spaced_mdash", "ampersand", "non_ascii",
             "inline_p", "nesting", "magazine_source"}
PLAIN_ONLY = {"plain_entity"}


def cross_checks(texts, chapters, cards):
    ids = defaultdict(list)
    for row in texts:
        if row["k"].startswith("rule:"):
            slug = row["k"][5:]
            ids[slug].append(anchor(row["n"]))
        elif row["k"] == "unit_rule":
            slug = "unit_rule"
        else:
            continue
        for match in re.finditer(r'id="([^"]+)"', row["t"]):
            ids[slug].append(match.group(1))

    for slug, found in ids.items():
        label = slug if slug == "unit_rule" else f"rule:{slug}"
        seen = set()
        for i in found:
            if i in seen:
                yield "duplicate_id", label, i, f"id {i} defined twice"
            seen.add(i)

    for row in texts:
        for match in re.finditer(r'href="/rules/([a-z-]+)#([^"]+)"', row["t"]):
            slug, fragment = match.groups()
            if slug in ids and fragment not in ids[slug]:
                yield ("dead_link", row["k"], row["n"],
                       f"/rules/{slug}#{fragment} resolves to nothing")
        if chapters is not None:
            for match in re.finditer(r'href="/rules/([^"#/?]+)', row["t"]):
                if match.group(1) not in chapters:
                    yield ("dead_chapter", row["k"], row["n"],
                           f"/rules/{match.group(1)} is not a rules chapter")

    if cards is not None:
        anchors = card_anchors(texts, cards)
        for row in texts:
            for match in re.finditer(
                    r'href="/wargear/(wargear-cards|vehicle-cards)#([^"]+)"', row["t"]):
                page, fragment = match.groups()
                if fragment not in anchors[page]:
                    yield ("dead_card_link", row["k"], row["n"],
                           f"/wargear/{page}#{fragment} resolves to nothing")

    paragraphs = defaultdict(list)
    for row in texts:
        for match in re.finditer(r"<p[^>]*>(.*?)</p>", strip_charts(row["t"]), re.S):
            text = re.sub(r"\s+", " ", strip_tags(match.group(1))).strip().lower()
            if len(text.split()) > 8:
                paragraphs[text].append((row["k"], row["n"]))
    for text, places in paragraphs.items():
        if len({p[1] for p in places}) > 1:
            first = sorted(set(places))[0]
            names = " = ".join(sorted({f"{k}:{n}" for k, n in places}))
            yield "dup_paragraph", first[0], first[1], names


NUMERIC = re.compile(r"^\d+(\.\d+)?$")
CITATION = re.compile(r"^(Citadel Journal|White Dwarf) \d+, pp?\d+(–\d+)?(, reader submission)?$")


def source_checks(sources):
    for kind in ("rules", "army_lists", "units"):
        for row in sources[kind]:
            if not CITATION.match(row["s"]):
                yield ("magazine_citation", kind, row["n"],
                       f"source {row['s']!r} is not in the citation form")
    for row in sources["units"]:
        if row["l"]:
            yield ("unit_on_magazine_list", "units", row["n"],
                   f"carries a source on a list with its own: {', '.join(row['l'])}")


def grant_checks(grants):
    cards = {kind: {c["id"]: c for c in grants["cards"][kind]}
             for kind in ("wc", "vc")}

    def card(kind, ident):
        return cards[kind].get(ident, {"n": f"{kind} {ident}", "p": None})

    def held(row):
        return [(kind, row[kind]) for kind in ("wc", "vc") if row.get(kind)]

    profiled = {(row["u"], kind, ident)
                for row in grants["profiles"] for kind, ident in held(row)}
    compulsory = {}
    for row in grants["options"]:
        for kind, ident in held(row):
            name = card(kind, ident)["n"]
            if not row["opt"]:
                compulsory[row["id"]] = (row["u"], kind, ident)
                points = card(kind, ident)["p"]
                if points is None or not NUMERIC.match(str(points)):
                    yield ("card_points", "unit", row["un"],
                           f"unit_options {row['id']}: {name} has points {points!r}")
            if (row["u"], kind, ident) in profiled:
                yield ("double_grant", "unit", row["un"],
                       f"unit_options {row['id']}: {name} is also a profile grant")

    forced = profiled | set(compulsory.values())
    for row in grants["entry_options"]:
        if row.get("opt") is False and row.get("wc"):
            points = card("wc", row["wc"])["p"]
            if points is None or not NUMERIC.match(str(points)):
                yield ("entry_option_compulsory", "unit", row["un"],
                       f"army_list_entry_options {row['id']}: {card('wc', row['wc'])['n']} "
                       f"has points {points!r}")
        if row.get("wc") and (row["u"], "wc", row["wc"]) in forced:
            yield ("priced_grant", "unit", row["un"],
                   f"army_list_entry_options {row['id']}: prices "
                   f"{card('wc', row['wc'])['n']}, which the unit must carry")
        if row.get("uo") in compulsory:
            _, kind, ident = compulsory[row["uo"]]
            yield ("priced_grant", "unit", row["un"],
                   f"army_list_entry_options {row['id']}: prices unit_options "
                   f"{row['uo']}, a compulsory grant of {card(kind, ident)['n']}")


LIMIT_VOCABULARY = {
    "One per model.": ("model", 1, False, False),
    "One item per model.": ("model", 1, False, False),
    "Any number per model.": ("model", None, False, False),
    "One item per crew.": ("crew", 1, False, False),
    "One per weapons team.": ("team", 1, False, False),
    "One per support team.": ("team", 1, False, False),
    "Any number per Squad.": ("unit", None, False, False),
    "Two per model.": ("model", 2, False, False),
    "One item or combination per model.": ("model", 1, True, False),
    "Up to two per model, each a different power.": ("model", 2, False, True),
}
FIXED_OPENERS = {78: {315}, 79: {315}, 80: {311}}
SUBJECT_ITEMS = {"wargear_item_id", "unit_option_id", "entry_option_id"}
TARGET_ITEMS = {"target_wargear_item_id", "target_unit_option_id", "target_entry_option_id"}


def stem(name):
    name = re.sub(r"\s+models?$", "", name.strip()).lower()
    return name[:-1] if name[-1:] in ("s", "z") else name


def section_checks(req):
    openers = defaultdict(list)
    for row in req["openers"]:
        openers[row["c"]].append(row)
    for section in req["sections"]:
        label = f"{section['l']}:{section['n']}"
        head = f"wargear_categories {section['id']}"
        note = section.get("note") or ""
        sentences = re.split(r"(?<=\.)\s+", note.strip())
        found = (section.get("scope"), section.get("max"),
                 section.get("combo", False), section.get("distinct", False))
        expected = LIMIT_VOCABULARY.get(sentences[0])
        if section.get("scope") is None:
            yield "section_limit", "wargear_cat", label, f"{head}: limit_scope is null"
        if expected is None:
            yield ("section_limit", "wargear_cat", label,
                   f"{head}: opening sentence {sentences[0]!r} is not in the vocabulary")
        elif found != expected or section.get("min") is not None:
            yield ("section_limit", "wargear_cat", label,
                   f"{head}: {sentences[0]!r} reads {expected}, columns hold {found}"
                   f" with limit_min {section.get('min')!r}")

        links = openers[section["id"]]
        if not links:
            yield "section_opener", "wargear_cat", label, f"{head}: no unit option opens it"
            continue
        if section["id"] in FIXED_OPENERS:
            ids = {row["uo"] for row in links}
            if ids != FIXED_OPENERS[section["id"]]:
                yield ("section_opener", "wargear_cat", label,
                       f"{head}: opened by unit_options {sorted(ids)}, fixed at "
                       f"{sorted(FIXED_OPENERS[section['id']])}")
            continue
        for sentence in sentences[1:]:
            match = re.match(r"^(.+) only\.$", sentence)
            if not match:
                continue
            named = [stem(n) for n in re.split(r",\s*|\s+and\s+", match.group(1))]
            held = {row["uo"]: f"{row['un']} {row.get('pn', '')}".lower() for row in links}
            for name in named:
                if not any(name in text for text in held.values()):
                    yield ("section_opener", "wargear_cat", label,
                           f"{head}: {sentence!r} names {name!r}, which no opener is")
            for option, text in held.items():
                if not any(name in text for name in named):
                    yield ("section_opener", "wargear_cat", label,
                           f"{head}: unit_options {option} ({text.strip()}) opens it "
                           f"against {sentence!r}")


def kind_ok(row):
    subjects = {s["c"] for s in row["s"]}
    targets = {t["c"] for t in row["t"]}
    mode, count, label = row.get("mode"), row.get("count"), row.get("label")
    kind = row["k"]
    if row.get("sp") and not (subjects == {"entry_id"}
                              and kind in ("attachment", "substitution", "requires_unit")):
        return False
    if kind == "requires_unit":
        return (subjects <= {"entry_id", "set_id", "unit_option_id", "entry_option_id", "ally_id"}
                and bool(targets) and targets <= {"target_entry_id", "target_set_id",
                                                  "target_unit_option_id",
                                                  "target_entry_option_id"}
                and mode in (None, "unless_transporting") and label is None)
    if kind == "commander":
        return (subjects == {"entry_id"} and count is not None and mode in ("must", "may")
                and not targets & {"target_set_id", "target_category_id"})
    if kind == "transport":
        return (subjects == {"entry_id"} and bool(targets & {"target_entry_id", "target_set_id"})
                and mode in ("squads", "characters"))
    if kind == "band_reassignment":
        return (subjects <= {"entry_id", "unit_category_id"} and "target_category_id" in targets
                and mode in ("rider", "always"))
    if kind == "pairing":
        return (subjects <= SUBJECT_ITEMS | {"entry_id"}
                and targets <= TARGET_ITEMS | {"target_entry_id"}
                and mode in ("requires", "excludes", "exclusive")
                and (mode == "exclusive") == (not targets)
                and ("entry_id" not in subjects or mode == "exclusive")
                and ("target_entry_id" not in targets or (
                    mode == "excludes" and subjects <= {"wargear_item_id", "unit_option_id"})))
    if kind == "attachment":
        return (subjects == {"entry_id"} and bool(targets & {"target_entry_id", "target_set_id"})
                and mode in ("must", "may", "leads"))
    if kind == "army_cap":
        return (subjects <= {"entry_id", "set_id", "unit_category_id", "unit_option_id"}
                and count is not None and mode in ("models", "units", "points", "options")
                and not (mode == "units" and "entry_id" in subjects))
    if kind == "army_variant":
        return (subjects == {"unit_category_id"} and label is not None
                and row.get("variant") is None)
    if kind == "ally_scope":
        need = {"requires": "target_entry_id", "excludes_unit": "target_unit_id",
                "excludes_ally": "target_ally_id"}
        if subjects != {"ally_id"} or mode not in (*need, "commanders", "points"):
            return False
        if mode in ("commanders", "points"):
            return count is not None and not targets & set(need.values())
        return need[mode] in targets
    if kind == "substitution":
        return (subjects == {"entry_id"} and "target_entry_id" in targets
                and targets <= {"target_entry_id", "target_profile_id"} and mode is None)
    if kind == "unit_composition":
        return (subjects == {"entry_id"} and "target_entry_id" in targets
                and mode in ("mounted_with", "min_models_when_mounted")
                and (mode == "min_models_when_mounted") == (count is not None))
    return False


def requirement_checks(req):
    rows = {row["id"]: row for row in req["rows"]}
    transports = {s["id"] for row in req["rows"] if row["k"] == "transport"
                  for s in row["s"] if s["c"] == "entry_id"}
    pairs = defaultdict(set)
    for row in req["rows"]:
        if row["k"] in ("attachment", "requires_unit"):
            for s in row["s"]:
                for t in row["t"]:
                    pairs[(s["c"], s["id"], t["c"], t["id"])].add(
                        (row["k"], row.get("mode")))

    for row in req["rows"]:
        subject = row["s"][0]["n"] if row["s"] else "?"
        label = f"{row['l']}:{subject}"
        head = f"army_list_requirements {row['id']}"
        paired = row["k"] == "substitution" and {t["c"] for t in row["t"]} == {
            "target_entry_id", "target_profile_id"}
        if len(row["s"]) != 1 or (len(row["t"]) > 1 and not paired) or (
                (row.get("variant") is None) != (row.get("under") is None)):
            yield ("requirement_kind", row["k"], label,
                   f"{head}: needs one subject, at most one target and a variant pair")
        elif not kind_ok(row):
            yield "requirement_kind", row["k"], label, f"{head}: fails the {row['k']} check"
        for ref in row["s"] + row["t"]:
            if "l" in ref and ref["l"] != row["l"]:
                yield ("requirement_list", row["k"], label,
                       f"{head}: {ref['c']} {ref['id']} is on list {ref['l']}, the row on {row['l']}")
        if row.get("variant") is not None:
            variant = rows.get(row["variant"])
            if not variant or variant["k"] != "army_variant" or variant["l"] != row["l"]:
                yield ("requirement_variant", row["k"], label,
                       f"{head}: variant_id {row['variant']} is not an army_variant on list {row['l']}")
        if row["k"] == "attachment" and row.get("mode") in ("must", "leads"):
            for s in row["s"]:
                for t in row["t"]:
                    if any(k == "requires_unit" for k, _ in pairs[(s["c"], s["id"], t["c"], t["id"])]):
                        yield ("requirement_redundant", row["k"], label,
                               f"{head}: a requires_unit row repeats this attachment")
        if row["k"] == "attachment" and row.get("mode") == "leads":
            if row.get("count") is not None:
                yield ("requirement_leader", row["k"], label,
                       f"{head}: a leads row carries count {row['count']}, and a leader brings none")
            for s in row["s"]:
                for t in row["t"]:
                    if ("attachment", "must") in pairs[(s["c"], s["id"], t["c"], t["id"])]:
                        yield ("requirement_leader", row["k"], label,
                               f"{head}: a must row attaches the same entry to this target")
        profile = row.get("sp")
        if profile and profile["u"] != profile.get("eu"):
            yield ("requirement_profile", row["k"], label,
                   f"{head}: subject_profile_id {profile['id']} ({profile['n']}) is on unit "
                   f"{profile['u']}, the subject entry's unit is {profile.get('eu')}")
        target = row.get("tp")
        if row["k"] == "substitution" and target and target["u"] != target.get("eu"):
            yield ("requirement_profile", row["k"], label,
                   f"{head}: target_profile_id {target['id']} ({target['n']}) is on unit "
                   f"{target['u']}, the target entry's unit is {target.get('eu')}")
        if row["k"] == "ally_scope" and row.get("mode") == "points" and not (
                1 <= (row.get("count") or 0) <= 100):
            yield ("requirement_points", row["k"], label,
                   f"{head}: points count {row.get('count')!r} is not a percentage")
        if row["k"] == "requires_unit" and row.get("mode") == "unless_transporting":
            if not any(s["c"] == "entry_id" and s["id"] in transports for s in row["s"]):
                yield ("requirement_transport", row["k"], label,
                       f"{head}: unless_transporting on a subject with no transport rows")


GATED = re.compile(r"\bonly\b|^Not\b")


def eligibility_checks(req):
    lists = {section["id"]: section["l"] for section in req["sections"]}
    for item in req["items"]:
        label = f"{lists.get(item['c'])}:{item['id']}"
        head = f"wargear_items {item['id']}"
        restriction = item.get("r")
        if item.get("e") and not restriction:
            yield ("item_eligibility", "wargear_item", label,
                   f"{head}: has eligibility rows and no restriction")
        if restriction and GATED.search(restriction) and not (item.get("e") or item.get("a")):
            yield ("item_eligibility", "wargear_item", label,
                   f"{head}: {restriction!r} has no eligibility rows and no affiliation")


def affiliation_checks(req):
    values = {a["id"]: a for a in req.get("affiliations", [])}
    labels = {(a["l"], a["label"]) for a in values.values()}
    gated = list(req.get("affiliated", [])) + [
        {"c": "entry", "id": e["id"], "a": e["a"], "ls": [e["l"]]}
        for e in req.get("entries", []) if e.get("a")]
    for row in gated:
        value = values.get(row["a"])
        if value is None or value["l"] not in row["ls"]:
            where = f"list {value['l']}" if value else "no list"
            yield ("affiliation_list", "affiliation", f"{row['c']}:{row['id']}",
                   f"{row['c']} {row['id']}: affiliation {row['a']} is on {where}, "
                   f"the row on {row['ls']}")
    for entry in req.get("entries", []):
        if entry.get("label") and (entry["l"], entry["label"]) not in labels:
            yield ("affiliation_list", "entry", f"{entry['l']}:{entry['n']}",
                   f"army_list_entries {entry['id']}: affiliation_label "
                   f"{entry['label']!r} has no value on list {entry['l']}")


def mastery_checks(req):
    for entry in req.get("entries", []):
        name = f"{entry['l']}:{entry['n']}"
        head = f"army_list_entries {entry['id']}"
        if entry["buys"] and entry.get("ml") is None:
            yield ("mastery_level_max", "entry", name,
                   f"{head}: buys Mastery Levels with no mastery_level_max")
        if not entry["buys"] and entry.get("ml") is not None:
            yield ("mastery_level_max", "entry", name,
                   f"{head}: mastery_level_max {entry['ml']} on an entry that buys no levels")


def replaced_checks(req):
    for option in sorted({r["uo"] for r in req.get("replaced", []) if r.get("rw")}):
        yield ("replaced_weapons", "unit_option", str(option),
               f"unit_options {option}: replaces_weapon_id and replaced-weapon rows both set")


BIKE_MOTIVE_TYPE = 3
JUMP_PACK_CARD = 12


def armour_checks(req):
    for armour in req.get("armour", []):
        head = f"armour {armour['id']} ({armour['n']})"
        for profile in armour.get("p", []):
            if armour["bike"] and profile.get("m") == BIKE_MOTIVE_TYPE:
                yield ("armour_bars", "unit", profile["un"],
                       f"{head} bars bikes, and unit_profiles {profile['id']} wears it "
                       f"on a bike unit")
            for grant in profile.get("g", []):
                if armour["bike"] and grant.get("m") == BIKE_MOTIVE_TYPE:
                    yield ("armour_bars", "unit", profile["un"],
                           f"{head} bars bikes, and unit_options {grant['uo']} gives "
                           f"unit_profiles {profile['id']} the {grant['un']}")
            if armour["jump"] and JUMP_PACK_CARD in profile.get("wc", []):
                yield ("armour_bars", "unit", profile["un"],
                       f"{head} bars jump packs, and unit_profiles {profile['id']} is "
                       f"also granted the Jump Pack card")
        for item in armour.get("i", []):
            if armour["jump"] and JUMP_PACK_CARD in item.get("wc", []):
                yield ("armour_bars", "wargear_item", f"{item['l']}:{item['id']}",
                       f"{head} bars jump packs, and wargear_items {item['id']} bundles "
                       f"the Jump Pack card with it")


def alternative_checks(req):
    groups = defaultdict(set)
    for row in req["alternatives"]:
        groups[(row["d"], row["a"])].add(row.get("max"))
    for (datafax, alternative), found in sorted(groups.items()):
        if len(found) > 1:
            yield ("alternative_max", "datafax", str(datafax),
                   f"datafax_weapons alternative {alternative}: rows disagree, "
                   f"{sorted(found, key=str)}")


def replaces_checks(req):
    groups = defaultdict(set)
    for row in req["alternatives"]:
        if row["a"]:
            groups[(row["d"], row["a"])].add(
                (row.get("rep"), row.get("mode"), row.get("add")))
        if row.get("rep") is None:
            continue
        head = f"datafax_weapons {row['id']}"
        if row.get("rd") != row["d"]:
            yield ("weapon_replaces", "datafax", str(row["d"]),
                   f"{head}: replaces row {row['rep']} on datafax {row.get('rd')}")
        if not row.get("opt"):
            yield ("weapon_replaces", "datafax", str(row["d"]),
                   f"{head}: replaces row {row['rep']} and is not optional")
    for (datafax, alternative), found in sorted(groups.items()):
        if len(found) > 1:
            yield ("weapon_replaces", "datafax", str(datafax),
                   f"datafax_weapons alternative {alternative}: rows disagree on "
                   f"what they replace, {sorted(found, key=str)}")


UNWRITTEN_LISTS = {3, 9, 12, 13, 14}
CHARACTER_TYPE = 1
SQUAD_BANDS = {"Squads", "Mobs", "Broods"}
COMMANDS = re.compile(r"\b(?:Commands|commands?)\b(?:\s+the\s+army\b|[^.]*\bplace\b)")
JOINS = re.compile(r"\b(?:joins?(?!\s+as\b)|leads?|leading|stays with)\b", re.I)
ASIDE = re.compile(r'<section class="house-rule".*?</section>', re.S)


def said(text):
    return strip_tags(ASIDE.sub(" ", text or ""))


def unwritten_checks(req):
    written = {e["l"] for e in req["lineup"]}
    ruled = {row["l"] for row in req["rows"]}
    for l in sorted(UNWRITTEN_LISTS & ruled):
        yield (None, "unwritten_lists", "army_list", str(l),
               f"list {l} is in UNWRITTEN_LISTS and has army_list_requirements rows")
    for l in sorted(written - ruled - UNWRITTEN_LISTS):
        yield (None, "unwritten_lists", "army_list", str(l),
               f"list {l} has entries and no army_list_requirements rows")


def commander_checks(req):
    counts, leaders = defaultdict(set), set()
    for row in req["rows"]:
        if row["k"] == "commander":
            counts[row["l"]].add(row.get("count"))
            leaders |= {s["id"] for s in row["s"] if s["c"] == "entry_id"}
    for l in sorted({e["l"] for e in req["lineup"]}):
        if 0 not in counts[l]:
            yield (l, "requirement_commander", "army_list", str(l),
                   f"list {l} has entries and no commander row with count 0")
    notes = {e["id"]: said(e.get("note")) for e in req["lineup"]}
    for row in req["rows"]:
        if row["k"] != "substitution":
            continue
        ends = [r["id"] for r in row["s"] + row["t"] if r["c"] in ("entry_id", "target_entry_id")]
        why = [f"army_list_entries {i} is a commander row's subject" for i in ends if i in leaders]
        why += [f"army_list_entries {i} says {m.group(0)!r}"
                for i in ends for m in [COMMANDS.search(notes.get(i, ""))] if m]
        if why:
            yield (row["l"], "requirement_commander", "substitution",
                   f"{row['l']}:{row['s'][0]['n']}",
                   f"army_list_requirements {row['id']}: a substitution doing a commander "
                   f"row's work, as {why[0]}")


def ride_checks(req):
    bands = {b["id"]: b["n"] for b in req["bands"]}
    members = defaultdict(set)
    for m in req["members"]:
        members[m["set"]].add(m["e"])
    carried = defaultdict(set)
    for row in req["rows"]:
        if row["k"] == "transport" and row.get("mode") == "squads":
            for s in row["s"]:
                for t in row["t"]:
                    if t["c"] == "target_entry_id":
                        carried[s["id"]].add(t["id"])
                    elif t["c"] == "target_set_id":
                        carried[s["id"]] |= members[t["id"]]
    supported = {o["u"] for o in req["options"] if o.get("g") == "support" and o.get("whole")}
    barred = {p["id"] for a in req.get("armour", []) if a["bike"] for p in a.get("p", [])}
    profiles = defaultdict(set)
    for p in req["profiles"]:
        profiles[p["u"]].add(p["id"])
    entries = {e["id"]: e for e in req["lineup"]}
    for ride in req["lineup"]:
        if ride.get("ts") not in ("squads", "characters_and_squads"):
            continue
        squads = carried.get(ride["id"]) or {
            e["id"] for e in req["lineup"]
            if e["l"] == ride["l"] and bands.get(e["b"]) in SQUAD_BANDS}
        for i in sorted(squads):
            squad = entries[i]
            if ride.get("m") == BIKE_MOTIVE_TYPE and profiles[squad["u"]] and (
                    profiles[squad["u"]] <= barred):
                continue
            if squad["u"] not in supported:
                yield (ride["l"], "ride_option", "entry", f"{squad['l']}:{squad['n']}",
                       f"army_list_entries {i}: can ride army_list_entries {ride['id']} "
                       f"({ride['n']}), and unit {squad['u']} has no whole-unit support option")


def attachment_checks(req):
    profiles = defaultdict(set)
    for p in req["profiles"]:
        profiles[p["u"]].add(p["id"])
    notes = defaultdict(list)
    for o in req["options"]:
        if o.get("note"):
            notes[o["u"]].append((f"unit_options {o['id']}", o["note"]))
    scopes = defaultdict(set)
    for row in req["rows"]:
        if row["k"] == "attachment":
            for s in row["s"]:
                scopes[s["id"]].add((row.get("sp") or {}).get("id"))
    for entry in req["lineup"]:
        if entry.get("ut") != CHARACTER_TYPE:
            continue
        found = [(where, m.group(0))
                 for where, text in [(f"army_list_entries {entry['id']}", entry.get("note"))]
                 + notes[entry["u"]] for m in [JOINS.search(said(text))] if m]
        if not found:
            continue
        where, phrase = found[0]
        head = f"army_list_entries {entry['id']}: {where} says {phrase!r}"
        name = f"{entry['l']}:{entry['n']}"
        covered = scopes[entry["id"]]
        if not covered:
            yield (entry["l"], "requirement_attachment", "entry", name,
                   f"{head}, and the entry has no attachment rows")
        elif None not in covered and profiles[entry["u"]] - covered:
            yield (entry["l"], "requirement_attachment", "entry", name,
                   f"{head}, and its attachment rows leave profiles "
                   f"{sorted(profiles[entry['u']] - covered)} uncovered")


def cross_list_checks(req):
    yield from unwritten_checks(req)
    yield from commander_checks(req)
    yield from ride_checks(req)
    yield from attachment_checks(req)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show_exempt = "--list" in sys.argv
    path = args[0] if args else os.path.join(
        os.path.dirname(HERE), "verbatim", "texts.json")
    texts = json.load(open(path, encoding="utf-8"))
    chapters = cards = grants = sources = requirements = None
    if isinstance(texts, dict):
        if "chapters" in texts:
            chapters = set(texts["chapters"])
        cards = texts.get("cards")
        grants = texts.get("grants")
        sources = texts.get("sources")
        requirements = texts.get("requirements")
        texts = texts["texts"]
    if chapters is None:
        print("no chapter list in the dump, so dead_chapter is skipped; "
              "re-run dump-texts.py")
    if cards is None:
        print("no card list in the dump, so dead_card_link is skipped; "
              "re-run dump-texts.py")
    if grants is None:
        print("no grants in the dump, so card_points, double_grant and "
              "priced_grant are skipped; re-run dump-texts.py")
    if sources is None:
        print("no sources in the dump, so magazine_citation and "
              "unit_on_magazine_list are skipped; re-run dump-texts.py")
    if requirements is None:
        print("no requirements in the dump, so the section, requirement and "
              "alternative_max checks are skipped; re-run dump-texts.py")
    elif "lineup" not in requirements:
        print("no lineup in the dump, so the cross-list checks are skipped; "
              "re-run dump-texts.py")

    exempt_path = os.path.join(HERE, "exemptions.json")
    exempt = json.load(open(exempt_path)) if os.path.exists(exempt_path) else {}

    def excused(check, kind, name, detail):
        for entry in exempt.get(check, []):
            key = entry["key"] if isinstance(entry, dict) else entry
            if key in (f"{kind}:{name}", f"{kind}:{name}:{detail}"):
                return True
        return False

    failures, excused_count = [], 0
    for row in texts:
        for check, fn in PER_TEXT.items():
            if check in HTML_ONLY and not is_html(row["k"]):
                continue
            if check in PLAIN_ONLY and is_html(row["k"]):
                continue
            for detail in fn(row["k"], row["n"], row["t"]):
                if excused(check, row["k"], row["n"], detail):
                    excused_count += 1
                    if show_exempt:
                        print(f"  exempt {check:14} {row['k']}:{row['n']}  {detail}")
                    continue
                failures.append((check, row["k"], row["n"], detail))

    found = list(cross_checks(texts, chapters, cards))
    if grants is not None:
        found += grant_checks(grants)
    if sources is not None:
        found += source_checks(sources)
    if requirements is not None:
        found += section_checks(requirements)
        found += requirement_checks(requirements)
        found += alternative_checks(requirements)
        found += replaces_checks(requirements)
        found += eligibility_checks(requirements)
        found += affiliation_checks(requirements)
        found += mastery_checks(requirements)
        found += replaced_checks(requirements)
        found += armour_checks(requirements)
    for check, kind, name, detail in found:
        if excused(check, kind, name, detail):
            excused_count += 1
            if show_exempt:
                print(f"  exempt {check:14} {kind}:{name}  {detail}")
            continue
        failures.append((check, kind, name, detail))

    held_count = 0
    if requirements is not None and "lineup" in requirements:
        for l, check, kind, name, detail in cross_list_checks(requirements):
            if excused(check, kind, name, detail):
                excused_count += 1
                if show_exempt:
                    print(f"  exempt {check:14} {kind}:{name}  {detail}")
            elif l in UNWRITTEN_LISTS:
                held_count += 1
                if show_exempt:
                    print(f"  held   {check:14} {kind}:{name}  {detail}")
            else:
                failures.append((check, kind, name, detail))

    html = sum(1 for r in texts if is_html(r["k"]))
    print(f"{len(texts)} texts ({html} html, {len(texts) - html} plain), "
          f"{len(failures)} findings, {excused_count} exempt, {held_count} held")
    for check, kind, name, detail in sorted(failures):
        print(f"  {check:14} {kind}:{name}\n{'':18}{detail}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
