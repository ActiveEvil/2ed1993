CREATE TABLE IF NOT EXISTS "public"."army_list_requirements" (
    "id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "army_list_id" integer NOT NULL,
    "kind" "text" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "entry_id" integer,
    "set_id" integer,
    "unit_category_id" integer,
    "entry_option_id" integer,
    "unit_option_id" integer,
    "wargear_item_id" integer,
    "ally_id" integer,
    "target_entry_id" integer,
    "target_set_id" integer,
    "target_category_id" integer,
    "target_profile_id" integer,
    "target_wargear_item_id" integer,
    "target_unit_id" integer,
    "target_ally_id" integer,
    "target_unit_option_id" integer,
    "target_entry_option_id" integer,
    "variant_id" integer,
    "under_variant" boolean,
    "count" integer,
    "mode" "text",
    "label" "text",
    "note" "text",
    CONSTRAINT "army_list_requirements_kind_ck" CHECK (("kind" = ANY (ARRAY['requires_unit'::"text", 'commander'::"text", 'transport'::"text", 'band_reassignment'::"text", 'pairing'::"text", 'attachment'::"text", 'army_cap'::"text", 'army_variant'::"text", 'ally_scope'::"text", 'substitution'::"text", 'unit_composition'::"text"]))),
    CONSTRAINT "army_list_requirements_subject_ck" CHECK (((((((((("entry_id" IS NOT NULL))::integer + (("set_id" IS NOT NULL))::integer) + (("unit_category_id" IS NOT NULL))::integer) + (("entry_option_id" IS NOT NULL))::integer) + (("unit_option_id" IS NOT NULL))::integer) + (("wargear_item_id" IS NOT NULL))::integer) + (("ally_id" IS NOT NULL))::integer) = 1)),
    CONSTRAINT "army_list_requirements_target_ck" CHECK ((((((((((("target_entry_id" IS NOT NULL))::integer + (("target_set_id" IS NOT NULL))::integer) + (("target_category_id" IS NOT NULL))::integer) + (("target_profile_id" IS NOT NULL))::integer) + (("target_wargear_item_id" IS NOT NULL))::integer) + (("target_unit_id" IS NOT NULL))::integer) + (("target_ally_id" IS NOT NULL))::integer) + (("target_unit_option_id" IS NOT NULL))::integer) + (("target_entry_option_id" IS NOT NULL))::integer) <= 1)),
    CONSTRAINT "army_list_requirements_variant_ck" CHECK ((("variant_id" IS NULL) = ("under_variant" IS NULL))),
    CONSTRAINT "army_list_requirements_count_ck" CHECK ((("count" IS NULL) OR ("count" >= 0))),
    CONSTRAINT "army_list_requirements_requires_unit_ck" CHECK ((("kind" <> 'requires_unit'::"text") OR ((("entry_id" IS NOT NULL) OR ("set_id" IS NOT NULL) OR ("unit_option_id" IS NOT NULL) OR ("entry_option_id" IS NOT NULL) OR ("ally_id" IS NOT NULL)) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL) OR ("target_unit_option_id" IS NOT NULL) OR ("target_entry_option_id" IS NOT NULL)) AND (("mode" IS NULL) OR ("mode" = 'unless_transporting'::"text")) AND ("label" IS NULL)))),
    CONSTRAINT "army_list_requirements_commander_ck" CHECK ((("kind" <> 'commander'::"text") OR (("entry_id" IS NOT NULL) AND ("count" IS NOT NULL) AND ("mode" = ANY (ARRAY['must'::"text", 'may'::"text"])) AND ("set_id" IS NULL) AND ("target_set_id" IS NULL) AND ("target_category_id" IS NULL)))),
    CONSTRAINT "army_list_requirements_transport_ck" CHECK ((("kind" <> 'transport'::"text") OR (("entry_id" IS NOT NULL) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['squads'::"text", 'characters'::"text"]))))),
    CONSTRAINT "army_list_requirements_band_reassignment_ck" CHECK ((("kind" <> 'band_reassignment'::"text") OR ((("entry_id" IS NOT NULL) OR ("unit_category_id" IS NOT NULL)) AND ("target_category_id" IS NOT NULL) AND ("mode" = ANY (ARRAY['rider'::"text", 'always'::"text"]))))),
    CONSTRAINT "army_list_requirements_pairing_ck" CHECK ((("kind" <> 'pairing'::"text") OR ((("wargear_item_id" IS NOT NULL) OR ("unit_option_id" IS NOT NULL) OR ("entry_option_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['requires'::"text", 'excludes'::"text", 'exclusive'::"text"])) AND (("mode" = 'exclusive'::"text") = (("target_wargear_item_id" IS NULL) AND ("target_unit_option_id" IS NULL) AND ("target_entry_option_id" IS NULL))) AND ("target_entry_id" IS NULL) AND ("target_set_id" IS NULL) AND ("target_category_id" IS NULL) AND ("target_profile_id" IS NULL) AND ("target_unit_id" IS NULL) AND ("target_ally_id" IS NULL)))),
    CONSTRAINT "army_list_requirements_attachment_ck" CHECK ((("kind" <> 'attachment'::"text") OR (("entry_id" IS NOT NULL) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['must'::"text", 'may'::"text"]))))),
    CONSTRAINT "army_list_requirements_army_cap_ck" CHECK ((("kind" <> 'army_cap'::"text") OR ((("entry_id" IS NOT NULL) OR ("set_id" IS NOT NULL) OR ("unit_category_id" IS NOT NULL) OR ("unit_option_id" IS NOT NULL)) AND ("count" IS NOT NULL) AND ("mode" = ANY (ARRAY['models'::"text", 'units'::"text", 'points'::"text", 'options'::"text"])) AND (NOT (("mode" = 'units'::"text") AND ("entry_id" IS NOT NULL)))))),
    CONSTRAINT "army_list_requirements_army_variant_ck" CHECK ((("kind" <> 'army_variant'::"text") OR (("unit_category_id" IS NOT NULL) AND ("label" IS NOT NULL) AND ("variant_id" IS NULL)))),
    CONSTRAINT "army_list_requirements_ally_scope_ck" CHECK ((("kind" <> 'ally_scope'::"text") OR (("ally_id" IS NOT NULL) AND ("mode" = ANY (ARRAY['requires'::"text", 'excludes_unit'::"text", 'excludes_ally'::"text", 'commanders'::"text"])) AND (("mode" <> 'requires'::"text") OR ("target_entry_id" IS NOT NULL)) AND (("mode" <> 'excludes_unit'::"text") OR ("target_unit_id" IS NOT NULL)) AND (("mode" <> 'excludes_ally'::"text") OR ("target_ally_id" IS NOT NULL)) AND (("mode" <> 'commanders'::"text") OR (("count" IS NOT NULL) AND ("target_entry_id" IS NULL) AND ("target_unit_id" IS NULL) AND ("target_ally_id" IS NULL)))))),
    CONSTRAINT "army_list_requirements_substitution_ck" CHECK ((("kind" <> 'substitution'::"text") OR (("entry_id" IS NOT NULL) AND ("target_entry_id" IS NOT NULL) AND ("mode" IS NULL)))),
    CONSTRAINT "army_list_requirements_unit_composition_ck" CHECK ((("kind" <> 'unit_composition'::"text") OR (("entry_id" IS NOT NULL) AND ("target_entry_id" IS NOT NULL) AND ("mode" = 'mounted_with'::"text"))))
);

ALTER TABLE "public"."army_list_requirements" OWNER TO "postgres";

COMMENT ON TABLE "public"."army_list_requirements" IS 'One construction rule on one list, of one kind. The subject is the one row the rule is about; the target, where the kind has one, is the row it relates to. Each kind''s check says which columns it fills.';

COMMENT ON COLUMN "public"."army_list_requirements"."mode" IS 'A fixed word the kind interprets; the kind''s check lists the values it allows.';

COMMENT ON COLUMN "public"."army_list_requirements"."note" IS 'Plain text. The sentence the page prints for this row, where the rule is shown as one.';

ALTER TABLE "public"."army_list_requirements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."army_list_requirements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_army_list_id_fkey" FOREIGN KEY ("army_list_id") REFERENCES "public"."army_lists"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "public"."army_list_entries"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."army_list_allowance_sets"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_unit_category_id_fkey" FOREIGN KEY ("unit_category_id") REFERENCES "public"."unit_categories"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_entry_option_id_fkey" FOREIGN KEY ("entry_option_id") REFERENCES "public"."army_list_entry_options"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_unit_option_id_fkey" FOREIGN KEY ("unit_option_id") REFERENCES "public"."unit_options"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_wargear_item_id_fkey" FOREIGN KEY ("wargear_item_id") REFERENCES "public"."wargear_items"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_ally_id_fkey" FOREIGN KEY ("ally_id") REFERENCES "public"."army_list_allies"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_entry_id_fkey" FOREIGN KEY ("target_entry_id") REFERENCES "public"."army_list_entries"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_set_id_fkey" FOREIGN KEY ("target_set_id") REFERENCES "public"."army_list_allowance_sets"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_category_id_fkey" FOREIGN KEY ("target_category_id") REFERENCES "public"."unit_categories"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_profile_id_fkey" FOREIGN KEY ("target_profile_id") REFERENCES "public"."unit_profiles"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_wargear_item_id_fkey" FOREIGN KEY ("target_wargear_item_id") REFERENCES "public"."wargear_items"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_unit_id_fkey" FOREIGN KEY ("target_unit_id") REFERENCES "public"."units"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_ally_id_fkey" FOREIGN KEY ("target_ally_id") REFERENCES "public"."army_list_allies"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_unit_option_id_fkey" FOREIGN KEY ("target_unit_option_id") REFERENCES "public"."unit_options"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_entry_option_id_fkey" FOREIGN KEY ("target_entry_option_id") REFERENCES "public"."army_list_entry_options"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."army_list_requirements"("id") ON DELETE RESTRICT;

CREATE INDEX "army_list_requirements_army_list_id_idx" ON "public"."army_list_requirements" USING "btree" ("army_list_id", "kind", "position");

CREATE INDEX "army_list_requirements_entry_id_idx" ON "public"."army_list_requirements" USING "btree" ("entry_id");

CREATE INDEX "army_list_requirements_set_id_idx" ON "public"."army_list_requirements" USING "btree" ("set_id");

CREATE INDEX "army_list_requirements_unit_category_id_idx" ON "public"."army_list_requirements" USING "btree" ("unit_category_id");

CREATE INDEX "army_list_requirements_entry_option_id_idx" ON "public"."army_list_requirements" USING "btree" ("entry_option_id");

CREATE INDEX "army_list_requirements_unit_option_id_idx" ON "public"."army_list_requirements" USING "btree" ("unit_option_id");

CREATE INDEX "army_list_requirements_wargear_item_id_idx" ON "public"."army_list_requirements" USING "btree" ("wargear_item_id");

CREATE INDEX "army_list_requirements_ally_id_idx" ON "public"."army_list_requirements" USING "btree" ("ally_id");

CREATE INDEX "army_list_requirements_target_entry_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_entry_id");

CREATE INDEX "army_list_requirements_target_set_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_set_id");

CREATE INDEX "army_list_requirements_target_category_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_category_id");

CREATE INDEX "army_list_requirements_target_profile_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_profile_id");

CREATE INDEX "army_list_requirements_target_wargear_item_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_wargear_item_id");

CREATE INDEX "army_list_requirements_target_unit_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_unit_id");

CREATE INDEX "army_list_requirements_target_ally_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_ally_id");

CREATE INDEX "army_list_requirements_target_unit_option_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_unit_option_id");

CREATE INDEX "army_list_requirements_target_entry_option_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_entry_option_id");

CREATE INDEX "army_list_requirements_variant_id_idx" ON "public"."army_list_requirements" USING "btree" ("variant_id");

CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."army_list_requirements" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');

CREATE POLICY "Public army_list_requirements are viewable by everyone." ON "public"."army_list_requirements" FOR SELECT USING (true);

ALTER TABLE "public"."army_list_requirements" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."army_list_requirements" TO "anon";
GRANT ALL ON TABLE "public"."army_list_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."army_list_requirements" TO "service_role";

GRANT ALL ON SEQUENCE "public"."army_list_requirements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."army_list_requirements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."army_list_requirements_id_seq" TO "service_role";

ALTER TABLE "public"."army_list_entry_options" ADD COLUMN IF NOT EXISTS "optional" boolean DEFAULT true NOT NULL;

COMMENT ON COLUMN "public"."army_list_entry_options"."optional" IS 'False where the option is taken with the entry and cannot be removed. A group sharing a non-zero alternative with every row false means exactly one of the group must be taken.';

ALTER TABLE "public"."army_list_entries" ADD COLUMN IF NOT EXISTS "allowed_as_ally" boolean DEFAULT true NOT NULL;

COMMENT ON COLUMN "public"."army_list_entries"."allowed_as_ally" IS 'False where no ally row may offer the entry, whatever the host list.';

WITH "u" AS (
    UPDATE "public"."army_list_entries" SET "allowed_as_ally" = false
    WHERE "id" IN (131, 280) AND "unit_id" IN (134, 221)
    RETURNING "id"
)
SELECT ('GUARD FAILED: allowed_as_ally ' || count(*))::integer FROM "u" HAVING count(*) <> 2;

ALTER TABLE "public"."datafax_weapons" ADD COLUMN IF NOT EXISTS "alternative_max" smallint;

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_alternative_max_ck" CHECK ((("alternative_max" IS NULL) OR (("alternative" > 0) AND ("alternative_max" >= 1))));

COMMENT ON COLUMN "public"."datafax_weapons"."alternative_max" IS 'How many rows of this alternative group may be taken. Null means one. Every row of a group carries the same value.';

WITH "u" AS (
    UPDATE "public"."datafax_weapons" SET "alternative_max" = 2
    WHERE "datafax_id" IN (5, 18) AND "alternative" = 1
    RETURNING "id"
)
SELECT ('GUARD FAILED: alternative_max ' || count(*))::integer FROM "u" HAVING count(*) <> 13;

ALTER TABLE "public"."army_list_allowance_rules" ALTER COLUMN "count" DROP NOT NULL;

ALTER TABLE ONLY "public"."army_list_allowance_rules" DROP CONSTRAINT IF EXISTS "army_list_allowance_rules_counts_ck";

ALTER TABLE ONLY "public"."army_list_allowance_rules"
    ADD CONSTRAINT "army_list_allowance_rules_counts_ck" CHECK (((("count" IS NULL) OR ("count" >= 0)) AND ("per_count" > 0) AND (("count" IS NOT NULL) OR ("min_count" IS NOT NULL))));

ALTER TABLE ONLY "public"."army_list_allowance_rules" DROP CONSTRAINT IF EXISTS "army_list_allowance_rules_min_count_ck";

ALTER TABLE ONLY "public"."army_list_allowance_rules"
    ADD CONSTRAINT "army_list_allowance_rules_min_count_ck" CHECK ((("min_count" IS NULL) OR (("min_count" >= 1) AND (("count" IS NULL) OR ("min_count" <= "count")) AND ("per_rule_id" IS NULL))));

ALTER TABLE "public"."wargear_categories" ADD COLUMN IF NOT EXISTS "limit_scope" "text";

ALTER TABLE "public"."wargear_categories" ADD COLUMN IF NOT EXISTS "limit_max" smallint;

ALTER TABLE "public"."wargear_categories" ADD COLUMN IF NOT EXISTS "limit_min" smallint;

ALTER TABLE "public"."wargear_categories" ADD COLUMN IF NOT EXISTS "combination_counts_as_one" boolean DEFAULT false NOT NULL;

ALTER TABLE "public"."wargear_categories" ADD COLUMN IF NOT EXISTS "distinct_items" boolean DEFAULT false NOT NULL;

ALTER TABLE ONLY "public"."wargear_categories"
    ADD CONSTRAINT "wargear_categories_limit_scope_ck" CHECK (("limit_scope" = ANY (ARRAY['model'::"text", 'team'::"text", 'crew'::"text", 'unit'::"text"])));

ALTER TABLE ONLY "public"."wargear_categories"
    ADD CONSTRAINT "wargear_categories_limit_ck" CHECK (((("limit_max" IS NULL) OR ("limit_max" >= 1)) AND (("limit_min" IS NULL) OR ("limit_min" >= 0)) AND (("limit_min" IS NULL) OR ("limit_max" IS NULL) OR ("limit_min" <= "limit_max")) AND (("limit_scope" IS NOT NULL) OR (("limit_max" IS NULL) AND ("limit_min" IS NULL)))));

COMMENT ON COLUMN "public"."wargear_categories"."limit_scope" IS 'What the section''s limit counts per: model, team, crew or unit. The note''s opening sentence states it and verify.py checks the two agree.';

COMMENT ON COLUMN "public"."wargear_categories"."limit_max" IS 'Items a scope may take from the section. Null means any number.';

COMMENT ON COLUMN "public"."wargear_categories"."limit_min" IS 'Items a scope must take from the section. Null where the items are optional.';

COMMENT ON COLUMN "public"."wargear_categories"."combination_counts_as_one" IS 'True where a combination of the section''s items counts as one item against limit_max.';

COMMENT ON COLUMN "public"."wargear_categories"."distinct_items" IS 'True where no item may be taken twice by one scope.';

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = 1, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (3, 4, 5, 12, 15, 16, 18, 21, 28, 30, 35, 36, 43, 44, 47, 48, 54, 55, 56, 61, 62, 63, 64, 76, 77, 78, 79, 83, 89, 90, 93)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one per model ' || count(*))::integer FROM "u" HAVING count(*) <> 31;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = 1, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (1, 6, 19, 24, 26, 33, 45, 57, 59, 66, 68, 74, 87, 91)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one item per model ' || count(*))::integer FROM "u" HAVING count(*) <> 14;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = NULL, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (2, 8, 10, 14, 17, 20, 22, 27, 29, 34, 37, 41, 46, 50, 53, 60, 65, 75, 80, 81, 82, 86, 88, 92)
    RETURNING "id"
)
SELECT ('GUARD FAILED: any number per model ' || count(*))::integer FROM "u" HAVING count(*) <> 24;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = 1, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (23, 31)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one item per servitor ' || count(*))::integer FROM "u" HAVING count(*) <> 2;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'crew', "limit_max" = 1, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (7, 38)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one item per crew ' || count(*))::integer FROM "u" HAVING count(*) <> 2;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'team', "limit_max" = 1, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (13, 69)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one per team ' || count(*))::integer FROM "u" HAVING count(*) <> 2;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'unit', "limit_max" = NULL, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (42)
    RETURNING "id"
)
SELECT ('GUARD FAILED: any number per squad ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'unit', "limit_max" = NULL, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (73)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one price per unit ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = 2, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (52)
    RETURNING "id"
)
SELECT ('GUARD FAILED: two per model ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = 1, "limit_min" = NULL, "combination_counts_as_one" = true, "distinct_items" = false
    WHERE "id" IN (84)
    RETURNING "id"
)
SELECT ('GUARD FAILED: one item or combination ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = 2, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = true
    WHERE "id" IN (85)
    RETURNING "id"
)
SELECT ('GUARD FAILED: up to two different ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "limit_scope" = 'model', "limit_max" = NULL, "limit_min" = NULL, "combination_counts_as_one" = false, "distinct_items" = false
    WHERE "id" IN (72)
    RETURNING "id"
)
SELECT ('GUARD FAILED: only where an entry allows ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "note" = 'One item per model. Servitors only. May not be chosen for Character models. Every support weapon carries a Targeter.'
    WHERE "id" IN (23, 31) AND "note" = 'One item per Servitor. May not be chosen for Character models. Every support weapon carries a Targeter.'
    RETURNING "id"
)
SELECT ('GUARD FAILED: note servitors ' || count(*))::integer FROM "u" HAVING count(*) <> 2;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "note" = 'Two per model. Runtherdz only.'
    WHERE "id" = 52 AND "note" = 'Runtherdz only. Two per model.'
    RETURNING "id"
)
SELECT ('GUARD FAILED: note runtherdz ' || count(*))::integer FROM "u" HAVING count(*) <> 1;

WITH "u" AS (
    UPDATE "public"."wargear_categories" SET "note" = 'One item per crew. May not be chosen for Character models. Every Squat support weapon carries a Targeter.'
    WHERE "id" = 38 AND "note" = 'One item per Crew. May not be chosen for Character models. Every Squat support weapon carries a Targeter.'
    RETURNING "id"
)
SELECT ('GUARD FAILED: note crew ' || count(*))::integer FROM "u" HAVING count(*) <> 1;
