SELECT ('GUARD FAILED: army_list_entry_id in use ' || count(*))::integer FROM "public"."unit_special_rule_assignments" WHERE "army_list_entry_id" IS NOT NULL HAVING count(*) <> 0;

DROP INDEX IF EXISTS "public"."unit_special_rule_assignments_army_list_entry_id_idx";

ALTER TABLE ONLY "public"."unit_special_rule_assignments"
    DROP CONSTRAINT IF EXISTS "unit_special_rule_assignments_unit_rule_entry_key",
    DROP CONSTRAINT IF EXISTS "unit_special_rule_assignments_army_list_entry_id_fkey";

ALTER TABLE "public"."unit_special_rule_assignments" DROP COLUMN IF EXISTS "army_list_entry_id";

ALTER TABLE ONLY "public"."unit_special_rule_assignments"
    ADD CONSTRAINT "unit_special_rule_assignments_unit_id_special_rule_id_key" UNIQUE ("unit_id", "special_rule_id");

ALTER TABLE ONLY "public"."army_list_entries"
    DROP CONSTRAINT IF EXISTS "army_list_entries_unit_id_id_key";
