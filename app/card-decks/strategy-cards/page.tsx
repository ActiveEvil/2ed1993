import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StrategyCardRandomiser } from "@/components/CardRandomisers";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: `Warhammer 40,000 2nd Edition Strategy Cards | 2ed1993`,
    description: `Warhammer 40,000 2nd Edition  Strategy Cards.`,
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "strategy-cards")
    .single();
  const hero = heroImage?.images ?? null;
  const { data: strategy_cards, error: strategyCardsError } = await supabase
    .from("strategy_cards")
    .select("id, origin, name, description")
    .order("id");

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
        <main className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                Strategy Cards
              </h1>
            </header>
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
            <section className="border-4 border-black">
              <SectionBar
                title="The deck"
                note={`${strategy_cards.length} cards \u00b7 ${cards.length} sources`}
              />
              <div className="flex flex-col gap-2 p-3">
                {cards.map((section) => (
                  <div
                    key={generateAnchorId(section.origin)}
                    className="flex flex-col md:flex-row md:items-baseline gap-2"
                  >
                    <span className="shrink-0 md:w-44 font-subtitle text-xs uppercase tracking-[0.14em]">
                      {section.origin}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((card) => (
                        <a
                          key={generateAnchorId(card.name)}
                          href={`#${generateAnchorId(card.name)}`}
                          className={CHIP_CLASS}
                        >
                          {card.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="border-4 border-black">
              <StrategyCardRandomiser
                baseHref="/card-decks/strategy-cards"
                cards={cards.map(({ origin, items }) => ({
                  origin,
                  ids: items.map(({ name }) => generateAnchorId(name)),
                }))}
              />
            </section>
          </Panel>
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            {cards.map((section) => {
              const originId = generateAnchorId(section.origin);
              return (
                <section
                  id={originId}
                  key={originId}
                  className="flex flex-col gap-4"
                >
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black shadow-lg" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      {section.origin}
                    </h2>
                  </div>
                  <section className="grid md:grid-cols-2 gap-4">
                    {section.items.map((card) => {
                      const cardId = generateAnchorId(card.name);

                      return (
                        <div
                          key={cardId}
                          id={cardId}
                          className="flex flex-col justify-start items-center gap-2 p-4 border-4 border-black bg-2ed-dark-red target:border-2ed-light-yellow shadow-xl"
                        >
                          <div className="flex flex-col justify-start items-center gap-4 p-4 h-full bg-2ed-white text-2ed-black">
                            <h3 className="font-subtitle uppercase text-2xl text-2ed-dark-blue text-center">
                              {card.name}
                            </h3>
                            <div
                              className="dynamic-content flex flex-col justify-center gap-2"
                              dangerouslySetInnerHTML={{
                                __html: card.description,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </section>
                </section>
              );
            })}
          </Panel>
        </main>
      </>
    );
  }

  throw new Error("/card-decks/strategy-cards: rendered with no data");
}
