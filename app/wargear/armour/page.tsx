import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/Heading";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { SpecialRuleSection } from "@/components/SpecialRuleSection";
import { TitleBand } from "@/components/TitleBand";
import { WeaponStrip } from "@/components/WeaponStrip";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";
import { Fragment } from "react";

export const revalidate = 3600;

const MIDDOT = " · ";

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Armour"),
    description:
      "Armour saves for Warhammer 40,000 2nd Edition, covering physical armour such as power armour, personal force fields and shields, with their special rules.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: categoryRows, error: categoryRowsError },
    { data: armour, error: armourError },
    { data: armourSpecialRules, error: armourSpecialRulesError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "armour")
      .single(),
    supabase.from("armour_categories").select("id, name").order("position"),
    supabase
      .from("armour")
      .select(
        "id, name, category_id, profile_description, armour_profiles(save, condition), armour_special_rules(name)",
      )
      .order("name")
      .order("condition", {
        referencedTable: "armour_profiles",
        nullsFirst: true,
      }),
    supabase
      .from("armour_special_rules")
      .select("name, rule, rules(name, rule_categories(slug))")
      .order("name"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors(
    "/wargear/armour",
    heroImageError,
    categoryRowsError,
    armourError,
    armourSpecialRulesError,
  );

  if (hero && categoryRows && armour && armourSpecialRules) {
    const byCategory = new Map<number, typeof armour>();

    for (const item of armour) {
      const bucket = byCategory.get(item.category_id) ?? [];
      bucket.push(item);
      byCategory.set(item.category_id, bucket);
    }

    const armourCategories = categoryRows
      .map(({ id, name }) => ({
        category: name,
        items: byCategory.get(id) ?? [],
      }))
      .filter(({ items }) => items.length > 0);

    const filterableRows =
      armour.length +
      armourSpecialRules.length +
      armour.filter(({ profile_description }) => profile_description).length;

    const jumpItems = [
      ...armourCategories.map(({ category }) => ({
        id: generateAnchorId(category),
        label: category,
      })),
      { id: "General_Armour_Special_Rules", label: "General rules" },
      { id: "Unique_Armour_Special_Rules", label: "Unique rules" },
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
              anchor: "Armour",
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Armour"
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
                placeholder="e.g. terminator, 4+, parry"
              />
            </JumpBar>
            <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
              {armourCategories.map((section) => {
                const categoryId = generateAnchorId(section.category);

                return (
                  <section
                    key={categoryId}
                    id={categoryId}
                    data-group
                    className="flex flex-col gap-4"
                  >
                    <SectionHeading>{section.category}</SectionHeading>
                    {section.items.map((item) => {
                      const armourId = generateAnchorId(item.name);
                      const search = [
                        item.name,
                        ...item.armour_profiles.flatMap((profile) => [
                          profile.save,
                          profile.condition ?? "",
                        ]),
                        ...item.armour_special_rules.map(({ name }) => name),
                        item.profile_description ? "unique rules" : "",
                      ]
                        .join(" ")
                        .toLowerCase();

                      const refs = [
                        ...item.armour_special_rules.map(
                          ({ name }) => `${generateAnchorId(name)}_Rule`,
                        ),
                        ...(item.profile_description
                          ? [`${armourId}_Rules`]
                          : []),
                      ].join(" ");

                      return (
                        <WeaponStrip
                          key={armourId}
                          id={armourId}
                          data-search={search}
                          data-refs={refs}
                          className="target:text-black"
                          name={
                            <HighlighterLink
                              className="hover:underline underline-offset-4"
                              href={`/wargear/armour#${armourId}`}
                            >
                              {item.name}
                            </HighlighterLink>
                          }
                          special={
                            item.armour_special_rules.length ||
                            item.profile_description ? (
                              <>
                                {item.armour_special_rules.map(
                                  ({ name }, index) => (
                                    <Fragment key={name}>
                                      {index > 0 && MIDDOT}
                                      <HighlighterLink
                                        className="underline underline-offset-4"
                                        href={`/wargear/armour#${generateAnchorId(name)}_Rule`}
                                      >
                                        {name}
                                      </HighlighterLink>
                                    </Fragment>
                                  ),
                                )}
                                {item.profile_description && (
                                  <>
                                    {item.armour_special_rules.length > 0 &&
                                      MIDDOT}
                                    <HighlighterLink
                                      className="underline underline-offset-4"
                                      href={`/wargear/armour#${armourId}_Rules`}
                                    >
                                      Unique rules
                                    </HighlighterLink>
                                  </>
                                )}
                              </>
                            ) : undefined
                          }
                          profiles={[
                            {
                              key: armourId,
                              cells: item.armour_profiles.length
                                ? item.armour_profiles.map((profile) => ({
                                    label: "Save",
                                    value: (
                                      <>
                                        {profile.save}
                                        {profile.condition && (
                                          <span className="block font-normal text-sm">
                                            {profile.condition}
                                          </span>
                                        )}
                                      </>
                                    ),
                                  }))
                                : [{ label: "Save", value: "\u2013" }],
                            },
                          ]}
                        />
                      );
                    })}
                  </section>
                );
              })}
              <section
                id="General_Armour_Special_Rules"
                data-group
                className="flex flex-col gap-8 md:gap-12"
              >
                <SectionHeading>General Armour Special Rules</SectionHeading>
                {armourSpecialRules.map((rule) => {
                  const ruleId = `${generateAnchorId(rule.name)}_Rule`;
                  const linkedRule = rule.rules;

                  return (
                    <SpecialRuleSection
                      key={ruleId}
                      id={ruleId}
                      name={rule.name}
                      href={`/wargear/armour#${ruleId}`}
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
                id="Unique_Armour_Special_Rules"
                data-group
                className="flex flex-col gap-8 md:gap-12"
              >
                <SectionHeading>Unique Armour Special Rules</SectionHeading>
                {armour
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
                        href={`/wargear/armour#${ruleId}`}
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

  throw new Error("/wargear/armour: rendered with no data");
}
