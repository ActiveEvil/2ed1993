import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { supabase } from "@/lib/supabase";
import slugify from "@sindresorhus/slugify";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Card Decks | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Card Decks.",
  };
}

export default async function Page() {
  const { data: hero } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .eq("id", 29)
    .single();

  if (hero) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Card Decks",
            },
          ]}
        />
        <main className="flex flex-col justify-center  gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Card Decks
            </h1>
          </header>
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              <li>
                <Link
                  className="font-subtitle hover:underline underline-offset-4"
                  href="/card-decks/mission-cards"
                >
                  Mission Cards
                </Link>
              </li>
              <li>
                <Link
                  className="font-subtitle hover:underline underline-offset-4"
                  href="/card-decks/strategy-cards"
                >
                  Strategy Cards
                </Link>
              </li>
              <li>
                <Link
                  className="font-subtitle hover:underline underline-offset-4"
                  href="/card-decks/psychic-power-cards"
                >
                  Psychic Power Cards
                </Link>
              </li>
              <li>
                <Link
                  className="font-subtitle hover:underline underline-offset-4"
                  href="/card-decks/special-warp-cards"
                >
                  Special Warp Cards
                </Link>
              </li>
            </ol>
          </nav>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
        </main>
      </>
    );
  }
}
