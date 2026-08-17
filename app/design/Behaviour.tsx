import { Entry, Group } from "./Shared";
import { Chip } from "@/components/Chip";

const HIGHLIGHT_ROWS = [
  ["1&ndash;3", "Shaken"],
  ["4&ndash;5", "Stunned"],
  ["6", "Destroyed"],
];

const RULES = [
  "Rows opt in with data-search; every term must match. Hiding uses the hidden attribute rather than a class, so layout is unchanged.",
  "A matched row pulls in others through data-refs, so a weapon keeps the special rule it cites.",
  "A group with no visible row hides itself; an empty-state element shows when nothing matches.",
  "Each pass fires 2ed:filter, which is how the JumpBar strikes through sections no longer on the page.",
  "Slash focuses the field, Escape clears it. A link to a filtered-out row clears the query first.",
];

const PRINT = [
  "Paper is light whatever scheme the reader is in: all five scheme variables reset to their light values.",
  "Pale text takes ink unconditionally, so an unknown surface still prints legibly.",
  "Dark surfaces drop their background for anyone printing backgrounds. An hr is excluded; its rule is its background.",
  "Sticky becomes static, sideways-scrolling tables run full width, and shadows go.",
  "The TopNav and every JumpBar are dropped.",
  "Charts, table rows and articles avoid breaking across pages.",
];

const ACCESS = [
  "44px minimum touch target, met three ways: the burger and BackToTop are 44px square, JumpBar rows are 52px, and a Chip stays 20px but grows a transparent ::after to 36px.",
  "A skip link is first in the body: off-screen until focused, then yellow on black at the top left. BackToTop returns focus to it.",
  "Location is announced rather than only coloured: aria-current=&quot;page&quot; on the nav item and last breadcrumb, aria-current=&quot;true&quot; on an active chip and on a section ancestor.",
  "The filter count is aria-live=&quot;polite&quot;, so the result of typing is announced.",
  "Every nav carries a label, icon-only controls carry sr-only text, and the Logo fins are aria-hidden.",
  "Smooth scrolling only under prefers-reduced-motion: no-preference.",
];

const List: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="flex flex-col gap-4 pl-4 list-disc text-lg">
    {items.map((item) => (
      <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
    ))}
  </ul>
);

export const Behaviour: React.FC = (): React.JSX.Element => (
  <Group id="Behaviour" title="Behaviour">
    <Entry
      title="Anchors and highlighting"
      source="lib/anchors.ts &middot; Highlighter.tsx"
      note="Anchor ids are generated from the rule name, so a link survives reordering but not renaming. Landing on one repaints its striped rows while the hash matches. Every :target and focus-visible element scroll-margins by --jump-offset, so the sticky bar never covers the target. A repeat click on the same hash does nothing, so chips inside content are HighlighterLinks."
    >
      <div className="flex flex-wrap gap-x-1 gap-y-4">
        <Chip href="#Highlight_Demo">Jump to the chart below</Chip>
      </div>
      <div id="Highlight_Demo" className="highlight-target">
        <div className="dynamic-content">
          <section className="table-container" style={{ maxWidth: "36rem" }}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Roll</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {HIGHLIGHT_ROWS.map(([roll, result]) => (
                  <tr key={result}>
                    <td dangerouslySetInnerHTML={{ __html: roll }} />
                    <td>{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </Entry>

    <Entry
      title="Filtering rows"
      source="components/RowFilter.tsx"
      note="Prose only: the filter acts on a page of real rows, and a specimen with nothing to hide would misrepresent it. Its input is the FilterField above."
    >
      <List items={RULES} />
    </Entry>

    <Entry
      id="Print"
      title="Print"
      source="globals.css @media print"
      note="Without the print block, sticky bars stamp across page one and appear nowhere else. Browsers also drop background colours, so a black-backed block prints white text onto nothing. Below is a chart heading as it would print without it."
    >
      <div className="flex flex-col gap-2">
        <div className="p-2 bg-white border-4 border-black">
          <div className="p-2 font-subtitle text-sm text-white">
            Range Chart
          </div>
        </div>
        <p className="text-lg">
          White text, background dropped, nothing printed. The block exists so
          that this cannot happen.
        </p>
      </div>
      <List items={PRINT} />
    </Entry>

    <Entry
      id="Accessibility"
      title="Accessibility"
      source="rules the components hold to"
    >
      <List items={ACCESS} />
    </Entry>
  </Group>
);
