alter table public.wargear_cards
  drop constraint wargear_cards_single_body;

alter table public.wargear_cards
  add constraint wargear_cards_body check (
    -- an item is a weapon or a piece of armour, never both
    (weapon_id is null or armour_id is null)
    -- and a card must carry something: a linked item, its own words, or both
    and num_nonnulls(weapon_id, armour_id, description) >= 1
  );
