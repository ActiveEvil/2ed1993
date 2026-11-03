CREATE TABLE IF NOT EXISTS "public"."unit_profile_vehicle_cards" (
    "unit_profile_id" integer NOT NULL,
    "vehicle_card_id" integer NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);

ALTER TABLE "public"."unit_profile_vehicle_cards" OWNER TO "postgres";

COMMENT ON TABLE "public"."unit_profile_vehicle_cards" IS 'A vehicle card one profile carries as printed, in printed order. Its points are included in the unit''s price.';

ALTER TABLE ONLY "public"."unit_profile_vehicle_cards"
    ADD CONSTRAINT "unit_profile_vehicle_cards_pkey" PRIMARY KEY ("unit_profile_id", "vehicle_card_id");

ALTER TABLE ONLY "public"."unit_profile_vehicle_cards"
    ADD CONSTRAINT "unit_profile_vehicle_cards_unit_profile_id_fkey" FOREIGN KEY ("unit_profile_id") REFERENCES "public"."unit_profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."unit_profile_vehicle_cards"
    ADD CONSTRAINT "unit_profile_vehicle_cards_vehicle_card_id_fkey" FOREIGN KEY ("vehicle_card_id") REFERENCES "public"."vehicle_cards"("id");

CREATE POLICY "Public unit_profile_vehicle_cards are viewable by everyone." ON "public"."unit_profile_vehicle_cards" FOR SELECT USING (true);

ALTER TABLE "public"."unit_profile_vehicle_cards" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."unit_profile_vehicle_cards" TO "anon";
GRANT ALL ON TABLE "public"."unit_profile_vehicle_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."unit_profile_vehicle_cards" TO "service_role";
