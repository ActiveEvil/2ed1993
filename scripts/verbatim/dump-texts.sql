-- Every prose column the site renders, as the JSON measure.py expects, plus
-- every rules chapter slug, every card with its availabilities, the card
-- grants and prices, the magazine sources and the construction rules for
-- verify.py.
-- Run against the live database and save the result as texts.json:
--   psql "$DATABASE_URL" -At -f dump-texts.sql > texts.json
with refs (kind, id, n, l) as (
  select 'entry', e.id, u.name, uc.army_list_id from army_list_entries e join units u on u.id = e.unit_id join unit_categories uc on uc.id = e.unit_category_id
  union all select 'set', s.id, coalesce(s.name, s.singular), s.army_list_id from army_list_allowance_sets s
  union all select 'band', c.id, c.category, c.army_list_id from unit_categories c
  union all select 'entry_option', o.id, u.name, uc.army_list_id from army_list_entry_options o join army_list_entries e on e.id = o.army_list_entry_id join units u on u.id = e.unit_id join unit_categories uc on uc.id = e.unit_category_id
  union all select 'unit_option', uo.id, u.name, null from unit_options uo join units u on u.id = uo.unit_id
  union all select 'item', wi.id, coalesce(w.name, a.name, u.name), wc.army_list_id from wargear_items wi join wargear_categories wc on wc.id = wi.wargear_category_id left join weapons w on w.id = wi.weapon_id left join armour a on a.id = wi.armour_id left join units u on u.id = wi.unit_id
  union all select 'ally', al.id, coalesce(f.name, l.name), al.army_list_id from army_list_allies al left join factions f on f.id = al.ally_faction_id left join army_lists l on l.id = al.ally_army_list_id
  union all select 'profile', p.id, p.name, null from unit_profiles p
  union all select 'unit', u.id, u.name, null from units u
), sides (side, o, c, kind) as (values
  ('s', 1, 'entry_id', 'entry'), ('s', 2, 'set_id', 'set'), ('s', 3, 'unit_category_id', 'band'),
  ('s', 4, 'entry_option_id', 'entry_option'), ('s', 5, 'unit_option_id', 'unit_option'),
  ('s', 6, 'wargear_item_id', 'item'), ('s', 7, 'ally_id', 'ally'),
  ('t', 1, 'target_entry_id', 'entry'), ('t', 2, 'target_set_id', 'set'), ('t', 3, 'target_category_id', 'band'),
  ('t', 4, 'target_profile_id', 'profile'), ('t', 5, 'target_wargear_item_id', 'item'), ('t', 6, 'target_unit_id', 'unit'),
  ('t', 7, 'target_ally_id', 'ally'), ('t', 8, 'target_unit_option_id', 'unit_option'), ('t', 9, 'target_entry_option_id', 'entry_option')
)
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
    'entry_options', coalesce((select json_agg(json_strip_nulls(json_build_object('id', o.id, 'u', e.unit_id, 'un', u.name, 'opt', o.optional, 'wc', o.wargear_card_id, 'uo', o.unit_option_id))) from army_list_entry_options o join army_list_entries e on e.id = o.army_list_entry_id join units u on u.id = e.unit_id where coalesce(o.wargear_card_id, o.unit_option_id) is not null), '[]'),
    'cards', json_build_object(
      'wc', coalesce((select json_agg(json_build_object('id', c.id, 'n', c.name, 'p', c.points)) from wargear_cards c), '[]'),
      'vc', coalesce((select json_agg(json_build_object('id', c.id, 'n', c.name, 'p', c.points)) from vehicle_cards c), '[]')
    )
  ),
  'sources', json_build_object(
    'rules', coalesce((select json_agg(json_build_object('n', r.name, 's', r.source)) from rules r where r.source is not null), '[]'),
    'army_lists', coalesce((select json_agg(json_build_object('n', al.name, 's', al.source)) from army_lists al where al.source is not null), '[]'),
    'units', coalesce((select json_agg(json_build_object('n', u.name, 's', u.source, 'l', coalesce((select json_agg(distinct al.source) from army_list_entries ale join unit_categories uc on uc.id = ale.unit_category_id join army_lists al on al.id = uc.army_list_id where ale.unit_id = u.id and al.source is not null), '[]'))) from units u where u.source is not null), '[]')
  ),
  'requirements', json_build_object(
    'rows', coalesce((select json_agg(json_strip_nulls(json_build_object('id', r.id, 'k', r.kind, 'l', r.army_list_id,
      's', coalesce((select json_agg(json_build_object('c', x.c, 'id', f.id, 'n', f.n, 'l', f.l) order by x.o) from sides x join refs f on f.kind = x.kind and f.id = (to_jsonb(r) ->> x.c)::integer where x.side = 's'), '[]'),
      't', coalesce((select json_agg(json_build_object('c', x.c, 'id', f.id, 'n', f.n, 'l', f.l) order by x.o) from sides x join refs f on f.kind = x.kind and f.id = (to_jsonb(r) ->> x.c)::integer where x.side = 't'), '[]'),
      'mode', r.mode, 'count', r.count, 'label', r.label, 'variant', r.variant_id, 'under', r.under_variant,
      'sp', (select json_build_object('id', p.id, 'n', p.name, 'u', p.unit_id, 'eu', (select e.unit_id from army_list_entries e where e.id = r.entry_id)) from unit_profiles p where p.id = r.subject_profile_id),
      'tp', (select json_build_object('id', p.id, 'n', p.name, 'u', p.unit_id, 'eu', (select e.unit_id from army_list_entries e where e.id = r.target_entry_id)) from unit_profiles p where p.id = r.target_profile_id))) order by r.id) from army_list_requirements r), '[]'),
    'sections', coalesce((select json_agg(json_strip_nulls(json_build_object('id', wc.id, 'l', wc.army_list_id, 'n', wc.category, 'note', wc.note, 'scope', wc.limit_scope, 'max', wc.limit_max, 'min', wc.limit_min, 'combo', wc.combination_counts_as_one, 'distinct', wc.distinct_items)) order by wc.id) from wargear_categories wc), '[]'),
    'openers', coalesce((select json_agg(json_strip_nulls(json_build_object('c', uoc.wargear_category_id, 'uo', uoc.unit_option_id, 'u', uo.unit_id, 'un', u.name, 'p', uo.unit_profile_id, 'pn', p.name)) order by uoc.wargear_category_id, uoc.unit_option_id) from unit_option_categories uoc join unit_options uo on uo.id = uoc.unit_option_id join units u on u.id = uo.unit_id left join unit_profiles p on p.id = uo.unit_profile_id), '[]'),
    'items', coalesce((select json_agg(json_strip_nulls(json_build_object('id', wi.id, 'c', wi.wargear_category_id, 'r', wi.restriction, 'a', wi.affiliation_id,
      'e', (select json_agg(json_build_object('u', we.unit_id, 'ut', we.unit_type_id, 'x', we.excluded) order by we.position) from wargear_item_eligibility we where we.wargear_item_id = wi.id))) order by wi.id) from wargear_items wi), '[]'),
    'affiliations', coalesce((select json_agg(json_build_object('id', af.id, 'l', af.army_list_id, 'label', af.label, 'n', af.name) order by af.id) from affiliations af), '[]'),
    'affiliated', coalesce((select json_agg(json_build_object('c', g.c, 'id', g.id, 'a', g.a, 'ls', g.ls) order by g.o, g.id) from (
      select 1 o, 'option' c, uo.id, uo.affiliation_id a, coalesce((select json_agg(distinct uc.army_list_id order by uc.army_list_id) from army_list_entries e join unit_categories uc on uc.id = e.unit_category_id where e.unit_id = uo.unit_id), '[]') ls from unit_options uo where uo.affiliation_id is not null
      union all select 2, 'item', wi.id, wi.affiliation_id, json_build_array(wc.army_list_id) from wargear_items wi join wargear_categories wc on wc.id = wi.wargear_category_id where wi.affiliation_id is not null) g), '[]'),
    'entries', coalesce((select json_agg(json_strip_nulls(json_build_object('id', e.id, 'l', uc.army_list_id, 'n', u.name, 'a', e.affiliation_id, 'label', e.affiliation_label, 'sq', e.squadron_max, 'ml', e.mastery_level_max, 'buys', m.buys)) order by e.id)
      from army_list_entries e join units u on u.id = e.unit_id join unit_categories uc on uc.id = e.unit_category_id
      cross join lateral (select exists (select 1 from army_list_entry_options o join points_bases pb on pb.id = o.points_basis_id where o.army_list_entry_id = e.id and pb.name = 'Per Mastery Level') buys) m
      where m.buys or coalesce(e.affiliation_id::text, e.affiliation_label, e.squadron_max::text, e.mastery_level_max::text) is not null), '[]'),
    'allies', coalesce((select json_agg(json_strip_nulls(json_build_object('id', al.id, 'l', al.army_list_id, 'display', al.display, 'mode', al.mode)) order by al.id) from army_list_allies al), '[]'),
    'deductions', coalesce((select json_agg(json_build_object('id', ar.id, 'deduction', ar.deduction) order by ar.id) from army_list_allowance_rules ar where ar.deduction <> 0), '[]'),
    'halves', coalesce((select json_agg(json_build_object('uo', uo.id, 'u', uo.unit_id, 'whole', uo.whole_unit) order by uo.id) from unit_options uo where uo.per_half), '[]'),
    'replaced', coalesce((select json_agg(json_strip_nulls(json_build_object('uo', rw.unit_option_id, 'w', rw.weapon_id, 'rw', uo.replaces_weapon_id)) order by rw.unit_option_id, rw.position, rw.weapon_id) from unit_option_replaced_weapons rw join unit_options uo on uo.id = rw.unit_option_id), '[]'),
    'alternatives', coalesce((select json_agg(json_strip_nulls(json_build_object('id', dw.id, 'd', dw.datafax_id, 'a', dw.alternative, 'max', dw.alternative_max)) order by dw.id) from datafax_weapons dw where dw.alternative <> 0), '[]'),
    'ratios', coalesce((select json_agg(json_build_object('id', dw.id, 'd', dw.datafax_id, 'per', dw.per_models) order by dw.id) from datafax_weapons dw where dw.per_models is not null), '[]'),
    'armour', coalesce((select json_agg(json_strip_nulls(json_build_object('id', a.id, 'n', a.name, 'bike', a.bars_bike, 'jump', a.bars_jump_pack,
      'p', (select json_agg(json_strip_nulls(json_build_object('id', p.id, 'u', p.unit_id, 'un', u.name,
        'm', (select d.motive_type_id from datafaxes d where d.unit_id = p.unit_id),
        'wc', (select json_agg(pc.wargear_card_id order by pc.wargear_card_id) from unit_profile_wargear_cards pc where pc.unit_profile_id = p.id),
        'g', (select json_agg(json_strip_nulls(json_build_object('uo', o.id, 'u', o.granted_unit_id, 'un', gu.name,
          'm', (select d.motive_type_id from datafaxes d where d.unit_id = o.granted_unit_id))) order by o.id)
          from unit_options o join units gu on gu.id = o.granted_unit_id
          where o.unit_id = p.unit_id and not o.optional and (o.unit_profile_id is null or o.unit_profile_id = p.id)))) order by p.id)
        from unit_profiles p join units u on u.id = p.unit_id where p.id in (select pa.unit_profile_id from unit_profile_armour pa where pa.armour_id = a.id)),
      'i', (select json_agg(json_strip_nulls(json_build_object('id', wi.id, 'l', wc.army_list_id,
        'wc', (select json_agg(distinct ic.wargear_card_id order by ic.wargear_card_id) from wargear_item_components ic where ic.wargear_item_id = wi.id and ic.wargear_card_id is not null))) order by wi.id)
        from wargear_items wi join wargear_categories wc on wc.id = wi.wargear_category_id where wi.armour_id = a.id))) order by a.id) from armour a where a.bars_bike or a.bars_jump_pack), '[]')
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
