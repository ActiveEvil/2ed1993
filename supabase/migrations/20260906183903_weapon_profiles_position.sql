-- Code review M6, 6 September 2026. A weapon with more than one profile (a
-- Plasma Gun's low and high energy) printed them in whatever order the rows
-- came back. Order is now explicit, seeded from the order the rows went in.

alter table public.weapon_profiles
  add column position integer not null default 0;

update public.weapon_profiles as p
set position = o.position
from (
  select id, row_number() over (partition by weapon_id order by id) - 1 as position
  from public.weapon_profiles
) as o
where o.id = p.id;
