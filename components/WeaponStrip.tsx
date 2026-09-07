import { clsx } from "clsx";
import { Fragment } from "react";

export type StripCell = {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
};

export type StripProfile = {
  key: string | number;
  label?: string | null;
  cells: StripCell[];
};

export type StripSurface = "page" | "card";

const SURFACE: Record<StripSurface, { rules: string; cell: string }> = {
  page: {
    rules: "bg-frame",
    cell: "bg-background group-target:bg-2ed-light-yellow group-target:text-black",
  },
  card: {
    rules: "bg-2ed-black",
    cell: "bg-card-face text-2ed-black",
  },
};

export const WeaponStrip: React.FC<
  {
    id?: string;
    name: React.ReactNode;
    special?: React.ReactNode;
    profiles: StripProfile[];
    surface?: StripSurface;
    as?: "h3" | "h4" | "h5" | "h6";
    className?: string;
  } & Pick<React.HTMLAttributes<HTMLElement>, "hidden"> & {
      "data-search"?: string;
      "data-refs"?: string;
    }
> = ({
  id,
  name,
  special,
  profiles,
  surface = "page",
  as: Heading = "h3",
  className,
  ...rest
}): React.JSX.Element => (
  <section
    id={id}
    className={clsx(
      "group flex flex-col border-4 border-frame",
      SURFACE[surface].rules,
      className,
    )}
    {...rest}
  >
    <div className="flex flex-wrap justify-between items-baseline gap-x-4 gap-y-1 px-3 py-2 bg-black text-white">
      <Heading className="font-subtitle text-base">{name}</Heading>
      {special && (
        <span className="font-subtitle text-xs text-right">{special}</span>
      )}
    </div>
    {profiles.map((profile) => (
      <Fragment key={profile.key}>
        {profile.label && (
          <div
            className={clsx(
              "px-3 py-1 font-subtitle text-xs uppercase tracking-widest",
              surface === "page"
                ? "bg-stripe group-target:bg-2ed-light-yellow group-target:text-black"
                : "bg-card-stripe text-2ed-black",
            )}
          >
            {profile.label}
          </div>
        )}
        <dl
          className={clsx(
            "grid gap-0.5 md:flex",
            profile.cells.length === 4 ? "grid-cols-2" : "grid-cols-3",
          )}
        >
          {profile.cells.map((cell, index) => (
            <div
              key={index}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-center",
                cell.wide ? "md:flex-2" : "md:flex-1",
                SURFACE[surface].cell,
              )}
            >
              <dt className="font-subtitle text-xs uppercase tracking-widest">
                {cell.label}
              </dt>
              <dd className="font-semibold text-base">{cell.value}</dd>
            </div>
          ))}
        </dl>
      </Fragment>
    ))}
  </section>
);

export const rangedCells = (profile: {
  short_range: string;
  long_range: string;
  short_to_hit: string;
  long_to_hit: string;
  strength: string;
  damage: string;
  save_modifier: string;
  armour_penetration: string;
}): StripCell[] => [
  {
    label: "Range",
    value: `${profile.short_range} / ${profile.long_range}`,
    wide: true,
  },
  {
    label: "To hit",
    value: `${profile.short_to_hit} / ${profile.long_to_hit}`,
    wide: true,
  },
  ...closeCombatCells(profile),
];

export const closeCombatCells = (profile: {
  strength: string;
  damage: string;
  save_modifier: string;
  armour_penetration: string;
}): StripCell[] => [
  { label: "Str", value: profile.strength },
  { label: "Dam", value: profile.damage },
  { label: "Save Mod", value: profile.save_modifier },
  { label: "AP", value: profile.armour_penetration },
];
