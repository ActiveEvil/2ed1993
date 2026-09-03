create table public.wargear_cards_armour (
  wargear_card_id integer not null references public.wargear_cards (id) on delete cascade,
  armour_id integer not null references public.armour (id),
  position smallint not null default 1,
  primary key (wargear_card_id, armour_id)
);

alter table public.wargear_cards_armour enable row level security;

create policy "Public wargear_cards_armour are viewable by everyone."
  on public.wargear_cards_armour for select using (true);

insert into public.wargear_cards_armour (wargear_card_id, armour_id, position)
select id, armour_id, 1 from public.wargear_cards where armour_id is not null;
