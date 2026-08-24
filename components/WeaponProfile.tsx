import { generateAnchorId } from "@/lib/anchors";
import Link from "next/link";
import { Fragment, ReactNode } from "react";

const DASH = "–";

export type CaptionLevel = "h3" | "h4" | "h5" | "h6";

export const ProfileTable: React.FC<
  {
    caption?: string | null;
    captionAs?: CaptionLevel;
  } & React.PropsWithChildren
> = ({ caption, captionAs: Caption = "h3", children }): React.JSX.Element => (
  <div className="flex flex-col gap-2">
    {caption && <Caption className="font-subtitle text-sm">{caption}</Caption>}
    <table className="w-full table-fixed bg-black border-4 border-black border-collapse text-center">
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const RangedProfile: React.FC<{
  caption?: string | null;
  captionAs?: CaptionLevel;
  range: string;
  toHit: string;
  strength: string;
  damage: string;
  saveModifier: string;
  armourPenetration: string;
  special: ReactNode;
}> = ({
  caption,
  captionAs,
  range,
  toHit,
  strength,
  damage,
  saveModifier,
  armourPenetration,
  special,
}): React.JSX.Element => (
  <ProfileTable caption={caption} captionAs={captionAs}>
    <tr>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Range
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        To Hit
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Str
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Dam
      </th>
    </tr>
    <tr className="bg-card-face text-2ed-black text-sm">
      <td className="p-1 bg-card-face">{range}</td>
      <td className="p-1 bg-card-face">{toHit}</td>
      <td className="p-1 bg-card-face">{strength}</td>
      <td className="p-1 bg-card-face">{damage}</td>
    </tr>
    <tr>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Save Mod
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        AP
      </th>
      <th
        scope="col"
        colSpan={2}
        className="px-2 py-1 font-subtitle text-xs text-white"
      >
        Special
      </th>
    </tr>
    <tr className="bg-card-face text-2ed-black text-sm">
      <td className="p-1 bg-card-face">{saveModifier}</td>
      <td className="p-1 bg-card-face">{armourPenetration}</td>
      <td colSpan={2} className="p-1 bg-card-face">
        {special}
      </td>
    </tr>
  </ProfileTable>
);

export const CloseCombatProfile: React.FC<{
  caption?: string | null;
  captionAs?: CaptionLevel;
  strength: string;
  damage: string;
  saveModifier: string;
  armourPenetration: string;
  special: ReactNode;
}> = ({
  caption,
  captionAs,
  strength,
  damage,
  saveModifier,
  armourPenetration,
  special,
}): React.JSX.Element => (
  <ProfileTable caption={caption} captionAs={captionAs}>
    <tr>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Str
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Dam
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        Save Mod
      </th>
      <th scope="col" className="px-2 py-1 font-subtitle text-xs text-white">
        AP
      </th>
    </tr>
    <tr className="bg-card-face text-2ed-black text-sm">
      <td className="p-1 bg-card-face">{strength}</td>
      <td className="p-1 bg-card-face">{damage}</td>
      <td className="p-1 bg-card-face">{saveModifier}</td>
      <td className="p-1 bg-card-face">{armourPenetration}</td>
    </tr>
    <tr>
      <th
        scope="col"
        colSpan={4}
        className="px-2 py-1 font-subtitle text-xs text-white"
      >
        Special
      </th>
    </tr>
    <tr className="bg-card-face text-2ed-black text-sm">
      <td colSpan={4} className="p-1 bg-card-face">
        {special}
      </td>
    </tr>
  </ProfileTable>
);

export const ArmourProfile: React.FC<{
  caption?: string | null;
  captionAs?: CaptionLevel;
  save: ReactNode;
  special: ReactNode;
}> = ({ caption, captionAs, save, special }): React.JSX.Element => (
  <ProfileTable caption={caption} captionAs={captionAs}>
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
    <tr className="bg-card-face text-2ed-black text-lg">
      <td className="p-2 bg-card-face">{save}</td>
      <td colSpan={3} className="p-2 bg-card-face">
        {special}
      </td>
    </tr>
  </ProfileTable>
);

export const SpecialRuleLinks: React.FC<{
  href: string;
  rules: { name: string; bearer?: string | null }[];
  bearer?: Bearer;
}> = ({ href, rules: all, bearer }): React.JSX.Element => {
  const rules = forBearer(all, bearer);

  if (!rules.length) {
    return <>{DASH}</>;
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
};

export type WeaponProfileRow = {
  name: string | null;
  short_range: string;
  long_range: string;
  short_to_hit: string;
  long_to_hit: string;
  strength: string;
  damage: string;
  save_modifier: string;
  armour_penetration: string;
  weapon_special_rules: { name: string; bearer: string | null }[];
};

export type Bearer = "Infantry" | "Vehicle";

export const forBearer = <Rule extends { bearer?: string | null }>(
  rules: Rule[],
  bearer?: Bearer,
): Rule[] =>
  bearer === undefined
    ? rules
    : rules.filter((rule) => !rule.bearer || rule.bearer === bearer);

export const WeaponProfiles: React.FC<{
  weaponName: string;
  showWeaponName: boolean;
  captionAs?: CaptionLevel;
  closeCombat?: boolean;
  bearer?: Bearer;
  profiles: WeaponProfileRow[];
}> = ({
  weaponName,
  showWeaponName,
  captionAs,
  closeCombat = false,
  bearer,
  profiles,
}): React.JSX.Element => (
  <>
    {profiles.map((profile, index) => {
      const caption =
        [
          showWeaponName ? weaponName : null,
          profiles.length > 1 ? profile.name : null,
        ]
          .filter((part): part is string => Boolean(part))
          .join(" — ") || null;
      const special = (
        <SpecialRuleLinks
          href="/wargear/weapons"
          rules={profile.weapon_special_rules}
          bearer={bearer}
        />
      );

      return closeCombat ? (
        <CloseCombatProfile
          key={index}
          caption={caption}
          captionAs={captionAs}
          strength={profile.strength}
          damage={profile.damage}
          saveModifier={profile.save_modifier}
          armourPenetration={profile.armour_penetration}
          special={special}
        />
      ) : (
        <RangedProfile
          key={index}
          caption={caption}
          captionAs={captionAs}
          range={
            profile.long_range === DASH
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
    })}
  </>
);

export type WeaponDataRow = {
  id: number | string;
  name: string;
  profiles: WeaponProfileRow[];
};

export const WeaponDataTable: React.FC<{
  caption: string;
  weapons: WeaponDataRow[];
  bearer?: Bearer;
}> = ({ caption, weapons, bearer }): React.JSX.Element => (
  <div className="relative overflow-x-auto">
    <table className="min-w-max bg-black border-4 border-black border-collapse text-center">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th
            scope="col"
            rowSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white text-left"
          >
            Weapon
          </th>
          <th
            scope="colgroup"
            colSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Range
          </th>
          <th
            scope="colgroup"
            colSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            To Hit
          </th>
          <th
            scope="col"
            rowSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Str
          </th>
          <th
            scope="col"
            rowSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Dam
          </th>
          <th
            scope="col"
            rowSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Save Mod
          </th>
          <th
            scope="col"
            rowSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            AP
          </th>
          <th
            scope="col"
            rowSpan={2}
            className="px-2 py-1 font-subtitle text-xs text-white text-left"
          >
            Special
          </th>
        </tr>
        <tr>
          <th
            scope="col"
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Short
          </th>
          <th
            scope="col"
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Long
          </th>
          <th
            scope="col"
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Short
          </th>
          <th
            scope="col"
            className="px-2 py-1 font-subtitle text-xs text-white"
          >
            Long
          </th>
        </tr>
      </thead>
      <tbody>
        {weapons.flatMap((weapon) =>
          weapon.profiles.map((profile, index) => (
            <tr
              key={`${weapon.id}_${index}`}
              className="bg-card-face even:bg-card-stripe text-2ed-black text-sm"
            >
              <th scope="row" className="px-2 py-1 text-left whitespace-nowrap">
                <Link
                  className="underline underline-offset-4"
                  href={`/wargear/weapons#${generateAnchorId(weapon.name)}`}
                >
                  {weapon.name}
                </Link>
                {weapon.profiles.length > 1 && profile.name && (
                  <span className="font-normal lowercase">
                    , {profile.name}
                  </span>
                )}
              </th>
              <td className="px-2 py-1">{profile.short_range}</td>
              <td className="px-2 py-1">{profile.long_range}</td>
              <td className="px-2 py-1">{profile.short_to_hit}</td>
              <td className="px-2 py-1">{profile.long_to_hit}</td>
              <td className="px-2 py-1">{profile.strength}</td>
              <td className="px-2 py-1">{profile.damage}</td>
              <td className="px-2 py-1">{profile.save_modifier}</td>
              <td className="px-2 py-1">{profile.armour_penetration}</td>
              <td className="px-2 py-1 text-left">
                {forBearer(profile.weapon_special_rules, bearer).length
                  ? forBearer(profile.weapon_special_rules, bearer).map(
                      (rule, ruleIndex) => (
                        <Fragment key={rule.name}>
                          {ruleIndex > 0 && ", "}
                          <Link
                            className="underline underline-offset-4"
                            href={`/wargear/weapons#${generateAnchorId(rule.name)}_Rule`}
                          >
                            {rule.name}
                          </Link>
                        </Fragment>
                      ),
                    )
                  : DASH}
              </td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  </div>
);
