import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Warhammer, _2ed1993 } from "@/components/Logos";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition | 2ed1993",
    description:
      "2ed1993 is a record of every rule, army list, unit profile, FAQ, or similar material for Warhammer 40,000 2nd Edition.",
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
    .eq("id", 1)
    .single();

  const { data: showcase } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .in("id", [35, 36, 37, 38, 39, 40, 41, 42, 43])
    .order("id");

  if (hero && showcase) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              anchor: "2ed1993",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header className="flex justify-center items-center">
            <Warhammer />
          </header>
          <section className="flex flex-col gap-4 w-full text-xl">
            <p>
              2ed1993 is a record, not an archive&mdash;a digitised reference
              for playing Warhammer 40,000 2nd Edition. The intention is to
              collate and document every rule, army list, unit profile, FAQ, or
              similar material in one location.
            </p>
            <p>
              For reasons that should be obvious, this is not a direct copy of
              the original material produced by Games Workshop. Instead, it is a
              functionally identical yet legally distinct record—with an
              emphasis on clarity, inclusivity and accessibility.
            </p>
          </section>

          <article className="flex flex-col gap-4 w-full">
            <div className="relative flex flex-col items-center justify-center gap-4 w-full">
              <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black" />
              <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                A Brief History
              </h2>
            </div>

            <section className="grid md:grid-cols-2 gap-4">
              <ImageWithCredit
                src={`images/${hero.file_name}`}
                title={hero.title}
                artist={hero.artist}
                aspect="aspect-retro"
              />
              <section className="flex flex-col gap-4 w-full text-lg">
                <p>
                  Warhammer 40,000 2nd Edition was released in 1993, succeeding
                  Warhammer 40,000: Rogue Trader (1987). Whereas Rogue Trader
                  was a roleplaying and tabletop wargaming hybrid, 2nd Edition
                  established Warhammer 40,000 as the tabletop wargame we know
                  today.
                </p>
                <p>
                  Often referred to by collectors as the <i>Red Period</i>,
                  Warhammer 40,000 2nd Edition is visually defined by its
                  bright, high-contrast paint schemes, the introduction of the
                  Goblin Green base, and of course Sci-Fi Cacti!
                </p>
                <p>
                  It was also Warhammer 40,000&apos;s <i>Hero Hammer</i>{" "}
                  edition&mdash;where certain characters were effectively an
                  army unto themselves.
                </p>
              </section>
            </section>
            <section className="flex flex-col gap-4 w-full text-lg">
              <p>
                Although mechanically complex by today&apos;s standards, 2nd
                Edition significantly streamlined the game. It introduced
                structured gameplay without the need for a gamemaster. It was
                the first edition to introduce Codex army books, expanding
                individual factions with unit profiles, wargear, special
                characters, and bespoke army lists. The edition also established
                the foundational lore of the Warhammer 40,000 universe as we
                would recognise it today.
              </p>
              <p>
                Games were intended to be played on a smaller scale than modern
                Warhammer 40,000, typically ranging from 500 to 2,000 points per
                side&mdash;but with a significantly lower model count. This
                encouraged narrative-driven skirmishes built around mission
                cards and story hooks rather than strict match-play objectives.
                Although tournaments did exist, competitive matched play was not
                yet the default. Games were more likely to revolve around
                personal campaigns, custom missions, and the scenario cards
                included in supplements like Dark Millennium.
              </p>
            </section>
            <figure
              role="group"
              className="grid grid-cols-2 md:grid-cols-3 gap-2"
            >
              {showcase.map((image) => (
                <div key={image.file_name}>
                  <ImageWithCredit
                    src={`images/${image.file_name}`}
                    title={image.title}
                    artist={image.artist}
                    aspect="aspect-square"
                  />
                </div>
              ))}
              <figcaption className="col-span-3 font-bold text-right text-sm">
                &mdash;Examples of the Warhammer 40,000 2nd Edition style
              </figcaption>
            </figure>
          </article>
        </main>
      </>
    );
  }
}
