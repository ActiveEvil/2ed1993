import {
  ArmyListSummary,
  compositionLimit,
} from "@/components/ArmyListSummary";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  CHARACTERISTICS,
  CharacteristicRow,
  CharacteristicTable,
  ProfileFrame,
} from "@/components/CharacteristicProfile";
import { SectionHeading } from "@/components/Heading";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { JumpBar } from "@/components/JumpBar";
import { Logo } from "@/components/Logos";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { TitleBand } from "@/components/TitleBand";
import {
  UnitEquipment,
  cards,
  ruleName,
  unitHasEquipment,
} from "@/components/UnitEquipment";
import { generateAnchorId, ruleHref } from "@/lib/anchors";
import { armyListShortName, pageTitle, toPlainText } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/factions/[faction]/[list]";

const loadList = (faction: string, list: string) =>
  supabase
    .from("army_lists")
    .select(
      "id, name, description, factions!inner(slug, name), unit_categories(category, note, min_percent, max_percent, position, army_list_allowance_rules!army_list_allowance_rules_unit_category_id_fkey(id, count, per_count, note, per_entry:army_list_entries!army_list_allowance_rules_per_entry_id_fkey(units(name))), army_list_entries(id, position, allowance_min, allowance_max, points, note, transport_scope, entry_group:army_list_entry_groups(id, name, position), points_bases(name), army_list_entry_options(id, position, points, points_percent, note, unit_profile_id, unit_option_id, points_bases(name), weapons!army_list_entry_options_weapon_id_fkey(name)), army_list_allowance_rules!army_list_allowance_rules_army_list_entry_id_fkey(id, count, per_count, note, per_entry:army_list_entries!army_list_allowance_rules_per_entry_id_fkey(units(name))), units(id, name, factions(slug), datafaxes(id, points), unit_profiles(id, name, position, alternative, models_min, models_max, mastery_level, wargear_cards_max, m, ws, bs, s, t, w, i, a, ld, unit_profile_weapons(id, quantity, alternative, position, weapons(name)), unit_profile_armour(armour_id, position, alternative, save_override, armour(name)), unit_profile_wargear_cards(position, card:wargear_cards(name))), unit_options!unit_options_unit_id_fkey(id, models_min, models_max, models_per, whole_unit, quantity, grant_mode, restriction, note, option_group, position, profile:unit_profiles!unit_options_unit_profile_id_fkey(name), upgrade:unit_profiles!unit_options_to_unit_profile_id_fkey(name, units(name)), replaces:weapons!unit_options_replaces_weapon_id_fkey(name), grants:weapons!unit_options_weapon_id_fkey(name), grants_armour:armour!unit_options_armour_id_fkey(name), replaces_armour:armour!unit_options_replaces_armour_id_fkey(name), card:wargear_cards(name), unit_option_categories(position, wargear_categories(category))), unit_special_rule_assignments(position, note, rule:unit_special_rules(id, name, rule, rule_id, anchor, rules(id, name, rule_categories(slug))))))), army_list_allies!army_list_allies_army_list_id_fkey(id, position, note, factions(slug, name), ally_list:army_lists!army_list_allies_ally_army_list_id_fkey(slug, name, factions(slug, name))), wargear_categories(category, note, rules_heading, rules_intro, wargear_items(id, points, restriction, armour(name), weapons(name), units(name, factions(slug), datafaxes(points)), special_rule:unit_special_rules(id, name, rule, anchor, rules(name, rule_categories(slug)))))",
    )
    .eq("slug", list)
    .eq("factions.slug", faction)
    .order("position", { referencedTable: "unit_categories" })
    .order("position", { referencedTable: "unit_categories.army_list_entries" })
    .order("position", {
      referencedTable:
        "unit_categories.army_list_entries.army_list_entry_options",
    })
    .order("position", {
      referencedTable: "unit_categories.army_list_entries.units.unit_profiles",
    })
    .order("position", {
      referencedTable:
        "unit_categories.army_list_entries.units.unit_profiles.unit_profile_weapons",
    })
    .order("position", {
      referencedTable:
        "unit_categories.army_list_entries.units.unit_profiles.unit_profile_armour",
    })
    .order("position", {
      referencedTable:
        "unit_categories.army_list_entries.units.unit_profiles.unit_profile_wargear_cards",
    })
    .order("position", {
      referencedTable: "unit_categories.army_list_entries.units.unit_options",
    })
    .order("position", {
      referencedTable:
        "unit_categories.army_list_entries.units.unit_special_rule_assignments",
    })
    .order("position", { referencedTable: "army_list_allies" })
    .order("position", { referencedTable: "wargear_categories" })
    .order("position", { referencedTable: "wargear_categories.wargear_items" })
    .single();

const loadRuleCategories = () =>
  supabase.from("rule_categories").select("slug, factions!inner(slug)");

type List = NonNullable<Awaited<ReturnType<typeof loadList>>["data"]>;
type RawEntry = List["unit_categories"][number]["army_list_entries"][number];
type RawItem = List["wargear_categories"][number]["wargear_items"][number];
type ItemRule = NonNullable<RawItem["special_rule"]>;
type RawOption = RawEntry["army_list_entry_options"][number];

type Entry = {
  id: number;
  name: string;
  anchor: string;
  group: RawEntry["entry_group"];
  allowance: string | null;
  cost: string | null;
  graded: boolean;
  wargearCardsMax: number | null;
  note: string | null;
  transport: string | null;
  rules: string[];
  extras: string[];
  rows: CharacteristicRow[];
  datafaxHref: string | null;
  factionSlug: string;
  unit: RawEntry["units"];
  optionCosts: ReadonlyMap<number, string>;
  search: string;
};

const formatPoints = (points: number): string =>
  `${points}${points === 1 ? "pt" : "pts"}`;

const formatAllowance = (min: number, max: number | null): string | null =>
  max === null ? null : max === min ? String(min) : `${min}–${max}`;

const formatCost = (points: number, basis: string | null): string => {
  switch (basis) {
    case "Per model upgrade":
      return `+${formatPoints(points)} per model`;
    case "Per model":
      return `${formatPoints(points)} per model`;
    case "Per base":
      return `${formatPoints(points)} per base`;
    case "Per Mastery Level":
      return `+${formatPoints(points)} per Mastery Level`;
    default:
      return formatPoints(points);
  }
};

const formatOptionCost = (option: RawOption): string | null =>
  option.points_percent !== null
    ? `+${option.points_percent}% of the unit's points`
    : option.points === null
      ? null
      : formatCost(option.points, option.points_bases?.name ?? null);

const TRANSPORT_SCOPES: Readonly<Record<string, string>> = {
  characters: "Transport for any character.",
  squads: "Transport for any squad.",
  characters_and_squads: "Transport for any character or squad.",
};

const transportLine = (scope: string | null): string | null =>
  scope === null ? null : (TRANSPORT_SCOPES[scope] ?? null);

const range = (min: number, max: number | null): string =>
  max === null || max === min ? String(min) : `${min}–${max}`;

const ruleAnchor = (rule: ItemRule): string =>
  rule.anchor ?? generateAnchorId(rule.name);

const ruleTarget = (rule: ItemRule): { name: string; href: string } => ({
  name: rule.name,
  href: rule.rules ? ruleHref(rule.rules, rule.anchor) : `#${ruleAnchor(rule)}`,
});

const shortestName = (names: readonly string[]): string | null =>
  names.reduce<string | null>(
    (shortest, name) =>
      shortest === null || name.length < shortest.length ? name : shortest,
    null,
  );

const profileNotes = (profile: {
  mastery_level: number | null;
  wargear_cards_max: number | null;
}): string | null => {
  const notes = [
    profile.mastery_level === null ? null : `Mastery ${profile.mastery_level}`,
    profile.wargear_cards_max === null
      ? null
      : cards(profile.wargear_cards_max),
  ].filter((note): note is string => note !== null);

  return notes.length ? notes.join(" · ") : null;
};

const allowanceRule = (rule: {
  count: number;
  per_count: number;
  note: string | null;
  per_entry: { units: { name: string } } | null;
}): string | null => {
  if (rule.note !== null) {
    return rule.note;
  }

  if (rule.per_count === 1 && rule.per_entry) {
    return `Up to ${rule.count} per ${rule.per_entry.units.name}`;
  }

  return null;
};

const buildEntry = (
  entry: RawEntry,
  category: string,
  listFactionSlug: string,
): Entry => {
  const basis = entry.points_bases?.name ?? null;
  const options = entry.army_list_entry_options;
  const profiles = entry.units.unit_profiles;

  const gradeByProfile = new Map<
    number,
    { points: number; basis: string | null }
  >();

  for (const option of options) {
    if (option.unit_profile_id !== null && option.points !== null) {
      gradeByProfile.set(option.unit_profile_id, {
        points: option.points,
        basis: option.points_bases?.name ?? null,
      });
    }
  }

  const optionCosts = new Map<number, string>();

  for (const option of options) {
    const cost = formatOptionCost(option);

    if (option.unit_option_id !== null && cost !== null) {
      optionCosts.set(option.unit_option_id, cost);
    }
  }

  const graded =
    entry.points === null &&
    profiles.length > 1 &&
    profiles.every(({ id }) => gradeByProfile.has(id));

  const wargearCardsMax =
    profiles.length > 0 &&
    profiles.every(
      (profile) => profile.wargear_cards_max === profiles[0].wargear_cards_max,
    ) &&
    profiles[0].wargear_cards_max !== null
      ? profiles[0].wargear_cards_max
      : null;

  const datafax = entry.units.datafaxes;
  const factionSlug = entry.units.factions?.slug ?? listFactionSlug;

  let cost: string | null = null;

  if (entry.points !== null) {
    cost = formatCost(entry.points, basis);
  } else if (
    basis === "See datafax" &&
    datafax !== null &&
    datafax.points !== null
  ) {
    cost = formatPoints(datafax.points);
  } else if (!graded) {
    const priced = options
      .filter((option) => option.unit_option_id === null)
      .map(({ points }) => points)
      .filter((points): points is number => points !== null);

    if (priced.length) {
      const lowest = Math.min(...priced);
      const highest = Math.max(...priced);

      cost =
        lowest === highest
          ? formatPoints(highest)
          : `${lowest}–${formatPoints(highest)}`;
    }
  }

  const rows: CharacteristicRow[] = profiles.map((profile) => {
    const grade = graded ? gradeByProfile.get(profile.id) : undefined;

    return {
      id: profile.id,
      name: profile.name,
      alternative: profile.alternative,
      count: range(profile.models_min, profile.models_max),
      note: profileNotes({
        mastery_level: profile.mastery_level,
        wargear_cards_max:
          wargearCardsMax === null ? profile.wargear_cards_max : null,
      }),
      cost: grade ? formatCost(grade.points, grade.basis) : null,
      ...Object.fromEntries(
        CHARACTERISTICS.map(({ key }) => [key, profile[key]]),
      ),
    } as CharacteristicRow;
  });

  const search = [
    entry.units.name,
    category,
    entry.units.datafaxes ? "datafax" : "",
    cost ?? "",
    ...rows.map((row) => `${row.name} ${row.cost ?? ""}`),
    ...profiles.flatMap((profile) => [
      ...profile.unit_profile_weapons.map(({ weapons }) => weapons.name),
      ...profile.unit_profile_armour.map(({ armour }) => armour.name),
    ]),
    ...options.map((option) => option.weapons?.name ?? ""),
    ...entry.units.unit_options.flatMap((option) => [
      option.profile?.name ?? "",
      option.upgrade?.units.name ?? "",
      option.grants?.name ?? "",
      option.card?.name ?? "",
      option.replaces?.name ?? "",
      ...option.unit_option_categories.map(
        ({ wargear_categories }) => wargear_categories.category,
      ),
    ]),
    ...entry.units.unit_special_rule_assignments.map((assignment) =>
      assignment.rule ? ruleName(assignment.rule.name) : "",
    ),
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: entry.id,
    name: entry.units.name,
    anchor: generateAnchorId(entry.units.name),
    group: entry.entry_group,
    allowance: formatAllowance(entry.allowance_min, entry.allowance_max),
    cost,
    graded,
    wargearCardsMax,
    note: entry.note,
    transport: transportLine(entry.transport_scope),
    rules: entry.army_list_allowance_rules
      .map(allowanceRule)
      .filter((text): text is string => text !== null),
    extras: graded
      ? []
      : options
          .filter(
            (option) =>
              option.unit_profile_id === null && option.unit_option_id === null,
          )
          .map((option) => {
            if (option.note) {
              return option.note;
            }

            if (option.weapons) {
              const cost = formatOptionCost(option);

              return `${option.weapons.name}${cost === null ? "" : `, ${cost}`}`;
            }

            return null;
          })
          .filter((text): text is string => text !== null),
    rows,
    datafaxHref: datafax
      ? `/datafaxes/${factionSlug}#${generateAnchorId(entry.units.name)}`
      : null,
    factionSlug,
    unit: entry.units,
    optionCosts,
    search,
  };
};

type Run = { group: Entry["group"]; entries: Entry[] };

const groupRuns = (entries: Entry[]): Run[] => {
  const runs: Run[] = [];

  for (const entry of entries) {
    const last = runs[runs.length - 1];

    if (last && (last.group?.id ?? null) === (entry.group?.id ?? null)) {
      last.entries.push(entry);
    } else {
      runs.push({ group: entry.group, entries: [entry] });
    }
  }

  return runs;
};

type Block = { note: string | null; entries: Entry[] };

const groupBlocks = (entries: Entry[]): Block[] => {
  const runs: Block[] = [];

  for (const entry of entries) {
    const last = runs[runs.length - 1];

    if (last && entry.note !== null && last.note === entry.note) {
      last.entries.push(entry);
    } else {
      runs.push({ note: entry.note, entries: [entry] });
    }
  }

  const grouped: Block[] = [];

  for (const run of runs) {
    if (run.note !== null && run.entries.length > 1) {
      grouped.push(run);
      continue;
    }

    const last = grouped[grouped.length - 1];

    if (last && last.note === null) {
      last.entries.push(...run.entries);
    } else {
      grouped.push({ note: null, entries: run.entries });
    }
  }

  return grouped;
};

const EntryHeading: React.FC<
  { grouped: boolean; className?: string } & React.PropsWithChildren
> = ({ grouped, className, children }): React.JSX.Element => {
  const Tag = grouped ? "h4" : "h3";

  return <Tag className={className}>{children}</Tag>;
};

const Details: React.FC<{ entry: Entry; showNote: boolean }> = ({
  entry,
  showNote,
}): React.JSX.Element | null => {
  const note = showNote ? entry.note : null;

  if (
    !note &&
    !entry.transport &&
    !entry.rules.length &&
    !entry.extras.length
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      {entry.transport && <p>{entry.transport}</p>}
      {note && <p>{note}</p>}
      {entry.rules.map((text, index) => (
        <p key={index}>{text}</p>
      ))}
      {entry.extras.map((text, index) => (
        <p key={index}>{text}</p>
      ))}
    </div>
  );
};

export async function generateMetadata(props: {
  params: Promise<{ faction: string; list: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: list, error: listError } = await supabase
    .from("army_lists")
    .select("name, description, factions!inner(name, slug)")
    .eq("slug", params.list)
    .eq("factions.slug", params.faction)
    .single();

  assertNoQueryErrors(CONTEXT, listError);

  if (list) {
    const { name, description, factions: faction } = list;
    const plainDescription = description ? toPlainText(description) : null;

    return {
      title: pageTitle(name),
      description:
        plainDescription && plainDescription.length <= 155
          ? plainDescription
          : `${armyListShortName(name, faction.name)} for ${faction.name} in Warhammer 40,000 2nd Edition, with unit entries, points values, wargear options and army list restrictions.`,
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ faction: string; list: string }>;
}) {
  const params = await props.params;
  const [
    { data: list, error: listError },
    { data: ruleCategoryRows, error: ruleCategoriesError },
  ] = await Promise.all([
    loadList(params.faction, params.list),
    loadRuleCategories(),
  ]);

  assertNoQueryErrors(CONTEXT, listError, ruleCategoriesError);

  if (list) {
    const faction = list.factions;
    const rulesSlugByFaction = new Map(
      (ruleCategoryRows ?? []).map(({ slug, factions }) => [
        factions.slug,
        slug,
      ]),
    );
    const listHref = `/factions/${faction.slug}/${params.list}`;
    const stockedSections = list.wargear_categories.filter(
      ({ wargear_items }) => wargear_items.length,
    );
    const stockedByName = new Map(
      stockedSections.map((section) => [section.category, section]),
    );
    const categoryHref = (category: string): string | null =>
      stockedByName.has(category) ? `#${generateAnchorId(category)}` : null;

    const bands = list.unit_categories.map((section) => ({
      category: section.category,
      min: section.min_percent,
      max: section.max_percent,
    }));

    const categories = list.unit_categories.map((section) => ({
      category: section.category,
      limit: compositionLimit({
        category: section.category,
        min: section.min_percent,
        max: section.max_percent,
      }),
      note: section.note,
      rules: section.army_list_allowance_rules
        .map(allowanceRule)
        .filter((text): text is string => text !== null),
      entries: section.army_list_entries.map((entry) =>
        buildEntry(entry, section.category, faction.slug),
      ),
    }));

    const seenAnchors = new Set<string>([
      "Equipment",
      "Army_Composition_Chart",
      ...categories.map(({ category }) => generateAnchorId(category)),
      ...stockedSections.map(({ category }) => generateAnchorId(category)),
    ]);

    for (const { entries } of categories) {
      for (const entry of entries) {
        if (!seenAnchors.has(entry.anchor)) {
          seenAnchors.add(entry.anchor);
          continue;
        }

        const base = `${entry.anchor}_${generateAnchorId(entry.factionSlug)}`;
        let anchor = base;
        let suffix = 2;

        while (seenAnchors.has(anchor)) {
          anchor = `${base}_${suffix}`;
          suffix += 1;
        }

        seenAnchors.add(anchor);
        entry.anchor = anchor;
      }
    }

    const anchorByUnit = new Map<string, string>();

    for (const { entries } of categories) {
      for (const entry of entries) {
        if (!anchorByUnit.has(entry.name)) {
          anchorByUnit.set(entry.name, entry.anchor);
        }
      }
    }

    const entryAnchor = (unitName: string): string =>
      anchorByUnit.get(unitName) ?? generateAnchorId(unitName);

    const allies = list.army_list_allies.flatMap((ally) => {
      if (ally.ally_list) {
        return [
          {
            id: ally.id,
            name: ally.ally_list.name,
            href: `/factions/${ally.ally_list.factions.slug}/${ally.ally_list.slug}`,
            note: ally.note,
          },
        ];
      }

      if (ally.factions) {
        return [
          {
            id: ally.id,
            name: ally.factions.name,
            href: `/factions/${ally.factions.slug}`,
            note: ally.note,
          },
        ];
      }

      return [];
    });

    const stockedItems = stockedSections.flatMap(({ wargear_items }) =>
      wargear_items
        .map(
          ({ armour, weapons, units, special_rule }) =>
            armour?.name ??
            weapons?.name ??
            units?.name ??
            special_rule?.name ??
            null,
        )
        .filter((name): name is string => name !== null),
    );

    const itemRuleGroups = stockedSections.flatMap((section) => {
      const rules = [
        ...new Map(
          section.wargear_items
            .map(({ special_rule }) => special_rule)
            .filter(
              (rule): rule is ItemRule => rule !== null && rule.rule !== null,
            )
            .map((rule) => [rule.id, rule]),
        ).values(),
      ];

      if (!rules.length) {
        return [];
      }

      return [
        {
          heading: section.rules_heading ?? section.category,
          id: section.rules_heading
            ? generateAnchorId(section.rules_heading)
            : `${generateAnchorId(section.category)}_Rules`,
          intro: section.rules_intro,
          rules,
        },
      ];
    });

    const itemRuleCount = itemRuleGroups.reduce(
      (total, group) => total + group.rules.length,
      0,
    );

    const filterableRows =
      categories.reduce((total, { entries }) => total + entries.length, 0) +
      stockedItems.length +
      itemRuleCount;

    const examples = new Set(
      [
        shortestName(
          categories.flatMap(({ entries }) => entries.map(({ name }) => name)),
        ),
        shortestName(stockedItems),
        shortestName(stockedSections.map(({ category }) => category)),
      ]
        .filter((name): name is string => name !== null)
        .map((name) => name.toLowerCase()),
    );

    const jumpItems = [
      ...categories.map(({ category }) => ({
        id: generateAnchorId(category),
        label: category,
      })),
      ...(stockedSections.length
        ? [{ id: "Equipment", label: "Equipment" }]
        : []),
    ];

    const [title, subtitle] = list.name.split(": ");

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
              href: "/factions",
              anchor: "Factions",
            },
            {
              href: `/factions/${faction.slug}`,
              anchor: faction.name,
            },
            {
              anchor: list.name,
            },
          ]}
        />
        <Panel as="main" className="flex flex-col w-full max-w-5xl">
          <TitleBand
            eyebrow="Army List"
            heading={
              <Logo
                as="h1"
                size="lg"
                title={title}
                subtitle={subtitle}
                dropCaps
              />
            }
          >
            {list.description && (
              <section
                className="dynamic-content measure flex flex-col gap-4"
                dangerouslySetInnerHTML={{ __html: list.description }}
              />
            )}
          </TitleBand>
          <div className="flex flex-col lg:flex-row">
            {Boolean(jumpItems.length) && (
              <JumpBar rail items={jumpItems}>
                {filterableRows > 0 && (
                  <RowFilter
                    label="Filter"
                    unit="entries"
                    total={filterableRows}
                    placeholder={`e.g. ${[...examples].join(", ")}`}
                  />
                )}
              </JumpBar>
            )}
            <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
              <section data-group className="flex flex-col gap-12">
                <ArmyListSummary bands={bands} allies={allies} />

                {categories.length ? (
                  categories.map((section) => {
                    const { entries } = section;

                    return (
                      <section
                        key={section.category}
                        id={generateAnchorId(section.category)}
                        data-group
                        className="flex flex-col gap-4"
                      >
                        <SectionHeading>{section.category}</SectionHeading>

                        {section.limit && (
                          <p className="font-subtitle text-xs uppercase tracking-widest">
                            {section.limit}
                          </p>
                        )}

                        {section.note && (
                          <div
                            className="dynamic-content compact"
                            dangerouslySetInnerHTML={{ __html: section.note }}
                          />
                        )}

                        {Boolean(section.rules.length) && (
                          <div className="flex flex-col gap-1 text-sm">
                            {section.rules.map((text, index) => (
                              <p key={index}>{text}</p>
                            ))}
                          </div>
                        )}

                        {entries.length ? (
                          <div className="flex flex-col gap-6">
                            {groupRuns(entries).map((run) => (
                              <div
                                key={run.entries[0].id}
                                className="flex flex-col gap-6"
                              >
                                {run.group && (
                                  <h3 className="mt-3 font-subtitle uppercase tracking-widest text-sm">
                                    {run.group.name}
                                  </h3>
                                )}
                                {groupBlocks(run.entries).map((block) => (
                                  <div
                                    key={block.entries[0].id}
                                    className={
                                      block.note
                                        ? "flex flex-col gap-3 bg-group-surface pb-4"
                                        : "flex flex-col gap-3"
                                    }
                                  >
                                    <div className="flex flex-col gap-4">
                                      {block.entries.map((entry) => (
                                        <article
                                          key={entry.id}
                                          id={entry.anchor}
                                          data-search={entry.search}
                                          className="group flex min-w-0 flex-col gap-1 py-4 px-2 md:px-4 target:bg-2ed-light-yellow target:text-black"
                                        >
                                          <div className="flex items-baseline gap-x-3 text-lg">
                                            <EntryHeading
                                              grouped={Boolean(run.group)}
                                              className="min-w-0 shrink font-subtitle text-xl md:text-2xl"
                                            >
                                              <HighlighterLink
                                                className="hover:underline underline-offset-4"
                                                href={`${listHref}#${entry.anchor}`}
                                              >
                                                {entry.name}
                                              </HighlighterLink>
                                            </EntryHeading>
                                            {entry.allowance && (
                                              <span className="shrink-0">
                                                {entry.allowance}
                                              </span>
                                            )}
                                            {entry.datafaxHref && (
                                              <Link
                                                href={entry.datafaxHref}
                                                className="shrink-0 font-subtitle text-xs uppercase tracking-widest underline underline-offset-4"
                                              >
                                                Datafax
                                              </Link>
                                            )}
                                            <span
                                              className="grow shrink-0 basis-8 border-b-2 border-dotted border-leader-ink"
                                              aria-hidden="true"
                                            />
                                            <span className="shrink-0 whitespace-nowrap">
                                              {entry.graded
                                                ? "see grades"
                                                : entry.cost}
                                            </span>
                                          </div>
                                          <Details
                                            entry={entry}
                                            showNote={block.note === null}
                                          />
                                          {Boolean(
                                            entry.rows.length ||
                                            unitHasEquipment(entry.unit),
                                          ) && (
                                            <ProfileFrame className="mt-1 min-w-0">
                                              {Boolean(entry.rows.length) && (
                                                <CharacteristicTable
                                                  caption={`${entry.name} profile`}
                                                  rows={entry.rows}
                                                  costLabel="Pts"
                                                />
                                              )}
                                              <UnitEquipment
                                                unit={entry.unit}
                                                optionCosts={entry.optionCosts}
                                                wargearCardsMax={
                                                  entry.wargearCardsMax
                                                }
                                                compact
                                                categoryHref={categoryHref}
                                                entryAnchor={entryAnchor}
                                                rulesSlug={
                                                  rulesSlugByFaction.get(
                                                    entry.factionSlug,
                                                  ) ?? null
                                                }
                                                className={
                                                  entry.rows.length
                                                    ? "border-t-4 border-frame"
                                                    : undefined
                                                }
                                              />
                                            </ProfileFrame>
                                          )}
                                        </article>
                                      ))}
                                    </div>
                                    {block.note && (
                                      <p className="px-2 md:px-4 text-sm">
                                        {block.note}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm">No entries transcribed yet.</p>
                        )}
                      </section>
                    );
                  })
                ) : (
                  <p>This army list has not been transcribed yet.</p>
                )}
              </section>
              {Boolean(stockedSections.length) && (
                <section
                  id="Equipment"
                  data-group
                  className="flex flex-col gap-8"
                >
                  <SectionHeading>Equipment</SectionHeading>
                  <ul className="md:columns-2 gap-8 space-y-4">
                    {stockedSections.map((section) => (
                      <li
                        key={section.category}
                        data-group
                        className="flex flex-col gap-2 break-inside-avoid-column"
                      >
                        <h3
                          id={generateAnchorId(section.category)}
                          className="font-subtitle text-2xl capitalize"
                        >
                          {section.category}
                        </h3>
                        <p>{section.note}</p>
                        <ul>
                          {section.wargear_items.map((item) => {
                            const target = item.armour
                              ? {
                                  name: item.armour.name,
                                  href: `/wargear/armour#${generateAnchorId(item.armour.name)}`,
                                }
                              : item.weapons
                                ? {
                                    name: item.weapons.name,
                                    href: `/wargear/weapons#${generateAnchorId(item.weapons.name)}`,
                                  }
                                : item.units
                                  ? {
                                      name: item.units.name,
                                      href: `/datafaxes/${item.units.factions?.slug ?? faction.slug}#${generateAnchorId(item.units.name)}`,
                                    }
                                  : item.special_rule
                                    ? ruleTarget(item.special_rule)
                                    : null;

                            if (!target) {
                              return null;
                            }

                            const datafaxPoints =
                              item.units?.datafaxes?.points ?? null;
                            const price =
                              item.points !== null
                                ? formatPoints(item.points)
                                : datafaxPoints !== null
                                  ? formatPoints(datafaxPoints)
                                  : item.units
                                    ? "See Datafax"
                                    : "";
                            const search = [
                              target.name,
                              item.restriction ?? "",
                              section.category,
                              price,
                            ]
                              .join(" ")
                              .toLowerCase();

                            return (
                              <li
                                key={item.id}
                                data-search={search}
                                data-refs={
                                  item.special_rule?.rule
                                    ? ruleAnchor(item.special_rule)
                                    : undefined
                                }
                                className="flex items-baseline gap-2 text-lg"
                              >
                                <Link
                                  href={target.href}
                                  className="whitespace-nowrap underline underline-offset-4"
                                >
                                  {target.name}
                                </Link>
                                {item.restriction && (
                                  <span className="text-sm">
                                    ({item.restriction})
                                  </span>
                                )}
                                <span
                                  className="flex-1 border-b-2 border-dotted border-leader-ink"
                                  aria-hidden="true"
                                />
                                <span className="whitespace-nowrap">
                                  {price}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  {Boolean(itemRuleGroups.length) && (
                    <div className="flex flex-col gap-8">
                      {itemRuleGroups.map((group) => (
                        <div
                          key={group.id}
                          data-group
                          className="flex flex-col gap-4"
                        >
                          <h3
                            id={group.id}
                            className="font-subtitle text-2xl px-2 md:px-4"
                          >
                            {group.heading}
                          </h3>
                          {group.intro && (
                            <div
                              className="dynamic-content measure px-2 md:px-4"
                              dangerouslySetInnerHTML={{ __html: group.intro }}
                            />
                          )}
                          {group.rules.map((rule) => (
                            <article
                              key={rule.id}
                              id={ruleAnchor(rule)}
                              data-search={rule.name.toLowerCase()}
                              className="flex flex-col gap-1 py-4 px-2 md:px-4 target:bg-2ed-light-yellow target:text-black"
                            >
                              <h4 className="font-subtitle text-xl">
                                {rule.name}
                              </h4>
                              <div
                                className="dynamic-content measure"
                                dangerouslySetInnerHTML={{
                                  __html: rule.rule ?? "",
                                }}
                              />
                            </article>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
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

  notFound();
}
