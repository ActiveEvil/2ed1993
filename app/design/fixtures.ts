import type { AllyLink, CompositionBand } from "@/components/ArmyListSummary";
import type { CardFaceData } from "@/components/CardFace";
import type { CharacteristicRow } from "@/components/CharacteristicProfile";
import type { DatafaxData } from "@/components/Datafax";
import type { Image } from "@/components/ImageWithCredit";
import type { EquipmentUnit } from "@/components/UnitEquipment";
import type { WeaponProfileRow } from "@/components/WeaponProfile";

export type Stored = { source: string; html: string };

export const RANGE_CHART: Stored = {
  source: "rules · Armour Penetration",
  html: `<section class="chart" style="grid-template-columns: repeat(6, minmax(0, 1fr));;">
    <h3 id="Range_Chart" style="grid-column: span 6 / span 6;">Range Chart</h3>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>Below 24&quot;</strong></div>
    <div style="grid-column: span 4 / span 4;">
        No modifier.
    </div>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>24-48&quot;</strong></div>
    <div style="grid-column: span 4 / span 4;">
        Penetration is reduced by 1.
    </div>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>48-72&quot;</strong></div>
    <div style="grid-column: span 4 / span 4;">
        Penetration is reduced by 2.
    </div>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>72&quot;+</strong></div>
    <div style="grid-column: span 4 / span 4;">
        Penetration is reduced by 3.
    </div>
</section>`,
};

export const PAIRS_CHART: Stored = {
  source: "wargear_cards · Armour Piercing Ammo",
  html: `<section class="chart" style="grid-template-columns: repeat(6, minmax(0, 1fr));;">
    <h3 id="Armour_Piercing_Ammo_Chart" style="grid-column: span 6 / span 6;">Armour Piercing Ammo Chart</h3>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">Weapon&apos;s Strength</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">Bonus Penetration Dice</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">1-3</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">+D3</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">4-5</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">+1D6</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">6-7</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">+1D12</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">8-10</div>
    <div style="text-align: center;align-content: center;grid-column: span 3 / span 3;">+1D20</div>
</section>`,
};

export const PROFILE_CHART: Stored = {
  source: "wargear_cards · Night Wing the Psyber Raven",
  html: `<section class="chart" style="grid-template-columns: repeat(9, minmax(0, 1fr));">
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>M</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>WS</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>BS</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>S</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>T</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>W</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>I</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>A</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>Ld</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">&ndash;</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">4</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">0</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">3</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">6</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">1</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">4</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">1</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">&ndash;</div>
</section>`,
};

export const NARROW_TABLE: Stored = {
  source: "rules · Buildings",
  html: `<section class="table-container" style="max-width: 36rem;">
    <table>
        <thead>
            <tr>
                <th scope="col" style="text-align:left;">Type of Building<sup>&dagger;</sup></th>
                <th scope="col" style="min-width: 10rem;">Armour Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align:left;">Tent or inflatable structure </td>
                <td>5</td>
            </tr>
            <tr>
                <td style="text-align:left;">Mud or straw hut, wooden or tin shack </td>
                <td>10</td>
            </tr>
            <tr>
                <td style="text-align:left;">Plexiglas or plastic</td>
                <td>15</td>
            </tr>
            <tr>
                <td style="text-align:left;">Timber, stone, concrete or plascrete</td>
                <td>20</td>
            </tr>
            <tr>
                <td style="text-align:left;">Steel, plasteel or rockrete </td>
                <td>25</td>
            </tr>
            <tr>
                <td style="text-align:left;">Armaplas, ceramite, or adamantium</td>
                <td>30</td>
            </tr>
        </tbody>
    </table>
    <p>
        <small>
            <sup>&dagger;</sup> <em>Imperium buildings are generally made of timber, stone, concrete or plascrete.
                Administratum and other official buildings are made of steel, plasteel or rockrete. Only purpose-built
                fortifications are constructed from armaplas, ceramite or adamantium.</em>
        </small>
    </p>
</section>`,
};

export const WIDE_TABLE: Stored = {
  source: "rules · Damage",
  html: `<section class="table-container">
    <table>
        <thead>
            <tr>
                <td class="empty"></td>
                <td class="empty"></td>
                <th scope="colgroup" colSpan="10">
                    Target&apos;s Toughness
                </th>
            </tr>
            <tr>
                <td class="empty"></td>
                <td class="empty"></td>
                <th scope="col">
                    1
                </th>
                <th scope="col">
                    2
                </th>
                <th scope="col">
                    3
                </th>
                <th scope="col">
                    4
                </th>
                <th scope="col">
                    5
                </th>
                <th scope="col">
                    6
                </th>
                <th scope="col">
                    7
                </th>
                <th scope="col">
                    8
                </th>
                <th scope="col">
                    9
                </th>
                <th scope="col">
                    10
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th rowSpan="11" class="text-vertical">
                    Hit Strength
                </th>
            </tr>
            <tr>
                <th scope="row">
                    1
                </th>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    2
                </th>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    3
                </th>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    4
                </th>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    5
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    6
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    7
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
            </tr>
            <tr>
                <th scope="row">
                    8
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
            </tr>
            <tr>
                <th scope="row">
                    9
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
            </tr>
            <tr>
                <th scope="row">
                    10
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
            </tr>
        </tbody>
    </table>
</section>`,
};

export const BLOCKQUOTE: Stored = {
  source: "rules · Remember...",
  html: `<section class="blockquote-container">
    <blockquote>
        <p>
            Warhammer 40,000 is a challenging and involving game, with
            many fantastic races, and endless possibilities. In a game of
            this size and level of complexity there are bound to be some
            situations where the rules seem unclear, or a particular
            situation lies outside the rules as they are written. This is
            inevitable, as we can&apos;t possibly give rules to cover
            every circumstance. Nor would we want to try, as that would
            restrict what you can and cannot do far too much. Players
            should feel free to invent and improvise, exploring the galaxy
            of Warhammer 40,000 for themselves and taking the game far
            beyond the published rules if they wish.
        </p>
    </blockquote>
    <p class="credit">
    &mdash;Rick Priestley &amp; Andy Chambers,
        <cite>Warhammer 40,000 Rulebook (2nd Edition)</cite>
    </p>
</section>`,
};

export const HOUSE_RULE: Stored = {
  source: "rules · Running",
  html: `<section class="house-rule">
    <span class="label">House Rule</span>
    <p>
        It is highly recommended that you disregard this, as it breaks the game. Olden Demon, on YouTube, explains how
        <a href="https://youtu.be/t48UFxFlWeM?si=V-77gjXFmCC-YUvZ&amp;t=308" target="_blank">here</a>.
    </p>
</section>`,
};

export const ORDERED_LIST: Stored = {
  source: "rules · Line of Sight",
  html: `<section class="ordered-list small-markers">
    <ol>
        <li>
            <p>
                The target is behind solid <a href="/rules/movement#Terrain">Terrain</a>, such as hills, rock formations, walls, and buildings, which completely cover it. <strong>Line of Sight</strong> blocking terrain is usually agreed by both players during <a href="/rules/how-to-play#Place_Terrain">Terrain Setup</a>.
            </p>
        </li>
        <li>
            <p>
                Targets are obscured if there is an area of woodland <strong>Terrain</strong> more than 2&quot; deep
                between them and the shooter.
            </p>
        </li>
        <li>
            <p>
                An obstacle of about a model&apos;s own height&mdash;a wall, a hedge, a row of scrub&mdash;blocks
                <strong>Line of Sight</strong>, unless it only partly obscures what stands behind it, as sparse bushes
                or a chain-link fence do. A model showing above such an obstacle can shoot and be shot at, counting
                the obstacle as <a href="/rules/shooting#Cover">Cover</a>.
            </p>
        </li>
        <li>
            <p>
                Any interposing models&mdash;friend or foe&mdash;block <strong>Line of Sight</strong>.
            </p>
        </li>
    </ol>
</section>`,
};

export const TEXT_BLOCK: Stored = {
  source: "rules · Characteristics",
  html: `<h3 id="Numerical_Characteristics">Numerical Characteristics</h3>
<p>
    In Warhammer 40,000 there are many different types of troops, from normal humans to gene enhanced Space Marines, and from haughty but human-like Eldar to the eldritch horror of the Tyranids. To represent this, nearly every model in the game has a set of numerical characteristics.
</p>
<section class="text-block">
  <h4 id="Movement">Movement (M)</h4>
  <p>
  The number of inches a model can move on the tabletop under normal circumstances.
  </p>
</section>`,
};

export const WARBIKE: {
  source: string;
  factionSlug: string;
  unitName: string;
  unitTypeName: string;
  datafax: DatafaxData;
} = {
  source: "datafaxes · Orks · Warbike",
  factionSlug: "orks",
  unitName: "Warbike",
  unitTypeName: "Vehicle",
  datafax: {
    speed_slow: 8,
    speed_combat: 12,
    speed_fast: 30,
    ram_strength: 5,
    ram_damage: "D4",
    ram_save_modifier: -2,
    crew: 1,
    transport_capacity: null,
    capacity_inside: null,
    capacity_roof: null,
    open_topped: false,
    large_target: false,
    deployment: null,
    location_dice: "D6",
    note: "No weapon on this card carries a Targeter.",
    motive_types: { name: "Bikes & Trikes" },
    datafax_images: [],
    datafax_weapons: [
      {
        id: 78,
        mount: null,
        firing_arc_degrees: 90,
        arc_note: "to the front",
        linked_group: 1,
        quantity: 2,
        alternative: 0,
        optional: false,
        points: null,
        weapons: {
          name: "Autocannon",
          weapon_profiles: [
            {
              name: null,
              short_range: "0-20",
              long_range: "20-72",
              short_to_hit: "–",
              long_to_hit: "–",
              strength: "8",
              damage: "D6",
              save_modifier: "-3",
              armour_penetration: "2D6+8",
              weapon_special_rules: [
                { name: "Sustained Fire 1", bearer: null },
                { name: "Move or Fire", bearer: "Infantry" },
              ],
            },
          ],
        },
      },
    ],
    datafax_locations: [
      {
        id: 75,
        roll_min: 1,
        roll_max: 2,
        name: "Ork Rider",
        armour_front: null,
        armour_side_rear: null,
        damage_chart_id: null,
        note: 'The rider is hit under the ordinary shooting rules, with <a href="/rules/general-rules#Toughness">Toughness</a> 4, one <a href="/rules/general-rules#Wounds">Wound</a> and <a href="/wargear/armour#Flak_Armour">Flak Armour</a> giving a 6+ save. A dead rider leaves the Warbike <a href="/rules/vehicle-rules#Out_of_Control">Out of Control</a> until it meets terrain it cannot cross, another vehicle, a building or the table edge.',
      },
      {
        id: 76,
        roll_min: 3,
        roll_max: 6,
        name: "Bike",
        armour_front: 10,
        armour_side_rear: 12,
        damage_chart_id: 61,
        note: null,
      },
    ],
    damage_charts: [
      {
        id: 61,
        name: "Bike",
        dice: "D6",
        note: null,
        damage_chart_results: [
          {
            id: 232,
            roll_min: 1,
            roll_max: 1,
            effect:
              "<p>Both Autocannons are wrecked and cannot be fired again.</p>",
          },
          {
            id: 233,
            roll_min: 2,
            roll_max: 2,
            effect:
              "<p>The tracks are damaged. From here on the Warbike is held to its <strong>Slow</strong> rate.</p>",
          },
          {
            id: 234,
            roll_min: 3,
            roll_max: 3,
            effect:
              '<p>The controls are damaged. From now on the bike must pass a D6 roll of 4+ in each of its movement phases: on a success the rider holds it steady and moves normally, otherwise it goes <a href="/rules/vehicle-rules#Out_of_Control">Out of Control</a> for that turn.</p>',
          },
          {
            id: 235,
            roll_min: 4,
            roll_max: 4,
            effect:
              '<p>The front wheel is torn away and the bike flips, killing the rider. The wreck lands D6&quot; off in a random direction; anything beneath it takes D3 hits at <a href="/rules/general-rules#Strength">Strength</a> 6, saving at -2.</p>',
          },
          {
            id: 236,
            roll_min: 5,
            roll_max: 5,
            effect:
              '<p>The engine bursts and the rider dies with it. The wreck runs <a href="/rules/vehicle-rules#Out_of_Control">Out of Control</a> for a turn before stopping for good.</p>',
          },
          {
            id: 237,
            roll_min: 6,
            roll_max: 6,
            effect:
              '<p>The fuel catches and the rider burns. The wreck runs <a href="/rules/vehicle-rules#Out_of_Control">Out of Control</a> next turn and then blows up, dealing D3 <a href="/rules/general-rules#Strength">Strength</a> 8 hits at -3 to every model within 3&quot;.</p>',
          },
        ],
      },
    ],
  },
};

export const ROUGH_RIDERS: {
  source: string;
  rulesSlug: string;
  rows: CharacteristicRow[];
  unit: EquipmentUnit;
} = {
  source:
    "army_list_entries · Codex Army Lists: Imperial Guard · Squads · Rough Rider Squad",
  rulesSlug: "imperial-guard-rules",
  rows: [
    {
      id: 49,
      name: "Rough Rider",
      alternative: 0,
      count: "5",
      note: null,
      cost: null,
      m: "4",
      ws: "3",
      bs: "3",
      s: "3",
      t: "3",
      w: "1",
      i: "3",
      a: "1",
      ld: "7",
    },
    {
      id: 50,
      name: "Horse",
      alternative: 0,
      count: "5",
      note: null,
      cost: null,
      m: "8",
      ws: "3",
      bs: "0",
      s: "3",
      t: "3",
      w: "1",
      i: "3",
      a: "1",
      ld: "5",
    },
  ],
  unit: {
    name: "Rough Rider Squad",
    unit_profiles: [
      {
        id: 49,
        name: "Rough Rider",
        models_max: 5,
        unit_profile_weapons: [
          {
            id: 118,
            quantity: 1,
            alternative: 0,
            position: 0,
            weapons: { name: "Hunting Lance" },
          },
          {
            id: 117,
            quantity: 1,
            alternative: 0,
            position: 1,
            weapons: { name: "Laspistol" },
          },
          {
            id: 116,
            quantity: 1,
            alternative: 0,
            position: 2,
            weapons: { name: "Chainsword" },
          },
          {
            id: 115,
            quantity: 1,
            alternative: 0,
            position: 3,
            weapons: { name: "Frag Grenade" },
          },
        ],
        unit_profile_armour: [
          {
            armour_id: 2,
            position: 0,
            alternative: 0,
            save_override: null,
            armour: { name: "Flak Armour" },
          },
        ],
        unit_profile_wargear_cards: [],
      },
      {
        id: 50,
        name: "Horse",
        models_max: 5,
        unit_profile_weapons: [],
        unit_profile_armour: [],
        unit_profile_wargear_cards: [],
      },
    ],
    unit_options: [
      {
        id: 75,
        option_group: "wargear",
        alternative: 0,
        optional: true,
        models_min: null,
        models_max: 1,
        models_per: null,
        whole_unit: false,
        quantity: 1,
        grant_mode: "add",
        restriction: null,
        note: null,
        profile: { name: "Rough Rider" },
        upgrade: null,
        replaces: null,
        grants: null,
        grants_armour: null,
        replaces_armour: null,
        card: null,
        unit_option_categories: [
          {
            position: 0,
            wargear_categories: {
              category: "Special Weapons",
              wargear_items: [
                { special_rule_id: null },
                { special_rule_id: null },
                { special_rule_id: null },
                { special_rule_id: null },
              ],
            },
          },
        ],
      },
      {
        id: 59,
        option_group: "special",
        alternative: 0,
        optional: false,
        models_min: null,
        models_max: null,
        models_per: null,
        whole_unit: true,
        quantity: 1,
        grant_mode: null,
        restriction: null,
        note: 'The squad has a 5+ <a href="/rules/weapon-rules#Armour_Saves">Armour Save</a> while mounted.',
        profile: null,
        upgrade: null,
        replaces: null,
        grants: null,
        grants_armour: null,
        replaces_armour: null,
        card: null,
        unit_option_categories: [],
      },
    ],
    unit_special_rule_assignments: [
      {
        position: 1,
        note: null,
        unit_profile_id: null,
        rule: {
          id: 9,
          name: "Dispersed Formation",
          rule: null,
          rule_id: 9,
          anchor: "Dispersed_Formation",
          wargear_items: [],
          rules: {
            id: 9,
            name: "Squad Coherency",
            rule_categories: { slug: "general-rules" },
          },
        },
      },
    ],
  },
};

export const IMPERIAL_GUARD_SUMMARY: {
  source: string;
  bands: CompositionBand[];
  allies: AllyLink[];
  strategyRating: number;
} = {
  source: "army_lists · Codex: Imperial Guard",
  bands: [
    { category: "Command", min: null, max: 50 },
    { category: "Battle Line", min: 25, max: null },
    { category: "Support", min: null, max: 25 },
  ],
  allies: [
    {
      id: 21,
      name: "Space Marines",
      href: "/factions/space-marines",
      note: "Space Wolves, Ultramarines and Angels of Death all qualify.",
    },
    {
      id: 22,
      name: "Imperial Agents",
      href: "/factions/imperial-agents",
      note: null,
    },
    { id: 23, name: "Eldar", href: "/factions/eldar", note: "No Avatar." },
    { id: 24, name: "Squats", href: "/factions/squats", note: null },
  ],
  strategyRating: 2,
};

export const GRENADE_LAUNCHER: {
  source: string;
  name: string;
  profiles: Omit<WeaponProfileRow, "weapon_special_rules">[];
  specials: string[];
} = {
  source: "weapons · Grenade Launcher",
  name: "Grenade Launcher",
  profiles: [
    {
      name: "Frag",
      short_range: "0-20",
      long_range: "20-60",
      short_to_hit: "–",
      long_to_hit: "-1",
      strength: "3",
      damage: "1",
      save_modifier: "-1",
      armour_penetration: "D6+3",
    },
    {
      name: "Krak",
      short_range: "0-20",
      long_range: "20-60",
      short_to_hit: "–",
      long_to_hit: "-1",
      strength: "6",
      damage: "D6",
      save_modifier: "-3",
      armour_penetration: "2D6+6",
    },
  ],
  specials: ['Blast 2"'],
};

export const BLAST_2: {
  source: string;
  name: string;
  html: string;
  related: { name: string; href: string };
} = {
  source: 'weapon_special_rules · Blast 2"',
  name: 'Blast 2"',
  html: "<p>This weapon has a <strong>Blast</strong> area of 2&quot;.</p>",
  related: { name: "Blast Weapons", href: "/rules/weapon-rules#Blast_Weapons" },
};

export const PSYCANNON: { source: string; card: CardFaceData } = {
  source: "wargear_cards · Psycannon",
  card: {
    name: "Psycannon",
    points: "30 Points",
    rarity: "Rare",
    restriction: null,
    discard_after_use: false,
    description: null,
    availabilities: [{ name: "Imperium", position: 1 }],
    weapons: [
      {
        name: "Psycannon",
        weapon_categories: { name: "Basic" },
        profile_description: `<p>
    The psycannon exists to hurt <a href="/rules/general-rules#Psykers">Psykers</a> and daemons; its workings come from
    the <a href="/wargear/weapons#Storm_Bolter">Storm Bolter</a>, its bolts steeped in psychic energy.
</p>
<p>
    Its bolts wound a daemon or a <strong>Psyker</strong> without a roll, and a daemon gets no saving throw at all. Any
    <strong>Psyker</strong> or daemon it damages loses one <a href="/rules/psychic">Psychic Power</a>, chosen at random,
    for the rest of the battle.
</p>`,
        weapon_profiles: [
          {
            name: null,
            short_range: "0-8",
            long_range: "8-16",
            short_to_hit: "+2",
            long_to_hit: "+1",
            strength: "4",
            damage: "1",
            save_modifier: "-2",
            armour_penetration: "D6+4",
            weapon_special_rules: [{ name: "Sustained Fire 1", bearer: null }],
          },
        ],
      },
    ],
    armour: [],
  },
};

export const HUNTER_KILLER_MISSILE: { source: string; card: CardFaceData } = {
  source: "vehicle_cards · Hunter-Killer Missile, as drafted 8 October 2026",
  card: {
    name: "Hunter-Killer Missile",
    points: "30 Points",
    restriction: "Imperial vehicles only",
    discard_after_use: true,
    description: `<p>
    Any vehicle may take this card except a <a href="/rules/vehicle-rules#Bikes_and_Trikes">Bike</a>, a <a href="/rules/vehicle-rules#Skimmers">Skimmer</a> or a <a href="/rules/vehicle-rules#Dreadnoughts_and_War_Walkers">Dreadnought</a>.
</p>
<p>
    A single missile meant for heavily armoured targets. A robot brain steers it on to its mark, so it needs no one aboard to launch it.
</p>`,
    availabilities: [{ name: "Imperium", position: 1 }],
    weapons: [
      {
        name: "Hunter-Killer Missile",
        weapon_categories: { name: "Support" },
        profile_description: `<p>
    One shot only. The missile may be fired only at a vehicle, a <a href="/rules/vehicle-rules#Dreadnoughts_and_War_Walkers">Dreadnought</a>, a <a href="/rules/buildings-fortifications#Buildings">Building</a> or a similar target, and needs no crew member to fire it. It hits on a D6 roll of 3+ whatever the range, and no <a href="/rules/shooting#Basic_To_Hit_Modifiers">To Hit Modifier</a> applies to it, whether for size, speed, cover or anything else.
</p>`,
        weapon_profiles: [
          {
            name: null,
            short_range: "*",
            long_range: "*",
            short_to_hit: "*",
            long_to_hit: "*",
            strength: "8",
            damage: "2D10",
            save_modifier: "-6",
            armour_penetration: "D6+2D10+8",
            weapon_special_rules: [],
          },
        ],
      },
    ],
  },
};

export const BUNKER_ASSAULT: {
  source: string;
  name: string;
  description: string;
  objectives: { heading: string; html: string }[];
} = {
  source: "mission_cards · Bunker Assault",
  name: "Bunker Assault",
  description:
    "Patrols have found a cluster of bunkers a short way inside enemy lines. Whoever holds them holds the sector.",
  objectives: [
    {
      heading: "Primary Objective",
      html: "<p>\nOrders are to raid the sector and take the enemy bunkers.\n</p>\n<p>\n<strong>Each bunker holding at least one friendly model and no enemy models: +5 Victory Points</strong>\n</p>",
    },
    {
      heading: "Secondary Objective",
      html: "<p>\nA bunker that cannot be taken is to be brought down instead.\n</p>\n<p>\n<strong>For each bunker destroyed: +3 Victory Points</strong>\n</p>",
    },
    {
      heading: "Special Rules",
      html: "<p>\nWhere either side has taken Bunker Assault, the game runs to 6 turns.\n</p>",
    },
  ],
};

export const STRATEGY_DECKS: {
  source: string;
  cards: { origin: string; names: string[] }[];
} = {
  source: "strategy_cards · 26 cards from 2 origins",
  cards: [
    {
      origin: "Dark Millennium",
      names: [
        "Ambush!",
        "Barrage",
        "Booby Traps",
        "Brilliant Strategy",
        "Crack Shot",
        "Craven Cowardice",
        "Delayed",
        "Divine Inspiration",
        "Flank March",
        "Forced March",
        "Insane Courage",
        "Look Out Sir—Aaargh!",
        "Malfunction",
        "Reinforcements",
        "Saved!",
        "Special Issue",
        "Traitor",
        "Virus Outbreak",
      ],
    },
    {
      origin: "White Dwarf 205",
      names: [
        "Bombing Run",
        "Covering Fire",
        "Last Gasp",
        "Minefield",
        "Sabotage",
        "Strafing Run",
        "Surprise Assault",
        "Ultimate Sacrifice",
      ],
    },
  ],
};

export const RULES_CONTENTS: {
  source: string;
  sections: {
    name: string;
    note: string;
    chapters: {
      number: number;
      title: string;
      slug: string;
      entries: string[];
    }[];
  }[];
} = {
  source: "rule_sections · rule_categories · rules",
  sections: [
    {
      name: "Before the Game",
      note: "Chapters 1–2",
      chapters: [
        {
          number: 1,
          title: "The Golden Rule",
          slug: "the-golden-rule",
          entries: ["Remember..."],
        },
        {
          number: 2,
          title: "How to Play",
          slug: "how-to-play",
          entries: ["Introduction", "The Game Steps"],
        },
      ],
    },
    {
      name: "The Turn Sequence",
      note: "Chapters 3–7",
      chapters: [],
    },
  ],
};

export const ORKS_BAND: {
  source: string;
  title: string;
  eyebrow: string;
  image: Image;
} = {
  source: "factions · Orks, as /datafaxes/orks shows it",
  title: "Orks",
  eyebrow: "Datafaxes",
  image: {
    src: "images/2nd-Edition-Ork-Codex.jpg",
    title: "Codex Orks",
    artist: "Mark Gibbons",
    dimensions: { width: 1168, height: 1609 },
  },
};
