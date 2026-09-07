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
