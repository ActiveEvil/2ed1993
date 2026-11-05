WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "note" = 'One item per Crew. May not be chosen for Character models. Every Squat support weapon carries a Targeter.'
    WHERE "id" = 38 AND "note" = 'One item per crew. May not be chosen for Character models. Every Squat support weapon carries a Targeter.'
    RETURNING "id"
)
SELECT ('GUARD FAILED: note crew ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "note" = 'Runtherdz only. Two per model.'
    WHERE "id" = 52 AND "note" = 'Two per model. Runtherdz only.'
    RETURNING "id"
)
SELECT ('GUARD FAILED: note runtherdz ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "note" = 'One item per Servitor. May not be chosen for Character models. Every support weapon carries a Targeter.'
    WHERE "id" IN (23, 31) AND "note" = 'One item per model. Servitors only. May not be chosen for Character models. Every support weapon carries a Targeter.'
    RETURNING "id"
)
SELECT ('GUARD FAILED: note servitors ' || count(*))::integer FROM "u" HAVING count(*) <> 2;

ALTER TABLE ONLY "public"."wargear_categories" DROP CONSTRAINT IF EXISTS "wargear_categories_limit_ck";

ALTER TABLE ONLY "public"."wargear_categories" DROP CONSTRAINT IF EXISTS "wargear_categories_limit_scope_ck";

ALTER TABLE "public"."wargear_categories" DROP COLUMN IF EXISTS "distinct_items";

ALTER TABLE "public"."wargear_categories" DROP COLUMN IF EXISTS "combination_counts_as_one";

ALTER TABLE "public"."wargear_categories" DROP COLUMN IF EXISTS "limit_min";

ALTER TABLE "public"."wargear_categories" DROP COLUMN IF EXISTS "limit_max";

ALTER TABLE "public"."wargear_categories" DROP COLUMN IF EXISTS "limit_scope";

ALTER TABLE ONLY "public"."army_list_allowance_rules" DROP CONSTRAINT IF EXISTS "army_list_allowance_rules_min_count_ck";

ALTER TABLE ONLY "public"."army_list_allowance_rules"
    ADD CONSTRAINT "army_list_allowance_rules_min_count_ck" CHECK ((("min_count" IS NULL) OR ((("min_count" >= 1) AND ("min_count" <= "count")) AND ("per_rule_id" IS NULL))));

ALTER TABLE ONLY "public"."army_list_allowance_rules" DROP CONSTRAINT IF EXISTS "army_list_allowance_rules_counts_ck";

ALTER TABLE ONLY "public"."army_list_allowance_rules"
    ADD CONSTRAINT "army_list_allowance_rules_counts_ck" CHECK ((("count" >= 0) AND ("per_count" > 0)));

ALTER TABLE "public"."army_list_allowance_rules" ALTER COLUMN "count" SET NOT NULL;

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_alternative_max_ck";

ALTER TABLE "public"."datafax_weapons" DROP COLUMN IF EXISTS "alternative_max";

ALTER TABLE "public"."army_list_entries" DROP COLUMN IF EXISTS "allowed_as_ally";

ALTER TABLE "public"."army_list_entry_options" DROP COLUMN IF EXISTS "optional";

DROP TABLE IF EXISTS "public"."army_list_requirements";
