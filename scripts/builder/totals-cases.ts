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
  unit("bike", 12, 234, { vehicles: 1, mountFor: "champion" }),
  unit("pack", 12, 224, { models: { 235: 1, 236: 9 } }),
  unit("rhino", 12, 236, { vehicles: 1, transportFor: "pack" }),
];
const harlequinArmy = [
  unit("great-harlequin", 13, 308, { models: { 288: 1 } }),
  unit("jetbike", 13, 307, { vehicles: 1, mountFor: "great-harlequin" }),
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

const list2 =
  "list 2 bands: 8 Characters max 50, 9 Squads min 25, 10 Auxilia max 50, 11 Support max 50; rows 259 and 267 (band 11, and Bike, to 8); entry 23 Imperial Guard Colonel 65 and entry 24 Commissar 40, per entry; entry 146 Bike 20 and entry 151 Rhino 50, each a vehicle from its datafax";
const list5Rides =
  "list 5 bands: 5 Characters max 50, 6 Squads min 25, 7 Support max 50; rows 261 and 269 (band 7, and Bike, to 5); entry 4 Captain 90 and entry 7 Techmarine 35, per entry; entry 16 Bike 20 and entry 22 Rhino 50, each a vehicle from its datafax";
const list6 =
  "list 6 bands: 28 Characters max 50, 29 Squads min 25, 30 Support max 50; row 270 (Jetbike to 28); entry 132 Exarch 50 per entry; entry 181 Jetbike 20 a vehicle from its datafax";
const list7 =
  "list 7 bands: 12 Characters max 50, 13 Squads min 25, 14 Support max 50; row 262 (band 14 to 12); entry 37 Warlord 74 per entry; entry 184 Rhino 50 a vehicle from its datafax";
const list8 =
  "list 8 bands: 15 Characters max 50, 16 Mobs min 25, 17 Freebooters max 50, 18 Support max 50; rows 263, 271 and 272 (band 18, Nobz Bike and Warboar, to 15); entry 65 Warboss 65, entry 69 Nob 13 and entry 70 Mekaniak 18, per entry; entry 321 Warboar 6 a model; entry 188 Nobz Bike 20 and entry 186 Battlewagon 50, each a vehicle from its datafax";
const list10 =
  "list 10 bands: 21 Characters max 50, 22 Broods min 25, 23 Support max 50; rows 264 and 273 (band 23, and Bike, to 21); entry 96 Genestealer Patriarch 163 and entry 97 Genestealer Magus 107, per entry; entry 162 Bike 20 and entry 166 Rhino 50, each a vehicle from its datafax";
const list11 =
  "list 11 bands: 24 Characters max 50, 25 Squads min 25, 26 Support max 50, 27 Daemons max 50; rows 265 and 274 to 276 (band 26, Juggernauts, Steeds and Discs of Tzeentch, to 24); entry 101 Chaos Space Marine Commander 97, entry 102 Chaos Space Marine Hero 66, entry 103 Chaos Space Marine Champion 40 and entry 104 Noise Marine Champion 40, per entry; entry 114 Bloodthirster 275, entry 117 Juggernauts 36, entry 121 Steeds 19 and entry 129 Discs of Tzeentch 16, a model; entry 168 Rhino 50 a vehicle from its datafax";

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
    id: "lb91-a",
    label: "List 12, Wolf Lord carried in a Rhino, 200 points",
    listIds: [12],
    units: [
      wolfLord,
      unit("lord-rhino", 12, 236, { vehicles: 1, transportFor: "wolf-lord" }),
    ],
    context: { hostListId: 12, pointsLimit: 200 },
    expected: [
      {
        kind: "band_max",
        listId: 12,
        governs: band(35),
        allowed: 100,
        taken: 140,
        unitKeys: ["wolf-lord", "lord-rhino"],
      },
      {
        kind: "band_min",
        listId: 12,
        governs: band(36),
        allowed: 50,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-91, LB-96; ${list12}; ${others}; the Rhino is 50 from its datafax; Characters 90 + 50 = 140 over 100; Squads 0 under 50; Support 0; total 140`,
  },
  {
    id: "a14-b",
    label:
      "List 13, Farseer and Great Harlequin, each on a Jetbike, 360 points",
    listIds: [13],
    units: [
      unit("farseer", 13, 281, { models: { 255: 1 } }),
      unit("jetbike-1", 13, 307, { vehicles: 1, mountFor: "farseer" }),
      unit("great-harlequin", 13, 308, { models: { 288: 1 } }),
      unit("jetbike-2", 13, 307, { vehicles: 1, mountFor: "great-harlequin" }),
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
      unit("jetbikes", 13, 307, { vehicles: 5, mountFor: "squad" }),
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
      unit("warboar", 14, 382, { models: { 301: 1 }, mountFor: "warboss" }),
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
  {
    id: "lb99-a",
    label:
      "List 2, Colonel on a Bike and Commissar carried in a Rhino, 340 points",
    listIds: [2],
    units: [
      unit("colonel", 2, 23, { models: { 34: 1 } }),
      unit("bike", 2, 146, { vehicles: 1, mountFor: "colonel" }),
      unit("commissar", 2, 24, { models: { 35: 1 } }),
      unit("rhino", 2, 151, { vehicles: 1, transportFor: "commissar" }),
    ],
    context: { hostListId: 2, pointsLimit: 340 },
    expected: [
      {
        kind: "band_max",
        listId: 2,
        governs: band(8),
        allowed: 170,
        taken: 175,
        unitKeys: ["colonel", "bike", "commissar", "rhino"],
      },
      {
        kind: "band_min",
        listId: 2,
        governs: band(9),
        allowed: 85,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94, LB-99; ${list2}; Characters 65 + 20 + 40 + 50 = 175 over 170, and 155 or 125 with either row unread; Squads 0 under 85; Auxilia 0; Support 0; total 175`,
  },
  {
    id: "lb99-b",
    label:
      "List 5, Captain on a Bike and Techmarine carried in a Rhino, 360 points",
    listIds: [5],
    units: [
      unit("captain", 5, 4, { models: { 15: 1 } }),
      unit("bike", 5, 16, { vehicles: 1, mountFor: "captain" }),
      unit("techmarine", 5, 7, { models: { 20: 1 } }),
      unit("rhino", 5, 22, { vehicles: 1, transportFor: "techmarine" }),
    ],
    context: { hostListId: 5, pointsLimit: 360 },
    expected: [
      {
        kind: "band_max",
        listId: 5,
        governs: band(5),
        allowed: 180,
        taken: 195,
        unitKeys: ["captain", "bike", "techmarine", "rhino"],
      },
      {
        kind: "band_min",
        listId: 5,
        governs: band(6),
        allowed: 90,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94, LB-99; ${list5Rides}; Characters 90 + 20 + 35 + 50 = 195 over 180, and 175 or 145 with either row unread; Squads 0 under 90; Support 0; total 195`,
  },
  {
    id: "lb99-c",
    label: "List 6, Exarch on a Jetbike, 120 points",
    listIds: [6],
    units: [
      unit("exarch", 6, 132, { models: { 164: 1 } }),
      unit("jetbike", 6, 181, { vehicles: 1, mountFor: "exarch" }),
    ],
    context: { hostListId: 6, pointsLimit: 120 },
    expected: [
      {
        kind: "band_max",
        listId: 6,
        governs: band(28),
        allowed: 60,
        taken: 70,
        unitKeys: ["exarch", "jetbike"],
      },
      {
        kind: "band_min",
        listId: 6,
        governs: band(29),
        allowed: 30,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-99; ${list6}; Characters 50 + 20 = 70 over 60; Squads 0 under 30; Support 0; total 70`,
  },
  {
    id: "lb94-a",
    label: "List 7, Warlord carried in a Rhino, 200 points",
    listIds: [7],
    units: [
      unit("warlord", 7, 37, { models: { 55: 1 } }),
      unit("rhino", 7, 184, { vehicles: 1, transportFor: "warlord" }),
    ],
    context: { hostListId: 7, pointsLimit: 200 },
    expected: [
      {
        kind: "band_max",
        listId: 7,
        governs: band(12),
        allowed: 100,
        taken: 124,
        unitKeys: ["warlord", "rhino"],
      },
      {
        kind: "band_min",
        listId: 7,
        governs: band(13),
        allowed: 50,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94; ${list7}; Characters 74 + 50 = 124 over 100; Squads 0 under 50; Support 0; total 124`,
  },
  {
    id: "lb99-d",
    label:
      "List 8, Warboss on a Warboar, Nob on a Nobz Bike and Mekaniak carried in a Battlewagon, 340 points",
    listIds: [8],
    units: [
      unit("warboss", 8, 65, { models: { 89: 1 } }),
      unit("warboar", 8, 321, { models: { 301: 1 }, mountFor: "warboss" }),
      unit("nob", 8, 69, { models: { 93: 1 } }),
      unit("nobz-bike", 8, 188, { vehicles: 1, mountFor: "nob" }),
      unit("mekaniak", 8, 70, { models: { 94: 1 } }),
      unit("battlewagon", 8, 186, { vehicles: 1, transportFor: "mekaniak" }),
    ],
    context: { hostListId: 8, pointsLimit: 340 },
    expected: [
      {
        kind: "band_max",
        listId: 8,
        governs: band(15),
        allowed: 170,
        taken: 172,
        unitKeys: [
          "warboss",
          "warboar",
          "nob",
          "nobz-bike",
          "mekaniak",
          "battlewagon",
        ],
      },
      {
        kind: "band_min",
        listId: 8,
        governs: band(16),
        allowed: 85,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94, LB-95, LB-99; ${list8}; Characters 65 + 6 + 13 + 20 + 18 + 50 = 172 over 170, and 166, 152 or 122 with any one row unread; Mobs 0 under 85; Freebooters 0; Support 0; total 172`,
  },
  {
    id: "lb99-e",
    label:
      "List 10, Magus on a Bike and Patriarch carried in a Rhino, 660 points",
    listIds: [10],
    units: [
      unit("magus", 10, 97, { models: { 125: 1 } }),
      unit("bike", 10, 162, { vehicles: 1, mountFor: "magus" }),
      unit("patriarch", 10, 96, { models: { 124: 1 } }),
      unit("rhino", 10, 166, { vehicles: 1, transportFor: "patriarch" }),
    ],
    context: { hostListId: 10, pointsLimit: 660 },
    expected: [
      {
        kind: "band_max",
        listId: 10,
        governs: band(21),
        allowed: 330,
        taken: 340,
        unitKeys: ["magus", "bike", "patriarch", "rhino"],
      },
      {
        kind: "band_min",
        listId: 10,
        governs: band(22),
        allowed: 165,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94, LB-99; ${list10}; Characters 107 + 20 + 163 + 50 = 340 over 330, and 320 or 290 with either row unread; Broods 0 under 165; Support 0; total 340`,
  },
  {
    id: "lb99-f",
    label:
      "List 11, three characters on a Juggernaut, a Steed and a Disc of Tzeentch, and a fourth carried in a Rhino, 700 points",
    listIds: [11],
    units: [
      unit("hero", 11, 102, { models: { 130: 1 } }),
      unit("juggernaut", 11, 117, { models: { 148: 1 }, mountFor: "hero" }),
      unit("commander", 11, 101, { models: { 129: 1 } }),
      unit("steed", 11, 121, { models: { 152: 1 }, mountFor: "commander" }),
      unit("champion", 11, 103, { models: { 131: 1 } }),
      unit("disc", 11, 129, { models: { 161: 1 }, mountFor: "champion" }),
      unit("noise-champion", 11, 104, { models: { 132: 1 } }),
      unit("rhino", 11, 168, { vehicles: 1, transportFor: "noise-champion" }),
    ],
    context: { hostListId: 11, pointsLimit: 700 },
    expected: [
      {
        kind: "band_max",
        listId: 11,
        governs: band(24),
        allowed: 350,
        taken: 364,
        unitKeys: [
          "hero",
          "juggernaut",
          "commander",
          "steed",
          "champion",
          "disc",
          "noise-champion",
          "rhino",
        ],
      },
      {
        kind: "band_min",
        listId: 11,
        governs: band(25),
        allowed: 175,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94, LB-99; ${list11}; Characters 66 + 36 + 97 + 19 + 40 + 16 + 40 + 50 = 364 over 350, and 348, 345, 328 or 314 with any one row unread; Squads 0 under 175; Support 0; Daemons 0; total 364`,
  },
  {
    id: "lb99-g",
    label: "List 11, Bloodthirster on a Juggernaut, 620 points",
    listIds: [11],
    units: [
      unit("bloodthirster", 11, 114, { models: { 145: 1 } }),
      unit("juggernaut", 11, 117, {
        models: { 148: 1 },
        mountFor: "bloodthirster",
      }),
    ],
    context: { hostListId: 11, pointsLimit: 620 },
    expected: [
      {
        kind: "band_min",
        listId: 11,
        governs: band(25),
        allowed: 155,
        taken: 0,
        unitKeys: [],
      },
      {
        kind: "band_max",
        listId: 11,
        governs: band(27),
        allowed: 310,
        taken: 311,
        unitKeys: ["bloodthirster", "juggernaut"],
      },
    ],
    expectedUnchecked: [],
    source: `LB-99, A14 (the rider's own band decides); ${list11}; the Juggernaut stays in Daemons with its rider, row 274 naming Characters; Daemons 275 + 36 = 311 over 310; Squads 0 under 155; Characters 0; total 311`,
  },
  {
    id: "lb94-b",
    label: "List 14, Bigboss carried in a Battlewagon, 160 points",
    listIds: [14],
    units: [
      unit("bigboss", 14, 355, { models: { 308: 1 } }),
      unit("battlewagon", 14, 390, { vehicles: 1, transportFor: "bigboss" }),
    ],
    context: { hostListId: 14, pointsLimit: 160 },
    expected: [
      {
        kind: "band_max",
        listId: 14,
        governs: band(49),
        allowed: 80,
        taken: 85,
        unitKeys: ["bigboss", "battlewagon"],
      },
      {
        kind: "band_min",
        listId: 14,
        governs: band(50),
        allowed: 40,
        taken: 0,
        unitKeys: [],
      },
    ],
    expectedUnchecked: [],
    source: `LB-94, LB-95; ${list14}; row 266 (band 51 to 49); entry 355 Bigboss 35 per entry; entry 390 Battlewagon 50 a vehicle from its datafax; Characters 35 + 50 = 85 over 80; Mobs 0 under 40; Support 0; total 85`,
  },
];
