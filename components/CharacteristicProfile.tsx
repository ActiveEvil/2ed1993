import clsx from "clsx";

const DASH = "–";
const TIMES = "×";

export const CHARACTERISTICS = [
  { key: "m", label: "M" },
  { key: "ws", label: "WS" },
  { key: "bs", label: "BS" },
  { key: "s", label: "S" },
  { key: "t", label: "T" },
  { key: "w", label: "W" },
  { key: "i", label: "I" },
  { key: "a", label: "A" },
  { key: "ld", label: "Ld" },
] as const;

export type Characteristics = {
  [Key in (typeof CHARACTERISTICS)[number]["key"]]: number | null;
};

export type CharacteristicRow = Characteristics & {
  id: number | string;
  name: string;
  count?: string | null;
  note?: string | null;
  weapons?: React.ReactNode;
  armour?: React.ReactNode;
};

const characteristic = (value: number | null): string =>
  value === null ? DASH : String(value);

const HEAD_CELL = "px-2 py-1 font-subtitle text-xs text-white";
const CELL = "px-2 py-1";
const WARGEAR_CELL = "px-2 py-1 text-left";

export const CharacteristicTable: React.FC<{
  caption: string;
  rows: CharacteristicRow[];
}> = ({ caption, rows }): React.JSX.Element => {
  const armed = rows.some((row) => row.weapons);
  const armoured = rows.some((row) => row.armour);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max bg-black border-4 border-black border-collapse text-center">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={clsx(HEAD_CELL, "text-left")}>
              Profile
            </th>
            {CHARACTERISTICS.map(({ key, label }) => (
              <th key={key} scope="col" className={HEAD_CELL}>
                {label}
              </th>
            ))}
            {armed && (
              <th scope="col" className={clsx(HEAD_CELL, "text-left")}>
                Weapons
              </th>
            )}
            {armoured && (
              <th scope="col" className={clsx(HEAD_CELL, "text-left")}>
                Armour
              </th>
            )}
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((row) => (
            <tr key={row.id} className="bg-background even:bg-(--stripe)">
              <th
                scope="row"
                className={clsx(CELL, "text-left whitespace-nowrap")}
              >
                {row.name}
                {row.count && (
                  <span className="font-normal">{` ${TIMES}${row.count}`}</span>
                )}
                {row.note && (
                  <span className="block font-normal">{row.note}</span>
                )}
              </th>
              {CHARACTERISTICS.map(({ key }) => (
                <td key={key} className={CELL}>
                  {characteristic(row[key])}
                </td>
              ))}
              {armed && <td className={WARGEAR_CELL}>{row.weapons}</td>}
              {armoured && <td className={WARGEAR_CELL}>{row.armour}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const OptionList: React.FC<{
  caption: string;
  children: React.ReactNode;
}> = ({ caption, children }): React.JSX.Element => (
  <div className="border-4 border-black">
    <h4 className="sr-only">{caption}</h4>
    <ul className="text-base">{children}</ul>
  </div>
);

export const OptionRow: React.FC<React.PropsWithChildren> = ({
  children,
}): React.JSX.Element => (
  <li className="px-2 py-1 bg-background even:bg-(--stripe)">{children}</li>
);

export const CharacteristicStrip: React.FC<{
  caption?: string | null;
  profile: Characteristics;
}> = ({ caption, profile }): React.JSX.Element => (
  <div className="flex flex-col gap-2">
    {caption && <h3 className="font-subtitle text-sm">{caption}</h3>}
    <div className="grid grid-cols-9 border-4 border-b-0 border-black">
      {CHARACTERISTICS.map(({ key, label }) => (
        <div
          key={key}
          className="p-1 border-b-4 border-black font-bold text-sm text-center"
        >
          {label}
        </div>
      ))}
      {CHARACTERISTICS.map(({ key }) => (
        <div
          key={key}
          className="p-1 border-b-4 border-black text-sm text-center"
        >
          {characteristic(profile[key])}
        </div>
      ))}
    </div>
  </div>
);
