import { CHIP_CLASS } from "@/components/Chip";
import { clsx } from "clsx";
import Link from "next/link";
import { Fragment } from "react";

export type CompositionBand = {
  category: string;
  min: number | null;
  max: number | null;
};

export type AllyLink = {
  id: number;
  name: string;
  href: string;
  note: string | null;
};

export const compositionLimit = (band: CompositionBand): string | null => {
  if (band.min !== null && band.max !== null) {
    return `Min ${band.min}%, Max ${band.max}% of army points value`;
  }

  if (band.min !== null) {
    return `Min ${band.min}% of army points value`;
  }

  if (band.max !== null) {
    return `Max ${band.max}% of army points value`;
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

    return limit === null ? [] : [{ category: band.category, limit }];
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
          <section className="chart">
            <h3 id="Army_Composition_Chart" className="col-span-6">
              Army Composition Chart
            </h3>
            {limited.map((band) => (
              <Fragment key={band.category}>
                <div className="col-span-3 font-bold text-center content-center">
                  {band.category}
                </div>
                <div className="col-span-3 text-center content-center">
                  {band.limit}
                </div>
              </Fragment>
            ))}
          </section>
        </div>
      )}
      {Boolean(allies.length) && (
        <div className="flex flex-col gap-2">
          <span className="font-subtitle text-xs uppercase tracking-widest">
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
