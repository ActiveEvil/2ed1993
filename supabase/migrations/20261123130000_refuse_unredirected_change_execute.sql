REVOKE EXECUTE ON FUNCTION "public"."refuse_unredirected_change"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."refuse_unredirected_change"() FROM "anon";

REVOKE EXECUTE ON FUNCTION "public"."refuse_unredirected_change"() FROM "authenticated";
