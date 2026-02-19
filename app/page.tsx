import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Oldhammer, _2ed1993 } from "@/components/Logos";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "The Warhammer 40,000 Second Edition digital archive | 2ed1993",
    description:
      "2ed1993, the Warhammer 40,000 Second Edition digital archive project.",
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

  if (hero) {
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
            <Oldhammer />
          </header>
          <section className="flex flex-col gap-4 w-full text-xl">
            <p>
              2ed1993 is a Warhammer 40,000 Second Edition digital archive
              project.
            </p>
            <p className="font-bold">
              The site is currently work in progress...
            </p>
          </section>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
            aspect="aspect-retro"
          />
        </main>
      </>
    );
  }
}
