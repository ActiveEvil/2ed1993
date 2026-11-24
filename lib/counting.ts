import type { Catalogue } from "@/lib/catalogue";
import { type RowRef, type UnitTaken, upgradeTarget } from "@/lib/pricing";

type Rule = Catalogue["allowanceRules"][number];

export type AllowanceBreach = {
  kind:
    | "entry_max"
    | "entry_min"
    | "rule_max"
    | "rule_min"
    | "army_max"
    | "army_min"
    | "stand_in";
  listId: number;
  governs: RowRef;
  rows: RowRef[];
  allowed: number;
  taken: number;
  unitKeys: string[];
};

export type CountingContext = {
  hostListId: number;
  variantId?: number | null;
};

type Act = { unitKey: string; entryId: number };

type Limit = { kind: AllowanceBreach["kind"]; allowed: number; rows: RowRef[] };

type Seating = { seated: Act[]; beyond: Act[]; weight: Map<number, number> };

const TABLE = {
  entry: "army_list_entries",
  set: "army_list_allowance_sets",
  band: "unit_categories",
  rule: "army_list_allowance_rules",
} as const;

const KIND_ORDER: AllowanceBreach["kind"][] = [
  "entry_max",
  "entry_min",
  "rule_max",
  "rule_min",
  "army_max",
  "army_min",
  "stand_in",
];

const ref = (table: string, id: number): RowRef => ({ table, id });

const refKey = (row: RowRef) => `${row.table}:${row.id}`;

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const distinctRefs = (rows: RowRef[]) => [
  ...new Map(rows.map((row) => [refKey(row), row])).values(),
];

function governedBy(rule: Rule): RowRef | null {
  if (rule.army_list_entry_id !== null) {
    return ref(TABLE.entry, rule.army_list_entry_id);
  }
  if (rule.set_id !== null) {
    return ref(TABLE.set, rule.set_id);
  }
  if (rule.unit_category_id !== null) {
    return ref(TABLE.band, rule.unit_category_id);
  }
  return null;
}

function actsOf(catalogue: Catalogue, units: UnitTaken[]): Act[] {
  return units.flatMap((unit) => {
    const entry = catalogue.entries.find((row) => row.id === unit.entryId);
    const upgrades = unit.options.flatMap((taken) => {
      const option = catalogue.unitOptions.find(
        (row) =>
          row.id === taken.unitOptionId && row.unit_id === entry?.unit_id,
      );
      const target = option ? upgradeTarget(catalogue, option.id) : null;
      return target
        ? Array.from({ length: taken.models ?? 1 }, () => ({
            unitKey: unit.key,
            entryId: target.id,
          }))
        : [];
    });
    return [{ unitKey: unit.key, entryId: unit.entryId }, ...upgrades];
  });
}

function variantBand(
  catalogue: Catalogue,
  variantId: number | null | undefined,
): number | null {
  const row = catalogue.requirements.find(
    (candidate) =>
      candidate.id === variantId && candidate.kind === "army_variant",
  );
  return row?.unit_category_id ?? null;
}

function countList(
  catalogue: Catalogue,
  units: UnitTaken[],
  host: boolean,
  band: number | null,
): AllowanceBreach[] {
  const listId = catalogue.list.id;
  const acts = actsOf(catalogue, units);
  const rules = [...catalogue.allowanceRules].sort((a, b) => a.id - b.id);

  const weights = (row: RowRef): Map<number, number> => {
    if (row.table === TABLE.entry) {
      return new Map([[row.id, 1]]);
    }
    if (row.table === TABLE.set) {
      return new Map(
        catalogue.allowanceSetEntries
          .filter((member) => member.set_id === row.id)
          .map((member) => [member.army_list_entry_id, member.count_as]),
      );
    }
    return new Map(
      catalogue.entries
        .filter((entry) => entry.unit_category_id === row.id)
        .map((entry) => [entry.id, 1]),
    );
  };

  const tally = (from: Act[], row: RowRef) => {
    const weight = weights(row);
    return sum(from.map((act) => weight.get(act.entryId) ?? 0));
  };

  const keysOf = (row: RowRef) => {
    const weight = weights(row);
    return [
      ...new Set(
        acts.filter((act) => weight.has(act.entryId)).map((act) => act.unitKey),
      ),
    ];
  };

  const countedBy = (rule: Rule): RowRef | null => {
    if (rule.per_entry_id !== null) {
      return ref(TABLE.entry, rule.per_entry_id);
    }
    if (rule.per_set_id !== null) {
      return ref(TABLE.set, rule.per_set_id);
    }
    if (rule.per_category_id !== null) {
      return ref(TABLE.band, rule.per_category_id);
    }
    if (rule.per_rule_id !== null) {
      const other = rules.find(
        (candidate) => candidate.id === rule.per_rule_id,
      );
      return other ? governedBy(other) : null;
    }
    return null;
  };

  const ruleMaximum = (rule: Rule, n: number): number | null => {
    if (rule.count === null) {
      return null;
    }
    const allowed = Math.max(
      rule.count * Math.floor(n / rule.per_count) - rule.deduction,
      0,
    );
    return rule.at_least_one && n >= 1 ? Math.max(allowed, 1) : allowed;
  };

  const countFor = (rule: Rule, from: Act[], seen: number[] = []): number => {
    const counted = countedBy(rule);
    const n = counted ? tally(from, counted) : 0;
    const other = rules.find((candidate) => candidate.id === rule.per_rule_id);
    if (!other) {
      return n;
    }
    if (seen.includes(other.id)) {
      return 0;
    }
    const cap = ruleMaximum(other, countFor(other, acts, [...seen, rule.id]));
    return cap === null ? n : Math.min(n, cap);
  };

  const shared = (onThing: Rule[]): Map<number, Act[]> => {
    const rate = (rule: Rule) => (rule.count ?? 0) / rule.per_count;
    const ranked = [...onThing].sort(
      (a, b) => rate(b) - rate(a) || a.id - b.id,
    );
    const assigned = new Map(ranked.map((rule) => [rule.id, [] as Act[]]));
    for (const act of acts) {
      const rule = ranked.find((candidate) => {
        const counted = countedBy(candidate);
        return counted !== null && weights(counted).has(act.entryId);
      });
      if (rule) {
        assigned.get(rule.id)!.push(act);
      }
    }
    return assigned;
  };

  const rulesOn = (row: RowRef) =>
    rules.filter((rule) => {
      const governed = governedBy(rule);
      return governed !== null && refKey(governed) === refKey(row);
    });

  const perRulesOn = (row: RowRef) =>
    rulesOn(row).filter((rule) => countedBy(rule) !== null);

  const seating = (other: Rule): Seating => {
    const row = governedBy(other);
    const weight = row ? weights(row) : new Map<number, number>();
    const cap = ruleMaximum(other, countFor(other, acts));
    const seated: Act[] = [];
    const beyond: Act[] = [];
    let filled = 0;
    for (const act of acts.filter((item) => weight.has(item.entryId))) {
      const counts = weight.get(act.entryId)!;
      if (cap === null || filled + counts <= cap) {
        seated.push(act);
        filled += counts;
      } else {
        beyond.push(act);
      }
    }
    return { seated, beyond, weight };
  };

  const against = (row: RowRef): Map<Act, number> => {
    const weight = weights(row);
    const others = rulesOn(row).flatMap((rule) => {
      const other = rules.find(
        (candidate) => candidate.id === rule.per_rule_id,
      );
      return other ? [seating(other)] : [];
    });
    const own = rulesOn(row)
      .filter((rule) =>
        rules.some((candidate) => candidate.per_rule_id === rule.id),
      )
      .map(seating);
    const out = new Set([
      ...others.flatMap((seats) => seats.seated),
      ...own.flatMap((seats) => seats.beyond),
    ]);
    const counted = new Map<Act, number>();
    for (const act of acts) {
      if (weight.has(act.entryId) && !out.has(act)) {
        counted.set(act, weight.get(act.entryId)!);
      }
    }
    for (const seats of others) {
      for (const act of seats.beyond) {
        if (!counted.has(act) && !out.has(act)) {
          counted.set(act, seats.weight.get(act.entryId)!);
        }
      }
    }
    return counted;
  };

  const maximum = (row: RowRef): Limit | null => {
    const entry =
      row.table === TABLE.entry
        ? catalogue.entries.find((candidate) => candidate.id === row.id)
        : undefined;
    const fixed = entry?.allowance_max ?? null;
    const limiting = perRulesOn(row).filter((rule) => rule.count !== null);
    if (limiting.length === 0) {
      return fixed === null
        ? null
        : { kind: "entry_max", allowed: fixed, rows: [row] };
    }
    const assigned = shared(limiting);
    const allowed = sum(
      limiting.map(
        (rule) =>
          ruleMaximum(rule, countFor(rule, assigned.get(rule.id) ?? [])) ?? 0,
      ),
    );
    return {
      kind: "rule_max",
      allowed: (fixed ?? 0) + allowed,
      rows: [
        ...(fixed === null ? [] : [row]),
        ...limiting.map((rule) => ref(TABLE.rule, rule.id)),
      ],
    };
  };

  const minimum = (row: RowRef): Limit | null => {
    const requiring = perRulesOn(row).filter((rule) => rule.min_count !== null);
    if (requiring.length === 0) {
      return null;
    }
    const assigned = shared(requiring);
    return {
      kind: "rule_min",
      allowed: sum(
        requiring.map(
          (rule) =>
            (rule.min_count ?? 0) *
            Math.floor(
              countFor(rule, assigned.get(rule.id) ?? []) / rule.per_count,
            ),
        ),
      ),
      rows: requiring.map((rule) => ref(TABLE.rule, rule.id)),
    };
  };

  const lapsed = (row: RowRef) =>
    band !== null &&
    ![...weights(row).keys()].some(
      (entryId) =>
        catalogue.entries.find((entry) => entry.id === entryId)
          ?.unit_category_id === band,
    );

  const breach = (
    row: RowRef,
    limit: Limit,
    taken: number,
    unitKeys: string[] = keysOf(row),
  ): AllowanceBreach => ({
    kind: limit.kind,
    listId,
    governs: row,
    rows: limit.rows,
    allowed: limit.allowed,
    taken,
    unitKeys,
  });

  const governed = distinctRefs([
    ...catalogue.entries
      .filter(
        (entry) => entry.allowance_max !== null || entry.allowance_min > 0,
      )
      .map((entry) => ref(TABLE.entry, entry.id)),
    ...rules.flatMap((rule) => governedBy(rule) ?? []),
  ]);

  const breaches: AllowanceBreach[] = [];
  for (const row of governed) {
    const taken = tally(acts, row);
    const minimumHolds = host && !lapsed(row);
    const counted = against(row);
    const held = sum([...counted.values()]);
    const heldKeys = [
      ...new Set([...counted.keys()].map((act) => act.unitKey)),
    ];
    const most = maximum(row);
    if (most && held > most.allowed) {
      breaches.push(breach(row, most, held, heldKeys));
    }
    const entry =
      row.table === TABLE.entry
        ? catalogue.entries.find((candidate) => candidate.id === row.id)
        : undefined;
    if (minimumHolds && entry && taken < entry.allowance_min) {
      breaches.push(
        breach(
          row,
          { kind: "entry_min", allowed: entry.allowance_min, rows: [row] },
          taken,
        ),
      );
    }
    const least = minimum(row);
    if (minimumHolds && least && held < least.allowed) {
      breaches.push(breach(row, least, held, heldKeys));
    }
    for (const rule of rulesOn(row).filter((r) => countedBy(r) === null)) {
      const rows = [ref(TABLE.rule, rule.id)];
      if (rule.count !== null && taken > rule.count) {
        breaches.push(
          breach(row, { kind: "army_max", allowed: rule.count, rows }, taken),
        );
      }
      if (minimumHolds && rule.min_count !== null && taken < rule.min_count) {
        breaches.push(
          breach(
            row,
            { kind: "army_min", allowed: rule.min_count, rows },
            taken,
          ),
        );
      }
    }
  }

  for (const set of catalogue.allowanceSets.filter(
    (candidate) => candidate.shares_allowance,
  )) {
    const row = ref(TABLE.set, set.id);
    const limits = [...weights(row).keys()].map((entryId) =>
      maximum(ref(TABLE.entry, entryId)),
    );
    if (limits.length === 0 || limits.some((limit) => limit === null)) {
      continue;
    }
    const largest = Math.max(...limits.map((limit) => limit!.allowed));
    const taken = tally(acts, row);
    if (taken > largest) {
      breaches.push(
        breach(
          row,
          {
            kind: "stand_in",
            allowed: largest,
            rows: distinctRefs(
              limits
                .filter((limit) => limit!.allowed === largest)
                .flatMap((limit) => limit!.rows),
            ),
          },
          taken,
        ),
      );
    }
  }

  return breaches;
}

const compareBreaches = (a: AllowanceBreach, b: AllowanceBreach) =>
  a.listId - b.listId ||
  (a.governs.table < b.governs.table
    ? -1
    : a.governs.table > b.governs.table
      ? 1
      : 0) ||
  a.governs.id - b.governs.id ||
  KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);

export function countAllowances(
  catalogues: ReadonlyMap<number, Catalogue>,
  units: UnitTaken[],
  context: CountingContext,
): AllowanceBreach[] {
  const listIds = [
    ...new Set([context.hostListId, ...units.map((unit) => unit.listId)]),
  ];
  return listIds
    .flatMap((listId) => {
      const catalogue = catalogues.get(listId);
      if (!catalogue) {
        return [];
      }
      const host = listId === context.hostListId;
      return countList(
        catalogue,
        units.filter((unit) => unit.listId === listId),
        host,
        host ? variantBand(catalogue, context.variantId) : null,
      );
    })
    .sort(compareBreaches);
}
