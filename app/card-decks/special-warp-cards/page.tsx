import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: `Warhammer 40,000 2nd Edition Special Warp Cards | 2ed1993`,
    description: `Warhammer 40,000 2nd Edition Special Warp Cards.`,
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
    .eq("id", 33)
    .single();
  const { data: special_warp_cards } = await supabase
    .from("special_warp_cards")
    .select("id, name, description")
    .order("id");

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
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Special Warp Cards
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          {/* <div className="relative flex flex-col items-center justify-center gap-4 w-full">
            <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
            <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
              Psychic Disciplines
            </h2>
          </div> */}

          <section className="grid md:grid-cols-2 gap-4">
            {special_warp_cards.map((card) => {
              const cardId = card.name.split(" ").join("_");

              return (
                <div
                  key={cardId}
                  id={cardId}
                  className={clsx(
                    "flex flex-col justify-start items-center gap-2 p-4 bg-2ed-mid-blue border-4 border-black target:border-2ed-light-yellow shadow-xl",
                  )}
                >
                  <div className="flex flex-col justify-start items-center gap-4 p-4 h-full bg-2ed-white text-2ed-black">
                    <h3 className="font-title uppercase text-2xl text-2ed-mid-blue text-center">
                      {card.name}
                    </h3>
                    <p className="ftext-lg">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* {decks.map((deck) => {
            const deckId = deck.name.split(" ").join("_");

            return (
              <section id={deckId} key={deckId} className="flex flex-col gap-4">
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    {deck.name}
                  </h2>
                </div>
               
              </section>
            );
          })} */}
        </main>
      </>
    );
  }
}
