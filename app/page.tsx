import { ImageWithCredit } from "@/components/Image";
import { Oldhammer, _2ed1993 } from "@/components/Logos";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function Page() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );

  const { data: hero } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .eq("id", 1)
    .single();

  const { data: factions } = await supabase
    .from("factions")
    .select("id, name")
    .order("name");

  if (hero && factions) {
    const heroImage = supabase.storage
      .from("images")
      .getPublicUrl(hero.file_name, {
        transform: {
          width: 1024,
          height: 722,
          quality: 100,
        },
      }).data.publicUrl;

    return (
      <>
        <div className="w-full max-w-5xl">
          <span className="font-subtitle text-lg">2ed1993</span>
        </div>
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black">
          <header className="flex items-center justify-center">
            <Oldhammer />
          </header>
          <section className="w-full text-xl">
            <p>
              The 2ed1993 project aims to maintain a digital record of the 2nd
              Edition of Warhammer 40,000.
            </p>
            <p>The site is currently a work in progress...</p>
          </section>
          <section>
            <ul className="">
              <li className="">
                <Link
                  className="font-title text-3xl text-center uppercase hover:underline underline-offset-4"
                  href="/factions"
                >
                  Factions
                </Link>
                <ul className="ml-4">
                  {factions.map(({ id, name }) => (
                    <li key={id}>
                      <Link
                        className="font-subtitle text-2xl capitalize hover:underline underline-offset-4"
                        href={`/factions/${id}`}
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="flex flex-col"></li>
              <li className="flex flex-col"></li>
            </ul>
          </section>
          <ImageWithCredit
            src={heroImage}
            width={1024}
            height={722}
            title={hero.title}
            artist={hero.artist}
          />
        </main>
      </>
    );
  }
}
