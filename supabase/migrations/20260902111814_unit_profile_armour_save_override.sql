-- Ruling 5, 2 September 2026. A printed entry sometimes states a save that is
-- not the one the armour itself gives — the Rough Riders' mounted 5+, the seven
-- Eldar aspect saves. The save belongs to the pairing, not to the armour.

alter table public.unit_profile_armour add column save_override text;

comment on column public.unit_profile_armour.save_override is 'The save this profile gets from this armour where the printed entry overrides the armour''s own save. Null means the armour''s save stands.';
