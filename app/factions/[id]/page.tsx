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
    .select(`name, description, images(file_name, artist, title)`)
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

          <section className="grid grid-cols-2 gap-4">
            <ImageWithCredit
              src={heroImage}
              width={960}
              height={1280}
              title={hero.title}
              artist={hero.artist}
            />
            <div className="flex flex-col gap-4">
              <p>{faction.description}</p>
              <div className="flex flex-col items-center justify-center grow">
                <_2ed1993 grayscale />
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }
}
