import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { generateAnchorId } from "@/lib/anchors";
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

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "wargear")
    .single();
  const hero = heroImage?.images ?? null;

  // Ordered by the armour_categories enum, so the list matches the armour page.
  const { data: armourCategoryRows, error: armourCategoryError } =
    await supabase.from("armour").select("category").order("category");

  // Ordered by the weapon_categories enum, so the list matches the weapons page.
  const { data: weaponCategoryRows, error: weaponCategoryError } =
    await supabase.from("weapons").select("category").order("category");

  assertNoQueryErrors(
    "/wargear",
    heroImageError,
    armourCategoryError,
    weaponCategoryError,
  );

  if (hero && armourCategoryRows && weaponCategoryRows) {
    const weaponCategories = [
      ...new Set(weaponCategoryRows.map(({ category }) => category)),
    ];
    const armourCategories = [
      ...new Set(armourCategoryRows.map(({ category }) => category)),
    ];

    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Wargear",
            },
          ]}
        />
        <main className="flex flex-col justify-center  gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
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
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              <li>
                <Link
                  className="font-subtitle hover:underline underline-offset-4"
                  href="/wargear/weapons"
                >
                  Weapons
                </Link>
                <ol className="flex flex-col gap-2 text-xl">
                  {[
                    ...weaponCategories,
                    "General Weapon Special Rules",
                    "Unique Weapon Special Rules",
                  ].map((category) => {
                    const categoryId = generateAnchorId(category);

                    return (
                      <li key={categoryId}>
                        <Link
                          className="hover:underline underline-offset-4"
                          href={`/wargear/weapons#${categoryId}`}
                        >
                          {category}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </li>
              <li>
                <Link
                  className="font-subtitle hover:underline underline-offset-4"
                  href="/wargear/armour"
                >
                  Armour
                </Link>
                <ol className="flex flex-col gap-2 text-xl">
                  {[
                    ...armourCategories,
                    "General Armour Special Rules",
                    "Unique Armour Special Rules",
                  ].map((category) => {
                    const categoryId = generateAnchorId(category);

                    return (
                      <li key={categoryId}>
                        <Link
                          className="hover:underline underline-offset-4"
                          href={`/wargear/armour#${categoryId}`}
                        >
                          {category}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </li>
            </ol>
          </nav>
        </main>
      </>
    );
  }

  throw new Error("/wargear: rendered with no data");
}
