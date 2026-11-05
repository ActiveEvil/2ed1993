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
add("vehicle_card", "vehicle_cards", "name,description", "name", "description")
add("mission", "mission_cards",
    "name,description,primary_objective,secondary_objective,special_rules", "name",
    "description", "primary_objective", "secondary_objective", "special_rules")
add("strategy", "strategy_cards", "name,description", "name", "description")
add("psychic", "psychic_power_cards", "name,description,note", "name", "description", "note")
add("warp", "special_warp_cards", "name,description", "name", "description")
add("unit", "units", "name,profile_description", "name", "profile_description")
add("unit_wargear", "unit_options", "note", None, "note")
add("unit_option_restriction", "unit_options", "restriction", None, "restriction")
add("unit_rule", "unit_special_rules", "name,rule", "name", "rule")
add("unit_rule_note", "unit_special_rule_assignments", "note", None, "note")
add("unit_cat", "unit_categories", "category,note", "category", "note")
add("entry", "army_list_entries", "note", None, "note")
add("entry_option", "army_list_entry_options", "note,restriction", None, "note", "restriction")
add("allowance", "army_list_allowance_rules", "note,qualifier,label", None, "note", "qualifier", "label")
add("allowance_set", "army_list_allowance_sets", "name,singular", "name", "name", "singular")
add("ally", "army_list_allies", "note", None, "note")
add("wargear_item", "wargear_items", "restriction", None, "restriction")
add("datafax", "datafaxes", "deployment,note,transport_detail,crew_detail", None, "deployment", "note", "transport_detail", "crew_detail")
add("datafax_annotation", "datafax_annotations", "note", None, "note")
add("datafax_weapon", "datafax_weapons", "arc_note", None, "arc_note")
add("datafax_location", "datafax_locations", "name,note", "name", "note")
add("damage_chart", "damage_charts", "name,note", "name", "note")
add("damage_result", "damage_chart_results", "effect", None, "effect")
add("faction", "factions", "name,description", "name", "description")
add("army_list", "army_lists", "name,description", "name", "description")
add("wargear_cat", "wargear_categories", "category,note", "category", "note")
add("wargear_cat_heading", "wargear_categories", "category,rules_heading", "category", "rules_heading")
add("wargear_cat_intro", "wargear_categories", "category,rules_intro", "category", "rules_intro")
add("equipment_weapon", "equipment_weapons", "category,note", "category", "note")

def card_rows(table, join):
    out = []
    for row in rows(table, f"name,origin,{join}(availabilities(name,position))"):
        found = sorted((r["availabilities"] for r in row[join] if r["availabilities"]),
                       key=lambda a: a["position"])
        out.append({"n": row["name"], "o": row["origin"], "a": [a["name"] for a in found]})
    return out


cards = {"wargear-cards": card_rows("wargear_cards", "wargear_cards_availabilities"),
         "vehicle-cards": card_rows("vehicle_cards", "vehicle_cards_availabilities")}

def card_ids(row):
    return {k: row[c] for k, c in (("wc", "wargear_card_id"), ("vc", "vehicle_card_id"))
            if row.get(c)}


units = {u["id"]: u["name"] for u in rows("units", "id,name")}
profile_units = {p["id"]: p["unit_id"] for p in rows("unit_profiles", "id,unit_id")}
entry_units = {e["id"]: e["unit_id"] for e in rows("army_list_entries", "id,unit_id")}
grant_options = [
    {"id": o["id"], "u": o["unit_id"], "un": units[o["unit_id"]],
     "opt": o["optional"], **card_ids(o)}
    for o in rows("unit_options", "id,unit_id,optional,wargear_card_id,vehicle_card_id")
    if card_ids(o)]
grant_profiles = [
    {"u": profile_units[g["unit_profile_id"]],
     "un": units[profile_units[g["unit_profile_id"]]], **card_ids(g)}
    for table, column in (("unit_profile_wargear_cards", "wargear_card_id"),
                          ("unit_profile_vehicle_cards", "vehicle_card_id"))
    for g in rows(table, f"unit_profile_id,{column}")]
entry_options = rows("army_list_entry_options",
                     "id,army_list_entry_id,optional,wargear_card_id,unit_option_id")
grant_entries = [
    {"id": e["id"], "u": entry_units[e["army_list_entry_id"]],
     "un": units[entry_units[e["army_list_entry_id"]]], "opt": e["optional"],
     "wc": e["wargear_card_id"], "uo": e["unit_option_id"]}
    for e in entry_options if e["wargear_card_id"] or e["unit_option_id"]]
grants = {
    "options": grant_options, "profiles": grant_profiles, "entry_options": grant_entries,
    "cards": {"wc": [{"id": c["id"], "n": c["name"], "p": c["points"]}
                     for c in rows("wargear_cards", "id,name,points")],
              "vc": [{"id": c["id"], "n": c["name"], "p": c["points"]}
                     for c in rows("vehicle_cards", "id,name,points")]}}

list_sources = {l["id"]: l["source"] for l in rows("army_lists", "id,source") if l["source"]}
category_lists = {c["id"]: c["army_list_id"] for c in rows("unit_categories", "id,army_list_id")}
unit_lists = {}
for e in rows("army_list_entries", "unit_id,unit_category_id"):
    source = list_sources.get(category_lists[e["unit_category_id"]])
    if source:
        unit_lists.setdefault(e["unit_id"], set()).add(source)
sources = {
    "rules": [{"n": r["name"], "s": r["source"]}
              for r in rows("rules", "name,source") if r["source"]],
    "army_lists": [{"n": l["name"], "s": l["source"]}
                   for l in rows("army_lists", "name,source") if l["source"]],
    "units": [{"n": u["name"], "s": u["source"], "l": sorted(unit_lists.get(u["id"], ()))}
              for u in rows("units", "id,name,source") if u["source"]]}

entry_lists = {e["id"]: category_lists[e["unit_category_id"]]
               for e in rows("army_list_entries", "id,unit_category_id")}
items = sorted(rows("wargear_items", "id,wargear_category_id,restriction,"
                    "weapons(name),armour(name),units(name)"), key=lambda i: i["id"])
sections = sorted(rows("wargear_categories", "id,army_list_id,category,note,limit_scope,"
                       "limit_max,limit_min,combination_counts_as_one,distinct_items"),
                  key=lambda c: c["id"])
section_lists = {c["id"]: c["army_list_id"] for c in sections}
profiles = {p["id"]: p["name"] for p in rows("unit_profiles", "id,name")}
option_units = {o["id"]: o for o in rows("unit_options", "id,unit_id,unit_profile_id")}
faction_names = {f["id"]: f["name"] for f in rows("factions", "id,name")}
list_names = {l["id"]: l["name"] for l in rows("army_lists", "id,name")}
refs = {
    "entry": {i: (units[entry_units[i]], l) for i, l in entry_lists.items()},
    "set": {s["id"]: (s["name"] or s["singular"], s["army_list_id"])
            for s in rows("army_list_allowance_sets", "id,army_list_id,name,singular")},
    "band": {c["id"]: (c["category"], c["army_list_id"])
             for c in rows("unit_categories", "id,army_list_id,category")},
    "entry_option": {o["id"]: (units[entry_units[o["army_list_entry_id"]]],
                               entry_lists[o["army_list_entry_id"]]) for o in entry_options},
    "unit_option": {i: (units[o["unit_id"]], None) for i, o in option_units.items()},
    "item": {i["id"]: ((i["weapons"] or i["armour"] or i["units"] or {}).get("name"),
                       section_lists[i["wargear_category_id"]]) for i in items},
    "ally": {a["id"]: (faction_names.get(a["ally_faction_id"]) or
                       list_names.get(a["ally_army_list_id"]), a["army_list_id"])
             for a in rows("army_list_allies", "id,army_list_id,ally_faction_id,ally_army_list_id")},
    "profile": {i: (n, None) for i, n in profiles.items()},
    "unit": {i: (n, None) for i, n in units.items()}}
SUBJECTS = (("entry_id", "entry"), ("set_id", "set"), ("unit_category_id", "band"),
            ("entry_option_id", "entry_option"), ("unit_option_id", "unit_option"),
            ("wargear_item_id", "item"), ("ally_id", "ally"))
TARGETS = (("target_entry_id", "entry"), ("target_set_id", "set"),
           ("target_category_id", "band"), ("target_profile_id", "profile"),
           ("target_wargear_item_id", "item"), ("target_unit_id", "unit"),
           ("target_ally_id", "ally"), ("target_unit_option_id", "unit_option"),
           ("target_entry_option_id", "entry_option"))


def stripped(row):
    return {k: v for k, v in row.items() if v is not None}


def resolved(row, columns):
    return [stripped({"c": c, "id": row[c], "n": refs[kind][row[c]][0],
                      "l": refs[kind][row[c]][1]})
            for c, kind in columns if row[c] is not None]


requirements = {
    "rows": [stripped({"id": r["id"], "k": r["kind"], "l": r["army_list_id"],
                       "s": resolved(r, SUBJECTS), "t": resolved(r, TARGETS),
                       "mode": r["mode"], "count": r["count"], "label": r["label"],
                       "variant": r["variant_id"], "under": r["under_variant"]})
             for r in sorted(rows("army_list_requirements", "*"), key=lambda r: r["id"])],
    "sections": [stripped({"id": c["id"], "l": c["army_list_id"], "n": c["category"],
                           "note": c["note"], "scope": c["limit_scope"],
                           "max": c["limit_max"], "min": c["limit_min"],
                           "combo": c["combination_counts_as_one"],
                           "distinct": c["distinct_items"]}) for c in sections],
    "openers": sorted(
        (stripped({"c": link["wargear_category_id"], "uo": link["unit_option_id"],
                   "u": option_units[link["unit_option_id"]]["unit_id"],
                   "un": units[option_units[link["unit_option_id"]]["unit_id"]],
                   "p": option_units[link["unit_option_id"]]["unit_profile_id"],
                   "pn": profiles.get(option_units[link["unit_option_id"]]["unit_profile_id"])})
         for link in rows("unit_option_categories", "unit_option_id,wargear_category_id")),
        key=lambda o: (o["c"], o["uo"])),
    "items": [stripped({"id": i["id"], "c": i["wargear_category_id"], "r": i["restriction"]})
              for i in items],
    "alternatives": sorted(
        (stripped({"id": w["id"], "d": w["datafax_id"], "a": w["alternative"],
                   "max": w["alternative_max"]})
         for w in rows("datafax_weapons", "id,datafax_id,alternative,alternative_max")
         if w["alternative"]), key=lambda w: w["id"])}

payload = json.dumps({"texts": texts, "chapters": sorted(categories.values()),
                      "cards": cards, "grants": grants, "sources": sources,
                      "requirements": requirements},
                     ensure_ascii=False)
if len(sys.argv) > 1 and sys.argv[1] == "-":
    print(payload)
else:
    destination = os.path.join(HERE, "texts.json")
    open(destination, "w", encoding="utf-8").write(payload)
    words = sum(len(t["t"].split()) for t in texts)
    print(f"{len(texts)} texts, ~{words:,} words -> {destination}")
