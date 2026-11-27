import type { Catalogue } from "@/lib/catalogue";
import { type RowRef, type UnitTaken, upgradeTarget } from "@/lib/pricing";

type Requirement = Catalogue["requirements"][number];

export type RequirementBreach = {
  kind:
    | "attachment_missing"
    | "attachment_not_allowed"
    | "leads_twice"
    | "subordinate_without_leader"
    | "attachment_over_count"
    | "bodyguard_short"
    | "required_unit_missing"
    | "commander_missing"
    | "commander_not_allowed";
  listId: number;
  rows: RowRef[];
  unitKeys: string[];
  allowed?: number;
  taken?: number;
};

export type RequirementContext = {
  hostListId: number;
  variantId?: number | null;
  commanderUnitKey?: string | null;
  includeWhiteDwarf?: boolean;
};

type Attachment = {
  unit: UnitTaken;
  target: UnitTaken;
  mode: NonNullable<UnitTaken["attachedTo"]>["mode"];
  rows: Requirement[];
};

type Leader = { unitKey: string; count: number; rows: Requirement[] };

const KIND_ORDER: RequirementBreach["kind"][] = [
  "attachment_missing",
  "attachment_not_allowed",
  "leads_twice",
  "subordinate_without_leader",
  "attachment_over_count",
  "bodyguard_short",
  "required_unit_missing",
  "commander_missing",
  "commander_not_allowed",
];

const CHARACTER_TYPE = 1;

const SPACE_MARINES_FACTION = 2;

const refs = (rows: Requirement[]): RowRef[] =>
  [...new Set(rows.map((row) => row.id))]
    .sort((a, b) => a - b)
    .map((id) => ({ table: "army_list_requirements", id }));

const distinct = (values: string[]) => [...new Set(values)];

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const byVariant = (
  row: Requirement,
  host: boolean,
  variantId: number | null | undefined,
) =>
  row.variant_id === null ||
  (host
    ? (variantId === row.variant_id) === row.under_variant
    : !row.under_variant);

const attachmentRows = (
  catalogue: Catalogue,
  entryId: number,
  listId: number,
  context: RequirementContext,
) =>
  catalogue.requirements.filter(
    (row) =>
      row.kind === "attachment" &&
      row.entry_id === entryId &&
      byVariant(row, listId === context.hostListId, context.variantId),
  );

// XL-13
const applyingRows = (
  catalogue: Catalogue,
  unit: UnitTaken,
  context: RequirementContext,
) =>
  attachmentRows(catalogue, unit.entryId, unit.listId, context).filter(
    (row) =>
      row.subject_profile_id === null || row.subject_profile_id === unit.grade,
  );

const inSet = (catalogue: Catalogue, setId: number | null, entryId: number) =>
  setId !== null &&
  catalogue.allowanceSetEntries.some(
    (member) =>
      member.set_id === setId && member.army_list_entry_id === entryId,
  );

const reaches = (catalogue: Catalogue, row: Requirement, entryId: number) =>
  row.target_entry_id === entryId ||
  inSet(catalogue, row.target_set_id, entryId);

// BF-41
const upgradeLeaders = (
  catalogue: Catalogue,
  unit: UnitTaken,
  context: RequirementContext,
): Leader[] => {
  const entry = catalogue.entries.find((row) => row.id === unit.entryId);
  return unit.options.flatMap((option) => {
    const unitOption = catalogue.unitOptions.find(
      (row) => row.id === option.unitOptionId,
    );
    const leader = upgradeTarget(catalogue, option.unitOptionId);
    if (!entry || !leader || unitOption?.unit_id !== entry.unit_id) {
      return [];
    }
    const rows = attachmentRows(
      catalogue,
      leader.id,
      unit.listId,
      context,
    ).filter(
      (row) =>
        row.mode === "leads" &&
        row.subject_profile_id === null &&
        reaches(catalogue, row, unit.entryId),
    );
    return rows.length > 0
      ? [{ unitKey: unit.key, count: option.models ?? 1, rows }]
      : [];
  });
};

const byEntry = (attachments: Attachment[]) => {
  const groups = new Map<number, Attachment[]>();
  for (const attachment of attachments) {
    const entryId = attachment.unit.entryId;
    groups.set(entryId, [...(groups.get(entryId) ?? []), attachment]);
  }
  return [...groups];
};

const checkTarget = (
  catalogue: Catalogue,
  target: UnitTaken,
  attached: Attachment[],
  context: RequirementContext,
): RequirementBreach[] => {
  const breaches: RequirementBreach[] = [];
  const listId = target.listId;
  const withMode = (mode: Attachment["mode"]) =>
    attached.filter((attachment) => attachment.mode === mode);

  // BF-32
  const leaders: Leader[] = [
    ...withMode("leads").map((attachment) => ({
      unitKey: attachment.unit.key,
      count: 1,
      rows: attachment.rows,
    })),
    ...upgradeLeaders(catalogue, target, context),
  ];
  const led = sum(leaders.map((leader) => leader.count));
  if (led > 1) {
    breaches.push({
      kind: "leads_twice",
      listId,
      rows: refs(leaders.flatMap((leader) => leader.rows)),
      unitKeys: distinct([
        target.key,
        ...leaders.map((leader) => leader.unitKey),
      ]),
      allowed: 1,
      taken: led,
    });
  }

  // LB-68
  for (const attachment of withMode("must")) {
    const leads = applyingRows(catalogue, attachment.unit, context).filter(
      (row) => row.mode === "leads" && reaches(catalogue, row, target.entryId),
    );
    if (leads.length > 0 && led === 0) {
      breaches.push({
        kind: "subordinate_without_leader",
        listId,
        rows: refs([...attachment.rows, ...leads]),
        unitKeys: [attachment.unit.key, target.key],
      });
    }
  }

  // LB-69
  for (const [entryId, group] of byEntry(withMode("must"))) {
    const rows = attachmentRows(catalogue, entryId, listId, context).filter(
      (row) =>
        row.mode === "must" &&
        row.count !== null &&
        reaches(catalogue, row, target.entryId),
    );
    const allowed = Math.min(...rows.map((row) => Number(row.count)));
    if (rows.length > 0 && group.length > allowed) {
      breaches.push({
        kind: "attachment_over_count",
        listId,
        rows: refs(rows),
        unitKeys: [target.key, ...group.map((item) => item.unit.key)],
        allowed,
        taken: group.length,
      });
    }
  }

  // A25
  for (const [entryId, group] of byEntry(withMode("may"))) {
    const rows = attachmentRows(catalogue, entryId, listId, context).filter(
      (row) =>
        row.mode === "may" &&
        row.count !== null &&
        reaches(catalogue, row, target.entryId),
    );
    const allowed = Math.max(...rows.map((row) => Number(row.count)));
    if (rows.length > 0 && group.length < allowed) {
      breaches.push({
        kind: "bodyguard_short",
        listId,
        rows: refs(rows),
        unitKeys: [target.key, ...group.map((item) => item.unit.key)],
        allowed,
        taken: group.length,
      });
    }
  }

  return breaches;
};

const subjectUnits = (
  catalogue: Catalogue,
  row: Requirement,
  units: UnitTaken[],
) =>
  units.filter(
    (unit) =>
      unit.entryId === row.entry_id ||
      inSet(catalogue, row.set_id, unit.entryId) ||
      unit.options.some((option) => option.unitOptionId === row.unit_option_id),
  );

// A6
const carriesSquad = (
  catalogue: Catalogue,
  unit: UnitTaken,
  byKey: ReadonlyMap<string, UnitTaken>,
) => {
  const squad =
    unit.transportFor === undefined ? undefined : byKey.get(unit.transportFor);
  return (
    squad !== undefined &&
    catalogue.requirements.some(
      (row) =>
        row.kind === "transport" &&
        row.mode === "squads" &&
        row.entry_id === unit.entryId &&
        row.target_entry_id === squad.entryId,
    )
  );
};

// LB-66, LB-71
const checkRequiredUnits = (
  catalogue: Catalogue,
  units: UnitTaken[],
  byKey: ReadonlyMap<string, UnitTaken>,
  context: RequirementContext,
): RequirementBreach[] => {
  const hostUnits = units.filter((unit) => unit.listId === context.hostListId);
  return catalogue.requirements
    .filter(
      (row) =>
        row.kind === "requires_unit" && byVariant(row, true, context.variantId),
    )
    .sort((a, b) => a.id - b.id)
    .flatMap((row): RequirementBreach[] => {
      const subjects = subjectUnits(catalogue, row, hostUnits).filter(
        (unit) =>
          row.mode !== "unless_transporting" ||
          !carriesSquad(catalogue, unit, byKey),
      );
      const present = hostUnits.some((unit) =>
        reaches(catalogue, row, unit.entryId),
      );
      return subjects.length > 0 && !present
        ? [
            {
              kind: "required_unit_missing",
              listId: context.hostListId,
              rows: refs([row]),
              unitKeys: subjects.map((unit) => unit.key),
            },
          ]
        : [];
    });
};

const upgradeEntryIds = (catalogue: Catalogue, unit: UnitTaken) =>
  unit.options.flatMap((option) => {
    const entry = upgradeTarget(catalogue, option.unitOptionId);
    return entry ? [entry.id] : [];
  });

const isCharacter = (
  catalogues: ReadonlyMap<number, Catalogue>,
  unit: UnitTaken,
) => {
  const catalogue = catalogues.get(unit.listId);
  return (
    catalogue !== undefined &&
    [unit.entryId, ...upgradeEntryIds(catalogue, unit)].some((entryId) => {
      const entry = catalogue.entries.find((row) => row.id === entryId);
      return catalogue.units.some(
        (row) =>
          row.id === entry?.unit_id && row.unit_type_id === CHARACTER_TYPE,
      );
    })
  );
};

const checkCommander = (
  catalogues: ReadonlyMap<number, Catalogue>,
  units: UnitTaken[],
  context: RequirementContext,
): RequirementBreach[] => {
  const host = catalogues.get(context.hostListId);
  if (!host) {
    return [];
  }
  const hostUnits = units.filter((unit) => unit.listId === context.hostListId);
  const held = host.requirements
    .filter(
      (row) =>
        row.kind === "commander" && byVariant(row, true, context.variantId),
    )
    .map((row) => ({
      row,
      rank: Number(row.count),
      holders: hostUnits.filter(
        (unit) =>
          unit.entryId === row.entry_id ||
          (row.entry_id !== null &&
            upgradeEntryIds(host, unit).includes(row.entry_id)),
      ),
    }))
    .filter((item) => item.holders.length > 0);

  const opening: typeof held = [];
  const nominees: UnitTaken[] = [];
  if (held.length === 0) {
    // LB-73
    nominees.push(...units.filter((unit) => isCharacter(catalogues, unit)));
  } else {
    // LB-19
    const ranks = [...new Set(held.map((item) => item.rank))].sort(
      (a, b) => b - a,
    );
    for (const rank of ranks) {
      const atRank = held.filter((item) => item.rank === rank);
      const must = atRank.filter((item) => item.row.mode === "must");
      const added = must.length > 0 ? must : atRank;
      opening.push(...added);
      nominees.push(...added.flatMap((item) => item.holders));
      if (must.length > 0) {
        break;
      }
    }
  }

  // LB-76
  const faction = host.list.factions;
  if (
    context.includeWhiteDwarf &&
    (host.list.faction_id === SPACE_MARINES_FACTION ||
      faction?.parent_faction_id === SPACE_MARINES_FACTION)
  ) {
    nominees.push(...hostUnits.filter((unit) => isCharacter(catalogues, unit)));
  }

  // BF-57
  if (nominees.length === 0) {
    return [];
  }
  const unitKeys = distinct(
    units.filter((unit) => nominees.includes(unit)).map((unit) => unit.key),
  );
  const nominated = units.find((unit) => unit.key === context.commanderUnitKey);
  const breach = {
    listId: context.hostListId,
    rows: refs(opening.map((item) => item.row)),
  };
  if (!nominated) {
    return [{ kind: "commander_missing", ...breach, unitKeys }];
  }
  return nominees.includes(nominated)
    ? []
    : [
        {
          kind: "commander_not_allowed",
          ...breach,
          unitKeys: distinct([nominated.key, ...unitKeys]),
        },
      ];
};

const compareBreaches = (a: RequirementBreach, b: RequirementBreach) =>
  a.listId - b.listId ||
  KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
  (a.unitKeys[0] < b.unitKeys[0]
    ? -1
    : a.unitKeys[0] > b.unitKeys[0]
      ? 1
      : 0) ||
  (a.rows[0]?.id ?? 0) - (b.rows[0]?.id ?? 0);

export function checkRequirements(
  catalogues: ReadonlyMap<number, Catalogue>,
  units: UnitTaken[],
  context: RequirementContext,
): RequirementBreach[] {
  const byKey = new Map(units.map((unit) => [unit.key, unit]));
  const breaches: RequirementBreach[] = [];
  const attachments: Attachment[] = [];

  // LB-66, LB-67
  for (const unit of units) {
    const catalogue = catalogues.get(unit.listId);
    if (!catalogue) {
      continue;
    }
    const rows = applyingRows(catalogue, unit, context);
    const target = unit.attachedTo && byKey.get(unit.attachedTo.unitKey);
    if (!unit.attachedTo || !target) {
      const required = rows.filter(
        (row) => row.mode === "must" || row.mode === "leads",
      );
      if (required.length > 0) {
        breaches.push({
          kind: "attachment_missing",
          listId: unit.listId,
          rows: refs(required),
          unitKeys: [unit.key],
        });
      }
      continue;
    }
    const mode = unit.attachedTo.mode;
    const matched =
      target.listId === unit.listId
        ? rows.filter(
            (row) =>
              row.mode === mode && reaches(catalogue, row, target.entryId),
          )
        : [];
    if (matched.length === 0) {
      breaches.push({
        kind: "attachment_not_allowed",
        listId: unit.listId,
        rows: refs(rows),
        unitKeys: [unit.key, target.key],
      });
      continue;
    }
    attachments.push({ unit, target, mode, rows: matched });
  }

  for (const target of units) {
    const catalogue = catalogues.get(target.listId);
    if (!catalogue) {
      continue;
    }
    breaches.push(
      ...checkTarget(
        catalogue,
        target,
        attachments.filter((attachment) => attachment.target === target),
        context,
      ),
    );
  }

  const host = catalogues.get(context.hostListId);
  if (host) {
    breaches.push(...checkRequiredUnits(host, units, byKey, context));
  }
  breaches.push(...checkCommander(catalogues, units, context));

  return breaches.sort(compareBreaches);
}
