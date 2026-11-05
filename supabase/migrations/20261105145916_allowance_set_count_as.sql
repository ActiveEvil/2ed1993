ALTER TABLE "public"."army_list_allowance_set_entries" ADD COLUMN IF NOT EXISTS "count_as" integer DEFAULT 1 NOT NULL;

ALTER TABLE ONLY "public"."army_list_allowance_set_entries"
    ADD CONSTRAINT "army_list_allowance_set_entries_count_as_ck" CHECK (("count_as" >= 1));

COMMENT ON COLUMN "public"."army_list_allowance_set_entries"."count_as" IS 'How many of the set''s counted thing one of this entry stands for against a rule on the set. 1 for an ordinary member; the Exodite Lords on Carnosaur entry stands for two Exodite Lords.';
