import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Rules | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Rules.",
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
    .eq("id", 8)
    .single();
  const { data: rule_categories } = await supabase
    .from("rule_categories")
    .select("id, name, rules(name)")
    .order("position");

  if (hero && rule_categories) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Rules",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              Rules
            </h1>
          </header>

          <section className="flex flex-col justify-center gap-4">
            <h2 className="font-title text-3xl text-center uppercase">
              The Golden Rule
            </h2>
            <p className="text-xl">
              First and foremost, 2nd Edition 40K is meant to be fun. The rules
              should serve the story you want to tell on the tabletop, not
              dictate it. Remember, the ultimate goal is a memorable, immersive
              battle that leaves everyone eager for the next game. Be a good
              sport and have fun!
            </p>
            <p className="text-xl">
              And if the internet has broken your brain and you are now thinking{" "}
              <em>"b...but muh Meta!?"</em>, remember:
            </p>
            <section className="flex flex-col justify-center gap-2 bg-2ed-light-green p-2 border-2 border-black shadow-lg">
              <blockquote className="text-2ed-black text-lg italic">
                <p>
                  Warhammer 40,000 is a challenging and involving game, with
                  many fantastic races, and endless possibilities. In a game of
                  this size and level of complexity there are bound to be some
                  situations where the rules seem unclear, or a particular
                  situation lies outside the rules as they are written. This is
                  inevitable, as we can&apos;t possibly give rules to cover
                  every circumstance. Nor would we want to try, as that would
                  restrict what you can and cannot do far too much. Players
                  should feel free to invent and improvise, exploring the galaxy
                  of Warhammer 40,000 for themselves and taking the game far
                  beyond the published rules if they wish.
                </p>
              </blockquote>
              <p className="font-bold text-black text-xs text-right">
                &mdash;Rick Priestley &amp; Andy Chambers,{" "}
                <cite>Warhammer 40,000 Rulebook (2nd Edition)</cite>
              </p>
            </section>
          </section>
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              {rule_categories.map(({ id, name, rules }) => {
                const href = `/rules/${id}/${slugify(name)}`;

                return (
                  <li key={id}>
                    <Link
                      className="font-subtitle hover:underline underline-offset-4"
                      href={href}
                    >
                      {name}
                    </Link>
                    <ol className="flex flex-col gap-2 pl-4 text-xl">
                      {rules.map(({ name }) => {
                        const ruleId = name.split(" ").join("_");

                        return (
                          <li key={ruleId} className="">
                            <Link
                              className="hover:underline underline-offset-4"
                              href={`${href}#${ruleId}`}
                            >
                              {name}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </li>
                );
              })}
            </ol>
          </nav>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
        </main>
      </>
    );
  }
}
