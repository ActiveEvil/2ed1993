import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentsRow, ContentsTable } from "@/components/ContentsTable";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { TitleBand } from "@/components/TitleBand";
import { facetHref, generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Wargear"),
    description:
      "The weapons, armour and Wargear cards of Warhammer 40,000 2nd Edition, with profiles, points values and the special rules attached to each.",
  };
}

const anchorHref = (item: string) => `#${generateAnchorId(item)}`;

const items = (
  href: string,
  names: string[],
  fragment: (name: string) => string = anchorHref,
) => names.map((name) => ({ name, href: `${href}${fragment(name)}` }));

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: armourCategoryRows, error: armourCategoryError },
    { data: availabilityRows, error: availabilityError },
    { data: weaponCategoryRows, error: weaponCategoryError },
    { count: weaponTotal, error: weaponTotalError },
    { count: armourTotal, error: armourTotalError },
    { count: cardTotal, error: cardTotalError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "wargear")
      .single(),
    supabase.from("armour_categories").select("name").order("position"),
    supabase.from("availabilities").select("name").order("position"),
    supabase.from("weapon_categories").select("name").order("position"),
    supabase.from("weapons").select("*", { count: "exact", head: true }),
    supabase.from("armour").select("*", { count: "exact", head: true }),
    supabase.from("wargear_cards").select("*", { count: "exact", head: true }),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/wargear",
    heroImageError,
    armourCategoryError,
    availabilityError,
    weaponCategoryError,
    weaponTotalError,
    armourTotalError,
    cardTotalError,
  );

  if (hero && armourCategoryRows && availabilityRows && weaponCategoryRows) {
    const weaponCategories = weaponCategoryRows.map(({ name }) => name);
    const armourCategories = armourCategoryRows.map(({ name }) => name);
    const availabilities = availabilityRows.map(({ name }) => name);
    const weapons = weaponTotal ?? 0;
    const armour = armourTotal ?? 0;
    const cards = cardTotal ?? 0;
    const weaponCount = weapons === 1 ? "1 weapon" : `${weapons} weapons`;
    const armourCount =
      armour === 1 ? "1 armour type" : `${armour} armour types`;
    const cardCount = cards === 1 ? "1 card" : `${cards} cards`;

    const sections = [
      {
        title: "Weapons",
        href: "/wargear/weapons",
        items: items("/wargear/weapons", [
          ...weaponCategories,
          "General Weapon Special Rules",
          "Unique Weapon Special Rules",
        ]),
      },
      {
        title: "Armour",
        href: "/wargear/armour",
        items: items("/wargear/armour", [
          ...armourCategories,
          "General Armour Special Rules",
          "Unique Armour Special Rules",
        ]),
      },
      {
        title: "Wargear Cards",
        href: "/wargear/wargear-cards",
        items: items("/wargear/wargear-cards", availabilities, facetHref),
      },
    ];

    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Wargear" }]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Wargear"
            eyebrow={`${weaponCount} \u00b7 ${armourCount} \u00b7 ${cardCount}`}
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
              {sections.map(({ title, href, items }, index) => (
                <ContentsRow
                  key={href}
                  number={index + 1}
                  title={title}
                  href={href}
                  items={items}
                />
              ))}
            </ContentsTable>
          </section>
        </Panel>
      </>
    );
  }

  throw new Error("/wargear: rendered with no data");
}
