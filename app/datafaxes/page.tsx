import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentsTable } from "@/components/ContentsTable";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { TitleBand } from "@/components/TitleBand";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Vehicle Datafaxes"),
    description:
      "Vehicle datafaxes for Warhammer 40,000 2nd Edition, by faction, giving speed, armour values, crew, weapons and the damage charts for each vehicle.",
  };
}

const countLabel = (count: number): string =>
  count === 0
    ? "No datafaxes yet"
    : count === 1
      ? "1 datafax"
      : `${count} datafaxes`;

const Row: React.FC<{
  href: string;
  name: string;
  count: number;
}> = ({ href, name, count }): React.JSX.Element => (
  <li className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8 px-4 md:px-8 py-3">
    {count > 0 ? (
      <Link
        href={href}
        className="md:w-56 shrink-0 font-subtitle text-lg hover:underline underline-offset-4"
      >
        {name}
      </Link>
    ) : (
      <span className="md:w-56 shrink-0 font-subtitle text-lg">{name}</span>
    )}
    <span className="text-base">{countLabel(count)}</span>
  </li>
);

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: factionRows, error: factionsError },
    { data: datafaxRows, error: datafaxesError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "datafaxes")
      .maybeSingle(),
    supabase
      .from("factions")
      .select("id, slug, name, parent_faction_id")
      .order("name"),
    supabase
      .from("datafaxes")
      .select("units!inner(faction_id, unit_types(name))"),
  ]);

  assertNoQueryErrors(
    "/datafaxes",
    heroImageError,
    factionsError,
    datafaxesError,
  );

  const hero = heroImage?.images ?? null;
  const factions = factionRows ?? [];
  const datafaxes = datafaxRows ?? [];

  const parents = new Map(
    factions.map(({ id, parent_faction_id }) => [id, parent_faction_id]),
  );

  const counts = new Map<number, number>();
  let total = 0;
  let fortificationCount = 0;

  for (const {
    units: { faction_id, unit_types },
  } of datafaxes) {
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

  const sections = factions
    .filter(({ parent_faction_id }) => parent_faction_id === null)
    .map(({ id, slug, name }) => ({
      slug,
      name,
      count: counts.get(id) ?? 0,
    }))
    .filter(({ count }) => count > 0);

  const rows = [
    ...sections.map((section) => ({
      ...section,
      href: `/datafaxes/${section.slug}`,
    })),
  ];

  const other = [
    {
      slug: "fortifications",
      name: "Fortifications",
      count: fortificationCount,
      href: "/datafaxes/fortifications",
    },
  ];

  return (
    <>
      <Breadcrumbs
        crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Datafaxes" }]}
      />
      <Panel as="main" className="flex flex-col w-full max-w-5xl">
        <TitleBand
          title="Datafaxes"
          eyebrow={countLabel(total)}
          image={
            hero && {
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }
          }
        />
        <section className="group flex flex-col">
          <SectionBar as="h2" title="Datafaxes by faction" />
          <ContentsTable as="ul">
            {rows.map(({ slug, href, name, count }) => (
              <Row key={slug} href={href} name={name} count={count} />
            ))}
          </ContentsTable>
        </section>
        <section className="group flex flex-col">
          <SectionBar as="h2" title="Other Datafaxes" />
          <ContentsTable as="ul">
            {other.map(({ slug, href, name, count }) => (
              <Row key={slug} href={href} name={name} count={count} />
            ))}
          </ContentsTable>
        </section>
      </Panel>
    </>
  );
}
