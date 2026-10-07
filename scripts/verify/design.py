#!/usr/bin/env python3
"""/design and the palette, from source.

  python3 scripts/verify/design.py
  python3 scripts/verify/design.py --list   # show exempt hits too

Five checks, each reading source rather than a rendered page:

  design_contrast    every pair on /design's contrast table meets its WCAG 2.1
                     threshold in light and in dark, or is exempt with a reason.
                     The pairs are app/design/pairs.json plus one datafax label
                     pair per faction mat, built from lib/factions.ts as the page
                     builds them. Colours resolve from globals.css, color-mix()
                     included. Partial: a pair in use that nobody declared is not
                     seen.
  design_ink         a JSX element with a literal fixed-palette background
                     (2ed-*, faction-*, black, white) and content of its own sets
                     a text colour in the same className. Partial: a class built
                     at runtime or held in a constant is not seen, and an element
                     whose content opens with a child element is taken to leave
                     the ink to its children.
  design_hex         no colour hex declared in globals.css appears in app/,
                     components/ or lib/.
  design_components  every file in components/ is imported by app/design/ or by
                     app/layout.tsx; type-only imports do not count.
  design_fixtures    every class under .dynamic-content in globals.css appears on
                     /design: in a class attribute in app/design/fixtures.ts, or
                     as a measure or compact prop on a Fixture.

Exit 1 on any unexempt finding. Exemptions live in exemptions.json beside this
file under the check names above. Each entry's key is the subject a finding
names: a pair's "where", "path:class", "path:#hex", a component path or a
class. Each needs a reason. A pair in pairs.json may instead carry its own
"exempt" reason, which the contrast table on /design shows.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

LIMITS = ("Partial by design: design_contrast sees only the declared pairs, and "
          "design_ink only className literals on elements with content of their "
          "own.")


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as handle:
        return handle.read()


def files(directory, suffixes):
    for base, _, names in os.walk(os.path.join(ROOT, directory)):
        for name in sorted(names):
            if name.endswith(suffixes):
                path = os.path.join(base, name)
                yield os.path.relpath(path, ROOT), read(os.path.relpath(path, ROOT))


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


# Colour


def hex_rgb(value):
    value = value.lstrip("#")
    if len(value) == 3:
        value = "".join(c * 2 for c in value)
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def to_linear(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def from_linear(c):
    c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return round(min(max(c, 0), 1) * 255)


def to_oklab(rgb):
    r, g, b = (to_linear(c) for c in rgb)
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def from_oklab(lab):
    L, a, b = lab
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return (from_linear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
            from_linear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
            from_linear(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s))


def split_args(inner):
    args, depth, current = [], 0, ""
    for c in inner:
        if c == "," and depth == 0:
            args.append(current.strip())
            current = ""
            continue
        depth += c == "("
        depth -= c == ")"
        current += c
    return args + [current.strip()]


def resolve(value, scope):
    value = value.strip()
    if value.startswith("#"):
        return hex_rgb(value)
    match = re.fullmatch(r"var\(--([\w-]+)\)", value)
    if match:
        return resolve(scope[match.group(1)], scope)
    match = re.fullmatch(r"color-mix\((.*)\)", value, re.S)
    if match:
        space, first, second = split_args(match.group(1))
        assert space == "in oklab", space
        colour, weight = re.fullmatch(r"(.+?)\s+([\d.]+)%", first).groups()
        weight = float(weight) / 100
        a, b = to_oklab(resolve(colour, scope)), to_oklab(resolve(second, scope))
        return from_oklab(tuple(weight * x + (1 - weight) * y for x, y in zip(a, b)))
    raise ValueError(f"cannot resolve {value!r}")


def declarations(block):
    return dict(re.findall(r"--([\w-]+):\s*([^;]+);", block))


def palettes(css):
    css = strip_comments(css)
    theme = declarations(re.search(r"@theme inline\s*\{([^}]*)\}", css).group(1))
    light = declarations(re.search(
        r':root,\s*\[data-theme="light"\]\s*\{([^}]*)\}', css).group(1))
    dark = declarations(re.search(
        r'^\[data-theme="dark"\]\s*\{([^}]*)\}', css, re.M).group(1))
    return theme, {"light": light, "dark": dark}


SCHEME_TOKENS = {"accent": "house-rule-accent"}

FIXED = {"black": "#000", "white": "#fff"}


def colour(token, theme, scheme):
    if token in FIXED:
        return hex_rgb(FIXED[token])
    scope = {**theme, **scheme}
    name = SCHEME_TOKENS.get(token, token)
    if name in scheme:
        return resolve(scheme[name], scope)
    if f"color-{token}" in theme:
        return resolve(theme[f"color-{token}"], scope)
    raise KeyError(token)


def luminance(rgb):
    r, g, b = (to_linear(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def needs(pair):
    size = pair.get("size", 0)
    if pair.get("graphic") or size >= 24 or (size >= 18.66 and pair.get("bold")):
        return 3.0
    return 4.5


def object_entries(source, name):
    body = re.search(rf"export const {name}[^=]*=\s*\{{(.*?)\}};", source, re.S)
    return [(key.strip("\"'"), value) for key, value in
            re.findall(r"""([\w"'-]+)\s*:\s*"([^"]+)\"""", body.group(1))]


def faction_name(slug):
    return " ".join(word if i and word == "of" else word.capitalize()
                    for i, word in enumerate(slug.split("-")))


def faction_pairs(source):
    colours = object_entries(source, "factionColors")
    inks = dict(object_entries(source, "factionInk"))
    mats = list(dict.fromkeys(value for _, value in colours))
    pairs = []
    for mat in mats:
        slugs = [slug for slug, value in colours if value == mat]
        names = " and ".join(faction_name(slug) for slug in slugs)
        pairs.append({
            "where": f"Datafax label on the {names} mat",
            "ink": inks.get(slugs[0], "text-2ed-white").removeprefix("text-"),
            "on": mat.removeprefix("bg-"),
            "size": 18,
            "bold": True,
        })
    return pairs


def check_contrast():
    theme, schemes = palettes(read("app", "globals.css"))
    pairs = json.loads(read("app", "design", "pairs.json"))
    pairs += faction_pairs(read("lib", "factions.ts"))
    for pair in pairs:
        threshold, failing = needs(pair), {}
        try:
            for scheme_name, scheme in schemes.items():
                value = ratio(colour(pair["ink"], theme, scheme),
                              colour(pair["on"], theme, scheme))
                if value < threshold:
                    failing[scheme_name] = f"{value:.2f}"
        except KeyError as missing:
            yield pair["where"], f"unknown token {missing}", None
            continue
        if failing:
            values = set(failing.values())
            where = (f"{values.pop()} in both schemes"
                     if len(failing) == len(schemes) and len(values) == 1
                     else ", ".join(f"{v} in {k}" for k, v in failing.items()))
            yield (pair["where"],
                   f"{pair['ink']} on {pair['on']}: {where}, needs {threshold:.1f}",
                   pair.get("exempt"))


# JSX


BG = re.compile(r"(?<![\w:/\[-])bg-(?:2ed-[a-z-]+|faction-[a-z-]+|black|white)(?![\w/-])")
INK = re.compile(r"(?<![\w:/\[-])text-(?:black|white|2ed-[a-z-]+|faction-[a-z-]+|"
                 r"foreground|background|accent|leader-ink)(?![\w/-])")
TAG = re.compile(r"<([A-Za-z][\w.]*)(?=[\s/>])")
LITERAL = re.compile(r'"([^"\n]*)"|\'([^\'\n]*)\'|`([^`$]*)`')


def balanced(text, i):
    stack = ["{"]
    i += 1
    while i < len(text) and stack:
        c, top = text[i], stack[-1]
        if top in "\"'":
            if c == "\\":
                i += 1
            elif c == top:
                stack.pop()
        elif top == "`":
            if c == "\\":
                i += 1
            elif c == "`":
                stack.pop()
            elif c == "$" and text[i + 1:i + 2] == "{":
                stack.append("{")
                i += 1
        elif c in "\"'`":
            stack.append(c)
        elif c == "{":
            stack.append("{")
        elif c == "}":
            stack.pop()
        i += 1
    return i if not stack else None


def opening_tag(text, i):
    attrs, i = {}, i + 1
    while i < len(text) and (text[i].isalnum() or text[i] in "._"):
        i += 1
    while i < len(text):
        while i < len(text) and text[i].isspace():
            i += 1
        if text.startswith("/>", i):
            return i + 2, True, attrs
        if text.startswith(">", i):
            return i + 1, False, attrs
        if text.startswith("{", i):
            end = balanced(text, i)
            if end is None:
                return None
            i = end
            continue
        match = re.match(r"[\w:.-]+", text[i:])
        if not match:
            return None
        name, i = match.group(0), i + len(match.group(0))
        if not text.startswith("=", i):
            attrs[name] = ""
            continue
        i += 1
        if text[i] in "\"'":
            end = text.find(text[i], i + 1)
            if end < 0:
                return None
            attrs[name], i = text[i:end + 1], end + 1
        elif text[i] == "{":
            end = balanced(text, i)
            if end is None:
                return None
            attrs[name], i = text[i:end], end
        else:
            return None
    return None


def check_ink():
    for directory in ("app", "components"):
        for path, text in files(directory, (".tsx",)):
            for match in TAG.finditer(text):
                parsed = opening_tag(text, match.start())
                if parsed is None:
                    continue
                end, closed, attrs = parsed
                value = attrs.get("className")
                if not value or closed:
                    continue
                content = text[end:].lstrip()
                if content.startswith("<"):
                    continue
                literals = " ".join("".join(group) for group in LITERAL.findall(value))
                backgrounds = BG.findall(literals)
                if backgrounds and not INK.search(literals):
                    for background in dict.fromkeys(backgrounds):
                        yield f"{path}:{background}", \
                            f"<{match.group(1)}> sets {background} and no text colour", None


# Hexes, components, fixtures


def check_hex():
    css = strip_comments(read("app", "globals.css"))
    palette = sorted({h.lower() for h in re.findall(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", css)})
    pattern = re.compile(r"(?<![0-9a-zA-Z&])(" + "|".join(palette) + r")(?![0-9a-fA-F])", re.I)
    for directory in ("app", "components", "lib"):
        for path, text in files(directory, (".ts", ".tsx", ".css", ".js", ".mjs")):
            if path == os.path.join("app", "globals.css"):
                continue
            for hit in dict.fromkeys(h.lower() for h in pattern.findall(text)):
                yield f"{path}:{hit}", f"palette hex {hit} outside globals.css", None


IMPORT = re.compile(r'import\s+(type\s+)?[^;]*?\s+from\s+"@/components/([\w-]+)"', re.S)


def check_components():
    sources = [text for _, text in files(os.path.join("app", "design"), (".ts", ".tsx"))]
    sources.append(read("app", "layout.tsx"))
    imported = {name for text in sources
                for kind, name in IMPORT.findall(text) if not kind}
    for path, _ in files("components", (".tsx",)):
        name = os.path.splitext(os.path.basename(path))[0]
        if name not in imported:
            yield path, f"{path} is not on /design", None


def css_blocks(css):
    stack, start = [], 0
    for i, c in enumerate(css):
        if c == "{":
            selector = css[start:i].strip().split(";")[-1].strip()
            stack.append(selector)
            yield list(stack)
            start = i + 1
        elif c == "}":
            if stack:
                stack.pop()
            start = i + 1
        elif c == ";":
            start = i + 1


def check_fixtures():
    css = strip_comments(read("app", "globals.css"))
    classes = set()
    for path in css_blocks(css):
        first = next((i for i, s in enumerate(path) if ".dynamic-content" in s), None)
        if first is None:
            continue
        for selector in path[first:]:
            if selector.startswith("@"):
                continue
            selector = re.sub(r"\[[^\]]*\]", "", selector)
            classes.update(re.findall(r"\.([a-zA-Z][\w-]*)", selector))
    classes.discard("dynamic-content")

    shown = {name for value in re.findall(r'class="([^"]*)"',
                                          read("app", "design", "fixtures.ts"))
             for name in value.split()}
    for _, text in files(os.path.join("app", "design"), (".tsx",)):
        shown.update(re.findall(r"<Fixture\b[^>]*?\b(measure|compact)\b", text, re.S))
    for name in sorted(classes - shown):
        yield name, f".{name} has no fixture on /design", None


CHECKS = {
    "design_contrast": check_contrast,
    "design_ink": check_ink,
    "design_hex": check_hex,
    "design_components": check_components,
    "design_fixtures": check_fixtures,
}


def main():
    show_exempt = "--list" in sys.argv
    exempt_path = os.path.join(HERE, "exemptions.json")
    exempt = json.load(open(exempt_path)) if os.path.exists(exempt_path) else {}

    def excused(check, key):
        return any((entry["key"] if isinstance(entry, dict) else entry) == key
                   for entry in exempt.get(check, []))

    failures, excused_count = [], 0
    for check, run in CHECKS.items():
        for key, detail, reason in run():
            if reason or excused(check, key):
                excused_count += 1
                if show_exempt:
                    print(f"  exempt {check:17} {key}  {detail}")
                continue
            failures.append((check, key, detail))

    print(f"{len(CHECKS)} checks, {len(failures)} findings, {excused_count} exempt")
    for check, key, detail in failures:
        print(f"  {check:17} {key}\n{'':19}{detail}")
    print(LIMITS)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
