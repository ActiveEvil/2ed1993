import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FactionCard, IndexCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import type { Image } from "@/components/ImageWithCredit";
import { Logo } from "@/components/Logos";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/factions/[faction]";

export async function generateMetadata(props: {
  params: Promise<{ faction: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("id, name, parent_faction_id, army_lists(id)")
    .eq("slug", params.faction)
    .single();

  assertNoQueryErrors(CONTEXT, factionError);

  if (faction) {
    const { data: children, error: childrenError } = await supabase
      .from("factions")
      .select("army_lists(id)")
      .eq("parent_faction_id", faction.id);

    assertNoQueryErrors(CONTEXT, childrenError);

    const hasArmyLists =
      faction.army_lists.length > 0 ||
      (children ?? []).some((child) => child.army_lists.length > 0);

    const title = pageTitle(faction.name);

    if (!hasArmyLists) {
      return {
        title,
        description: `The ${faction.name} in Warhammer 40,000 2nd Edition. Background and history, with the army list and unit profiles still to be added.`,
        robots: { index: false },
      };
    }

    const { data: parent, error: parentError } =
      faction.parent_faction_id === null
        ? { data: null, error: null }
        : await supabase
            .from("factions")
            .select("name")
            .eq("id", faction.parent_faction_id)
            .single();

    assertNoQueryErrors(CONTEXT, parentError);

    if (faction.parent_faction_id !== null && parent?.name === "Space Marines") {
      return {
        title,
        description: `The ${faction.name}, a Space Marine Chapter in Warhammer 40,000 2nd Edition, with unit profiles, points values, wargear and the Chapter's special rules.`,
      };
    }

    return {
      title,
      description: `The ${faction.name} army lists for Warhammer 40,000 2nd Edition, with unit profiles, points values, wargear options and the faction's special rules.`,
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ faction: string }>;
}) {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select(
      `id, slug, name, description, images(file_name, artist, title), army_lists(id, name, slug, unit_categories(category), wargear_categories(category, wargear_items(id)))`,
    )
    .eq("slug", params.faction)
    .order("name", { referencedTable: "army_lists" })
    .order("position", { referencedTable: "army_lists.unit_categories" })
    .order("position", { referencedTable: "army_lists.wargear_categories" })
    .single();

  assertNoQueryErrors(CONTEXT, factionError);

  if (faction) {
    const { data: subfactions, error: subfactionsError } = await supabase
      .from("factions")
      .select("slug, name, images(file_name, artist, title)")
      .eq("parent_faction_id", faction.id)
      .order("name");

    assertNoQueryErrors(CONTEXT, subfactionsError);

    const heros = faction.images.slice(0, 2);
    const lists = faction.army_lists.map((list) => {
      const sections = list.unit_categories.map(({ category }) => category);
      const equipped = list.wargear_categories.some(
        ({ wargear_items }) => wargear_items.length,
      );

      return {
        id: list.id,
        name: list.name,
        href: `/factions/${faction.slug}/${list.slug}`,
        sections: equipped ? [...sections, "Equipment"] : sections,
      };
    });

    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/factions",
              anchor: "Factions",
            },
            {
              anchor: faction.name,
            },
          ]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header className="flex justify-center items-center">
            <Logo as="h1" size="xl" title={faction.name} />
          </header>
          <section className="grid md:grid-cols-2 gap-4">
            {heros.length === 1 ? (
              <ImageWithCredit
                key={heros[0].file_name}
                src={`images/${heros[0].file_name}`}
                title={heros[0].title}
                artist={heros[0].artist}
                width="half-from-md"
                aspect="aspect-portrait"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {heros.map((hero) => (
                  <div key={hero.file_name}>
                    <ImageWithCredit
                      src={`images/${hero.file_name}`}
                      title={hero.title}
                      artist={hero.artist}
                      aspect="aspect-portrait"
                      width="half"
                    />
                  </div>
                ))}
              </div>
            )}
            <section
              className="dynamic-content flex flex-col justify-center gap-4"
              dangerouslySetInnerHTML={{ __html: faction.description }}
            />
          </section>
          {Boolean(lists.length) && (
            <section className="flex flex-col gap-4">
              <SectionBar as="h2" title="Army Lists" />
              <div className="grid md:grid-cols-2 gap-4">
                {lists.map(({ id, name, href, sections }) => (
                  <IndexCard
                    key={id}
                    href={href}
                    title={name}
                    summary={sections.length ? null : "Not yet transcribed."}
                  >
                    {Boolean(sections.length) && (
                      <ol className="pl-6 text-lg list-decimal">
                        {sections.map((section) => (
                          <li key={section} className="capitalize">
                            <Link
                              className="hover:underline underline-offset-4"
                              href={`${href}#${generateAnchorId(section)}`}
                            >
                              {section}
                            </Link>
                          </li>
                        ))}
                      </ol>
                    )}
                  </IndexCard>
                ))}
              </div>
            </section>
          )}
          {Boolean(subfactions?.length) && (
            <section className="flex flex-col gap-4">
              <SectionBar as="h2" title="Subfactions" />
              <div className="grid md:grid-cols-2 gap-4">
                {subfactions?.map(({ slug, name, images }) => {
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
            </section>
          )}
        </Panel>
      </>
    );
  }

  notFound();
}
