import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Factions | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Factions.",
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
    .eq("id", 3)
    .single();

  const { data: factions } = await supabase
    .from("factions")
    .select("id, name")
    .order("name");

  if (hero && factions) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Factions",
            },
          ]}
        />
        <main className="flex flex-col justify-center  gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-5xl text-center">
              Factions
            </h1>
          </header>
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              {factions.map(({ id, name }) => (
                <li key={id}>
                  <Link
                    className="font-subtitle hover:underline underline-offset-4"
                    href={`/factions/${id}/${slugify(name)}`}
                  >
                    {name}
                  </Link>
                </li>
              ))}
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
