import { Chip } from "@/components/Chip";
import { HighlighterLink } from "@/components/Highlighter";
import {
  type Bearer,
  type WeaponProfileRow,
  forBearer,
} from "@/components/WeaponProfile";
import {
  StripCell,
  WeaponStrip,
  closeCombatCells,
  rangedCells,
} from "@/components/WeaponStrip";
import { cardAnchorId, facetHref, generateAnchorId } from "@/lib/anchors";
import { vehicleCardColors, vehicleCardInk } from "@/lib/factions";
import { clsx } from "clsx";
import Link from "next/link";
import { Fragment } from "react";

const DASH = "–";
const MIDDOT = " · ";

export type CardDeck = "wargear" | "vehicle";

export type CardWeapon = {
  name: string;
  weapon_categories: { name: string };
  profile_description: string | null;
  weapon_profiles: WeaponProfileRow[];
};

export type CardArmour = {
  name: string;
  profile_description: string | null;
  armour_profiles: { save: string; condition: string | null }[];
  armour_special_rules: { name: string }[];
};

export type CardFaceData = {
  name: string;
  points: string;
  rarity?: string | null;
  restriction: string | null;
  discard_after_use: boolean;
  description: string | null;
  availabilities: { name: string; position: number }[];
  weapons: CardWeapon[];
  armour?: CardArmour[];
};

const DECKS: Record<CardDeck, { path: string; bearer: Bearer }> = {
  wargear: { path: "/wargear/wargear-cards", bearer: "Infantry" },
  vehicle: { path: "/wargear/vehicle-cards", bearer: "Vehicle" },
};

const WARGEAR_INK = {
  mat: "bg-2ed-dark-blue",
  name: "text-2ed-white",
  points: "text-2ed-light-yellow",
  chip: "border-2ed-white text-2ed-white",
};

const deckInk = (deck: CardDeck, first: string | undefined) => {
  if (deck === "wargear" || first === undefined) {
    return WARGEAR_INK;
  }

  const ink = vehicleCardInk[first];

  return {
    mat: vehicleCardColors[first],
    name: ink,
    points: ink,
    chip: ink,
  };
};

export const wargearCardPoints = (points: string | null): string =>
  points ? `${points} Point${points === "1" ? "" : "s"}` : "Special";

export const vehicleCardPoints = (
  points: number,
  basis: string | null,
): string => {
  switch (basis) {
    case "Per weapon upgrade":
      return `+${points} Points per weapon`;
    case "Per location":
      return `${points} Points per location`;
    case "Per cent of vehicle":
      return `+${points}% of the vehicle's points`;
    default:
      return `${points} Point${points === 1 ? "" : "s"}`;
  }
};

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

export const CardFace: React.FC<{
  deck: CardDeck;
  card: CardFaceData;
  as?: "h2" | "h3";
}> = ({ deck, card, as: Heading = "h2" }): React.JSX.Element => {
  const { path, bearer } = DECKS[deck];
  const cardId = cardAnchorId(card.name, card.availabilities);
  const weapons = card.weapons;
  const armourItems = card.armour ?? [];
  const availabilities = [...card.availabilities].sort(
    (a, b) => a.position - b.position,
  );
  const ink = deckInk(deck, availabilities[0]?.name);
  const rules = [
    ...weapons.map(({ profile_description }) => profile_description),
    ...armourItems.map(({ profile_description }) => profile_description),
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
  const search = [
    card.name,
    card.rarity ?? "",
    card.restriction ?? "",
    card.discard_after_use ? "discard after use" : "",
    ...weapons.map(({ name }) => name),
    ...armourItems.map(({ name }) => name),
  ]
    .join(" ")
    .toLowerCase();

  return (
    <div
      id={cardId}
      data-search={search}
      data-availability={availabilities
        .map(({ name }) => name.toLowerCase())
        .join(" ")}
      className={clsx(
        "flex flex-col justify-start gap-2 p-4 border-4 border-frame target:border-2ed-light-yellow shadow-xl",
        ink.mat,
      )}
    >
      <div className="flex justify-between items-baseline gap-4 w-full">
        <Heading>
          <HighlighterLink
            className={clsx(
              "font-subtitle uppercase text-2xl hover:underline underline-offset-4",
              ink.name,
            )}
            href={`${path}#${cardId}`}
          >
            {card.name}
          </HighlighterLink>
        </Heading>
        <span
          className={clsx(
            "font-subtitle whitespace-nowrap text-lg",
            ink.points,
          )}
        >
          {card.points}
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
          const closeCombat = weapon.weapon_categories.name === "Close combat";
          const specials = [
            ...new Set(
              weapon.weapon_profiles.flatMap((profile) =>
                forBearer(profile.weapon_special_rules, bearer).map(
                  ({ name }) => name,
                ),
              ),
            ),
          ].map((name) => ({ name }));

          return (
            <WeaponStrip
              key={`${cardId}_${weaponIndex}`}
              surface="card"
              name={weapon.name}
              special={ruleLinks("/wargear/weapons", specials)}
              profiles={weapon.weapon_profiles.map((profile, index) => {
                const cells: StripCell[] = closeCombat
                  ? closeCombatCells(profile)
                  : rangedCells(profile);
                if (!closeCombat && profile.long_range === DASH) {
                  cells[0] = {
                    ...cells[0],
                    value: profile.short_range,
                  };
                }

                return {
                  key: index,
                  label:
                    weapon.weapon_profiles.length > 1 ? profile.name : null,
                  cells,
                };
              })}
            />
          );
        })}
        {armourItems.map((armour, armourIndex) => (
          <WeaponStrip
            key={`${cardId}_armour_${armourIndex}`}
            surface="card"
            name={armour.name}
            special={ruleLinks("/wargear/armour", armour.armour_special_rules)}
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
                <Link className="underline underline-offset-4" href={href}>
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
      <div
        className={clsx(
          "flex flex-wrap items-center gap-x-4 gap-y-4 w-full",
          card.rarity ? "justify-between" : "justify-end",
        )}
      >
        {card.rarity && (
          <p className="font-bold text-2ed-white">{card.rarity}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
          {availabilities.map(({ name }) => (
            <Chip key={name} href={facetHref(name)} className={ink.chip}>
              {name}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
};
