SELECT ('GUARD FAILED: weapon replaces in use ' || count(*))::integer FROM "public"."datafax_weapons" WHERE "replaces_datafax_weapon_id" IS NOT NULL OR "grant_mode" IS NOT NULL OR "add_points" IS NOT NULL HAVING count(*) <> 0;

DROP INDEX IF EXISTS "public"."datafax_weapons_replaces_datafax_weapon_id_idx";

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_replaces_datafax_weapon_id_fkey";

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_replaces_self_ck";

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_add_points_mode_ck";

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_replaces_mode_ck";

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_add_points_ck";

ALTER TABLE ONLY "public"."datafax_weapons" DROP CONSTRAINT IF EXISTS "datafax_weapons_grant_mode_ck";

ALTER TABLE "public"."datafax_weapons" DROP COLUMN IF EXISTS "add_points";

ALTER TABLE "public"."datafax_weapons" DROP COLUMN IF EXISTS "grant_mode";

ALTER TABLE "public"."datafax_weapons" DROP COLUMN IF EXISTS "replaces_datafax_weapon_id";
