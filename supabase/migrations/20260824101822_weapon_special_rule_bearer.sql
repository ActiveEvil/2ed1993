alter table weapon_special_rules
  add column bearer text
  check (bearer in ('Infantry', 'Vehicle'));

comment on column weapon_special_rules.bearer is 'The kind of model that must carry the weapon for this rule to apply; null where the rule applies whoever carries it. A datafax renders only null and Vehicle; an infantry surface only null and Infantry.';

update weapon_special_rules set bearer = 'Infantry' where name = 'Move or Fire';
update weapon_special_rules set bearer = 'Vehicle' where name = 'Vehicle Mounted';
