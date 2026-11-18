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
];
