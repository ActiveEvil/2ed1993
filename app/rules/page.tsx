import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentsRow, ContentsTable } from "@/components/ContentsTable";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Rules"),
    description:
      "Every chapter of the Warhammer 40,000 2nd Edition rules, covering the movement, shooting, hand-to-hand and psychic phases, plus vehicles and psychology.",
  };
}

export default async function Page() {
  const [
    { data: heroImage, error: heroImageError },
    { data: sectionRows, error: sectionsError },
    { data: assignmentRows, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "rules")
      .single(),
    supabase
      .from("rule_sections")
      .select(
        "name, numbered, rule_categories(slug, name, position, faction_id, rules(name, position))",
      )
      .order("position"),
    supabase
      .from("unit_special_rule_assignments")
      .select("rule:unit_special_rules(name, rule), units!inner(faction_id)"),
  ]);
  const hero = heroImage?.images ?? null;

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

      if (row.rule === null || row.rule.rule === null || faction === null) {
        continue;
      }

      const names = unitRuleNames.get(faction) ?? new Set<string>();
      names.add(row.rule.name);
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
        categories: [...section.rule_categories]
          .sort(byPosition)
          .map((c) => ({ ...c, entries: chapterEntries(c) }))
          .filter((c) => c.faction_id === null || c.entries.length > 0),
      }))
      .filter(({ categories }) => categories.length > 0);

    const chapters = sections.reduce(
      (count, { categories }) => count + categories.length,
      0,
    );

    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Rules" }]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            title="Rules"
            eyebrow={chapters === 1 ? "1 chapter" : `${chapters} chapters`}
            image={{
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }}
          />
          <div className="flex flex-col">
            {sections.map(({ name: title, numbered, categories }) => {
              const first = categories[0].position + 1;
              const last = categories[categories.length - 1].position + 1;

              return (
                <section
                  key={title}
                  id={generateAnchorId(title)}
                  className="group flex flex-col"
                >
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
                  <ContentsTable>
                    {categories.map(({ slug, name, position, entries }) => (
                      <ContentsRow
                        key={slug}
                        number={numbered ? position + 1 : undefined}
                        title={name}
                        href={`/rules/${slug}`}
                        items={entries.map((entry) => ({
                          name: entry.name,
                          href: `/rules/${slug}#${entry.anchor}`,
                        }))}
                      />
                    ))}
                  </ContentsTable>
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
