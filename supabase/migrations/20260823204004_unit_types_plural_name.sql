alter table public.unit_types add column plural_name text;
update public.unit_types set plural_name = case name
  when 'Character'     then 'Characters'
  when 'Squad'         then 'Squads'
  when 'Vehicle'       then 'Vehicles'
  when 'Fortification' then 'Fortifications'
  when 'Field Defence' then 'Field Defences'
end;
alter table public.unit_types alter column plural_name set not null;
alter table public.unit_types add constraint unit_types_plural_name_key unique (plural_name);
