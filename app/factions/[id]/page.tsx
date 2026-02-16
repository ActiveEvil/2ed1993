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
      title: name + " in Warhammer 40,000 Secomnd Edition | 2ed1993",
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
    const heroImage = supabase.storage
      .from("images")
      .getPublicUrl(hero.file_name, {
        transform: {
          width: 960,
          height: 1280,
          quality: 100,
        },
      }).data.publicUrl;

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
        <div className="flex gap-2 w-full max-w-5xl">
          <Link
            className="font-subtitle text-lg hover:underline underline-offset-4"
            href="/"
          >
            2ed1993
          </Link>
          &gt;
          <Link
            className="font-subtitle text-lg hover:underline underline-offset-4"
            href="/factions"
          >
            Factions
          </Link>
          &gt;
          <span className="font-subtitle text-lg">{faction.name}</span>
        </div>
        <main className="flex flex-col justify-center  gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black">
          <header>
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              {faction.name}
            </h1>
          </header>

          <section className="grid md:grid-cols-2 gap-4">
            <ImageWithCredit
              src={heroImage}
              width={960}
              height={1280}
              title={hero.title}
              artist={hero.artist}
            />
            <div className="flex flex-col gap-4">
              <p>{faction.description}</p>
              <div className="flex flex-col items-center justify-center grow px-2 py-8 bg-black">
                <_2ed1993 grayscale />
              </div>
            </div>
          </section>
          {!!equipment.length && (
            <section className="flex flex-col gap-4">
              <h3 className="font-title text-3xl text-center uppercase">
                {faction.name} Equipment
              </h3>
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
                          className="flex items-baseline gap-2"
                        >
                          <span className="whitespace-nowrap">
                            {item.weapons.name}
                          </span>
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
