-- 5 October 2026. ELD-47: an allowance rule may carry a minimum, as an army list entry does.

alter table public.army_list_allowance_rules
  add column min_count integer,
  add constraint army_list_allowance_rules_min_count_ck check (
    min_count is null or (min_count between 1 and count and per_rule_id is null)
  );

comment on column public.army_list_allowance_rules.min_count is 'The fewest the army must take per target. Null means no minimum and the line reads "up to"; equal to count it reads "exactly"; below count it prints a range. Not set on a rule counted per rule.';
