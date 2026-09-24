-- Ruling 46: a special rule the book gives to one model of a unit attaches to that model's profile.
-- A crew that mans a support weapon takes grant_mode crew.

alter table public.unit_profiles
  add constraint unit_profiles_unit_id_id_key unique (unit_id, id);

alter table public.unit_special_rule_assignments
  add column unit_profile_id integer,
  add constraint unit_special_rule_assignments_unit_profile_id_fkey
    foreign key (unit_id, unit_profile_id) references public.unit_profiles (unit_id, id) on delete cascade;

comment on column public.unit_special_rule_assignments.unit_profile_id is 'The profile that carries the rule, where the book gives it to one model rather than the whole unit: the Wolf Scout Sergeant''s Rapid Fire. Null gives it to every model. The profile must belong to the same unit.';
comment on column public.unit_options.alternative is 'Options sharing a non-zero value are alternatives: a model or unit takes one of them. 0 is not part of a choice.';
comment on column public.unit_options.optional is 'False where the option is not a choice: an item the model must take, or a standing statement such as who commands.';
comment on column public.weapons.counts_as_weapon_id is 'The weapon this one fights as, where the book names a weapon with no profile of its own: the Force Staff counts as a Force Rod.';

alter table public.unit_options drop constraint unit_options_grant_mode_ck;
alter table public.unit_options
  add constraint unit_options_grant_mode_ck
    check (grant_mode = any (array['add', 'replace', 'add_or_replace', 'take_any', 'crew']));

comment on column public.unit_options.grant_mode is 'How the grant relates to what is carried: add, replace, add_or_replace, take_any, or crew, where the models man the weapon rather than carry it (a Servitor crewing a support weapon).';
