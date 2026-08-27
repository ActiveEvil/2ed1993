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
  alternative?: number;
  count?: string | null;
  note?: string | null;
};

const characteristic = (value: number | null): string =>
  value === null ? DASH : String(value);

const HEAD_CELL = "px-2 py-1 font-subtitle text-xs text-white";
const CELL = "px-2 py-1";

export const ProfileFrame: React.FC<React.PropsWithChildren> = ({
  children,
}): React.JSX.Element => (
  <div className="border-4 border-black">{children}</div>
);

export const CharacteristicTable: React.FC<{
  caption: string;
  rows: CharacteristicRow[];
}> = ({ caption, rows }): React.JSX.Element => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-max bg-black border-collapse text-center">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col" className={clsx(HEAD_CELL, "text-left")}>
            Profile
          </th>
          {CHARACTERISTICS.map(({ key, label }) => (
            <th key={key} scope="col" className={clsx(HEAD_CELL, "w-12")}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-base">
        {rows.map((row, index) => {
          const orAbove =
            index > 0 && row.alternative !== rows[index - 1].alternative;
          const orBelow =
            index < rows.length - 1 &&
            rows[index + 1].alternative !== row.alternative;

          return (
            <tr
              key={row.id}
              className="bg-background even:bg-(--stripe) group-target:bg-2ed-light-yellow group-target:even:bg-[color-mix(in_oklab,var(--color-2ed-light-yellow)_80%,transparent)]"
            >
              <th
                scope="row"
                className={clsx(
                  "relative px-2 text-left whitespace-nowrap",
                  orAbove ? "pt-4" : "pt-1",
                  orBelow ? "pb-4" : "pb-1",
                )}
              >
                {orAbove && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute -top-3 left-2 font-subtitle font-normal"
                    >
                      {"\u2014or\u2014"}
                    </span>
                    <span className="sr-only">{"or "}</span>
                  </>
                )}
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
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const LabelledTable: React.FC<{
  caption: string;
  className?: string;
  children: React.ReactNode;
}> = ({ caption, className, children }): React.JSX.Element => (
  <table
    className={clsx(
      "w-full border-collapse text-sm",
      "[&>tbody:nth-of-type(odd)]:bg-background [&>tbody:nth-of-type(even)]:bg-(--stripe)",
      "group-target:[&>tbody:nth-of-type(odd)]:bg-2ed-light-yellow group-target:[&>tbody:nth-of-type(even)]:bg-[color-mix(in_oklab,var(--color-2ed-light-yellow)_80%,transparent)]",
      className,
    )}
  >
    <caption className="sr-only">{caption}</caption>
    {children}
  </table>
);

export const LabelledGroup: React.FC<React.PropsWithChildren> = ({
  children,
}): React.JSX.Element => <tbody>{children}</tbody>;

export const LabelledRow: React.FC<{
  label: string;
  repeated?: boolean;
  children: React.ReactNode;
}> = ({ label, repeated = false, children }): React.JSX.Element => (
  <tr>
    <th
      scope="row"
      className="w-24 px-2 py-1 font-subtitle text-sm text-left align-top uppercase"
    >
      <span className={clsx(repeated && "sr-only")}>{label}</span>
    </th>
    <td className="px-2 py-1 align-top">{children}</td>
  </tr>
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
