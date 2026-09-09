import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FactionCard } from "@/components/Cards";
import { ContentsTable } from "@/components/ContentsTable";
import type { Image } from "@/components/ImageWithCredit";
import { Logo } from "@/components/Logos";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { TitleBand } from "@/components/TitleBand";
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
    .select("id, name, parent_faction_id")
    .eq("slug", params.faction)
    .single();

  assertNoQueryErrors(CONTEXT, factionError);

  if (faction) {
    const title = pageTitle(faction.name);

    const { data: parent, error: parentError } =
      faction.parent_faction_id === null
        ? { data: null, error: null }
        : await supabase
            .from("factions")
            .select("name")
            .eq("id", faction.parent_faction_id)
            .single();

    assertNoQueryErrors(CONTEXT, parentError);

    if (
      faction.parent_faction_id !== null &&
      parent?.name === "Space Marines"
    ) {
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
      `id, slug, name, description, army_lists(id, name, slug, unit_categories(category), wargear_categories(category, wargear_items(id)))`,
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
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            eyebrow="Factions"
            heading={<Logo as="h1" size="lg" title={faction.name} />}
          >
            <section
              className="dynamic-content measure flex flex-col gap-4"
              dangerouslySetInnerHTML={{ __html: faction.description }}
            />
          </TitleBand>
          {Boolean(lists.length) && (
            <section className="group flex flex-col">
              <SectionBar as="h2" title="Army Lists" />
              <ContentsTable as="ul">
                {lists.map(({ id, name, href, sections }) => (
                  <li
                    key={id}
                    className="flex flex-col md:flex-row gap-2 md:gap-8 px-4 md:px-8 py-4"
                  >
                    <h3 className="md:w-56 shrink-0 font-subtitle text-lg leading-tight">
                      <Link
                        className="hover:underline underline-offset-4"
                        href={href}
                      >
                        {name}
                      </Link>
                    </h3>
                    {sections.length ? (
                      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-base">
                        {sections.map((section) => (
                          <li key={section} className="capitalize">
                            <Link
                              className="underline underline-offset-4"
                              href={`${href}#${generateAnchorId(section)}`}
                            >
                              {section}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm">Not yet transcribed.</p>
                    )}
                  </li>
                ))}
              </ContentsTable>
            </section>
          )}
          {Boolean(subfactions?.length) && (
            <section className="flex flex-col">
              <SectionBar as="h2" title="Subfactions" />
              <div className="grid md:grid-cols-2 gap-4 p-4 md:p-8">
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
                      as="h3"
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
