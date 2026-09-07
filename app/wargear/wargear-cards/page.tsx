import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Chip } from "@/components/Chip";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import { TitleBand } from "@/components/TitleBand";
import { forBearer } from "@/components/WeaponProfile";
import {
  StripCell,
  WeaponStrip,
  closeCombatCells,
  rangedCells,
} from "@/components/WeaponStrip";
import { facetHref, generateAnchorId } from "@/lib/anchors";
import { pageTitle } from "@/lib/metadata";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";
import { Fragment } from "react";

export const revalidate = 3600;

const DASH = "–";
const MIDDOT = " · ";

const ruleLinks = (
  href: string,
  rules: { name: string }[],
): React.ReactNode | undefined =>
  rules.length
    ? rules.map(({ name }, index) => (
        <Fragment key={name}>
          {index > 0 && MIDDOT}
          <Link
            className="underline underline-offset-4"
            href={`${href}#${generateAnchorId(name)}_Rule`}
          >
            {name}
          </Link>
        </Fragment>
      ))
    : undefined;

export function generateMetadata(): Metadata {
  return {
    title: pageTitle("Wargear Cards"),
    description:
      "The Wargear cards of Warhammer 40,000 2nd Edition, with points value, rarity, restrictions and the weapon or armour profile where a card has one.",
  };
}

export default async function Page() {
  const [
    { data: heroImage },
    { data: cards, error: cardsError },
    { data: availabilityRows, error: availabilityError },
  ] = await Promise.all([
    supabase
      .from("hero_images")
      .select("images(file_name, artist, title, width, height)")
      .eq("slug", "wargear-cards")
      .maybeSingle(),
    supabase
      .from("wargear_cards")
      .select(
        "id, name, rarity, points, restriction, discard_after_use, description, wargear_cards_availabilities(availabilities(name, position)), wargear_cards_weapons(position, weapons(name, weapon_categories(name), profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), wargear_cards_armour(position, armour(name, profile_description, armour_profiles(save, condition), armour_special_rules(name)))",
      )
      .order("name")
      .order("position", { referencedTable: "wargear_cards_weapons" })
      .order("position", {
        referencedTable: "wargear_cards_weapons.weapons.weapon_profiles",
      })
      .order("position", { referencedTable: "wargear_cards_armour" }),
    supabase.from("availabilities").select("name").order("position"),
  ]);
  const hero = heroImage?.images ?? null;

  assertNoQueryErrors("/wargear/wargear-cards", cardsError, availabilityError);

  if (cards && availabilityRows) {
    const jumpItems = [
      { id: facetHref("").slice(1), label: "All" },
      ...availabilityRows.map(({ name }) => ({
        id: facetHref(name).slice(1),
        label: name,
      })),
    ];

    return (
      <>
        <Highlighter />
        <Breadcrumbs
          crumbs={[
            { href: "/", anchor: "2ed1993" },
            { href: "/wargear", anchor: "Wargear" },
            { anchor: "Wargear Cards" },
          ]}
        />
        <main id="main" className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col w-full max-w-5xl">
            <TitleBand
              title="Wargear Cards"
              eyebrow={`Wargear \u00b7 ${cards.length} cards`}
              className="border-b-0"
              image={
                hero && {
                  src: `images/${hero.file_name}`,
                  title: hero.title,
                  artist: hero.artist,
                  dimensions: dimensionsOf(hero),
                }
              }
            />
          </Panel>
          <JumpBar
            className="self-stretch -mx-2 md:-mx-4"
            items={jumpItems}
            label="Available to"
          >
            <RowFilter
              label="Filter"
              unit="cards"
              total={cards.length}
              placeholder="e.g. force sword, psycannon"
              facetAttribute="availability"
            />
          </JumpBar>
          <Panel className="flex flex-col gap-4 w-full max-w-5xl p-4 md:p-8">
            <section className="grid md:grid-cols-2 gap-4">
              {cards.map((card) => {
                const cardId = generateAnchorId(card.name);
                const weapons = card.wargear_cards_weapons.map(
                  ({ weapons }) => weapons,
                );
                const armourItems = card.wargear_cards_armour.map(
                  ({ armour }) => armour,
                );
                const rules = [
                  ...weapons.map(
                    ({ profile_description }) => profile_description,
                  ),
                  ...armourItems.map(
                    ({ profile_description }) => profile_description,
                  ),
                ].filter((rule): rule is string => rule !== null);
                const entries = [
                  ...weapons.map(({ name }) => ({
                    name,
                    href: `/wargear/weapons#${generateAnchorId(name)}`,
                  })),
                  ...armourItems.map(({ name }) => ({
                    name,
                    href: `/wargear/armour#${generateAnchorId(name)}`,
                  })),
                ];
                const availabilities = card.wargear_cards_availabilities
                  .map(({ availabilities }) => availabilities)
                  .filter((row) => row !== null)
                  .sort((a, b) => a.position - b.position);
                const search = [
                  card.name,
                  card.rarity,
                  card.restriction ?? "",
                  card.discard_after_use ? "discard after use" : "",
                  ...weapons.map(({ name }) => name),
                  ...armourItems.map(({ name }) => name),
                ]
                  .join(" ")
                  .toLowerCase();

                return (
                  <div
                    key={cardId}
                    id={cardId}
                    data-search={search}
                    data-availability={availabilities
                      .map(({ name }) => name.toLowerCase())
                      .join(" ")}
                    className="flex flex-col justify-start gap-2 p-4 border-4 border-frame bg-2ed-dark-blue target:border-2ed-light-yellow shadow-xl"
                  >
                    <div className="flex justify-between items-baseline gap-4 w-full">
                      <HighlighterLink
                        className="font-subtitle uppercase text-2xl text-2ed-white hover:underline underline-offset-4"
                        href={`/wargear/wargear-cards#${cardId}`}
                      >
                        {card.name}
                      </HighlighterLink>
                      <span className="font-subtitle whitespace-nowrap text-lg text-2ed-light-yellow">
                        {card.points
                          ? `${card.points} Point${card.points === "1" ? "" : "s"}`
                          : "Special"}
                      </span>
                    </div>
                    <div className="flex flex-col justify-start gap-4 p-4 h-full bg-card-face text-2ed-black">
                      {card.description && (
                        <div
                          className="dynamic-content flex flex-col gap-2"
                          dangerouslySetInnerHTML={{
                            __html: card.description,
                          }}
                        />
                      )}
                      {rules.map((rule, index) => (
                        <div
                          key={`${cardId}_rule_${index}`}
                          className="dynamic-content flex flex-col gap-2"
                          dangerouslySetInnerHTML={{ __html: rule }}
                        />
                      ))}
                      {weapons.map((weapon, weaponIndex) => {
                        const closeCombat =
                          weapon.weapon_categories.name === "Close combat";
                        const specials = [
                          ...new Set(
                            weapon.weapon_profiles.flatMap((profile) =>
                              forBearer(
                                profile.weapon_special_rules,
                                "Infantry",
                              ).map(({ name }) => name),
                            ),
                          ),
                        ].map((name) => ({ name }));

                        return (
                          <WeaponStrip
                            key={`${cardId}_${weaponIndex}`}
                            surface="card"
                            name={weapon.name}
                            special={ruleLinks("/wargear/weapons", specials)}
                            profiles={weapon.weapon_profiles.map(
                              (profile, index) => {
                                const cells: StripCell[] = closeCombat
                                  ? closeCombatCells(profile)
                                  : rangedCells(profile);
                                if (
                                  !closeCombat &&
                                  profile.long_range === DASH
                                ) {
                                  cells[0] = {
                                    ...cells[0],
                                    value: profile.short_range,
                                  };
                                }

                                return {
                                  key: index,
                                  label:
                                    weapon.weapon_profiles.length > 1
                                      ? profile.name
                                      : null,
                                  cells,
                                };
                              },
                            )}
                          />
                        );
                      })}
                      {armourItems.map((armour, armourIndex) => (
                        <WeaponStrip
                          key={`${cardId}_armour_${armourIndex}`}
                          surface="card"
                          name={armour.name}
                          special={ruleLinks(
                            "/wargear/armour",
                            armour.armour_special_rules,
                          )}
                          profiles={[
                            {
                              key: armourIndex,
                              cells: armour.armour_profiles.length
                                ? armour.armour_profiles.map((profile) => ({
                                    label: "Save",
                                    value: (
                                      <>
                                        {profile.save}
                                        {profile.condition && (
                                          <span className="block font-normal text-sm">
                                            {profile.condition}
                                          </span>
                                        )}
                                      </>
                                    ),
                                  }))
                                : [{ label: "Save", value: DASH }],
                            },
                          ]}
                        />
                      ))}
                      {entries.length === 1 && (
                        <p className="text-sm">
                          See the full entry in{" "}
                          <Link
                            className="underline underline-offset-4"
                            href={entries[0].href}
                          >
                            {weapons.length ? "Weapons" : "Armour"}
                          </Link>
                          .
                        </p>
                      )}
                      {entries.length > 1 && (
                        <p className="text-sm">
                          See the full entries:{" "}
                          {entries.map(({ name, href }, index) => (
                            <span key={name}>
                              {index > 0 && ", "}
                              <Link
                                className="underline underline-offset-4"
                                href={href}
                              >
                                {name}
                              </Link>
                            </span>
                          ))}
                          .
                        </p>
                      )}
                      {(card.restriction || card.discard_after_use) && (
                        <p className="mt-auto font-subtitle font-bold uppercase text-xl text-2ed-dark-red text-center">
                          {[
                            card.restriction,
                            card.discard_after_use ? "Discard after use" : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-4 w-full">
                      <p className="font-bold text-2ed-white">{card.rarity}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
                        {availabilities.map(({ name }) => (
                          <Chip
                            key={name}
                            href={facetHref(name)}
                            className="border-2ed-white text-2ed-white"
                          >
                            {name}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
            <p
              data-empty
              hidden
              className="p-6 border-4 border-black bg-2ed-light-green text-2ed-black text-lg"
            >
              Nothing matches that filter.
            </p>
          </Panel>
        </main>
      </>
    );
  }

  throw new Error("/wargear/wargear-cards: rendered with no data");
}
