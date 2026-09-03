-- Ruling 9, 2 September 2026. Characteristics are printed values, not numbers:
-- the Beast of Nurgle rolls D6 for Attacks. The nine columns become text, as
-- weapon_profiles and armour_profiles already are, and store what is printed.

alter table public.unit_profiles
  alter column m  type text using m::text,
  alter column ws type text using ws::text,
  alter column bs type text using bs::text,
  alter column s  type text using s::text,
  alter column t  type text using t::text,
  alter column w  type text using w::text,
  alter column i  type text using i::text,
  alter column a  type text using a::text,
  alter column ld type text using ld::text;

comment on column public.unit_profiles.w is 'Printed Wounds. Also the psi-level of a psyker character with no printed mastery level (ruling 8).';
