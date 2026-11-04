-- Every prose column the site renders, as the JSON measure.py expects, plus
-- every rules chapter slug, every card with its availabilities, the card
-- grants and prices, and the magazine sources for verify.py.
-- Run against the live database and save the result as texts.json:
--   psql "$DATABASE_URL" -At -f dump-texts.sql > texts.json
select json_build_object(
  'texts', coalesce(json_agg(json_build_object('k', kind, 'n', name, 't', txt)), '[]'),
  'chapters', coalesce((select json_agg(slug order by slug) from rule_categories), '[]'),
  'cards', json_build_object(
    'wargear-cards', coalesce((select json_agg(json_build_object('n', c.name, 'o', c.origin, 'a', coalesce((select json_agg(a.name order by a.position) from wargear_cards_availabilities ca join availabilities a on a.id = ca.availability_id where ca.wargear_card_id = c.id), '[]'))) from wargear_cards c), '[]'),
    'vehicle-cards', coalesce((select json_agg(json_build_object('n', c.name, 'o', c.origin, 'a', coalesce((select json_agg(a.name order by a.position) from vehicle_cards_availabilities ca join availabilities a on a.id = ca.availability_id where ca.vehicle_card_id = c.id), '[]'))) from vehicle_cards c), '[]')
  ),
  'grants', json_build_object(
    'options', coalesce((select json_agg(json_strip_nulls(json_build_object('id', uo.id, 'u', uo.unit_id, 'un', u.name, 'opt', uo.optional, 'wc', uo.wargear_card_id, 'vc', uo.vehicle_card_id))) from unit_options uo join units u on u.id = uo.unit_id where coalesce(uo.wargear_card_id, uo.vehicle_card_id) is not null), '[]'),
    'profiles', coalesce((select json_agg(json_strip_nulls(json_build_object('u', p.unit_id, 'un', u.name, 'wc', g.wc, 'vc', g.vc))) from (select unit_profile_id, wargear_card_id wc, null::integer vc from unit_profile_wargear_cards union all select unit_profile_id, null, vehicle_card_id from unit_profile_vehicle_cards) g join unit_profiles p on p.id = g.unit_profile_id join units u on u.id = p.unit_id), '[]'),
    'entry_options', coalesce((select json_agg(json_strip_nulls(json_build_object('id', o.id, 'u', e.unit_id, 'un', u.name, 'wc', o.wargear_card_id, 'uo', o.unit_option_id))) from army_list_entry_options o join army_list_entries e on e.id = o.army_list_entry_id join units u on u.id = e.unit_id where coalesce(o.wargear_card_id, o.unit_option_id) is not null), '[]'),
    'cards', json_build_object(
      'wc', coalesce((select json_agg(json_build_object('id', c.id, 'n', c.name, 'p', c.points)) from wargear_cards c), '[]'),
      'vc', coalesce((select json_agg(json_build_object('id', c.id, 'n', c.name, 'p', c.points)) from vehicle_cards c), '[]')
    )
  ),
  'sources', json_build_object(
    'rules', coalesce((select json_agg(json_build_object('n', r.name, 's', r.source)) from rules r where r.source is not null), '[]'),
    'army_lists', coalesce((select json_agg(json_build_object('n', al.name, 's', al.source)) from army_lists al where al.source is not null), '[]'),
    'units', coalesce((select json_agg(json_build_object('n', u.name, 's', u.source, 'l', coalesce((select json_agg(distinct al.source) from army_list_entries ale join unit_categories uc on uc.id = ale.unit_category_id join army_lists al on al.id = uc.army_list_id where ale.unit_id = u.id and al.source is not null), '[]'))) from units u where u.source is not null), '[]')
  )
) from (
  select 'rule:' || rc.slug, r.name, r.rule from rules r join rule_categories rc on rc.id = r.category_id
  union all select 'weapon',           w.name,   w.profile_description   from weapons w                 where w.profile_description is not null
  union all select 'weapon_rule',      x.name,   x.rule                  from weapon_special_rules x
  union all select 'armour',           a.name,   a.profile_description   from armour a                  where a.profile_description is not null
  union all select 'armour_rule',      y.name,   y.rule                  from armour_special_rules y
  union all select 'wargear_card',     c.name,   c.description           from wargear_cards c           where c.description is not null
  union all select 'vehicle_card',     vc.name,  vc.description          from vehicle_cards vc          where vc.description is not null
  union all select 'mission',          m.name,   concat_ws(' ', m.description, m.primary_objective, m.secondary_objective, m.special_rules) from mission_cards m
  union all select 'strategy',         s.name,   s.description           from strategy_cards s
  union all select 'psychic',          p.name,   concat_ws(' ', p.description, p.note) from psychic_power_cards p
  union all select 'warp',             sw.name,  sw.description          from special_warp_cards sw
  union all select 'unit',             u.name,   u.profile_description   from units u                   where u.profile_description is not null
  union all select 'unit_wargear',     'unit_options_row', uo.note   from unit_options uo         where uo.note is not null
  union all select 'unit_option_restriction', 'unit_options_row', uo.restriction from unit_options uo where uo.restriction is not null
  union all select 'unit_rule',        v.name,   v.rule                  from unit_special_rules v      where v.rule is not null
  union all select 'unit_rule_note',   'unit_special_rule_assignments_row', usra.note from unit_special_rule_assignments usra where usra.note is not null
  union all select 'unit_cat',         uc.category, uc.note            from unit_categories uc        where uc.note is not null
  union all select 'entry',            'army_list_entries_row', ale.note from army_list_entries ale   where ale.note is not null
  union all select 'entry_option',     'army_list_entry_options_row', concat_ws(' ', aleo.note, aleo.restriction) from army_list_entry_options aleo where coalesce(aleo.note, aleo.restriction) is not null
  union all select 'allowance',        'army_list_allowance_rules_row', concat_ws(' ', alar.note, alar.qualifier, alar.label) from army_list_allowance_rules alar where coalesce(alar.note, alar.qualifier, alar.label) is not null
  union all select 'allowance_set',    als.name, concat_ws(' ', als.name, als.singular) from army_list_allowance_sets als where als.name is not null
  union all select 'ally',             'army_list_allies_row', ala.note  from army_list_allies ala     where ala.note is not null
  union all select 'wargear_item',     'wargear_items_row', wi.restriction from wargear_items wi      where wi.restriction is not null
  union all select 'datafax',          'datafaxes_row', concat_ws(' ', d.deployment, d.note, d.transport_detail, d.crew_detail) from datafaxes d where coalesce(d.deployment, d.note, d.transport_detail, d.crew_detail) is not null
  union all select 'datafax_annotation', 'datafax_annotations_row', da.note from datafax_annotations da
  union all select 'datafax_weapon',   'datafax_weapons_row', dw.arc_note from datafax_weapons dw     where dw.arc_note is not null
  union all select 'datafax_location', dl.name,  dl.note                 from datafax_locations dl     where dl.note is not null
  union all select 'damage_chart',     dc.name,  dc.note                 from damage_charts dc         where dc.note is not null
  union all select 'damage_result',    'damage_chart_results_row', dcr.effect from damage_chart_results dcr
  union all select 'faction',          f.name,   f.description           from factions f                where f.description is not null
  union all select 'army_list',        al.name,  al.description          from army_lists al             where al.description is not null
  union all select 'wargear_cat',      wc.category, wc.note              from wargear_categories wc     where wc.note is not null
  union all select 'wargear_cat_heading', wc.category, wc.rules_heading from wargear_categories wc     where wc.rules_heading is not null
  union all select 'wargear_cat_intro', wc.category, wc.rules_intro     from wargear_categories wc     where wc.rules_intro is not null
  union all select 'equipment_weapon', ew.category, ew.note              from equipment_weapons ew      where ew.note is not null
) z (kind, name, txt) where txt is not null and length(txt) > 0;
