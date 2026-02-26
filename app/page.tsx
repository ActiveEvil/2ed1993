import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Oldhammer, _2ed1993 } from "@/components/Logos";
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
            <p className="font-bold">WIP...</p>
            <p>
              2ed1993 is a record, not an archive. It is an attempt to store, in
              a digital format, all information on playing Warhammer 40,000 2nd
              Edition. It aims to collect together every rule, army list, unit
              profile, FAQ, or similar material in one location.
            </p>
            <p>
              For reasons that should be obvious, this is not a direct copy of
              the original material produced by Games Workshop in the &apos;90s.
              Instead, it is a functionally identical yet legally distinct
              ruleset—one that may actually improve on the original in some
              respects, particularly regarding clarity.
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
