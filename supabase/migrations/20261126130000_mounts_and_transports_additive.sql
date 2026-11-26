ALTER TABLE "public"."army_list_entries" ADD COLUMN IF NOT EXISTS "mount_scope" "text";

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_mount_scope_check" CHECK (("mount_scope" = ANY (ARRAY['characters'::"text", 'squads'::"text", 'characters_and_squads'::"text"])));

COMMENT ON COLUMN "public"."army_list_entries"."mount_scope" IS 'Whom this entry may be bought as a mount for, where its list prints such a permission: characters, squads, or characters_and_squads. Null on every entry that is not a mount. A mount is ridden by a model that fights from it, and its cost joins the rider''s (LB-89). Where a list reaches only some squads (Eldar Guardians, Genestealer Brood Brothers) the scope stays characters_and_squads and the entry note carries the qualification.';

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT "army_list_entries_requires_rider_ck";

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_requires_rider_ck" CHECK ((NOT "requires_rider") OR ("transport_scope" IS NOT NULL) OR ("mount_scope" IS NOT NULL));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_kind_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_kind_ck" CHECK (("kind" = ANY (ARRAY['requires_unit'::"text", 'commander'::"text", 'transport'::"text", 'mount'::"text", 'band_reassignment'::"text", 'pairing'::"text", 'attachment'::"text", 'army_cap'::"text", 'army_variant'::"text", 'ally_scope'::"text", 'substitution'::"text", 'unit_composition'::"text"])));

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_mount_ck" CHECK ((("kind" <> 'mount'::"text") OR (("entry_id" IS NOT NULL) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['squads'::"text", 'characters'::"text"])))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_target_datafax_weapon_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_datafax_weapon_ck" CHECK ((("target_datafax_weapon_id" IS NULL) OR (("kind" = ANY (ARRAY['transport'::"text", 'mount'::"text"])) AND ("mode" = 'squads'::"text"))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_transport_count_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_transport_count_ck" CHECK ((("kind" <> ALL (ARRAY['transport'::"text", 'mount'::"text"])) OR ((("count" IS NULL) = ("target_datafax_weapon_id" IS NULL)) AND (("count" IS NULL) OR ("count" >= 2)))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_band_reassignment_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_band_reassignment_ck" CHECK ((("kind" <> 'band_reassignment'::"text") OR ((("entry_id" IS NOT NULL) OR ("unit_category_id" IS NOT NULL)) AND ("target_category_id" IS NOT NULL) AND ("mode" = ANY (ARRAY['rider'::"text", 'carried'::"text", 'always'::"text"])))));

ALTER TABLE ONLY "public"."saved_list_units" DROP CONSTRAINT "saved_list_units_ride_for_fkey";

ALTER TABLE "public"."saved_list_units" DROP COLUMN "ride_for";

ALTER TABLE "public"."saved_list_units" ADD COLUMN IF NOT EXISTS "mount_for" "uuid";

ALTER TABLE "public"."saved_list_units" ADD COLUMN IF NOT EXISTS "transport_for" "uuid";

ALTER TABLE ONLY "public"."saved_list_units"
    ADD CONSTRAINT "saved_list_units_mount_for_fkey" FOREIGN KEY ("mount_for", "list_id") REFERENCES "public"."saved_list_units"("id", "list_id") ON DELETE SET NULL ("mount_for");

ALTER TABLE ONLY "public"."saved_list_units"
    ADD CONSTRAINT "saved_list_units_transport_for_fkey" FOREIGN KEY ("transport_for", "list_id") REFERENCES "public"."saved_list_units"("id", "list_id") ON DELETE SET NULL ("transport_for");

ALTER TABLE ONLY "public"."saved_list_units"
    ADD CONSTRAINT "saved_list_units_mount_or_transport_ck" CHECK ((("mount_for" IS NULL) OR ("transport_for" IS NULL)));

COMMENT ON COLUMN "public"."saved_list_units"."mount_for" IS 'The unit of the same list this unit is bought as a mount for: its rider. Null otherwise, and set to null when that unit is deleted. A unit holds mount_for or transport_for, never both.';

COMMENT ON COLUMN "public"."saved_list_units"."transport_for" IS 'The unit of the same list this vehicle starts the game carrying (LB-91). Null otherwise, and set to null when that unit is deleted. A unit holds mount_for or transport_for, never both.';
