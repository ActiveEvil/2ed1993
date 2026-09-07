import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FactionCard } from "@/components/Cards";
import type { Image } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Factions"),
    description:
      "Every army in Warhammer 40,000 2nd Edition, from Space Marines and Imperial Guard to Orks, Eldar, Chaos, Tyranids, Squats and Necrons.",
  };
}

export default async function Page() {
  const { data: factionRows, error: factionsError } = await supabase
    .from("factions")
    .select("slug, name, parent_faction_id, images(file_name, artist, title)")
    .order("name");

  assertNoQueryErrors("/factions", factionsError);

  if (factionRows) {
    const factions = factionRows.filter(
      ({ parent_faction_id }) => parent_faction_id === null,
    );
    const subfactions = factionRows.length - factions.length;
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
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Factions"
            eyebrow={`${factions.length} factions \u00b7 ${subfactions} subfactions`}
          />
          <div className="grid md:grid-cols-2 gap-4 p-4 md:p-8">
            {factions.map(({ slug, name, images }) => {
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
