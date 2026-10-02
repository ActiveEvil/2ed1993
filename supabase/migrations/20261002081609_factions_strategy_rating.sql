-- 2 October 2026. The default Strategy Rating belongs to the faction; every army list of the faction takes it.

alter table public.factions
  add column strategy_rating smallint,
  add constraint factions_strategy_rating_ck check (strategy_rating between 1 and 6);

comment on column public.factions.strategy_rating is 'The faction''s default Strategy Rating, from the Default Strategy Ratings table in The Game Steps. Each army list of the faction takes it. Null on a faction with a parent means the parent''s rating applies; null on a faction without one means no source gives a rating. A character whose profile carries a different rating changes it when that character leads.';
