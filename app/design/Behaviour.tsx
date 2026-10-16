import { Entry, Fixture, Group, LABEL, Source } from "./Shared";
import { NARROW_TABLE } from "./fixtures";
import { Chip } from "@/components/Chip";

const FILTERING = [
  "Rows opt in with data-search; every term must match. Hiding sets the hidden attribute, so layout is unchanged.",
  "A matched row pulls in others through data-refs, so a weapon keeps the special rule it cites.",
  "A group with no visible row hides itself; the data-empty note, light green, shows when nothing matches.",
  "The count reads the total until a term is set, then n of total.",
  "Each pass fires 2ed:filter; the Jump bar listens and strikes through emptied sections.",
  "Slash focuses the field, opening the mobile Jump bar if it is closed; Escape clears it. A link to a filtered-out row clears the query first.",
];

const PRINT = [
  "All nine scheme variables reset to light, whatever the reader's scheme.",
  "Pale text takes ink unconditionally, so an unknown surface still prints legibly.",
  "Dark surfaces drop their background for anyone printing backgrounds. An hr is excluded; its rule is its background.",
  "Sticky becomes static, sideways-scrolling tables run full width, and shadows go.",
  "The TopNav, every JumpBar, the randomisers, BackToTop and the lightbox are dropped.",
  "Charts, table rows and articles avoid breaking across pages.",
];

const ACCESS = [
  "44px touch targets on the controls: the burger, BackToTop, the Jump toggle and its rows, the filter input, Draw, the colour scheme buttons and the lightbox controls. A Chip stays 20px and grows a transparent ::after to 36px.",
  "Two ways past the header. The skip link, first stop on every page and hidden until focused, goes to main, which carries id=&quot;main&quot;. One h1 at the start of main and no skipped levels, checked by scripts/verify/headings.py. BackToTop returns focus to the skip link.",
  "Location is announced, not only coloured: aria-current=&quot;page&quot; on the nav item and the last breadcrumb, aria-current=&quot;true&quot; on an active Jump item and on a section ancestor in the nav.",
  "The filter count and the lightbox counter are aria-live=&quot;polite&quot;, so the result of typing or stepping is announced.",
  "Every nav carries a label, icon-only controls carry sr-only text, and the Logo fins are aria-hidden.",
  "Smooth scrolling only under prefers-reduced-motion: no-preference.",
];

const List: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="flex flex-col gap-4 max-w-prose pl-4 list-disc text-lg">
    {items.map((item) => (
      <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
    ))}
  </ul>
);

export const Behaviour: React.FC = (): React.JSX.Element => (
  <Group title="Behaviour">
    <Entry
      title="Anchors and highlighting"
      source="lib/anchors.ts &middot; Highlighter.tsx"
      note="Ids come from the rule name through generateAnchorId, so a link survives reordering but not renaming. Landing on one paints its striped rows light yellow while the hash matches. :target and focus-visible elements scroll-margin by --jump-offset, so the sticky bar never covers them. A repeat click on the same hash does nothing, so chips in content are HighlighterLinks, and a page with targets mounts a Highlighter that re-applies the hash once loaded."
    >
      <div className="flex flex-wrap gap-x-1 gap-y-4">
        <Chip href="#Highlight_Demo">Jump to the table below</Chip>
      </div>
      <Source>{NARROW_TABLE.source}</Source>
      <div id="Highlight_Demo" className="highlight-target">
        <Fixture html={NARROW_TABLE.html} />
      </div>
    </Entry>

    <Entry
      title="Filtering rows"
      source="components/RowFilter.tsx &middot; FilterField.tsx"
      note="The filter in the JumpBar specimen is live. It acts on the two rows here that carry data-search, the Grenade Launcher strip and the Blast 2&quot; rule; the strip's data-refs keeps the rule visible while the strip is. A term neither carries shows the empty note."
    >
      <List items={FILTERING} />
      <p
        data-empty
        hidden
        className="p-6 border-4 border-frame bg-2ed-light-green text-2ed-black text-lg"
      >
        Nothing matches that filter.
      </p>
    </Entry>

    <Entry
      title="Print"
      source="globals.css @media print"
      note="Without the print block, sticky bars stamp across page one and nowhere else, and browsers drop backgrounds, so a black-backed block prints white text onto nothing. Below is a chart heading printed without it."
    >
      <div className="flex flex-col gap-2">
        <div className="p-2 bg-white border-4 border-frame">
          <div className="p-2 font-subtitle text-sm text-white">
            Range Chart
          </div>
        </div>
        <p className="text-lg">
          White text on a dropped background: nothing prints.
        </p>
      </div>
      <List items={PRINT} />
    </Entry>

    <Entry title="Accessibility" source="rules the components hold to">
      <Source>app/layout.tsx &middot; the skip link, focused</Source>
      <div className="flex">
        <span className="p-2 bg-2ed-light-yellow text-black font-subtitle">
          Skip to content
        </span>
      </div>
      <p className={LABEL}>
        A static copy of its focused state; the live one is the first Tab stop
        on this page.
      </p>
      <List items={ACCESS} />
    </Entry>
  </Group>
);
