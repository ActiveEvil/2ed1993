import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { clsx } from "clsx";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

const FULL_BLEED = "self-stretch -mx-2 md:-mx-4";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Weapons | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Weapons.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "weapons")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: categoryRows, error: categoryRowsError } = await supabase
    .from("weapon_categories")
    .select("id, name")
    .order("position");

  const { data: weapons, error: weaponsError } = await supabase
    .from("weapons")
    .select(
      "id, name, category_id, profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name))",
    )
    .order("name");

  const { data: weaponSpecialRules, error: weaponSpecialRulesError } =
    await supabase
      .from("weapon_special_rules")
      .select("name, rule, rules(name, rule_categories(slug))")
      .order("name");

  assertNoQueryErrors(
    "/wargear/weapons",
    heroImageError,
    categoryRowsError,
    weaponsError,
    weaponSpecialRulesError,
  );

  if (hero && categoryRows && weapons && weaponSpecialRules) {
    const byCategory = new Map<number, typeof weapons>();

    for (const item of weapons) {
      const bucket = byCategory.get(item.category_id) ?? [];
      bucket.push(item);
      byCategory.set(item.category_id, bucket);
    }

    const weaponCategories = categoryRows
      .map(({ id, name }) => ({
        category: name,
        items: byCategory.get(id) ?? [],
      }))
      .filter(({ items }) => items.length > 0);

    const filterableRows =
      weapons.length +
      weaponSpecialRules.length +
      weapons.filter(({ profile_description }) => profile_description).length;

    const jumpItems = [
      ...weaponCategories.map(({ category }) => ({
        id: generateAnchorId(category),
        label: category,
      })),
      { id: "General_Weapon_Special_Rules", label: "General rules" },
      { id: "Unique_Weapon_Special_Rules", label: "Unique rules" },
    ];

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
        <main className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                Weapons
              </h1>
            </header>
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          </Panel>
          <JumpBar className={FULL_BLEED} items={jumpItems} label="Jump to">
            <RowFilter
              label="Filter"
              unit="entries"
              total={filterableRows}
              placeholder="e.g. boltgun, plasma, sustained fire"
            />
          </JumpBar>
          {Boolean(weaponCategories.length) && (
            <Panel className="flex flex-col gap-4 w-full max-w-5xl">
              {weaponCategories.map((section) => {
                const categoryId = generateAnchorId(section.category);

                return (
                  <div
                    key={categoryId}
                    id={categoryId}
                    data-group
                    className="flex flex-col gap-4 mt-4 md:mt-8"
                  >
                    <div className="px-4 md:px-8">
                      <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                        <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                        <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                          {section.category}
                        </h2>
                      </div>
                    </div>
                    <section className="relative overflow-x-auto">
                      <table className="relative w-full min-w-max table-auto bg-background border-collapse border-b-4 border-black text-center">
                        <thead className="bg-black font-subtitle text-sm text-white">
                          <tr>
                            <th
                              scope="col"
                              rowSpan={2}
                              className="sticky left-0 z-20 bg-black/80 p-2 text-left"
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
                              className="p-2 w-52 text-left"
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
                          const weaponId = generateAnchorId(item.name);
                          const search = [
                            item.name,
                            ...item.weapon_profiles.flatMap((profile) => [
                              profile.name ?? "",
                              ...profile.weapon_special_rules.map(
                                ({ name }) => name,
                              ),
                            ]),
                            item.profile_description ? "unique rules" : "",
                          ]
                            .join(" ")
                            .toLowerCase();

                          const refs = [
                            ...new Set(
                              item.weapon_profiles.flatMap((profile) =>
                                profile.weapon_special_rules.map(
                                  ({ name }) =>
                                    `${generateAnchorId(name)}_Rule`,
                                ),
                              ),
                            ),
                            ...(item.profile_description
                              ? [`${weaponId}_Rules`]
                              : []),
                          ].join(" ");

                          return (
                            <tbody
                              key={weaponId}
                              id={weaponId}
                              data-search={search}
                              data-refs={refs}
                              className="bg-background/80 even:bg-[var(--stripe)]/80 target:bg-2ed-light-yellow target:text-black target:font-bold text-lg font-semibold [&>tr]:bg-inherit"
                            >
                              {item.weapon_profiles.length > 1 && (
                                <tr>
                                  <th
                                    scope="rowgroup"
                                    className="sticky left-0 z-10 bg-inherit pt-2 px-2 text-left max-w-44"
                                  >
                                    <HighlighterLink
                                      className="hover:underline underline-offset-4"
                                      href={`/wargear/weapons#${weaponId}`}
                                    >
                                      {item.name}
                                    </HighlighterLink>
                                  </th>
                                  {/* Filler. The name needs to be a cell in the
                                      first column to pin like the profile names
                                      under it, so the rest of the row is one
                                      empty span. colSpan clamps to the table's
                                      real width, so close combat is fine. */}
                                  <td colSpan={9} />
                                </tr>
                              )}
                              {item.weapon_profiles.map((profile, index) => (
                                <tr key={`${weaponId}_${index}`}>
                                  <th
                                    scope="row"
                                    className={clsx({
                                      "sticky left-0 z-10 bg-inherit p-2 text-left max-w-44": true,
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
                                  <td className="p-2 w-52 text-sm text-left">
                                    <div className="flex flex-wrap gap-1">
                                      {profile.weapon_special_rules.map(
                                        (rule) => {
                                          const ruleId = `${generateAnchorId(rule.name)}_Rule`;

                                          return (
                                            <HighlighterLink
                                              key={ruleId}
                                              className={CHIP_CLASS}
                                              href={`/wargear/weapons#${ruleId}`}
                                            >
                                              {rule.name}
                                            </HighlighterLink>
                                          );
                                        },
                                      )}
                                      {item.profile_description && (
                                        <HighlighterLink
                                          className={CHIP_CLASS}
                                          href={`/wargear/weapons#${weaponId}_Rules`}
                                        >
                                          Unique rules
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
                data-group
                className="flex flex-col gap-4 mt-4 md:mt-8"
              >
                <div className="px-4 md:px-8">
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      General Weapon Special Rules
                    </h2>
                  </div>
                </div>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="hidden md:grid md:grid-cols-12 font-subtitle text-sm">
                    <h3 className="md:col-span-2 p-2">Name</h3>
                    <h3 className="md:col-span-8 p-2">Rule</h3>
                    <h3 className="md:col-span-2 p-2">Related</h3>
                  </section>
                  {weaponSpecialRules.map((rule) => {
                    const ruleId = `${generateAnchorId(rule.name)}_Rule`;
                    const linkedRule = rule.rules;

                    return (
                      <section
                        key={ruleId}
                        id={ruleId}
                        data-search={rule.name.toLowerCase()}
                        className="highlight-target grid grid-cols-1 md:grid-cols-12 bg-background even:bg-[var(--stripe)] target:bg-2ed-light-yellow target:text-black text-lg"
                      >
                        <div className="md:col-span-2 p-2 font-bold">
                          <HighlighterLink
                            href={`/wargear/weapons#${ruleId}`}
                            className="hover:underline underline-offset-4 text-left"
                          >
                            {rule.name}
                          </HighlighterLink>
                        </div>
                        <div
                          className="dynamic-content md:col-span-8 p-2 flex flex-col justify-center gap-2 font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: rule.rule,
                          }}
                        />
                        <div className="md:col-span-2 p-2 font-semibold empty:hidden">
                          {linkedRule && (
                            <Link
                              className="underline underline-offset-4 text-sm"
                              href={`/rules/${linkedRule.rule_categories.slug}#${generateAnchorId(linkedRule.name)}`}
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
                data-group
                className="flex flex-col gap-4 mt-4 md:mt-8"
              >
                <div className="px-4 md:px-8">
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      Unique Weapon Special Rules
                    </h2>
                  </div>
                </div>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="hidden md:grid md:grid-cols-12 font-subtitle text-sm">
                    <h3 className="md:col-span-2 p-2">Name</h3>
                    <h3 className="md:col-span-10 p-2">Rule</h3>
                  </section>
                  {weapons
                    .filter(({ profile_description }) =>
                      Boolean(profile_description),
                    )
                    .map((weapon) => {
                      const ruleId = `${generateAnchorId(weapon.name)}_Rules`;

                      return (
                        <section
                          key={ruleId}
                          id={ruleId}
                          data-search={weapon.name.toLowerCase()}
                          className="highlight-target grid grid-cols-1 md:grid-cols-12 bg-background even:bg-[var(--stripe)] target:bg-2ed-light-yellow target:text-black text-lg"
                        >
                          <div className="md:col-span-2 p-2 font-bold">
                            <HighlighterLink
                              href={`/wargear/weapons#${ruleId}`}
                              className="hover:underline underline-offset-4 text-left"
                            >
                              {weapon.name}
                            </HighlighterLink>
                          </div>
                          <div
                            className="dynamic-content md:col-span-10 p-2 flex flex-col justify-center gap-2 font-semibold"
                            dangerouslySetInnerHTML={{
                              __html: weapon.profile_description!,
                            }}
                          />
                        </section>
                      );
                    })}
                </section>
              </div>
              <p
                data-empty
                hidden
                className="mx-4 md:mx-8 p-6 border-4 border-black bg-2ed-light-green text-2ed-black text-lg"
              >
                Nothing matches that filter.
              </p>
            </Panel>
          )}
        </main>
      </>
    );
  }

  throw new Error("/wargear/weapons: rendered with no data");
}
