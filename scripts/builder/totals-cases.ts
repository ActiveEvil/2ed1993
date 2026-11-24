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

const wolfGuard = [
  unit("champion", 12, 223, { models: { 234: 1 } }),
  unit("bike", 12, 234, { vehicles: 1, rideFor: "champion" }),
  unit("pack", 12, 224, { models: { 235: 1, 236: 9 } }),
  unit("rhino", 12, 236, { vehicles: 1, rideFor: "pack" }),
];
const harlequinArmy = [
  unit("great-harlequin", 13, 308, { models: { 288: 1 } }),
  unit("jetbike", 13, 307, { vehicles: 1, rideFor: "great-harlequin" }),
  unit("squad", 13, 312, { models: { 292: 1, 293: 9 } }),
];
const harlequinKeys = harlequinArmy.map((harlequin) => harlequin.key);

const list12 =
  "list 12 bands: 35 Characters max 50, 36 Squads min 25, 37 Support max 50; rows 152 and 153 (Bike, and band 37, to 35); entry 223 Wolf Guard Champion 31, entry 224 Grey Hunter Pack 316, both per entry; entry 234 Bike 20 a vehicle, entry 236 Rhino 50 a vehicle";
const list13 =
  "list 13 bands: 42 Characters max 50, 43 Squads min 25, 44 Support max 50, 45 Harlequins max 50; rows 98 and 100 (Jetbike to 42 and to 45); entry 281 Farseer 170 and entry 308 Great Harlequin 93, per entry; entry 312 Harlequin Squad 25 a model; entry 307 Jetbike 20 a vehicle";
const list14 =
  "list 14 bands: 49 Characters max 50, 50 Mobs min 25, 51 Support max 50; row 232 (Warboar to 49); entry 353 Warboss 65 per entry; entry 382 Warboar 6 a model";

const wolfLord = unit("wolf-lord", 12, 219, { models: { 227: 1 } });
const pack = wolfGuard[2];
const rhino = wolfGuard[3];
const warboss = unit("warboss", 14, 353, { models: { 305: 1 } });
const allied = (ally: UnitTaken, allyId: number) => ({ ...ally, allyId });

const list9 =
  "list 9 bands: 19 Characters max 50, 20 Broods min 25, no Support; entry 91 Hive Tyrant 264, entry 92 Tyranid Warrior Brood 174, entry 94 Genestealer Brood 100, all per entry";
const others =
  "entry 219 Wolf Lord 90 per entry; entry 376 Goff Boyz Mob 12 a model; entry 2 Space Marine Commander 90 per entry";

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
  {
    id: "a14-a",
    label:
      "List 12, Wolf Guard Champion on a Bike, Grey Hunter Pack in a Rhino, 100 points",
    listIds: [12],
    units: wolfGuard,
    context: { hostListId: 12, pointsLimit: 100 },
    expected: [
      {
        kind: "points_limit",
        listId: 12,
        governs: null,
        allowed: 100,
        taken: 417,
        unitKeys: ["champion", "bike", "pack", "rhino"],
      },
      {
        kind: "band_max",
        listId: 12,
        governs: band(35),
        allowed: 50,
        taken: 51,
        unitKeys: ["champion", "bike"],
      },
    ],
    expectedUnchecked: [],
    source: `A14, A15; ${list12}; total 417 over 100; Characters 31 + 20 = 51 over 50; the pack's Rhino stays in Support, 50 of 50; Squads 316 of at least 25`,
  },
  {
    id: "a14-b",
    label:
      "List 13, Farseer and Great Harlequin, each on a Jetbike, 360 points",
    listIds: [13],
    units: [
      unit("farseer", 13, 281, { models: { 255: 1 } }),
      unit("jetbike-1", 13, 307, { vehicles: 1, rideFor: "farseer" }),
      unit("great-harlequin", 13, 308, { models: { 288: 1 } }),
      unit("jetbike-2", 13, 307, { vehicles: 1, rideFor: "great-harlequin" }),
    ],
    context: { hostListId: 13, pointsLimit: 360 },
    expected: [
      {
        kind: "band_max",
        listId: 13,
        governs: band(42),
        allowed: 180,
        taken: 190,
        unitKeys: ["farseer", "jetbike-1"],
      },
      {
        kind: "band_min",
        listId: 13,
        governs: band(43),
        allowed: 90,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `A14 (the rider's own band decides); ${list13}; Characters 170 + 20 = 190 over 180; Squads 0 under 90; Harlequins 93 + 20 = 113 of 180; total 303`,
  },
  {
    id: "lb65-a",
    label: "List 13, Harlequin Squad on five Jetbikes, 400 points",
    listIds: [13],
    units: [
      unit("squad", 13, 312, { models: { 292: 1, 293: 4 } }),
      unit("jetbikes", 13, 307, { vehicles: 5, rideFor: "squad" }),
    ],
    context: { hostListId: 13, pointsLimit: 400 },
    expected: [
      {
        kind: "band_min",
        listId: 13,
        governs: band(43),
        allowed: 100,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-65; ${list13}; Squads 0 under 100; the squad's Jetbikes stay in Support, 5 × 20 = 100 of 200; Harlequins 5 × 25 = 125 of 200, which with the Jetbikes moved would be 225 and breach`,
  },
  {
    id: "a14-c",
    label: "List 14, Warboss on a Warboar, 140 points",
    listIds: [14],
    units: [
      unit("warboss", 14, 353, { models: { 305: 1 } }),
      unit("warboar", 14, 382, { models: { 301: 1 }, rideFor: "warboss" }),
    ],
    context: { hostListId: 14, pointsLimit: 140 },
    expected: [
      {
        kind: "band_max",
        listId: 14,
        governs: band(49),
        allowed: 70,
        taken: 71,
        unitKeys: ["warboss", "warboar"],
      },
      {
        kind: "band_min",
        listId: 14,
        governs: band(50),
        allowed: 35,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `A14; ${list14}; Characters 65 + 6 = 71 over 70; Mobs 0 under 35`,
  },
  {
    id: "lb62-a",
    label:
      "List 13, Harlequin army: Great Harlequin on a Jetbike and a Harlequin Squad, 400 points",
    listIds: [13],
    units: harlequinArmy,
    context: { hostListId: 13, pointsLimit: 400, variantId: 89 },
    expected: [],
    expectedUnchecked: [],
    source: `LB-62 (army_variant row 89); ${list13}; every band waived; total 93 + 20 + 250 = 363 of 400`,
  },
  {
    id: "lb62-b",
    label: "List 13, the same army without the variant, 400 points",
    listIds: [13],
    units: harlequinArmy,
    context: { hostListId: 13, pointsLimit: 400 },
    expected: [
      {
        kind: "band_min",
        listId: 13,
        governs: band(43),
        allowed: 100,
        taken: 0,
        unitKeys: [],
      },
      {
        kind: "band_max",
        listId: 13,
        governs: band(45),
        allowed: 200,
        taken: 363,
        unitKeys: harlequinKeys,
      },
    ],
    expectedUnchecked: [],
    source: `LB-62; ${list13}; Squads 0 under 100; Harlequins 93 + 20 (row 100) + 250 = 363 over 200`,
  },
  {
    id: "lb62-c",
    label: "List 13, Harlequin army, 300 points",
    listIds: [13],
    units: harlequinArmy,
    context: { hostListId: 13, pointsLimit: 300, variantId: 89 },
    expected: [
      {
        kind: "points_limit",
        listId: 13,
        governs: null,
        allowed: 300,
        taken: 363,
        unitKeys: harlequinKeys,
      },
    ],
    expectedUnchecked: [],
    source: `LB-62 (the points limit still holds); ${list13}; total 363 over 300; every band waived`,
  },
  {
    id: "b11-a",
    label:
      "List 12 with a Tactical Squad and a Predator through ally row 25, 1000 points",
    listIds: [12, 5],
    units: [wolfLord, pack, rhino, allied(tactical, 25), allied(predator, 25)],
    context: { hostListId: 12, pointsLimit: 1000 },
    expected: [
      {
        kind: "band_max",
        listId: 12,
        governs: band(37),
        allowed: 500,
        taken: 530,
        unitKeys: ["rhino", "tactical", "predator"],
      },
    ],
    expectedUnchecked: [],
    source: `b.11, R-43; ${list12}; ${prices}; ${others}; Support 50 + 300 + 180 = 530 over 500; Characters 90 of 500; Squads 316 of at least 250, the Tactical Squad not among them; total 936`,
  },
  {
    id: "lb60-a",
    label: "List 12 with a Warboss no ally row names, 1000 points",
    listIds: [12, 14],
    units: [wolfLord, pack, warboss],
    context: { hostListId: 12, pointsLimit: 1000 },
    expected: [
      {
        kind: "no_ally_row",
        listId: 12,
        governs: { table: "army_lists", id: 14 },
        allowed: 0,
        taken: 1,
        unitKeys: ["warboss"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-60, LB-18; ${list12}; ${list14}; ${others}; Support 65 of 500; Characters 90 of 500, the Warboss not among them; total 471`,
  },
  {
    id: "lb64-a",
    label: "List 9 with a Tactical Squad no ally row names, 1000 points",
    listIds: [9, 5],
    units: [
      unit("hive-tyrant", 9, 91, { models: { 119: 1 } }),
      unit("warriors", 9, 92, { models: { 120: 3 } }),
      unit("genestealers", 9, 94, { models: { 122: 5 } }),
      tactical,
    ],
    context: { hostListId: 9, pointsLimit: 1000 },
    expected: [
      {
        kind: "no_ally_row",
        listId: 9,
        governs: { table: "army_lists", id: 5 },
        allowed: 0,
        taken: 1,
        unitKeys: ["tactical"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-64, LB-60; ${list9}; ${prices}; the squad counts towards the limit only, total 838; Characters 264 of 500; Broods 174 + 100 = 274 of at least 250`,
  },
  {
    id: "lb63-a",
    label: "List 14 with a Predator through looted row 39, 350 points",
    listIds: [14, 5],
    units: [
      warboss,
      unit("goff-mob", 14, 376, { models: { 331: 8 } }),
      allied(predator, 39),
    ],
    context: { hostListId: 14, pointsLimit: 350 },
    expected: [
      {
        kind: "band_max",
        listId: 14,
        governs: band(51),
        allowed: 175,
        taken: 180,
        unitKeys: ["predator"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-63; ${list14}; ${prices}; ${others}; Support 180 over 175; Characters 65 of 175; Mobs 96 of at least 87.5; total 341`,
  },
  {
    id: "lb62-d",
    label:
      "List 13, Harlequin army with a Commander through ally row 33 and a Warboss no ally row names, 500 points",
    listIds: [13, 5, 14],
    units: [
      harlequinArmy[0],
      harlequinArmy[2],
      allied(unit("commander", 5, 2, { models: { 13: 1 } }), 33),
      warboss,
    ],
    context: { hostListId: 13, pointsLimit: 500, variantId: 89 },
    expected: [
      {
        kind: "no_ally_row",
        listId: 13,
        governs: { table: "army_lists", id: 14 },
        allowed: 0,
        taken: 1,
        unitKeys: ["warboss"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-62, LB-60; ${list13}; ${list14}; ${others}; every band waived, the warning stands; total 93 + 250 + 90 + 65 = 498`,
  },
];
