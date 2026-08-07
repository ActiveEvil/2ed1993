import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Armour | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Armour.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "armour")
    .single();
  const hero = heroImage?.images ?? null;

  const { data: armour, error: armourError } = await supabase
    .from("armour")
    .select(
      "id, name, category, profile_description, armour_profiles(save, condition), armour_special_rules(name)",
    )
    .order("category")
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
    armourError,
    armourSpecialRulesError,
  );

  if (hero && armour && armourSpecialRules) {
    const categories = new Map<string, typeof armour>();

    for (const item of armour) {
      const bucket = categories.get(item.category) ?? [];
      bucket.push(item);
      categories.set(item.category, bucket);
    }

    const armourCategories = Array.from(categories.entries()).map(
      ([category, items]) => ({
        category,
        items,
      }),
    );

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
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl pt-4 md:pt-8 border-4 border-black shadow-lg">
          <header className="px-4 md:px-8">
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Armour
            </h1>
          </header>
          <div className="px-4 md:px-8">
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          </div>
          {Boolean(armourCategories.length) && (
            <section className="flex flex-col gap-4 pt-4 border-t-4 border-black">
              {armourCategories.map((section) => {
                const categoryId = generateAnchorId(section.category);

                return (
                  <div
                    key={categoryId}
                    id={categoryId}
                    className="flex flex-col gap-4"
                  >
                    <h2 className="px-4 md:px-8 font-subtitle text-3xl capitalize">
                      {section.category}
                    </h2>
                    <section className="flex flex-col bg-black border-b-4 border-black">
                      <section className="grid grid-cols-12 font-subtitle text-sm">
                        <h3 className="col-span-3 md:col-span-2 p-2">Armour</h3>
                        <h3 className="col-span-6 md:col-span-8 p-2">Save</h3>
                        <h3 className="col-span-3 md:col-span-2 p-2">
                          Special
                        </h3>
                      </section>
                      {section.items.map((item) => {
                        const armourId = generateAnchorId(item.name);

                        return (
                          <section
                            key={armourId}
                            id={armourId}
                            className="highlight-target grid grid-cols-12 bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black text-lg"
                          >
                            <div className="col-span-3 md:col-span-2 p-2 font-semibold">
                              <HighlighterLink
                                className="hover:underline underline-offset-4 text-left"
                                href={`/wargear/armour#${armourId}`}
                              >
                                {item.name}
                              </HighlighterLink>
                            </div>
                            <div className="col-span-6 md:col-span-8 p-2 flex flex-col font-semibold">
                              {item.armour_profiles.length ? (
                                item.armour_profiles.map((profile, index) => (
                                  <span key={`${armourId}_${index}`}>
                                    {profile.save}
                                    {profile.condition && (
                                      <span className="text-sm font-normal">
                                        {" "}
                                        {profile.condition}
                                      </span>
                                    )}
                                  </span>
                                ))
                              ) : (
                                <span>&ndash;</span>
                              )}
                            </div>
                            <div className="col-span-3 md:col-span-2 p-2 flex flex-col text-sm font-semibold">
                              {item.armour_special_rules.map((rule) => {
                                const ruleId = `${generateAnchorId(rule.name)}_Rule`;

                                return (
                                  <HighlighterLink
                                    key={ruleId}
                                    className="underline underline-offset-4"
                                    href={`/wargear/armour#${ruleId}`}
                                  >
                                    {rule.name}
                                  </HighlighterLink>
                                );
                              })}
                              {item.profile_description && (
                                <HighlighterLink
                                  className="underline underline-offset-4"
                                  href={`/wargear/armour#${armourId}_Rules`}
                                >
                                  See unique rules
                                </HighlighterLink>
                              )}
                            </div>
                          </section>
                        );
                      })}
                    </section>
                  </div>
                );
              })}
              <div
                id="General_Armour_Special_Rules"
                className="flex flex-col gap-4"
              >
                <h2 className="px-4 md:px-8 font-subtitle text-3xl capitalize">
                  General Armour Special Rules
                </h2>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="grid grid-cols-12 font-subtitle text-sm">
                    <h3 className="col-span-3 md:col-span-2 p-2">Name</h3>
                    <h3 className="col-span-6 md:col-span-8 p-2">Rule</h3>
                    <h3 className="col-span-3 md:col-span-2 p-2">Related</h3>
                  </section>
                  {armourSpecialRules.map((rule) => {
                    const ruleId = `${generateAnchorId(rule.name)}_Rule`;
                    const linkedRule = rule.rules;

                    return (
                      <section
                        key={ruleId}
                        id={ruleId}
                        className="highlight-target grid grid-cols-12 bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black text-lg"
                      >
                        <div className="col-span-3 md:col-span-2 p-2 font-semibold">
                          <HighlighterLink
                            href={`/wargear/armour#${ruleId}`}
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
                className="flex flex-col gap-4"
              >
                <h2 className="px-4 md:px-8 font-subtitle text-3xl capitalize">
                  Unique Armour Special Rules
                </h2>
                <section className="flex flex-col bg-black border-b-4 border-black">
                  <section className="grid grid-cols-12 font-subtitle text-sm">
                    <h3 className="col-span-3 md:col-span-2 p-2">Name</h3>
                    <h3 className="col-span-9 md:col-span-10 p-2">Rule</h3>
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
                          className="highlight-target grid grid-cols-12 bg-background even:bg-background/80 target:bg-2ed-light-yellow target:text-black text-lg"
                        >
                          <div className="col-span-3 md:col-span-2 p-2 font-semibold">
                            <HighlighterLink
                              href={`/wargear/armour#${ruleId}`}
                              className="hover:underline underline-offset-4 text-left"
                            >
                              {item.name}
                            </HighlighterLink>
                          </div>
                          <div
                            className="dynamic-content col-span-9 md:col-span-10 p-2 flex flex-col justify-center gap-2 font-semibold"
                            dangerouslySetInnerHTML={{
                              __html: item.profile_description!,
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

  throw new Error("/wargear/armour: rendered with no data");
}
