WITH "u" AS (
    UPDATE "public"."armour" SET "bars_bike" = false
    WHERE "id" = 23 AND "name" = 'Mega-Armour' AND "bars_bike" AND NOT "bars_jump_pack"
    RETURNING "id"
)
SELECT ('GUARD FAILED: mega-armour ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."armour" SET "bars_bike" = false, "bars_jump_pack" = false
    WHERE "id" = 10 AND "name" = 'Terminator Armour' AND "bars_bike" AND "bars_jump_pack"
    RETURNING "id"
)
SELECT ('GUARD FAILED: terminator armour ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

SELECT ('GUARD FAILED: armour bars in use ' || count(*))::integer FROM "public"."armour" WHERE "bars_bike" OR "bars_jump_pack" HAVING count(*) <> 0;

ALTER TABLE "public"."armour" DROP COLUMN IF EXISTS "bars_jump_pack";

ALTER TABLE "public"."armour" DROP COLUMN IF EXISTS "bars_bike";

SELECT ('GUARD FAILED: per_models in use ' || count(*))::integer FROM "public"."datafax_weapons" WHERE "per_models" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_per_models_ck";

ALTER TABLE "public"."datafax_weapons" DROP COLUMN IF EXISTS "per_models";

SELECT ('GUARD FAILED: replaced weapons in use ' || count(*))::integer FROM "public"."unit_option_replaced_weapons" HAVING count(*) <> 0;

DROP TABLE IF EXISTS "public"."unit_option_replaced_weapons";

SELECT ('GUARD FAILED: per_half in use ' || count(*))::integer FROM "public"."unit_options" WHERE "per_half" HAVING count(*) <> 0;

ALTER TABLE "public"."unit_options" DROP COLUMN IF EXISTS "per_half";

SELECT ('GUARD FAILED: deduction in use ' || count(*))::integer FROM "public"."army_list_allowance_rules" WHERE "deduction" <> 0 HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_list_allowance_rules" DROP CONSTRAINT IF EXISTS "army_list_allowance_rules_deduction_ck";

ALTER TABLE "public"."army_list_allowance_rules" DROP COLUMN IF EXISTS "deduction";

COMMENT ON COLUMN "public"."army_list_requirements"."count" IS NULL;

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT IF EXISTS "army_list_requirements_target_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_ck" CHECK (((((((((((("target_entry_id" IS NOT NULL))::integer + (("target_set_id" IS NOT NULL))::integer) + (("target_category_id" IS NOT NULL))::integer) + (("target_profile_id" IS NOT NULL))::integer) + (("target_wargear_item_id" IS NOT NULL))::integer) + (("target_unit_id" IS NOT NULL))::integer) + (("target_ally_id" IS NOT NULL))::integer) + (("target_unit_option_id" IS NOT NULL))::integer) + (("target_entry_option_id" IS NOT NULL))::integer) <= 1));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT IF EXISTS "army_list_requirements_ally_scope_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_ally_scope_ck" CHECK ((("kind" <> 'ally_scope'::"text") OR (("ally_id" IS NOT NULL) AND ("mode" = ANY (ARRAY['requires'::"text", 'excludes_unit'::"text", 'excludes_ally'::"text", 'commanders'::"text"])) AND (("mode" <> 'requires'::"text") OR ("target_entry_id" IS NOT NULL)) AND (("mode" <> 'excludes_unit'::"text") OR ("target_unit_id" IS NOT NULL)) AND (("mode" <> 'excludes_ally'::"text") OR ("target_ally_id" IS NOT NULL)) AND (("mode" <> 'commanders'::"text") OR (("count" IS NOT NULL) AND ("target_entry_id" IS NULL) AND ("target_unit_id" IS NULL) AND ("target_ally_id" IS NULL))))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT IF EXISTS "army_list_requirements_pairing_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_pairing_ck" CHECK ((("kind" <> 'pairing'::"text") OR ((("wargear_item_id" IS NOT NULL) OR ("unit_option_id" IS NOT NULL) OR ("entry_option_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['requires'::"text", 'excludes'::"text", 'exclusive'::"text"])) AND (("mode" = 'exclusive'::"text") = (("target_wargear_item_id" IS NULL) AND ("target_unit_option_id" IS NULL) AND ("target_entry_option_id" IS NULL))) AND ("target_entry_id" IS NULL) AND ("target_set_id" IS NULL) AND ("target_category_id" IS NULL) AND ("target_profile_id" IS NULL) AND ("target_unit_id" IS NULL) AND ("target_ally_id" IS NULL))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT IF EXISTS "army_list_requirements_unit_composition_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_unit_composition_ck" CHECK ((("kind" <> 'unit_composition'::"text") OR (("entry_id" IS NOT NULL) AND ("target_entry_id" IS NOT NULL) AND ("mode" = 'mounted_with'::"text"))));

SELECT ('GUARD FAILED: subject_profile_id in use ' || count(*))::integer FROM "public"."army_list_requirements" WHERE "subject_profile_id" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT IF EXISTS "army_list_requirements_subject_profile_ck";

ALTER TABLE "public"."army_list_requirements" DROP COLUMN IF EXISTS "subject_profile_id";

SELECT ('GUARD FAILED: squadron or mastery cap in use ' || count(*))::integer FROM "public"."army_list_entries" WHERE "squadron_max" IS NOT NULL OR "mastery_level_max" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT IF EXISTS "army_list_entries_mastery_level_max_ck";

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT IF EXISTS "army_list_entries_squadron_max_ck";

ALTER TABLE "public"."army_list_entries" DROP COLUMN IF EXISTS "mastery_level_max";

ALTER TABLE "public"."army_list_entries" DROP COLUMN IF EXISTS "squadron_max";

SELECT ('GUARD FAILED: ally display or mode in use ' || count(*))::integer FROM "public"."army_list_allies" WHERE NOT "display" OR "mode" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_list_allies" DROP CONSTRAINT IF EXISTS "army_list_allies_mode_ck";

ALTER TABLE "public"."army_list_allies" DROP COLUMN IF EXISTS "mode";

ALTER TABLE "public"."army_list_allies" DROP COLUMN IF EXISTS "display";

SELECT ('GUARD FAILED: item eligibility in use ' || count(*))::integer FROM "public"."wargear_item_eligibility" HAVING count(*) <> 0;

DROP TABLE IF EXISTS "public"."wargear_item_eligibility";

SELECT ('GUARD FAILED: entry affiliation in use ' || count(*))::integer FROM "public"."army_list_entries" WHERE "affiliation_id" IS NOT NULL OR "affiliation_label" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT IF EXISTS "army_list_entries_affiliation_ck";

ALTER TABLE "public"."army_list_entries" DROP COLUMN IF EXISTS "affiliation_label";

ALTER TABLE "public"."army_list_entries" DROP COLUMN IF EXISTS "affiliation_id";

SELECT ('GUARD FAILED: item affiliation in use ' || count(*))::integer FROM "public"."wargear_items" WHERE "affiliation_id" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE "public"."wargear_items" DROP COLUMN IF EXISTS "affiliation_id";

SELECT ('GUARD FAILED: option affiliation in use ' || count(*))::integer FROM "public"."unit_options" WHERE "affiliation_id" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE "public"."unit_options" DROP COLUMN IF EXISTS "affiliation_id";

SELECT ('GUARD FAILED: affiliations in use ' || count(*))::integer FROM "public"."affiliations" HAVING count(*) <> 0;

DROP TABLE IF EXISTS "public"."affiliations";
