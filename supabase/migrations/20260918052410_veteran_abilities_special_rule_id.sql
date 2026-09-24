-- Veteran Abilities (CIG-1, ruling 44): wargear_items.special_rule_id and the one-target check; DDL, apply with mcp__Supabase__apply_migration
alter table wargear_items
  add column special_rule_id integer references unit_special_rules(id);

alter table wargear_items
  add constraint wargear_items_target_ck check (
    (armour_id is not null)::int
    + (weapon_id is not null)::int
    + (unit_id is not null)::int
    + (special_rule_id is not null)::int = 1
  );
