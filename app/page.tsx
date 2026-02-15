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
        <header className="flex flex-col justify-center items-center gap-8">
          <h1 className="inline-flex flex-col justify-center items-center px-4 border-2ed-yellow border-t-80 md:border-t-160 border-x-30 md:border-x-80 border-x-transparent font-title leading-0">
            <span className="inline-block -mt-[70px] md:-mt-[145px] p-2 md:p-4 bg-black text-3xl md:text-6xl text-2ed-yellow">
              <span className="text-5xl md:text-8xl align-text-top">O</span>
              LDHAMME
              <span className="text-5xl md:text-8xl align-text-top">R</span>
            </span>
            <span className="inline-block -mt-4 md:-mt-6 px-2 py-1 md:px-4 md:py-2 bg-2ed-yellow tracking-widest text-base md:text-3xl text-2ed-dark-red">
              40K 2nd Edition
            </span>
          </h1>
        </header>
        <section className="w-full">
          <p>2ed1993 </p>
        </section>
        <div className="relative w-full border-2 border-foreground">
          <Image
            src={heroImage}
            alt={`${hero.title} by ${hero.artist}`}
            width={1024}
            height={722}
            className="w-full h-auto"
          />
          <div className="absolute bottom-2 right-2 p-1 border-2 border-foreground bg-2ed-light-blue text-sm">
            <cite>{hero.title}</cite>, by {hero.artist}
          </div>
        </div>
      </>
    );
  }
}
