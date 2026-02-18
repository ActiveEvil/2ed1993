import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 Secomnd Edition Factions | 2ed1993",
    description: "Warhammer 40,000 Secomnd Edition Factions.",
  };
}

export default async function Page() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );

  const { data: hero } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .eq("id", 7)
    .single();

  if (hero) {
    const heroImage = supabase.storage
      .from("images")
      .getPublicUrl(hero.file_name, {
        transform: {
          width: 1280,
          height: 720,
          quality: 100,
        },
      }).data.publicUrl;

    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Wargear",
            },
          ]}
        />
        <main className="flex flex-col justify-center  gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              Wargear
            </h1>
          </header>

          <nav>
            <ul>
              <li>
                <Link
                  className="font-subtitle text-2xl hover:underline underline-offset-4"
                  href="/wargear/weapons"
                >
                  Weapons
                </Link>
              </li>
            </ul>
          </nav>
          <ImageWithCredit
            src={heroImage}
            width={1280}
            height={720}
            title={hero.title}
            artist={hero.artist}
          />
        </main>
      </>
    );
  }
}
