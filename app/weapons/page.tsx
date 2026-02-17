import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 Secomnd Edition Weapons | 2ed1993",
    description: "Warhammer 40,000 Secomnd Edition Weapons.",
  };
}

export default async function Page() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );

  const { data: hero } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .eq("id", 6)
    .single();

  const { data: weapons } = await supabase
    .from("weapons")
    .select(
      "id, name, category, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration)",
    )
    .order("name");

  if (hero && weapons) {
    const heroImage = supabase.storage
      .from("images")
      .getPublicUrl(hero.file_name, {
        transform: {
          width: 1280,
          height: 720,
          quality: 100,
        },
      }).data.publicUrl;

    const categories = new Map<string, typeof weapons>();

    for (const item of weapons) {
      const bucket = categories.get(item.category) ?? [];
      bucket.push(item);
      categories.set(item.category, bucket);
    }

    const weaponCategories = Array.from(categories.entries())
      .map(([category, items]) => ({
        category,
        items,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));

    return (
      <>
        <Highlighter />
        <div className="flex gap-2 w-full max-w-5xl">
          <Link
            className="font-subtitle text-lg hover:underline underline-offset-4"
            href="/"
          >
            2ed1993
          </Link>
          &gt;
          <span className="font-subtitle text-lg">Weapons</span>
        </div>
        <main className="flex flex-col justify-center  gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black">
          <header>
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              Weapons
            </h1>
          </header>

          <ImageWithCredit
            src={heroImage}
            width={1280}
            height={720}
            title={hero.title}
            artist={hero.artist}
          />

          {!!weaponCategories.length && (
            <section className="flex flex-col gap-4">
              {weaponCategories.map((section) => {
                const categoryId = section.category.split(" ").join("_");

                return (
                  <div
                    key={categoryId}
                    id={categoryId}
                    className="flex flex-col gap-4"
                  >
                    <h3 className="font-subtitle text-2xl capitalize">
                      {section.category} Weapons
                    </h3>
                    <section className="relative overflow-x-auto">
                      <table className="relative w-full min-w-max table-auto bg-black border-collapse border-2 border-black text-center">
                        <thead className=" bg-black font-subtitle text-sm text-white">
                          <tr>
                            <th scope="col" rowSpan={2} className="p-2">
                              Weapon
                            </th>
                            {categoryId !== "Close_combat" && (
                              <>
                                <th
                                  scope="colgroup"
                                  colSpan={2}
                                  className="pt-2  px-2"
                                >
                                  Range
                                </th>
                                <th
                                  scope="colgroup"
                                  colSpan={2}
                                  className="pt-2 px-2"
                                >
                                  To Hit
                                </th>
                              </>
                            )}
                            <th
                              scope="col"
                              rowSpan={2}
                              className="p-2 max-w-24"
                            >
                              Strength
                            </th>
                            <th
                              scope="col"
                              rowSpan={2}
                              className="p-2 max-w-24"
                            >
                              Damage
                            </th>
                            <th
                              scope="col"
                              rowSpan={2}
                              className="p-2 max-w-24"
                            >
                              Save Modifier
                            </th>
                            <th
                              scope="col"
                              rowSpan={2}
                              className="p-2 max-w-24"
                            >
                              Armour Penetration
                            </th>
                          </tr>
                          {categoryId !== "Close_combat" && (
                            <tr>
                              <th scope="col" className="pb-2 px-2 max-w-24">
                                Short
                              </th>
                              <th scope="col" className="pb-2 px-2 max-w-24">
                                Long
                              </th>
                              <th scope="col" className="pb-2 px-2 max-w-24">
                                Short
                              </th>
                              <th scope="col" className="pb-2 px-2 max-w-24">
                                Long
                              </th>
                            </tr>
                          )}
                        </thead>
                        {section.items.map((item) => {
                          const weaponId = item.name.split(" ").join("_");

                          return (
                            <tbody
                              key={`${weaponId}`}
                              id={`${weaponId}`}
                              className="bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black target:font-bold text-lg font-semibold"
                            >
                              {item.weapon_profiles.length > 1 && (
                                <tr>
                                  <th
                                    colSpan={9}
                                    className="pt-2 pl-4 text-left whitespace-nowrap"
                                  >
                                    {item.name}
                                  </th>
                                </tr>
                              )}
                              {item.weapon_profiles.map((profile, index) => (
                                <tr key={`${weaponId}_${index}`}>
                                  <th
                                    scope="row"
                                    className={clsx({
                                      "py-2 pl-4 text-left whitespace-nowrap": true,
                                      "pl-8": !!profile.name,
                                    })}
                                  >
                                    {profile.name || item.name}
                                  </th>
                                  {categoryId !== "Close_combat" && (
                                    <>
                                      <td className="py-2 max-w-24">
                                        {profile.short_range}
                                      </td>
                                      <td
                                        className={clsx({
                                          "py-2 max-w-24": true,
                                          "text-sm":
                                            profile.long_range.length > 8,
                                        })}
                                      >
                                        {profile.long_range}
                                      </td>
                                      <td className="py-2 max-w-24">
                                        {profile.short_to_hit}
                                      </td>
                                      <td className="py-2 max-w-24">
                                        {profile.long_to_hit}
                                      </td>
                                    </>
                                  )}
                                  <td className="py-2 max-w-24">
                                    {profile.strength}
                                  </td>
                                  <td className="py-2 max-w-24">
                                    {profile.damage}
                                  </td>
                                  <td className="py-2 max-w-24">
                                    {profile.save_modifier}
                                  </td>
                                  <td className="py-2 max-w-24">
                                    {profile.armour_penetration}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          );
                        })}
                      </table>
                    </section>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </>
    );
  }
}
