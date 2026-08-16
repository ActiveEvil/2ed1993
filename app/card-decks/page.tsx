import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IndexCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

const DECKS = [
  {
    slug: "mission-cards",
    name: "Mission Cards",
    ruleName: "Mission Cards",
    ruleHref: "/rules/general-rules#Mission_Cards",
  },
  {
    slug: "strategy-cards",
    name: "Strategy Cards",
    ruleName: "Strategy Cards",
    ruleHref: "/rules/general-rules#Strategy_Cards",
  },
  {
    slug: "psychic-power-cards",
    name: "Psychic Power Cards",
    ruleName: "Using Psychic Powers",
    ruleHref: "/rules/psychic#Using_Psychic_Powers",
  },
  {
    slug: "special-warp-cards",
    name: "Special Warp Cards",
    ruleName: "Warp Cards",
    ruleHref: "/rules/psychic#Warp_Cards",
  },
];

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Card Decks | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Card Decks.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "card-decks")
    .single();
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors("/card-decks", heroImageError);

  if (hero) {
    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Card Decks" }]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Card Decks
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <div className="grid md:grid-cols-2 gap-4">
            {DECKS.map((deck, index) => (
              <IndexCard
                key={deck.slug}
                href={`/card-decks/${deck.slug}`}
                title={`${index + 1}. ${deck.name}`}
              >
                <p className="text-lg">
                  Rules:{" "}
                  <Link
                    className="font-bold underline underline-offset-4"
                    href={deck.ruleHref}
                  >
                    {deck.ruleName}
                  </Link>
                </p>
              </IndexCard>
            ))}
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/card-decks: rendered with no data");
}
