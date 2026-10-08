import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CardFace, wargearCardPoints } from "@/components/CardFace";
import { Highlighter } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { TitleBand } from "@/components/TitleBand";
import { facetHref } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Wargear Cards"),
    description:
      "The Wargear cards of Warhammer 40,000 2nd Edition, with points value, rarity, restrictions and the weapon or armour profile where a card has one.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: cards, error: cardsError },
    { data: availabilityRows, error: availabilityError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "wargear-cards")
      .maybeSingle(),
    supabase
      .from("wargear_cards")
      .select(
        "id, name, rarity, points, restriction, discard_after_use, description, wargear_cards_availabilities(availabilities(name, position)), wargear_cards_weapons(position, weapons(name, weapon_categories(name), profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), wargear_cards_armour(position, armour(name, profile_description, armour_profiles(save, condition), armour_special_rules(name)))",
      )
      .order("name")
      .order("position", { referencedTable: "wargear_cards_weapons" })
      .order("position", {
        referencedTable: "wargear_cards_weapons.weapons.weapon_profiles",
      })
      .order("position", { referencedTable: "wargear_cards_armour" }),
    supabase.from("availabilities").select("name").order("position"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/wargear/wargear-cards",
    heroImageError,
    cardsError,
    availabilityError,
  );

  if (cards && availabilityRows) {
    const jumpItems = [
      { id: facetHref("").slice(1), label: "All" },
      ...availabilityRows.map(({ name }) => ({
        id: facetHref(name).slice(1),
        label: name,
      })),
    ];

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
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col w-full max-w-5xl">
            <TitleBand
              title="Wargear Cards"
              eyebrow={`Wargear \u00b7 ${cards.length} cards`}
              className="border-b-0"
              image={
                hero && {
                  src: `images/${hero.file_name}`,
                  title: hero.title,
                  artist: hero.artist,
                  dimensions: dimensionsOf(hero),
                }
              }
            />
          </Panel>
          <JumpBar
            className="self-stretch -mx-2 md:-mx-4"
            items={jumpItems}
            label="Available to"
          >
            <RowFilter
              label="Filter"
              unit="cards"
              total={cards.length}
              placeholder="e.g. force sword, psycannon"
              facetAttribute="availability"
            />
          </JumpBar>
          <Panel className="flex flex-col gap-4 w-full max-w-5xl p-4 md:p-8">
            <section className="grid md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <CardFace
                  key={card.id}
                  deck="wargear"
                  card={{
                    name: card.name,
                    points: wargearCardPoints(card.points),
                    rarity: card.rarity,
                    restriction: card.restriction,
                    discard_after_use: card.discard_after_use,
                    description: card.description,
                    availabilities: card.wargear_cards_availabilities.map(
                      ({ availabilities }) => availabilities,
                    ),
                    weapons: card.wargear_cards_weapons.map(
                      ({ weapons }) => weapons,
                    ),
                    armour: card.wargear_cards_armour.map(
                      ({ armour }) => armour,
                    ),
                  }}
                />
              ))}
            </section>
            <p
              data-empty
              hidden
              className="p-6 border-4 border-black bg-2ed-light-green text-2ed-black text-lg"
            >
              Nothing matches that filter.
            </p>
          </Panel>
        </main>
      </>
    );
  }

  throw new Error("/wargear/wargear-cards: rendered with no data");
}
