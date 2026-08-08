-- Every prose column the site renders, as the JSON measure.py expects.
-- Run against the live database and save the result as texts.json:
--   psql "$DATABASE_URL" -At -f dump-texts.sql > texts.json
select json_agg(json_build_object('k', kind, 'n', name, 't', txt)) from (
  select 'rule:' || rc.slug, r.name, r.rule from rules r join rule_categories rc on rc.id = r.category_id
  union all select 'weapon',           w.name,   w.profile_description   from weapons w                 where w.profile_description is not null
  union all select 'weapon_rule',      x.name,   x.rule                  from weapon_special_rules x
  union all select 'armour',           a.name,   a.profile_description   from armour a                  where a.profile_description is not null
  union all select 'armour_rule',      y.name,   y.rule                  from armour_special_rules y
  union all select 'wargear_card',     c.name,   c.description           from wargear_cards c           where c.description is not null
  union all select 'mission',          m.name,   concat_ws(' ', m.description, m.primary_objective, m.secondary_objective, m.special_rules) from mission_cards m
  union all select 'strategy',         s.name,   s.description           from strategy_cards s
  union all select 'psychic',          p.name,   concat_ws(' ', p.description, p.note) from psychic_power_cards p
  union all select 'warp',             sw.name,  sw.description          from special_warp_cards sw
  union all select 'unit',             u.name,   u.profile_description   from units u                   where u.profile_description is not null
  union all select 'unit_wargear',     'unit_wargear_row', upw.profile_description from unit_profile_wargear upw where upw.profile_description is not null
  union all select 'faction',          f.name,   f.description           from factions f                where f.description is not null
  union all select 'army_list',        al.name,  al.description          from army_lists al             where al.description is not null
  union all select 'wargear_cat',      wc.category, wc.note              from wargear_categories wc     where wc.note is not null
  union all select 'equipment_weapon', ew.category, ew.note              from equipment_weapons ew      where ew.note is not null
) z (kind, name, txt) where txt is not null and length(txt) > 0;
