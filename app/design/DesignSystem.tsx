"use client";

import { ArmyLists } from "./ArmyLists";
import { Artefacts } from "./Artefacts";
import { Behaviour } from "./Behaviour";
import { ContentBlocks } from "./ContentBlocks";
import { Data } from "./Data";
import { Foundations } from "./Foundations";
import { Navigation } from "./Navigation";
import { Surfaces } from "./Surfaces";
import { JumpBar } from "@/components/JumpBar";
import type { JumpItem } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const group = (label: string, entries: string[]): JumpItem => ({
  id: generateAnchorId(label),
  label,
  subsections: entries.map((entry) => ({
    id: generateAnchorId(entry),
    label: entry,
  })),
});

const SECTIONS: JumpItem[] = [
  group("Foundations", [
    "Scheme tokens",
    "Fixed palette",
    "Faction colours",
    "Ink pairs",
    "Type",
    "Frame and space",
  ]),
  group("Surfaces", [
    "Panel",
    "TitleBand",
    "SectionHeading",
    "SectionBar",
    "ContentsTable",
    "ImageWithCredit",
    "Gallery",
    "CardRandomisers",
  ]),
  group("Navigation", [
    "Logo",
    "TopNav",
    "Breadcrumbs",
    "JumpBar",
    "Chip",
    "FactionCard",
    "BackToTop",
  ]),
  group("Artefacts", ["Card face", "Datafax"]),
  group("Data", [
    "Striped rows",
    "WeaponStrip",
    "Table, three columns or fewer",
    "Table, wider than three columns",
    "Chart",
    "Chart on a card face",
  ]),
  group("Army lists", ["ArmyListSummary", "Army list entry"]),
  group("Content blocks", [
    "Prose, headings and links",
    "House rule",
    "Blockquote",
    "Numbered sequences",
    "SpecialRuleSection",
  ]),
  group("Behaviour", [
    "Anchors and highlighting",
    "Filtering rows",
    "Print",
    "Accessibility",
  ]),
];

const SCHEMES = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "auto", label: "Follow OS" },
] as const;

type Scheme = (typeof SCHEMES)[number]["key"];

const SchemeSwitcher: React.FC<{
  scheme: Scheme;
  onChange: (scheme: Scheme) => void;
}> = ({ scheme, onChange }): React.JSX.Element => (
  <div className="flex flex-col gap-2 p-3 bg-black border-2 border-frame text-white">
    <span
      id="Colour_scheme"
      className="font-subtitle text-xs uppercase tracking-widest"
    >
      Colour scheme
    </span>
    <div
      role="group"
      aria-labelledby="Colour_scheme"
      className="flex flex-wrap gap-2"
    >
      {SCHEMES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          aria-pressed={scheme === key}
          onClick={() => onChange(key)}
          className={clsx(
            "min-h-11 px-2 border-2 font-subtitle text-sm",
            scheme === key
              ? "bg-2ed-light-yellow border-2ed-light-yellow text-black"
              : "border-2ed-white text-2ed-white hover:bg-2ed-white hover:text-black",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export const DesignSystem: React.FC = (): React.JSX.Element => {
  const [scheme, setScheme] = useState<Scheme>("auto");

  useEffect(() => {
    const root = document.documentElement;

    if (scheme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", scheme);

    return () => root.removeAttribute("data-theme");
  }, [scheme]);

  return (
    <Panel as="main" className="flex flex-col w-full max-w-5xl">
      <TitleBand title="Design">
        <p className="max-w-prose text-lg">
          Every component in components/ and every class under .dynamic-content,
          rendered live. Each entry names the file it comes from, and the
          content specimens are real stored rows rather than copy written for
          this page. The colour scheme switcher lasts for the visit only; the
          site follows the OS everywhere else. Five specimens ignore it and
          render both schemes.
        </p>
      </TitleBand>
      <div className="flex flex-col lg:flex-row">
        <JumpBar rail items={SECTIONS}>
          <SchemeSwitcher scheme={scheme} onChange={setScheme} />
        </JumpBar>
        <div className="flex flex-col gap-12 min-w-0 grow p-4 md:p-8">
          <Foundations />
          <Surfaces />
          <Navigation />
          <Artefacts />
          <Data />
          <ArmyLists />
          <ContentBlocks />
          <Behaviour />
        </div>
      </div>
    </Panel>
  );
};
