SELECT ('GUARD FAILED: target_datafax_weapon_id in use ' || count(*))::integer FROM "public"."army_list_requirements" WHERE "target_datafax_weapon_id" IS NOT NULL HAVING count(*) <> 0;

DROP INDEX IF EXISTS "public"."army_list_requirements_target_datafax_weapon_id_idx";

ALTER TABLE ONLY "public"."army_list_requirements"
    DROP CONSTRAINT IF EXISTS "army_list_requirements_target_datafax_weapon_id_fkey",
    DROP CONSTRAINT IF EXISTS "army_list_requirements_transport_count_ck",
    DROP CONSTRAINT IF EXISTS "army_list_requirements_target_datafax_weapon_ck";

ALTER TABLE "public"."army_list_requirements" DROP COLUMN IF EXISTS "target_datafax_weapon_id";
