-- 5 October 2026. Army lists carry the year the book was published; the faction page orders by it and three pages show it.

alter table public.army_lists
  add column published_year smallint,
  add constraint army_lists_published_year_ck check (published_year is null or published_year between 1987 and 1999);

comment on column public.army_lists.published_year is 'Year the list was first published. Orders the faction page, newest first, nulls last, then by name. Null prints nothing.';
