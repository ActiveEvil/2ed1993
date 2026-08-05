import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Wargear Cards | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Wargear Cards.",
  };
}

export default async function Page() {
  const { data: heroImage } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "wargear-cards")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: cards, error: cardsError } = await supabase
    .from("wargear_cards")
    .select(
      "id, name, availability, rarity, points, restriction, discard_after_use, description, weapons(name, category), armour(name, category)",
    )
    .order("availability")
    .order("name");

  assertNoQueryErrors("/wargear/wargear-cards", cardsError);

  if (cards) {
    const availabilities = new Map<string, typeof cards>();

    for (const card of cards) {
      const bucket = availabilities.get(card.availability) ?? [];
      bucket.push(card);
      availabilities.set(card.availability, bucket);
    }

    const sections = Array.from(availabilities.entries()).map(
      ([availability, items]) => ({ availability, items }),
    );

    return (
      <>
        <Highlighter />
        <Breadcrumbs
          crumbs={[
            { href: "/", anchor: "2ed1993" },
            { href: "/wargear", anchor: "Wargear" },
            { anchor: "Wargear Cards" },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Wargear Cards
            </h1>
          </header>
          {hero && (
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          )}
          {sections.map((section) => {
            const sectionId = generateAnchorId(section.availability);

            return (
              <section
                id={sectionId}
                key={sectionId}
                className="flex flex-col gap-4"
              >
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    {section.availability}
                  </h2>
                </div>
                <section className="grid md:grid-cols-2 gap-4">
                  {section.items.map((card) => {
                    const cardId = generateAnchorId(card.name);
                    const item = card.weapons ?? card.armour ?? null;
                    const href = card.weapons
                      ? `/wargear/weapons#${generateAnchorId(card.weapons.name)}`
                      : card.armour
                        ? `/wargear/armour#${generateAnchorId(card.armour.name)}`
                        : null;

                    return (
                      <div
                        key={cardId}
                        id={cardId}
                        className="flex flex-col justify-start gap-2 p-4 border-4 border-black bg-2ed-dark-blue target:border-2ed-light-yellow shadow-xl"
                      >
                        <div className="flex justify-between items-baseline gap-4 w-full">
                          <HighlighterLink
                            className="font-subtitle uppercase text-2xl text-2ed-white hover:underline underline-offset-4"
                            href={`/wargear/wargear-cards#${cardId}`}
                          >
                            {card.name}
                          </HighlighterLink>
                          <span className="font-subtitle whitespace-nowrap text-lg text-2ed-light-yellow">
                            {card.points ? `${card.points} Points` : "Special"}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start gap-4 p-4 h-full bg-2ed-white text-2ed-black">
                          {card.description ? (
                            <div
                              className="dynamic-content flex flex-col gap-2"
                              dangerouslySetInnerHTML={{
                                __html: card.description,
                              }}
                            />
                          ) : (
                            item &&
                            href && (
                              <p className="dynamic-content">
                                The rules for this card are published with{" "}
                                <Link
                                  className="underline underline-offset-4"
                                  href={href}
                                >
                                  {item.name}
                                </Link>
                                .
                              </p>
                            )
                          )}
                          {(card.restriction || card.discard_after_use) && (
                            <p className="mt-auto font-subtitle uppercase text-2ed-dark-red text-center">
                              {[
                                card.restriction,
                                card.discard_after_use
                                  ? "Discard after use"
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <p className="w-full text-sm text-2ed-white">
                          {card.rarity}
                        </p>
                      </div>
                    );
                  })}
                </section>
              </section>
            );
          })}
        </main>
      </>
    );
  }

  throw new Error("/wargear/wargear-cards: rendered with no data");
}
