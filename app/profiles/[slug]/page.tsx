import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  CHARACTERISTICS,
  CharacteristicRow,
  CharacteristicTable,
  OptionList,
  OptionRow,
} from "@/components/CharacteristicProfile";
import { Datafax } from "@/components/Datafax";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";
import { Fragment } from "react";

export const revalidate = 3600;

const FORTIFICATIONS_SLUG = "fortifications";
const FORTIFICATIONS_NAME = "Fortifications";
const DASH = "–";
const TIMES = "×";
const FULL_BLEED = "self-stretch -mx-2 md:-mx-4";

const UNITS_SELECT =
  "id, name, profile_description, faction_id, unit_types(name, plural_name, position), unit_profiles(id, name, position, models_min, models_max, mastery_level, wargear_cards_max, m, ws, bs, s, t, w, i, a, ld, unit_profile_weapons(id, quantity, alternative, position, weapons(name)), unit_profile_armour(armour_id, position, armour(name))), unit_options!unit_options_unit_id_fkey(id, models_max, models_per, whole_unit, quantity, restriction, note, position, profile:unit_profiles!unit_options_unit_profile_id_fkey(name), replaces:weapons!unit_options_replaces_weapon_id_fkey(name), grants:weapons!unit_options_weapon_id_fkey(name), unit_option_categories(position, wargear_categories(category))), datafaxes(id, speed_slow, speed_combat, speed_fast, ram_strength, ram_damage, ram_save_modifier, crew, transport_capacity, open_topped, large_target, capacity_inside, capacity_roof, deployment, location_dice, note, motive_types(name), datafax_images(position, images(file_name, artist, title)), datafax_weapons(id, mount, firing_arc_degrees, arc_note, linked_group, quantity, position, alternative, optional, points, weapons(name, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), datafax_locations(id, roll_min, roll_max, name, armour_front, armour_side_rear, damage_chart_id, note, position), damage_charts(id, name, dice, position, damage_chart_results(id, roll_min, roll_max, effect, position)))";

const range = (min: number, max: number | null): string =>
  max === null || max === min ? String(min) : `${min}${DASH}${max}`;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  if (params.slug === FORTIFICATIONS_SLUG) {
    return {
      title: `${FORTIFICATIONS_NAME} in Warhammer 40,000 2nd Edition | 2ed1993`,
      description: `Warhammer 40,000 2nd Edition ${FORTIFICATIONS_NAME} unit profiles and datafaxes.`,
    };
  }

  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("name")
    .eq("slug", params.slug)
    .is("parent_faction_id", null)
    .maybeSingle();

  assertNoQueryErrors("/profiles/[slug]", factionError);

  if (faction) {
    return {
      title: `${faction.name} Unit Profiles in Warhammer 40,000 2nd Edition | 2ed1993`,
      description: `Warhammer 40,000 2nd Edition ${faction.name} unit profiles and datafaxes.`,
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const { data: factionRows, error: factionsError } = await supabase
    .from("factions")
    .select("id, slug, name, parent_faction_id")
    .order("name");

  assertNoQueryErrors("/profiles/[slug]", factionsError);

  const factions = factionRows ?? [];
  const isFortifications = params.slug === FORTIFICATIONS_SLUG;
  const faction =
    factions.find(
      ({ slug, parent_faction_id }) =>
        slug === params.slug && parent_faction_id === null,
    ) ?? null;

  if (!isFortifications && !faction) {
    notFound();
  }

  const title = faction ? faction.name : FORTIFICATIONS_NAME;
  const factionSlug = faction ? faction.slug : FORTIFICATIONS_SLUG;
  const factionIds = faction
    ? factions
        .filter(
          ({ id, parent_faction_id }) =>
            (parent_faction_id ?? id) === faction.id,
        )
        .map(({ id }) => id)
    : [];

  const query = supabase
    .from("units")
    .select(UNITS_SELECT)
    .order("name")
    .order("position", { referencedTable: "unit_profiles" })
    .order("position", {
      referencedTable: "unit_profiles.unit_profile_weapons",
    })
    .order("position", { referencedTable: "unit_profiles.unit_profile_armour" })
    .order("position", { referencedTable: "unit_options" })
    .order("position", {
      referencedTable: "unit_options.unit_option_categories",
    })
    .order("position", { referencedTable: "datafaxes.datafax_images" })
    .order("position", { referencedTable: "datafaxes.datafax_weapons" })
    .order("position", { referencedTable: "datafaxes.datafax_locations" })
    .order("position", { referencedTable: "datafaxes.damage_charts" })
    .order("position", {
      referencedTable: "datafaxes.damage_charts.damage_chart_results",
    });

  const { data: unitRows, error: unitsError } = await (isFortifications
    ? query.is("faction_id", null)
    : query.in("faction_id", factionIds));

  assertNoQueryErrors("/profiles/[slug]", unitsError);

  const units = unitRows ?? [];
  const buckets = new Map<
    string,
    {
      name: string;
      pluralName: string;
      position: number;
      units: typeof units;
    }
  >();

  for (const unit of units) {
    const { name, plural_name: pluralName, position } = unit.unit_types;
    const bucket = buckets.get(name) ?? {
      name,
      pluralName,
      position,
      units: [],
    };
    bucket.units.push(unit);
    buckets.set(name, bucket);
  }

  const groups = [...buckets.values()].sort(
    (a, b) => a.position - b.position || a.name.localeCompare(b.name),
  );

  const jumpItems = groups.map(({ pluralName }) => ({
    id: generateAnchorId(pluralName),
    label: pluralName,
  }));

  return (
    <>
      <Highlighter />
      <Breadcrumbs
        crumbs={[
          { href: "/", anchor: "2ed1993" },
          { href: "/profiles", anchor: "Profiles" },
          { anchor: title },
        ]}
      />
      <main id="main" className="flex flex-col items-center gap-4 w-full">
        <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              {title}
            </h1>
          </header>
        </Panel>
        {Boolean(groups.length) && (
          <JumpBar className={FULL_BLEED} items={jumpItems} label="Jump to">
            <RowFilter
              label="Filter"
              unit="units"
              total={units.length}
              placeholder="e.g. tactical, dreadnought, bolter"
            />
          </JumpBar>
        )}
        {groups.length ? (
          <Panel className="flex flex-col gap-4 w-full max-w-5xl pb-4 md:pb-8">
            {groups.map((group) => {
              const groupId = generateAnchorId(group.pluralName);

              return (
                <div
                  key={groupId}
                  id={groupId}
                  data-group
                  className="flex flex-col gap-4 mt-4 md:mt-8"
                >
                  <div className="mt-4 px-4 md:px-8">
                    <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                      <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                      <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                        {group.pluralName}
                      </h2>
                    </div>
                  </div>
                  {group.units.map((unit) => {
                    const unitId = generateAnchorId(unit.name);
                    const datafax = unit.datafaxes;

                    const search = [
                      unit.name,
                      group.pluralName,
                      ...unit.unit_profiles.flatMap((profile) => [
                        profile.name,
                        ...profile.unit_profile_weapons.map(
                          ({ weapons }) => weapons.name,
                        ),
                        ...profile.unit_profile_armour.map(
                          ({ armour }) => armour.name,
                        ),
                      ]),
                      datafax ? "datafax" : "",
                      ...(datafax
                        ? datafax.datafax_weapons.map(
                            ({ weapons }) => weapons.name,
                          )
                        : []),
                    ]
                      .join(" ")
                      .toLowerCase();

                    const rows: CharacteristicRow[] = unit.unit_profiles.map(
                      (profile) => {
                        const notes = [
                          profile.mastery_level === null
                            ? null
                            : `Mastery ${profile.mastery_level}`,
                          profile.wargear_cards_max === null
                            ? null
                            : `${profile.wargear_cards_max} wargear card${profile.wargear_cards_max === 1 ? "" : "s"}`,
                        ].filter((note): note is string => note !== null);

                        const alternatives = new Map<
                          number,
                          typeof profile.unit_profile_weapons
                        >();

                        for (const weapon of profile.unit_profile_weapons) {
                          const bucket =
                            alternatives.get(weapon.alternative) ?? [];
                          bucket.push(weapon);
                          alternatives.set(weapon.alternative, bucket);
                        }

                        const loadouts = [...alternatives.entries()].sort(
                          ([a], [b]) => a - b,
                        );

                        return {
                          id: profile.id,
                          name: profile.name,
                          count: range(profile.models_min, profile.models_max),
                          note: notes.length ? notes.join(" · ") : null,
                          weapons: loadouts.length
                            ? loadouts.map(
                                ([alternative, weapons], loadout) => (
                                  <Fragment key={alternative}>
                                    {loadout > 0 && (
                                      <span className="font-subtitle text-base">
                                        {" or "}
                                      </span>
                                    )}
                                    {weapons.map((weapon, index) => (
                                      <Fragment key={weapon.id}>
                                        {index > 0 && ", "}
                                        {weapon.quantity > 1 &&
                                          `${weapon.quantity} ${TIMES} `}
                                        <Link
                                          className="underline underline-offset-4"
                                          href={`/wargear/weapons#${generateAnchorId(weapon.weapons.name)}`}
                                        >
                                          {weapon.weapons.name}
                                        </Link>
                                      </Fragment>
                                    ))}
                                  </Fragment>
                                ),
                              )
                            : null,
                          armour: profile.unit_profile_armour.length
                            ? profile.unit_profile_armour.map(
                                ({ armour_id, armour }, index) => (
                                  <Fragment key={armour_id}>
                                    {index > 0 && ", "}
                                    <Link
                                      className="underline underline-offset-4"
                                      href={`/wargear/armour#${generateAnchorId(armour.name)}`}
                                    >
                                      {armour.name}
                                    </Link>
                                  </Fragment>
                                ),
                              )
                            : null,
                          ...Object.fromEntries(
                            CHARACTERISTICS.map(({ key }) => [
                              key,
                              profile[key],
                            ]),
                          ),
                        } as CharacteristicRow;
                      },
                    );

                    const titleHref = `/profiles/${params.slug}#${unitId}`;
                    const titleOnCard = Boolean(
                      datafax &&
                      !unit.unit_profiles.length &&
                      !unit.profile_description,
                    );

                    return (
                      <article
                        key={unitId}
                        id={unitId}
                        data-search={search}
                        className="highlight-target flex flex-col gap-4 px-4 md:px-8 py-4 target:bg-2ed-light-yellow target:text-black"
                      >
                        {!titleOnCard && (
                          <h3 className="font-subtitle text-3xl">
                            <HighlighterLink
                              className="hover:underline underline-offset-4"
                              href={titleHref}
                            >
                              {unit.name}
                            </HighlighterLink>
                          </h3>
                        )}
                        {Boolean(rows.length) && (
                          <CharacteristicTable
                            caption={`${unit.name} profiles`}
                            rows={rows}
                          />
                        )}
                        {Boolean(unit.unit_options.length) && (
                          <OptionList caption={`${unit.name} options`}>
                            {unit.unit_options.map((option) => {
                              const sections =
                                option.unit_option_categories.map(
                                  ({ wargear_categories }) =>
                                    wargear_categories.category,
                                );
                              const scope =
                                option.models_max === null
                                  ? option.whole_unit
                                    ? "the whole squad"
                                    : null
                                  : option.models_per === null
                                    ? `up to ${option.models_max} model${option.models_max === 1 ? "" : "s"}`
                                    : `up to ${option.models_max} in ${option.models_per}`;
                              const structured = Boolean(
                                option.profile ||
                                scope ||
                                sections.length ||
                                option.grants ||
                                option.replaces,
                              );

                              return (
                                <OptionRow key={option.id}>
                                  {option.profile && (
                                    <span className="font-subtitle text-base">
                                      {option.profile.name}
                                    </span>
                                  )}
                                  {scope && (
                                    <span className="font-subtitle text-base">
                                      {option.profile && ", "}
                                      {scope}
                                    </span>
                                  )}
                                  {(option.profile || scope) &&
                                    Boolean(
                                      sections.length ||
                                      option.grants ||
                                      option.replaces,
                                    ) &&
                                    ` ${DASH} `}
                                  {option.grants && (
                                    <Link
                                      className="underline underline-offset-4"
                                      href={`/wargear/weapons#${generateAnchorId(option.grants.name)}`}
                                    >
                                      {option.grants.name}
                                    </Link>
                                  )}
                                  {sections.join(", ")}
                                  {option.replaces && (
                                    <>
                                      {", in place of "}
                                      <Link
                                        className="underline underline-offset-4"
                                        href={`/wargear/weapons#${generateAnchorId(option.replaces.name)}`}
                                      >
                                        {option.replaces.name}
                                      </Link>
                                    </>
                                  )}
                                  {structured && ". "}
                                  {option.note}
                                  {option.restriction && (
                                    <span className="block text-base">
                                      {option.restriction}
                                    </span>
                                  )}
                                </OptionRow>
                              );
                            })}
                          </OptionList>
                        )}
                        {unit.profile_description && (
                          <div
                            className="dynamic-content flex flex-col gap-2 text-lg"
                            dangerouslySetInnerHTML={{
                              __html: unit.profile_description,
                            }}
                          />
                        )}
                        {datafax && (
                          <Datafax
                            datafax={datafax}
                            factionSlug={factionSlug}
                            unitName={unit.name}
                            unitTypeName={group.name}
                            titleHref={titleOnCard ? titleHref : undefined}
                          />
                        )}
                      </article>
                    );
                  })}
                </div>
              );
            })}
            <p
              data-empty
              hidden
              className="mx-4 md:mx-8 p-6 border-4 border-black bg-2ed-light-green text-2ed-black text-lg"
            >
              Nothing matches that filter.
            </p>
          </Panel>
        ) : (
          <Panel className="flex flex-col gap-4 w-full max-w-5xl p-4 md:p-8">
            <p className="p-6 border-4 border-black bg-2ed-light-green text-2ed-black text-lg">
              No unit profiles have been added for {title} yet.
            </p>
          </Panel>
        )}
      </main>
    </>
  );
}
