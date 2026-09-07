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
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next/types";

export const revalidate = 3600;

const CONTEXT = "/datafaxes/fortifications";

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Fortification Datafaxes"),
    description:
      "Datafaxes for the Warhammer 40,000 2nd Edition fortifications, with armour values by location, damage charts and the weapons each can mount.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title, width, height)")
    .eq("slug", "fortifications")
    .maybeSingle();

  const { data: unitRows, error: unitsError } = await supabase
    .from("units")
    .select(
      "id, name, faction_id, unit_types!inner(name, plural_name, position), datafaxes!inner(id, speed_slow, speed_combat, speed_fast, ram_strength, ram_damage, ram_save_modifier, crew, transport_capacity, open_topped, large_target, capacity_inside, capacity_roof, deployment, location_dice, note, motive_types(name), datafax_images(position, images(file_name, artist, title, width, height)), datafax_weapons(id, mount, firing_arc_degrees, arc_note, linked_group, quantity, position, alternative, optional, points, weapons(name, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), datafax_locations(id, roll_min, roll_max, name, armour_front, armour_side_rear, damage_chart_id, note, position), damage_charts(id, name, dice, note, position, damage_chart_results(id, roll_min, roll_max, effect, position)))",
    )
    .eq("unit_types.name", "Fortification")
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

  assertNoQueryErrors(CONTEXT, heroImageError, unitsError);

  const hero = heroImage?.images ?? null;
  const units = unitRows ?? [];

  const jumpItems = units.map(({ name }) => ({
    id: generateAnchorId(name),
    label: name,
  }));

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
      <Panel as="main" className="flex flex-col w-full max-w-5xl">
        <TitleBand
          title="Fortifications"
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
        {units.length ? (
          <div className="flex flex-col lg:flex-row">
            <JumpBar rail items={jumpItems}>
              <RowFilter
                label="Filter"
                unit="datafaxes"
                total={units.length}
                placeholder="e.g. bunker, wall section, trench"
              />
            </JumpBar>
            <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
              <section data-group className="flex flex-col gap-4">
                <SectionHeading>Fortifications</SectionHeading>
                {units.map((unit) => {
                  const unitId = generateAnchorId(unit.name);
                  const datafax = unit.datafaxes;

                  const search = [
                    unit.name,
                    "Fortifications",
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
                        factionSlug={null}
                        unitName={unit.name}
                        unitTypeName="Fortification"
                        titleHref={`/datafaxes/fortifications#${unitId}`}
                      />
                    </article>
                  );
                })}
              </section>
              <p
                data-empty
                hidden
                className="p-6 border-4 border-frame bg-2ed-light-green text-2ed-black text-lg"
              >
                Nothing matches that filter.
              </p>
            </div>
          </div>
        ) : (
          <p className="m-4 md:m-8 p-6 border-4 border-frame bg-2ed-light-green text-2ed-black text-lg">
            No fortification datafaxes have been added yet.
          </p>
        )}
      </Panel>
    </>
  );
}
