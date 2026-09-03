alter table army_list_entry_options
  add column unit_option_id integer references unit_options(id);
