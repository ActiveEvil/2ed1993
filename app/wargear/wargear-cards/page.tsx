import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";
import { ReactNode } from "react";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Wargear Cards | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Wargear Cards.",
  };
}

function ProfileTable({
  caption,
  children,
}: {
  caption?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {caption && <h3 className="font-subtitle text-sm">{caption}</h3>}
      <table className="w-full table-fixed bg-black border-4 border-black border-collapse text-center">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function RangedProfile({
  caption,
  range,
  toHit,
  strength,
  damage,
  saveModifier,
  armourPenetration,
  special,
}: {
  caption?: string | null;
  range: string;
  toHit: string;
  strength: string;
  damage: string;
  saveModifier: string;
  armourPenetration: string;
  special: ReactNode;
}) {
  return (
    <ProfileTable caption={caption}>
      <tr>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Range
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          To Hit
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Str
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Dam
        </th>
      </tr>
      <tr className="bg-2ed-white text-2ed-black text-sm">
        <td className="p-1 bg-2ed-white">{range}</td>
        <td className="p-1 bg-2ed-white">{toHit}</td>
        <td className="p-1 bg-2ed-white">{strength}</td>
        <td className="p-1 bg-2ed-white">{damage}</td>
      </tr>
      <tr>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Save Mod
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          AP
        </th>
        <th
          scope="col"
          colSpan={2}
          className="p-1 font-subtitle text-xs text-white"
        >
          Special
        </th>
      </tr>
      <tr className="bg-2ed-white text-2ed-black text-sm">
        <td className="p-1 bg-2ed-white">{saveModifier}</td>
        <td className="p-1 bg-2ed-white">{armourPenetration}</td>
        <td colSpan={2} className="p-1 bg-2ed-white">
          {special}
        </td>
      </tr>
    </ProfileTable>
  );
}

function CloseCombatProfile({
  caption,
  strength,
  damage,
  saveModifier,
  armourPenetration,
  special,
}: {
  caption?: string | null;
  strength: string;
  damage: string;
  saveModifier: string;
  armourPenetration: string;
  special: ReactNode;
}) {
  return (
    <ProfileTable caption={caption}>
      <tr>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Str
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Dam
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          Save Mod
        </th>
        <th scope="col" className="p-1 font-subtitle text-xs text-white">
          AP
        </th>
      </tr>
      <tr className="bg-2ed-white text-2ed-black text-sm">
        <td className="p-1 bg-2ed-white">{strength}</td>
        <td className="p-1 bg-2ed-white">{damage}</td>
        <td className="p-1 bg-2ed-white">{saveModifier}</td>
        <td className="p-1 bg-2ed-white">{armourPenetration}</td>
      </tr>
      <tr>
        <th
          scope="col"
          colSpan={4}
          className="p-1 font-subtitle text-xs text-white"
        >
          Special
        </th>
      </tr>
      <tr className="bg-2ed-white text-2ed-black text-sm">
        <td colSpan={4} className="p-1 bg-2ed-white">
          {special}
        </td>
      </tr>
    </ProfileTable>
  );
}

function ArmourProfile({
  save,
  special,
}: {
  save: ReactNode;
  special: ReactNode;
}) {
  return (
    <ProfileTable>
      <tr>
        <th scope="col" className="p-2 font-subtitle text-xs text-white">
          Save
        </th>
        <th
          scope="col"
          colSpan={3}
          className="p-2 font-subtitle text-xs text-white"
        >
          Special
        </th>
      </tr>
      <tr className="bg-2ed-white text-2ed-black text-lg">
        <td className="p-2 bg-2ed-white">{save}</td>
        <td colSpan={3} className="p-2 bg-2ed-white">
          {special}
        </td>
      </tr>
    </ProfileTable>
  );
}

function SpecialRuleLinks({
  href,
  rules,
}: {
  href: string;
  rules: { name: string }[];
}) {
  if (!rules.length) {
    return <>&ndash;</>;
  }

  return (
    <span className="flex flex-col">
      {rules.map((rule) => (
        <Link
          key={rule.name}
          className="underline underline-offset-4"
          href={`${href}#${generateAnchorId(rule.name)}_Rule`}
        >
          {rule.name}
        </Link>
      ))}
    </span>
  );
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
      "id, name, availability, rarity, points, restriction, discard_after_use, description, weapons(name, category, profile_description, weapon_profiles(name, short_range, long_range, short_to_hit, long_to_hit, strength, damage, save_modifier, armour_penetration, weapon_special_rules(name))), armour(name, category, profile_description, armour_profiles(save, condition), armour_special_rules(name))",
    )
    .order("availability")
    .order("name");

  assertNoQueryErrors("/wargear/wargear-cards", cardsError);

  if (cards) {
    const availabilities = new Map<string, typeof cards>();

    for (const card of cards) {
      const bucket = availabilities.get(card.availability) ?? [];
      bucket.push(card);
      availabilities.set(card.availability, bucket);
    }

    const sections = Array.from(availabilities.entries()).map(
      ([availability, items]) => ({ availability, items }),
    );

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
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
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
          {sections.map((section) => {
            const sectionId = generateAnchorId(section.availability);

            return (
              <section
                id={sectionId}
                key={sectionId}
                className="flex flex-col gap-4"
              >
                <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                  <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black shadow-lg" />
                  <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                    {section.availability}
                  </h2>
                </div>
                <section className="grid md:grid-cols-2 gap-4">
                  {section.items.map((card) => {
                    const cardId = generateAnchorId(card.name);
                    const weapon = card.weapons;
                    const armour = card.armour;
                    const rules =
                      weapon?.profile_description ??
                      armour?.profile_description ??
                      null;
                    const href = weapon
                      ? `/wargear/weapons#${generateAnchorId(weapon.name)}`
                      : armour
                        ? `/wargear/armour#${generateAnchorId(armour.name)}`
                        : null;
                    const closeCombat = weapon?.category === "Close combat";
                    const multiProfile =
                      (weapon?.weapon_profiles.length ?? 0) > 1;

                    return (
                      <div
                        key={cardId}
                        id={cardId}
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
                        <div className="flex flex-col justify-start gap-4 p-4 h-full bg-2ed-white text-2ed-black">
                          {/* Both, not one or the other: a card may carry its
                              own words as well as a linked item. The printed
                              card leads with flavour and follows with the
                              rules the profile cannot express. */}
                          {card.description && (
                            <div
                              className="dynamic-content flex flex-col gap-2"
                              dangerouslySetInnerHTML={{
                                __html: card.description,
                              }}
                            />
                          )}
                          {rules && (
                            <div
                              className="dynamic-content flex flex-col gap-2"
                              dangerouslySetInnerHTML={{ __html: rules }}
                            />
                          )}
                          {weapon?.weapon_profiles.map((profile, index) =>
                            closeCombat ? (
                              <CloseCombatProfile
                                key={`${cardId}_${index}`}
                                caption={multiProfile ? profile.name : null}
                                strength={profile.strength}
                                damage={profile.damage}
                                saveModifier={profile.save_modifier}
                                armourPenetration={profile.armour_penetration}
                                special={
                                  <SpecialRuleLinks
                                    href="/wargear/weapons"
                                    rules={profile.weapon_special_rules}
                                  />
                                }
                              />
                            ) : (
                              <RangedProfile
                                key={`${cardId}_${index}`}
                                caption={multiProfile ? profile.name : null}
                                range={
                                  profile.long_range === "–"
                                    ? profile.short_range
                                    : `${profile.short_range} / ${profile.long_range}`
                                }
                                toHit={`${profile.short_to_hit} / ${profile.long_to_hit}`}
                                strength={profile.strength}
                                damage={profile.damage}
                                saveModifier={profile.save_modifier}
                                armourPenetration={profile.armour_penetration}
                                special={
                                  <SpecialRuleLinks
                                    href="/wargear/weapons"
                                    rules={profile.weapon_special_rules}
                                  />
                                }
                              />
                            ),
                          )}
                          {armour && (
                            <ArmourProfile
                              save={
                                armour.armour_profiles.length ? (
                                  <span className="flex flex-col">
                                    {armour.armour_profiles.map(
                                      (profile, index) => (
                                        <span key={`${cardId}_${index}`}>
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
                          )}
                          {href && (
                            <p className="text-sm">
                              See the full entry in{" "}
                              <Link
                                className="underline underline-offset-4"
                                href={href}
                              >
                                {weapon ? "Weapons" : "Armour"}
                              </Link>
                              .
                            </p>
                          )}
                          {(card.restriction || card.discard_after_use) && (
                            <p className="mt-auto font-subtitle uppercase text-2ed-dark-red text-center">
                              {[
                                card.restriction,
                                card.discard_after_use
                                  ? "Discard after use"
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <p className="w-full font-bold text-2ed-white">
                          {card.rarity}
                        </p>
                      </div>
                    );
                  })}
                </section>
              </section>
            );
          })}
        </main>
      </>
    );
  }

  throw new Error("/wargear/wargear-cards: rendered with no data");
}
