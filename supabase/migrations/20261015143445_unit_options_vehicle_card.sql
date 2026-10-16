ALTER TABLE "public"."unit_options" ADD COLUMN IF NOT EXISTS "vehicle_card_id" integer;

ALTER TABLE ONLY "public"."unit_options" DROP CONSTRAINT IF EXISTS "unit_options_grant_ck";

ALTER TABLE ONLY "public"."unit_options"
    ADD CONSTRAINT "unit_options_grant_ck" CHECK ((((((((("weapon_id" IS NOT NULL))::integer + (("armour_id" IS NOT NULL))::integer) + (("granted_unit_id" IS NOT NULL))::integer) + (("to_unit_profile_id" IS NOT NULL))::integer) + (("wargear_card_id" IS NOT NULL))::integer) + (("vehicle_card_id" IS NOT NULL))::integer) <= 1));

ALTER TABLE ONLY "public"."unit_options"
    ADD CONSTRAINT "unit_options_vehicle_card_id_fkey" FOREIGN KEY ("vehicle_card_id") REFERENCES "public"."vehicle_cards"("id");
