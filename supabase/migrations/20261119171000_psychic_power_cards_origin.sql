ALTER TABLE "public"."psychic_power_cards" ADD COLUMN IF NOT EXISTS "origin" "text";

COMMENT ON COLUMN "public"."psychic_power_cards"."origin" IS 'Publication the card was first printed in, as the card face prints it (CR-4, CR-8): ''Dark Millennium'' for the sixty cards of its ten decks, ''Citadel Journal 17'' for the Harlequin deck. The 1993 box set printed its six psychic powers as rulebook prose, not cards, so no card has the box set as its origin; the Datafax Collection is never an origin.';
