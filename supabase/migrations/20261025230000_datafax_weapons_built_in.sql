ALTER TABLE "public"."datafax_weapons" ADD COLUMN IF NOT EXISTS "built_in_of" integer;

COMMENT ON COLUMN "public"."datafax_weapons"."built_in_of" IS 'The row this weapon is built into, as a storm bolter in a power fist. Rendered after the parent''s name, never as a weapon of its own. Rows built into one parent that share a non-zero alternative are choices.';

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_built_in_of_fkey" FOREIGN KEY ("built_in_of") REFERENCES "public"."datafax_weapons"("id") ON DELETE CASCADE;

CREATE INDEX "datafax_weapons_built_in_of_idx" ON "public"."datafax_weapons" USING "btree" ("built_in_of");
