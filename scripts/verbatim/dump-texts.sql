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
  union all select 'unit_wargear',     'unit_options_row', uo.note   from unit_options uo         where uo.note is not null
  union all select 'unit_cat',         uc.category, uc.note            from unit_categories uc        where uc.note is not null
  union all select 'entry',            'army_list_entries_row', ale.note from army_list_entries ale   where ale.note is not null
  union all select 'entry_option',     'army_list_entry_options_row', concat_ws(' ', aleo.note, aleo.restriction) from army_list_entry_options aleo where coalesce(aleo.note, aleo.restriction) is not null
  union all select 'allowance',        'army_list_allowance_rules_row', alar.note from army_list_allowance_rules alar where alar.note is not null
  union all select 'ally',             'army_list_allies_row', ala.note  from army_list_allies ala     where ala.note is not null
  union all select 'wargear_item',     'wargear_items_row', wi.restriction from wargear_items wi      where wi.restriction is not null
  union all select 'datafax',          'datafaxes_row', concat_ws(' ', d.deployment, d.note) from datafaxes d where coalesce(d.deployment, d.note) is not null
  union all select 'datafax_weapon',   'datafax_weapons_row', dw.arc_note from datafax_weapons dw     where dw.arc_note is not null
  union all select 'datafax_location', dl.name,  dl.note                 from datafax_locations dl     where dl.note is not null
  union all select 'damage_chart',     dc.name,  dc.note                 from damage_charts dc         where dc.note is not null
  union all select 'damage_result',    'damage_chart_results_row', dcr.effect from damage_chart_results dcr
  union all select 'faction',          f.name,   f.description           from factions f                where f.description is not null
  union all select 'army_list',        al.name,  al.description          from army_lists al             where al.description is not null
  union all select 'wargear_cat',      wc.category, wc.note              from wargear_categories wc     where wc.note is not null
  union all select 'equipment_weapon', ew.category, ew.note              from equipment_weapons ew      where ew.note is not null
) z (kind, name, txt) where txt is not null and length(txt) > 0;
