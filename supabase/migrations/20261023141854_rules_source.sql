ALTER TABLE "public"."rules" ADD COLUMN IF NOT EXISTS "source" "text";

COMMENT ON COLUMN "public"."rules"."source" IS 'The citation as the magazine head reads it: publication, issue, page and author status where it applies, for example ''Citadel Journal 16, p13, reader submission''. Null where the rule is not magazine material.';
