import type { Catalogue } from "@/lib/catalogue";
import type { ListPrice, RowRef, UnitTaken } from "@/lib/pricing";

export type TotalsBreach = {
  kind: "points_limit" | "band_max" | "band_min";
  listId: number;
  governs: RowRef | null;
  allowed: number;
  taken: number;
  unitKeys: string[];
};

export type TotalsResult = {
  breaches: TotalsBreach[];
  unchecked: {
    kind: TotalsBreach["kind"];
    governs: RowRef | null;
    unitKeys: string[];
  }[];
};

export type TotalsContext = { hostListId: number; pointsLimit: number };

export function checkTotals(
  catalogues: ReadonlyMap<number, Catalogue>,
  units: UnitTaken[],
  price: ListPrice,
  context: TotalsContext,
): TotalsResult {
  const result: TotalsResult = { breaches: [], unchecked: [] };
  const prices = new Map(
    price.units.map((unitPrice) => [unitPrice.unitKey, unitPrice]),
  );
  const incomplete = (feeding: UnitTaken[]) =>
    feeding
      .filter((unit) => prices.get(unit.key)?.complete !== true)
      .map((unit) => unit.key);
  const sum = (feeding: UnitTaken[]) =>
    feeding.reduce(
      (total, unit) => total + (prices.get(unit.key)?.total ?? 0),
      0,
    );

  const decide = (
    kind: TotalsBreach["kind"],
    governs: RowRef | null,
    feeding: UnitTaken[],
    taken: number,
    percent: number,
    breached: boolean,
    decided: boolean,
  ) => {
    const unitKeys = feeding.map((unit) => unit.key);
    if (!decided) {
      result.unchecked.push({ kind, governs, unitKeys: incomplete(feeding) });
      return;
    }
    if (breached) {
      result.breaches.push({
        kind,
        listId: context.hostListId,
        governs,
        allowed: (context.pointsLimit * percent) / 100,
        taken,
        unitKeys,
      });
    }
  };

  decide(
    "points_limit",
    null,
    units,
    price.total,
    100,
    price.total > context.pointsLimit,
    price.total > context.pointsLimit ||
      (price.complete && incomplete(units).length === 0),
  );

  const catalogue = catalogues.get(context.hostListId);
  if (!catalogue) {
    return result;
  }

  const bandOf = new Map(
    catalogue.entries.map((entry) => [entry.id, entry.unit_category_id]),
  );
  const host = units.filter((unit) => unit.listId === context.hostListId);
  const bands = [...catalogue.bands].sort((a, b) => a.position - b.position);

  for (const band of bands) {
    if (band.max_percent === null && band.min_percent === null) {
      continue;
    }
    const governs: RowRef = { table: "unit_categories", id: band.id };
    const feeding = host.filter((unit) => bandOf.get(unit.entryId) === band.id);
    const taken = sum(feeding);
    const decided = incomplete(feeding).length === 0;
    if (band.max_percent !== null) {
      decide(
        "band_max",
        governs,
        feeding,
        taken,
        band.max_percent,
        taken * 100 > context.pointsLimit * band.max_percent,
        decided || taken * 100 > context.pointsLimit * band.max_percent,
      );
    }
    if (band.min_percent !== null) {
      decide(
        "band_min",
        governs,
        feeding,
        taken,
        band.min_percent,
        taken * 100 < context.pointsLimit * band.min_percent,
        decided,
      );
    }
  }

  return result;
}
