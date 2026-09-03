create table public.availabilities (
  id integer generated always as identity primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone,
  name text not null unique,
  position integer not null unique
);

alter table public.availabilities enable row level security;
create policy "Public availabilities are viewable by everyone."
  on public.availabilities for select using (true);
create trigger handle_updated_at before update on public.availabilities
  for each row execute function extensions.moddatetime('updated_at');

create table public.wargear_cards_availabilities (
  wargear_card_id integer not null references public.wargear_cards (id) on delete cascade,
  availability_id integer not null references public.availabilities (id) on delete restrict,
  primary key (wargear_card_id, availability_id)
);

alter table public.wargear_cards_availabilities enable row level security;
create policy "Public wargear_cards_availabilities are viewable by everyone."
  on public.wargear_cards_availabilities for select using (true);

create index wargear_cards_availabilities_availability_id_idx
  on public.wargear_cards_availabilities (availability_id);

insert into public.availabilities (name, position) values
  ('Any Army', 0), ('Imperial', 1), ('Eldar', 2), ('Orks', 3), ('Chaos', 4);

insert into public.wargear_cards_availabilities (wargear_card_id, availability_id)
select c.id, a.id from public.wargear_cards c
join public.availabilities a on a.name = c.availability;
