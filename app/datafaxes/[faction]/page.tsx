import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Datafax } from "@/components/Datafax";
import { SectionHeading } from "@/components/Heading";
import { Highlighter } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
import { joinWithinBudget } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/datafaxes/[faction]";

const loadFactions = () =>
  supabase
    .from("factions")
    .select(
      "id, slug, name, parent_faction_id, images(file_name, artist, title, width, height)",
    )
    .order("name");

export async function generateMetadata(props: {
  params: Promise<{ faction: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("id, name")
    .eq("slug", params.faction)
    .is("parent_faction_id", null)
    .maybeSingle();

  assertNoQueryErrors(CONTEXT, factionError);

  if (faction) {
    const { data: children, error: childrenError } = await supabase
      .from("factions")
      .select("id")
      .eq("parent_faction_id", faction.id);

    assertNoQueryErrors(CONTEXT, childrenError);

    const factionIds = [faction.id, ...(children ?? []).map(({ id }) => id)];

    const { data: unitRows, error: unitsError } = await supabase
      .from("units")
      .select("name, datafaxes!inner(id), unit_types(position)")
      .in("faction_id", factionIds)
      .order("unit_types(position)")
      .order("name")
      .limit(6);

    assertNoQueryErrors(CONTEXT, unitsError);

    const title = `${faction.name} Datafaxes in 40k 2nd Edition`;

    if (!unitRows || unitRows.length === 0) {
      notFound();
    }

    return {
      title,
      description: joinWithinBudget(
        unitRows.map(({ name }) => name),
        `${faction.name} vehicle datafaxes for Warhammer 40,000 2nd Edition, including the `,
        ", with armour values and damage charts.",
      ),
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ faction: string }>;
}) {
  const params = await props.params;
  const { data: factionRows, error: factionsError } = await loadFactions();

  assertNoQueryErrors(CONTEXT, factionsError);

  const factions = factionRows ?? [];
  const faction =
    factions.find(
      ({ slug, parent_faction_id }) =>
        slug === params.faction && parent_faction_id === null,
    ) ?? null;

  if (!faction) {
    notFound();
  }

  const factionIds = factions
    .filter(
      ({ id, parent_faction_id }) => (parent_faction_id ?? id) === faction.id,
    )
    .map(({ id }) => id);

  const hero = faction.images[0] ?? null;

  const { data: unitRows, error: unitsError } = await supabase
    .from("units")
    .select(
      "id, name, faction_id, unit_types(name, plural_name, position), datafaxes!inner(id, speed_slow, speed_combat, speed_fast, ram_strength, ram_damage, ram_save_modifier, crew, transport_capacity, open_topped, large_target, capacity_inside, capacity_roof, deployment, location_dice, note, motive_types(name), datafax_images(position, images(file_name, artist, title, width, height)), datafax_weapons(id, mount, firing_arc_degrees, arc_note, linked_group, quantity, position, alternative, optional, points, weapons(name, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), datafax_locations(id, roll_min, roll_max, name, armour_front, armour_side_rear, damage_chart_id, note, position), damage_charts(id, name, dice, note, position, damage_chart_results(id, roll_min, roll_max, effect, position)))",
    )
    .in("faction_id", factionIds)
    .order("name")
    .order("position", { referencedTable: "datafaxes.datafax_images" })
    .order("position", { referencedTable: "datafaxes.datafax_weapons" })
    .order("position", {
      referencedTable: "datafaxes.datafax_weapons.weapons.weapon_profiles",
    })
    .order("position", { referencedTable: "datafaxes.datafax_locations" })
    .order("position", { referencedTable: "datafaxes.damage_charts" })
    .order("position", {
      referencedTable: "datafaxes.damage_charts.damage_chart_results",
    });

  assertNoQueryErrors(CONTEXT, unitsError);

  const units = unitRows ?? [];

  const buckets = new Map<
    string,
    { name: string; pluralName: string; position: number; units: typeof units }
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

  const jumpItems = groups.map(({ pluralName, units: members }) => ({
    id: generateAnchorId(pluralName),
    label: pluralName,
    subsections: members.map(({ name }) => ({
      id: generateAnchorId(name),
      label: name,
    })),
  }));

  return (
    <>
      <Highlighter />
      <Breadcrumbs
        crumbs={[
          { href: "/", anchor: "2ed1993" },
          { href: "/datafaxes", anchor: "Datafaxes" },
          { anchor: faction.name },
        ]}
      />
      <Panel as="main" className="flex flex-col w-full max-w-5xl">
        <TitleBand
          title={faction.name}
          eyebrow="Datafaxes"
          image={
            hero && {
              src: `images/${hero.file_name}`,
              title: hero.title,
              artist: hero.artist,
              dimensions: dimensionsOf(hero),
            }
          }
        />
        <div className="flex flex-col lg:flex-row">
          <JumpBar rail items={jumpItems}>
            <RowFilter
              label="Filter"
              unit="datafaxes"
              total={units.length}
              placeholder="e.g. rhino, land raider, bolter"
            />
          </JumpBar>
          <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
            {groups.map((group) => {
              const groupId = generateAnchorId(group.pluralName);

              return (
                <section
                  key={groupId}
                  id={groupId}
                  data-group
                  className="flex flex-col gap-4"
                >
                  <SectionHeading>{group.pluralName}</SectionHeading>
                  {group.units.map((unit) => {
                    const unitId = generateAnchorId(unit.name);
                    const datafax = unit.datafaxes;

                    const search = [
                      unit.name,
                      group.pluralName,
                      "datafax",
                      ...datafax.datafax_weapons.map(
                        ({ weapons }) => weapons.name,
                      ),
                    ]
                      .join(" ")
                      .toLowerCase();

                    return (
                      <article
                        key={unitId}
                        id={unitId}
                        data-search={search}
                        className="group flex flex-col target:outline-4 target:outline-offset-4 target:outline-2ed-light-yellow"
                      >
                        <Datafax
                          datafax={datafax}
                          factionSlug={faction.slug}
                          unitName={unit.name}
                          unitTypeName={group.name}
                          titleHref={`/datafaxes/${faction.slug}#${unitId}`}
                        />
                      </article>
                    );
                  })}
                </section>
              );
            })}
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
