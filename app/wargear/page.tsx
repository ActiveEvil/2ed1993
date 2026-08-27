import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IndexCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { facetHref, generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Wargear | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Wargear.",
  };
}

const anchorHref = (item: string) => `#${generateAnchorId(item)}`;

const SectionList: React.FC<{
  href: string;
  items: string[];
  fragment?: (item: string) => string;
}> = ({ href, items, fragment = anchorHref }): React.JSX.Element => (
  <ol className="pl-6 text-lg list-decimal">
    {items.map((item) => (
      <li key={item}>
        <Link
          className="hover:underline underline-offset-4"
          href={`${href}${fragment(item)}`}
        >
          {item}
        </Link>
      </li>
    ))}
  </ol>
);

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: armourCategoryRows, error: armourCategoryError },
    { data: availabilityRows, error: availabilityError },
    { data: weaponCategoryRows, error: weaponCategoryError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title)")
      .eq("slug", "wargear")
      .single(),
    supabase.from("armour_categories").select("name").order("position"),
    supabase.from("availabilities").select("name").order("position"),
    supabase.from("weapon_categories").select("name").order("position"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/wargear",
    heroImageError,
    armourCategoryError,
    availabilityError,
    weaponCategoryError,
  );

  if (hero && armourCategoryRows && availabilityRows && weaponCategoryRows) {
    const weaponCategories = weaponCategoryRows.map(({ name }) => name);
    const armourCategories = armourCategoryRows.map(({ name }) => name);
    const availabilities = availabilityRows.map(({ name }) => name);

    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Wargear" }]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Wargear
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <div className="grid md:grid-cols-3 gap-4">
            <IndexCard href="/wargear/weapons" title="1. Weapons">
              <SectionList
                href="/wargear/weapons"
                items={[
                  ...weaponCategories,
                  "General Weapon Special Rules",
                  "Unique Weapon Special Rules",
                ]}
              />
            </IndexCard>
            <IndexCard href="/wargear/armour" title="2. Armour">
              <SectionList
                href="/wargear/armour"
                items={[
                  ...armourCategories,
                  "General Armour Special Rules",
                  "Unique Armour Special Rules",
                ]}
              />
            </IndexCard>
            <IndexCard href="/wargear/wargear-cards" title="3. Wargear Cards">
              <SectionList
                href="/wargear/wargear-cards"
                items={availabilities}
                fragment={facetHref}
              />
            </IndexCard>
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/wargear: rendered with no data");
}
