import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Page Not Found | 2ed1993",
  description: "This page does not exist in the record.",
};

export default async function Page() {
  const { data: heroImages } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "not-found")
    .order("position");
  const heros = heroImages?.map(({ images }) => images) ?? [];

  if (heros) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "404",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Lost in the Warp
            </h1>
          </header>

          <section className="flex flex-col gap-4 w-full text-xl">
            <p>
              This page does not exist in the record&mdash;or has not been
              documented yet.
            </p>
            <p>
              You may be looking for the{" "}
              <Link className="underline underline-offset-4" href="/rules">
                Rules
              </Link>
              ,{" "}
              <Link className="underline underline-offset-4" href="/wargear">
                Wargear
              </Link>
              , or{" "}
              <Link className="underline underline-offset-4" href="/card-decks">
                Card Decks
              </Link>{" "}
              sections. Otherwise, return to the{" "}
              <Link className="underline underline-offset-4" href="/">
                home page
              </Link>
              .
            </p>
          </section>

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
        </main>
      </>
    );
  }
}
