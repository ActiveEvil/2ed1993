-- Ruling 58, 14 September 2026. alternative becomes nullable, and null means
-- the row stands outside the choice.
--
-- The column has always been a branch id: rows sharing a value print together
-- as one loadout, and branches print with an --or-- between them. It could not
-- say "this row stands whichever branch is taken", which is what the Imperial
-- Guard Command HQ escort is. Null says it now, on all four tables. (CIG-7.)
--
-- Existing branch ids keep their meaning, so only rows that were never part of
-- a choice are nulled. unit_profile_armour is the exception: 0 there has always
-- meant "worn whichever loadout is taken" rather than branch 0, so every 0 goes
-- to null. unit_options is the other exception: no renderer has ever read its
-- values, and its six non-zero rows do not mean "alternative" -- two of them
-- print "carried as well as" -- so the column is cleared and re-entered later.
--
-- The renderer change lands with this. Either half alone drops all armour from
-- every unit entry.

alter table public.unit_profiles
  alter column alternative drop default,
  alter column alternative drop not null;

alter table public.unit_profile_weapons
  alter column alternative drop default,
  alter column alternative drop not null;

alter table public.unit_profile_armour
  alter column alternative drop default,
  alter column alternative drop not null;

alter table public.unit_options
  alter column alternative drop default,
  alter column alternative drop not null;

-- 170 of 194 rows. The 7 ladders keep 0,1,2,3.
update public.unit_profiles as p
set alternative = null
where p.alternative = 0
  and not exists (
    select 1
    from public.unit_profiles as s
    where s.unit_id = p.unit_id
      and s.alternative <> 0
  );

-- 226 of 360 rows. The 67 branch-0 rows of the 31 profiles that have a second
-- branch keep 0.
update public.unit_profile_weapons as w
set alternative = null
where w.alternative = 0
  and not exists (
    select 1
    from public.unit_profile_weapons as s
    where s.unit_profile_id = w.unit_profile_id
      and s.alternative <> 0
  );

-- All 151 zeroes. The two Terminator storm shields keep 3, which is the branch
-- their thunder hammer is on.
update public.unit_profile_armour
set alternative = null
where alternative = 0;

-- All 221 rows.
update public.unit_options
set alternative = null;

comment on column public.unit_profiles.alternative is 'Which branch of the entry''s choice of profile this is. Rows sharing a value are one branch and are taken together; branches are alternatives to each other. Null stands whichever branch is taken -- the escort in a Command HQ.';
comment on column public.unit_profile_weapons.alternative is 'Which branch of the profile''s loadout this weapon is on. Rows sharing a value are carried together; branches are alternatives to each other. Null is carried whichever branch is taken.';
comment on column public.unit_profile_armour.alternative is 'The branch of the profile''s loadout this armour is worn on, keyed to unit_profile_weapons.alternative -- a storm shield rides the thunder hammer branch. Null is worn whichever branch is taken, which is the ordinary case.';
comment on column public.unit_options.alternative is 'Which branch of a choice between options this is. Rows sharing a value are taken together; branches are alternatives to each other. Null is not part of any choice.';
