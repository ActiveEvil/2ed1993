ALTER TABLE "public"."units" ADD COLUMN IF NOT EXISTS "source" "text";

COMMENT ON COLUMN "public"."units"."source" IS 'The citation as the magazine head reads it, for a unit that exists only because of a magazine article: publication, issue, page and author status where it applies, for example ''Citadel Journal 12, p29''. Null where the unit is codex material, and null on every unit of a list whose own source is set.';

ALTER TABLE "public"."army_lists" ADD COLUMN IF NOT EXISTS "source" "text";

COMMENT ON COLUMN "public"."army_lists"."source" IS 'The citation as the magazine head reads it, for a whole list that is magazine material: publication, issue, page and author status where it applies, for example ''White Dwarf 217, p45''. Null where the list is a codex list.';
