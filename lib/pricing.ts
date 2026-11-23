import type { Catalogue } from "@/lib/catalogue";

type Entry = Catalogue["entries"][number];
type EntryOption = Catalogue["entryOptions"][number];
type UnitOption = Catalogue["unitOptions"][number];
type Unit = Catalogue["units"][number];

export type OptionTaken = {
  unitOptionId: number;
  models?: number;
  vehicles?: number;
  levels?: number;
  half?: "a" | "b" | "both";
};

export type ItemTaken = {
  itemId: number;
  holder: "model" | "team" | "crew" | "unit";
  profileId?: number;
  holders: number;
  viaOptionId: number;
};

export type DatafaxPick = {
  rowId: number;
  ammunitionId?: number;
  fitted?: "in_place" | "in_addition";
  vehicles?: number;
};

export type WargearCardTaken = {
  cardId: number;
  profileId: number;
  holders?: number;
};

export type VehicleCardTaken = {
  cardId: number;
  vehicles?: number;
  count?: number;
  rows?: { rowId: number; weapons?: number }[];
};

export type UnitTaken = {
  key: string;
  listId: number;
  entryId: number;
  grade?: number;
  models: Record<number, number>;
  vehicles?: number;
  options: OptionTaken[];
  items: ItemTaken[];
  datafaxWeapons: DatafaxPick[];
  split?: boolean;
  attachedTo?: { unitKey: string; mode: "leads" | "must" | "may" };
  rideFor?: string;
  wargearCards?: WargearCardTaken[];
  vehicleCards?: VehicleCardTaken[];
};

export type RowRef = { table: string; id: number };

export type PriceLine = {
  key:
    | "entry"
    | "grade"
    | "models"
    | "datafax"
    | "datafax_weapon"
    | "option"
    | "upgrade"
    | "mastery"
    | "item"
    | "card_grant"
    | "substitution_credit"
    | "ride_replaced"
    | "surcharge"
    | "wargear_card"
    | "vehicle_card"
    | "vehicle_card_percent";
  amount: number;
  quantity: number;
  rows: RowRef[];
};

export type Unpriced = {
  reason:
    | "no_price_row"
    | "card_points_not_numeric"
    | "datafax_points_null"
    | "entry_points_null"
    | "grade_unpriced"
    | "upgrade_only_entry"
    | "upgrade_target_unpriced"
    | "leader_unpriced";
  rows: RowRef[];
};

export type UnitPrice = {
  unitKey: string;
  lines: PriceLine[];
  total: number;
  complete: boolean;
  unpriced: Unpriced[];
  pending: RowRef[];
};

export type ListPrice = {
  units: UnitPrice[];
  total: number;
  complete: boolean;
};

const BASIS = {
  perEntry: 1,
  perModel: 2,
  perBase: 3,
  seeDatafax: 4,
  perModelUpgrade: 5,
  perMasteryLevel: 6,
  perWeaponUpgrade: 7,
  perLocation: 8,
  perCentOfVehicle: 9,
} as const;

const SURCHARGE_ROUNDED_HALF_UP_LISTS: ReadonlySet<number> = new Set([12]);

const VEHICLE_CARD = {
  heavyFlamer: 2,
  ammoFeed: 20,
  talons: 27,
} as const;

const MOTIVE_TYPE_WALKERS = 4;

const CARD_POINTS = /^\d+(\.\d+)?$/;

type Draft = { lines: PriceLine[]; unpriced: Unpriced[]; pending: RowRef[] };

const ref = (table: string, id: number): RowRef => ({ table, id });

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const modelCount = (unit: UnitTaken) => sum(Object.values(unit.models));

const vehicleCount = (unit: UnitTaken) => unit.vehicles ?? 1;

const isUnpriced = (value: unknown): value is Unpriced =>
  typeof value === "object" && value !== null && "reason" in value;

function finish(unitKey: string, draft: Draft): UnitPrice {
  return {
    unitKey,
    lines: draft.lines,
    total: sum(draft.lines.map((line) => line.amount)),
    complete: draft.unpriced.length === 0,
    unpriced: draft.unpriced,
    pending: draft.pending,
  };
}

function priceRow(
  catalogue: Catalogue,
  entryId: number,
  unitOptionId: number,
): EntryOption | undefined {
  return catalogue.entryOptions.find(
    (row) =>
      row.army_list_entry_id === entryId && row.unit_option_id === unitOptionId,
  );
}

const unitOf = (catalogue: Catalogue, entry: Entry): Unit | undefined =>
  catalogue.units.find((unit) => unit.id === entry.unit_id);

const opensSection = (option: UnitOption) =>
  option.unit_option_categories.length > 0;

const grantsSomething = (option: UnitOption) =>
  option.weapon_id !== null ||
  option.armour_id !== null ||
  option.wargear_card_id !== null ||
  option.vehicle_card_id !== null ||
  option.granted_unit_id !== null ||
  option.to_unit_profile_id !== null;

const squadronMultiplier = (entry: Entry, unit: UnitTaken) =>
  entry.points_basis_id === BASIS.perEntry && entry.squadron_max !== null
    ? vehicleCount(unit)
    : 1;

const compulsoryMultiplier = (
  entry: Entry,
  unit: UnitTaken,
  taken: OptionTaken,
) =>
  entry.points_basis_id === BASIS.perEntry && entry.squadron_max !== null
    ? (taken.vehicles ?? vehicleCount(unit))
    : 1;

function modelsTaking(
  unit: UnitTaken,
  option: UnitOption,
  taken: OptionTaken,
): number {
  if (option.whole_unit) {
    return option.unit_profile_id !== null
      ? (unit.models[option.unit_profile_id] ?? 0)
      : modelCount(unit);
  }
  return taken.models ?? 1;
}

export function cardPoints(
  catalogue: Catalogue,
  cardId: number,
): number | Unpriced {
  const card = catalogue.wargearCards.find((row) => row.id === cardId);
  const value = card?.points?.trim() ?? "";
  if (!CARD_POINTS.test(value)) {
    return {
      reason: "card_points_not_numeric",
      rows: [ref("wargear_cards", cardId)],
    };
  }
  return Number(value);
}

export function upgradeTarget(
  catalogue: Catalogue,
  unitOptionId: number,
): Entry | null {
  const option = catalogue.unitOptions.find((row) => row.id === unitOptionId);
  if (!option || option.to_unit_profile_id === null) {
    return null;
  }
  const ownEntries = catalogue.entries.filter(
    (entry) => entry.unit_id === option.unit_id,
  );
  if (ownEntries.some((entry) => priceRow(catalogue, entry.id, option.id))) {
    return null;
  }
  const profileUnit = catalogue.units.find((unit) =>
    unit.unit_profiles.some(
      (profile) => profile.id === option.to_unit_profile_id,
    ),
  );
  if (!profileUnit || profileUnit.id === option.unit_id) {
    return null;
  }
  return (
    catalogue.entries.find((entry) => entry.unit_id === profileUnit.id) ?? null
  );
}

export function substitutionCredit(
  catalogue: Catalogue,
  unit: UnitTaken,
  reached: Entry,
): PriceLine | Unpriced | null {
  const row = catalogue.requirements.find(
    (requirement) =>
      requirement.kind === "substitution" &&
      requirement.entry_id === reached.id &&
      requirement.target_entry_id === unit.entryId,
  );
  if (!row) {
    return null;
  }
  const count = row.count ?? 1;
  const profile = catalogue.units
    .flatMap((source) => source.unit_profiles)
    .find((candidate) => candidate.id === row.target_profile_id);
  if (profile && profile.points !== null) {
    return {
      key: "substitution_credit",
      amount: -profile.points * count,
      quantity: count,
      rows: [
        ref("army_list_requirements", row.id),
        ref("unit_profiles", profile.id),
      ],
    };
  }
  const entry = catalogue.entries.find(
    (candidate) => candidate.id === unit.entryId,
  );
  if (
    !entry ||
    entry.points === null ||
    (entry.points_basis_id !== BASIS.perModel &&
      entry.points_basis_id !== BASIS.perBase)
  ) {
    return {
      reason: "no_price_row",
      rows: [ref("army_list_requirements", row.id)],
    };
  }
  return {
    key: "substitution_credit",
    amount: -entry.points * count,
    quantity: count,
    rows: [
      ref("army_list_requirements", row.id),
      ref("army_list_entries", entry.id),
    ],
  };
}

function priceEntry(
  catalogue: Catalogue,
  entry: Entry,
  unit: UnitTaken,
  draft: Draft,
): void {
  const entryRef = ref("army_list_entries", entry.id);
  const basis = entry.points_basis_id;

  if (basis === null) {
    const row =
      unit.grade === undefined
        ? undefined
        : catalogue.entryOptions.find(
            (candidate) =>
              candidate.army_list_entry_id === entry.id &&
              candidate.unit_option_id === null &&
              candidate.unit_profile_id === unit.grade,
          );
    if (!row || row.points === null) {
      draft.unpriced.push({
        reason: "grade_unpriced",
        rows:
          unit.grade === undefined
            ? [entryRef]
            : [entryRef, ref("unit_profiles", unit.grade)],
      });
      return;
    }
    draft.lines.push({
      key: "grade",
      amount: row.points,
      quantity: 1,
      rows: [ref("army_list_entry_options", row.id)],
    });
    return;
  }

  if (basis === BASIS.perModelUpgrade) {
    draft.unpriced.push({ reason: "upgrade_only_entry", rows: [entryRef] });
    return;
  }

  if (basis === BASIS.seeDatafax) {
    const datafax = unitOf(catalogue, entry)?.datafaxes;
    if (!datafax || datafax.points === null) {
      draft.unpriced.push({
        reason: "datafax_points_null",
        rows: datafax ? [entryRef, ref("datafaxes", datafax.id)] : [entryRef],
      });
      return;
    }
    const vehicles = vehicleCount(unit);
    draft.lines.push({
      key: "datafax",
      amount: datafax.points * vehicles,
      quantity: vehicles,
      rows: [ref("datafaxes", datafax.id), entryRef],
    });
    return;
  }

  if (entry.points === null) {
    draft.unpriced.push({ reason: "entry_points_null", rows: [entryRef] });
    return;
  }

  if (basis === BASIS.perEntry) {
    const quantity = squadronMultiplier(entry, unit);
    draft.lines.push({
      key: "entry",
      amount: entry.points * quantity,
      quantity,
      rows: [entryRef],
    });
    return;
  }

  if (basis === BASIS.perModel || basis === BASIS.perBase) {
    const quantity = modelCount(unit);
    draft.lines.push({
      key: "models",
      amount: entry.points * quantity,
      quantity,
      rows: [entryRef],
    });
    return;
  }

  draft.unpriced.push({ reason: "no_price_row", rows: [entryRef] });
}

function priceProfileRows(
  catalogue: Catalogue,
  entry: Entry,
  unit: UnitTaken,
  draft: Draft,
): void {
  if (entry.points === null) {
    return;
  }
  const rows = catalogue.entryOptions.filter(
    (row) =>
      row.army_list_entry_id === entry.id &&
      row.unit_option_id === null &&
      row.unit_profile_id !== null,
  );
  for (const row of rows) {
    const count =
      row.unit_profile_id === null
        ? 0
        : (unit.models[row.unit_profile_id] ?? 0);
    if (count === 0) {
      continue;
    }
    if (row.points === null) {
      draft.unpriced.push({
        reason: "no_price_row",
        rows: [ref("army_list_entry_options", row.id)],
      });
      continue;
    }
    const quantity = row.points_basis_id === BASIS.perEntry ? 1 : count;
    draft.lines.push({
      key: "models",
      amount: row.points * quantity,
      quantity,
      rows: [ref("army_list_entry_options", row.id)],
    });
  }
}

function priceOptionRow(
  entry: Entry,
  unit: UnitTaken,
  option: UnitOption,
  taken: OptionTaken,
  row: EntryOption,
  draft: Draft,
): void {
  if (row.points_percent !== null) {
    return;
  }
  const rows = [
    ref("army_list_entry_options", row.id),
    ref("unit_options", option.id),
  ];
  if (row.points === null) {
    draft.unpriced.push({ reason: "no_price_row", rows });
    return;
  }
  let quantity: number;
  switch (row.points_basis_id) {
    case BASIS.perMasteryLevel:
      quantity = taken.levels ?? 1;
      break;
    case BASIS.perModel:
    case BASIS.perBase:
    case BASIS.perModelUpgrade:
      quantity = modelsTaking(unit, option, taken);
      break;
    default:
      quantity = option.optional ? 1 : compulsoryMultiplier(entry, unit, taken);
  }
  if (
    option.per_half &&
    unit.split &&
    (taken.half === "a" || taken.half === "b")
  ) {
    quantity = quantity / 2;
  }
  draft.lines.push({
    key: row.points_basis_id === BASIS.perMasteryLevel ? "mastery" : "option",
    amount: row.points * quantity,
    quantity,
    rows,
  });
}

function sectionHasPricedItem(catalogue: Catalogue, option: UnitOption) {
  const sectionIds = new Set(
    option.unit_option_categories.map((link) => link.wargear_category_id),
  );
  return catalogue.items.some(
    (item) =>
      sectionIds.has(item.wargear_category_id) &&
      item.points !== null &&
      item.points > 0,
  );
}

function applyCompulsoryOption(
  catalogue: Catalogue,
  entry: Entry,
  unit: UnitTaken,
  option: UnitOption,
  taken: OptionTaken,
  draft: Draft,
): void {
  const row = priceRow(catalogue, entry.id, option.id);
  if (row) {
    priceOptionRow(entry, unit, option, taken, row, draft);
  } else if (option.wargear_card_id !== null) {
    const points = cardPoints(catalogue, option.wargear_card_id);
    if (isUnpriced(points)) {
      draft.unpriced.push({
        reason: points.reason,
        rows: [ref("unit_options", option.id), ...points.rows],
      });
    } else {
      const quantity = compulsoryMultiplier(entry, unit, taken);
      draft.lines.push({
        key: "card_grant",
        amount: points * quantity,
        quantity,
        rows: [
          ref("unit_options", option.id),
          ref("wargear_cards", option.wargear_card_id),
        ],
      });
    }
  }
  if (
    opensSection(option) &&
    !unit.items.some((item) => item.viaOptionId === option.id) &&
    sectionHasPricedItem(catalogue, option)
  ) {
    draft.pending.push(ref("unit_options", option.id));
  }
}

function priceCompulsoryOptions(
  catalogue: Catalogue,
  entry: Entry,
  unit: UnitTaken,
  draft: Draft,
): void {
  const compulsory = catalogue.unitOptions.filter(
    (option) => option.unit_id === entry.unit_id && !option.optional,
  );
  const takenById = new Map(
    unit.options.map((taken) => [taken.unitOptionId, taken]),
  );
  const groups = new Map<number, UnitOption[]>();

  for (const option of compulsory) {
    if (option.alternative > 0) {
      groups.set(option.alternative, [
        ...(groups.get(option.alternative) ?? []),
        option,
      ]);
      continue;
    }
    const taken = takenById.get(option.id) ?? { unitOptionId: option.id };
    applyCompulsoryOption(catalogue, entry, unit, option, taken, draft);
  }

  for (const members of groups.values()) {
    const chosen = members.filter((option) => takenById.has(option.id));
    for (const option of chosen) {
      const taken = takenById.get(option.id) ?? { unitOptionId: option.id };
      applyCompulsoryOption(catalogue, entry, unit, option, taken, draft);
    }
    if (chosen.length > 0) {
      continue;
    }
    const hasFreeMember = members.some((option) => {
      const row = priceRow(catalogue, entry.id, option.id);
      return !row || (row.points_percent === null && !row.points);
    });
    if (!hasFreeMember) {
      draft.pending.push(
        ...members.map((option) => ref("unit_options", option.id)),
      );
    }
  }
}

function priceUpgrade(
  catalogue: Catalogue,
  unit: UnitTaken,
  option: UnitOption,
  taken: OptionTaken,
  target: Entry,
  draft: Draft,
): void {
  const rows = [
    ref("unit_options", option.id),
    ref("army_list_entries", target.id),
  ];
  const basis = target.points_basis_id;
  if (
    target.points === null ||
    (basis !== BASIS.perEntry &&
      basis !== BASIS.perModel &&
      basis !== BASIS.perBase &&
      basis !== BASIS.perModelUpgrade)
  ) {
    draft.unpriced.push({ reason: "upgrade_target_unpriced", rows });
    return;
  }
  const quantity =
    basis === BASIS.perEntry ? 1 : modelsTaking(unit, option, taken);
  draft.lines.push({
    key: "upgrade",
    amount: target.points * quantity,
    quantity,
    rows,
  });
  const credit = substitutionCredit(catalogue, unit, target);
  if (isUnpriced(credit)) {
    draft.unpriced.push(credit);
  } else if (credit) {
    draft.lines.push(credit);
  }
}

function priceChosenOptions(
  catalogue: Catalogue,
  entry: Entry,
  unit: UnitTaken,
  draft: Draft,
): void {
  for (const taken of unit.options) {
    const option = catalogue.unitOptions.find(
      (candidate) =>
        candidate.id === taken.unitOptionId &&
        candidate.unit_id === entry.unit_id,
    );
    if (!option) {
      draft.unpriced.push({
        reason: "no_price_row",
        rows: [ref("unit_options", taken.unitOptionId)],
      });
      continue;
    }
    if (!option.optional) {
      continue;
    }
    const row = priceRow(catalogue, entry.id, option.id);
    if (row) {
      priceOptionRow(entry, unit, option, taken, row, draft);
      continue;
    }
    const target = upgradeTarget(catalogue, option.id);
    if (target) {
      priceUpgrade(catalogue, unit, option, taken, target, draft);
      continue;
    }
    if (grantsSomething(option) && !opensSection(option)) {
      draft.unpriced.push({
        reason: "no_price_row",
        rows: [ref("unit_options", option.id)],
      });
    }
  }
}

function priceItems(catalogue: Catalogue, unit: UnitTaken, draft: Draft) {
  for (const taken of unit.items) {
    const item = catalogue.items.find(
      (candidate) => candidate.id === taken.itemId,
    );
    if (!item || item.points === null) {
      draft.unpriced.push({
        reason: "no_price_row",
        rows: [ref("wargear_items", taken.itemId)],
      });
      continue;
    }
    draft.lines.push({
      key: "item",
      amount: item.points * taken.holders,
      quantity: taken.holders,
      rows: [ref("wargear_items", item.id)],
    });
  }
}

function priceDatafaxWeapons(
  catalogue: Catalogue,
  entry: Entry,
  unit: UnitTaken,
  draft: Draft,
): void {
  const datafax = unitOf(catalogue, entry)?.datafaxes ?? null;
  const rows = datafax
    ? catalogue.datafaxWeapons.filter((row) => row.datafax_id === datafax.id)
    : [];

  for (const pick of unit.datafaxWeapons) {
    const row = rows.find((candidate) => candidate.id === pick.rowId);
    if (!row) {
      draft.unpriced.push({
        reason: "no_price_row",
        rows: [ref("datafax_weapons", pick.rowId)],
      });
      continue;
    }
    const load = row.datafax_weapon_ammunition.find(
      (candidate) => candidate.id === pick.ammunitionId,
    );
    if (pick.ammunitionId !== undefined && !load) {
      draft.unpriced.push({
        reason: "no_price_row",
        rows: [ref("datafax_weapon_ammunition", pick.ammunitionId)],
      });
      continue;
    }
    const added =
      pick.fitted === "in_addition" && row.grant_mode === "add_or_replace"
        ? (row.add_points ?? 0)
        : 0;
    const quantity = pick.vehicles ?? vehicleCount(unit);
    draft.lines.push({
      key: "datafax_weapon",
      amount: ((load?.points ?? row.points ?? 0) + added) * quantity,
      quantity,
      rows: load
        ? [
            ref("datafax_weapons", row.id),
            ref("datafax_weapon_ammunition", load.id),
          ]
        : [ref("datafax_weapons", row.id)],
    });
  }

  if (entry.points_basis_id !== BASIS.seeDatafax) {
    return;
  }
  const picked = new Set(unit.datafaxWeapons.map((pick) => pick.rowId));
  const groups = new Map<number, typeof rows>();
  for (const row of rows) {
    if (!row.optional && row.alternative > 0) {
      groups.set(row.alternative, [
        ...(groups.get(row.alternative) ?? []),
        row,
      ]);
    }
  }
  for (const members of groups.values()) {
    const chosen = members.some((row) => picked.has(row.id));
    const hasFreeMember = members.some((row) => !row.points);
    if (!chosen && !hasFreeMember) {
      draft.pending.push(
        ...members.map((row) => ref("datafax_weapons", row.id)),
      );
    }
  }
}

function record(draft: Draft, results: (PriceLine | Unpriced)[]): void {
  for (const result of results) {
    if (isUnpriced(result)) {
      draft.unpriced.push(result);
    } else {
      draft.lines.push(result);
    }
  }
}

function wargearCardLine(
  catalogue: Catalogue,
  taken: WargearCardTaken,
): PriceLine | Unpriced {
  if (!catalogue.wargearCards.some((card) => card.id === taken.cardId)) {
    return {
      reason: "no_price_row",
      rows: [ref("wargear_cards", taken.cardId)],
    };
  }
  const points = cardPoints(catalogue, taken.cardId);
  if (isUnpriced(points)) {
    return points;
  }
  const holders = taken.holders ?? 1;
  return {
    key: "wargear_card",
    amount: points * holders,
    quantity: holders,
    rows: [
      ref("wargear_cards", taken.cardId),
      ref("unit_profiles", taken.profileId),
    ],
  };
}

function datafaxOf(catalogue: Catalogue, unit: UnitTaken) {
  const entry = catalogue.entries.find(
    (candidate) => candidate.id === unit.entryId,
  );
  return (entry && unitOf(catalogue, entry)?.datafaxes) ?? null;
}

function cardWeapons(
  catalogue: Catalogue,
  unit: UnitTaken,
  taken: VehicleCardTaken,
): { weapons: number; rows: RowRef[]; gaps: Unpriced[] } {
  const named = taken.rows ?? [];
  if (
    (taken.cardId !== VEHICLE_CARD.heavyFlamer &&
      taken.cardId !== VEHICLE_CARD.ammoFeed) ||
    named.length === 0
  ) {
    return { weapons: taken.count ?? 1, rows: [], gaps: [] };
  }
  const datafax = datafaxOf(catalogue, unit);
  const result = { weapons: 0, rows: [] as RowRef[], gaps: [] as Unpriced[] };
  for (const pick of named) {
    const row = catalogue.datafaxWeapons.find(
      (candidate) =>
        candidate.id === pick.rowId &&
        datafax !== null &&
        candidate.datafax_id === datafax.id,
    );
    if (!row) {
      result.gaps.push({
        reason: "no_price_row",
        rows: [ref("datafax_weapons", pick.rowId)],
      });
      continue;
    }
    result.rows.push(ref("datafax_weapons", row.id));
    if (row.linked_group === null) {
      result.weapons += pick.weapons ?? 1;
    } else if (taken.cardId === VEHICLE_CARD.ammoFeed) {
      result.weapons += 1;
    }
  }
  return result;
}

function vehicleCardLine(
  catalogue: Catalogue,
  unit: UnitTaken,
  taken: VehicleCardTaken,
): (PriceLine | Unpriced)[] {
  const card = catalogue.vehicleCards.find((row) => row.id === taken.cardId);
  const cardRef = ref("vehicle_cards", taken.cardId);
  if (!card) {
    return [{ reason: "no_price_row", rows: [cardRef] }];
  }
  const vehicles = taken.vehicles ?? 1;
  switch (card.points_basis_id) {
    case null: {
      const walker =
        card.id === VEHICLE_CARD.talons &&
        datafaxOf(catalogue, unit)?.motive_type_id === MOTIVE_TYPE_WALKERS;
      return [
        {
          key: "vehicle_card",
          amount: card.points * (walker ? 2 : 1) * vehicles,
          quantity: vehicles,
          rows: [cardRef],
        },
      ];
    }
    case BASIS.perWeaponUpgrade: {
      const { weapons, rows, gaps } = cardWeapons(catalogue, unit, taken);
      const quantity = weapons * vehicles;
      return [
        {
          key: "vehicle_card",
          amount: card.points * quantity,
          quantity,
          rows: [cardRef, ...rows],
        },
        ...gaps,
      ];
    }
    case BASIS.perLocation: {
      const quantity = (taken.count ?? 1) * vehicles;
      return [
        {
          key: "vehicle_card",
          amount: card.points * quantity,
          quantity,
          rows: [cardRef],
        },
      ];
    }
    case BASIS.perCentOfVehicle:
      return [];
    default:
      return [{ reason: "no_price_row", rows: [cardRef] }];
  }
}

function applyVehiclePercent(
  catalogue: Catalogue,
  unit: UnitTaken,
  draft: Draft,
): (PriceLine | Unpriced)[] {
  const base = sum(draft.lines.map((line) => line.amount));
  return (unit.vehicleCards ?? []).flatMap(
    (taken): (PriceLine | Unpriced)[] => {
      const card = catalogue.vehicleCards.find(
        (row) => row.id === taken.cardId,
      );
      if (!card || card.points_basis_id !== BASIS.perCentOfVehicle) {
        return [];
      }
      const cardRef = ref("vehicle_cards", card.id);
      if (vehicleCount(unit) > 1) {
        return [{ reason: "no_price_row", rows: [cardRef] }];
      }
      const rate = card.points / 100;
      return [
        {
          key: "vehicle_card_percent",
          amount: rate * base,
          quantity: rate,
          rows: [cardRef],
        },
      ];
    },
  );
}

export function priceUnitBase(
  catalogue: Catalogue,
  unit: UnitTaken,
): UnitPrice {
  const draft: Draft = { lines: [], unpriced: [], pending: [] };
  const entry = catalogue.entries.find(
    (candidate) => candidate.id === unit.entryId,
  );
  if (!entry) {
    draft.unpriced.push({
      reason: "no_price_row",
      rows: [ref("army_list_entries", unit.entryId)],
    });
    return finish(unit.key, draft);
  }
  priceEntry(catalogue, entry, unit, draft);
  priceProfileRows(catalogue, entry, unit, draft);
  priceCompulsoryOptions(catalogue, entry, unit, draft);
  priceChosenOptions(catalogue, entry, unit, draft);
  priceItems(catalogue, unit, draft);
  priceDatafaxWeapons(catalogue, entry, unit, draft);
  record(
    draft,
    (unit.wargearCards ?? []).map((taken) => wargearCardLine(catalogue, taken)),
  );
  record(
    draft,
    (unit.vehicleCards ?? []).flatMap((taken) =>
      vehicleCardLine(catalogue, unit, taken),
    ),
  );
  record(draft, applyVehiclePercent(catalogue, unit, draft));
  return finish(unit.key, draft);
}

const ENTRY_LINE_KEYS: ReadonlySet<PriceLine["key"]> = new Set([
  "entry",
  "models",
  "datafax",
  "grade",
]);

export function applyRideReplacement(
  catalogue: Catalogue,
  ride: UnitPrice,
  squad: UnitTaken,
): UnitPrice {
  const row = squad.options
    .map((taken) =>
      catalogue.unitOptions.find(
        (option) =>
          option.id === taken.unitOptionId && option.option_group === "support",
      ),
    )
    .map((option) => option && priceRow(catalogue, squad.entryId, option.id))
    .find((candidate) => candidate !== undefined);
  if (!row) {
    return ride;
  }
  const lines = ride.lines.map((line) =>
    ENTRY_LINE_KEYS.has(line.key)
      ? {
          key: "ride_replaced" as const,
          amount: 0,
          quantity: line.quantity,
          rows: [...line.rows, ref("army_list_entry_options", row.id)],
        }
      : line,
  );
  return { ...ride, lines, total: sum(lines.map((line) => line.amount)) };
}

function percentRows(catalogue: Catalogue, unit: UnitTaken): EntryOption[] {
  const entry = catalogue.entries.find(
    (candidate) => candidate.id === unit.entryId,
  );
  if (!entry) {
    return [];
  }
  const optionIds = new Set([
    ...unit.options.map((taken) => taken.unitOptionId),
    ...catalogue.unitOptions
      .filter(
        (option) =>
          option.unit_id === entry.unit_id &&
          !option.optional &&
          option.alternative === 0,
      )
      .map((option) => option.id),
  ]);
  return catalogue.entryOptions.filter(
    (row) =>
      row.army_list_entry_id === entry.id &&
      row.unit_option_id !== null &&
      optionIds.has(row.unit_option_id) &&
      row.points_percent !== null,
  );
}

export function applySurcharge(
  catalogue: Catalogue,
  unit: UnitTaken,
  price: UnitPrice,
  leaders: UnitPrice[],
): UnitPrice {
  const rows = percentRows(catalogue, unit);
  if (rows.length === 0) {
    return price;
  }
  const base = price.total + sum(leaders.map((leader) => leader.total));
  const rounded = SURCHARGE_ROUNDED_HALF_UP_LISTS.has(catalogue.list.id);
  const lines = [...price.lines];
  for (const row of rows) {
    const rate = (row.points_percent ?? 0) / 100;
    const raw = rate * base;
    lines.push({
      key: "surcharge",
      amount: rounded ? Math.round(raw) : raw,
      quantity: rate,
      rows: [ref("army_list_entry_options", row.id)],
    });
  }
  const unpriced = [
    ...price.unpriced,
    ...leaders
      .filter((leader) => !leader.complete)
      .map((leader): Unpriced => ({
        reason: "leader_unpriced",
        rows: leader.unpriced.flatMap((gap) => gap.rows),
      })),
  ];
  return {
    ...price,
    lines,
    total: sum(lines.map((line) => line.amount)),
    unpriced,
    complete: unpriced.length === 0,
  };
}

export function priceList(
  catalogues: ReadonlyMap<number, Catalogue>,
  units: UnitTaken[],
): ListPrice {
  const base = new Map(
    units.map((unit) => {
      const catalogue = catalogues.get(unit.listId);
      const price = catalogue
        ? priceUnitBase(catalogue, unit)
        : finish(unit.key, {
            lines: [],
            unpriced: [
              {
                reason: "no_price_row",
                rows: [ref("army_lists", unit.listId)],
              },
            ],
            pending: [],
          });
      return [unit.key, price] as const;
    }),
  );

  const ridden = new Map(
    units.map((unit) => {
      const price = base.get(unit.key)!;
      const squad = units.find((candidate) => candidate.key === unit.rideFor);
      const catalogue = squad && catalogues.get(squad.listId);
      return [
        unit.key,
        squad && catalogue
          ? applyRideReplacement(catalogue, price, squad)
          : price,
      ] as const;
    }),
  );

  const priced = units.map((unit) => {
    const price = ridden.get(unit.key)!;
    const catalogue = catalogues.get(unit.listId);
    if (!catalogue) {
      return price;
    }
    const leaders = units
      .filter(
        (candidate) =>
          candidate.attachedTo?.unitKey === unit.key &&
          candidate.attachedTo.mode === "leads",
      )
      .map((leader) => ridden.get(leader.key)!);
    return applySurcharge(catalogue, unit, price, leaders);
  });

  return {
    units: priced,
    total: sum(priced.map((price) => price.total)),
    complete: priced.every((price) => price.complete),
  };
}

export function smallestSelection(
  catalogue: Catalogue,
  entryId: number,
): UnitTaken[] {
  const entry = catalogue.entries.find((candidate) => candidate.id === entryId);
  if (!entry || entry.points_basis_id === BASIS.perModelUpgrade) {
    return [];
  }
  const profiles = unitOf(catalogue, entry)?.unit_profiles ?? [];
  const bare = (key: string, models: Record<number, number>): UnitTaken => ({
    key,
    listId: catalogue.list.id,
    entryId,
    models,
    vehicles: entry.points_basis_id === BASIS.seeDatafax ? 1 : undefined,
    options: [],
    items: [],
    datafaxWeapons: [],
  });
  const atMinimum = (chosen: typeof profiles) =>
    Object.fromEntries(
      chosen.map((profile) => [profile.id, profile.models_min ?? 0]),
    );

  if (entry.points_basis_id === null) {
    const escorts = profiles.filter((profile) => profile.alternative < 0);
    return profiles
      .filter((profile) => profile.alternative >= 0)
      .map((grade) => ({
        ...bare(`entry-${entryId}-grade-${grade.id}`, {
          ...atMinimum(escorts),
          [grade.id]: Math.max(grade.models_min ?? 1, 1),
        }),
        grade: grade.id,
      }));
  }

  const counted =
    entry.points_basis_id === BASIS.perModel ||
    entry.points_basis_id === BASIS.perBase
      ? profiles.filter((profile) => profile.alternative >= 0)
      : profiles;
  return [bare(`entry-${entryId}`, atMinimum(counted))];
}
