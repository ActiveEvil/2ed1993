ALTER TABLE "public"."army_list_requirements" ADD COLUMN IF NOT EXISTS "target_datafax_weapon_id" integer;

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_datafax_weapon_ck" CHECK ((("target_datafax_weapon_id" IS NULL) OR (("kind" = 'transport'::"text") AND ("mode" = 'squads'::"text"))));

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_transport_count_ck" CHECK ((("kind" <> 'transport'::"text") OR ((("count" IS NULL) = ("target_datafax_weapon_id" IS NULL)) AND (("count" IS NULL) OR ("count" >= 2)))));

COMMENT ON COLUMN "public"."army_list_requirements"."target_datafax_weapon_id" IS 'On a transport row of mode squads: the weapon on the ride''s datafax that at most one in count of the squad''s rides may take. Null where the list prints no such limit.';

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_datafax_weapon_id_fkey" FOREIGN KEY ("target_datafax_weapon_id") REFERENCES "public"."datafax_weapons"("id") ON DELETE RESTRICT;

CREATE INDEX "army_list_requirements_target_datafax_weapon_id_idx" ON "public"."army_list_requirements" USING "btree" ("target_datafax_weapon_id");
