SELECT ('GUARD FAILED: builder schema pass in use ' || "n")::integer FROM (SELECT (SELECT count(*) FROM "public"."saved_lists") + (SELECT count(*) FROM "public"."catalogue_redirects") + (SELECT count(*) FROM "public"."wargear_card_printings") + (SELECT count(*) FROM "public"."army_list_allowance_sets" WHERE "shares_allowance") AS "n") AS "c" WHERE "n" <> 0;

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."army_list_allies";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."affiliations";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."army_list_requirements";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."vehicle_cards";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."wargear_cards";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."datafax_weapon_ammunition";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."datafax_weapons";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."wargear_items";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."unit_options";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."unit_profiles";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."army_list_entries";

DROP TRIGGER IF EXISTS "refuse_unredirected_change" ON "public"."army_lists";

DROP FUNCTION IF EXISTS "public"."refuse_unredirected_change"();

DROP TABLE IF EXISTS "public"."wargear_card_printings";

DROP TABLE IF EXISTS "public"."catalogue_redirects";

ALTER TABLE ONLY "public"."saved_lists" DROP CONSTRAINT IF EXISTS "saved_lists_commander_unit_id_fkey";

DROP TABLE IF EXISTS "public"."saved_list_choices";

DROP TABLE IF EXISTS "public"."saved_list_units";

DROP TABLE IF EXISTS "public"."saved_lists";

DROP FUNCTION IF EXISTS "public"."refuse_misparented_choice"();

DROP FUNCTION IF EXISTS "public"."clear_attach_mode"();

ALTER TABLE "public"."army_list_allowance_sets" DROP COLUMN IF EXISTS "shares_allowance";

ALTER TABLE ONLY "public"."datafax_weapon_ammunition" DROP CONSTRAINT IF EXISTS "datafax_weapon_ammunition_pkey";

ALTER TABLE ONLY "public"."datafax_weapon_ammunition"
    ADD CONSTRAINT "datafax_weapon_ammunition_pkey" PRIMARY KEY ("datafax_weapon_id", "weapon_profile_id");

ALTER TABLE ONLY "public"."datafax_weapon_ammunition" DROP CONSTRAINT IF EXISTS "datafax_weapon_ammunition_datafax_weapon_id_weapon_profile_key";

ALTER TABLE "public"."datafax_weapon_ammunition" DROP COLUMN IF EXISTS "id";
