alter table army_lists add column slug text;

update army_lists set slug = 'black-codex' where id in (2, 3, 5);
update army_lists set slug = 'codex-imperial-guard' where id = 1;
update army_lists set slug = 'rogue-traders' where id = 4;

alter table army_lists alter column slug set not null;
alter table army_lists add constraint army_lists_faction_slug_uk unique (faction_id, slug);
