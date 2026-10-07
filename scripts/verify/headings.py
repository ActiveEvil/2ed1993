#!/usr/bin/env python3
"""Heading order and landmarks on every page, from server-rendered HTML.

  python3 scripts/verify/headings.py https://2ed1993.com
  python3 scripts/verify/headings.py http://localhost:3000          # next start
  python3 scripts/verify/headings.py http://localhost:3000 /design  # given paths only
  python3 scripts/verify/headings.py <base-url> --list              # show exempt hits too

Reads every <loc> in <base-url>/sitemap.xml, plus /design, and parses each
page's HTML with no browser. Fails on: a page without exactly one <main>, or a
<main> without id="main"; a page without exactly one h1, or an h1 outside
<main>; a first heading in <main> that is not the h1; any other heading outside
<main>; a skipped level anywhere in the outline; an empty heading. Headings
inside a hidden or aria-hidden subtree are not in the outline and are skipped.

Exit 1 on any unexempt finding. Exemptions live in exemptions.json beside this
file, under the check names below; each entry's key is a path ("/design") or a
path and heading text ("/design:Movement (M)"), and each needs a reason.

Two limits, by design: it cannot count tab stops, which need a browser, and a
heading added only on the client after hydration is invisible to it.
"""
import json, os, re, sys, urllib.error, urllib.parse, urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))

CHECKS = ("heading_main", "heading_h1", "heading_first", "heading_outside",
          "heading_skip", "heading_empty", "heading_fetch")

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}

HEADING = re.compile(r"^h([1-6])$")

LIMITS = ("Not checked: tab stops, which need a browser, and headings added on "
          "the client after hydration.")


class Outline(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.mains = []
        self.headings = []
        self.current = None

    def hidden(self):
        return any(hidden for _, hidden in self.stack)

    def in_main(self):
        return any(tag == "main" for tag, _ in self.stack)

    def handle_starttag(self, tag, attrs, closed=False):
        attrs = dict(attrs)
        if tag == "main":
            self.mains.append(attrs.get("id"))
        if self.current is not None and tag == "img":
            self.current["text"] += attrs.get("alt") or ""
        if tag in VOID or closed:
            return
        hidden = "hidden" in attrs or attrs.get("aria-hidden") == "true"
        match = HEADING.match(tag)
        if match and self.current is None and not hidden and not self.hidden():
            self.current = {"level": int(match.group(1)), "text": "",
                            "in_main": self.in_main(), "depth": len(self.stack)}
        self.stack.append((tag, hidden))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs, closed=True)

    def handle_endtag(self, tag):
        if tag in VOID or not any(open_tag == tag for open_tag, _ in self.stack):
            return
        while self.stack:
            open_tag, _ = self.stack.pop()
            if open_tag == tag:
                break
        if self.current is not None and len(self.stack) <= self.current["depth"]:
            self.current["text"] = " ".join(self.current["text"].split())
            self.headings.append(self.current)
            self.current = None

    def handle_data(self, data):
        if self.current is not None and not self.hidden():
            self.current["text"] += data


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "headings.py"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read().decode("utf-8", "replace")


def pages(base, given):
    if given:
        return given
    sitemap = fetch(f"{base}/sitemap.xml")
    paths = [urllib.parse.urlparse(loc).path or "/"
             for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", sitemap)]
    return sorted(set(paths) | {"/design"})


def label(heading):
    return f"h{heading['level']} \"{heading['text']}\""


def findings(html):
    outline = Outline()
    outline.feed(html)
    outline.close()
    headings = outline.headings

    if len(outline.mains) != 1:
        yield "heading_main", None, f"{len(outline.mains)} <main> elements"
    elif outline.mains[0] != "main":
        yield "heading_main", None, f"<main> has id={outline.mains[0]!r}"

    h1s = [h for h in headings if h["level"] == 1]
    if len(h1s) != 1:
        yield "heading_h1", None, f"{len(h1s)} h1 elements: " + \
            ", ".join(label(h) for h in h1s)
    for h in h1s:
        if not h["in_main"]:
            yield "heading_h1", h["text"], f"{label(h)} outside <main>"

    in_main = [h for h in headings if h["in_main"]]
    if in_main and in_main[0]["level"] != 1:
        yield "heading_first", in_main[0]["text"], \
            f"first heading in <main> is {label(in_main[0])}"

    for h in headings:
        if not h["in_main"] and h["level"] != 1:
            yield "heading_outside", h["text"], f"{label(h)} outside <main>"
        if not h["text"]:
            yield "heading_empty", "", f"empty h{h['level']}"

    for before, h in zip(headings, headings[1:]):
        if h["level"] > before["level"] + 1:
            yield "heading_skip", h["text"], \
                f"h{before['level']} → h{h['level']}: {label(h)} after {label(before)}"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    show_exempt = "--list" in sys.argv
    base = args[0].rstrip("/")

    exempt_path = os.path.join(HERE, "exemptions.json")
    exempt = json.load(open(exempt_path)) if os.path.exists(exempt_path) else {}

    def excused(check, path, text):
        for entry in exempt.get(check, []):
            key = entry["key"] if isinstance(entry, dict) else entry
            if key == path or (text is not None and key == f"{path}:{text}"):
                return True
        return False

    failures, excused_count = [], 0
    try:
        paths = pages(base, args[1:])
    except (urllib.error.URLError, TimeoutError) as error:
        sys.exit(f"could not read {base}/sitemap.xml: {error}")
    for path in paths:
        try:
            html = fetch(f"{base}{path}")
        except (urllib.error.URLError, TimeoutError) as error:
            failures.append(("heading_fetch", path, str(error)))
            continue
        for check, text, detail in findings(html):
            if excused(check, path, text):
                excused_count += 1
                if show_exempt:
                    print(f"  exempt {check:16} {path}  {detail}")
                continue
            failures.append((check, path, detail))

    pages_failing = len({path for _, path, _ in failures})
    print(f"{len(paths)} pages, {pages_failing} failing, {len(failures)} findings, "
          f"{excused_count} exempt")
    for check, path, detail in sorted(failures, key=lambda f: (f[1], f[0])):
        print(f"  {check:16} {path}\n{'':18}{detail}")
    print(LIMITS)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
