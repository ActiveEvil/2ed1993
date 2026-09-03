alter table datafax_weapons
  add column alternative smallint not null default 0,
  add column optional boolean not null default false,
  add column points numeric(5,1);

comment on column datafax_weapons.alternative is 'Rows sharing a non-zero value are mutually exclusive choices; 0 is not part of a choice.';
comment on column datafax_weapons.optional is 'True where the fitting may be omitted entirely.';
comment on column datafax_weapons.points is 'Added cost of the option; null where the fitting is included in datafaxes.points.';
