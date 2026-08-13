import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { clsx } from "clsx";
import { Metadata } from "next/types";

export const revalidate = 3600;

export const deckColors: Record<string, string> = {
  Librarian: "bg-blue-600",
  Inquisition: "bg-red-500",
  Adeptus: "bg-blue-700",
  "Ork Weirdboyz": "bg-green-600",
  "Eldar Seers": "bg-sky-500",
  Squat: "bg-orange-500",
  Tyranid: "bg-purple-500",
  Slaanesh: "bg-pink-400",
  Tzeentch: "bg-cyan-500",
  Nurgle: "bg-lime-400",
};

export function generateMetadata(): Metadata {
  return {
    title: `Warhammer 40,000 2nd Edition Psychic Power Cards | 2ed1993`,
    description: `Warhammer 40,000 2nd Edition Psychic Power Cards.`,
  };
}

export default async function Page() {
  const { data: heroImages, error: heroImagesError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "psychic-power-cards")
    .order("position");
  const heros = heroImages?.map(({ images }) => images);
  const { data: psychic_power_cards, error: psychicPowerCardsError } =
    await supabase
      .from("psychic_power_cards")
      .select("id, deck, name, description, force, range, note")
      .order("id");

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
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                Psychic Power Cards
              </h1>
            </header>
            <div className="grid grid-cols-2 gap-4">
              {heros.map((hero) => (
                <div key={hero.file_name}>
                  <ImageWithCredit
                    src={`images/${hero.file_name}`}
                    title={hero.title}
                    artist={hero.artist}
                    aspect="aspect-portrait"
                    width="half"
                  />
                </div>
              ))}
            </div>
            <section className="border-4 border-black">
              <SectionBar
                title="The deck"
                note={`${psychic_power_cards.length} cards \u00b7 ${decks.length} disciplines`}
              />
              <div className="flex flex-col gap-2 p-3">
                {decks.map((deck) => (
                  <div
                    key={generateAnchorId(deck.name)}
                    className="flex flex-col md:flex-row md:items-baseline gap-2"
                  >
                    <span className="shrink-0 md:w-44 font-subtitle text-xs uppercase tracking-[0.14em]">
                      {deck.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {deck.cards.map((card) => (
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
          </Panel>
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            {decks.map((deck) => {
              const deckId = generateAnchorId(deck.name);

              return (
                <section
                  id={deckId}
                  key={deckId}
                  className="flex flex-col gap-4"
                >
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black shadow-lg" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      {deck.name}
                    </h2>
                  </div>
                  <section className="grid md:grid-cols-2 gap-4">
                    {deck.cards.map((card) => {
                      const cardId = generateAnchorId(card.name);

                      return (
                        <div
                          key={cardId}
                          id={cardId}
                          className={clsx(
                            "flex flex-col justify-start items-center gap-2 p-4 border-4 border-black target:border-2ed-light-yellow shadow-xl",
                            deckColors[deck.name],
                          )}
                        >
                          <div className="flex flex-col justify-start items-center gap-4 p-4 h-full bg-card-face text-2ed-black">
                            <div className="flex justify-between w-full font-subtitle text-lg">
                              <div>Force {card.force}</div>
                              {card.range && <div>Range: {card.range}</div>}
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
                              <div className="mt-auto font-subtitle uppercase text-2ed-dark-blue text-center">
                                {card.note}
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
          </Panel>
        </main>
      </>
    );
  }

  throw new Error("/card-decks/psychic-power-cards: rendered with no data");
}
