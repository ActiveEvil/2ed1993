import { Contrast } from "./Contrast";
import { DualScheme, Entry, Group, LABEL } from "./Shared";
import { CHIP_CLASS } from "@/components/Chip";
import { clsx } from "clsx";

const SCHEME_TOKENS = [
  {
    name: "--background",
    className: "bg-background",
    use: "Page, panels and odd table rows.",
  },
  {
    name: "--foreground",
    className: "bg-foreground",
    use: "Body ink, and the Chip border.",
  },
  {
    name: "--house-rule-accent",
    className: "bg-accent",
    use: "The house-rule bar and its label.",
  },
  {
    name: "--card-face",
    className: "bg-card-face",
    use: "Printed card stock. Dims in dark rather than following the scheme.",
  },
  {
    name: "--stripe",
    style: { backgroundColor: "var(--stripe)" },
    use: "85% background, 15% foreground, in oklab. Declared in every scheme block; on :root alone a nested theme cannot change it.",
  },
  {
    name: "--leader-ink",
    style: { backgroundColor: "var(--leader-ink)" },
    use: "55% foreground, 45% background, in oklab. The dotted leader that carries an army-list entry across to its points.",
  },
  {
    name: "--group-surface",
    style: { backgroundColor: "var(--group-surface)" },
    use: "92% background, 8% foreground, in oklab. The band that holds a note and the run of army-list entries it governs. Lighter than the zebra on purpose: at the zebra's 85% the leader dots fall under 3:1 in light.",
  },
];

const PALETTE = [
  {
    name: "2ed-black",
    hex: "#2d2d2d",
    className: "bg-2ed-black",
    use: "Body ink in light, page in dark. Not the pure black the borders use.",
  },
  {
    name: "2ed-white",
    hex: "#fafafa",
    className: "bg-2ed-white",
    use: "Page in light, ink in dark. The filter input keeps it in both.",
  },
  {
    name: "2ed-light-yellow",
    hex: "#fff20b",
    className: "bg-2ed-light-yellow",
    use: "Interaction: active chips, hover, BackToTop, section notes, current nav item, highlighted rows, skip link.",
  },
  {
    name: "2ed-dark-yellow",
    hex: "#fda82e",
    className: "bg-2ed-dark-yellow",
    use: "Logo only: the lettering, and its inset and outset borders.",
  },
  {
    name: "2ed-dark-red",
    hex: "#ea2323",
    className: "bg-2ed-dark-red",
    use: "Headings on a card face, and the Logo subtitle.",
  },
  {
    name: "2ed-light-red",
    hex: "#ea7c7c",
    className: "bg-2ed-light-red",
    use: "No use in the app or in stored content.",
  },
  {
    name: "2ed-dark-blue",
    hex: "#005097",
    className: "bg-2ed-dark-blue",
    use: "Card frames in the decks.",
  },
  {
    name: "2ed-mid-blue",
    hex: "#008cc1",
    className: "bg-2ed-mid-blue",
    use: "IndexCard summary rule, and the light-scheme house-rule accent.",
  },
  {
    name: "2ed-light-blue",
    hex: "#6dcef7",
    className: "bg-2ed-light-blue",
    use: "Image credit captions, and the dark-scheme house-rule accent.",
  },
  {
    name: "2ed-light-green",
    hex: "#c2dfcf",
    className: "bg-2ed-light-green",
    use: "The blockquote container in dynamic content.",
  },
  {
    name: "2ed-dark-green",
    hex: "#00a800",
    className: "bg-2ed-dark-green",
    use: "No use, though the print block still names it.",
  },
];

const SCALE = [
  ["xs / 12px", "Credit captions, footer, chips, the house-rule label"],
  ["sm / 14px", "SectionBar, JumpBar chips, table headers, card summaries"],
  ["base / 16px", "Document default"],
  ["lg / 18px", "Rules body copy, list items, table and chart cells"],
  ["xl / 20px", "h4 in dynamic content, nav items"],
  ["2xl / 24px", "h3 in dynamic content, card titles"],
  ["3xl / 30px", "Rule section headings"],
  ["4xl md:5xl", "Page titles"],
];

const SPACING = [
  ["gap-2 / 8px", "Label to control, chip rows, card internals"],
  ["gap-3 / 12px", "Swatch to name, JumpBar eyebrow"],
  ["gap-4 / 16px", "The default: grids, panel padding, page padding"],
  ["gap-8 / 32px", "Between sections, and panel padding from md up"],
  ["gap-12 / 48px", "Between sections on wide screens"],
];

const Swatch: React.FC<{
  name: string;
  hex?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ name, hex, className, style, children }) => (
  <li className="flex items-start gap-3">
    <span
      className={clsx("shrink-0 size-8 border-2 border-black", className)}
      style={style}
    />
    <span className="flex flex-col">
      <code className="font-subtitle text-xs">
        {name}
        {hex && <> &middot; {hex}</>}
      </code>
      <small className="opacity-80">{children}</small>
    </span>
  </li>
);

const Rows: React.FC<{ rows: string[][]; head: string[] }> = ({
  rows,
  head,
}) => (
  <div className="dynamic-content">
    <section className="table-container" style={{ maxWidth: "36rem" }}>
      <table>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col" style={{ textAlign: "left" }}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([left, right]) => (
            <tr key={left}>
              <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>
                {left}
              </td>
              <td style={{ textAlign: "left" }}>{right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  </div>
);

export const Foundations: React.FC = (): React.JSX.Element => (
  <Group id="Foundations" title="Foundations">
    <Entry
      title="Scheme tokens"
      source="globals.css &middot; 7 variables"
      note="The seven variables that change between schemes; the rest of the palette is fixed. A page follows the OS unless a [data-theme] ancestor overrides it."
    >
      <DualScheme>
        <ul className="flex flex-col gap-3">
          {SCHEME_TOKENS.map(({ name, className, style, use }) => (
            <Swatch key={name} name={name} className={className} style={style}>
              {use}
            </Swatch>
          ))}
        </ul>
      </DualScheme>
    </Entry>

    <Entry
      id="Palette"
      title="Fixed palette"
      source="globals.css &middot; 11 colours"
      note="The 2ed1993 ink set. None of these respond to the scheme."
    >
      <ul className="grid md:grid-cols-2 gap-3">
        {PALETTE.map(({ name, hex, className, use }) => (
          <Swatch key={name} name={name} hex={hex} className={className}>
            {use}
          </Swatch>
        ))}
      </ul>
    </Entry>

    <Entry
      id="Contrast"
      title="Ink pairs"
      source="computed from the live variables"
      note="Measured in the browser from the resolved properties rather than a table of hexes, so it cannot drift from globals.css. AA wants 4.5:1 for body text, 3:1 at 24px or at 18.66px bold, and 3:1 for a non-text mark that carries meaning."
    >
      <Contrast />
    </Entry>

    <Entry
      id="Type"
      title="Type"
      source="layout.tsx &middot; 3 roles"
      note="font-block is the document default, set once on the body. The other two are named where they are wanted."
    >
      <ul className="flex flex-col gap-4">
        <li className="flex flex-col gap-1">
          <span className={LABEL}>font-title &middot; Merriweather 900</span>
          <span className="font-title text-3xl uppercase tracking-wide">
            The Shooting Phase
          </span>
          <small className="opacity-80">
            Page and section headings, the Logo, the footer. Always uppercase
            and tracked out.
          </small>
        </li>
        <li className="flex flex-col gap-1">
          <span className={LABEL}>
            font-subtitle &middot; IBM Plex Sans 700
          </span>
          <span className="font-subtitle text-2xl">Sustained Fire</span>
          <small className="opacity-80">
            Furniture: bars, chips, card titles, nav, labels, table headers, and
            h3 and h4 in dynamic content.
          </small>
        </li>
        <li className="flex flex-col gap-1">
          <span className={LABEL}>
            font-block &middot; Crimson Text 400 / 600 / 700
          </span>
          <span className="text-lg">
            A model may fire its weapon at any target it can see, provided the
            target lies within its firing arc.
          </span>
          <small className="opacity-80">
            Rules text. 600 carries table and chart cells; 700 carries emphasis
            in a paragraph.
          </small>
        </li>
      </ul>
      <Rows head={["Step", "In use for"]} rows={SCALE} />
    </Entry>

    <Entry
      id="Frame_and_Space"
      title="Frame and space"
      source="conventions"
      note="Content stops at max-w-5xl; the page pads 8px, 16px from md. A bar that reaches the edge uses self-stretch -mx-2 md:-mx-4, not a width calculation."
    >
      <ul className="flex flex-col gap-3">
        <li className="flex items-center gap-3">
          <span className="shrink-0 size-8 border-4 border-black" />
          <span className="flex flex-col">
            <code className="font-subtitle text-xs">border-4 border-black</code>
            <small className="opacity-80">
              The house frame: panels, images, tables, charts, card frames.
              Black in both schemes, never a token.
            </small>
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className={CHIP_CLASS}>border-2 border-foreground</span>
          <small className="opacity-80">
            Chips only, and the one exception to black.
          </small>
        </li>
        <li className="flex items-center gap-3">
          <span className="shrink-0 pl-3 border-l-8 border-2ed-mid-blue text-sm italic">
            border-l-8
          </span>
          <small className="opacity-80">
            An aside: house rules, and IndexCard summaries.
          </small>
        </li>
        <li className="flex items-center gap-3">
          <span className="shrink-0 size-8 border-4 border-black shadow-lg" />
          <span className="flex flex-col">
            <code className="font-subtitle text-xs">shadow-lg</code>
            <small className="opacity-80">
              Every Panel and image. Print drops it.
            </small>
          </span>
        </li>
      </ul>
      <Rows head={["Step", "Between"]} rows={SPACING} />
    </Entry>
  </Group>
);
