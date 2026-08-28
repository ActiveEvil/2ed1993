import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IndexCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Datafaxes | 2ed1993",
    description: "Warhammer 40,000 2nd Edition vehicle datafaxes, by faction.",
  };
}

const countLabel = (count: number): string =>
  count === 0
    ? "No datafaxes yet"
    : count === 1
      ? "1 datafax"
      : `${count} datafaxes`;

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "datafaxes")
    .maybeSingle();

  const { data: factionRows, error: factionsError } = await supabase
    .from("factions")
    .select("id, slug, name, parent_faction_id")
    .order("name");

  const { data: unitRows, error: unitsError } = await supabase
    .from("units")
    .select("faction_id, unit_types(name), datafaxes(id)");

  assertNoQueryErrors("/datafaxes", heroImageError, factionsError, unitsError);

  const hero = heroImage?.images ?? null;
  const factions = factionRows ?? [];
  const units = unitRows ?? [];

  const parents = new Map(
    factions.map(({ id, parent_faction_id }) => [id, parent_faction_id]),
  );

  const counts = new Map<number, number>();
  let total = 0;
  let fortificationCount = 0;

  for (const { faction_id, unit_types, datafaxes } of units) {
    if (!datafaxes) {
      continue;
    }

    total += 1;

    if (unit_types.name === "Fortification") {
      fortificationCount += 1;
      continue;
    }

    if (faction_id === null) {
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
  ];

  return (
    <>
      <Breadcrumbs
        crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Datafaxes" }]}
      />
      <Panel
        as="main"
        className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
      >
        <header>
          <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
            Datafaxes
          </h1>
        </header>
        {hero && (
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
        )}
        <SectionBar
          as="h2"
          title="Datafaxes by faction"
          note={countLabel(total)}
        />
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map(({ slug, name, count }) => (
            <IndexCard
              key={slug}
              href={`/datafaxes/${slug}`}
              title={name}
              summary={countLabel(count)}
            />
          ))}
        </div>
        <SectionBar as="h2" title="Other Datafaxes" />
        <IndexCard
          key="fortifications"
          href="/datafaxes/fortifications"
          title="Fortifications"
          summary={countLabel(fortificationCount)}
        />
      </Panel>
    </>
  );
}
