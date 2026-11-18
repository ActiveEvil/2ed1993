ALTER TABLE "public"."unit_special_rule_assignments" ADD COLUMN IF NOT EXISTS "army_list_entry_id" integer;

COMMENT ON COLUMN "public"."unit_special_rule_assignments"."army_list_entry_id" IS 'The army list entry that carries the rule, where a unit shared between lists has it in one list only: the Dreadnought''s Acute Senses in Codex: Space Wolves. Null gives it to every entry for the unit. The entry must be for the same unit.';

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_unit_id_id_key" UNIQUE ("unit_id", "id");

ALTER TABLE ONLY "public"."unit_special_rule_assignments"
    ADD CONSTRAINT "unit_special_rule_assignments_army_list_entry_id_fkey" FOREIGN KEY ("unit_id", "army_list_entry_id") REFERENCES "public"."army_list_entries"("unit_id", "id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."unit_special_rule_assignments"
    DROP CONSTRAINT "unit_special_rule_assignments_unit_id_special_rule_id_key",
    ADD CONSTRAINT "unit_special_rule_assignments_unit_rule_entry_key" UNIQUE NULLS NOT DISTINCT ("unit_id", "special_rule_id", "army_list_entry_id");

CREATE INDEX "unit_special_rule_assignments_army_list_entry_id_idx" ON "public"."unit_special_rule_assignments" USING "btree" ("army_list_entry_id");
