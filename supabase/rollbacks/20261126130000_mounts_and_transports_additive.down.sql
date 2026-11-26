ALTER TABLE ONLY "public"."saved_list_units" DROP CONSTRAINT "saved_list_units_mount_or_transport_ck";

ALTER TABLE ONLY "public"."saved_list_units" DROP CONSTRAINT "saved_list_units_transport_for_fkey";

ALTER TABLE ONLY "public"."saved_list_units" DROP CONSTRAINT "saved_list_units_mount_for_fkey";

ALTER TABLE "public"."saved_list_units" DROP COLUMN "transport_for";

ALTER TABLE "public"."saved_list_units" DROP COLUMN "mount_for";

ALTER TABLE "public"."saved_list_units" ADD COLUMN "ride_for" "uuid";

ALTER TABLE ONLY "public"."saved_list_units"
    ADD CONSTRAINT "saved_list_units_ride_for_fkey" FOREIGN KEY ("ride_for", "list_id") REFERENCES "public"."saved_list_units"("id", "list_id") ON DELETE SET NULL ("ride_for");

COMMENT ON COLUMN "public"."saved_list_units"."ride_for" IS 'The unit of the same list this unit is bought as transport for. Null otherwise, and set to null when that unit is deleted.';

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_band_reassignment_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_band_reassignment_ck" CHECK ((("kind" <> 'band_reassignment'::"text") OR ((("entry_id" IS NOT NULL) OR ("unit_category_id" IS NOT NULL)) AND ("target_category_id" IS NOT NULL) AND ("mode" = ANY (ARRAY['rider'::"text", 'always'::"text"])))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_transport_count_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_transport_count_ck" CHECK ((("kind" <> 'transport'::"text") OR ((("count" IS NULL) = ("target_datafax_weapon_id" IS NULL)) AND (("count" IS NULL) OR ("count" >= 2)))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_target_datafax_weapon_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_datafax_weapon_ck" CHECK ((("target_datafax_weapon_id" IS NULL) OR (("kind" = 'transport'::"text") AND ("mode" = 'squads'::"text"))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_mount_ck";

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_kind_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_kind_ck" CHECK (("kind" = ANY (ARRAY['requires_unit'::"text", 'commander'::"text", 'transport'::"text", 'band_reassignment'::"text", 'pairing'::"text", 'attachment'::"text", 'army_cap'::"text", 'army_variant'::"text", 'ally_scope'::"text", 'substitution'::"text", 'unit_composition'::"text"])));

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT "army_list_entries_requires_rider_ck";

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_requires_rider_ck" CHECK ((NOT "requires_rider") OR ("transport_scope" IS NOT NULL));

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT "army_list_entries_mount_scope_check";

ALTER TABLE "public"."army_list_entries" DROP COLUMN "mount_scope";
