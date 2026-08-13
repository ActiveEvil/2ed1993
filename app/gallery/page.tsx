import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Gallery } from "@/components/Gallery";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Gallery | 2ed1993",
    description:
      "Miniatures I've painted, from my Warhammer 40,000 2nd Edition collection.",
  };
}

export default async function Page() {
  const { data: galleryImages, error: galleryImagesError } = await supabase
    .from("image_galleries")
    .select("images(file_name, title, width, height)")
    .eq("name", "model-showcase")
    .order("position");
  const gallery = galleryImages?.map(({ images }) => images);

  assertNoQueryErrors("/gallery", galleryImagesError);

  if (gallery && gallery.length > 0) {
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
        <main
          id="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Gallery
            </h1>
          </header>
          <section className="flex flex-col gap-4 w-full text-center text-xl">
            <p>
              Miniatures I&apos;ve painted, from my Warhammer 40,000 2nd Edition
              collection.
            </p>
          </section>
          <Gallery images={gallery} aspect="aspect-square" />
        </main>
      </>
    );
  }

  throw new Error("/gallery: rendered with no data");
}
