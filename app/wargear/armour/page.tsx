import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter, HighlighterButton } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Weapons | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Weapons.",
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
    .eq("id", 30)
    .single();

  const { data: armour } = await supabase
    .from("armour")
    .select("id, name, profile_description")
    .order("name");

  if (hero && armour) {
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
              href: "/wargear",
              anchor: "Wargear",
            },
            {
              anchor: "Armour",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl pt-4 md:pt-8 border-4 border-black shadow-lg">
          <header className="px-4 md:px-8">
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Armour
            </h1>
          </header>
          <div className="px-4 md:px-8">
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          </div>
          <section className="flex flex-col ">
            {armour.map((item) => {
              const itemId = item.name.split(" ").join("_");

              return (
                <section
                  key={itemId}
                  id={itemId}
                  className="flex flex-col gap-4 py-8 px-4 md:px-8 border-t-4 border-black target:bg-2ed-light-yellow target:text-black target:font-bold"
                >
                  <HighlighterButton
                    className="flex hover:underline underline-offset-4"
                    href={`/wargear/armour#${itemId}`}
                  >
                    <h2 className="font-subtitle text-2xl capitalize">
                      {item.name}
                    </h2>
                  </HighlighterButton>

                  <section
                    className="dynamic-content flex flex-col justify-center gap-4"
                    dangerouslySetInnerHTML={{
                      __html: item.profile_description,
                    }}
                  />
                </section>
              );
            })}
          </section>
        </main>
      </>
    );
  }
}
