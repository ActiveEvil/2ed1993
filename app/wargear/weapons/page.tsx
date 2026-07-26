import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/Image";
import { supabase } from "@/lib/supabase";
import { clsx } from "clsx";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Weapons | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Weapons.",
  };
}

export default async function Page() {
  const { data: heroImage } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "weapons")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: weapons } = await supabase
    .from("weapons")
    .select(
      "id, name, category, profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name))",
    )
    .order("name");

  const { data: weaponSpecialRules } = await supabase
    .from("weapon_special_rules")
    .select("name, rule, rules(name, rule_categories(slug))")
    .order("name");

  if (hero && weapons && weaponSpecialRules) {
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
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/wargear",
              anchor: "Wargear",
            },
            {
              anchor: "Weapons",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl pt-4 md:pt-8 border-4 border-black shadow-lg">
          <header className="px-4 md:px-8">
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Weapons
            </h1>
          </header>
          <div className="px-4 md:px-8">
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          </div>
          {Boolean(weaponCategories.length) && (
            <section className="flex flex-col gap-4 pt-4 border-t-4 border-black">
              {weaponCategories.map((section) => {
                const categoryId = section.category.split(" ").join("_");

                return (
                  <div
                    key={categoryId}
                    id={categoryId}
                    className="flex flex-col gap-4"
                  >
                    <h2 className="px-4 md:px-8 font-subtitle text-3xl capitalize">
                      {section.category}
                    </h2>
                    <section className="relative overflow-x-auto">
                      <table className="relative w-full min-w-max table-auto bg-black border-collapse border-b-4 border-black text-center">
                        <thead className="bg-black font-subtitle text-sm text-white">
                          <tr>
                            <th
                              scope="col"
                              rowSpan={2}
                              className="p-2 text-left"
                            >
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
                            <th
                              scope="col"
                              rowSpan={2}
                              className="p-2 max-w-24"
                            >
                              Special
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
                              key={weaponId}
                              id={weaponId}
                              className="bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black target:font-bold text-lg font-semibold"
                            >
                              {item.weapon_profiles.length > 1 && (
                                <tr>
                                  <th
                                    colSpan={10}
                                    className="pt-2 px-2 text-left whitespace-nowrap"
                                  >
                                    <HighlighterLink
                                      className="hover:underline underline-offset-4"
                                      href={`/wargear/weapons#${weaponId}`}
                                    >
                                      {item.name}
                                    </HighlighterLink>
                                  </th>
                                </tr>
                              )}
                              {item.weapon_profiles.map((profile, index) => (
                                <tr key={`${weaponId}_${index}`}>
                                  <th
                                    scope="row"
                                    className={clsx({
                                      "p-2 text-left max-w-44": true,
                                      "pl-8": Boolean(profile.name),
                                    })}
                                  >
                                    <HighlighterLink
                                      className="hover:underline underline-offset-4 text-left"
                                      href={`/wargear/weapons#${weaponId}`}
                                    >
                                      {profile.name || item.name}
                                    </HighlighterLink>
                                  </th>
                                  {categoryId !== "Close_combat" && (
                                    <>
                                      <td className="py-2 max-w-24">
                                        {profile.short_range}
                                      </td>
                                      <td
                                        className={clsx({
                                          "p-2 max-w-24": true,
                                          "text-sm":
                                            profile.long_range.length > 8,
                                        })}
                                      >
                                        {profile.long_range}
                                      </td>
                                      <td className="p-2 max-w-24">
                                        {profile.short_to_hit}
                                      </td>
                                      <td className="p-2 max-w-24">
                                        {profile.long_to_hit}
                                      </td>
                                    </>
                                  )}
                                  <td className="p-2 max-w-24">
                                    {profile.strength}
                                  </td>
                                  <td className="p-2 max-w-24">
                                    {profile.damage}
                                  </td>
                                  <td className="p-2 max-w-24">
                                    {profile.save_modifier}
                                  </td>
                                  <td className="p-2 max-w-24">
                                    {profile.armour_penetration}
                                  </td>
                                  <td className="p-2 max-w-24 text-sm">
                                    <div className="flex flex-col">
                                      {profile.weapon_special_rules.map(
                                        (rule) => {
                                          const ruleId = `${rule.name.split(" ").join("_")}_rule`;

                                          return (
                                            <HighlighterLink
                                              key={ruleId}
                                              className="underline underline-offset-4"
                                              href={`/wargear/weapons#${ruleId}`}
                                            >
                                              {rule.name}
                                            </HighlighterLink>
                                          );
                                        },
                                      )}
                                      {item.profile_description && (
                                        <HighlighterLink
                                          className="underline underline-offset-4"
                                          href={`/wargear/weapons#${weaponId}_rules`}
                                        >
                                          See unique rules
                                        </HighlighterLink>
                                      )}
                                    </div>
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
              <div
                id="General_Weapon_Special_Rules"
                className="flex flex-col gap-4"
              >
                <h2 className="px-4 md:px-8 font-subtitle text-3xl capitalize">
                  General Weapon Special Rules
                </h2>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="grid grid-cols-12 font-subtitle text-sm">
                    <h3 className="col-span-3 md:col-span-2 p-2">Name</h3>
                    <h3 className="col-span-6 md:col-span-8 p-2">Rule</h3>
                    <h3 className="col-span-3 md:col-span-2 p-2">Related</h3>
                  </section>
                  {weaponSpecialRules.map((rule) => {
                    const ruleId = `${rule.name.split(" ").join("_")}_rule`;
                    const linkedRule = rule.rules;

                    return (
                      <section
                        key={ruleId}
                        id={ruleId}
                        className="grid grid-cols-12 bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black text-lg"
                      >
                        <div className="col-span-3 md:col-span-2 p-2 font-semibold">
                          <HighlighterLink
                            href={`/wargear/weapons#${ruleId}`}
                            className="hover:underline underline-offset-4 text-left"
                          >
                            {rule.name}
                          </HighlighterLink>
                        </div>
                        <div
                          className="dynamic-content col-span-6 md:col-span-8 p-2 flex flex-col justify-center gap-2 font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: rule.rule,
                          }}
                        />
                        <div className="col-span-3 md:col-span-2 p-2 font-semibold">
                          {linkedRule && (
                            <Link
                              className="underline underline-offset-4 text-sm"
                              href={`/rules/${linkedRule.rule_categories.slug}#${linkedRule.name.split(" ").join("_")}`}
                            >
                              {linkedRule.name}
                            </Link>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </section>
              </div>
              <div
                id="Unique_Weapon_Special_Rules"
                className="flex flex-col gap-4"
              >
                <h2 className="px-4 md:px-8 font-subtitle text-3xl capitalize">
                  Unique Weapon Special Rules
                </h2>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="grid grid-cols-12 font-subtitle text-sm">
                    <h3 className="col-span-3 md:col-span-2 p-2">Name</h3>
                    <h3 className="col-span-9 md:col-span-10 p-2">Rule</h3>
                  </section>
                  {weapons
                    .filter(({ profile_description }) =>
                      Boolean(profile_description),
                    )
                    .map((weapon) => {
                      const ruleId = `${weapon.name.split(" ").join("_")}_rules`;

                      return (
                        <section
                          key={ruleId}
                          id={ruleId}
                          className="grid grid-cols-12 bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black text-lg"
                        >
                          <div className="col-span-3 md:col-span-2 p-2 font-semibold">
                            <HighlighterLink
                              href={`/wargear/weapons#${ruleId}`}
                              className="hover:underline underline-offset-4 text-left"
                            >
                              {weapon.name}
                            </HighlighterLink>
                          </div>
                          <div
                            className="dynamic-content col-span-9 md:col-span-10 p-2 flex flex-col justify-center gap-2 font-semibold"
                            dangerouslySetInnerHTML={{
                              __html: weapon.profile_description!,
                            }}
                          />
                        </section>
                      );
                    })}
                </section>
              </div>
            </section>
          )}
        </main>
      </>
    );
  }
}
