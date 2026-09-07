import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/Heading";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { SpecialRuleSection } from "@/components/SpecialRuleSection";
import { TitleBand } from "@/components/TitleBand";
import {
  WeaponStrip,
  closeCombatCells,
  rangedCells,
} from "@/components/WeaponStrip";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";
import { Fragment } from "react";

export const revalidate = 3600;

const MIDDOT = " · ";

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Weapons"),
    description:
      "Weapon profiles from Warhammer 40,000 2nd Edition, giving range, to hit, Strength, damage and save modifier for pistols, basic, heavy and support weapons.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: categoryRows, error: categoryRowsError },
    { data: weapons, error: weaponsError },
    { data: weaponSpecialRules, error: weaponSpecialRulesError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "weapons")
      .single(),
    supabase.from("weapon_categories").select("id, name").order("position"),
    supabase
      .from("weapons")
      .select(
        "id, name, category_id, profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name))",
      )
      .order("name")
      .order("position", { referencedTable: "weapon_profiles" }),
    supabase
      .from("weapon_special_rules")
      .select("name, rule, rules(name, rule_categories(slug))")
      .order("name"),
  ]);
  const hero = heroImage?.images ?? null;

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
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Weapons"
            eyebrow="Wargear"
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          />
          <div className="flex flex-col lg:flex-row">
            <JumpBar rail items={jumpItems}>
              <RowFilter
                label="Filter"
                unit="entries"
                total={filterableRows}
                placeholder="e.g. boltgun, plasma, sustained fire"
              />
            </JumpBar>
            <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
              {weaponCategories.map((section) => {
                const categoryId = generateAnchorId(section.category);
                const closeCombat = categoryId === "Close_combat";

                return (
                  <section
                    key={categoryId}
                    id={categoryId}
                    data-group
                    className="flex flex-col gap-4"
                  >
                    <SectionHeading>{section.category}</SectionHeading>
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

                      const specials = [
                        ...new Set(
                          item.weapon_profiles.flatMap((profile) =>
                            profile.weapon_special_rules.map(
                              ({ name }) => name,
                            ),
                          ),
                        ),
                      ];

                      const refs = [
                        ...specials.map(
                          (name) => `${generateAnchorId(name)}_Rule`,
                        ),
                        ...(item.profile_description
                          ? [`${weaponId}_Rules`]
                          : []),
                      ].join(" ");

                      return (
                        <WeaponStrip
                          key={weaponId}
                          id={weaponId}
                          data-search={search}
                          data-refs={refs}
                          className="target:text-black"
                          name={
                            <HighlighterLink
                              className="hover:underline underline-offset-4"
                              href={`/wargear/weapons#${weaponId}`}
                            >
                              {item.name}
                            </HighlighterLink>
                          }
                          special={
                            specials.length || item.profile_description ? (
                              <>
                                {specials.map((name, index) => (
                                  <Fragment key={name}>
                                    {index > 0 && MIDDOT}
                                    <HighlighterLink
                                      className="underline underline-offset-4"
                                      href={`/wargear/weapons#${generateAnchorId(name)}_Rule`}
                                    >
                                      {name}
                                    </HighlighterLink>
                                  </Fragment>
                                ))}
                                {item.profile_description && (
                                  <>
                                    {specials.length > 0 && MIDDOT}
                                    <HighlighterLink
                                      className="underline underline-offset-4"
                                      href={`/wargear/weapons#${weaponId}_Rules`}
                                    >
                                      Unique rules
                                    </HighlighterLink>
                                  </>
                                )}
                              </>
                            ) : undefined
                          }
                          profiles={item.weapon_profiles.map(
                            (profile, index) => ({
                              key: index,
                              label:
                                item.weapon_profiles.length > 1
                                  ? profile.name
                                  : null,
                              cells: closeCombat
                                ? closeCombatCells(profile)
                                : rangedCells(profile),
                            }),
                          )}
                        />
                      );
                    })}
                  </section>
                );
              })}
              <section
                id="General_Weapon_Special_Rules"
                data-group
                className="flex flex-col gap-8 md:gap-12"
              >
                <SectionHeading>General Weapon Special Rules</SectionHeading>
                {weaponSpecialRules.map((rule) => {
                  const ruleId = `${generateAnchorId(rule.name)}_Rule`;
                  const linkedRule = rule.rules;

                  return (
                    <SpecialRuleSection
                      key={ruleId}
                      id={ruleId}
                      name={rule.name}
                      href={`/wargear/weapons#${ruleId}`}
                      html={rule.rule}
                      related={
                        linkedRule && {
                          name: linkedRule.name,
                          href: `/rules/${linkedRule.rule_categories.slug}#${generateAnchorId(linkedRule.name)}`,
                        }
                      }
                    />
                  );
                })}
              </section>
              <section
                id="Unique_Weapon_Special_Rules"
                data-group
                className="flex flex-col gap-8 md:gap-12"
              >
                <SectionHeading>Unique Weapon Special Rules</SectionHeading>
                {weapons
                  .filter(({ profile_description }) =>
                    Boolean(profile_description),
                  )
                  .map((item) => {
                    const ruleId = `${generateAnchorId(item.name)}_Rules`;

                    return (
                      <SpecialRuleSection
                        key={ruleId}
                        id={ruleId}
                        name={item.name}
                        href={`/wargear/weapons#${ruleId}`}
                        html={item.profile_description!}
                      />
                    );
                  })}
              </section>
              <p
                data-empty
                hidden
                className="p-6 border-4 border-frame bg-2ed-light-green text-2ed-black text-lg"
              >
                Nothing matches that filter.
              </p>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/wargear/weapons: rendered with no data");
}
