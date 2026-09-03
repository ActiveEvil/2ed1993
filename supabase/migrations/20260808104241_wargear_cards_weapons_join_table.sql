-- A wargear card may grant more than one weapon: Exitus Weapons is a matched
-- longrifle and pistol, Combi-Weapon is a boltgun plus a second barrel, and the
-- Gauntlets of Ultramar are a pair. A single weapon_id forced a category on a
-- row that is two different kinds of weapon, so the link becomes many.
create table public.wargear_cards_weapons (
  wargear_card_id integer not null references public.wargear_cards (id) on delete cascade,
  weapon_id integer not null references public.weapons (id),
  -- Render order on the card face; the sources print the primary weapon first.
  position smallint not null default 1,
  primary key (wargear_card_id, weapon_id)
);

alter table public.wargear_cards_weapons enable row level security;

create policy "Public wargear_cards_weapons are viewable by everyone."
  on public.wargear_cards_weapons for select using (true);

insert into public.wargear_cards_weapons (wargear_card_id, weapon_id, position)
select id, weapon_id, 1 from public.wargear_cards where weapon_id is not null;

-- The check cannot survive the move: a check constraint cannot see another
-- table, so "a card must carry something" is no longer expressible here. It
-- becomes an authoring rule instead, and an empty card is conspicuous on the
-- page. The armour link stays scalar; no card in any source grants two pieces
-- of armour, and Storm Shield is its only user.
alter table public.wargear_cards drop constraint wargear_cards_body;
alter table public.wargear_cards drop column weapon_id;
