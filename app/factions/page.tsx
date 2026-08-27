import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FactionCard } from "@/components/Cards";
import type { Image } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Factions | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Factions.",
  };
}

export default async function Page() {
  const { data: factions, error: factionsError } = await supabase
    .from("factions")
    .select("slug, name, images(file_name, artist, title), army_lists(id)")
    .is("parent_faction_id", null)
    .order("name");

  assertNoQueryErrors("/factions", factionsError);

  if (factions) {
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
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Factions
            </h1>
          </header>
          <div className="grid md:grid-cols-2 gap-4">
            {factions.map(({ slug, name, images, army_lists }) => {
              const image: Image | undefined = images[0] && {
                src: `images/${images[0].file_name}`,
                title: images[0].title,
                artist: images[0].artist,
              };
              return (
                <FactionCard
                  key={slug}
                  href={`/factions/${slug}`}
                  name={name}
                  image={image}
                  // disabled={!army_lists.length}
                  disabled
                />
              );
            })}
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/factions: rendered with no data");
}
