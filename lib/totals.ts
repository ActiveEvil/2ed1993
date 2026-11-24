import type { Catalogue } from "@/lib/catalogue";
import type { ListPrice, RowRef, UnitTaken } from "@/lib/pricing";

export type TotalsBreach = {
  kind: "points_limit" | "band_max" | "band_min" | "no_ally_row";
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

export type TotalsContext = {
  hostListId: number;
  pointsLimit: number;
  variantId?: number | null;
};

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

  // LB-18, LB-60
  const finish = () => {
    for (const unit of units) {
      if (unit.listId !== context.hostListId && unit.allyId == null) {
        result.breaches.push({
          kind: "no_ally_row",
          listId: context.hostListId,
          governs: { table: "army_lists", id: unit.listId },
          allowed: 0,
          taken: 1,
          unitKeys: [unit.key],
        });
      }
    }
    return result;
  };

  const catalogue = catalogues.get(context.hostListId);
  if (!catalogue) {
    return finish();
  }

  const variantId =
    catalogue.requirements.find(
      (row) => row.kind === "army_variant" && row.id === context.variantId,
    )?.id ?? null;
  if (variantId !== null) {
    return finish();
  }

  const entries = new Map(catalogue.entries.map((entry) => [entry.id, entry]));
  const unitTypes = new Map(
    catalogue.units.map((catalogueUnit) => [
      catalogueUnit.id,
      catalogueUnit.unit_type_id,
    ]),
  );
  const byKey = new Map(units.map((unit) => [unit.key, unit]));
  const reassignments = catalogue.requirements.filter(
    (row) =>
      row.kind === "band_reassignment" &&
      row.mode === "rider" &&
      (row.variant_id === null ||
        (row.variant_id === variantId) === row.under_variant),
  );

  // b.11, LB-60, LB-63, LB-64: a unit of another list counts in the host's Support band only, or in none.
  const support = catalogue.bands.find(
    (band) => band.category === "Support",
  )?.id;

  // A14, A15, LB-65: a ride's points join its rider's band when the rider is a character of that band.
  const bandOf = (unit: UnitTaken) => {
    if (unit.listId !== context.hostListId) {
      return support;
    }
    const own = entries.get(unit.entryId)?.unit_category_id;
    const rider =
      unit.rideFor === undefined ? undefined : byKey.get(unit.rideFor);
    const riderEntry =
      rider?.listId === context.hostListId
        ? entries.get(rider.entryId)
        : undefined;
    if (!riderEntry || unitTypes.get(riderEntry.unit_id) !== 1) {
      return own;
    }
    const target = riderEntry.unit_category_id;
    return reassignments.some(
      (row) =>
        row.target_category_id === target &&
        (row.entry_id === unit.entryId || row.unit_category_id === own),
    )
      ? target
      : own;
  };

  const bands = [...catalogue.bands].sort((a, b) => a.position - b.position);

  for (const band of bands) {
    if (band.max_percent === null && band.min_percent === null) {
      continue;
    }
    const governs: RowRef = { table: "unit_categories", id: band.id };
    const feeding = units.filter((unit) => bandOf(unit) === band.id);
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

  return finish();
}
