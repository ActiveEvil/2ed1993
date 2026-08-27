import { HighlighterLink } from "./Highlighter";
import { ImageWithCredit } from "./ImageWithCredit";
import { WeaponDataTable, WeaponProfileRow } from "./WeaponProfile";
import { generateAnchorId } from "@/lib/anchors";
import { factionColors, factionInk } from "@/lib/factions";
import { clsx } from "clsx";
import Link from "next/link";
import { Fragment } from "react";

const DASH = "–";

export type DatafaxData = {
  speed_slow: number | null;
  speed_combat: number | null;
  speed_fast: number | null;
  ram_strength: number | null;
  ram_damage: string | null;
  ram_save_modifier: number | null;
  crew: number | null;
  transport_capacity: number | null;
  capacity_inside: number | null;
  capacity_roof: number | null;
  open_topped: boolean | null;
  large_target: boolean | null;
  deployment: string | null;
  location_dice: string;
  note: string | null;
  points: number | null;
  motive_types: { name: string } | null;
  datafax_images: {
    images: { file_name: string; artist: string | null; title: string };
  }[];
  datafax_weapons: {
    id: number;
    mount: string | null;
    firing_arc_degrees: number | null;
    arc_note: string | null;
    linked_group: number | null;
    quantity: number;
    alternative: number;
    optional: boolean;
    points: number | null;
    weapons: {
      name: string;
      weapon_profiles: WeaponProfileRow[];
    };
  }[];
  datafax_locations: {
    id: number;
    roll_min: number;
    roll_max: number;
    name: string;
    armour_front: number | null;
    armour_side_rear: number | null;
    damage_chart_id: number | null;
    note: string | null;
  }[];
  damage_charts: {
    id: number;
    name: string;
    dice: string;
    damage_chart_results: {
      id: number;
      roll_min: number;
      roll_max: number;
      effect: string;
    }[];
  }[];
};

const MARKERS = ["†", "‡", "§"];

const FACE_HEADING = "font-subtitle text-xl text-2ed-dark-red";
const SUB_HEADING = "font-subtitle uppercase tracking-wide text-sm";
const RUN_LABEL = "font-subtitle uppercase text-xs";
const MIDDOT = " · ";

type DataRun = { label: string; value: React.ReactNode };

const balance = <Block extends { weight: number }>(
  blocks: Block[],
  offset = 0,
): [Block[], Block[]] => {
  if (blocks.length > 12) {
    const half = Math.ceil(blocks.length / 2);
    return [blocks.slice(0, half), blocks.slice(half)];
  }

  const total = offset + blocks.reduce((sum, { weight }) => sum + weight, 0);
  let best = 0;
  let bestGap = Infinity;

  for (let mask = 0; mask < 1 << blocks.length; mask++) {
    let left = offset;
    for (let i = 0; i < blocks.length; i++) {
      if (mask & (1 << i)) left += blocks[i].weight;
    }
    const gap = Math.abs(total - 2 * left);
    if (gap < bestGap) {
      bestGap = gap;
      best = mask;
    }
  }

  return [
    blocks.filter((_, i) => best & (1 << i)),
    blocks.filter((_, i) => !(best & (1 << i))),
  ];
};

const textWeight = (html: string): number => {
  const text = html.replace(/<[^>]+>/g, "");
  return 26 + Math.ceil(text.length / 58) * 26;
};

const cost = (value: number): string =>
  `+${Number.isInteger(value) ? value : value.toFixed(1)} point${value === 1 ? "" : "s"}`;

const fitting = (weapon: {
  mount: string | null;
  firing_arc_degrees: number | null;
  arc_note: string | null;
}): React.ReactNode => (
  <>
    {weapon.mount && <>, {weapon.mount}</>}
    {weapon.firing_arc_degrees === null ? (
      weapon.arc_note && <>, {weapon.arc_note}</>
    ) : (
      <>, {weapon.firing_arc_degrees}&deg; field of fire</>
    )}
  </>
);

const joinOr = (parts: React.ReactNode[]): React.ReactNode[] =>
  parts.flatMap((part, index) =>
    index === 0 ? [part] : [index === parts.length - 1 ? " or " : ", ", part],
  );

const stat = (value: number | null): string =>
  value === null ? DASH : String(value);

const range = (min: number, max: number | null): string =>
  max === null || max === min ? String(min) : `${min}${DASH}${max}`;

const Run: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }): React.JSX.Element => (
  <span className="whitespace-normal">
    <span className={clsx(RUN_LABEL, "mr-1.5")}>{label}</span>
    {children}
  </span>
);

export const Datafax: React.FC<{
  datafax: DatafaxData;
  factionSlug: string;
  unitName: string;
  unitTypeName: string;
  titleHref?: string;
}> = ({
  datafax,
  factionSlug,
  unitName,
  unitTypeName,
  titleHref,
}): React.JSX.Element => {
  const ink = factionInk[factionSlug] ?? "text-2ed-light-yellow";
  const Title = titleHref ? "h3" : "h4";

  const speeds = [
    { label: "Slow", value: datafax.speed_slow },
    { label: "Combat", value: datafax.speed_combat },
    { label: "Fast", value: datafax.speed_fast },
  ].filter(
    (speed): speed is { label: string; value: number } => speed.value !== null,
  );

  const ram = [
    { label: "Str", value: stat(datafax.ram_strength) },
    { label: "Dam", value: datafax.ram_damage ?? DASH },
    { label: "Save", value: stat(datafax.ram_save_modifier) },
  ];

  const capacity = [
    { label: "Crew", value: datafax.crew },
    { label: "Transport", value: datafax.transport_capacity },
    { label: "Inside", value: datafax.capacity_inside },
    { label: "Roof", value: datafax.capacity_roof },
  ].filter(
    (entry): entry is { label: string; value: number } => entry.value !== null,
  );

  const flags = [
    datafax.open_topped ? "Open topped" : null,
    datafax.large_target ? "Large target" : null,
  ].filter((flag): flag is string => flag !== null);

  const allRuns: (DataRun | null)[] = [
    speeds.length
      ? {
          label: "Movement",
          value: speeds
            .map(({ label, value }) => `${label} ${value}"`)
            .join(MIDDOT),
        }
      : null,
    datafax.motive_types
      ? { label: "Type", value: datafax.motive_types.name }
      : null,
    datafax.ram_strength !== null ||
    datafax.ram_damage !== null ||
    datafax.ram_save_modifier !== null
      ? {
          label: "Ram value",
          value: ram
            .map(({ label, value }) => `${label} ${value}`)
            .join(MIDDOT),
        }
      : null,
    ...capacity.map(({ label, value }) => ({ label, value: String(value) })),
    flags.length ? { label: "Notes", value: flags.join(MIDDOT) } : null,
    datafax.points !== null
      ? {
          label: "Points",
          value: `${datafax.points} point${datafax.points === 1 ? "" : "s"}`,
        }
      : null,
  ];

  const runs = allRuns.filter((run): run is DataRun => run !== null);

  const image = datafax.datafax_images[0]?.images ?? null;

  const footnotes = [
    ...new Set(
      datafax.datafax_locations
        .map(({ note }) => note)
        .filter((note): note is string => note !== null),
    ),
  ];

  const chartAnchor = (name: string): string =>
    generateAnchorId(`${unitName} ${name} Damage Chart`);

  const weapons = datafax.datafax_weapons.map((weapon) => ({
    ...weapon,
    linked:
      weapon.linked_group === null
        ? null
        : datafax.datafax_weapons
              .filter(
                ({ linked_group }) => linked_group === weapon.linked_group,
              )
              .reduce((total, { quantity }) => total + quantity, 0) === 2
          ? "twin linked"
          : "linked",
  }));

  const weaponGroups: {
    key: string;
    shared: boolean;
    members: (typeof weapons)[number][];
  }[] = [];

  for (const weapon of weapons) {
    const group =
      weapon.alternative === 0
        ? undefined
        : weaponGroups.find(({ key }) => key === `alt${weapon.alternative}`);

    if (group) {
      group.members.push(weapon);
    } else {
      weaponGroups.push({
        key:
          weapon.alternative === 0
            ? `w${weapon.id}`
            : `alt${weapon.alternative}`,
        shared: true,
        members: [weapon],
      });
    }
  }

  for (const group of weaponGroups) {
    const [first] = group.members;
    group.shared = group.members.every(
      (weapon) =>
        weapon.mount === first.mount &&
        weapon.firing_arc_degrees === first.firing_arc_degrees &&
        weapon.arc_note === first.arc_note,
    );
  }

  const hasWeaponData = Boolean(
    datafax.datafax_weapons.length || datafax.deployment,
  );

  const hasFrontData = Boolean(
    image || runs.length || hasWeaponData || datafax.note,
  );

  const hasDamageData = Boolean(
    datafax.datafax_locations.length || datafax.damage_charts.length,
  );

  const locationBlock: {
    key: string;
    weight: number;
    node: React.ReactNode;
  }[] = [
    ...(datafax.datafax_locations.length
      ? [
          {
            key: "locations",
            weight:
              60 +
              datafax.datafax_locations.length * 30 +
              footnotes.length * 26,
            node: (
              <div className="flex flex-col gap-1">
                <h6
                  id={generateAnchorId(`${unitName} Hit Location Chart`)}
                  className={SUB_HEADING}
                >
                  Hit Location Chart ({datafax.location_dice})
                </h6>
                <table className="w-full bg-black border-4 border-black border-collapse text-center">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        rowSpan={2}
                        className="px-2 py-1 font-subtitle text-xs text-white"
                      >
                        {datafax.location_dice}
                      </th>
                      <th
                        scope="col"
                        rowSpan={2}
                        className="px-2 py-1 font-subtitle text-xs text-white text-left"
                      >
                        Location
                      </th>
                      <th
                        scope="colgroup"
                        colSpan={2}
                        className="px-2 py-1 font-subtitle text-xs text-white"
                      >
                        Armour
                      </th>
                    </tr>
                    <tr>
                      <th
                        scope="col"
                        className="px-2 py-1 font-subtitle text-xs text-white"
                      >
                        Front
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-1 font-subtitle text-xs text-white"
                      >
                        Side/Rear
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {datafax.datafax_locations.map((location) => {
                      const note =
                        location.note === null
                          ? -1
                          : footnotes.indexOf(location.note);
                      const chart = datafax.damage_charts.find(
                        ({ id }) => id === location.damage_chart_id,
                      );

                      return (
                        <tr
                          key={location.id}
                          className="bg-card-face even:bg-card-stripe text-sm"
                        >
                          <th scope="row" className="px-2 py-1">
                            {range(location.roll_min, location.roll_max)}
                          </th>
                          <td className="px-2 py-1 text-left">
                            {chart ? (
                              <Link
                                className="underline underline-offset-4"
                                href={`#${chartAnchor(chart.name)}`}
                              >
                                {location.name}
                              </Link>
                            ) : (
                              location.name
                            )}
                            {note >= 0 && <sup>{MARKERS[note]}</sup>}
                          </td>
                          <td className="px-2 py-1">
                            {stat(location.armour_front)}
                          </td>
                          <td className="px-2 py-1">
                            {stat(location.armour_side_rear)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {Boolean(footnotes.length) && (
                    <tfoot>
                      {footnotes.map((note, index) => (
                        <tr key={note}>
                          <td
                            colSpan={4}
                            className="px-2 py-1 bg-card-face text-xs text-center"
                          >
                            <sup>{MARKERS[index]}</sup> {note}
                          </td>
                        </tr>
                      ))}
                    </tfoot>
                  )}
                </table>
              </div>
            ),
          },
        ]
      : []),
  ];

  const chartBlocks = datafax.damage_charts.map((chart) => ({
    key: `chart-${chart.id}`,
    weight:
      52 +
      chart.damage_chart_results.reduce(
        (total, result) => total + textWeight(result.effect),
        0,
      ),
    node: (
      <div key={chart.id} className="flex flex-col gap-1">
        <h6 id={chartAnchor(chart.name)} className={SUB_HEADING}>
          {chart.name} Damage Chart ({chart.dice})
        </h6>
        <table className="w-full bg-black border-4 border-black border-collapse text-left">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-2 py-1 font-subtitle text-xs text-white"
              >
                {chart.dice}
              </th>
              <th
                scope="col"
                className="px-2 py-1 font-subtitle text-xs text-white"
              >
                Effect
              </th>
            </tr>
          </thead>
          <tbody>
            {chart.damage_chart_results.map((result) => (
              <tr
                key={result.id}
                className="bg-card-face even:bg-card-stripe text-sm"
              >
                <th
                  scope="row"
                  className="px-2 py-1 text-center align-top whitespace-nowrap"
                >
                  {range(result.roll_min, result.roll_max)}
                </th>
                <td className="px-2 py-1 text-pretty">
                  <div
                    className="dynamic-content compact flex flex-col gap-2"
                    dangerouslySetInnerHTML={{ __html: result.effect }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  }));

  const [leftCharts, rightCharts] = balance(
    chartBlocks,
    locationBlock.reduce((sum, { weight }) => sum + weight, 0),
  );

  const damageColumns = [[...locationBlock, ...leftCharts], rightCharts];

  return (
    <section
      className={clsx(
        "flex flex-col gap-2 p-2 border-4 border-black shadow-xl",
        factionColors[factionSlug] ?? "bg-2ed-dark-blue",
      )}
    >
      <div className="flex justify-between items-baseline gap-4 px-1">
        <Title
          className={clsx(
            "font-subtitle uppercase text-2xl leading-tight",
            ink,
          )}
        >
          {titleHref ? (
            <HighlighterLink
              className="hover:underline underline-offset-4"
              href={titleHref}
            >
              {unitName}
            </HighlighterLink>
          ) : (
            unitName
          )}
        </Title>
        <span className={clsx("font-subtitle text-lg whitespace-nowrap", ink)}>
          Datafax
        </span>
      </div>

      {hasFrontData && (
        <div className="flex flex-col gap-2 p-3 bg-card-face text-2ed-black">
          <h5 className={FACE_HEADING}>{unitTypeName} data</h5>
          <div
            className={clsx(
              "grid gap-3",
              image && "lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]",
            )}
          >
            {image && (
              <ImageWithCredit
                src={`images/${image.file_name}`}
                title={image.title}
                artist={image.artist}
                aspect="aspect-retro"
                width="half"
              />
            )}
            <div className="flex flex-col gap-1.5 text-sm">
              {Boolean(runs.length) && (
                <p className="flex flex-wrap gap-x-6 gap-y-1">
                  {runs.map((run) => (
                    <Run key={run.label} label={run.label}>
                      {run.value}
                    </Run>
                  ))}
                </p>
              )}
              {Boolean(weaponGroups.length) && (
                <p>
                  <span className={clsx(RUN_LABEL, "mr-1.5")}>Weapons</span>
                  {weaponGroups.map((group) => (
                    <Fragment key={group.key}>
                      {group.members.length > 1 && "Either "}
                      {joinOr(
                        group.members.map((weapon) => (
                          <Fragment key={weapon.id}>
                            {weapon.quantity > 1 && (
                              <>{weapon.quantity} &times; </>
                            )}
                            <Link
                              className="underline underline-offset-4"
                              href={`/wargear/weapons#${generateAnchorId(weapon.weapons.name)}`}
                            >
                              {weapon.weapons.name}
                            </Link>
                            {weapon.linked && <>, {weapon.linked}</>}
                            {!group.shared && fitting(weapon)}
                            {group.members.length > 1 &&
                              weapon.points !== null && (
                                <> at {cost(weapon.points)}</>
                              )}
                          </Fragment>
                        )),
                      )}
                      {group.shared && fitting(group.members[0])}
                      {group.members.every(({ optional }) => optional) &&
                        " may be fitted"}
                      {group.members.length === 1 &&
                        group.members[0].points !== null && (
                          <>, at {cost(group.members[0].points)}</>
                        )}
                      {". "}
                    </Fragment>
                  ))}
                </p>
              )}
              {datafax.deployment && (
                <p>
                  <span className={clsx(RUN_LABEL, "mr-1.5")}>Deployment</span>
                  {datafax.deployment}
                </p>
              )}
            </div>
          </div>
          {Boolean(datafax.datafax_weapons.length) && (
            <div className="flex flex-col gap-1">
              <h6 className={SUB_HEADING}>Weapon data</h6>
              <WeaponDataTable
                bearer="Vehicle"
                caption={`${unitName} weapon data`}
                weapons={datafax.datafax_weapons.map((weapon) => ({
                  id: weapon.id,
                  name: weapon.weapons.name,
                  profiles: weapon.weapons.weapon_profiles,
                }))}
              />
            </div>
          )}
          {datafax.note && <p className="text-sm">{datafax.note}</p>}
        </div>
      )}

      {hasDamageData && (
        <div className="grid lg:grid-cols-2 gap-3 p-3 bg-card-face text-2ed-black">
          {damageColumns.map((column, index) => (
            <div key={index} className="flex flex-col gap-3">
              {column.map(({ key, node }) => (
                <Fragment key={key}>{node}</Fragment>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
