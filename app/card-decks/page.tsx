import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentsRow, ContentsTable } from "@/components/ContentsTable";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
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
    title: pageTitle("Card Decks"),
    description:
      "The card decks used in Warhammer 40,000 2nd Edition: Mission cards, Strategy cards, psychic power cards and Special Warp cards.",
  };
}

const unique = (names: string[]) => [...new Set(names)];

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: missionRows, error: missionError },
    { data: strategyRows, error: strategyError },
    { data: psychicRows, error: psychicError },
    { data: warpRows, error: warpError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "card-decks")
      .single(),
    supabase.from("mission_cards").select("origin").order("id"),
    supabase.from("strategy_cards").select("origin").order("id"),
    supabase.from("psychic_power_cards").select("deck").order("id"),
    supabase.from("special_warp_cards").select("id"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/card-decks",
    heroImageError,
    missionError,
    strategyError,
    psychicError,
    warpError,
  );

  if (hero && missionRows && strategyRows && psychicRows && warpRows) {
    const groups: Record<string, string[]> = {
      "mission-cards": unique(missionRows.map(({ origin }) => origin)),
      "strategy-cards": unique(strategyRows.map(({ origin }) => origin)),
      "psychic-power-cards": unique(psychicRows.map(({ deck }) => deck)),
      "special-warp-cards": [],
    };
    const total =
      missionRows.length +
      strategyRows.length +
      psychicRows.length +
      warpRows.length;
    const deckCount = DECKS.length === 1 ? "1 deck" : `${DECKS.length} decks`;
    const cardCount = total === 1 ? "1 card" : `${total} cards`;

    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Card Decks" }]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Card Decks"
            eyebrow={`${deckCount} \u00b7 ${cardCount}`}
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          />
          <section className="group flex flex-col">
            <SectionBar as="h2" title="Contents" />
            <ContentsTable>
              {DECKS.map(({ slug, name, ruleName, ruleHref }, index) => (
                <ContentsRow
                  key={slug}
                  number={index + 1}
                  title={name}
                  href={`/card-decks/${slug}`}
                  items={[
                    ...groups[slug].map((group) => ({
                      name: group,
                      href: `/card-decks/${slug}#${generateAnchorId(group)}`,
                    })),
                    { label: "Rules:", name: ruleName, href: ruleHref },
                  ]}
                />
              ))}
            </ContentsTable>
          </section>
        </Panel>
      </>
    );
  }

  throw new Error("/card-decks: rendered with no data");
}
