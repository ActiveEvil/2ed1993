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
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { SectionBar } from "@/components/SectionBar";
import { UnitEquipment, unitHasEquipment } from "@/components/UnitEquipment";
import { generateAnchorId } from "@/lib/anchors";
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
      "id, name, description, factions!inner(slug, name), unit_categories(category, note, min_percent, max_percent, position, army_list_entries(id, position, allowance_min, allowance_max, points, note, points_bases(name), army_list_entry_options(id, position, points, points_percent, note, unit_profile_id, unit_option_id, points_bases(name), weapons!army_list_entry_options_weapon_id_fkey(name)), army_list_allowance_rules!army_list_allowance_rules_army_list_entry_id_fkey(id, count, per_count, note, per_entry:army_list_entries!army_list_allowance_rules_per_entry_id_fkey(units(name))), units(id, name, datafaxes(id), unit_profiles(id, name, position, alternative, models_min, models_max, mastery_level, wargear_cards_max, m, ws, bs, s, t, w, i, a, ld, unit_profile_weapons(id, quantity, alternative, position, weapons(name)), unit_profile_armour(armour_id, position, armour(name))), unit_options!unit_options_unit_id_fkey(id, models_min, models_max, models_per, whole_unit, quantity, grant_mode, restriction, note, option_group, position, profile:unit_profiles!unit_options_unit_profile_id_fkey(name), upgrade:unit_profiles!unit_options_to_unit_profile_id_fkey(name, units(name)), replaces:weapons!unit_options_replaces_weapon_id_fkey(name), grants:weapons!unit_options_weapon_id_fkey(name), card:wargear_cards(name), unit_option_categories(position, wargear_categories(category)))))), army_list_allies!army_list_allies_army_list_id_fkey(id, position, note, factions(slug, name), ally_list:army_lists!army_list_allies_ally_army_list_id_fkey(slug, name, factions(slug, name))), wargear_categories(category, note, wargear_items(id, points, armour(name), weapons(name)))",
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
      referencedTable: "unit_categories.army_list_entries.units.unit_options",
    })
    .order("position", { referencedTable: "army_list_allies" })
    .order("position", { referencedTable: "wargear_categories" })
    .order("position", { referencedTable: "wargear_categories.wargear_items" })
    .single();

type List = NonNullable<Awaited<ReturnType<typeof loadList>>["data"]>;
type RawEntry = List["unit_categories"][number]["army_list_entries"][number];
type RawOption = RawEntry["army_list_entry_options"][number];

type Entry = {
  id: number;
  name: string;
  anchor: string;
  allowance: string | null;
  cost: string | null;
  graded: boolean;
  note: string | null;
  rules: string[];
  extras: string[];
  rows: CharacteristicRow[];
  datafax: boolean;
  unit: RawEntry["units"];
  optionCosts: ReadonlyMap<number, string>;
  search: string;
};

const toPlainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

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

const range = (min: number, max: number | null): string =>
  max === null || max === min ? String(min) : `${min}–${max}`;

const shortestName = (names: readonly string[]): string | null =>
  names.reduce<string | null>(
    (shortest, name) =>
      shortest === null || name.length < shortest.length ? name : shortest,
    null,
  );

const cards = (count: number): string =>
  `${count} wargear card${count === 1 ? "" : "s"}`;

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

const buildEntry = (entry: RawEntry, category: string): Entry => {
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

  let cost: string | null = null;

  if (entry.points !== null) {
    cost = formatCost(entry.points, basis);
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
      note: profileNotes(profile),
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
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: entry.id,
    name: entry.units.name,
    anchor: generateAnchorId(entry.units.name),
    allowance: formatAllowance(entry.allowance_min, entry.allowance_max),
    cost,
    graded,
    note: entry.note,
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
    datafax: Boolean(entry.units.datafaxes),
    unit: entry.units,
    optionCosts,
    search,
  };
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

const Details: React.FC<{ entry: Entry; showNote: boolean }> = ({
  entry,
  showNote,
}): React.JSX.Element | null => {
  const note = showNote ? entry.note : null;

  if (!note && !entry.rules.length && !entry.extras.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      {note && <p>{note}</p>}
      {entry.rules.map((text) => (
        <p key={text}>{text}</p>
      ))}
      {entry.extras.map((text) => (
        <p key={text}>{text}</p>
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
    return {
      title: name + " in Warhammer 40,000 2nd Edition | 2ed1993",
      description: description
        ? toPlainText(description)
        : `The ${name} army list for ${faction.name} in Warhammer 40,000 2nd Edition.`,
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ faction: string; list: string }>;
}) {
  const params = await props.params;
  const { data: list, error: listError } = await loadList(
    params.faction,
    params.list,
  );

  assertNoQueryErrors(CONTEXT, listError);

  if (list) {
    const faction = list.factions;
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
      note: section.note,
    }));

    const categories = list.unit_categories.map((section) => ({
      category: section.category,
      limit: compositionLimit({
        category: section.category,
        min: section.min_percent,
        max: section.max_percent,
        note: section.note,
      }),
      entries: section.army_list_entries.map((entry) =>
        buildEntry(entry, section.category),
      ),
    }));

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
        .map(({ armour, weapons }) => armour?.name ?? weapons?.name ?? null)
        .filter((name): name is string => name !== null),
    );

    const filterableRows =
      categories.reduce((total, { entries }) => total + entries.length, 0) +
      stockedItems.length;

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
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                {list.name}
              </h1>
            </header>
            {list.description && (
              <section
                className="dynamic-content flex flex-col gap-4"
                dangerouslySetInnerHTML={{ __html: list.description }}
              />
            )}
          </Panel>
          {Boolean(jumpItems.length) && (
            <JumpBar
              className="self-stretch -mx-2 md:-mx-4"
              items={jumpItems}
              label="Jump to"
            >
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
          <Panel className="flex flex-col gap-4 w-full max-w-5xl pb-4 md:pb-8">
            <section data-group className="flex flex-col gap-8">
              <div className="mt-4 px-4 md:px-8">
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    Army List
                  </h2>
                </div>
              </div>

              <ArmyListSummary
                bands={bands}
                allies={allies}
                className="mx-4 md:mx-8"
              />

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
                      <SectionBar
                        as="h2"
                        title={section.category}
                        note={section.limit}
                        className="mx-4 md:mx-8"
                      />

                      {entries.length ? (
                        <div className="flex flex-col gap-6">
                          {groupBlocks(entries).map((block) => (
                            <div
                              key={block.entries[0].id}
                              className={
                                block.note
                                  ? "flex flex-col gap-3 bg-group-surface pt-4"
                                  : "flex flex-col gap-3"
                              }
                            >
                              {block.note && (
                                <p className="max-w-[70ch] px-4 md:px-8 text-sm italic">
                                  {block.note}
                                </p>
                              )}
                              <div className="flex flex-col gap-4">
                                {block.entries.map((entry) => (
                                  <article
                                    key={entry.id}
                                    id={entry.anchor}
                                    data-search={entry.search}
                                    className="group flex min-w-0 flex-col gap-1 py-4 px-4 md:px-8 target:bg-2ed-light-yellow target:text-black"
                                  >
                                    <div className="flex items-baseline gap-x-3 text-lg">
                                        <h4 className="grow font-subtitle text-lg md:text-2xl">
                                          <HighlighterLink
                                            className="hover:underline underline-offset-4"
                                            href={`${listHref}#${entry.anchor}`}
                                          >
                                            {entry.name}
                                          </HighlighterLink>
                                        </h4>
                                        {entry.allowance && (
                                          <span>{entry.allowance}</span>
                                        )}
                                        {entry.datafax && (
                                          <Link
                                            href={`/datafaxes/${faction.slug}#${entry.anchor}`}
                                            className="font-subtitle text-xs uppercase tracking-[0.14em] underline underline-offset-4"
                                          >
                                            Datafax
                                          </Link>
                                        )}
                                        <span
                                          className="grow basis-8 border-b-2 border-dotted border-leader-ink"
                                          aria-hidden="true"
                                        />
                                        <span className="whitespace-nowrap">
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
                                          compact
                                          categoryHref={categoryHref}
                                          className={
                                            entry.rows.length
                                              ? "border-t-4 border-black"
                                              : undefined
                                          }
                                        />
                                      </ProfileFrame>
                                    )}
                                  </article>
                                ))}
                              </div>
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
                <p className="mx-4 md:mx-8">
                  This army list has not been transcribed yet.
                </p>
              )}
            </section>
            {Boolean(stockedSections.length) && (
              <section
                id="Equipment"
                data-group
                className="flex flex-col gap-8"
              >
                <div className="mt-4 px-4 md:px-8">
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      Equipment
                    </h2>
                  </div>
                </div>
                <ul className="md:columns-3 gap-8 [&>*:nth-child(n+2)]:mt-4 px-4 md:px-8">
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
                      <p>{section.note} 0000</p>
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
                              : null;

                          if (!target) {
                            return null;
                          }

                          const price =
                            item.points === null
                              ? ""
                              : formatPoints(item.points);
                          const search = [target.name, section.category, price]
                            .join(" ")
                            .toLowerCase();

                          return (
                            <li
                              key={item.id}
                              data-search={search}
                              className="flex items-baseline gap-2 text-lg"
                            >
                              <Link
                                href={target.href}
                                className="whitespace-nowrap underline underline-offset-4"
                              >
                                {target.name}
                              </Link>
                              <span
                                className="flex-1 border-b-2 border-dotted border-leader-ink"
                                aria-hidden="true"
                              />
                              <span className="whitespace-nowrap">
                                {item.points}
                                {item.points === 1 ? "pt" : "pts"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <p
              data-empty
              hidden
              className="mx-4 md:mx-8 p-6 border-4 border-black bg-2ed-light-green text-2ed-black text-lg"
            >
              Nothing matches that filter.
            </p>
          </Panel>
        </main>
      </>
    );
  }

  notFound();
}
