create table rule_sections (
  id          integer generated always as identity primary key,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz,
  name        text    not null,
  position    integer not null,
  numbered    boolean not null default true
);

alter table rule_sections enable row level security;

create policy "Public rule_sections are viewable by everyone."
  on rule_sections for select using (true);

insert into rule_sections (name, position, numbered) values
  ('Before the game', 0, true),
  ('The turn sequence', 1, true),
  ('General rules, weapons, psychology & vehicles', 2, true),
  ('Factions', 3, false);

alter table rule_categories add column section_id integer references rule_sections(id);

update rule_categories set section_id = (select id from rule_sections where name = 'Before the game')
  where slug in ('the-golden-rule', 'how-to-play');
update rule_categories set section_id = (select id from rule_sections where name = 'The turn sequence')
  where slug in ('movement', 'shooting', 'hand-to-hand-combat', 'psychic', 'breaking-rallying');
update rule_categories set section_id = (select id from rule_sections where name = 'General rules, weapons, psychology & vehicles')
  where slug in ('general-rules', 'weapon-rules', 'psychology', 'vehicle-rules');

alter table rule_categories alter column section_id set not null;

alter table rule_categories add column faction_id integer references factions(id);
alter table rules           add column faction_id integer references factions(id);
