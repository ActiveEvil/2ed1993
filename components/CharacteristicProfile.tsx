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
  cost?: string | null;
};

const characteristic = (value: number | null): string =>
  value === null ? DASH : String(value);

const HEAD_CELL = "py-1 font-subtitle text-xs text-white";
const CELL = "py-1";

export const ProfileFrame: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ className, children }): React.JSX.Element => (
  <div className={clsx("border-4 border-black", className)}>{children}</div>
);

export const CharacteristicTable: React.FC<{
  caption: string;
  rows: CharacteristicRow[];
  costLabel?: string;
  named?: boolean;
}> = ({
  caption,
  rows,
  costLabel = "Points",
  named = true,
}): React.JSX.Element => {
  const priced = rows.some((row) => row.cost);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max bg-black border-collapse text-center">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {named && (
              <th scope="col" className={clsx(HEAD_CELL, "px-2 text-left")}>
                Profile
              </th>
            )}
            {CHARACTERISTICS.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                className={clsx(HEAD_CELL, "w-12 px-2")}
              >
                {label}
              </th>
            ))}
            {priced && (
              <th scope="col" className={clsx(HEAD_CELL, "px-2 text-right")}>
                {costLabel}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="font-semibold text-lg">
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
                {named && (
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
                          className="absolute -top-3 left-2 text-sm font-subtitle font-normal"
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
                )}
                {CHARACTERISTICS.map(({ key }) => (
                  <td key={key} className={`${CELL} px-2`}>
                    {characteristic(row[key])}
                  </td>
                ))}
                {priced && (
                  <td
                    className={`${CELL} px-2 text-right whitespace-nowrap font-subtitle`}
                  >
                    {row.cost ?? ""}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const LabelledTable: React.FC<{
  caption: string;
  className?: string;
  compact?: boolean;
  children: React.ReactNode;
}> = ({ caption, className, compact = false, children }): React.JSX.Element => (
  <table
    className={clsx(
      "w-full border-collapse",
      compact ? "text-sm" : "text-lg",
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
  compact?: boolean;
  children: React.ReactNode;
}> = ({
  label,
  repeated = false,
  compact = false,
  children,
}): React.JSX.Element => (
  <tr>
    <th
      scope="row"
      className={clsx(
        "font-subtitle text-left align-top uppercase tracking-[0.14em]",
        compact ? "w-16 px-1 py-1 text-xs" : "w-24 px-2 py-1 text-sm",
      )}
    >
      <span className={clsx(repeated && "sr-only")}>{label}</span>
    </th>
    <td className={clsx("align-top", compact ? "px-1 py-1" : "px-2 py-1")}>
      {children}
    </td>
  </tr>
);
