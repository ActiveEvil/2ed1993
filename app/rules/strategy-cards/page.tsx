import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: `Warhammer 40,000 2nd Edition Mission Cards | 2ed1993`,
    description: `Warhammer 40,000 2nd Edition  Mission Cards.`,
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
  const { data: mission_cards } = await supabase
    .from("strategy_cards")
    .select("id, origin, name, description")
    .order("name");

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
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/rules",
              anchor: "Rules",
            },
            {
              anchor: "Strategy Cards",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
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
                        id={cardId}
                        key={cardId}
                        className="flex flex-col justify-start items-center gap-2 p-4 border-4 border-black bg-2ed-dark-red"
                      >
                        <div className="flex flex-col justify-center items-center gap-4 p-4 bg-2ed-white text-2ed-black text-sm md:text-base">
                          <h3 className=" font-subtitle uppercase text-2xl text-2ed-dark-blue text-center">
                            {card.name}
                          </h3>
                          <p>{card.description}</p>
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
