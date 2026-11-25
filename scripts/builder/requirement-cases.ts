import type { RowRef, UnitTaken } from "@/lib/pricing";
import type { RequirementBreach, RequirementContext } from "@/lib/requirements";

export type RequirementCase = {
  id: string;
  label: string;
  listIds: number[];
  units: UnitTaken[];
  context: RequirementContext;
  expected: RequirementBreach[];
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

const ref = (id: number): RowRef => ({ table: "army_list_requirements", id });

const to = (unitKey: string, mode: "leads" | "must" | "may") => ({
  attachedTo: { unitKey, mode },
});

const hearthguard = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    unit(`hg-${index + 1}`, 7, 39, to("warlord", "may")),
  );

export const requirementCases: RequirementCase[] = [
  {
    id: "att-1",
    label: "List 1, Primaris Lord in the Command HQ",
    listIds: [1],
    units: [
      unit("hq", 1, 193),
      unit("lord", 1, 196, { grade: 207, ...to("hq", "must") }),
    ],
    context: { hostListId: 1 },
    expected: [],
    source: "LB-67, LB-69; row 19",
  },
  {
    id: "att-2",
    label: "List 1, Primaris Lord and Master in one Command HQ",
    listIds: [1],
    units: [
      unit("hq", 1, 193),
      unit("lord", 1, 196, { grade: 207, ...to("hq", "must") }),
      unit("master", 1, 196, { grade: 206, ...to("hq", "must") }),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_over_count",
        listId: 1,
        rows: [ref(19), ref(47), ref(48), ref(49)],
        unitKeys: ["hq", "lord", "master"],
        allowed: 1,
        taken: 2,
      },
    ],
    source: "LB-69; rows 19, 47 to 49",
  },
  {
    id: "att-3",
    label: "List 1, Primaris Lord in a Command Squad",
    listIds: [1],
    units: [
      unit("cs", 1, 194),
      unit("lord", 1, 196, { grade: 207, ...to("cs", "must") }),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_not_allowed",
        listId: 1,
        rows: [ref(19)],
        unitKeys: ["lord", "cs"],
      },
    ],
    source: "LB-67, XL-13; row 19",
  },
  {
    id: "att-4",
    label: "List 1, Primaris Psyker taken alone",
    listIds: [1],
    units: [unit("psyker", 1, 196, { grade: 204 })],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_missing",
        listId: 1,
        rows: [ref(47)],
        unitKeys: ["psyker"],
      },
    ],
    source: "XL-13; row 47",
  },
  {
    id: "att-5",
    label: "List 1, Primaris Master in a Command Squad",
    listIds: [1],
    units: [
      unit("cs", 1, 194),
      unit("master", 1, 196, { grade: 206, ...to("cs", "must") }),
    ],
    context: { hostListId: 1 },
    expected: [],
    source: "LB-67, LB-69; row 49, set 1",
  },
  {
    id: "att-6",
    label: "List 1, Nork Deddog in a Command Squad",
    listIds: [1],
    units: [unit("cs", 1, 194), unit("nork", 1, 207, to("cs", "must"))],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_not_allowed",
        listId: 1,
        rows: [ref(21)],
        unitKeys: ["nork", "cs"],
      },
    ],
    source: "LB-67; row 21",
  },
  {
    id: "att-7",
    label: "List 1, Primaris Lord with Kamir's Rough Rider Command HQ",
    listIds: [1],
    units: [
      unit("rr", 1, 195, { options: [{ unitOptionId: 266 }] }),
      unit("lord", 1, 196, { grade: 207, ...to("rr", "must") }),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_not_allowed",
        listId: 1,
        rows: [ref(19)],
        unitKeys: ["lord", "rr"],
      },
    ],
    source: "LB-67, BF-40; rows 19, 50; option 266",
  },
  {
    id: "att-8",
    label: "List 1, Command HQ with Al'Rahem and Chenkov",
    listIds: [1],
    units: [
      unit("hq", 1, 193, {
        options: [{ unitOptionId: 264 }, { unitOptionId: 265 }],
      }),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "leads_twice",
        listId: 1,
        rows: [ref(51), ref(52)],
        unitKeys: ["hq"],
        allowed: 1,
        taken: 2,
      },
    ],
    source: "BF-32, BF-41; rows 51, 52; options 264, 265",
  },
  {
    id: "att-9",
    label: "List 1, Commissar joined to a squad",
    listIds: [1],
    units: [
      unit("squad", 1, 1),
      unit("commissar", 1, 197, to("squad", "must")),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_not_allowed",
        listId: 1,
        rows: [],
        unitKeys: ["commissar", "squad"],
      },
    ],
    source: "LB-67; no row",
  },
  {
    id: "att-10",
    label: "List 13, Exodite Lord as a Hero leading Dragon Knights",
    listIds: [13],
    units: [
      unit("knights", 13, 297),
      unit("lord", 13, 284, { grade: 261, ...to("knights", "leads") }),
    ],
    context: { hostListId: 13 },
    expected: [
      {
        kind: "attachment_not_allowed",
        listId: 13,
        rows: [],
        unitKeys: ["lord", "knights"],
      },
    ],
    source: "LB-67, XL-13; row 96",
  },
  {
    id: "att-11",
    label: "List 13, Exodite Lord as a Champion, alone",
    listIds: [13],
    units: [unit("lord", 13, 284, { grade: 260 })],
    context: { hostListId: 13 },
    expected: [
      {
        kind: "attachment_missing",
        listId: 13,
        rows: [ref(96)],
        unitKeys: ["lord"],
      },
    ],
    source: "XL-13; row 96",
  },
  {
    id: "att-12",
    label: "List 14, Goff Boyz Mob with a leading Nob and a second Nob",
    listIds: [14],
    units: [
      unit("goffs", 14, 376),
      unit("nob-1", 14, 359, to("goffs", "leads")),
      unit("nob-2", 14, 359, to("goffs", "must")),
    ],
    context: { hostListId: 14 },
    expected: [],
    source: "BF-34, LB-68; rows 218, 219",
  },
  {
    id: "att-13",
    label: "List 14, Goff Boyz Mob with one Nob, not leading",
    listIds: [14],
    units: [unit("goffs", 14, 376), unit("nob", 14, 359, to("goffs", "must"))],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "subordinate_without_leader",
        listId: 14,
        rows: [ref(218), ref(219)],
        unitKeys: ["nob", "goffs"],
      },
    ],
    source: "LB-68; rows 218, 219",
  },
  {
    id: "att-14",
    label: "List 14, Goff Boyz Mob with two leading Nobs",
    listIds: [14],
    units: [
      unit("goffs", 14, 376),
      unit("nob-1", 14, 359, to("goffs", "leads")),
      unit("nob-2", 14, 359, to("goffs", "leads")),
    ],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "leads_twice",
        listId: 14,
        rows: [ref(218)],
        unitKeys: ["goffs", "nob-1", "nob-2"],
        allowed: 1,
        taken: 2,
      },
    ],
    source: "BF-32; row 218",
  },
  {
    id: "att-15",
    label: "List 14, Stormboyz Korps with a Drillboss option and a Drillboss",
    listIds: [14],
    units: [
      unit("korps", 14, 373, { options: [{ unitOptionId: 466 }] }),
      unit("drillboss", 14, 358, to("korps", "leads")),
    ],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "leads_twice",
        listId: 14,
        rows: [ref(220)],
        unitKeys: ["korps", "drillboss"],
        allowed: 1,
        taken: 2,
      },
    ],
    source: "BF-32, BF-41; row 220; option 466",
  },
  {
    id: "att-16",
    label: "List 7, Warlord with three Hearthguard",
    listIds: [7],
    units: [unit("warlord", 7, 37), ...hearthguard(3)],
    context: { hostListId: 7 },
    expected: [
      {
        kind: "bodyguard_short",
        listId: 7,
        rows: [ref(7)],
        unitKeys: ["warlord", "hg-1", "hg-2", "hg-3"],
        allowed: 4,
        taken: 3,
      },
    ],
    source: "A25; row 7",
  },
  {
    id: "att-17",
    label: "List 7, Warlord with four Hearthguard",
    listIds: [7],
    units: [unit("warlord", 7, 37), ...hearthguard(4)],
    context: { hostListId: 7 },
    expected: [],
    source: "A25; row 7",
  },
  {
    id: "att-18",
    label: "List 7, Hearthguard taken alone",
    listIds: [7],
    units: [unit("hg", 7, 39)],
    context: { hostListId: 7 },
    expected: [
      {
        kind: "attachment_missing",
        listId: 7,
        rows: [ref(6)],
        unitKeys: ["hg"],
      },
    ],
    source: "A24, A25; rows 6, 7",
  },
  {
    id: "att-19",
    label: "List 8 host, allied Chaos Champion alone",
    listIds: [8, 11],
    units: [unit("champion", 11, 103)],
    context: { hostListId: 8 },
    expected: [
      {
        kind: "attachment_missing",
        listId: 11,
        rows: [ref(28)],
        unitKeys: ["champion"],
      },
    ],
    source: "LB-66; row 28",
  },
  {
    id: "att-20",
    label: "List 8 host, allied Chaos Champion with an allied Terminator Squad",
    listIds: [8, 11],
    units: [
      unit("terminators", 11, 108),
      unit("champion", 11, 103, to("terminators", "leads")),
    ],
    context: { hostListId: 8 },
    expected: [],
    source: "LB-66; row 28, set 19",
  },
  {
    id: "att-21",
    label: "List 8 host, allied Chaos Champion leading the host's Goff Mob",
    listIds: [8, 11],
    units: [
      unit("goffs", 8, 79),
      unit("champion", 11, 103, to("goffs", "leads")),
    ],
    context: { hostListId: 8 },
    expected: [
      {
        kind: "attachment_not_allowed",
        listId: 11,
        rows: [ref(28)],
        unitKeys: ["champion", "goffs"],
      },
    ],
    source: "LB-66, LB-67; row 28",
  },
  {
    id: "att-22",
    label: "List 1, two faults in one army",
    listIds: [1],
    units: [
      unit("hq", 1, 193),
      unit("cs", 1, 194),
      unit("psyker", 1, 196, { grade: 204 }),
      unit("nork", 1, 207, to("cs", "must")),
    ],
    context: { hostListId: 1 },
    expected: [
      {
        kind: "attachment_missing",
        listId: 1,
        rows: [ref(47)],
        unitKeys: ["psyker"],
      },
      {
        kind: "attachment_not_allowed",
        listId: 1,
        rows: [ref(21)],
        unitKeys: ["nork", "cs"],
      },
    ],
    source: "LB-67, XL-13; rows 21, 47",
  },
  {
    id: "ru-1",
    label: "List 12, Rhino carrying a Grey Hunter Pack, no Iron Priest",
    listIds: [12],
    units: [
      unit("hunters", 12, 224),
      unit("rhino", 12, 236, { rideFor: "hunters" }),
    ],
    context: { hostListId: 12 },
    expected: [],
    source: "LB-66, LB-71, A6; rows 169, 175",
  },
  {
    id: "ru-2",
    label: "List 12, Rhino taken alone, no Iron Priest",
    listIds: [12],
    units: [unit("rhino", 12, 236)],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 12,
        rows: [ref(169)],
        unitKeys: ["rhino"],
      },
    ],
    source: "LB-71, A6; row 169",
  },
  {
    id: "ru-3",
    label: "List 12, Rhino carrying a Wolf Lord, no Iron Priest",
    listIds: [12],
    units: [unit("lord", 12, 219), unit("rhino", 12, 236, { rideFor: "lord" })],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 12,
        rows: [ref(169)],
        unitKeys: ["rhino"],
      },
    ],
    source: "LB-71, A6; rows 169, 175, 176, 177",
  },
  {
    id: "ru-4",
    label: "List 12, Land Raider for a Wolf Scout Pack, no Iron Priest",
    listIds: [12],
    units: [
      unit("scouts", 12, 227),
      unit("raider", 12, 235, { rideFor: "scouts" }),
    ],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 12,
        rows: [ref(170)],
        unitKeys: ["raider"],
      },
    ],
    source: "LB-71, A6; rows 170, 173, 174",
  },
  {
    id: "ru-5",
    label: "List 12, two Rhinos taken alone and a Predator, no Iron Priest",
    listIds: [12],
    units: [
      unit("rhino-1", 12, 236),
      unit("rhino-2", 12, 236),
      unit("predator", 12, 238),
    ],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 12,
        rows: [ref(168)],
        unitKeys: ["predator"],
      },
      {
        kind: "required_unit_missing",
        listId: 12,
        rows: [ref(169)],
        unitKeys: ["rhino-1", "rhino-2"],
      },
    ],
    source: "LB-71, A3, A6; rows 168, 169",
  },
  {
    id: "ru-6",
    label: "List 12, Predator and Servitor Bodyguard with an Iron Priest",
    listIds: [12],
    units: [
      unit("priest", 12, 222),
      unit("predator", 12, 238),
      unit("servitors", 12, 231),
    ],
    context: { hostListId: 12 },
    expected: [],
    source: "LB-71, A1, A3; rows 168, 171",
  },
  {
    id: "ru-7",
    label: "List 14, Dreadnought with Mad Doc Grotsnik, no Mekaniak",
    listIds: [14],
    units: [unit("doc", 14, 398), unit("dread", 14, 384)],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 14,
        rows: [ref(241)],
        unitKeys: ["dread"],
      },
    ],
    source: "LB-71, A2; rows 240, 241",
  },
  {
    id: "ru-8",
    label: "List 14, Dreadnought with a Painboy and Notsnick",
    listIds: [14],
    units: [
      unit("painboy", 14, 361),
      unit("notsnick", 14, 415),
      unit("dread", 14, 384),
    ],
    context: { hostListId: 14 },
    expected: [],
    source: "LB-71, A2; rows 240, 241",
  },
  {
    id: "ru-9",
    label: "List 14, two Rocket Boyz units with Notsnick, no Painboy",
    listIds: [14],
    units: [
      unit("notsnick", 14, 415),
      unit("rb-1", 14, 416),
      unit("rb-2", 14, 416),
    ],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 14,
        rows: [ref(258)],
        unitKeys: ["rb-1", "rb-2"],
      },
    ],
    source: "LB-71, A1, A2; rows 257, 258",
  },
  {
    id: "ru-10",
    label: "List 14, Squig Katapult alone",
    listIds: [14],
    units: [unit("katapult", 14, 388)],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 14,
        rows: [ref(242)],
        unitKeys: ["katapult"],
      },
      {
        kind: "required_unit_missing",
        listId: 14,
        rows: [ref(243)],
        unitKeys: ["katapult"],
      },
    ],
    source: "LB-71, A4; rows 242, 243",
  },
  {
    id: "ru-11",
    label: "List 14, Gretchin Mob taking option 480, no Zodgrod",
    listIds: [14],
    units: [unit("mob", 14, 378, { options: [{ unitOptionId: 480 }] })],
    context: { hostListId: 14 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 14,
        rows: [ref(246)],
        unitKeys: ["mob"],
      },
    ],
    source: "LB-71, A5; row 246",
  },
  {
    id: "ru-12",
    label: "List 8, Ogryn Mob taking option 175 with a Blood Axe Mob",
    listIds: [8],
    units: [
      unit("axes", 8, 76),
      unit("ogryns", 8, 88, { options: [{ unitOptionId: 175 }] }),
    ],
    context: { hostListId: 8 },
    expected: [],
    source: "LB-71, A5; row 13",
  },
  {
    id: "ru-13",
    label: "List 3, Servitor Squad with a Tech-Priest Magos",
    listIds: [3],
    units: [unit("magos", 3, 49, { grade: 67 }), unit("servitors", 3, 60)],
    context: { hostListId: 3 },
    expected: [],
    source: "LB-71, A2; row 58",
  },
  {
    id: "ru-14",
    label:
      "List 8 host, allied List 14 Dreadnought with no Painboy or Mekaniak",
    listIds: [8, 14],
    units: [unit("dread", 14, 384)],
    context: { hostListId: 8 },
    expected: [],
    source: "LB-66; rows 240, 241",
  },
  {
    id: "ru-15",
    label: "List 8 host Dreadnought with an allied List 14 Painboy only",
    listIds: [8, 14],
    units: [unit("dread", 8, 187), unit("painboy", 14, 361)],
    context: { hostListId: 8 },
    expected: [
      {
        kind: "required_unit_missing",
        listId: 8,
        rows: [ref(11)],
        unitKeys: ["dread"],
      },
    ],
    source: "LB-66, LB-71, A1; row 11",
  },
  {
    id: "ru-16",
    label: "List 12, Wolf Guard Champion alone and a Rhino alone",
    listIds: [12],
    units: [unit("champion", 12, 223), unit("rhino", 12, 236)],
    context: { hostListId: 12 },
    expected: [
      {
        kind: "attachment_missing",
        listId: 12,
        rows: [ref(154)],
        unitKeys: ["champion"],
      },
      {
        kind: "required_unit_missing",
        listId: 12,
        rows: [ref(169)],
        unitKeys: ["rhino"],
      },
    ],
    source: "LB-67, LB-71, A6; rows 154, 169",
  },
];
