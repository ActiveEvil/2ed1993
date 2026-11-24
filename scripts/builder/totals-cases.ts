import type { RowRef, UnitTaken } from "@/lib/pricing";
import type { TotalsBreach, TotalsContext, TotalsResult } from "@/lib/totals";

export type TotalsCase = {
  id: string;
  label: string;
  listIds: number[];
  units: UnitTaken[];
  context: TotalsContext;
  expected: TotalsBreach[];
  expectedUnchecked: TotalsResult["unchecked"];
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

const band = (id: number): RowRef => ({ table: "unit_categories", id });

const chaplain = unit("chaplain", 5, 6, { grade: 17, models: { 17: 1 } });
const tactical = unit("tactical", 5, 11, { models: { 9: 1, 10: 9 } });
const predator = unit("predator", 5, 21, {
  vehicles: 1,
  datafaxWeapons: [{ rowId: 3 }],
});
const characters = [
  unit("commander", 5, 2, { models: { 13: 1 } }),
  unit("captain-1", 5, 4, { models: { 15: 1 } }),
  unit("captain-2", 5, 4, { models: { 15: 1 } }),
  unit("apothecary", 5, 5, { models: { 16: 1 } }),
  chaplain,
];
const characterKeys = characters.map((character) => character.key);

const prices =
  "list 5 bands: 5 Characters max 50, 6 Squads min 25, 7 Support max 50; entry 6 Chaplain Champion grade 55 (entry option 3; pricing m-i); entry 11 Tactical Squad 300 per entry; entry 21 Predator with datafax row 3 180 (pricing b)";
const characterPrices =
  "entry 2 Space Marine Commander 90, entry 4 Captain 90, entry 5 Apothecary 37, all per entry with no squadron";

export const totalsCases: TotalsCase[] = [
  {
    id: "lb57-a",
    label: "List 5, Chaplain, Tactical Squad, Predator, 1,000 points",
    listIds: [5],
    units: [chaplain, tactical, predator],
    context: { hostListId: 5, pointsLimit: 1000 },
    expected: [],
    expectedUnchecked: [],
    source: `LB-57; ${prices}; total 535; Characters 55 of 500, Squads 300 of at least 250, Support 180 of 500`,
  },
  {
    id: "lb57-b",
    label: "List 5, the same army, 500 points",
    listIds: [5],
    units: [chaplain, tactical, predator],
    context: { hostListId: 5, pointsLimit: 500 },
    expected: [
      {
        kind: "points_limit",
        listId: 5,
        governs: null,
        allowed: 500,
        taken: 535,
        unitKeys: ["chaplain", "tactical", "predator"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-21; ${prices}; total 535 over 500; Characters 55 of 250, Squads 300 of at least 125, Support 180 of 250`,
  },
  {
    id: "lb57-c",
    label: "List 5, five characters and a Tactical Squad, 700 points",
    listIds: [5],
    units: [...characters, tactical],
    context: { hostListId: 5, pointsLimit: 700 },
    expected: [
      {
        kind: "band_max",
        listId: 5,
        governs: band(5),
        allowed: 350,
        taken: 362,
        unitKeys: characterKeys,
      },
    ],
    expectedUnchecked: [],
    source: `LB-57; ${prices}; ${characterPrices}; Characters 362 over 350; total 662`,
  },
  {
    id: "lb57-d",
    label: "List 5, the same army, 724 points: Characters exactly half",
    listIds: [5],
    units: [...characters, tactical],
    context: { hostListId: 5, pointsLimit: 724 },
    expected: [],
    expectedUnchecked: [],
    source: `LB-57; ${prices}; ${characterPrices}; Characters 362 of 362`,
  },
  {
    id: "lb57-e",
    label: "List 5, the same army, 723 points: half is 361.5",
    listIds: [5],
    units: [...characters, tactical],
    context: { hostListId: 5, pointsLimit: 723 },
    expected: [
      {
        kind: "band_max",
        listId: 5,
        governs: band(5),
        allowed: 361.5,
        taken: 362,
        unitKeys: characterKeys,
      },
    ],
    expectedUnchecked: [],
    source: `LB-5 (fractions stand); ${prices}; ${characterPrices}; Characters 362 over 361.5`,
  },
  {
    id: "lb57-f",
    label: "List 5, Chaplain, Tactical Squad, Predator, 1,500 points",
    listIds: [5],
    units: [chaplain, tactical, predator],
    context: { hostListId: 5, pointsLimit: 1500 },
    expected: [
      {
        kind: "band_min",
        listId: 5,
        governs: band(6),
        allowed: 375,
        taken: 300,
        unitKeys: ["tactical"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-57; ${prices}; Squads 300 under 375`,
  },
  {
    id: "lb57-g",
    label: "List 5, Chaplain and Predator, no squad, 1,000 points",
    listIds: [5],
    units: [chaplain, predator],
    context: { hostListId: 5, pointsLimit: 1000 },
    expected: [
      {
        kind: "band_min",
        listId: 5,
        governs: band(6),
        allowed: 250,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-57; ${prices}; Squads empty, 0 under 250`,
  },
  {
    id: "lb57-h",
    label:
      "List 5, Tactical Squad alone, 1,200 points: Squads exactly a quarter",
    listIds: [5],
    units: [tactical],
    context: { hostListId: 5, pointsLimit: 1200 },
    expected: [],
    expectedUnchecked: [],
    source: `LB-57; ${prices}; Squads 300 of at least 300`,
  },
  {
    id: "lb57-i",
    label:
      "List 5, Chaplain with the Animus Speculum, Tactical Squad, Predator, 1,000 points",
    listIds: [5],
    units: [
      { ...chaplain, wargearCards: [{ cardId: 69, profileId: 17 }] },
      tactical,
      predator,
    ],
    context: { hostListId: 5, pointsLimit: 1000 },
    expected: [],
    expectedUnchecked: [
      { kind: "points_limit", governs: null, unitKeys: ["chaplain"] },
      { kind: "band_max", governs: band(5), unitKeys: ["chaplain"] },
    ],
    source: `LB-30 (card 69 not priced; pricing y-iii); ${prices}; Squads 300 of at least 250 and Support 180 of 500 decided`,
  },
  {
    id: "lb57-j",
    label: "List 5, the same army, 1,500 points",
    listIds: [5],
    units: [
      { ...chaplain, wargearCards: [{ cardId: 69, profileId: 17 }] },
      tactical,
      predator,
    ],
    context: { hostListId: 5, pointsLimit: 1500 },
    expected: [
      {
        kind: "band_min",
        listId: 5,
        governs: band(6),
        allowed: 375,
        taken: 300,
        unitKeys: ["tactical"],
      },
    ],
    expectedUnchecked: [
      { kind: "points_limit", governs: null, unitKeys: ["chaplain"] },
      { kind: "band_max", governs: band(5), unitKeys: ["chaplain"] },
    ],
    source: `LB-30; ${prices}; Squads 300 under 375 decided with the Chaplain unpriced`,
  },
  {
    id: "lb57-k",
    label:
      "List 5, Chaplain with the Animus Speculum, Tactical Squad, Predator, 500 points",
    listIds: [5],
    units: [
      { ...chaplain, wargearCards: [{ cardId: 69, profileId: 17 }] },
      tactical,
      predator,
    ],
    context: { hostListId: 5, pointsLimit: 500 },
    expected: [
      {
        kind: "points_limit",
        listId: 5,
        governs: null,
        allowed: 500,
        taken: 535,
        unitKeys: ["chaplain", "tactical", "predator"],
      },
    ],
    expectedUnchecked: [
      { kind: "band_max", governs: band(5), unitKeys: ["chaplain"] },
    ],
    source: `LB-30; ${prices}; the priced 535 already over 500, so the points limit is decided; Characters 55 of 250 stays unchecked`,
  },
  {
    id: "lb57-l",
    label:
      "List 5, five characters, the Chaplain with the Animus Speculum, and a Tactical Squad, 700 points",
    listIds: [5],
    units: [
      ...characters.filter((character) => character.key !== "chaplain"),
      { ...chaplain, wargearCards: [{ cardId: 69, profileId: 17 }] },
      tactical,
    ],
    context: { hostListId: 5, pointsLimit: 700 },
    expected: [
      {
        kind: "band_max",
        listId: 5,
        governs: band(5),
        allowed: 350,
        taken: 362,
        unitKeys: characterKeys,
      },
    ],
    expectedUnchecked: [
      { kind: "points_limit", governs: null, unitKeys: ["chaplain"] },
    ],
    source: `LB-30; ${prices}; ${characterPrices}; the priced Characters 362 already over 350, so the band is decided; total 662 of 700 stays unchecked`,
  },
];
