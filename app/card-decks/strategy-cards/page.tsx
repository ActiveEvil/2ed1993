import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StrategyCardRandomiser } from "@/components/CardRandomisers";
import { Highlighter } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { deckCardAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Strategy Cards"),
    description:
      "The Strategy cards of Warhammer 40,000 2nd Edition, with the text and effect of each card, including Flank March, Booby Traps and Virus Outbreak.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: strategy_cards, error: strategyCardsError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "strategy-cards")
      .single(),
    supabase
      .from("strategy_cards")
      .select("id, origin, name, description")
      .order("name"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/card-decks/strategy-cards",
    heroImageError,
    strategyCardsError,
  );

  if (hero && strategy_cards) {
    const cards = strategy_cards.map((card) => ({
      ...card,
      anchor: deckCardAnchorId(card.name, card.origin),
    }));
    const origins = [...new Set(cards.map(({ origin }) => origin))];

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
              anchor: "Strategy Cards",
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Strategy Cards"
            eyebrow={`Card Decks · ${cards.length} cards · ${origins.length} sources`}
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          />
          <div className="flex flex-col gap-12 p-4 md:p-8">
            <section className="flex flex-col border-4 border-frame">
              <StrategyCardRandomiser
                baseHref="/card-decks/strategy-cards"
                cards={origins.map((origin) => ({
                  origin,
                  ids: cards
                    .filter((card) => card.origin === origin)
                    .map(({ name, anchor }) => ({ name, id: anchor })),
                }))}
              />
            </section>
            <section className="grid md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <article
                  key={card.anchor}
                  id={card.anchor}
                  className="flex flex-col items-center gap-2 p-4 border-4 border-frame bg-2ed-dark-red target:border-2ed-light-yellow shadow-xl"
                >
                  <div className="flex flex-col gap-4 p-4 w-full h-full bg-card-face text-2ed-black">
                    <h2 className="font-subtitle uppercase text-2xl text-2ed-dark-blue text-center">
                      {card.name}
                    </h2>
                    <div
                      className="dynamic-content flex flex-col gap-2"
                      dangerouslySetInnerHTML={{
                        __html: card.description,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-4 w-full">
                    <p className="font-block text-sm text-2ed-white">
                      {card.origin}
                    </p>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/card-decks/strategy-cards: rendered with no data");
}
