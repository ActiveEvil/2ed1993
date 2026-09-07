import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Special Warp Cards"),
    description:
      "The Special Warp cards of Warhammer 40,000 2nd Edition, played to nullify, reflect or destroy an enemy psychic power, or to force a psychic duel.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: special_warp_cards, error: specialWarpCardsError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "special-warp-cards")
      .single(),
    supabase
      .from("special_warp_cards")
      .select("id, name, description")
      .order("id"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/card-decks/special-warp-cards",
    heroImageError,
    specialWarpCardsError,
  );

  if (hero && special_warp_cards) {
    return (
      <>
        <Highlighter />
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/card-decks",
              anchor: "Card Decks",
            },
            {
              anchor: "Special Warp Cards",
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Special Warp Cards"
            eyebrow={`Card Decks \u00b7 ${special_warp_cards.length} cards`}
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          />
          <section className="grid md:grid-cols-2 gap-4 p-4 md:p-8">
            {special_warp_cards.map((card) => {
              const cardId = generateAnchorId(card.name);

              return (
                <article
                  key={cardId}
                  id={cardId}
                  className="flex flex-col items-center gap-2 p-4 border-4 border-frame bg-2ed-mid-blue target:border-2ed-light-yellow shadow-xl"
                >
                  <div className="flex flex-col gap-4 p-4 w-full h-full bg-card-face text-2ed-black">
                    <h3 className="font-title uppercase text-2xl text-2ed-dark-blue text-center">
                      {card.name}
                    </h3>
                    <p
                      className="text-lg"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                  </div>
                </article>
              );
            })}
          </section>
        </Panel>
      </>
    );
  }

  throw new Error("/card-decks/special-warp-cards: rendered with no data");
}
