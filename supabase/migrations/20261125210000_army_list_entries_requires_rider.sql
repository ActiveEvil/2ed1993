ALTER TABLE "public"."army_list_entries" ADD COLUMN IF NOT EXISTS "requires_rider" boolean DEFAULT false NOT NULL;

ALTER TABLE ONLY "public"."army_list_entries"
    ADD CONSTRAINT "army_list_entries_requires_rider_ck" CHECK ((NOT "requires_rider") OR ("transport_scope" IS NOT NULL));

COMMENT ON COLUMN "public"."army_list_entries"."requires_rider" IS 'True where the entry is a ride whose price leaves its rider out, so that it is taken only for a rider: a bike, a jetbike, a Nobz Bike or a boar (LB-78, LB-82). Only on an entry with a transport_scope. False on a ride that stands alone, and on every other entry.';
