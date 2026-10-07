import { DualScheme, Entry, Fixture, Group, Source } from "./Shared";
import {
  GRENADE_LAUNCHER,
  NARROW_TABLE,
  PAIRS_CHART,
  PROFILE_CHART,
  RANGE_CHART,
  WARBIKE,
  WIDE_TABLE,
} from "./fixtures";
import { HighlighterLink } from "@/components/Highlighter";
import { forBearer } from "@/components/WeaponProfile";
import { WeaponStrip, rangedCells } from "@/components/WeaponStrip";
import { generateAnchorId } from "@/lib/anchors";
import Link from "next/link";
import { Fragment } from "react";

const ROWS = ["Boltgun", "Bolt Pistol", "Chainsword", "Power Fist"];

const STRIP_ID = generateAnchorId(GRENADE_LAUNCHER.name);

const AUTOCANNON = WARBIKE.datafax.datafax_weapons[0].weapons;

export const Data: React.FC = (): React.JSX.Element => (
  <Group title="Data">
    <Entry
      title="Striped rows"
      source="--stripe &middot; --card-stripe"
      note="--stripe is one definition of the zebra, mixed from the two scheme variables and declared in each, so a nested [data-theme] restripes. Page rows alternate --background and --stripe: prose tables, the CharacteristicTable and the LabelledTable. Rows on a card face alternate --card-face and --card-stripe instead, and keep dark ink in both schemes. A targeted row turns light yellow, its even rows at 80%."
    >
      <DualScheme>
        <div className="flex flex-col bg-background border-4 border-frame">
          {ROWS.map((name) => (
            <div
              key={name}
              className="p-2 bg-background even:bg-stripe text-lg font-semibold"
            >
              {name}
            </div>
          ))}
        </div>
      </DualScheme>
    </Entry>

    <Entry
      title="WeaponStrip"
      source="components/WeaponStrip.tsx &middot; name, special, profiles, surface"
      note="A weapon or armour entry outside a table: a black name bar with the special rules right-aligned in white, then label and value cells, one labelled row per profile under a single name bar. From md the cells sit on one line; below md they wrap to three columns, two for the four-cell close-combat and armour strips. The labels are the one abbreviation set: Range, To hit, Str, Dam, Save Mod, AP. On the page surface the strip is ruled in --frame on --background, carries its id, data-search and data-refs, and turns yellow when targeted. On the card surface it is ruled in 2ed-black on --card-face and carries no id, since the artefact is the anchor."
    >
      <Source>{GRENADE_LAUNCHER.source} &middot; page surface</Source>
      <WeaponStrip
        id={STRIP_ID}
        data-search={[
          GRENADE_LAUNCHER.name,
          ...GRENADE_LAUNCHER.profiles.map(({ name }) => name ?? ""),
          ...GRENADE_LAUNCHER.specials,
        ]
          .join(" ")
          .toLowerCase()}
        data-refs={GRENADE_LAUNCHER.specials
          .map((name) => `${generateAnchorId(name)}_Rule`)
          .join(" ")}
        className="target:text-black"
        name={
          <HighlighterLink
            className="hover:underline underline-offset-4"
            href={`/design#${STRIP_ID}`}
          >
            {GRENADE_LAUNCHER.name}
          </HighlighterLink>
        }
        special={GRENADE_LAUNCHER.specials.map((name) => (
          <HighlighterLink
            key={name}
            className="underline underline-offset-4"
            href={`/design#${generateAnchorId(name)}_Rule`}
          >
            {name}
          </HighlighterLink>
        ))}
        profiles={GRENADE_LAUNCHER.profiles.map((profile, index) => ({
          key: index,
          label: profile.name,
          cells: rangedCells(profile),
        }))}
      />
      <Source>{WARBIKE.source} &middot; card surface</Source>
      <div className="p-3 bg-card-face text-2ed-black">
        <WeaponStrip
          as="h4"
          surface="card"
          name={AUTOCANNON.name}
          special={[
            ...new Set(
              AUTOCANNON.weapon_profiles.flatMap((profile) =>
                forBearer(profile.weapon_special_rules, "Vehicle").map(
                  ({ name }) => name,
                ),
              ),
            ),
          ].map((name, index) => (
            <Fragment key={name}>
              {index > 0 && " · "}
              <Link
                className="underline underline-offset-4"
                href={`/wargear/weapons#${generateAnchorId(name)}_Rule`}
              >
                {name}
              </Link>
            </Fragment>
          ))}
          profiles={AUTOCANNON.weapon_profiles.map((profile, index) => ({
            key: index,
            label: null,
            cells: rangedCells(profile),
          }))}
        />
      </div>
    </Entry>

    <Entry
      title="Table, three columns or fewer"
      source=".dynamic-content .table-container &middot; max-width 36rem"
      note="The same look as the CharacteristicTable on an army list: a Plex head at 12px in white on black; cells in Crimson 600 at 16px, 18px from md, padded 4px and 8px across from md, striped --background and --stripe. A row head marked left is the profile name and drops to 14px, 16px from md. A cell marked .empty goes transparent. Footnote markers run dagger, double dagger, section."
    >
      <Source>{NARROW_TABLE.source}</Source>
      <Fixture html={NARROW_TABLE.html} />
    </Entry>

    <Entry
      title="Table, wider than three columns"
      source=".dynamic-content .table-container &middot; no max-width"
      note="The 36rem cap is dropped above three columns; it would crush a twelve-column chart. The container scrolls sideways rather than reflowing, and print lets it run. This one carries the site's only .text-vertical."
    >
      <Source>{WIDE_TABLE.source}</Source>
      <Fixture html={WIDE_TABLE.html} />
    </Entry>

    <Entry
      title="Chart"
      source=".dynamic-content .chart &middot; 6 columns"
      note="A chart is a six-column grid, not a table, and it spans the content column, exempt from the measure. The heading is a black band; each cell draws its own 4px bottom rule in --frame, so the frame omits one. It never scrolls. A chart title always carries the word Chart, and gains (D6) where a D6 resolves it. An h2 takes the same band, for the army composition chart, which heads its own section."
    >
      <Source>{RANGE_CHART.source}</Source>
      <Fixture html={RANGE_CHART.html} measure />
    </Entry>

    <Entry
      title="Chart on a card face"
      source="Markup 7 &middot; two cases"
      note="A card renders at about half page width, so the constraint is width per cell. Label and value pairs run down at span 3 and span 3. A characteristics profile runs across at nine columns, its grid overridden inline and its padding reduced per cell."
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Source>{PAIRS_CHART.source}</Source>
          <div className="p-4 border-4 border-frame bg-2ed-dark-blue">
            <div className="p-3 bg-card-face text-2ed-black">
              <Fixture html={PAIRS_CHART.html} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Source>{PROFILE_CHART.source}</Source>
          <div className="p-4 border-4 border-frame bg-2ed-dark-blue">
            <div className="p-3 bg-card-face text-2ed-black">
              <Fixture html={PROFILE_CHART.html} />
            </div>
          </div>
        </div>
      </div>
    </Entry>
  </Group>
);
