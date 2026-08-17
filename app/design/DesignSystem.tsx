"use client";

import { Behaviour } from "./Behaviour";
import { Cards } from "./Cards";
import { ContentBlocks } from "./ContentBlocks";
import { Data } from "./Data";
import { Foundations } from "./Foundations";
import { Navigation } from "./Navigation";
import { Surfaces } from "./Surfaces";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const FULL_BLEED = "self-stretch -mx-2 md:-mx-4";

const SECTIONS = [
  { id: "Foundations", label: "Foundations" },
  { id: "Palette", label: "Palette" },
  { id: "Contrast", label: "Contrast" },
  { id: "Type", label: "Type" },
  { id: "Frame_and_Space", label: "Frame and space" },
  { id: "Surfaces", label: "Surfaces" },
  { id: "Navigation", label: "Navigation" },
  { id: "Cards", label: "Cards" },
  { id: "Data", label: "Data" },
  { id: "Content_Blocks", label: "Content blocks" },
  { id: "Behaviour", label: "Behaviour" },
  { id: "Print", label: "Print" },
  { id: "Accessibility", label: "Accessibility" },
];

const SCHEMES = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "auto", label: "Follow OS" },
] as const;

type Scheme = (typeof SCHEMES)[number]["key"];

export const DesignSystem: React.FC = (): React.JSX.Element => {
  const [scheme, setScheme] = useState<Scheme>("auto");

  useEffect(() => {
    const root = document.documentElement;

    if (scheme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", scheme);

    return () => root.removeAttribute("data-theme");
  }, [scheme]);

  return (
    <main id="main" className="flex flex-col items-center gap-4 w-full">
      <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
        <header className="flex flex-col gap-4">
          <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
            Design
          </h1>
          <p className="text-lg">
            Every token, primitive and content block the site is built from,
            rendered live. Each entry names the file it comes from, so a
            specimen and its source stay in step. Content specimens are real
            stored markup rather than examples written for this page.
          </p>
        </header>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-subtitle text-[11px] uppercase tracking-[0.14em]">
            Colour scheme
          </span>
          {SCHEMES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={scheme === key}
              onClick={() => setScheme(key)}
              className={clsx(
                "px-3 py-1 border-2 font-subtitle text-xs uppercase tracking-[0.14em]",
                scheme === key
                  ? "bg-2ed-light-yellow border-black text-black"
                  : "border-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-lg">
          The switcher sets data-theme on the document and is not remembered
          between visits; the site follows the OS everywhere else. Six specimens
          ignore it and render both schemes.
        </p>
      </Panel>

      <JumpBar className={FULL_BLEED} items={SECTIONS} />

      <Foundations />
      <Surfaces />
      <Navigation />
      <Cards />
      <Data />
      <ContentBlocks />
      <Behaviour />
    </main>
  );
};
