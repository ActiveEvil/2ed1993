import {
  LabelledGroup,
  LabelledRow,
  LabelledTable,
} from "@/components/CharacteristicProfile";
import { generateAnchorId } from "@/lib/anchors";
import Link from "next/link";
import { Fragment } from "react";

const DASH = "–";
const TIMES = "×";
const LINK = "underline underline-offset-4";

type ProfileWeapon = {
  id: number;
  quantity: number;
  alternative: number;
  position: number;
  weapons: { name: string };
};

type ProfileArmour = {
  armour_id: number;
  position: number;
  alternative: number;
  armour: { name: string };
};

type ProfileWargearCard = {
  position: number;
  card: { name: string };
};

export type EquipmentProfile = {
  id: number;
  name: string;
  models_max: number | null;
  unit_profile_weapons: ProfileWeapon[];
  unit_profile_armour: ProfileArmour[];
  unit_profile_wargear_cards: ProfileWargearCard[];
};

export type EquipmentOption = {
  id: number;
  option_group: string;
  models_min: number | null;
  models_max: number | null;
  models_per: number | null;
  whole_unit: boolean;
  quantity: number | null;
  grant_mode: string | null;
  restriction: string | null;
  note: string | null;
  profile: { name: string } | null;
  upgrade: { name: string; units: { name: string } } | null;
  replaces: { name: string } | null;
  grants: { name: string } | null;
  card: { name: string } | null;
  unit_option_categories: {
    position: number;
    wargear_categories: { category: string };
  }[];
};

export type EquipmentUnit = {
  name: string;
  unit_profiles: EquipmentProfile[];
  unit_options: EquipmentOption[];
};

const Loadout: React.FC<{
  weapons: ProfileWeapon[];
  armour?: ProfileArmour[];
}> = ({ weapons, armour = [] }): React.JSX.Element => {
  const alternatives = new Map<number, ProfileWeapon[]>();

  for (const weapon of weapons) {
    const bucket = alternatives.get(weapon.alternative) ?? [];
    bucket.push(weapon);
    alternatives.set(weapon.alternative, bucket);
  }

  const armourByAlternative = new Map<number, ProfileArmour[]>();

  for (const piece of armour) {
    const bucket = armourByAlternative.get(piece.alternative) ?? [];
    bucket.push(piece);
    armourByAlternative.set(piece.alternative, bucket);
  }

  const loadouts = [...alternatives.entries()].sort(([a], [b]) => a - b);

  return (
    <>
      {loadouts.map(([alternative, group], loadout) => (
        <Fragment key={alternative}>
          {loadout > 0 && (
            <span className="font-subtitle">{" \u2014or\u2014 "}</span>
          )}
          {group.map((weapon, index) => (
            <Fragment key={weapon.id}>
              {index > 0 && ", "}
              {weapon.quantity > 1 && `${weapon.quantity} ${TIMES} `}
              <Link
                className={LINK}
                href={`/wargear/weapons#${generateAnchorId(weapon.weapons.name)}`}
              >
                {weapon.weapons.name}
              </Link>
            </Fragment>
          ))}
          {(armourByAlternative.get(alternative) ?? []).map((piece) => (
            <Fragment key={`armour-${piece.armour_id}`}>
              {", "}
              <Link
                className={LINK}
                href={`/wargear/armour#${generateAnchorId(piece.armour.name)}`}
              >
                {piece.armour.name}
              </Link>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  );
};

const loadoutKey = (profile: {
  unit_profile_weapons: ProfileWeapon[];
  unit_profile_armour: ProfileArmour[];
}): string =>
  [
    profile.unit_profile_weapons
      .map((w) => `${w.alternative}:${w.quantity}:${w.weapons.name}`)
      .join("|"),
    profile.unit_profile_armour
      .filter((piece) => piece.alternative !== 0)
      .map((piece) => `${piece.alternative}:${piece.armour.name}`)
      .join("|"),
  ].join("~");

const ArmourLinks: React.FC<{ armour: ProfileArmour[] }> = ({
  armour,
}): React.JSX.Element => (
  <>
    {armour.map((piece, index) => (
      <Fragment key={piece.armour_id}>
        {index > 0 && ", "}
        <Link
          className={LINK}
          href={`/wargear/armour#${generateAnchorId(piece.armour.name)}`}
        >
          {piece.armour.name}
        </Link>
      </Fragment>
    ))}
  </>
);

const Sections: React.FC<{
  sections: string[];
  categoryHref?: (category: string) => string | null;
}> = ({ sections, categoryHref }): React.JSX.Element => (
  <>
    {sections.map((section, index) => {
      const href = categoryHref?.(section) ?? null;

      return (
        <Fragment key={section}>
          {index > 0 && ", "}
          {href ? (
            <Link className={LINK} href={href}>
              {section}
            </Link>
          ) : (
            section
          )}
        </Fragment>
      );
    })}
  </>
);

export const unitHasEquipment = (unit: EquipmentUnit): boolean =>
  Boolean(
    unit.unit_profiles.some(
      (profile) =>
        profile.unit_profile_weapons.length ||
        profile.unit_profile_armour.length ||
        profile.unit_profile_wargear_cards.length,
    ) || unit.unit_options.length,
  );

export const UnitEquipment: React.FC<{
  unit: EquipmentUnit;
  compact?: boolean;
  className?: string;
  categoryHref?: (category: string) => string | null;
  optionCosts?: ReadonlyMap<number, string>;
}> = ({
  unit,
  compact = false,
  className,
  categoryHref,
  optionCosts,
}): React.JSX.Element | null => {
  const profiles = unit.unit_profiles;
  const options = unit.unit_options;
  const named = profiles.length > 1;
  const armed = profiles.filter(
    (profile) => profile.unit_profile_weapons.length,
  );
  const universalArmour = (profile: EquipmentProfile): ProfileArmour[] =>
    profile.unit_profile_armour.filter((piece) => piece.alternative === 0);
  const scopedArmour = (profile: EquipmentProfile): ProfileArmour[] =>
    profile.unit_profile_armour.filter((piece) => piece.alternative !== 0);
  const armoured = profiles.filter(
    (profile) => universalArmour(profile).length,
  );
  const sharedArmour =
    armoured.length === profiles.length &&
    armoured.every(
      (profile) =>
        universalArmour(profile)
          .map(({ armour }) => armour.name)
          .join(", ") ===
        universalArmour(armoured[0])
          .map(({ armour }) => armour.name)
          .join(", "),
    );
  const sharedWeapons =
    armed.length > 0 &&
    armed.length === profiles.length &&
    armed.every((profile) => loadoutKey(profile) === loadoutKey(armed[0]));
  const wargearCardGrants = profiles.flatMap((profile) =>
    profile.unit_profile_wargear_cards.map((entry) => ({
      key: `wargear-card-${profile.id}-${entry.position}`,
      profile,
      card: entry.card,
    })),
  );

  if (
    !armed.length &&
    !armoured.length &&
    !options.length &&
    !wargearCardGrants.length
  ) {
    return null;
  }

  return (
    <LabelledTable
      caption={`${unit.name} equipment and options`}
      compact={compact}
      className={className}
    >
      {Boolean(armed.length) && (
        <LabelledGroup>
          {sharedWeapons ? (
            <LabelledRow label="Weapons" compact={compact}>
              <Loadout
                weapons={armed[0].unit_profile_weapons}
                armour={scopedArmour(armed[0])}
              />
            </LabelledRow>
          ) : (
            armed.map((profile, index) => (
              <LabelledRow
                key={`weapons-${profile.id}`}
                label="Weapons"
                repeated={index > 0}
                compact={compact}
              >
                {named && (
                  <>
                    <strong>{profile.name}</strong>
                    {` ${DASH} `}
                  </>
                )}
                <Loadout
                  weapons={profile.unit_profile_weapons}
                  armour={scopedArmour(profile)}
                />
              </LabelledRow>
            ))
          )}
        </LabelledGroup>
      )}
      {Boolean(armoured.length) && (
        <LabelledGroup>
          {sharedArmour ? (
            <LabelledRow label="Armour" compact={compact}>
              <ArmourLinks armour={universalArmour(armoured[0])} />
            </LabelledRow>
          ) : (
            armoured.map((profile, index) => (
              <LabelledRow
                key={`armour-${profile.id}`}
                label="Armour"
                repeated={index > 0}
                compact={compact}
              >
                {named && (
                  <>
                    <strong>{profile.name}</strong>
                    {` ${DASH} `}
                  </>
                )}
                <ArmourLinks armour={universalArmour(profile)} />
              </LabelledRow>
            ))
          )}
        </LabelledGroup>
      )}
      {[
        {
          label: "Wargear",
          rows: [
            ...wargearCardGrants.map((grant) => ({
              kind: "card" as const,
              key: grant.key,
              profile: grant.profile,
              card: grant.card,
            })),
            ...options
              .filter(({ option_group }) => option_group === "wargear")
              .map((option) => ({
                kind: "option" as const,
                key: `Wargear-${option.id}`,
                option,
              })),
          ],
        },
        {
          label: "Special",
          rows: options
            .filter(({ option_group }) => option_group === "special")
            .map((option) => ({
              kind: "option" as const,
              key: `Special-${option.id}`,
              option,
            })),
        },
        {
          label: "Support",
          rows: options
            .filter(({ option_group }) => option_group === "support")
            .map((option) => ({
              kind: "option" as const,
              key: `Support-${option.id}`,
              option,
            })),
        },
      ].map(
        ({ label, rows }) =>
          Boolean(rows.length) && (
            <LabelledGroup key={label}>
              {rows.map((row, index) => {
                if (row.kind === "card") {
                  return (
                    <LabelledRow
                      key={row.key}
                      label={label}
                      repeated={index > 0}
                      compact={compact}
                    >
                      {named && (
                        <>
                          <strong>{row.profile.name}</strong>
                          {` ${DASH} `}
                        </>
                      )}
                      <Link
                        className={LINK}
                        href={`/wargear/wargear-cards#${generateAnchorId(row.card.name)}`}
                      >
                        {row.card.name}
                      </Link>
                      {"."}
                    </LabelledRow>
                  );
                }

                const option = row.option;
                const sections = option.unit_option_categories.map(
                  ({ wargear_categories }) => wargear_categories.category,
                );
                const grantee = option.profile
                  ? profiles.find(({ name }) => name === option.profile?.name)
                  : undefined;
                const scope =
                  option.models_max === null
                    ? option.whole_unit
                      ? option.profile
                        ? "the whole squad"
                        : "The whole squad"
                      : grantee && grantee.models_max !== 1
                        ? "any model"
                        : null
                    : option.models_per !== null
                      ? `up to ${option.models_max} in ${option.models_per}`
                      : option.models_min === option.models_max
                        ? `${option.models_max} model${option.models_max === 1 ? "" : "s"}`
                        : option.models_min === null
                          ? `up to ${option.models_max} model${option.models_max === 1 ? "" : "s"}`
                          : `${option.models_min}${DASH}${option.models_max} models`;
                const noun = sections.every((section) =>
                  section.includes("Weapons"),
                )
                  ? (["weapon", "weapons"] as const)
                  : (["item", "equipment"] as const);
                const cost = optionCosts?.get(option.id) ?? null;
                const structured = Boolean(
                  option.profile ||
                  scope ||
                  sections.length ||
                  option.upgrade ||
                  option.grants ||
                  option.card ||
                  option.replaces,
                );

                return (
                  <LabelledRow
                    key={row.key}
                    label={label}
                    repeated={index > 0}
                    compact={compact}
                  >
                    {option.profile && <strong>{option.profile.name}</strong>}
                    {scope && (
                      <strong>
                        {option.profile && ", "}
                        {scope}
                      </strong>
                    )}
                    {(option.profile || scope) &&
                      Boolean(
                        sections.length ||
                        option.upgrade ||
                        option.grants ||
                        option.card ||
                        option.replaces,
                      ) &&
                      ` ${DASH} `}
                    {option.upgrade && (
                      <>
                        {"upgraded to "}
                        <Link
                          className={LINK}
                          href={`#${generateAnchorId(option.upgrade.units.name)}`}
                        >
                          {option.upgrade.units.name}
                        </Link>
                      </>
                    )}
                    {option.grants && (
                      <>
                        {!sections.length &&
                          !option.upgrade &&
                          !option.replaces &&
                          "equipped with "}
                        {option.quantity !== null &&
                          option.quantity > 1 &&
                          `${option.quantity} ${TIMES} `}
                        <Link
                          className={LINK}
                          href={`/wargear/weapons#${generateAnchorId(option.grants.name)}`}
                        >
                          {option.grants.name}
                        </Link>
                      </>
                    )}
                    {option.card && (
                      <>
                        {option.grants && ", "}
                        {!option.grants &&
                          !sections.length &&
                          !option.upgrade &&
                          !option.replaces &&
                          "equipped with "}
                        {option.quantity !== null &&
                          option.quantity > 1 &&
                          `${option.quantity} ${TIMES} `}
                        <Link
                          className={LINK}
                          href={`/wargear/wargear-cards#${generateAnchorId(option.card.name)}`}
                        >
                          {option.card.name}
                        </Link>
                      </>
                    )}
                    {Boolean(sections.length) && (
                      <>
                        {option.grant_mode === "add"
                          ? `${option.quantity === null ? `additional ${noun[1]}` : option.quantity === 1 ? `an additional ${noun[0]}` : `${option.quantity} additional ${noun[1]}`} from `
                          : option.grant_mode === "replace"
                            ? `${option.quantity === null ? noun[1] : option.quantity === 1 ? `one ${noun[0]}` : `${option.quantity} ${noun[1]}`} from `
                            : option.grant_mode === "add_or_replace"
                              ? "additional or alternative weapons from "
                              : option.grant_mode === "take_any"
                                ? "any combination from "
                                : ""}
                        <Sections
                          sections={sections}
                          categoryHref={categoryHref}
                        />
                      </>
                    )}
                    {option.grant_mode === "replace" &&
                      !option.replaces &&
                      Boolean(sections.length) &&
                      ", in place of a weapon carried"}
                    {option.replaces && (
                      <>
                        {", in place of "}
                        <Link
                          className={LINK}
                          href={`/wargear/weapons#${generateAnchorId(option.replaces.name)}`}
                        >
                          {option.replaces.name}
                        </Link>
                      </>
                    )}
                    {structured && ". "}
                    {option.note && (
                      <span dangerouslySetInnerHTML={{ __html: option.note }} />
                    )}
                    {cost && (
                      <>
                        {" "}
                        <span className="font-subtitle">{cost}</span>
                      </>
                    )}
                    {option.restriction && (
                      <span className="block">{option.restriction}</span>
                    )}
                  </LabelledRow>
                );
              })}
            </LabelledGroup>
          ),
      )}
    </LabelledTable>
  );
};
