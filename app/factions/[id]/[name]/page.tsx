import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { _2ed1993 } from "@/components/Logos";
import { Database } from "@/database.types";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export async function generateMetadata(props: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const params = await props.params;
  const { data: faction } = await supabase
    .from("factions")
    .select("name, description")
    .eq("id", params.id)
    .single();

  if (faction) {
    const { name, description } = faction;
    return {
      title: name + " in Warhammer 40,000 2nd Edition | 2ed1993",
      description,
    };
  }

  throw new Error("No data");
}

export default async function Page(props: {
  params: Promise<{ id: number; name: string }>;
}) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const params = await props.params;
  const { data: faction } = await supabase
    .from("factions")
    .select(
      `name, description, images(file_name, artist, title), army_lists(id, name, equipment_weapons(category, note, points, weapons(id, name)))`,
    )
    .eq("id", params.id)
    .order("name", { referencedTable: "army_lists" })
    .order("points", { referencedTable: "army_lists.equipment_weapons" })
    .single();

  if (faction) {
    if (slugify(faction.name) !== params.name) {
      notFound();
    }

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
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-5xl text-center">
              {faction.name}
            </h1>
          </header>
          <section className="grid md:grid-cols-2 gap-4">
            {heros.length === 1 ? (
              <ImageWithCredit
                key={heros[0].file_name}
                src={`images/${heros[0].file_name}`}
                title={heros[0].title}
                artist={heros[0].artist}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {heros.map((hero, index) => (
                  <div key={hero.file_name}>
                    <ImageWithCredit
                      src={`images/${hero.file_name}`}
                      title={hero.title}
                      artist={hero.artist}
                      aspect="aspect-portrait"
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="text-lg">{faction.description}</p>
          </section>
          <section className="flex flex-col gap-8">
            <h2 className="font-title uppercase tracking-wide text-5xl text-center">
              Army Lists
            </h2>
            <nav className="ordered-list">
              <ol className="flex flex-col gap-2 text-2xl">
                {faction.army_lists.map((list) => {
                  const href = `/factions/${params.id}/${slugify(faction.name)}#${list.name.split(" ").join("_")}`;

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
              const listId = list.name.split(" ").join("_");
              const categories = new Map<
                string,
                typeof list.equipment_weapons
              >();

              for (const item of list.equipment_weapons) {
                const bucket = categories.get(item.category) ?? [];
                bucket.push(item);
                categories.set(item.category, bucket);
              }

              const equipment = Array.from(categories.entries()).map(
                ([category, items]) => ({
                  category,
                  note: items.find((item) => !!item.note)?.note ?? null,
                  items,
                }),
              );

              return (
                <section
                  id={listId}
                  key={listId}
                  className="flex flex-col gap-4"
                >
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black" />
                    <h3 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      {list.name}
                    </h3>
                  </div>
                  {!!equipment.length && (
                    <>
                      <h3 className="font-subtitle text-3xl">Equipment</h3>
                      <section className="grid md:grid-cols-2 gap-8">
                        {equipment.map((section) => (
                          <div
                            key={section.category}
                            className="flex flex-col gap-4"
                          >
                            <h4 className="font-subtitle text-2xl capitalize">
                              {section.category}
                            </h4>
                            <p>{section.note}</p>
                            <ul>
                              {section.items.map((item) => (
                                <li
                                  key={item.weapons.id}
                                  className="flex items-baseline gap-2 text-lg"
                                >
                                  <Link
                                    href={`/wargear/weapons#${item.weapons.name.split(" ").join("_")}`}
                                    className="whitespace-nowrap underline underline-offset-4"
                                  >
                                    {item.weapons.name}
                                  </Link>
                                  <span
                                    className="flex-1 border-b-2 border-dotted border-foreground"
                                    aria-hidden="true"
                                  />
                                  <span className="whitespace-nowrap">
                                    {item.points}pts
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
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
}
