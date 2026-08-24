import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IndexCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

const FORTIFICATIONS_SLUG = "fortifications";
const FORTIFICATIONS_NAME = "Fortifications";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Unit Profiles | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Unit Profiles.",
  };
}

const countLabel = (count: number): string =>
  count === 1 ? "1 unit" : `${count} units`;

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "profiles")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: factionRows, error: factionsError } = await supabase
    .from("factions")
    .select("id, slug, name, parent_faction_id")
    .order("name");

  const { data: unitRows, error: unitsError } = await supabase
    .from("units")
    .select("id, faction_id");

  assertNoQueryErrors("/profiles", heroImageError, factionsError, unitsError);

  if (!hero || !factionRows || !unitRows) {
    throw new Error("/profiles: rendered with no data");
  }

  const factions = factionRows;
  const units = unitRows;

  const parents = new Map(
    factions.map(({ id, parent_faction_id }) => [id, parent_faction_id]),
  );

  const counts = new Map<number, number>();
  let fortifications = 0;

  for (const { faction_id } of units) {
    if (faction_id === null) {
      fortifications += 1;
      continue;
    }

    const topLevel = parents.get(faction_id) ?? faction_id;
    counts.set(topLevel, (counts.get(topLevel) ?? 0) + 1);
  }

  const sections = [
    ...factions
      .filter(({ parent_faction_id }) => parent_faction_id === null)
      .map(({ id, slug, name }) => ({
        slug,
        name,
        count: counts.get(id) ?? 0,
      })),
    {
      slug: FORTIFICATIONS_SLUG,
      name: FORTIFICATIONS_NAME,
      count: fortifications,
    },
  ];

  return (
    <>
      <Breadcrumbs
        crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Profiles" }]}
      />
      <Panel
        as="main"
        className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
      >
        <header>
          <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
            Unit Profiles
          </h1>
        </header>
        <ImageWithCredit
          src={`images/${hero.file_name}`}
          title={hero.title}
          artist={hero.artist}
        />
        <SectionBar
          as="h2"
          title="Profiles and datafaxes"
          note={countLabel(units.length)}
        />
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map(({ slug, name, count }) => (
            <IndexCard
              key={slug}
              href={`/profiles/${slug}`}
              title={name}
              summary={countLabel(count)}
            />
          ))}
        </div>
      </Panel>
    </>
  );
}
