-- 23 September 2026. Item rules (unit_special_rules reached through
-- wargear_items.special_rule) now group by wargear category on the army-list
-- page, each with its own optional heading and HTML introduction; note stays
-- the plain-text price-list note.

alter table public.wargear_categories
  add column rules_heading text,
  add column rules_intro text;
