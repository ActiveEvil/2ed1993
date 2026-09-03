alter type public.weapon_categories rename to weapon_categories_old;

create type public.weapon_categories as enum (
  'Close combat',
  'Pistol',
  'Basic',
  'Heavy',
  'Support',
  'Grenades',
  'Wargear'
);

alter table public.weapons
  alter column category type public.weapon_categories
  using category::text::public.weapon_categories;

drop type public.weapon_categories_old;
