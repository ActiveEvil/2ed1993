import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Datafax } from "@/components/Datafax";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/datafaxes/[faction]";

const loadFactions = () =>
  supabase
    .from("factions")
    .select(
      "id, slug, name, parent_faction_id, images(file_name, artist, title)",
    )
    .order("name");

export async function generateMetadata(props: {
  params: Promise<{ faction: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("name")
    .eq("slug", params.faction)
    .is("parent_faction_id", null)
    .maybeSingle();

  assertNoQueryErrors(CONTEXT, factionError);

  if (faction) {
    return {
      title: `${faction.name} Datafaxes in Warhammer 40,000 2nd Edition | 2ed1993`,
      description: `Warhammer 40,000 2nd Edition ${faction.name} vehicle datafaxes.`,
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
      "id, name, faction_id, unit_types(name, plural_name, position), datafaxes(id, speed_slow, speed_combat, speed_fast, ram_strength, ram_damage, ram_save_modifier, crew, transport_capacity, open_topped, large_target, capacity_inside, capacity_roof, deployment, location_dice, note, motive_types(name), datafax_images(position, images(file_name, artist, title)), datafax_weapons(id, mount, firing_arc_degrees, arc_note, linked_group, quantity, position, alternative, optional, points, weapons(name, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), datafax_locations(id, roll_min, roll_max, name, armour_front, armour_side_rear, damage_chart_id, note, position), damage_charts(id, name, dice, position, damage_chart_results(id, roll_min, roll_max, effect, position)))",
    )
    .in("faction_id", factionIds)
    .order("name")
    .order("position", { referencedTable: "datafaxes.datafax_images" })
    .order("position", { referencedTable: "datafaxes.datafax_weapons" })
    .order("position", { referencedTable: "datafaxes.datafax_locations" })
    .order("position", { referencedTable: "datafaxes.damage_charts" })
    .order("position", {
      referencedTable: "datafaxes.damage_charts.damage_chart_results",
    });

  assertNoQueryErrors(CONTEXT, unitsError);

  const units = (unitRows ?? []).filter(({ datafaxes }) => datafaxes !== null);

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
          { href: "/datafaxes", anchor: "Datafaxes" },
          { anchor: faction.name },
        ]}
      />
      <main id="main" className="flex flex-col items-center gap-4 w-full">
        <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              {faction.name}
            </h1>
          </header>
          {hero && (
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
            />
          )}
        </Panel>
        {Boolean(groups.length) && (
          <JumpBar
            className="self-stretch -mx-2 md:-mx-4"
            items={jumpItems}
            label="Jump to"
          >
            <RowFilter
              label="Filter"
              unit="datafaxes"
              total={units.length}
              placeholder="e.g. rhino, land raider, bolter"
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

                    if (!datafax) {
                      return null;
                    }

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
                        className="group highlight-target flex flex-col gap-4 px-4 md:px-8 py-4 target:bg-2ed-light-yellow target:text-black"
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
              No datafaxes have been added for {faction.name} yet.
            </p>
          </Panel>
        )}
      </main>
    </>
  );
}
