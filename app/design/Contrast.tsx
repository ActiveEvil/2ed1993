"use client";

import { LABEL, factionName } from "./Shared";
import { contrast, hex, lightnessContrast, toRgb, type Rgb } from "./luminance";
import { factionColors, factionInk } from "@/lib/factions";
import { useEffect, useRef, useState } from "react";

type Token = { key: string; className: string };

const FACTION_MATS = [...new Set(Object.values(factionColors))];

const TOKENS: Token[] = [
  { key: "background", className: "bg-background" },
  { key: "foreground", className: "bg-foreground" },
  { key: "accent", className: "bg-accent" },
  { key: "card-face", className: "bg-card-face" },
  { key: "card-stripe", className: "bg-card-stripe" },
  { key: "stripe", className: "bg-stripe" },
  { key: "leader-ink", className: "bg-leader-ink" },
  { key: "group-surface", className: "bg-group-surface" },
  { key: "black", className: "bg-black" },
  { key: "white", className: "bg-white" },
  { key: "2ed-black", className: "bg-2ed-black" },
  { key: "2ed-white", className: "bg-2ed-white" },
  { key: "2ed-light-yellow", className: "bg-2ed-light-yellow" },
  { key: "2ed-dark-red", className: "bg-2ed-dark-red" },
  { key: "2ed-dark-blue", className: "bg-2ed-dark-blue" },
  { key: "2ed-light-blue", className: "bg-2ed-light-blue" },
  { key: "2ed-light-green", className: "bg-2ed-light-green" },
  ...FACTION_MATS.map((className) => ({
    key: className.replace(/^bg-/, ""),
    className,
  })),
];

type Pair = {
  where: string;
  ink: string;
  on: string;
  size?: number;
  bold?: boolean;
  graphic?: boolean;
  exempt?: string;
};

const PAIRS: Pair[] = [
  { where: "Body copy", ink: "foreground", on: "background", size: 18 },
  { where: "Zebra row", ink: "foreground", on: "stripe", size: 18 },
  {
    where: "Note over a grouped run",
    ink: "foreground",
    on: "group-surface",
    size: 14,
  },
  {
    where: "Entry leader dots",
    ink: "leader-ink",
    on: "background",
    graphic: true,
  },
  {
    where: "Entry leader dots on a run",
    ink: "leader-ink",
    on: "group-surface",
    graphic: true,
  },
  {
    where: "ContentsTable chapter number",
    ink: "leader-ink",
    on: "background",
    size: 20,
    bold: true,
  },
  { where: "Chip", ink: "foreground", on: "background", size: 12 },
  { where: "Table and chart heads", ink: "white", on: "black", size: 12 },
  {
    where: "Yellow interaction surfaces",
    ink: "black",
    on: "2ed-light-yellow",
    size: 14,
  },
  { where: "Image credit", ink: "black", on: "2ed-light-blue", size: 12 },
  {
    where: "House-rule label and eyebrow",
    ink: "accent",
    on: "background",
    size: 12,
    bold: true,
  },
  {
    where: "Mission card name on its mat",
    ink: "2ed-light-yellow",
    on: "2ed-dark-blue",
    size: 24,
  },
  {
    where: "Wargear card name on its mat",
    ink: "2ed-white",
    on: "2ed-dark-blue",
    size: 24,
  },
  {
    where: "Wargear card points on its mat",
    ink: "2ed-light-yellow",
    on: "2ed-dark-blue",
    size: 18,
    bold: true,
  },
  {
    where: "Card name on the face",
    ink: "2ed-dark-blue",
    on: "card-face",
    size: 24,
  },
  {
    where: "Card heading and restriction line",
    ink: "2ed-dark-red",
    on: "card-face",
    size: 20,
    bold: true,
  },
  { where: "Card face body", ink: "2ed-black", on: "card-face", size: 18 },
  {
    where: "Datafax face row",
    ink: "2ed-black",
    on: "card-stripe",
    size: 14,
  },
  {
    where: "Blockquote and empty-state note",
    ink: "2ed-black",
    on: "2ed-light-green",
    size: 18,
  },
  {
    where: "Randomiser panel",
    ink: "2ed-white",
    on: "2ed-dark-blue",
    size: 20,
  },
  ...FACTION_MATS.map((className) => {
    const slugs = Object.keys(factionColors).filter(
      (key) => factionColors[key] === className,
    );
    const ink = factionInk[slugs[0]] ?? "text-2ed-white";

    return {
      where: `Datafax label on the ${slugs.map(factionName).join(" and ")} mat`,
      ink: ink.replace(/^text-/, ""),
      on: className.replace(/^bg-/, ""),
      size: 18,
      bold: true,
    };
  }),
  {
    where: "Logo subtitle at sm",
    ink: "2ed-dark-red",
    on: "2ed-light-yellow",
    size: 10,
    bold: true,
    exempt: "logotype, WCAG 1.4.3",
  },
];

const needs = ({ size = 0, bold, graphic }: Pair): number =>
  graphic || size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;

type Measured = Record<string, Rgb>;

const Probes: React.FC<{
  theme: "light" | "dark";
  innerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ theme, innerRef }) => (
  <div
    ref={innerRef}
    data-theme={theme}
    aria-hidden="true"
    className="w-0 h-0 overflow-hidden"
  >
    {TOKENS.map(({ key, className }) => (
      <span key={key} data-token={key} className={className} />
    ))}
  </div>
);

export const Contrast: React.FC = (): React.JSX.Element => {
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState<{ light: Measured; dark: Measured } | null>(
    null,
  );

  useEffect(() => {
    const measure = (root: HTMLDivElement | null): Measured => {
      const out: Measured = {};
      if (!root) return out;
      for (const { key } of TOKENS) {
        const probe = root.querySelector<HTMLElement>(`[data-token="${key}"]`);
        if (!probe) continue;
        const rgb = toRgb(getComputedStyle(probe).backgroundColor);
        if (rgb) out[key] = rgb;
      }
      return out;
    };

    setRead({
      light: measure(lightRef.current),
      dark: measure(darkRef.current),
    });
  }, []);

  const cell = (pair: Pair, scheme: Measured): React.JSX.Element => {
    const ink = scheme[pair.ink];
    const on = scheme[pair.on];
    if (!ink || !on) return <td>&mdash;</td>;

    const ratio = contrast(ink, on);
    const pass = ratio >= needs(pair);
    const lc = lightnessContrast(ink, on);

    return (
      <td>
        <span style={{ color: hex(ink), backgroundColor: hex(on) }}>
          &nbsp;{ratio.toFixed(2)}&nbsp;
        </span>
        <br />
        <small>
          {pass ? "passes" : pair.exempt ? "exempt" : "under AA"} &middot; Lc{" "}
          {lc.toFixed(0)}
        </small>
      </td>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Probes theme="light" innerRef={lightRef} />
      <Probes theme="dark" innerRef={darkRef} />

      {read === null ? (
        <p className={LABEL}>Measuring&hellip;</p>
      ) : (
        <div className="dynamic-content">
          <section className="table-container">
            <table>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: "left" }}>
                    Where
                  </th>
                  <th scope="col">Ink</th>
                  <th scope="col">On</th>
                  <th scope="col">Needs</th>
                  <th scope="col">Light</th>
                  <th scope="col">Dark</th>
                </tr>
              </thead>
              <tbody>
                {PAIRS.map((pair) => (
                  <tr key={`${pair.where}-${pair.ink}-${pair.on}`}>
                    <td style={{ textAlign: "left" }}>{pair.where}</td>
                    <td>{pair.ink}</td>
                    <td>{pair.on}</td>
                    <td>
                      {needs(pair).toFixed(1)}
                      <br />
                      <small>
                        {pair.graphic
                          ? "non-text"
                          : `${pair.size}px${pair.bold ? " bold" : ""}`}
                        {pair.exempt && (
                          <>
                            <br />
                            exempt: {pair.exempt}
                          </>
                        )}
                      </small>
                    </td>
                    {cell(pair, read.light)}
                    {cell(pair, read.dark)}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <p>
            The ratio and the verdict are WCAG 2.1, which is what AA means.
            <strong>Lc</strong> is the same pair measured by APCA, the
            perceptual model behind the WCAG 3 draft: it accounts for which of
            the two colours is lighter, where the 2.1 ratio does not. As a
            guide, Lc 60 is comfortable for body text, Lc 45 for large or bold
            text, and Lc 30 is the floor for any text at all.
          </p>
          <p>
            Where the two disagree, the ratio decides conformance and the Lc
            decides whether a change is worth making. A colour that passes on
            the ratio can still read worse than the one it replaces. Check both
            before moving a colour.
          </p>
        </div>
      )}
    </div>
  );
};
