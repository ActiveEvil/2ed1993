-- Ruling 21, 3 September 2026. Five Black Codex lists print a sentence letting
-- bikes be bought as transport, and each names whom they may carry. The
-- permission belongs to the bike entry, so it is read off that entry and said by
-- the renderer, rather than written out as a granted-unit row on every character
-- and squad the sentence reaches. Supersedes the per-unit mechanism of ruling 12.

alter table public.army_list_entries add column transport_scope text;

alter table public.army_list_entries
  add constraint army_list_entries_transport_scope_check
  check (transport_scope in ('characters', 'squads', 'characters_and_squads'));

comment on column public.army_list_entries.transport_scope is 'Whom this entry may be bought as transport for, where its list prints such a permission: characters, squads, or characters_and_squads. Null on every entry that is not transport. Where a list reaches only some squads (Eldar Guardians, Genestealer Brood Brothers) the scope stays characters_and_squads and the entry note carries the qualification.';
