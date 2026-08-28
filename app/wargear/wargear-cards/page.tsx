import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Chip } from "@/components/Chip";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { RowFilter } from "@/components/RowFilter";
import {
  ArmourProfile,
  CloseCombatProfile,
  RangedProfile,
  SpecialRuleLinks,
} from "@/components/WeaponProfile";
import { facetHref, generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Wargear Cards | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Wargear Cards.",
  };
}

export default async function Page() {
  const { data: heroImage } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "wargear-cards")
    .maybeSingle();
  const hero = heroImage?.images ?? null;

  const { data: cards, error: cardsError } = await supabase
    .from("wargear_cards")
    .select(
      "id, name, rarity, points, restriction, discard_after_use, description, wargear_cards_availabilities(availabilities(name, position)), wargear_cards_weapons(position, weapons(name, weapon_categories(name), profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name, bearer)))), wargear_cards_armour(position, armour(name, profile_description, armour_profiles(save, condition), armour_special_rules(name)))",
    )
    .order("name")
    .order("position", { referencedTable: "wargear_cards_weapons" })
    .order("position", { referencedTable: "wargear_cards_armour" });

  const { data: availabilityRows, error: availabilityError } = await supabase
    .from("availabilities")
    .select("name")
    .order("position");

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
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                Wargear Cards
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
                    className="flex flex-col justify-start gap-2 p-4 border-4 border-black bg-2ed-dark-blue target:border-2ed-light-yellow shadow-xl"
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
                      {weapons.map((weapon, weaponIndex) =>
                        weapon.weapon_profiles.map((profile, index) => {
                          const caption =
                            [
                              weapons.length > 1 ? weapon.name : null,
                              weapon.weapon_profiles.length > 1
                                ? profile.name
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" \u2014 ") || null;
                          const key = `${cardId}_${weaponIndex}_${index}`;
                          const special = (
                            <SpecialRuleLinks
                              href="/wargear/weapons"
                              rules={profile.weapon_special_rules}
                              bearer="Infantry"
                            />
                          );

                          return weapon.weapon_categories.name ===
                            "Close combat" ? (
                            <CloseCombatProfile
                              key={key}
                              caption={caption}
                              strength={profile.strength}
                              damage={profile.damage}
                              saveModifier={profile.save_modifier}
                              armourPenetration={profile.armour_penetration}
                              special={special}
                            />
                          ) : (
                            <RangedProfile
                              key={key}
                              caption={caption}
                              range={
                                profile.long_range === "\u2013"
                                  ? profile.short_range
                                  : `${profile.short_range} / ${profile.long_range}`
                              }
                              toHit={`${profile.short_to_hit} / ${profile.long_to_hit}`}
                              strength={profile.strength}
                              damage={profile.damage}
                              saveModifier={profile.save_modifier}
                              armourPenetration={profile.armour_penetration}
                              special={special}
                            />
                          );
                        }),
                      )}
                      {armourItems.map((armour, armourIndex) => (
                        <ArmourProfile
                          key={`${cardId}_armour_${armourIndex}`}
                          caption={armourItems.length > 1 ? armour.name : null}
                          save={
                            armour.armour_profiles.length ? (
                              <span className="flex flex-col">
                                {armour.armour_profiles.map(
                                  (profile, index) => (
                                    <span
                                      key={`${cardId}_${armourIndex}_${index}`}
                                    >
                                      {profile.save}
                                      {profile.condition && (
                                        <span className="text-sm">
                                          {" "}
                                          {profile.condition}
                                        </span>
                                      )}
                                    </span>
                                  ),
                                )}
                              </span>
                            ) : (
                              <>&ndash;</>
                            )
                          }
                          special={
                            <SpecialRuleLinks
                              href="/wargear/armour"
                              rules={armour.armour_special_rules}
                            />
                          }
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
