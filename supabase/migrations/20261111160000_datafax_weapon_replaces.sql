ALTER TABLE "public"."datafax_weapons" ADD COLUMN IF NOT EXISTS "replaces_datafax_weapon_id" integer;

ALTER TABLE "public"."datafax_weapons" ADD COLUMN IF NOT EXISTS "grant_mode" "text";

ALTER TABLE "public"."datafax_weapons" ADD COLUMN IF NOT EXISTS "add_points" numeric(5,1);

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_grant_mode_ck" CHECK ((("grant_mode" IS NULL) OR ("grant_mode" = ANY (ARRAY['replace'::"text", 'add_or_replace'::"text"]))));

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_add_points_ck" CHECK ((("add_points" IS NULL) OR ("add_points" >= (0)::numeric)));

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_replaces_mode_ck" CHECK ((("replaces_datafax_weapon_id" IS NULL) = ("grant_mode" IS NULL)));

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_add_points_mode_ck" CHECK ((("add_points" IS NULL) OR (("grant_mode" IS NOT NULL) AND ("grant_mode" = 'add_or_replace'::"text"))));

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_replaces_self_ck" CHECK ((("replaces_datafax_weapon_id" IS NULL) OR ("replaces_datafax_weapon_id" <> "id")));

COMMENT ON COLUMN "public"."datafax_weapons"."replaces_datafax_weapon_id" IS 'The row on the same datafax that this weapon takes the place of, together with whatever is built into that row. Null where the weapon replaces nothing.';

COMMENT ON COLUMN "public"."datafax_weapons"."grant_mode" IS 'How the weapon relates to the row it replaces: replace, or add_or_replace where it may be carried as well instead. Null where replaces_datafax_weapon_id is null.';

COMMENT ON COLUMN "public"."datafax_weapons"."add_points" IS 'Paid on top of points where the weapon is added and not swapped. Null where adding costs nothing more or the weapon cannot be added.';

ALTER TABLE ONLY "public"."datafax_weapons"
    ADD CONSTRAINT "datafax_weapons_replaces_datafax_weapon_id_fkey" FOREIGN KEY ("replaces_datafax_weapon_id") REFERENCES "public"."datafax_weapons"("id") ON DELETE RESTRICT;

CREATE INDEX "datafax_weapons_replaces_datafax_weapon_id_idx" ON "public"."datafax_weapons" USING "btree" ("replaces_datafax_weapon_id");
