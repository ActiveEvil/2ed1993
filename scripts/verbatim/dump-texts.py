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

def stripped(row):
    return {k: v for k, v in row.items() if v is not None}


entry_lists = {e["id"]: category_lists[e["unit_category_id"]]
               for e in rows("army_list_entries", "id,unit_category_id")}
items = sorted(rows("wargear_items", "id,wargear_category_id,restriction,affiliation_id,"
                    "armour_id,weapons(name),armour(name),units(name)"), key=lambda i: i["id"])
eligibility = {}
for e in sorted(rows("wargear_item_eligibility",
                     "wargear_item_id,unit_id,unit_type_id,excluded,position"),
                key=lambda e: (e["wargear_item_id"], e["position"])):
    eligibility.setdefault(e["wargear_item_id"], []).append(
        stripped({"u": e["unit_id"], "ut": e["unit_type_id"], "x": e["excluded"]}))
sections = sorted(rows("wargear_categories", "id,army_list_id,category,note,limit_scope,"
                       "limit_max,limit_min,combination_counts_as_one,distinct_items"),
                  key=lambda c: c["id"])
section_lists = {c["id"]: c["army_list_id"] for c in sections}
profiles = {p["id"]: p["name"] for p in rows("unit_profiles", "id,name")}
option_units = {o["id"]: o for o in rows(
    "unit_options", "id,unit_id,unit_profile_id,affiliation_id,per_half,whole_unit,"
    "replaces_weapon_id")}
profile_names = {p["id"]: p for p in rows("unit_profiles", "id,name,unit_id")}
unit_entry_lists = {}
for i, l in entry_lists.items():
    unit_entry_lists.setdefault(entry_units[i], set()).add(l)
mastery_bases = {b["id"] for b in rows("points_bases", "id,name")
                 if b["name"] == "Per Mastery Level"}
buys_mastery = {o["army_list_entry_id"]
                for o in rows("army_list_entry_options", "army_list_entry_id,points_basis_id")
                if o["points_basis_id"] in mastery_bases}
entry_rows = rows("army_list_entries", "id,unit_id,affiliation_id,affiliation_label,"
                  "squadron_max,mastery_level_max")
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


def subject_profile(row):
    if row.get("subject_profile_id") is None:
        return None
    profile = profile_names[row["subject_profile_id"]]
    return {"id": profile["id"], "n": profile["name"], "u": profile["unit_id"],
            "eu": entry_units.get(row["entry_id"])}


def target_profile(row):
    if row.get("target_profile_id") is None:
        return None
    profile = profile_names[row["target_profile_id"]]
    return stripped({"id": profile["id"], "n": profile["name"], "u": profile["unit_id"],
                     "eu": entry_units.get(row["target_entry_id"])})


def resolved(row, columns):
    return [stripped({"c": c, "id": row[c], "n": refs[kind][row[c]][0],
                      "l": refs[kind][row[c]][1]})
            for c, kind in columns if row[c] is not None]


def grouped(table, key, value):
    out = {}
    for row in rows(table, f"{key},{value}"):
        if row[value] is not None:
            out.setdefault(row[key], set()).add(row[value])
    return out


armour_profiles = grouped("unit_profile_armour", "armour_id", "unit_profile_id")
unit_motives = {d["unit_id"]: d["motive_type_id"]
                for d in rows("datafaxes", "unit_id,motive_type_id")}
profile_cards = grouped("unit_profile_wargear_cards", "unit_profile_id", "wargear_card_id")
item_cards = grouped("wargear_item_components", "wargear_item_id", "wargear_card_id")
unit_grants = {}
for o in sorted(rows("unit_options", "id,unit_id,unit_profile_id,granted_unit_id,optional"),
                key=lambda o: o["id"]):
    if o["granted_unit_id"] is not None and not o["optional"]:
        unit_grants.setdefault(o["unit_id"], []).append(o)


def profile_grants(profile):
    return [stripped({"uo": o["id"], "u": o["granted_unit_id"], "un": units[o["granted_unit_id"]],
                      "m": unit_motives.get(o["granted_unit_id"])})
            for o in unit_grants.get(profile_units[profile], ())
            if o["unit_profile_id"] in (None, profile)] or None


barring = [
    stripped({"id": a["id"], "n": a["name"], "bike": a["bars_bike"], "jump": a["bars_jump_pack"],
              "p": [stripped({"id": p, "u": profile_units[p], "un": units[profile_units[p]],
                              "m": unit_motives.get(profile_units[p]),
                              "wc": sorted(profile_cards.get(p, ())) or None,
                              "g": profile_grants(p)})
                    for p in sorted(armour_profiles.get(a["id"], ()))] or None,
              "i": [stripped({"id": i["id"], "l": section_lists[i["wargear_category_id"]],
                              "wc": sorted(item_cards.get(i["id"], ())) or None})
                    for i in items if i["armour_id"] == a["id"]] or None})
    for a in sorted(rows("armour", "id,name,bars_bike,bars_jump_pack"), key=lambda a: a["id"])
    if a["bars_bike"] or a["bars_jump_pack"]]

requirements = {
    "rows": [stripped({"id": r["id"], "k": r["kind"], "l": r["army_list_id"],
                       "s": resolved(r, SUBJECTS), "t": resolved(r, TARGETS),
                       "mode": r["mode"], "count": r["count"], "label": r["label"],
                       "variant": r["variant_id"], "under": r["under_variant"],
                       "sp": subject_profile(r), "tp": target_profile(r)})
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
    "items": [stripped({"id": i["id"], "c": i["wargear_category_id"], "r": i["restriction"],
                        "a": i["affiliation_id"], "e": eligibility.get(i["id"])})
              for i in items],
    "affiliations": [{"id": a["id"], "l": a["army_list_id"], "label": a["label"], "n": a["name"]}
                     for a in sorted(rows("affiliations", "id,army_list_id,label,name"),
                                     key=lambda a: a["id"])],
    "affiliated": [{"c": "option", "id": i, "a": o["affiliation_id"],
                    "ls": sorted(unit_entry_lists.get(o["unit_id"], ()))}
                   for i, o in sorted(option_units.items()) if o["affiliation_id"]]
                  + [{"c": "item", "id": i["id"], "a": i["affiliation_id"],
                      "ls": [section_lists[i["wargear_category_id"]]]}
                     for i in items if i["affiliation_id"]],
    "entries": [stripped({"id": e["id"], "l": entry_lists[e["id"]], "n": units[e["unit_id"]],
                          "a": e["affiliation_id"], "label": e["affiliation_label"],
                          "sq": e["squadron_max"], "ml": e["mastery_level_max"],
                          "buys": e["id"] in buys_mastery})
                for e in sorted(entry_rows, key=lambda e: e["id"])
                if e["id"] in buys_mastery or any(
                    e[c] is not None for c in ("affiliation_id", "affiliation_label",
                                               "squadron_max", "mastery_level_max"))],
    "allies": [stripped({"id": a["id"], "l": a["army_list_id"], "display": a["display"],
                         "mode": a["mode"]})
               for a in sorted(rows("army_list_allies", "id,army_list_id,display,mode"),
                               key=lambda a: a["id"])],
    "deductions": [{"id": r["id"], "deduction": r["deduction"]}
                   for r in sorted(rows("army_list_allowance_rules", "id,deduction"),
                                   key=lambda r: r["id"]) if r["deduction"]],
    "halves": [{"uo": i, "u": o["unit_id"], "whole": o["whole_unit"]}
               for i, o in sorted(option_units.items()) if o["per_half"]],
    "replaced": [stripped({"uo": r["unit_option_id"], "w": r["weapon_id"],
                           "rw": option_units[r["unit_option_id"]]["replaces_weapon_id"]})
                 for r in sorted(rows("unit_option_replaced_weapons",
                                      "unit_option_id,weapon_id,position"),
                                 key=lambda r: (r["unit_option_id"], r["position"], r["weapon_id"]))],
    "alternatives": sorted(
        (stripped({"id": w["id"], "d": w["datafax_id"], "a": w["alternative"],
                   "max": w["alternative_max"]})
         for w in rows("datafax_weapons", "id,datafax_id,alternative,alternative_max")
         if w["alternative"]), key=lambda w: w["id"]),
    "ratios": sorted(
        ({"id": w["id"], "d": w["datafax_id"], "per": w["per_models"]}
         for w in rows("datafax_weapons", "id,datafax_id,per_models")
         if w["per_models"] is not None), key=lambda w: w["id"]),
    "armour": barring}

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
