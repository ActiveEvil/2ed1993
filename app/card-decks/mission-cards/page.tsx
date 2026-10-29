import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MissionCardRandomiser } from "@/components/CardRandomisers";
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
    title: pageTitle("Mission Cards"),
    description:
      "The Mission cards of Warhammer 40,000 2nd Edition, giving the primary objective, any secondary objective and the victory points, each marked with its source.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: mission_cards, error: missionCardsError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "mission-cards")
      .single(),
    supabase
      .from("mission_cards")
      .select(
        "id, origin, name, description, primary_objective, secondary_objective, special_rules",
      )
      .order("name"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/card-decks/mission-cards",
    heroImageError,
    missionCardsError,
  );

  if (hero && mission_cards) {
    const cards = mission_cards.map((card) => ({
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
              anchor: "Mission Cards",
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Mission Cards"
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
              <MissionCardRandomiser
                baseHref="/card-decks/mission-cards"
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
                  className="flex flex-col items-center gap-2 p-4 border-4 border-frame bg-2ed-dark-blue target:border-2ed-dark-yellow shadow-lg"
                >
                  <h2 className="font-subtitle uppercase text-2xl text-2ed-light-yellow text-center">
                    {card.name}
                  </h2>
                  <div className="flex flex-col gap-4 p-4 w-full h-full bg-card-face text-2ed-black">
                    {card.description && (
                      <p
                        className="text-lg"
                        dangerouslySetInnerHTML={{
                          __html: card.description,
                        }}
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      <h3 className="font-subtitle font-bold text-xl text-2ed-dark-red text-center">
                        Primary Objective
                      </h3>
                      <div
                        className="dynamic-content flex flex-col gap-2"
                        dangerouslySetInnerHTML={{
                          __html: card.primary_objective,
                        }}
                      />
                    </div>
                    {card.secondary_objective && (
                      <div className="flex flex-col gap-2">
                        <h3 className="font-subtitle font-bold text-xl text-2ed-dark-red text-center">
                          Secondary Objective
                        </h3>
                        <div
                          className="dynamic-content flex flex-col gap-2"
                          dangerouslySetInnerHTML={{
                            __html: card.secondary_objective,
                          }}
                        />
                      </div>
                    )}
                    {card.special_rules && (
                      <div className="flex flex-col gap-2">
                        <h3 className="font-subtitle font-bold text-xl text-2ed-dark-red text-center">
                          Special Rules
                        </h3>
                        <div
                          className="dynamic-content flex flex-col gap-2"
                          dangerouslySetInnerHTML={{
                            __html: card.special_rules,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-4 w-full">
                    <p className="font-block text-xs text-2ed-white">
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

  throw new Error("/card-decks/mission-cards: rendered with no data");
}
