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
    | "bodyguard_short";
  listId: number;
  rows: RowRef[];
  unitKeys: string[];
  allowed?: number;
  taken?: number;
};

export type RequirementContext = {
  hostListId: number;
  variantId?: number | null;
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
];

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

const reaches = (catalogue: Catalogue, row: Requirement, entryId: number) =>
  row.target_entry_id === entryId ||
  (row.target_set_id !== null &&
    catalogue.allowanceSetEntries.some(
      (member) =>
        member.set_id === row.target_set_id &&
        member.army_list_entry_id === entryId,
    ));

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

const compareBreaches = (a: RequirementBreach, b: RequirementBreach) =>
  a.listId - b.listId ||
  KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
  (a.unitKeys[0] < b.unitKeys[0] ? -1 : a.unitKeys[0] > b.unitKeys[0] ? 1 : 0);

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

  return breaches.sort(compareBreaches);
}
