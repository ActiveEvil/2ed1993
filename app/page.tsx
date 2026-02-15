import { ImageWithCredit } from "@/components/Image";
import { Oldhammer } from "@/components/Logos";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

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

  if (hero) {
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
        <header>
          <Oldhammer />
        </header>
        <section className="w-full">
          <p className="text-lg">
            The 2ed1993 project aims to maintain a digital record of the 2nd
            Edition of Warhammer 40,000.
          </p>
          <p className="text-lg">The site is currently a work in progress...</p>
        </section>
        <ImageWithCredit
          src={heroImage}
          width={1024}
          height={722}
          title={hero.title}
          artist={hero.artist}
        />
      </>
    );
  }
}
