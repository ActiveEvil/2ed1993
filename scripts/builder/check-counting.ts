import { type Catalogue, loadCatalogue } from "@/lib/catalogue";
import { type AllowanceBreach, countAllowances } from "@/lib/counting";
import { priceList, type RowRef } from "@/lib/pricing";
import { checkRequirements, type RequirementBreach } from "@/lib/requirements";
import {
  checkTotals,
  type TotalsBreach,
  type TotalsResult,
} from "@/lib/totals";
import { countingCases } from "@/scripts/builder/counting-cases";
import { requirementCases } from "@/scripts/builder/requirement-cases";
import { totalsCases } from "@/scripts/builder/totals-cases";

const formatRow = (row: RowRef) => `${row.table} ${row.id}`;

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

const formatBreach = (breach: AllowanceBreach) =>
  `${breach.kind} list ${breach.listId} ${formatRow(breach.governs)}: allowed ${breach.allowed}, taken ${breach.taken} [${breach.rows.map(formatRow).join(", ")}] (${breach.unitKeys.join(", ")})`;

const matches = (got: AllowanceBreach, wanted: AllowanceBreach) =>
  got.kind === wanted.kind &&
  got.listId === wanted.listId &&
  formatRow(got.governs) === formatRow(wanted.governs) &&
  got.allowed === wanted.allowed &&
  got.taken === wanted.taken &&
  sameSet(got.rows.map(formatRow), wanted.rows.map(formatRow)) &&
  sameSet(got.unitKeys, wanted.unitKeys);

function runCases(catalogues: Map<number, Catalogue>): number {
  let failures = 0;
  for (const countingCase of countingCases) {
    const missing = countingCase.listIds.filter((id) => !catalogues.has(id));
    const result = countAllowances(
      catalogues,
      countingCase.units,
      countingCase.context,
    );
    const passed =
      missing.length === 0 &&
      result.length === countingCase.expected.length &&
      result.every((breach, index) =>
        matches(breach, countingCase.expected[index]),
      );
    console.log(
      `${passed ? "ok  " : "FAIL"} ${countingCase.id} ${countingCase.label}: ${result.length} breaches (${countingCase.source})`,
    );
    if (missing.length > 0) {
      console.log(`    lists not loaded: ${missing.join(", ")}`);
    }
    for (const breach of result) {
      console.log(`    got ${formatBreach(breach)}`);
    }
    if (!passed) {
      for (const breach of countingCase.expected) {
        console.log(`    expected ${formatBreach(breach)}`);
      }
      failures += 1;
    }
  }
  return failures;
}

type Unchecked = TotalsResult["unchecked"][number];

const formatGoverns = (row: RowRef | null) => (row ? formatRow(row) : "limit");

const formatUnchecked = (item: Unchecked) =>
  `${item.kind} ${formatGoverns(item.governs)} (${item.unitKeys.join(", ")})`;

const formatTotalsBreach = (breach: TotalsBreach) =>
  `${breach.kind} list ${breach.listId} ${formatGoverns(breach.governs)}: allowed ${breach.allowed}, taken ${breach.taken} (${breach.unitKeys.join(", ")})`;

const matchesUnchecked = (got: Unchecked, wanted: Unchecked) =>
  got.kind === wanted.kind &&
  formatGoverns(got.governs) === formatGoverns(wanted.governs) &&
  sameSet(got.unitKeys, wanted.unitKeys);

const matchesTotals = (got: TotalsBreach, wanted: TotalsBreach) =>
  got.kind === wanted.kind &&
  got.listId === wanted.listId &&
  formatGoverns(got.governs) === formatGoverns(wanted.governs) &&
  got.allowed === wanted.allowed &&
  got.taken === wanted.taken &&
  sameSet(got.unitKeys, wanted.unitKeys);

function runTotalsCases(catalogues: Map<number, Catalogue>): number {
  let failures = 0;
  for (const totalsCase of totalsCases) {
    const missing = totalsCase.listIds.filter((id) => !catalogues.has(id));
    const price = priceList(catalogues, totalsCase.units);
    const result = checkTotals(
      catalogues,
      totalsCase.units,
      price,
      totalsCase.context,
    );
    const passed =
      missing.length === 0 &&
      result.breaches.length === totalsCase.expected.length &&
      result.breaches.every((breach, index) =>
        matchesTotals(breach, totalsCase.expected[index]),
      ) &&
      result.unchecked.length === totalsCase.expectedUnchecked.length &&
      result.unchecked.every((item, index) =>
        matchesUnchecked(item, totalsCase.expectedUnchecked[index]),
      );
    console.log(
      `${passed ? "ok  " : "FAIL"} ${totalsCase.id} ${totalsCase.label}: total ${price.total}, ${result.breaches.length} breaches, ${result.unchecked.length} unchecked (${totalsCase.source})`,
    );
    if (missing.length > 0) {
      console.log(`    lists not loaded: ${missing.join(", ")}`);
    }
    for (const breach of result.breaches) {
      console.log(`    got ${formatTotalsBreach(breach)}`);
    }
    for (const item of result.unchecked) {
      console.log(`    got unchecked ${formatUnchecked(item)}`);
    }
    if (!passed) {
      for (const breach of totalsCase.expected) {
        console.log(`    expected ${formatTotalsBreach(breach)}`);
      }
      for (const item of totalsCase.expectedUnchecked) {
        console.log(`    expected unchecked ${formatUnchecked(item)}`);
      }
      failures += 1;
    }
  }
  return failures;
}

const formatCount = (breach: RequirementBreach) =>
  breach.allowed === undefined
    ? ""
    : `: allowed ${breach.allowed}, taken ${breach.taken}`;

const formatRequirementBreach = (breach: RequirementBreach) =>
  `${breach.kind} list ${breach.listId}${formatCount(breach)} [${breach.rows.map(formatRow).join(", ")}] (${breach.unitKeys.join(", ")})`;

const matchesRequirement = (
  got: RequirementBreach,
  wanted: RequirementBreach,
) => formatRequirementBreach(got) === formatRequirementBreach(wanted);

function runRequirementCases(catalogues: Map<number, Catalogue>): number {
  let failures = 0;
  for (const requirementCase of requirementCases) {
    const missing = requirementCase.listIds.filter((id) => !catalogues.has(id));
    const result = checkRequirements(
      catalogues,
      requirementCase.units,
      requirementCase.context,
    );
    const passed =
      missing.length === 0 &&
      result.length === requirementCase.expected.length &&
      result.every((breach, index) =>
        matchesRequirement(breach, requirementCase.expected[index]),
      );
    console.log(
      `${passed ? "ok  " : "FAIL"} ${requirementCase.id} ${requirementCase.label}: ${result.length} breaches (${requirementCase.source})`,
    );
    if (missing.length > 0) {
      console.log(`    lists not loaded: ${missing.join(", ")}`);
    }
    for (const breach of result) {
      console.log(`    got ${formatRequirementBreach(breach)}`);
    }
    if (!passed) {
      for (const breach of requirementCase.expected) {
        console.log(`    expected ${formatRequirementBreach(breach)}`);
      }
      failures += 1;
    }
  }
  return failures;
}

async function main(): Promise<number> {
  const listIds = [
    ...new Set([
      ...countingCases.flatMap((countingCase) => countingCase.listIds),
      ...totalsCases.flatMap((totalsCase) => totalsCase.listIds),
      ...requirementCases.flatMap((requirementCase) => requirementCase.listIds),
    ]),
  ];
  const catalogues = new Map<number, Catalogue>();
  for (const listId of listIds) {
    const catalogue = await loadCatalogue(listId);
    if (catalogue) {
      catalogues.set(listId, catalogue);
    }
  }
  const failures =
    runCases(catalogues) +
    runTotalsCases(catalogues) +
    runRequirementCases(catalogues);
  console.log(
    `cases failed ${failures} of ${countingCases.length + totalsCases.length + requirementCases.length}`,
  );
  return failures > 0 ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.log(error instanceof Error ? error.message : "check failed");
    process.exit(1);
  },
);
