import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StrategyCardRandomiser } from "@/components/CardRandomisers";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import { Metadata } from "next/types";

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
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const { data: hero } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .eq("id", 27)
    .single();
  const { data: psychic_power_cards } = await supabase
    .from("psychic_power_cards")
    .select("id, deck, name, description, force, range")
    .order("id");

  if (hero && psychic_power_cards) {
    const decks = new Map<string, typeof psychic_power_cards>();

    for (const item of psychic_power_cards) {
      const bucket = decks.get(item.deck) ?? [];
      bucket.push(item);
      decks.set(item.deck, bucket);
    }

    const cards = Array.from(decks.entries()).map(([deck, items]) => ({
      deck,
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
              anchor: "Psychic Power Cards",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Psychic Power Cards
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          {cards.map((section) => {
            const deckId = section.deck.split(" ").join("_");

            return (
              <section id={deckId} key={deckId} className="flex flex-col gap-4">
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    {section.deck}
                  </h2>
                </div>
                <section className="grid md:grid-cols-2 gap-4">
                  {section.items.map((card) => {
                    const cardId = card.name.split(" ").join("_");

                    return (
                      <div
                        key={cardId}
                        id={cardId}
                        className={clsx(
                          "flex flex-col justify-start items-center gap-2 p-4 border-4 border-black target:border-2ed-light-yellow shadow-xl",
                          deckColors[section.deck],
                        )}
                      >
                        <div className="flex flex-col justify-start items-center gap-4 p-4 h-full bg-2ed-white text-2ed-black">
                          <div className="flex justify-between w-full font-subtitle text-lg">
                            <div>Force {card.force}</div>
                            <div>Range: {card.range}</div>
                          </div>
                          <h3 className="font-title uppercase text-2xl text-2ed-dark-blue text-center">
                            {card.name}
                          </h3>
                          <p className="ftext-lg">{card.description}</p>
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
}
