ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_one_scope_ck" CHECK ((("transport_scope" IS NULL) OR ("mount_scope" IS NULL)));

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT "army_list_entries_requires_rider_ck";

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_requires_rider_ck" CHECK ((NOT "requires_rider") OR ("mount_scope" IS NOT NULL));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_target_datafax_weapon_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_target_datafax_weapon_ck" CHECK ((("target_datafax_weapon_id" IS NULL) OR (("kind" = 'mount'::"text") AND ("mode" = 'squads'::"text"))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_transport_count_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_mount_count_ck" CHECK ((("kind" <> 'mount'::"text") OR ((("count" IS NULL) = ("target_datafax_weapon_id" IS NULL)) AND (("count" IS NULL) OR ("count" >= 2)))));

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT "army_list_requirements_transport_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_transport_ck" CHECK ((("kind" <> 'transport'::"text") OR (("entry_id" IS NOT NULL) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['squads'::"text", 'characters'::"text"])) AND ("count" IS NULL))));

COMMENT ON COLUMN "public"."army_list_entries"."transport_scope" IS 'Whom this vehicle may start the game carrying: characters, squads, or characters_and_squads. Null on every entry that is not a transport. A transport carries a unit that stays separate from it, and has its own crew and its own place in the list (LB-89). A transport is known by this column, not by its datafax''s capacity (LB-95). An entry holds transport_scope or mount_scope, never both.';

COMMENT ON COLUMN "public"."army_list_entries"."requires_rider" IS 'True where the entry is a mount whose price leaves its rider out, so that it is taken only for a rider: a bike, a jetbike, a Nobz Bike or a boar (LB-78, LB-82). Only on an entry with a mount_scope. False on a mount that stands alone, and on every other entry.';

COMMENT ON COLUMN "public"."army_list_requirements"."target_datafax_weapon_id" IS 'On a mount row of mode squads: the weapon on the mount''s datafax that at most one in count of the squad''s mounts may take (LB-83). Null where the list prints no such limit, and on every row of another kind.';
