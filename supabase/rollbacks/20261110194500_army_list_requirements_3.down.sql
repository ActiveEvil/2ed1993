SELECT ('GUARD FAILED: leads in use ' || count(*))::integer FROM "public"."army_list_requirements" WHERE "mode" = 'leads' HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_list_requirements" DROP CONSTRAINT IF EXISTS "army_list_requirements_attachment_ck";

ALTER TABLE ONLY "public"."army_list_requirements"
    ADD CONSTRAINT "army_list_requirements_attachment_ck" CHECK ((("kind" <> 'attachment'::"text") OR (("entry_id" IS NOT NULL) AND (("target_entry_id" IS NOT NULL) OR ("target_set_id" IS NOT NULL)) AND ("mode" = ANY (ARRAY['must'::"text", 'may'::"text"])))));
