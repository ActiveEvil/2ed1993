SELECT ('GUARD FAILED: weapons.source in use ' || count(*))::integer FROM "public"."weapons" WHERE "source" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE "public"."weapons" DROP COLUMN IF EXISTS "source";
