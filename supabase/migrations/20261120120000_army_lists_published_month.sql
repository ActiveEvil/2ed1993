ALTER TABLE "public"."army_lists" ADD COLUMN IF NOT EXISTS "published_month" smallint;

ALTER TABLE ONLY "public"."army_lists"
    ADD CONSTRAINT "army_lists_published_month_ck" CHECK ((("published_month" IS NULL) OR ((("published_month" >= 1) AND ("published_month" <= 12)) AND ("published_year" IS NOT NULL))));

COMMENT ON COLUMN "public"."army_lists"."published_month" IS 'Month of publication, 1 to 12, beside published_year. For a book, the month it went on sale; for a magazine list, the month its issue was first announced as available. Null where the month is not known. The sources are in claude/claude_codex-publication-dates-2026-11-20.md.';
