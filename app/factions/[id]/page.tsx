import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { _2ed1993 } from "@/components/Logos";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
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
    .select(`name, description`)
    .eq("id", params.id)
    .single();

  if (faction) {
    const { name, description } = faction;
    return {
      title: name + " in Warhammer 40,000 Second Edition | 2ed1993",
      description,
    };
  }

  throw new Error("No data");
}

export default async function Page(props: { params: Promise<{ id: number }> }) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const params = await props.params;
  const { data: faction } = await supabase
    .from("factions")
    .select(
      `name, description, images(file_name, artist, title), equipment_weapons(category, points, weapons(id, name))`,
    )
    .eq("id", params.id)
    .single();

  if (faction) {
    const [hero] = faction.images;
    const categories = new Map<string, typeof faction.equipment_weapons>();

    for (const item of faction.equipment_weapons) {
      const bucket = categories.get(item.category) ?? [];
      bucket.push(item);
      categories.set(item.category, bucket);
    }

    const equipment = Array.from(categories.entries()).map(
      ([category, items]) => ({
        category,
        items,
      }),
    );

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
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              {faction.name}
            </h1>
          </header>
          <section className="grid md:grid-cols-2 gap-4">
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
              aspect="aspect-portrait"
            />
            <div className="flex flex-col gap-4">
              <p className="text-lg">{faction.description}</p>
              <div className="flex flex-col justify-center items-center grow px-2 py-8 bg-black">
                <_2ed1993 grayscale />
              </div>
            </div>
          </section>
          {!!equipment.length && (
            <section className="flex flex-col gap-4">
              <h2 className="font-title text-3xl text-center uppercase">
                {faction.name} Equipment
              </h2>
              <section className="grid md:grid-cols-2 gap-8">
                {equipment.map((section) => (
                  <div key={section.category} className="flex flex-col gap-4">
                    <h3 className="font-subtitle text-2xl capitalize">
                      {section.category}
                    </h3>
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
            </section>
          )}
        </main>
      </>
    );
  }
}
