import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Datafax } from "@/components/Datafax";
import { Highlighter } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/datafaxes/fortifications";

export function generateMetadata(): Metadata {
  return {
    title: "Fortification Datafaxes in Warhammer 40,000 2nd Edition | 2ed1993",
    description: "Warhammer 40,000 2nd Edition fortification datafaxes.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "fortifications")
    .maybeSingle();

  const { data: unitRows, error: unitsError } = await supabase
    .from("units")
    .select(
      "id, name, faction_id, unit_types!inner(name, plural_name, position), datafaxes(id, speed_slow, speed_combat, speed_fast, ram_strength, ram_damage, ram_save_modifier, crew, transport_capacity, open_topped, large_target, capacity_inside, capacity_roof, deployment, location_dice, note, motive_types(name), datafax_images(position, images(file_name, artist, title)), datafax_weapons(id, mount, firing_arc_degrees, arc_note, linked_group, quantity, position, alternative, optional, points, weapons(name, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), datafax_locations(id, roll_min, roll_max, name, armour_front, armour_side_rear, damage_chart_id, note, position), damage_charts(id, name, dice, note, position, damage_chart_results(id, roll_min, roll_max, effect, position)))",
    )
    .eq("unit_types.name", "Fortification")
    .order("name")
    .order("position", { referencedTable: "datafaxes.datafax_images" })
    .order("position", { referencedTable: "datafaxes.datafax_weapons" })
    .order("position", { referencedTable: "datafaxes.datafax_locations" })
    .order("position", { referencedTable: "datafaxes.damage_charts" })
    .order("position", {
      referencedTable: "datafaxes.damage_charts.damage_chart_results",
    });

  assertNoQueryErrors(CONTEXT, heroImageError, unitsError);

  const hero = heroImage?.images ?? null;
  const units = (unitRows ?? []).filter(({ datafaxes }) => datafaxes !== null);

  const jumpItems: { id: string; label: string }[] = [];

  return (
    <>
      <Highlighter />
      <Breadcrumbs
        crumbs={[
          { href: "/", anchor: "2ed1993" },
          { href: "/datafaxes", anchor: "Datafaxes" },
          { anchor: "Fortifications" },
        ]}
      />
      <main id="main" className="flex flex-col items-center gap-4 w-full">
        <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Fortifications
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
        {Boolean(units.length) && (
          <JumpBar
            className="self-stretch -mx-2 md:-mx-4"
            items={jumpItems}
            label="Jump to"
          >
            <RowFilter
              label="Filter"
              unit="datafaxes"
              total={units.length}
              placeholder="e.g. bunker, wall section, trench"
            />
          </JumpBar>
        )}
        {units.length ? (
          <Panel className="flex flex-col gap-4 w-full max-w-5xl pb-4 md:pb-8">
            {units.map((unit) => {
              const unitId = generateAnchorId(unit.name);
              const datafax = unit.datafaxes;

              if (!datafax) {
                return null;
              }

              const search = [
                unit.name,
                "Fortifications",
                "datafax",
                ...datafax.datafax_weapons.map(({ weapons }) => weapons.name),
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
                    factionSlug={null}
                    unitName={unit.name}
                    unitTypeName="Fortification"
                    titleHref={`/datafaxes/fortifications#${unitId}`}
                  />
                </article>
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
              No fortification datafaxes have been added yet.
            </p>
          </Panel>
        )}
      </main>
    </>
  );
}
