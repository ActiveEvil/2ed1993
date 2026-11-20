SELECT ('GUARD FAILED: published_month in use ' || count(*))::integer FROM "public"."army_lists" WHERE "published_month" IS NOT NULL HAVING count(*) <> 0;

ALTER TABLE ONLY "public"."army_lists" DROP CONSTRAINT IF EXISTS "army_lists_published_month_ck";

ALTER TABLE "public"."army_lists" DROP COLUMN IF EXISTS "published_month";
