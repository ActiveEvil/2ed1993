alter table public.datafaxes drop column ram_value;
alter table public.datafaxes
  add column ram_strength       integer,
  add column ram_damage         text,
  add column ram_save_modifier  integer;
