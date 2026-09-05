import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { ruleName } from "@/components/UnitEquipment";
import { generateAnchorId, ruleHref } from "@/lib/anchors";
import { joinWithinBudget, pageTitle } from "@/lib/metadata";
import { extractSubsections } from "@/lib/sections";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/rules/[slug]";

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const loadFactionRules = (factionId: number) =>
  supabase
    .from("unit_special_rule_assignments")
    .select(
      "rule:unit_special_rules(id, name, rule, anchor, rules(id, name, rule_categories(slug, name))), units!inner(id, name, faction_id, army_list_entries(unit_categories(army_lists(slug, factions(slug)))))",
    )
    .eq("units.faction_id", factionId);

type AssignmentRow = NonNullable<
  Awaited<ReturnType<typeof loadFactionRules>>["data"]
>[number];

type Carrier = { id: number; name: string; href: string | null };

type FactionRule = {
  ruleId: number;
  name: string;
  anchor: string | null;
  prose: string | null;
  target: NonNullable<AssignmentRow["rule"]>["rules"];
  targetAnchor: string | null;
  carriers: Carrier[];
};

const carrierHref = (unit: AssignmentRow["units"]): string | null => {
  const list = unit.army_list_entries[0]?.unit_categories?.army_lists ?? null;

  return list
    ? `/factions/${list.factions.slug}/${list.slug}#${generateAnchorId(unit.name)}`
    : null;
};

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name);

const collectFactionRules = (rows: AssignmentRow[]): FactionRule[] => {
  const collected = new Map<number, FactionRule>();

  for (const row of rows) {
    const rule = row.rule;

    if (!rule) {
      continue;
    }

    const display = ruleName(rule.name);
    const entry = collected.get(rule.id) ?? {
      ruleId: rule.id,
      name: display,
      anchor: generateAnchorId(display),
      prose: rule.rule,
      target: rule.rules,
      targetAnchor: rule.anchor,
      carriers: [],
    };

    if (!entry.carriers.some(({ id }) => id === row.units.id)) {
      entry.carriers.push({
        id: row.units.id,
        name: row.units.name,
        href: carrierHref(row.units),
      });
    }

    collected.set(rule.id, entry);
  }

  return [...collected.values()]
    .map((rule) => ({ ...rule, carriers: [...rule.carriers].sort(byName) }))
    .sort(byName);
};

const buildFactionRuleHtml = (
  rule: FactionRule,
  currentSlug: string,
  includePointer: boolean,
): string => {
  const parts: string[] = [];

  if (includePointer && rule.target) {
    const href = ruleHref(rule.target, rule.targetAnchor);
    const suffix =
      rule.target.rule_categories.slug === currentSlug
        ? "."
        : ` in ${escapeHtml(rule.target.rule_categories.name)}.`;

    parts.push(
      `<p>See <a href="${href}">${escapeHtml(rule.target.name)}</a>${suffix}</p>`,
    );
  }

  if (rule.prose) {
    parts.push(rule.prose);
  }

  if (rule.carriers.length > 0) {
    const names = rule.carriers.map((carrier) =>
      carrier.href
        ? `<a href="${carrier.href}">${escapeHtml(carrier.name)}</a>`
        : escapeHtml(carrier.name),
    );

    parts.push(`<p>Carried by ${names.join(", ")}.</p>`);
  }

  return parts.join("");
};

const ChapterHeading: React.FC<{ title: string }> = ({
  title,
}): React.JSX.Element => (
  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
      {title}
    </h2>
  </div>
);

const GOLDEN_RULE_SLUG = "the-golden-rule";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: category, error: categoryError } = await supabase
    .from("rule_categories")
    .select("name, faction_id, factions(name), rules(name, position)")
    .eq("slug", params.slug)
    .order("position", { referencedTable: "rules" })
    .single();

  assertNoQueryErrors(CONTEXT, categoryError);

  if (category) {
    const title = pageTitle(category.name);

    if (params.slug === GOLDEN_RULE_SLUG) {
      return {
        title,
        description:
          "The Golden Rule of Warhammer 40,000 2nd Edition, the one that says the players should agree how to settle anything the rules do not cover.",
      };
    }

    if (category.rules.length === 0 && category.factions) {
      return {
        title,
        description: `The special rules carried by ${category.factions.name} units in Warhammer 40,000 2nd Edition, listed with the units that have them.`,
      };
    }

    const ruleNames = category.rules.map(({ name }) => name);

    return {
      title,
      description: joinWithinBudget(
        ruleNames,
        `The ${category.name} in Warhammer 40,000 2nd Edition, covering `,
        ".",
      ),
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { data: category, error: categoryError } = await supabase
    .from("rule_categories")
    .select(
      "name, faction_id, images(file_name, artist, title), rules(name, rule, position)",
    )
    .eq("slug", params.slug)
    .order("position", { referencedTable: "rules" })
    .single();

  assertNoQueryErrors(CONTEXT, categoryError);

  if (category) {
    const { data: assignments, error: assignmentsError } =
      category.faction_id === null
        ? { data: [] as AssignmentRow[], error: null }
        : await loadFactionRules(category.faction_id);

    assertNoQueryErrors(CONTEXT, assignmentsError);

    const heros = category.images.slice(0, 2);

    const chapterList: {
      key: string;
      id: string | null;
      name: string;
      rule: string;
    }[] = category.rules.map((item) => {
      const id = generateAnchorId(item.name);

      return { key: `chapter-${id}`, id, name: item.name, rule: item.rule };
    });

    const chapterByAnchor = new Map(
      chapterList.map((chapter, index) => [chapter.id, index]),
    );

    const subsectionAnchors = new Set(
      chapterList.flatMap((chapter) =>
        extractSubsections(chapter.rule).map(({ id }) => id),
      ),
    );

    for (const rule of collectFactionRules(assignments ?? [])) {
      const anchor = rule.anchor;

      if (anchor === null) {
        chapterList.push({
          key: `unit-rule-${rule.ruleId}`,
          id: null,
          name: rule.name,
          rule: buildFactionRuleHtml(rule, params.slug, true),
        });
        continue;
      }

      const targetsThisChapter = chapterByAnchor.get(anchor);

      if (targetsThisChapter !== undefined) {
        chapterList[targetsThisChapter].rule += buildFactionRuleHtml(
          rule,
          params.slug,
          false,
        );
        continue;
      }

      const html = buildFactionRuleHtml(rule, params.slug, true);

      if (subsectionAnchors.has(anchor)) {
        chapterList.push({
          key: `unit-rule-${rule.ruleId}`,
          id: null,
          name: rule.name,
          rule: html,
        });
        continue;
      }

      chapterByAnchor.set(anchor, chapterList.length);
      chapterList.push({
        key: `unit-rule-${rule.ruleId}`,
        id: anchor,
        name: rule.name,
        rule: html,
      });
    }

    const chapters = chapterList.map((chapter) => ({
      ...chapter,
      subsections: extractSubsections(chapter.rule),
    }));

    const jumpItems = chapters.flatMap(({ id, name }) =>
      id === null ? [] : [{ id, label: name }],
    );

    return (
      <>
        <Highlighter />
        <Breadcrumbs
          crumbs={[
            { href: "/", anchor: "2ed1993" },
            { href: "/rules", anchor: "Rules" },
            { anchor: category.name },
          ]}
        />
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                {category.name}
              </h1>
            </header>
            {heros.length === 1 && (
              <ImageWithCredit
                src={`images/${heros[0].file_name}`}
                title={heros[0].title}
                artist={heros[0].artist}
              />
            )}
            {heros.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {heros.map((hero) => (
                  <ImageWithCredit
                    key={hero.file_name}
                    src={`images/${hero.file_name}`}
                    title={hero.title}
                    artist={hero.artist}
                    aspect="aspect-portrait"
                    width="half"
                  />
                ))}
              </div>
            )}
          </Panel>

          {jumpItems.length > 1 && (
            <JumpBar
              className="self-stretch -mx-2 md:-mx-4"
              items={jumpItems}
            />
          )}

          <Panel className="flex flex-col gap-8 md:gap-12 w-full max-w-5xl p-4 md:p-8">
            {chapters.map((chapter) => (
              <section
                key={chapter.key}
                id={chapter.id ?? undefined}
                className="flex flex-col justify-center gap-4"
              >
                <div className="flex flex-col items-center gap-4 w-full">
                  <ChapterHeading title={chapter.name} />
                  {chapter.subsections.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {chapter.subsections.map((subsection) => (
                        <HighlighterLink
                          key={subsection.id}
                          href={`/rules/${params.slug}#${subsection.id}`}
                          className={CHIP_CLASS}
                        >
                          {subsection.name}
                        </HighlighterLink>
                      ))}
                    </div>
                  )}
                </div>
                <section
                  className="dynamic-content flex flex-col justify-center gap-4"
                  dangerouslySetInnerHTML={{ __html: chapter.rule }}
                />
              </section>
            ))}
          </Panel>
        </main>
      </>
    );
  }

  notFound();
}
