import type { RowRef, UnitTaken, Unpriced } from "@/lib/pricing";

export type PricingCase = {
  id: string;
  label: string;
  listIds: number[];
  units: UnitTaken[];
  expected: number;
  expectedByUnit?: Record<string, number>;
  expectedUnpriced?: { reason: Unpriced["reason"]; row: RowRef }[];
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

export const pricingCases: PricingCase[] = [
  {
    id: "a",
    label: "Inquisitor, Terminator Armour, Force Rod, one Mastery Level",
    listIds: [3],
    units: [
      unit("inquisitor", 3, 64, {
        grade: 3,
        models: { 3: 1 },
        options: [
          { unitOptionId: 7, levels: 1 },
          { unitOptionId: 6 },
          { unitOptionId: 553 },
        ],
        items: [
          {
            itemId: 5,
            holder: "model",
            profileId: 3,
            holders: 1,
            viaOptionId: 6,
          },
          {
            itemId: 53,
            holder: "model",
            profileId: 3,
            holders: 1,
            viaOptionId: 553,
          },
        ],
      }),
    ],
    expected: 130,
    source: "brief",
  },
  {
    id: "b",
    label: "Predator with lascannon sponsons, list 5",
    listIds: [5],
    units: [
      unit("predator", 5, 21, { vehicles: 1, datafaxWeapons: [{ rowId: 3 }] }),
    ],
    expected: 180,
    source: "brief",
  },
  {
    id: "c",
    label: "Grey Knights Terminator Squad teleporting",
    listIds: [3],
    units: [
      unit("gk-terminators", 3, 63, {
        models: { 88: 5 },
        options: [{ unitOptionId: 116 }],
      }),
    ],
    expected: 525,
    source: "LB-22",
  },
  {
    id: "d-i",
    label: "Chaos Space Marine Terminator Squad teleporting, bare",
    listIds: [11],
    units: [
      unit("csm-terminators", 11, 108, {
        models: { 139: 5 },
        options: [{ unitOptionId: 269 }],
      }),
    ],
    expected: 568.75,
    source: "LB-5",
  },
  {
    id: "d-ii",
    label:
      "Chaos Space Marine Terminator Squad teleporting, with an Assault Cannon",
    listIds: [11],
    units: [
      unit("csm-terminators", 11, 108, {
        models: { 139: 5 },
        options: [{ unitOptionId: 269 }, { unitOptionId: 204, models: 1 }],
        items: [
          {
            itemId: 288,
            holder: "model",
            profileId: 139,
            holders: 1,
            viaOptionId: 204,
          },
        ],
      }),
    ],
    expected: 647.5,
    source: "computed",
  },
  {
    id: "d-iii",
    label:
      "Chaos Space Marine Terminator Squad teleporting, Assault Cannon, led by a Champion",
    listIds: [11],
    units: [
      unit("csm-terminators", 11, 108, {
        models: { 139: 5 },
        options: [{ unitOptionId: 269 }, { unitOptionId: 204, models: 1 }],
        items: [
          {
            itemId: 288,
            holder: "model",
            profileId: 139,
            holders: 1,
            viaOptionId: 204,
          },
        ],
      }),
      unit("csm-champion", 11, 103, {
        models: { 131: 1 },
        attachedTo: { unitKey: "csm-terminators", mode: "leads" },
      }),
    ],
    expected: 717.5,
    expectedByUnit: { "csm-terminators": 677.5, "csm-champion": 40 },
    source: "computed",
  },
  {
    id: "e",
    label: "Wolf Guard Pack in Terminator Armour teleporting, led by Ranulf",
    listIds: [12],
    units: [
      unit("wolf-guard", 12, 228, {
        models: { 243: 5 },
        options: [{ unitOptionId: 288 }, { unitOptionId: 289 }],
      }),
      unit("ranulf", 12, 244, {
        models: { 252: 1 },
        attachedTo: { unitKey: "wolf-guard", mode: "leads" },
      }),
    ],
    expected: 548,
    expectedByUnit: { "wolf-guard": 433, ranulf: 115 },
    source: "BF-51",
  },
  {
    id: "f",
    label: "Evil Sunz Boyz Mob on Warbikes",
    listIds: [14],
    units: [
      unit("evil-sunz", 14, 375, {
        models: { 330: 10 },
        options: [{ unitOptionId: 472 }],
      }),
      unit("warbikes", 14, 395, { vehicles: 10, rideFor: "evil-sunz" }),
    ],
    expected: 470,
    expectedByUnit: { "evil-sunz": 470, warbikes: 0 },
    source: "BF-54",
  },
  {
    id: "g",
    label: "Stormboyz Korps with a Drillboss through option 466",
    listIds: [14],
    units: [
      unit("stormboyz", 14, 373, {
        models: { 328: 10 },
        options: [{ unitOptionId: 466, models: 1 }],
      }),
    ],
    expected: 119,
    source: "A35",
  },
  {
    id: "h",
    label: "Tactical Squad with a Veteran Sergeant through option 22",
    listIds: [5],
    units: [
      unit("tactical", 5, 11, {
        models: { 9: 1, 10: 9 },
        options: [{ unitOptionId: 22, models: 1 }],
      }),
    ],
    expected: 310,
    source: "computed",
  },
  {
    id: "h-453",
    label: "Freebooter Pirates taking option 453",
    listIds: [14],
    units: [
      unit("freebooters", 14, 369, {
        models: { 323: 5 },
        options: [{ unitOptionId: 453 }],
      }),
    ],
    expected: 60,
    source: "computed",
  },
  {
    id: "h-480",
    label: "Gretchin Mob taking option 480",
    listIds: [14],
    units: [
      unit("gretchin", 14, 378, {
        models: { 334: 10 },
        options: [{ unitOptionId: 480 }],
      }),
    ],
    expected: 50,
    source: "computed",
  },
  {
    id: "h-481",
    label: "Snotling Herd taking option 481",
    listIds: [14],
    units: [
      unit("snotlings", 14, 379, {
        models: { 336: 2 },
        options: [{ unitOptionId: 481 }],
      }),
    ],
    expected: 10,
    source: "computed",
  },
  {
    id: "i",
    label: "Wazdakka Gutzmek",
    listIds: [14],
    units: [unit("wazdakka", 14, 402, { models: { 351: 1 } })],
    expected: 192,
    source: "LB-9",
  },
  {
    id: "j",
    label: "Njal Stormcaller",
    listIds: [12],
    units: [unit("njal", 12, 241, { models: { 249: 1 } })],
    expected: 275,
    source: "LB-9",
  },
  {
    id: "k-i",
    label: "Blood Claw Pack, split, Jump Packs for one half",
    listIds: [12],
    units: [
      unit("blood-claws", 12, 225, {
        models: { 237: 1, 238: 9 },
        split: true,
        options: [{ unitOptionId: 277, half: "a" }],
      }),
    ],
    expected: 285,
    source: "computed",
  },
  {
    id: "k-ii",
    label: "Blood Claw Pack, split, Jump Packs for both halves",
    listIds: [12],
    units: [
      unit("blood-claws", 12, 225, {
        models: { 237: 1, 238: 9 },
        split: true,
        options: [{ unitOptionId: 277, half: "both" }],
      }),
    ],
    expected: 310,
    source: "computed",
  },
  {
    id: "l-i",
    label: "Dreadnought, Lascannon fitted in place",
    listIds: [13],
    units: [
      unit("dreadnought", 13, 300, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 70 }, { rowId: 63, fitted: "in_place" }],
      }),
    ],
    expected: 190,
    source: "computed",
  },
  {
    id: "l-ii",
    label: "Dreadnought, Lascannon carried in addition",
    listIds: [13],
    units: [
      unit("dreadnought", 13, 300, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 70 }, { rowId: 63, fitted: "in_addition" }],
      }),
    ],
    expected: 205,
    source: "BF-38",
  },
  {
    id: "m-i",
    label: "Chaplain, Champion grade",
    listIds: [5],
    units: [unit("chaplain", 5, 6, { grade: 17, models: { 17: 1 } })],
    expected: 55,
    source: "computed",
  },
  {
    id: "m-ii",
    label: "Snotling Herd, two bases",
    listIds: [8],
    units: [unit("snotlings", 8, 82, { models: { 109: 2 } })],
    expected: 30,
    source: "computed",
  },
  {
    id: "m-iii",
    label: "Exodite Lords on Carnosaur",
    listIds: [13],
    units: [unit("carnosaur", 13, 403, { models: { 355: 1, 356: 1, 357: 1 } })],
    expected: 307,
    source: "LB-26",
  },
  {
    id: "n-i",
    label: "Tarantula battery of three, each with Heavy Bolters",
    listIds: [12],
    units: [
      unit("tarantulas", 12, 233, {
        models: { 246: 3 },
        vehicles: 3,
        options: [{ unitOptionId: 298 }],
      }),
    ],
    expected: 150,
    source: "LB-25",
  },
  {
    id: "n-ii",
    label:
      "Tarantula battery of three, two with Heavy Bolters and one with Lascannons",
    listIds: [12],
    units: [
      unit("tarantulas", 12, 233, {
        models: { 246: 3 },
        vehicles: 3,
        options: [
          { unitOptionId: 298, vehicles: 2 },
          { unitOptionId: 294, vehicles: 1 },
        ],
      }),
    ],
    expected: 175,
    source: "LB-25",
  },
  {
    id: "o",
    label: "Weirdboy Warphead Mob with four Madboyz",
    listIds: [8],
    units: [unit("warphead", 8, 89, { models: { 116: 1, 117: 4 } })],
    expected: 120,
    source: "LB-26",
  },
  {
    id: "p",
    label: "Predator, list 11, Lascannons, Destroyer and Daemonic Possession",
    listIds: [11],
    units: [
      unit("predator", 11, 169, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 42 }, { rowId: 49 }],
        vehicleCards: [{ cardId: 42 }, { cardId: 40 }],
      }),
    ],
    expected: 256.25,
    source: "LB-32",
  },
  {
    id: "q-i",
    label: "Predator, list 5, Heavy Bolters with Heavy Flamers",
    listIds: [5],
    units: [
      unit("predator", 5, 21, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 5 }],
        vehicleCards: [{ cardId: 2, rows: [{ rowId: 5, weapons: 2 }] }],
      }),
    ],
    expected: 140,
    source: "LB-33",
  },
  {
    id: "q-ii",
    label: "Land Raider, Heavy Flamer on the twin-linked Heavy Bolters",
    listIds: [5],
    units: [
      unit("land-raider", 5, 19, {
        vehicles: 1,
        vehicleCards: [{ cardId: 2, rows: [{ rowId: 22 }] }],
      }),
    ],
    expected: 220,
    source: "LB-33",
  },
  {
    id: "q-iii",
    label: "Predator, list 11, Heavy Bolters with Heavy Flamers",
    listIds: [11],
    units: [
      unit("predator", 11, 169, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 42 }, { rowId: 45 }],
        vehicleCards: [{ cardId: 2, rows: [{ rowId: 45, weapons: 2 }] }],
      }),
    ],
    expected: 140,
    source: "LB-33",
  },
  {
    id: "r-i",
    label: "Land Raider, Ammo Feed on the twin-linked Heavy Bolters",
    listIds: [5],
    units: [
      unit("land-raider", 5, 19, {
        vehicles: 1,
        vehicleCards: [{ cardId: 20, rows: [{ rowId: 22 }] }],
      }),
    ],
    expected: 225,
    source: "the card",
  },
  {
    id: "r-ii",
    label: "Predator, list 5, Heavy Bolters with Ammo Feeds",
    listIds: [5],
    units: [
      unit("predator", 5, 21, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 5 }],
        vehicleCards: [{ cardId: 20, rows: [{ rowId: 5, weapons: 2 }] }],
      }),
    ],
    expected: 130,
    source: "the card",
  },
  {
    id: "s",
    label: "Land Raider, two Storm Bolters",
    listIds: [5],
    units: [
      unit("land-raider", 5, 19, {
        vehicles: 1,
        vehicleCards: [{ cardId: 3, count: 2 }],
      }),
    ],
    expected: 230,
    source: "the card",
  },
  {
    id: "t",
    label: "Rhino, list 11, Combi-Bolter",
    listIds: [11],
    units: [
      unit("rhino", 11, 168, {
        vehicles: 1,
        vehicleCards: [{ cardId: 45, count: 1 }],
      }),
    ],
    expected: 55,
    source: "the card",
  },
  {
    id: "u",
    label: "Vyper, Crystalline Web on two locations",
    listIds: [13],
    units: [
      unit("vyper", 13, 313, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 119 }],
        vehicleCards: [{ cardId: 29, count: 2 }],
      }),
    ],
    expected: 95,
    source: "LB-36",
  },
  {
    id: "v-i",
    label: "War Walker with Talons",
    listIds: [13],
    units: [
      unit("war-walker", 13, 306, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 67 }],
        vehicleCards: [{ cardId: 27 }],
      }),
    ],
    expected: 170,
    source: "the card",
  },
  {
    id: "v-ii",
    label: "Vyper with Talons",
    listIds: [13],
    units: [
      unit("vyper", 13, 313, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 119 }],
        vehicleCards: [{ cardId: 27 }],
      }),
    ],
    expected: 75,
    source: "the card",
  },
  {
    id: "w-i",
    label: "Predator, list 5, Bulldozer Blade",
    listIds: [5],
    units: [
      unit("predator", 5, 21, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 5 }],
        vehicleCards: [{ cardId: 1 }],
      }),
    ],
    expected: 135,
    source: "none needed",
  },
  {
    id: "w-ii",
    label: "Predator, list 11, Bulldozer Blade",
    listIds: [11],
    units: [
      unit("predator", 11, 169, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 42 }, { rowId: 45 }],
        vehicleCards: [{ cardId: 1 }],
      }),
    ],
    expected: 135,
    source: "LB-34 · Later",
  },
  {
    id: "x",
    label: "Predator, list 11, Bulldozer Blade and Daemonic Possession",
    listIds: [11],
    units: [
      unit("predator", 11, 169, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 42 }, { rowId: 45 }],
        vehicleCards: [{ cardId: 1 }, { cardId: 40 }],
      }),
    ],
    expected: 168.75,
    source: "LB-32",
  },
  {
    id: "y-i",
    label: "Chaplain, Champion grade, Aegis Suit",
    listIds: [5],
    units: [
      unit("chaplain", 5, 6, {
        grade: 17,
        models: { 17: 1 },
        wargearCards: [{ cardId: 9, profileId: 17 }],
      }),
    ],
    expected: 73,
    source: "rule 90",
  },
  {
    id: "y-ii",
    label: "Commander, list 11, Psycannon and Daemon Weapon",
    listIds: [11],
    units: [
      unit("commander", 11, 101, {
        models: { 129: 1 },
        wargearCards: [
          { cardId: 26, profileId: 129 },
          { cardId: 110, profileId: 129 },
        ],
      }),
    ],
    expected: 152,
    source: "LB-35 · Later",
  },
  {
    id: "y-iii",
    label: "Chaplain, Champion grade, Animus Speculum",
    listIds: [5],
    units: [
      unit("chaplain", 5, 6, {
        grade: 17,
        models: { 17: 1 },
        wargearCards: [{ cardId: 69, profileId: 17 }],
      }),
    ],
    expected: 55,
    expectedUnpriced: [
      {
        reason: "card_points_not_numeric",
        row: { table: "wargear_cards", id: 69 },
      },
    ],
    source: "LB-30",
  },
  {
    id: "y-iv",
    label: "Chaplain, Champion grade, Book of Salvation",
    listIds: [5],
    units: [
      unit("chaplain", 5, 6, {
        grade: 17,
        models: { 17: 1 },
        wargearCards: [{ cardId: 124, profileId: 17 }],
      }),
    ],
    expected: 55,
    source: "LB-31",
  },
  {
    id: "z",
    label:
      "Chaos Space Marine Terminator Squad teleporting, Assault Cannon, led by a Champion with an Aegis Suit",
    listIds: [11],
    units: [
      unit("csm-terminators", 11, 108, {
        models: { 139: 5 },
        options: [{ unitOptionId: 269 }, { unitOptionId: 204, models: 1 }],
        items: [
          {
            itemId: 288,
            holder: "model",
            profileId: 139,
            holders: 1,
            viaOptionId: 204,
          },
        ],
      }),
      unit("csm-champion", 11, 103, {
        models: { 131: 1 },
        attachedTo: { unitKey: "csm-terminators", mode: "leads" },
        wargearCards: [{ cardId: 9, profileId: 131 }],
      }),
    ],
    expected: 749,
    expectedByUnit: { "csm-terminators": 691, "csm-champion": 58 },
    source: "LB-22",
  },
  {
    id: "aa-i",
    label: "Leman Russ, list 1, Auto-Launcher with Frag Defender",
    listIds: [1],
    units: [
      unit("leman-russ", 1, 203, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 30, ammunitionId: 21 }],
      }),
    ],
    expected: 215,
    source: "LB-40 · Later (2)",
  },
  {
    id: "aa-ii",
    label: "Leman Russ, list 1, Auto-Launcher with Frag",
    listIds: [1],
    units: [
      unit("leman-russ", 1, 203, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 30, ammunitionId: 19 }],
      }),
    ],
    expected: 210,
    source: "LB-40 · Later (2)",
  },
  {
    id: "aa-iii",
    label: "Leman Russ, list 2, Auto-Launcher with Frag Defender",
    listIds: [2],
    units: [
      unit("leman-russ", 2, 149, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 30, ammunitionId: 21 }],
      }),
    ],
    expected: 215,
    source: "LB-48",
  },
  {
    id: "aa-iv",
    label:
      "Leman Russ, list 1, Auto-Launcher naming the Hellhound's Frag Defender load",
    listIds: [1],
    units: [
      unit("leman-russ", 1, 203, {
        vehicles: 1,
        datafaxWeapons: [{ rowId: 30, ammunitionId: 24 }],
      }),
    ],
    expected: 205,
    expectedUnpriced: [
      {
        reason: "no_price_row",
        row: { table: "datafax_weapon_ammunition", id: 24 },
      },
    ],
    source: "LB-40 · Later (2)",
  },
];
