DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "public"."army_list_entries" WHERE "requires_rider") THEN
    RAISE EXCEPTION 'army_list_entries.requires_rider is true on some rows; run requires-rider-rollback.sql first';
  END IF;
END $$;

ALTER TABLE ONLY "public"."army_list_entries" DROP CONSTRAINT IF EXISTS "army_list_entries_requires_rider_ck";

ALTER TABLE "public"."army_list_entries" DROP COLUMN IF EXISTS "requires_rider";
