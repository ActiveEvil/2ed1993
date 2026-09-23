import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Gallery } from "@/components/Gallery";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Miniatures Gallery",
    description:
      "Miniatures I have painted from my Warhammer 40,000 2nd Edition collection, metal and plastic Citadel models of the period.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: galleryImages, error: galleryImagesError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "gallery")
      .single(),
    supabase
      .from("image_galleries")
      .select("images(file_name, title, width, height)")
      .eq("name", "model-showcase")
      .order("position"),
  ]);
  const hero = heroImage?.images ?? null;
  const gallery = galleryImages?.map(({ images }) => images);

  assertNoQueryErrors("/gallery", heroImageError, galleryImagesError);

  if (hero && gallery && gallery.length > 0) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Gallery",
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Gallery"
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          >
            <p className="max-w-prose text-lg">
              Miniatures I&apos;ve painted, from my Warhammer 40,000 2nd Edition
              collection.
            </p>
          </TitleBand>
          <div className="p-4 md:p-8">
            <Gallery images={gallery} aspect="aspect-square" />
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/gallery: rendered with no data");
}
