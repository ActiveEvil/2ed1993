COMMENT ON COLUMN "public"."army_list_requirements"."target_datafax_weapon_id" IS 'On a transport row of mode squads: the weapon on the ride''s datafax that at most one in count of the squad''s rides may take. Null where the list prints no such limit.';

COMMENT ON COLUMN "public"."army_list_entries"."requires_rider" IS 'True where the entry is a ride whose price leaves its rider out, so that it is taken only for a rider: a bike, a jetbike, a Nobz Bike or a boar (LB-78, LB-82). Only on an entry with a transport_scope. False on a ride that stands alone, and on every other entry.';

COMMENT ON COLUMN "public"."army_list_entries"."transport_scope" IS 'Whom this entry may be bought as transport for, where its list prints such a permission: characters, squads, or characters_and_squads. Null on every entry that is not transport. Where a list reaches only some squads (Eldar Guardians, Genestealer Brood Brothers) the scope stays characters_and_squads and the entry note carries the qualification.';

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_transport_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_transport_ck" CHECK ((("kind" <> 'transport'::"text") OR (("entry_id" IS NOT NULL) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['squads'::"text", 'characters'::"text"])))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_mount_count_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_transport_count_ck" CHECK ((("kind" <> ALL (ARRAY['transport'::"text", 'mount'::"text"])) OR ((("count" IS NULL) = ("target_datafax_weapon_id" IS NULL)) AND (("count" IS NULL) OR ("count" >= 2)))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_target_datafax_weapon_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_datafax_weapon_ck" CHECK ((("target_datafax_weapon_id" IS NULL) OR (("kind" = ANY (ARRAY['transport'::"text", 'mount'::"text"])) AND ("mode" = 'squads'::"text"))));

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT "army_list_entries_requires_rider_ck";

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_requires_rider_ck" CHECK ((NOT "requires_rider") OR ("transport_scope" IS NOT NULL) OR ("mount_scope" IS NOT NULL));

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT "army_list_entries_one_scope_ck";
