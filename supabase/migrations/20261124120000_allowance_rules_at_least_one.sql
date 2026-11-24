ALTER TABLE "public"."army_list_allowance_rules" ADD COLUMN IF NOT EXISTS "at_least_one" boolean DEFAULT false NOT NULL;

ALTER TABLE ONLY "public"."army_list_allowance_rules"
    ADD CONSTRAINT "army_list_allowance_rules_at_least_one_ck" CHECK ((NOT "at_least_one") OR (("per_count" > 1) AND (("per_entry_id" IS NOT NULL) OR ("per_set_id" IS NOT NULL))));

COMMENT ON COLUMN "public"."army_list_allowance_rules"."at_least_one" IS 'True where the rule allows at least one wherever a unit it counts is present, though per_count would round it down to none: the Harlequin Acolyte, one per two Harlequin Squads and one where the army fields a single squad (LB-59). Only on a rule counted per entry or per set with per_count above one. False on every other rule.';
