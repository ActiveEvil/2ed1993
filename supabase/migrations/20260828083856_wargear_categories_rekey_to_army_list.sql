alter table wargear_categories alter column army_list_id set not null;
alter table wargear_categories drop constraint wargear_categories_faction_category_uk;
alter table wargear_categories drop column faction_id;
alter table wargear_categories add constraint wargear_categories_list_category_uk unique (army_list_id, category);
