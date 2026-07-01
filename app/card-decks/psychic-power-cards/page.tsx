import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import Link from "next/link";
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
  const { data: heros } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .in("id", [31, 32]);
  const { data: psychic_power_cards } = await supabase
    .from("psychic_power_cards")
    .select("id, deck, name, description, force, range")
    .order("id");

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
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Psychic Power Cards
            </h1>
          </header>
          <div className="grid grid-cols-2 gap-4">
            {heros.map((hero, index) => (
              <div key={hero.file_name}>
                <ImageWithCredit
                  src={`images/${hero.file_name}`}
                  title={hero.title}
                  artist={hero.artist}
                  aspect="aspect-portrait"
                />
              </div>
            ))}
          </div>
          <div className="relative flex flex-col items-center justify-center gap-4 w-full">
            <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
            <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
              Psychic Disciplines
            </h2>
          </div>
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              {decks.map(({ name }) => {
                const deckId = name.split(" ").join("_");
                const href = `/card-decks/psychic-power-cards#${deckId}`;

                return (
                  <li key={deckId}>
                    <Link
                      className="font-subtitle hover:underline underline-offset-4"
                      href={href}
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>

          {decks.map((deck) => {
            const deckId = deck.name.split(" ").join("_");

            return (
              <section id={deckId} key={deckId} className="flex flex-col gap-4">
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    {deck.name}
                  </h2>
                </div>
                <section className="grid md:grid-cols-2 gap-4">
                  {deck.cards.map((card) => {
                    const cardId = card.name.split(" ").join("_");

                    return (
                      <div
                        key={cardId}
                        id={cardId}
                        className={clsx(
                          "flex flex-col justify-start items-center gap-2 p-4 border-4 border-black target:border-2ed-light-yellow shadow-xl",
                          deckColors[deck.name],
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
