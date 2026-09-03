import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IndexCard } from "@/components/Cards";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { ruleName } from "@/components/UnitEquipment";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Rules | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Rules.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "rules")
    .single();
  const hero = heroImage?.images ?? null;
  const { data: sectionRows, error: sectionsError } = await supabase
    .from("rule_sections")
    .select(
      "name, numbered, rule_categories(slug, name, position, faction_id, rules(name, position))",
    )
    .order("position");
  const { data: assignmentRows, error: assignmentsError } = await supabase
    .from("unit_special_rule_assignments")
    .select("rule:unit_special_rules(name), units!inner(faction_id)");

  assertNoQueryErrors(
    "/rules",
    heroImageError,
    sectionsError,
    assignmentsError,
  );

  if (hero && sectionRows) {
    const byPosition = <T extends { position: number }>(a: T, b: T) =>
      a.position - b.position;

    const unitRuleNames = new Map<number, Set<string>>();

    for (const row of assignmentRows ?? []) {
      const faction = row.units.faction_id;

      if (row.rule === null || faction === null) {
        continue;
      }

      const names = unitRuleNames.get(faction) ?? new Set<string>();
      names.add(ruleName(row.rule.name));
      unitRuleNames.set(faction, names);
    }

    const chapterEntries = (category: {
      faction_id: number | null;
      rules: { name: string; position: number }[];
    }): { name: string; anchor: string }[] => {
      const listed = [...category.rules].sort(byPosition).map(({ name }) => ({
        name,
        anchor: generateAnchorId(name),
      }));
      const claimed = new Set(listed.map(({ anchor }) => anchor));
      const generated =
        category.faction_id === null
          ? []
          : [...(unitRuleNames.get(category.faction_id) ?? [])]
              .sort((a, b) => a.localeCompare(b))
              .map((name) => ({ name, anchor: generateAnchorId(name) }))
              .filter(({ anchor }) => !claimed.has(anchor));

      return [...listed, ...generated];
    };

    const sections = sectionRows
      .map((section) => ({
        ...section,
        categories: [...section.rule_categories].sort(byPosition).map((c) => ({
          ...c,
          entries: chapterEntries(c),
        })),
      }))
      .filter(({ categories }) => categories.length > 0);

    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Rules" }]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Rules
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <div className="flex flex-col gap-7">
            {sections.map(({ name: title, numbered, categories }) => {
              const first = categories[0].position + 1;
              const last = categories[categories.length - 1].position + 1;

              return (
                <section key={title} className="flex flex-col gap-4">
                  <SectionBar
                    as="h2"
                    title={title}
                    note={
                      !numbered
                        ? null
                        : first === last
                          ? `Chapter ${first}`
                          : `Chapters ${first}\u2013${last}`
                    }
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    {categories.map(({ slug, name, position, entries }) => (
                      <IndexCard
                        key={slug}
                        href={`/rules/${slug}`}
                        title={numbered ? `${position + 1}. ${name}` : name}
                      >
                        <ol className="pl-6 text-lg list-decimal">
                          {entries.map((entry) => (
                            <li key={entry.anchor}>
                              <Link
                                className="hover:underline underline-offset-4"
                                href={`/rules/${slug}#${entry.anchor}`}
                              >
                                {entry.name}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </IndexCard>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/rules: rendered with no data");
}
