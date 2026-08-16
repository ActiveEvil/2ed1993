import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import type { Image } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Factions | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Factions.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "factions")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: factions, error: factionsError } = await supabase
    .from("factions")
    .select("slug, name, images(file_name, artist, title)")
    .order("name");

  assertNoQueryErrors("/factions", heroImageError, factionsError);

  if (hero && factions) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Factions",
            },
          ]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Factions
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <div className="grid md:grid-cols-2 gap-4">
            {factions.map(({ slug, name, images }) => {
              const image: Image | undefined = images[0] && {
                src: `images/${images[0].file_name}`,
                title: images[0].title,
                artist: images[0].artist,
              };
              return (
                <ImageCard
                  key={slug}
                  href={`/rules/${slug}`}
                  title={name}
                  image={image}
                />
              );
            })}
          </div>
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              {factions.map(({ slug, name }) => (
                <li key={slug}>
                  <Link
                    className="font-subtitle hover:underline underline-offset-4"
                    href={`/factions/${slug}`}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </Panel>
      </>
    );
  }

  throw new Error("/factions: rendered with no data");
}
