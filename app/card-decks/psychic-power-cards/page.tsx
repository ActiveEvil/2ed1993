import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/Heading";
import { Highlighter } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
import { deckColors } from "@/lib/factions";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { clsx } from "clsx";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Psychic Power Cards"),
    description:
      "The psychic power cards of Warhammer 40,000 2nd Edition, grouped by discipline, giving the force card cost, range and effect of each power.",
  };
}

export default async function Page() {
  const [
    { data: heroImages, error: heroImagesError },
    { data: psychic_power_cards, error: psychicPowerCardsError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "psychic-power-cards")
      .order("position"),
    supabase
      .from("psychic_power_cards")
      .select("id, deck, name, description, force, range, note")
      .order("id"),
  ]);
  const heros = heroImages?.map(({ images }) => images);

  assertNoQueryErrors(
    "/card-decks/psychic-power-cards",
    heroImagesError,
    psychicPowerCardsError,
  );

  if (heros?.length && psychic_power_cards) {
    const cards = new Map<string, typeof psychic_power_cards>();

    for (const item of psychic_power_cards) {
      const bucket = cards.get(item.deck) ?? [];
      bucket.push(item);
      cards.set(item.deck, bucket);
    }

    const decks = Array.from(cards.entries()).map(([name, cards]) => ({
      name,
      cards,
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
              anchor: "Psychic Power Cards",
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Psychic Power Cards"
            eyebrow={`Card Decks \u00b7 ${psychic_power_cards.length} cards \u00b7 ${decks.length} disciplines`}
            image={{
              src: `images/${heros[0].file_name}`,
              title: heros[0].title,
              artist: heros[0].artist,
              dimensions: dimensionsOf(heros[0]),
            }}
          />
          <div className="flex flex-col lg:flex-row">
            <JumpBar
              rail
              items={decks.map(({ name }) => ({
                id: generateAnchorId(name),
                label: name,
              }))}
            />
            <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
              {decks.map((deck) => {
                const deckId = generateAnchorId(deck.name);

                return (
                  <section
                    id={deckId}
                    key={deckId}
                    className="flex flex-col gap-4"
                  >
                    <SectionHeading>{deck.name}</SectionHeading>
                    <div className="grid md:grid-cols-2 gap-4">
                      {deck.cards.map((card) => {
                        const cardId = generateAnchorId(card.name);

                        return (
                          <article
                            key={cardId}
                            id={cardId}
                            className={clsx(
                              "flex flex-col items-center gap-2 p-4 border-4 border-frame target:border-2ed-light-yellow shadow-xl",
                              deckColors[deck.name],
                            )}
                          >
                            <div className="flex flex-col gap-4 p-4 w-full h-full bg-card-face text-2ed-black">
                              <div className="flex justify-between gap-4 font-subtitle text-lg">
                                <span>Force {card.force}</span>
                                {card.range && <span>Range: {card.range}</span>}
                              </div>
                              <h3 className="font-title uppercase text-2xl text-2ed-dark-blue text-center">
                                {card.name}
                              </h3>
                              <p
                                className="text-lg"
                                dangerouslySetInnerHTML={{
                                  __html: card.description,
                                }}
                              />
                              {card.note && (
                                <p className="mt-auto font-subtitle uppercase text-2ed-dark-blue text-center">
                                  {card.note}
                                </p>
                              )}
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

  throw new Error("/card-decks/psychic-power-cards: rendered with no data");
}
