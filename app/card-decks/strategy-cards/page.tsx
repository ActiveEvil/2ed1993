import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StrategyCardRandomiser } from "@/components/CardRandomisers";
import { SectionHeading } from "@/components/Heading";
import { Highlighter } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
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
      .order("id"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/card-decks/strategy-cards",
    heroImageError,
    strategyCardsError,
  );

  if (hero && strategy_cards) {
    const origins = new Map<string, typeof strategy_cards>();

    for (const item of strategy_cards) {
      const bucket = origins.get(item.origin) ?? [];
      bucket.push(item);
      origins.set(item.origin, bucket);
    }

    const cards = Array.from(origins.entries()).map(([origin, items]) => ({
      origin,
      items,
    }));

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
            eyebrow={`Card Decks \u00b7 ${strategy_cards.length} cards \u00b7 ${cards.length} sources`}
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          />
          <div className="flex flex-col lg:flex-row">
            <JumpBar
              rail
              items={cards.map(({ origin }) => ({
                id: generateAnchorId(origin),
                label: origin,
              }))}
            />
            <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
              <section className="flex flex-col border-4 border-frame">
                <StrategyCardRandomiser
                  baseHref="/card-decks/strategy-cards"
                  cards={cards.map(({ origin, items }) => ({
                    origin,
                    ids: items.map(({ name }) => generateAnchorId(name)),
                  }))}
                />
              </section>
              {cards.map((section) => {
                const originId = generateAnchorId(section.origin);
                return (
                  <section
                    id={originId}
                    key={originId}
                    className="flex flex-col gap-4"
                  >
                    <SectionHeading>{section.origin}</SectionHeading>
                    <div className="grid md:grid-cols-2 gap-4">
                      {section.items.map((card) => {
                        const cardId = generateAnchorId(card.name);

                        return (
                          <article
                            key={cardId}
                            id={cardId}
                            className="flex flex-col items-center gap-2 p-4 border-4 border-frame bg-2ed-dark-red target:border-2ed-light-yellow shadow-xl"
                          >
                            <div className="flex flex-col gap-4 p-4 w-full h-full bg-card-face text-2ed-black">
                              <h3 className="font-subtitle uppercase text-2xl text-2ed-dark-blue text-center">
                                {card.name}
                              </h3>
                              <div
                                className="dynamic-content flex flex-col gap-2"
                                dangerouslySetInnerHTML={{
                                  __html: card.description,
                                }}
                              />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/card-decks/strategy-cards: rendered with no data");
}
