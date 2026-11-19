import { type Catalogue, loadCatalogue } from "@/lib/catalogue";
import {
  type RowRef,
  type UnitPrice,
  type UnitTaken,
  type Unpriced,
  priceList,
  smallestSelection,
  upgradeTarget,
} from "@/lib/pricing";
import { pricingCases } from "@/scripts/builder/pricing-cases";

const LIST_IDS = Array.from({ length: 14 }, (_, index) => index + 1);
const EXPECTED_UNPRICED_OPTIONS = new Set<number>();
const EXPECTED_UNPRICED_WARGEAR_CARDS = new Set([69, 70, 71, 72]);
const TOLERANCE = 1e-9;

const formatRows = (rows: RowRef[]) =>
  rows.map((row) => `${row.table} ${row.id}`).join(", ");

const formatGap = (gap: Unpriced) => `${gap.reason} [${formatRows(gap.rows)}]`;

const gapKey = (gap: Unpriced) => `${gap.reason}:${formatRows(gap.rows)}`;

function describe(price: UnitPrice): string[] {
  return [
    ...price.unpriced.map(
      (gap) => `    unpriced ${price.unitKey}: ${formatGap(gap)}`,
    ),
    ...(price.pending.length > 0
      ? [`    pending ${price.unitKey}: ${formatRows(price.pending)}`]
      : []),
  ];
}

const CARD_BEARER: UnitTaken = {
  key: "card-bearer",
  listId: 5,
  entryId: 6,
  grade: 17,
  models: { 17: 1 },
  options: [],
  items: [],
  datafaxWeapons: [],
};

const CARD_VEHICLE: UnitTaken = {
  key: "card-vehicle",
  listId: 5,
  entryId: 19,
  models: {},
  vehicles: 1,
  options: [],
  items: [],
  datafaxWeapons: [],
};

const close = (a: number, b: number) => Math.abs(a - b) < TOLERANCE;

function runCases(catalogues: Map<number, Catalogue>): number {
  let failures = 0;
  for (const pricingCase of pricingCases) {
    const result = priceList(catalogues, pricingCase.units);
    const problems: string[] = [];
    if (!close(result.total, pricingCase.expected)) {
      problems.push(`expected ${pricingCase.expected}, got ${result.total}`);
    }
    for (const [key, expected] of Object.entries(
      pricingCase.expectedByUnit ?? {},
    )) {
      const got = result.units.find((price) => price.unitKey === key)?.total;
      if (got === undefined || !close(got, expected)) {
        problems.push(`${key} expected ${expected}, got ${got}`);
      }
    }
    const gaps = result.units.flatMap((price) => price.unpriced);
    for (const wanted of pricingCase.expectedUnpriced ?? []) {
      const found = gaps.some(
        (gap) =>
          gap.reason === wanted.reason &&
          gap.rows.some(
            (row) => row.table === wanted.row.table && row.id === wanted.row.id,
          ),
      );
      if (!found) {
        problems.push(
          `expected ${wanted.reason} on ${wanted.row.table} ${wanted.row.id}`,
        );
      }
    }
    const unexpectedGaps = gaps.filter(
      (gap) =>
        !(pricingCase.expectedUnpriced ?? []).some(
          (wanted) =>
            gap.reason === wanted.reason &&
            gap.rows.some(
              (row) =>
                row.table === wanted.row.table && row.id === wanted.row.id,
            ),
        ),
    );
    if (unexpectedGaps.length > 0) {
      problems.push("unexpected unpriced");
    }
    const status = problems.length === 0 ? "ok  " : "FAIL";
    console.log(
      `${status} ${pricingCase.id} ${pricingCase.label}: ${result.total} (${pricingCase.source})${problems.length > 0 ? ` -- ${problems.join("; ")}` : ""}`,
    );
    for (const price of result.units) {
      for (const line of describe(price)) {
        console.log(line);
      }
    }
    if (problems.length > 0) {
      failures += 1;
    }
  }
  return failures;
}

type SweepCounts = {
  entries: number;
  selections: number;
  upgradeOnly: number;
  withPending: number;
  options: number;
  expectedOptionGaps: number;
  unexpected: number;
  entryGaps: number;
  wargearCards: number;
  expectedCardGaps: number;
  vehicleCards: number;
};

function sweepList(catalogue: Catalogue, counts: SweepCounts): void {
  const listId = catalogue.list.id;
  const catalogues = new Map([[listId, catalogue]]);
  for (const entry of catalogue.entries) {
    counts.entries += 1;
    if (entry.points_basis_id === 5) {
      counts.upgradeOnly += 1;
      const reaching = catalogue.unitOptions.filter(
        (option) => upgradeTarget(catalogue, option.id)?.id === entry.id,
      );
      if (entry.points === null && reaching.length > 0) {
        counts.unexpected += 1;
        console.log(
          `  list ${listId} entry ${entry.id}: reached by options ${reaching.map((option) => option.id).join(", ")} but holds no points`,
        );
      }
      continue;
    }
    const selections = smallestSelection(catalogue, entry.id);
    const baseGaps = new Set<string>();
    for (const selection of selections) {
      counts.selections += 1;
      const price = priceList(catalogues, [selection]).units[0];
      if (price.pending.length > 0) {
        counts.withPending += 1;
      }
      for (const gap of price.unpriced) {
        baseGaps.add(gapKey(gap));
        counts.entryGaps += 1;
        console.log(
          `  list ${listId} entry ${entry.id} (${selection.key}): ${formatGap(gap)}`,
        );
      }
    }
    const base = selections[0];
    if (!base) {
      continue;
    }
    const options = catalogue.unitOptions.filter(
      (option) => option.unit_id === entry.unit_id && option.optional,
    );
    for (const option of options) {
      counts.options += 1;
      const selection = {
        ...base,
        options: [
          {
            unitOptionId: option.id,
            models: option.whole_unit ? undefined : 1,
          },
        ],
      };
      const price = priceList(catalogues, [selection]).units[0];
      for (const gap of price.unpriced) {
        if (baseGaps.has(gapKey(gap))) {
          continue;
        }
        const expected =
          gap.reason === "no_price_row" &&
          gap.rows.some(
            (row) =>
              row.table === "unit_options" &&
              EXPECTED_UNPRICED_OPTIONS.has(row.id),
          );
        if (expected) {
          counts.expectedOptionGaps += 1;
          continue;
        }
        counts.unexpected += 1;
        console.log(
          `  list ${listId} entry ${entry.id} option ${option.id}: ${formatGap(gap)}`,
        );
      }
    }
  }
}

function sweepCards(catalogue: Catalogue, counts: SweepCounts): void {
  const catalogues = new Map([[catalogue.list.id, catalogue]]);
  const gapsOf = (selection: UnitTaken) =>
    priceList(catalogues, [selection]).units[0].unpriced;
  const bearerGaps = new Set(gapsOf(CARD_BEARER).map(gapKey));
  const vehicleGaps = new Set(gapsOf(CARD_VEHICLE).map(gapKey));

  for (const card of catalogue.wargearCards) {
    const expected = EXPECTED_UNPRICED_WARGEAR_CARDS.has(card.id);
    const gaps = gapsOf({
      ...CARD_BEARER,
      wargearCards: [{ cardId: card.id, profileId: 17 }],
    }).filter((gap) => !bearerGaps.has(gapKey(gap)));
    if (gaps.length === 0) {
      if (expected) {
        counts.unexpected += 1;
        console.log(
          `  list ${CARD_BEARER.listId} entry ${CARD_BEARER.entryId} wargear card ${card.id}: priced, expected card_points_not_numeric`,
        );
      } else {
        counts.wargearCards += 1;
      }
      continue;
    }
    for (const gap of gaps) {
      if (
        expected &&
        gap.reason === "card_points_not_numeric" &&
        gap.rows.some(
          (row) => row.table === "wargear_cards" && row.id === card.id,
        )
      ) {
        counts.expectedCardGaps += 1;
        continue;
      }
      counts.unexpected += 1;
      console.log(
        `  list ${CARD_BEARER.listId} entry ${CARD_BEARER.entryId} wargear card ${card.id}: ${formatGap(gap)}`,
      );
    }
  }

  for (const card of catalogue.vehicleCards) {
    const gaps = gapsOf({
      ...CARD_VEHICLE,
      vehicleCards: [{ cardId: card.id, vehicles: 1, count: 1 }],
    }).filter((gap) => !vehicleGaps.has(gapKey(gap)));
    if (gaps.length === 0) {
      counts.vehicleCards += 1;
      continue;
    }
    for (const gap of gaps) {
      counts.unexpected += 1;
      console.log(
        `  list ${CARD_VEHICLE.listId} entry ${CARD_VEHICLE.entryId} vehicle card ${card.id}: ${formatGap(gap)}`,
      );
    }
  }
}

async function main(): Promise<number> {
  const catalogues = new Map<number, Catalogue>();
  for (const listId of LIST_IDS) {
    const catalogue = await loadCatalogue(listId);
    if (catalogue) {
      catalogues.set(listId, catalogue);
    } else {
      console.log(`list ${listId}: not found`);
    }
  }

  console.log("Cases");
  const failures = runCases(catalogues);

  console.log("Sweep");
  const counts: SweepCounts = {
    entries: 0,
    selections: 0,
    upgradeOnly: 0,
    withPending: 0,
    options: 0,
    expectedOptionGaps: 0,
    unexpected: 0,
    entryGaps: 0,
    wargearCards: 0,
    expectedCardGaps: 0,
    vehicleCards: 0,
  };
  for (const catalogue of catalogues.values()) {
    sweepList(catalogue, counts);
  }
  const cardCatalogue = catalogues.get(CARD_BEARER.listId);
  if (cardCatalogue) {
    sweepCards(cardCatalogue, counts);
  } else {
    counts.unexpected += 1;
    console.log(`  list ${CARD_BEARER.listId}: not loaded, cards not swept`);
  }
  console.log(
    `entries ${counts.entries}; selections priced ${counts.selections}; upgrade-only ${counts.upgradeOnly}; selections with pending ${counts.withPending}; entry gaps ${counts.entryGaps}`,
  );
  console.log(
    `optional options swept ${counts.options}; expected option gaps ${counts.expectedOptionGaps}; unexpected findings ${counts.unexpected}`,
  );
  console.log(
    `wargear cards priced ${counts.wargearCards}; expected card gaps ${counts.expectedCardGaps}; vehicle cards priced ${counts.vehicleCards}`,
  );
  console.log(`cases failed ${failures} of ${pricingCases.length}`);

  return failures > 0 || counts.entryGaps > 0 || counts.unexpected > 0 ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.log(error instanceof Error ? error.message : "check failed");
    process.exit(1);
  },
);
