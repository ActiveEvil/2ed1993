import {
  LabelledGroup,
  LabelledRow,
  LabelledTable,
} from "@/components/CharacteristicProfile";
import { generateAnchorId, ruleHref } from "@/lib/anchors";
import Link from "next/link";
import { Fragment } from "react";

const DASH = "–";
const TIMES = "×";
const LINK = "underline underline-offset-4";
const BLOCK_HTML = /<(p|section|ul)(\s|>)/i;

const isBlockHtml = (html: string | null): boolean =>
  Boolean(html && BLOCK_HTML.test(html));

export const cards = (count: number): string =>
  `${count} wargear card${count === 1 ? "" : "s"}`;

export const ruleName = (name: string): string => name.split(" (")[0];

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
  save_override: string | null;
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
  grants_armour: { name: string } | null;
  replaces_armour: { name: string } | null;
  card: { name: string } | null;
  unit_option_categories: {
    position: number;
    wargear_categories: { category: string };
  }[];
};

export type SpecialRule = {
  id: number;
  name: string;
  rule: string | null;
  rule_id: number | null;
  anchor: string | null;
  rules: {
    id: number;
    name: string;
    rule_categories: { slug: string };
  } | null;
};

export type SpecialRuleAssignment = {
  position: number;
  note: string | null;
  rule: SpecialRule | null;
};

export type EquipmentUnit = {
  name: string;
  unit_profiles: EquipmentProfile[];
  unit_options: EquipmentOption[];
  unit_special_rule_assignments: SpecialRuleAssignment[];
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
              {piece.save_override && ` (${piece.save_override})`}
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
      .map(
        (piece) =>
          `${piece.alternative}:${piece.armour.name}:${piece.save_override ?? ""}`,
      )
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
        {piece.save_override && ` (${piece.save_override})`}
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
    ) ||
    unit.unit_options.length ||
    unit.unit_special_rule_assignments.length,
  );

export const UnitEquipment: React.FC<{
  unit: EquipmentUnit;
  compact?: boolean;
  className?: string;
  categoryHref?: (category: string) => string | null;
  factionSlug?: string | null;
  optionCosts?: ReadonlyMap<number, string>;
  wargearCardsMax?: number | null;
}> = ({
  unit,
  compact = false,
  className,
  categoryHref,
  factionSlug,
  optionCosts,
  wargearCardsMax,
}): React.JSX.Element | null => {
  const profiles = unit.unit_profiles;
  const options = unit.unit_options;
  const specialRules = unit.unit_special_rule_assignments.flatMap(
    (assignment) =>
      assignment.rule
        ? [
            {
              kind: "rule" as const,
              key: `Rule-${assignment.rule.id}`,
              note: assignment.note,
              rule: assignment.rule,
            },
          ]
        : [],
  );
  const isSingleModelUnit = profiles.every(
    (profile) => profile.models_max === 1,
  );
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
  const armourKey = (profile: EquipmentProfile): string =>
    universalArmour(profile)
      .map((piece) => `${piece.armour.name}:${piece.save_override ?? ""}`)
      .join(", ");
  const sharedArmour =
    armoured.length === profiles.length &&
    armoured.every((profile) => armourKey(profile) === armourKey(armoured[0]));
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
  const wargearAllowanceText =
    wargearCardsMax != null ? (
      <>
        {"up to "}
        {wargearCardsMax}{" "}
        <Link className={LINK} href="/wargear/wargear-cards">
          {`wargear card${wargearCardsMax === 1 ? "" : "s"}`}
        </Link>
      </>
    ) : null;

  if (
    !armed.length &&
    !armoured.length &&
    !options.length &&
    !specialRules.length &&
    !wargearCardGrants.length &&
    !wargearAllowanceText
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
      {(() => {
        const wargearRows = [
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
        ];

        return [
          {
            label: "Wargear",
            rows: wargearRows.length
              ? wargearRows
              : wargearAllowanceText
                ? [{ kind: "allowance" as const, key: "wargear-allowance" }]
                : [],
          },
          {
            label: "Special",
            rows: [
              ...options
                .filter(({ option_group }) => option_group === "special")
                .map((option) => ({
                  kind: "option" as const,
                  key: `Special-${option.id}`,
                  option,
                })),
              ...specialRules,
            ],
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
                  const showWargearPrefix =
                    label === "Wargear" &&
                    index === 0 &&
                    Boolean(wargearAllowanceText) &&
                    row.kind !== "allowance";
                  const wargearPrefix = showWargearPrefix ? (
                    <>
                      {wargearAllowanceText}
                      {", "}
                    </>
                  ) : null;

                  if (row.kind === "allowance") {
                    return (
                      <LabelledRow
                        key={row.key}
                        label={label}
                        repeated={index > 0}
                        compact={compact}
                      >
                        {wargearAllowanceText}
                      </LabelledRow>
                    );
                  }

                  if (row.kind === "rule") {
                    const linked = row.rule.rules;
                    const display = ruleName(row.rule.name);
                    const href = linked
                      ? ruleHref(linked, row.rule.anchor)
                      : factionSlug
                        ? `/rules/${factionSlug}-rules#${generateAnchorId(display)}`
                        : null;
                    const prose = row.rule.rule;
                    const blockProse = isBlockHtml(prose);
                    const blockNote = isBlockHtml(row.note);

                    return (
                      <LabelledRow
                        key={row.key}
                        label={label}
                        repeated={index > 0}
                        compact={compact}
                      >
                        <strong className={blockProse ? "block" : undefined}>
                          {href ? (
                            <Link className={LINK} href={href}>
                              {display}
                            </Link>
                          ) : (
                            display
                          )}
                        </strong>
                        {!blockProse &&
                          Boolean(prose || row.note) &&
                          ` ${DASH} `}
                        {prose &&
                          (blockProse ? (
                            <div
                              className="dynamic-content compact"
                              dangerouslySetInnerHTML={{ __html: prose }}
                            />
                          ) : (
                            <span
                              className="dynamic-content compact"
                              dangerouslySetInnerHTML={{ __html: prose }}
                            />
                          ))}
                        {row.note && (
                          <>
                            {prose && !blockProse && " "}
                            {blockNote ? (
                              <div
                                className="dynamic-content compact"
                                dangerouslySetInnerHTML={{ __html: row.note }}
                              />
                            ) : (
                              <span
                                className="dynamic-content compact"
                                dangerouslySetInnerHTML={{ __html: row.note }}
                              />
                            )}
                          </>
                        )}
                      </LabelledRow>
                    );
                  }

                  if (row.kind === "card") {
                    return (
                      <LabelledRow
                        key={row.key}
                        label={label}
                        repeated={index > 0}
                        compact={compact}
                      >
                        {wargearPrefix}
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
                  const scope = isSingleModelUnit
                    ? null
                    : option.models_max === null
                      ? option.whole_unit
                        ? option.profile
                          ? "the whole squad"
                          : "The whole squad"
                        : option.profile
                          ? grantee && grantee.models_max !== 1
                            ? "any model"
                            : null
                          : "Any model"
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
                    option.grants_armour ||
                    option.card ||
                    option.replaces ||
                    option.replaces_armour,
                  );

                  return (
                    <LabelledRow
                      key={row.key}
                      label={label}
                      repeated={index > 0}
                      compact={compact}
                    >
                      {wargearPrefix}
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
                          option.grants_armour ||
                          option.card ||
                          option.replaces ||
                          option.replaces_armour,
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
                      {option.grants_armour && (
                        <>
                          {option.grants && ", "}
                          {!option.grants &&
                            !sections.length &&
                            !option.upgrade &&
                            !option.replaces &&
                            "equipped with "}
                          <Link
                            className={LINK}
                            href={`/wargear/armour#${generateAnchorId(option.grants_armour.name)}`}
                          >
                            {option.grants_armour.name}
                          </Link>
                        </>
                      )}
                      {option.card && (
                        <>
                          {(option.grants || option.grants_armour) && ", "}
                          {!option.grants &&
                            !option.grants_armour &&
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
                      {option.replaces_armour && (
                        <>
                          {option.replaces ? ", " : ", in place of "}
                          <Link
                            className={LINK}
                            href={`/wargear/armour#${generateAnchorId(option.replaces_armour.name)}`}
                          >
                            {option.replaces_armour.name}
                          </Link>
                        </>
                      )}
                      {structured && ". "}
                      {option.note && (
                        <span
                          className="dynamic-content compact"
                          dangerouslySetInnerHTML={{ __html: option.note }}
                        />
                      )}
                      {cost && (
                        <>
                          {" "}
                          <strong>{cost}</strong>
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
        );
      })()}
    </LabelledTable>
  );
};
