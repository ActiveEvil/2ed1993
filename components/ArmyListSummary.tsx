import { CHIP_CLASS } from "@/components/Chip";
import { clsx } from "clsx";
import Link from "next/link";
import { Fragment } from "react";

export type CompositionBand = {
  category: string;
  min: number | null;
  max: number | null;
  note: string | null;
};

export type AllyLink = {
  id: number;
  name: string;
  href: string;
  note: string | null;
};

export const compositionLimit = (band: CompositionBand): string | null => {
  if (band.min !== null && band.max !== null) {
    return `Min ${band.min}%, Max ${band.max}%`;
  }

  if (band.min !== null) {
    return `Min ${band.min}%`;
  }

  if (band.max !== null) {
    return `Max ${band.max}%`;
  }

  return null;
};

export const ArmyListSummary: React.FC<{
  bands: CompositionBand[];
  allies: AllyLink[];
  className?: string;
}> = ({ bands, allies, className }): React.JSX.Element | null => {
  const limited = bands.flatMap((band) => {
    const limit = compositionLimit(band);

    return limit === null
      ? []
      : [{ category: band.category, limit, note: band.note }];
  });

  if (!limited.length && !allies.length) {
    return null;
  }

  const annotated = allies.filter(
    (ally): ally is AllyLink & { note: string } => ally.note !== null,
  );

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      {Boolean(limited.length) && (
        <div className="dynamic-content">
          <section className="chart grid-cols-8! max-w-xl">
            <h3 id="Army_Composition_Chart" className="col-span-8">
              Army Composition Chart
            </h3>
            {limited.map((band) => (
              <Fragment key={band.category}>
                <div className="col-span-2 font-bold text-center content-center">
                  {band.category}
                </div>
                <div className="col-span-2 text-center content-center">
                  {band.limit}
                </div>
                <div className="col-span-4">{band.note}</div>
              </Fragment>
            ))}
          </section>
        </div>
      )}
      {Boolean(allies.length) && (
        <div className="flex flex-col gap-2">
          <span className="font-subtitle text-xs uppercase tracking-[0.14em]">
            Allies
          </span>
          <span className="flex flex-wrap gap-2">
            {allies.map((ally) => (
              <Link key={ally.id} href={ally.href} className={CHIP_CLASS}>
                {ally.name}
              </Link>
            ))}
          </span>
          {annotated.map((ally) => (
            <span key={ally.id} className="text-sm">
              {`${ally.name}: ${ally.note}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
