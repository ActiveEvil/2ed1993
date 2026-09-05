import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { clsx } from "clsx";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Special Warp Cards"),
    description:
      "The Special Warp cards of Warhammer 40,000 2nd Edition, played to nullify, reflect or destroy an enemy psychic power, or to force a psychic duel.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "special-warp-cards")
    .single();
  const hero = heroImage?.images ?? null;
  const { data: special_warp_cards, error: specialWarpCardsError } =
    await supabase
      .from("special_warp_cards")
      .select("id, name, description")
      .order("id");

  assertNoQueryErrors(
    "/card-decks/special-warp-cards",
    heroImageError,
    specialWarpCardsError,
  );

  if (hero && special_warp_cards) {
    return (
      <>
        <Highlighter />
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/card-decks",
              anchor: "Card Decks",
            },
            {
              anchor: "Special Warp Cards",
            },
          ]}
        />
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                Special Warp Cards
              </h1>
            </header>
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
            <section className="border-4 border-black">
              <SectionBar
                title="The deck"
                note={`${special_warp_cards.length} cards`}
              />
              <div className="flex flex-wrap gap-2 p-3">
                {special_warp_cards.map((card) => (
                  <a
                    key={generateAnchorId(card.name)}
                    href={`#${generateAnchorId(card.name)}`}
                    className={CHIP_CLASS}
                  >
                    {card.name}
                  </a>
                ))}
              </div>
            </section>
          </Panel>
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <section className="grid md:grid-cols-2 gap-4">
              {special_warp_cards.map((card) => {
                const cardId = generateAnchorId(card.name);

                return (
                  <div
                    key={cardId}
                    id={cardId}
                    className={clsx(
                      "flex flex-col justify-start items-center gap-2 p-4 bg-2ed-mid-blue border-4 border-black target:border-2ed-light-yellow shadow-xl",
                    )}
                  >
                    <div className="flex flex-col justify-start items-center gap-4 p-4 h-full bg-card-face text-2ed-black">
                      <h3 className="font-title uppercase text-2xl text-2ed-mid-blue text-center">
                        {card.name}
                      </h3>
                      <p
                        className="text-lg"
                        dangerouslySetInnerHTML={{ __html: card.description }}
                      />
                    </div>
                  </div>
                );
              })}
            </section>
          </Panel>
        </main>
      </>
    );
  }

  throw new Error("/card-decks/special-warp-cards: rendered with no data");
}
