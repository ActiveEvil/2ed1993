#!/usr/bin/env python3
"""Standing verification suite over every prose column, from texts.json.

The checks in claude/style-conventions.md, mechanised and extended beyond
`rules` to every kind dump-texts.py emits. Run after any batch change:

  python3 scripts/verify/verify.py                  # texts.json beside dump-texts.py
  python3 scripts/verify/verify.py path/texts.json
  python3 scripts/verify/verify.py --list           # show exempt hits too

Exit 1 on any unexempt finding. Exemptions live in exemptions.json beside this
file, keyed by check name; entries are "kind:name" or "kind:name:detail" and
each needs a reason. Checks that need human judgment (series marking, repeat
link groups, first-mention-links) stay manual — see the doc.

Entity and non-ASCII checks apply only to HTML columns. Two rendered fields are
plain JSX and literal characters there are correct: psychic_power_cards.note
and wargear_categories.note. The dump joins the psychic note into the card's
text, so `psychic` stays in HTML_KINDS and any note needing literal characters
belongs in exemptions. Kinds not rendered anywhere yet (unit, unit_wargear,
army_list, equipment_weapon, wargear_cat) get voice checks only.
"""
import json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

HTML_KINDS = ("rule:", "weapon", "weapon_rule", "armour", "armour_rule",
              "wargear_card", "mission", "strategy", "psychic", "warp",
              "faction")
ENTITIES = {"quot", "apos", "mdash", "ndash", "deg", "amp",
            "dagger", "Dagger", "sect", "times", "divide",
            "ldquo", "rdquo", "half", "uarr", "sup2", "AElig"}
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
    return re.sub(r'<section class="chart".*?</section>', " ", text, flags=re.S)


def anchor(name):
    x = name.replace("&amp;", "and").replace("&", "and")
    x = re.sub(r"[^A-Za-z0-9 ._-]", "", x)
    x = re.sub(r"\s+", " ", x).strip()
    return x.replace(" ", "_")


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
    "non_ascii": check_non_ascii, "gendered": check_gendered,
    "die_noun": check_die, "second_person": check_second_person,
    "inline_p": check_inline_p, "nesting": check_nesting,
}
HTML_ONLY = {"tag_balance", "heading_id", "empty_id", "li_id", "stray_ws",
             "chart_title", "spaced_mdash", "ampersand", "non_ascii",
             "inline_p", "nesting"}


def cross_checks(texts):
    ids = defaultdict(list)
    for row in texts:
        if not row["k"].startswith("rule:"):
            continue
        slug = row["k"][5:]
        ids[slug].append(anchor(row["n"]))
        for match in re.finditer(r'id="([^"]+)"', row["t"]):
            ids[slug].append(match.group(1))

    for slug, found in ids.items():
        seen = set()
        for i in found:
            if i in seen:
                yield "duplicate_id", f"rule:{slug}", i, f"id {i} defined twice"
            seen.add(i)

    for row in texts:
        for match in re.finditer(r'href="/rules/([a-z-]+)#([^"]+)"', row["t"]):
            slug, fragment = match.groups()
            if slug in ids and fragment not in ids[slug]:
                yield ("dead_link", row["k"], row["n"],
                       f"/rules/{slug}#{fragment} resolves to nothing")

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


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show_exempt = "--list" in sys.argv
    path = args[0] if args else os.path.join(
        os.path.dirname(HERE), "verbatim", "texts.json")
    texts = json.load(open(path, encoding="utf-8"))
    if isinstance(texts, dict):
        texts = texts["texts"]

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
            for detail in fn(row["k"], row["n"], row["t"]):
                if excused(check, row["k"], row["n"], detail):
                    excused_count += 1
                    if show_exempt:
                        print(f"  exempt {check:14} {row['k']}:{row['n']}  {detail}")
                    continue
                failures.append((check, row["k"], row["n"], detail))

    for check, kind, name, detail in cross_checks(texts):
        if excused(check, kind, name, detail):
            excused_count += 1
            if show_exempt:
                print(f"  exempt {check:14} {kind}:{name}  {detail}")
            continue
        failures.append((check, kind, name, detail))

    html = sum(1 for r in texts if is_html(r["k"]))
    print(f"{len(texts)} texts ({html} html, {len(texts) - html} plain), "
          f"{len(failures)} findings, {excused_count} exempt")
    for check, kind, name, detail in sorted(failures):
        print(f"  {check:14} {kind}:{name}\n{'':18}{detail}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
