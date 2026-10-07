import { Contrast } from "./Contrast";
import { DualScheme, Entry, Group, LABEL, factionName } from "./Shared";
import { hex, toRgb } from "./luminance";
import { CHIP_CLASS } from "@/components/Chip";
import { deckColors, factionColors, factionInk } from "@/lib/factions";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

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
    use: "The house-rule bar and its label, and the TitleBand eyebrow. Dark blue in light, so the 12px label clears AA; light blue in dark.",
  },
  {
    name: "--card-face",
    className: "bg-card-face",
    use: "Printed card stock. Dims in dark rather than following the scheme.",
  },
  {
    name: "--card-stripe",
    className: "bg-card-stripe",
    use: "93% card face, 7% 2ed-black, in oklab. Even rows on a datafax face and the profile label on a card WeaponStrip. Follows the card face, not the page.",
  },
  {
    name: "--stripe",
    className: "bg-stripe",
    use: "85% background, 15% foreground, in oklab. Declared in every scheme block; on :root alone a nested theme cannot change it.",
  },
  {
    name: "--leader-ink",
    className: "bg-leader-ink",
    use: "55% foreground, 45% background, in oklab. The dotted leader that carries an army-list entry across to its points, and the chapter numbers in a ContentsTable.",
  },
  {
    name: "--group-surface",
    className: "bg-group-surface",
    use: "92% background, 8% foreground, in oklab. The band that holds a note and the run of army-list entries it governs. Lighter than the zebra on purpose: at the zebra's 85% the leader dots fall under 3:1 in light.",
  },
  {
    name: "--frame",
    className: "bg-frame",
    use: "Every 4px frame on a page surface. Black in every scheme block and in print by decision; the token keeps that decision in one place.",
  },
];

const PALETTE = [
  {
    name: "2ed-black",
    className: "bg-2ed-black",
    use: "Body ink in light, page in dark, and the ink on every card face and light-green note. Not the pure black the frames use.",
  },
  {
    name: "2ed-white",
    className: "bg-2ed-white",
    use: "Page in light, ink in dark. Kept in both by the filter input, light ink on a dark mat or the randomiser, and the lightbox counter.",
  },
  {
    name: "2ed-light-yellow",
    className: "bg-2ed-light-yellow",
    use: "Current or selected: the current nav and rail item, the active Jump bar chip, the :target highlight and outline, the filter's focus ring, a checked deck in a randomiser, the logo ground and the selected colour scheme. BackToTop and the mobile Jump toggle keep it by decision. Two printed cues on artefact mats: the mission card name and the wargear card points.",
  },
  {
    name: "2ed-dark-yellow",
    className: "bg-2ed-dark-yellow",
    use: "The Logo lettering and its inset and outset borders, and the frame of a targeted mission card.",
  },
  {
    name: "2ed-dark-red",
    className: "bg-2ed-dark-red",
    use: "Headings and the restriction line on a card face, datafax face headings, the strategy card mat, and the Logo subtitle.",
  },
  {
    name: "2ed-light-red",
    className: "bg-2ed-light-red",
    use: "Reserved, unused.",
  },
  {
    name: "2ed-dark-blue",
    className: "bg-2ed-dark-blue",
    use: "The house-rule accent in light, the mission and wargear card mats, card names on the face, and the randomiser panel.",
  },
  {
    name: "2ed-mid-blue",
    className: "bg-2ed-mid-blue",
    use: "The special warp card mat.",
  },
  {
    name: "2ed-light-blue",
    className: "bg-2ed-light-blue",
    use: "Image credit captions, lightbox controls, and the house-rule accent in dark.",
  },
  {
    name: "2ed-light-green",
    className: "bg-2ed-light-green",
    use: "The blockquote container, and the empty-state note on a filtered page.",
  },
  {
    name: "2ed-dark-green",
    className: "bg-2ed-dark-green",
    use: "Reserved, unused. The print block still names it.",
  },
];

const FACTION_COLOURS = [
  ...new Set([...Object.values(factionColors), ...Object.values(deckColors)]),
].map((className) => {
  const slugs = Object.keys(factionColors).filter(
    (slug) => factionColors[slug] === className,
  );
  const decks = Object.keys(deckColors).filter(
    (deck) => deckColors[deck] === className,
  );
  const uses = [
    slugs.length > 0 && `Datafax mat: ${slugs.map(factionName).join(", ")}.`,
    decks.length > 0 && `Psychic deck mat: ${decks.join(", ")}.`,
  ].filter(Boolean);

  return {
    name: className.replace(/^bg-/, ""),
    className,
    ink: slugs.length > 0 ? factionInk[slugs[0]] : undefined,
    use: uses.join(" "),
  };
});

const SCALE = [
  ["2xs / 8px", "The image credit below 16rem, and nothing else"],
  [
    "xs / 12px",
    "Eyebrows, labels, chips, table heads, image credits, the house-rule label",
  ],
  ["sm / 14px", "SectionBar, Jump bar and rail items, chart headings, footer"],
  ["base / 16px", "Document default, nav items, WeaponStrip values"],
  ["lg / 18px", "Rules body copy, list items, table and chart cells"],
  ["xl / 20px", "h4 in dynamic content, headings on a card face"],
  ["2xl / 24px", "h3 in dynamic content, card names, section headings"],
  ["3xl / 30px", "Section headings from md, page titles below md"],
  ["5xl / 48px", "Page titles from md"],
];

const SPACING = [
  ["gap-2 / 8px", "Label to control, chip rows, card internals"],
  ["gap-3 / 12px", "Swatch to name, a SectionBar to its specimen"],
  ["gap-4 / 16px", "The default: grids, a SectionBar to its grid"],
  ["gap-8 / 32px", "Between entries, and panel padding from md"],
  ["gap-12 / 48px", "Between the sections of an index page"],
];

const Swatch: React.FC<{
  name: string;
  className: string;
  ink?: string;
  children: React.ReactNode;
}> = ({ name, className, ink, children }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const rgb = toRgb(getComputedStyle(ref.current).backgroundColor);
    setValue(rgb ? hex(rgb) : null);
  }, []);

  return (
    <li className="flex items-start gap-3">
      <span
        ref={ref}
        className={clsx(
          "shrink-0 flex justify-center items-center size-8 border-2 border-frame font-subtitle text-sm",
          className,
          ink,
        )}
      >
        {ink && "Aa"}
      </span>
      <span className="flex flex-col">
        <code className="font-subtitle text-xs">
          {name}
          {value && <> &middot; {value}</>}
        </code>
        <small>{children}</small>
      </span>
    </li>
  );
};

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
  <Group title="Foundations">
    <Entry
      title="Scheme tokens"
      source="globals.css &middot; 9 variables"
      note="Declared in all four scheme blocks and in print. Eight change between schemes; --frame is black in every one. A page follows the OS unless a [data-theme] ancestor overrides it. The values beside each swatch are read from the browser."
    >
      <DualScheme>
        <ul className="flex flex-col gap-3">
          {SCHEME_TOKENS.map(({ name, className, use }) => (
            <Swatch key={name} name={name} className={className}>
              {use}
            </Swatch>
          ))}
        </ul>
      </DualScheme>
    </Entry>

    <Entry
      title="Fixed palette"
      source="globals.css &middot; 11 colours"
      note="The 2ed1993 ink set. None of these respond to the scheme. 2ed-light-red and 2ed-dark-green are reserved: declared, shown here, and used nowhere else."
    >
      <ul className="grid md:grid-cols-2 gap-3">
        {PALETTE.map(({ name, className, use }) => (
          <Swatch key={name} name={name} className={className}>
            {use}
          </Swatch>
        ))}
      </ul>
    </Entry>

    <Entry
      title="Faction colours"
      source="globals.css &middot; lib/factions.ts"
      note="The mats of the psychic decks and the datafaxes, fixed in both schemes. Each swatch carries its datafax ink where it has one; a psychic mat holds no text, since the card face sits on it. The uses are read from lib/factions.ts."
    >
      <ul className="grid md:grid-cols-2 gap-3">
        {FACTION_COLOURS.map(({ name, className, ink, use }) => (
          <Swatch key={name} name={name} className={className} ink={ink}>
            {use}
          </Swatch>
        ))}
      </ul>
    </Entry>

    <Entry
      title="Ink pairs"
      source="computed from the live variables"
      note="Measured in the browser from the resolved properties rather than a table of hexes, so it cannot drift from globals.css. AA wants 4.5:1 for body text, 3:1 at 24px or at 18.66px bold, and 3:1 for a non-text mark that carries meaning."
    >
      <Contrast />
    </Entry>

    <Entry
      title="Type"
      source="layout.tsx &middot; 3 roles"
      note="font-block is the document default, set once on the body. The other two are named where they are wanted. Text never goes below text-xs, except the image credit's text-2xs."
    >
      <ul className="flex flex-col gap-4">
        <li className="flex flex-col gap-1">
          <span className={LABEL}>font-title &middot; Merriweather 900</span>
          <span className="font-title text-3xl uppercase tracking-wide">
            Shooting Phase
          </span>
          <small>
            Page titles, section headings, the Logo, the psychic and special
            warp card names, and the chapter numbers in a ContentsTable.
          </small>
        </li>
        <li className="flex flex-col gap-1">
          <span className={LABEL}>
            font-subtitle &middot; IBM Plex Sans 700
          </span>
          <span className="font-subtitle text-2xl">Sustained Fire 1</span>
          <small>
            Furniture: bars, chips, nav, labels, eyebrows, table heads, the
            other card names, and h3 and h4 in dynamic content. Loaded at 700
            only, so hierarchy inside it is size, case and tracking; a weight
            utility on it does nothing.
          </small>
        </li>
        <li className="flex flex-col gap-1">
          <span className={LABEL}>
            font-block &middot; Crimson Text 400 / 600 / 700
          </span>
          <span className="text-lg">
            The number of inches a model can move on the tabletop under normal
            circumstances.
          </span>
          <small>
            Rules text and the footer. 600 carries table and chart cells; 700
            carries emphasis in a paragraph.
          </small>
        </li>
      </ul>
      <Rows head={["Step", "In use for"]} rows={SCALE} />
    </Entry>

    <Entry
      title="Frame and space"
      source="conventions"
      note="Content stops at max-w-5xl, and prose at the 65ch measure; the page pads 8px, 16px from md. A bar that reaches the edge uses self-stretch -mx-2 md:-mx-4, not a width calculation."
    >
      <ul className="flex flex-col gap-3">
        <li className="flex items-center gap-3">
          <span className="shrink-0 size-8 border-4 border-frame" />
          <span className="flex flex-col">
            <code className="font-subtitle text-xs">border-4 border-frame</code>
            <small>
              The house frame: panels, images, tables, charts, card frames.
              Black in both schemes by decision, through --frame.
            </small>
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className={CHIP_CLASS}>border-2 border-foreground</span>
          <small>
            Chips only: a text-coloured outline in both schemes, the one frame
            that is not black.
          </small>
        </li>
        <li className="flex items-center gap-3">
          <span className="shrink-0 pl-3 border-l-8 border-accent text-sm italic">
            border-l-8
          </span>
          <small>The house-rule aside, in the accent.</small>
        </li>
        <li className="flex items-center gap-3">
          <span className="shrink-0 size-8 border-4 border-frame shadow-lg" />
          <span className="flex flex-col">
            <code className="font-subtitle text-xs">shadow-lg</code>
            <small>
              Images and artefacts, because a printed card floats on the page. A
              Panel, like every surface, casts none. Print drops it.
            </small>
          </span>
        </li>
      </ul>
      <Rows head={["Step", "Between"]} rows={SPACING} />
    </Entry>
  </Group>
);
