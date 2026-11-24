import { type Catalogue, loadCatalogue } from "@/lib/catalogue";
import { type AllowanceBreach, countAllowances } from "@/lib/counting";
import type { RowRef } from "@/lib/pricing";
import { countingCases } from "@/scripts/builder/counting-cases";

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

async function main(): Promise<number> {
  const listIds = [
    ...new Set(countingCases.flatMap((countingCase) => countingCase.listIds)),
  ];
  const catalogues = new Map<number, Catalogue>();
  for (const listId of listIds) {
    const catalogue = await loadCatalogue(listId);
    if (catalogue) {
      catalogues.set(listId, catalogue);
    }
  }
  const failures = runCases(catalogues);
  console.log(`cases failed ${failures} of ${countingCases.length}`);
  return failures > 0 ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.log(error instanceof Error ? error.message : "check failed");
    process.exit(1);
  },
);
