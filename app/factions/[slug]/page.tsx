import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("name, description")
    .eq("slug", params.slug)
    .single();

  assertNoQueryErrors("/factions/[slug]", factionError);

  if (faction) {
    const { name, description } = faction;
    return {
      title: name + " in Warhammer 40,000 2nd Edition | 2ed1993",
      description,
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select(
      `slug, name, description, images(file_name, artist, title), army_lists(id, name, unit_categories(category, position, units(id, name)), wargear_categories(category, note, wargear_items(id, points, armour(name), weapons(name))))`,
    )
    .eq("slug", params.slug)
    .order("name", { referencedTable: "army_lists" })
    .order("position", { referencedTable: "army_lists.unit_categories" })
    .order("id", { referencedTable: "army_lists.wargear_categories" })
    .order("points", {
      referencedTable: "army_lists.wargear_categories.wargear_items",
    })
    .single();

  assertNoQueryErrors("/factions/[slug]", factionError);

  if (faction) {
    const heros = faction.images.slice(0, 2);

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
        <main
          id="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              {faction.name}
            </h1>
          </header>
          {heros.length === 1 ? (
            <ImageWithCredit
              key={heros[0].file_name}
              src={`images/${heros[0].file_name}`}
              title={heros[0].title}
              artist={heros[0].artist}
              width="half-from-md"
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
          <section className="flex flex-col gap-8">
            <h2 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Army Lists
            </h2>
            <nav className="ordered-list">
              <ol className="flex flex-col gap-2 text-2xl">
                {faction.army_lists.map((list) => {
                  const href = `/factions/${faction.slug}#${generateAnchorId(list.name)}`;

                  return (
                    <li key={list.id}>
                      <Link
                        className="font-subtitle hover:underline underline-offset-4"
                        href={href}
                      >
                        {list.name}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </nav>
            {faction.army_lists.map((list) => {
              const listId = generateAnchorId(list.name);

              return (
                <section
                  id={listId}
                  key={listId}
                  className="flex flex-col gap-4"
                >
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h3 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      {list.name}
                    </h3>
                  </div>
                  {Boolean(list.unit_categories.length) && (
                    <>
                      <h3 className="font-subtitle text-3xl">Units</h3>
                      <ul className="md:columns-2 gap-8 [&>*:nth-child(n+2)]:mt-4">
                        {list.unit_categories.map((section) => (
                          <li
                            key={section.category}
                            className="flex flex-col gap-2 break-inside-avoid-column"
                          >
                            <h4 className="font-subtitle text-2xl capitalize">
                              {section.category}
                            </h4>
                            <ul>
                              {section.units.map((unit) => (
                                <li
                                  key={unit.id}
                                  className="flex items-baseline gap-2 text-lg"
                                >
                                  <h5 className="font-subtitle text-xl">
                                    {unit.name}
                                  </h5>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {Boolean(list.wargear_categories.length) && (
                    <>
                      <h3 className="font-subtitle text-3xl">Equipment</h3>
                      <ul className="md:columns-3 gap-8 [&>*:nth-child(n+2)]:mt-4">
                        {list.wargear_categories.map((section) => (
                          <li
                            key={section.category}
                            className="flex flex-col gap-2 break-inside-avoid-column"
                          >
                            <h4 className="font-subtitle text-2xl capitalize">
                              {section.category}
                            </h4>
                            <p>{section.note}</p>
                            <ul>
                              {section.wargear_items.map((item) => {
                                if (item.armour) {
                                  return (
                                    <li
                                      key={item.id}
                                      className="flex items-baseline gap-2 text-lg"
                                    >
                                      <Link
                                        href={`/wargear/armour#${generateAnchorId(item.armour.name)}`}
                                        className="whitespace-nowrap underline underline-offset-4"
                                      >
                                        {item.armour.name}
                                      </Link>
                                      <span
                                        className="flex-1 border-b-2 border-dotted border-black"
                                        aria-hidden="true"
                                      />
                                      <span className="whitespace-nowrap">
                                        {item.points}
                                        {item.points === 1 ? "pt" : "pts"}
                                      </span>
                                    </li>
                                  );
                                }

                                if (item.weapons) {
                                  return (
                                    <li
                                      key={item.id}
                                      className="flex items-baseline gap-2 text-lg"
                                    >
                                      <Link
                                        href={`/wargear/weapons#${generateAnchorId(item.weapons.name)}`}
                                        className="whitespace-nowrap underline underline-offset-4"
                                      >
                                        {item.weapons.name}
                                      </Link>
                                      <span
                                        className="flex-1 border-b-2 border-dotted border-black"
                                        aria-hidden="true"
                                      />
                                      <span className="whitespace-nowrap">
                                        {item.points}
                                        {item.points === 1 ? "pt" : "pts"}
                                      </span>
                                    </li>
                                  );
                                }

                                return <></>;
                              })}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>
              );
            })}
          </section>
        </main>
      </>
    );
  }

  notFound();
}
