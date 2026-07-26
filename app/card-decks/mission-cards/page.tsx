import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MissionCardRandomiser } from "@/components/CardRandomisers";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: `Warhammer 40,000 2nd Edition Mission Cards | 2ed1993`,
    description: `Warhammer 40,000 2nd Edition  Mission Cards.`,
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "mission-cards")
    .single();
  const hero = heroImage?.images ?? null;
  const { data: mission_cards, error: missionCardsError } = await supabase
    .from("mission_cards")
    .select(
      "id, origin, name, description, primary_objective, secondary_objective, special_rules",
    )
    .order("id");

  assertNoQueryErrors(
    "/card-decks/mission-cards",
    heroImageError,
    missionCardsError,
  );

  if (hero && mission_cards) {
    const origins = new Map<string, typeof mission_cards>();

    for (const item of mission_cards) {
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
              anchor: "Mission Cards",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Mission Cards
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <MissionCardRandomiser
            baseHref="/card-decks/mission-cards"
            cards={cards.map(({ origin, items }) => ({
              origin,
              ids: items.map(({ name }) => name.split(" ").join("_")),
            }))}
          />
          {cards.map((section) => {
            const originId = section.origin.split(" ").join("_");
            return (
              <section
                id={originId}
                key={originId}
                className="flex flex-col gap-4"
              >
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    {section.origin}
                  </h2>
                </div>
                <section className="grid md:grid-cols-2 gap-4">
                  {section.items.map((card) => {
                    const cardId = card.name.split(" ").join("_");

                    return (
                      <div
                        key={cardId}
                        id={cardId}
                        className="flex flex-col justify-start items-center gap-2 p-4 border-4 border-black bg-2ed-dark-blue target:border-2ed-dark-yellow shadow-lg"
                      >
                        <h3 className="font-subtitle uppercase text-2xl text-2ed-light-yellow  text-center">
                          {card.name}
                        </h3>
                        <div className="flex flex-col justify-start items-center gap-4 p-4 h-full bg-2ed-white text-2ed-black">
                          <p className="text-lg">{card.description}</p>
                          <div className="flex flex-col justify-center items-center gap-2">
                            <h4 className="font-subtitle text-xl text-2ed-dark-red">
                              Primary Objective
                            </h4>
                            <div
                              className="dynamic-content flex flex-col justify-center gap-2"
                              dangerouslySetInnerHTML={{
                                __html: card.primary_objective,
                              }}
                            />
                          </div>
                          {card.secondary_objective && (
                            <div className="flex flex-col justify-center items-center gap-2">
                              <h4 className="font-subtitle text-xl text-2ed-dark-red">
                                Secondary Objective
                              </h4>
                              <div
                                className="dynamic-content flex flex-col justify-center gap-2"
                                dangerouslySetInnerHTML={{
                                  __html: card.secondary_objective,
                                }}
                              />
                            </div>
                          )}
                          {card.special_rules && (
                            <div className="flex flex-col justify-center items-center gap-2">
                              <h4 className="font-subtitle text-xl text-2ed-dark-red">
                                Special Rules
                              </h4>
                              <div
                                className="dynamic-content flex flex-col justify-center gap-2"
                                dangerouslySetInnerHTML={{
                                  __html: card.special_rules,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </section>
              </section>
            );
          })}
        </main>
      </>
    );
  }

  throw new Error("/card-decks/mission-cards: rendered with no data");
}
