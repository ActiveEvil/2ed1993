import type { AllowanceBreach, CountingContext } from "@/lib/counting";
import type { RowRef, UnitTaken } from "@/lib/pricing";

export type CountingCase = {
  id: string;
  label: string;
  listIds: number[];
  units: UnitTaken[];
  context: CountingContext;
  expected: AllowanceBreach[];
  source: string;
};

const unit = (
  key: string,
  listId: number,
  entryId: number,
  rest: Partial<UnitTaken> = {},
): UnitTaken => ({
  key,
  listId,
  entryId,
  models: {},
  options: [],
  items: [],
  datafaxWeapons: [],
  ...rest,
});

const entry = (id: number): RowRef => ({ table: "army_list_entries", id });
const set = (id: number): RowRef => ({ table: "army_list_allowance_sets", id });
const rule = (id: number): RowRef => ({
  table: "army_list_allowance_rules",
  id,
});

const nobs = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    unit(`nob-${index + 1}`, 14, 359),
  );

const squads = (name: string, entryId: number, count: number) =>
  Array.from({ length: count }, (_, index) =>
    unit(`${name}-${index + 1}`, 1, entryId),
  );

const commandHq = unit("command-hq", 1, 193);

const set3 = (allowed: number, taken: number, unitKeys: string[]) => ({
  kind: "rule_max" as const,
  listId: 1,
  governs: set(3),
  rows: [rule(33), rule(34)],
  allowed,
  taken,
  unitKeys,
});

export const countingCases: CountingCase[] = [
  {
    id: "lb58-a",
    label: "List 14, Warboss, one Goff Boyz Mob, two Nobs",
    listIds: [14],
    units: [unit("warboss", 14, 353), unit("goffs", 14, 376), ...nobs(2)],
    context: { hostListId: 14 },
    expected: [],
    source:
      "LB-58; rule 62 (entry 359, 1 per set 10) and rule 63 (entry 359, 2 per entry 376, a member of set 10); the Goff mob counts under rule 63 only; rule 87 (set 51, exactly one) met by the Warboss",
  },
  {
    id: "lb58-b",
    label: "List 14, Warboss, one Goff Boyz Mob, three Nobs",
    listIds: [14],
    units: [unit("warboss", 14, 353), unit("goffs", 14, 376), ...nobs(3)],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "rule_max",
        listId: 14,
        governs: entry(359),
        rows: [rule(62), rule(63)],
        allowed: 2,
        taken: 3,
        unitKeys: ["nob-1", "nob-2", "nob-3"],
      },
    ],
    source:
      "LB-58; rules 62 and 63 as read; 0 from rule 62 plus 2 from rule 63",
  },
  {
    id: "lb58-c",
    label: "List 14, Warboss, one Bad Moons Boyz Mob, two Nobs",
    listIds: [14],
    units: [unit("warboss", 14, 353), unit("bad-moons", 14, 371), ...nobs(2)],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "rule_max",
        listId: 14,
        governs: entry(359),
        rows: [rule(62), rule(63)],
        allowed: 1,
        taken: 2,
        unitKeys: ["nob-1", "nob-2"],
      },
    ],
    source:
      "LB-58; entry 371 is in set 10 and is not entry 376, so rule 62 alone counts it",
  },
  {
    id: "lb58-d",
    label: "List 14, Warboss, a Goff and a Bad Moons Boyz Mob, three Nobs",
    listIds: [14],
    units: [
      unit("warboss", 14, 353),
      unit("goffs", 14, 376),
      unit("bad-moons", 14, 371),
      ...nobs(3),
    ],
    context: { hostListId: 14 },
    expected: [],
    source: "LB-58; 1 from rule 62 (entry 371) plus 2 from rule 63 (entry 376)",
  },
  {
    id: "lb59-a",
    label: "List 13, Farseer, one Harlequin Squad, one Acolyte",
    listIds: [13],
    units: [
      unit("farseer", 13, 281),
      unit("squad-1", 13, 312),
      unit("acolyte-1", 13, 412),
    ],
    context: { hostListId: 13 },
    expected: [],
    source:
      "LB-59; rule 90 (entry 412, 1 per 2 of entry 312, at_least_one true); rule 82 (set 28, at least one) met by the Farseer",
  },
  {
    id: "lb59-b",
    label: "List 13, Farseer, two Harlequin Squads, two Acolytes",
    listIds: [13],
    units: [
      unit("farseer", 13, 281),
      unit("squad-1", 13, 312),
      unit("squad-2", 13, 312),
      unit("acolyte-1", 13, 412),
      unit("acolyte-2", 13, 412),
    ],
    context: { hostListId: 13 },
    expected: [
      {
        kind: "rule_max",
        listId: 13,
        governs: entry(412),
        rows: [rule(90)],
        allowed: 1,
        taken: 2,
        unitKeys: ["acolyte-1", "acolyte-2"],
      },
    ],
    source: "LB-59; rule 90 as read; floor(2 / 2) = 1",
  },
  {
    id: "stand-in",
    label: "List 12, Wolf Lord, Wolf Priest and Ulrik, no Grey Hunter Pack",
    listIds: [12],
    units: [
      unit("wolf-lord", 12, 219),
      unit("wolf-priest", 12, 220),
      unit("ulrik", 12, 239),
    ],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "stand_in",
        listId: 12,
        governs: set(38),
        rows: [entry(220), rule(39), entry(239)],
        allowed: 1,
        taken: 2,
        unitKeys: ["wolf-priest", "ulrik"],
      },
    ],
    source:
      "XL-15, LB-20; set 38 (entries 220, 239, shares_allowance true); entry 220 allowance_max 1 plus rule 39 (1 per entry 224, none taken); entry 239 allowance_max 1; rule 84 (set 37, at least one) met by the Wolf Lord",
  },
  {
    id: "rule-35-a",
    label: "List 1, Command HQ, one Imperial Guard Squad, a Command Squad",
    listIds: [1],
    units: [
      unit("command-hq", 1, 193),
      unit("guard-squad-1", 1, 1),
      unit("command-squad", 1, 194),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "rule_max",
        listId: 1,
        governs: entry(194),
        rows: [rule(35)],
        allowed: 0,
        taken: 1,
        unitKeys: ["command-squad"],
      },
    ],
    source:
      "BF-8, rule 35 (entry 194, 1 per set 2, deduction 1; set 2 is entries 1 and 198); 1 - 1 = 0; rule 73 (set 18, exactly one) met by entry 193",
  },
  {
    id: "rule-35-b",
    label: "List 1, Command HQ, two Imperial Guard Squads, a Command Squad",
    listIds: [1],
    units: [
      unit("command-hq", 1, 193),
      unit("guard-squad-1", 1, 1),
      unit("guard-squad-2", 1, 1),
      unit("command-squad", 1, 194),
    ],
    context: { hostListId: 1 },
    expected: [],
    source:
      "BF-8, rule 35 as read; 2 - 1 = 1; rule 33 (set 3, 1 per rule 31) allows 2 against set 3's two squads",
  },
  {
    id: "kamir-a",
    label:
      "List 1, Rough Rider Command Squad led by Kamir, a Rough Rider Squad",
    listIds: [1],
    units: [
      unit("rr-command", 1, 195, { options: [{ unitOptionId: 266 }] }),
      unit("rough-riders", 1, 199),
    ],
    context: { hostListId: 1 },
    expected: [],
    source:
      "Contract b.1, c.5; option 266 (unit 178) reaches profile 224 of unit 193, entry 212, and has no price row on entry 195, so it counts as entry 212, a member of set 18; rule 73 met; rule 24 (entry 195, 1 per entry 199) met",
  },
  {
    id: "kamir-b",
    label: "List 1, Kamir's squad and a foot Command HQ",
    listIds: [1],
    units: [
      unit("command-hq", 1, 193),
      unit("rr-command", 1, 195, { options: [{ unitOptionId: 266 }] }),
      unit("rough-riders", 1, 199),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "army_max",
        listId: 1,
        governs: set(18),
        rows: [rule(73)],
        allowed: 1,
        taken: 2,
        unitKeys: ["command-hq", "rr-command"],
      },
    ],
    source:
      "BF-26; rule 73 (set 18: entries 193 and 212; count 1, min_count 1, nothing counted)",
  },
  {
    id: "compulsory-host",
    label: "List 5 as host, a Tactical Squad and no Space Marine Commander",
    listIds: [5],
    units: [unit("tactical", 5, 11)],
    context: { hostListId: 5 },
    expected: [
      {
        kind: "entry_min",
        listId: 5,
        governs: entry(2),
        rows: [entry(2)],
        allowed: 1,
        taken: 0,
        unitKeys: [],
      },
    ],
    source: "XL-2; entry 2 allowance_min 1",
  },
  {
    id: "compulsory-ally",
    label: "List 12 host with a Wolf Lord, list 5 taken with a Tactical Squad",
    listIds: [12, 5],
    units: [unit("wolf-lord", 12, 219), unit("tactical", 5, 11)],
    context: { hostListId: 12 },
    expected: [],
    source:
      "XL-14, LB-60; entry 2's allowance_min does not bind a list other than the host",
  },
  {
    id: "ally-maximum",
    label: "List 12 host with a Wolf Lord, list 5 taken with two Commanders",
    listIds: [12, 5],
    units: [
      unit("wolf-lord", 12, 219),
      unit("commander-1", 5, 2),
      unit("commander-2", 5, 2),
    ],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "entry_max",
        listId: 5,
        governs: entry(2),
        rows: [entry(2)],
        allowed: 1,
        taken: 2,
        unitKeys: ["commander-1", "commander-2"],
      },
    ],
    source:
      "XL-14; entry 2 allowance_max 1 holds for a list other than the host",
  },
  {
    id: "rule-53-a",
    label: "List 13, Farseer, Eldar Pirates, no Pirate Captain",
    listIds: [13],
    units: [unit("farseer", 13, 281), unit("pirates", 13, 298)],
    context: { hostListId: 13 },
    expected: [
      {
        kind: "rule_min",
        listId: 13,
        governs: entry(285),
        rows: [rule(53)],
        allowed: 1,
        taken: 0,
        unitKeys: [],
      },
    ],
    source:
      "Contract b.3; rule 53 (entry 285, count 1, min_count 1, per entry 298)",
  },
  {
    id: "rule-53-b",
    label: "List 13, Farseer, Eldar Pirates, one Pirate Captain",
    listIds: [13],
    units: [
      unit("farseer", 13, 281),
      unit("pirates", 13, 298),
      unit("captain", 13, 285),
    ],
    context: { hostListId: 13 },
    expected: [],
    source: "Contract b.3; rule 53 as read",
  },
  {
    id: "variant-a",
    label: "List 13, Great Harlequin and a Harlequin Squad, no variant",
    listIds: [13],
    units: [unit("great-harlequin", 13, 308), unit("squad-1", 13, 312)],
    context: { hostListId: 13 },
    expected: [
      {
        kind: "army_min",
        listId: 13,
        governs: set(28),
        rows: [rule(82)],
        allowed: 1,
        taken: 0,
        unitKeys: [],
      },
    ],
    source:
      "Rule 82 (set 28: entries 280, 281, 320 in band 42; min_count 1, no count); rule 55 (entry 308, 1 per entry 312) met",
  },
  {
    id: "variant-b",
    label: "List 13, Great Harlequin and a Harlequin Squad, Harlequin army",
    listIds: [13],
    units: [unit("great-harlequin", 13, 308), unit("squad-1", 13, 312)],
    context: { hostListId: 13, variantId: 89 },
    expected: [],
    source:
      "BF-44, contract c.3; requirement 89 (army_variant, band 45); no member of set 28 is in band 45, so rule 82 lapses",
  },
  {
    id: "lb61-a",
    label: "List 1, Command HQ, one Imperial Guard Squad, one Ogryn Squad",
    listIds: [1],
    units: [commandHq, ...squads("guard", 1, 1), ...squads("ogryns", 200, 1)],
    context: { hostListId: 1 },
    expected: [],
    source:
      "LB-61; the squad is seated under rule 31 (3 per set 1) and not counted against set 3; rule 33 allows 1, the Ogryns take it",
  },
  {
    id: "lb61-b",
    label:
      "List 1, Command HQ, three Imperial Guard Squads, three Ogryn Squads",
    listIds: [1],
    units: [commandHq, ...squads("guard", 1, 3), ...squads("ogryns", 200, 3)],
    context: { hostListId: 1 },
    expected: [],
    source: "LB-61; three seated under rule 31; rule 33 allows 3",
  },
  {
    id: "lb61-c",
    label: "List 1, Command HQ, six Imperial Guard Squads",
    listIds: [1],
    units: [commandHq, ...squads("guard", 1, 6)],
    context: { hostListId: 1 },
    expected: [],
    source:
      "LB-61; three seated under rule 31; the other three are not a breach of rule 31 and count against set 3, where rule 33 allows 3",
  },
  {
    id: "lb61-d",
    label: "List 1, Command HQ, four Imperial Guard Squads, two Ogryn Squads",
    listIds: [1],
    units: [commandHq, ...squads("guard", 1, 4), ...squads("ogryns", 200, 2)],
    context: { hostListId: 1 },
    expected: [],
    source:
      "LB-61; three seated under rule 31; one squad and two Ogryn Squads against set 3, where rule 33 allows 3",
  },
  {
    id: "lb61-e",
    label: "List 1, Command HQ, three Ogryn Squads",
    listIds: [1],
    units: [commandHq, ...squads("ogryns", 200, 3)],
    context: { hostListId: 1 },
    expected: [set3(0, 3, ["ogryns-1", "ogryns-2", "ogryns-3"])],
    source: "LB-61; no regimental squad taken, so rules 33 and 34 allow 0",
  },
  {
    id: "lb61-f",
    label: "List 1, Command HQ, two Imperial Guard Squads, three Ogryn Squads",
    listIds: [1],
    units: [commandHq, ...squads("guard", 1, 2), ...squads("ogryns", 200, 3)],
    context: { hostListId: 1 },
    expected: [set3(2, 3, ["ogryns-1", "ogryns-2", "ogryns-3"])],
    source: "LB-61; two seated under rule 31; rule 33 allows 2",
  },
  {
    id: "lb61-g",
    label: "List 1, Command HQ, seven Imperial Guard Squads",
    listIds: [1],
    units: [commandHq, ...squads("guard", 1, 7)],
    context: { hostListId: 1 },
    expected: [set3(3, 4, ["guard-4", "guard-5", "guard-6", "guard-7"])],
    source:
      "LB-61; the first three seated under rule 31, the other four against set 3, where rule 33 allows 3; no breach of rule 31",
  },
  {
    id: "lb61-h",
    label:
      "List 1, Command HQ, Rough Rider Command Squad, two Rough Rider Squads, two Ogryn Squads",
    listIds: [1],
    units: [
      commandHq,
      unit("rr-command", 1, 195),
      ...squads("rough-riders", 199, 2),
      ...squads("ogryns", 200, 2),
    ],
    context: { hostListId: 1 },
    expected: [],
    source:
      "LB-61; both Rough Rider Squads seated under rule 32 (entry 199, 3 per entry 195; entry 199 has no allowance_max); rule 34 allows 2; rule 24 (entry 195, 1 per entry 199) met",
  },
  {
    id: "lb66-a",
    label: "List 12 host with a Wolf Lord, list 1 taken with an Ogryn Squad",
    listIds: [12, 1],
    units: [unit("wolf-lord", 12, 219), unit("ogryns", 1, 200)],
    context: { hostListId: 12 },
    expected: [],
    source:
      "LB-66; rules 33 and 34 (set 3, per rule) are not read for a list other than the host",
  },
  {
    id: "lb66-b",
    label: "List 12 host with a Wolf Lord, list 1 taken with two Command HQs",
    listIds: [12, 1],
    units: [
      unit("wolf-lord", 12, 219),
      unit("hq-1", 1, 193),
      unit("hq-2", 1, 193),
    ],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "army_max",
        listId: 1,
        governs: set(18),
        rows: [rule(73)],
        allowed: 1,
        taken: 2,
        unitKeys: ["hq-1", "hq-2"],
      },
      {
        kind: "entry_max",
        listId: 1,
        governs: entry(193),
        rows: [entry(193)],
        allowed: 1,
        taken: 2,
        unitKeys: ["hq-1", "hq-2"],
      },
    ],
    source:
      "LB-66, XL-14; entry 193 allowance_max 1 and rule 73 (set 18, army-wide, count 1) still hold for a list other than the host",
  },
];
