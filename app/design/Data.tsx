import { DualScheme, Entry, Fixture, Group } from "./Shared";
import {
  NARROW_TABLE,
  PAIRS_CHART,
  PROFILE_CHART,
  RANGE_CHART,
  WIDE_TABLE,
} from "./fixtures";

const ROWS = ["Boltgun", "Bolt Pistol", "Chainsword", "Power Fist"];

export const Data: React.FC = (): React.JSX.Element => (
  <Group id="Data" title="Data">
    <Entry
      title="Striped rows"
      source="--stripe at 80%"
      note="--stripe is one definition of the zebra, mixed from the two scheme variables and declared in each. Rows carry it at 80%, so a frozen first column veils what scrolls under it; the alpha composites over --background, not black."
    >
      <DualScheme>
        <div className="flex flex-col bg-background border-4 border-black">
          {ROWS.map((name) => (
            <div
              key={name}
              className="p-2 bg-background/80 even:bg-(--stripe)/80 text-lg font-semibold"
            >
              {name}
            </div>
          ))}
        </div>
      </DualScheme>
    </Entry>

    <Entry
      title="Table, three columns or fewer"
      source=".dynamic-content .table-container &middot; max-width 36rem"
      note="The table sits on black, so the 4px collapsed borders are the gaps between cells. Headers are subtitle at 14px in white; cells are block at 18px, weight 600. A cell marked .empty goes transparent. Footnote markers run dagger, double dagger, section."
    >
      <Fixture html={NARROW_TABLE} />
    </Entry>

    <Entry
      title="Table, wider than three columns"
      source=".dynamic-content .table-container &middot; no max-width"
      note="The 36rem cap is dropped above three columns; it would crush a twelve-column chart. The container scrolls sideways rather than reflowing, and print lets it run. This one carries the site's only .text-vertical."
    >
      <Fixture html={WIDE_TABLE} />
    </Entry>

    <Entry
      title="Chart"
      source=".dynamic-content .chart &middot; 6 columns"
      note="A chart is a six-column grid, not a table. The heading is a black band; each cell draws its own bottom rule, so the frame omits one. It never scrolls. A chart title always carries the word Chart, and gains (D6) where a D6 resolves it."
    >
      <Fixture html={RANGE_CHART} />
    </Entry>

    <Entry
      title="Chart on a card face"
      source="Markup 7 &middot; two cases"
      note="A card renders at about half page width, so the constraint is width per cell. Label and value pairs run down at span 3 and span 3. A characteristics profile runs across at nine columns, its grid overridden inline and its padding reduced per cell."
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 border-4 border-black bg-2ed-dark-blue">
          <div className="p-3 bg-card-face text-2ed-black">
            <Fixture html={PAIRS_CHART} />
          </div>
        </div>
        <div className="p-4 border-4 border-black bg-2ed-dark-blue">
          <div className="p-3 bg-card-face text-2ed-black">
            <Fixture html={PROFILE_CHART} />
          </div>
        </div>
      </div>
    </Entry>
  </Group>
);
