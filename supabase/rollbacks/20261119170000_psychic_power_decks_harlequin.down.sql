SELECT ('GUARD FAILED: Harlequin cards present ' || count(*))::integer FROM "public"."psychic_power_cards" WHERE "deck" = 'Harlequin' HAVING count(*) <> 0;

COMMENT ON TYPE "public"."psychic_power_decks" IS NULL;
