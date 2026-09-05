import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Armour"),
    description:
      "Armour saves for Warhammer 40,000 2nd Edition, covering physical armour such as power armour, personal force fields and shields, with their special rules.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "armour")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: categoryRows, error: categoryRowsError } = await supabase
    .from("armour_categories")
    .select("id, name")
    .order("position");

  const { data: armour, error: armourError } = await supabase
    .from("armour")
    .select(
      "id, name, category_id, profile_description, armour_profiles(save, condition), armour_special_rules(name)",
    )
    .order("name")
    .order("condition", {
      referencedTable: "armour_profiles",
      nullsFirst: true,
    });

  const { data: armourSpecialRules, error: armourSpecialRulesError } =
    await supabase
      .from("armour_special_rules")
      .select("name, rule, rules(name, rule_categories(slug))")
      .order("name");

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
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                Armour
              </h1>
            </header>
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          </Panel>
          <JumpBar
            className="self-stretch -mx-2 md:-mx-4"
            items={jumpItems}
            label="Jump to"
          >
            <RowFilter
              label="Filter"
              unit="entries"
              total={filterableRows}
              placeholder="e.g. terminator, 4+, parry"
            />
          </JumpBar>
          {Boolean(armourCategories.length) && (
            <Panel className="flex flex-col gap-4 w-full max-w-5xl">
              {armourCategories.map((section) => {
                const categoryId = generateAnchorId(section.category);

                return (
                  <div
                    key={categoryId}
                    id={categoryId}
                    data-group
                    className="flex flex-col gap-4 mt-4 md:mt-8"
                  >
                    <div className="mt-4 px-4 md:px-8">
                      <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                        <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                        <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                          {section.category}
                        </h2>
                      </div>
                    </div>
                    <section className="relative overflow-x-auto">
                      <table className="relative w-full min-w-max table-auto bg-background border-collapse border-b-4 border-black text-center">
                        <caption className="sr-only">
                          {section.category} armour
                        </caption>
                        <thead className="bg-black font-subtitle text-sm text-white">
                          <tr>
                            <th
                              scope="col"
                              className="sticky left-0 z-20 bg-black/80 p-2 text-left"
                            >
                              Armour
                            </th>
                            <th scope="col" className="p-2">
                              Save
                            </th>
                            <th scope="col" className="p-2 w-52 text-left">
                              Special
                            </th>
                          </tr>
                        </thead>
                        {section.items.map((item) => {
                          const armourId = generateAnchorId(item.name);
                          const search = [
                            item.name,
                            ...item.armour_profiles.flatMap((profile) => [
                              profile.save,
                              profile.condition ?? "",
                            ]),
                            ...item.armour_special_rules.map(
                              ({ name }) => name,
                            ),
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
                            <tbody
                              key={armourId}
                              id={armourId}
                              data-search={search}
                              data-refs={refs}
                              className="bg-background/80 even:bg-(--stripe)/80 target:bg-2ed-light-yellow target:text-black target:font-bold text-lg font-semibold [&>tr]:bg-inherit"
                            >
                              <tr>
                                <th
                                  scope="row"
                                  className="sticky left-0 z-10 bg-inherit p-2 text-left max-w-44"
                                >
                                  <HighlighterLink
                                    className="hover:underline underline-offset-4"
                                    href={`/wargear/armour#${armourId}`}
                                  >
                                    {item.name}
                                  </HighlighterLink>
                                </th>
                                <td className="p-2 text-left">
                                  {item.armour_profiles.length ? (
                                    <div className="flex flex-col">
                                      {item.armour_profiles.map(
                                        (profile, index) => (
                                          <span key={`${armourId}_${index}`}>
                                            {profile.save}
                                            {profile.condition && (
                                              <span className="text-sm font-normal">
                                                {" "}
                                                {profile.condition}
                                              </span>
                                            )}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <span>&ndash;</span>
                                  )}
                                </td>
                                <td className="p-2 w-52 text-sm text-left">
                                  <div className="flex flex-wrap gap-x-1 gap-y-4">
                                    {item.armour_special_rules.map((rule) => {
                                      const ruleId = `${generateAnchorId(rule.name)}_Rule`;

                                      return (
                                        <HighlighterLink
                                          key={ruleId}
                                          className={CHIP_CLASS}
                                          href={`/wargear/armour#${ruleId}`}
                                        >
                                          {rule.name}
                                        </HighlighterLink>
                                      );
                                    })}
                                    {item.profile_description && (
                                      <HighlighterLink
                                        className={CHIP_CLASS}
                                        href={`/wargear/armour#${armourId}_Rules`}
                                      >
                                        Unique rules
                                      </HighlighterLink>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                      </table>
                    </section>
                  </div>
                );
              })}
              <div
                id="General_Armour_Special_Rules"
                data-group
                className="flex flex-col gap-4 mt-4 md:mt-8"
              >
                <div className="px-4 md:px-8">
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      General Armour Special Rules
                    </h2>
                  </div>
                </div>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="hidden md:grid md:grid-cols-12 font-subtitle text-sm text-white">
                    <span className="md:col-span-2 p-2">Name</span>
                    <span className="md:col-span-8 p-2">Rule</span>
                    <span className="md:col-span-2 p-2">Related</span>
                  </section>
                  {armourSpecialRules.map((rule) => {
                    const ruleId = `${generateAnchorId(rule.name)}_Rule`;
                    const linkedRule = rule.rules;

                    return (
                      <section
                        key={ruleId}
                        id={ruleId}
                        data-search={rule.name.toLowerCase()}
                        className="highlight-target grid grid-cols-1 md:grid-cols-12 bg-background even:bg-(--stripe) target:bg-2ed-light-yellow target:text-black text-lg"
                      >
                        <div className="md:col-span-2 p-2 font-bold">
                          <HighlighterLink
                            href={`/wargear/armour#${ruleId}`}
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
                id="Unique_Armour_Special_Rules"
                data-group
                className="flex flex-col gap-4 mt-4 md:mt-8"
              >
                <div className="px-4 md:px-8">
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      Unique Armour Special Rules
                    </h2>
                  </div>
                </div>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="hidden md:grid md:grid-cols-12 font-subtitle text-sm text-white">
                    <span className="md:col-span-2 p-2">Name</span>
                    <span className="md:col-span-10 p-2">Rule</span>
                  </section>
                  {armour
                    .filter(({ profile_description }) =>
                      Boolean(profile_description),
                    )
                    .map((item) => {
                      const ruleId = `${generateAnchorId(item.name)}_Rules`;

                      return (
                        <section
                          key={ruleId}
                          id={ruleId}
                          data-search={item.name.toLowerCase()}
                          className="highlight-target grid grid-cols-1 md:grid-cols-12 bg-background even:bg-(--stripe) target:bg-2ed-light-yellow target:text-black text-lg"
                        >
                          <div className="md:col-span-2 p-2 font-bold">
                            <HighlighterLink
                              href={`/wargear/armour#${ruleId}`}
                              className="hover:underline underline-offset-4 text-left"
                            >
                              {item.name}
                            </HighlighterLink>
                          </div>
                          <div
                            className="dynamic-content md:col-span-10 p-2 flex flex-col justify-center gap-2 font-semibold"
                            dangerouslySetInnerHTML={{
                              __html: item.profile_description!,
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

  throw new Error("/wargear/armour: rendered with no data");
}
