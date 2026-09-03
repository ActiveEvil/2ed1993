#!/usr/bin/env python3
"""Pull every prose column the site renders into texts.json for measure.py.

  python3 scripts/verbatim/dump-texts.py            # writes texts.json beside this file
  python3 scripts/verbatim/dump-texts.py -          # or to stdout

Reads SUPABASE_URL and SUPABASE_PUBLISHABLE_DEFAULT_KEY from .env.local at the
repo root, or from the environment. Same shape as dump-texts.sql, which needs a
DATABASE_URL and psql; this needs neither.
"""
import json, os, re, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PAGE = 1000


def env(name):
    if os.environ.get(name):
        return os.environ[name]
    path = os.path.join(ROOT, ".env.local")
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            match = re.match(rf"\s*{name}\s*=\s*(.+)", line)
            if match:
                return match.group(1).strip().strip("'\"")
    sys.exit(f"{name} not set and not found in .env.local")


BASE = env("SUPABASE_URL").rstrip("/") + "/rest/v1/"
KEY = env("SUPABASE_PUBLISHABLE_DEFAULT_KEY")


def rows(table, select):
    """Every row, paginated — PostgREST caps a bare request well below our tables."""
    out, offset = [], 0
    while True:
        url = f"{BASE}{table}?select={urllib.parse.quote(select)}&limit={PAGE}&offset={offset}"
        request = urllib.request.Request(
            url, headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
        chunk = json.load(urllib.request.urlopen(request))
        out += chunk
        if len(chunk) < PAGE:
            return out
        offset += PAGE


def joined(row, *fields):
    return " ".join(row[f] for f in fields if row.get(f))


texts = []


def add(kind, table, select, name_field, *text_fields):
    for row in rows(table, select):
        text = joined(row, *text_fields)
        if text.strip():
            texts.append({"k": kind, "n": row[name_field] if name_field else
                          f"{table}_row", "t": text})


categories = {c["id"]: c["slug"] for c in rows("rule_categories", "id,slug")}
for rule in rows("rules", "name,rule,category_id"):
    if rule["rule"]:
        texts.append({"k": "rule:" + categories.get(rule["category_id"], "?"),
                      "n": rule["name"], "t": rule["rule"]})

add("weapon", "weapons", "name,profile_description", "name", "profile_description")
add("weapon_rule", "weapon_special_rules", "name,rule", "name", "rule")
add("armour", "armour", "name,profile_description", "name", "profile_description")
add("armour_rule", "armour_special_rules", "name,rule", "name", "rule")
add("wargear_card", "wargear_cards", "name,description", "name", "description")
add("mission", "mission_cards",
    "name,description,primary_objective,secondary_objective,special_rules", "name",
    "description", "primary_objective", "secondary_objective", "special_rules")
add("strategy", "strategy_cards", "name,description", "name", "description")
add("psychic", "psychic_power_cards", "name,description,note", "name", "description", "note")
add("warp", "special_warp_cards", "name,description", "name", "description")
add("unit", "units", "name,profile_description", "name", "profile_description")
add("unit_wargear", "unit_options", "note", None, "note")
add("unit_rule", "unit_special_rules", "name,rule", "name", "rule")
add("unit_rule_note", "unit_special_rule_assignments", "note", None, "note")
add("unit_cat", "unit_categories", "category,note", "category", "note")
add("entry", "army_list_entries", "note", None, "note")
add("entry_option", "army_list_entry_options", "note,restriction", None, "note", "restriction")
add("allowance", "army_list_allowance_rules", "note", None, "note")
add("ally", "army_list_allies", "note", None, "note")
add("wargear_item", "wargear_items", "restriction", None, "restriction")
add("datafax", "datafaxes", "deployment,note", None, "deployment", "note")
add("datafax_weapon", "datafax_weapons", "arc_note", None, "arc_note")
add("datafax_location", "datafax_locations", "name,note", "name", "note")
add("damage_chart", "damage_charts", "name,note", "name", "note")
add("damage_result", "damage_chart_results", "effect", None, "effect")
add("faction", "factions", "name,description", "name", "description")
add("army_list", "army_lists", "name,description", "name", "description")
add("wargear_cat", "wargear_categories", "category,note", "category", "note")
add("equipment_weapon", "equipment_weapons", "category,note", "category", "note")

payload = json.dumps(texts, ensure_ascii=False)
if len(sys.argv) > 1 and sys.argv[1] == "-":
    print(payload)
else:
    destination = os.path.join(HERE, "texts.json")
    open(destination, "w", encoding="utf-8").write(payload)
    words = sum(len(t["t"].split()) for t in texts)
    print(f"{len(texts)} texts, ~{words:,} words -> {destination}")
