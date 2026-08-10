"use client";

import { CHIP_CLASS, Chip } from "./Chip";
import { FilterField } from "./FilterField";
import { IndexCard } from "./IndexCard";
import { JumpBar } from "./JumpBar";
import { Panel } from "./Panel";
import { SectionBar } from "./SectionBar";
import { useState } from "react";

const JUMP_ITEMS = [
  { id: "Firing_Arcs", label: "Firing Arcs" },
  { id: "Line_of_Sight", label: "Line of Sight" },
  { id: "Cover", label: "Cover" },
  { id: "Choosing_a_Target", label: "Choosing a Target" },
];

const Row: React.FC<{ title: string } & React.PropsWithChildren> = ({
  title,
  children,
}) => (
  <section className="flex flex-col gap-3">
    <h3 className="font-subtitle text-xs uppercase tracking-[0.14em] opacity-60">
      {title}
    </h3>
    {children}
  </section>
);

export const PrimitiveShowcase: React.FC<{ scheme: string }> = ({ scheme }) => {
  const [filter, setFilter] = useState("");

  return (
    <div className="flex flex-col gap-8 w-full p-4 bg-background text-foreground">
      <h2 className="font-title text-2xl uppercase tracking-wide">{scheme}</h2>

      <Row title="Panel">
        <Panel className="p-4">
          <p className="text-lg">
            The bordered box every page sits in&mdash;four-pixel black border
            and a soft shadow.
          </p>
        </Panel>
      </Row>

      <Row title="SectionBar">
        <div className="flex flex-col gap-2">
          <SectionBar
            title="Find a rule"
            note="85 sections &middot; 11 chapters"
          />
          <SectionBar
            as="h2"
            title="The turn sequence"
            note="Chapters 3&ndash;7"
          />
          <SectionBar title="No note" />
        </div>
      </Row>

      <Row title="Chip">
        <div className="flex flex-wrap gap-1.5">
          <Chip href="#Vantage_Points">Vantage Points</Chip>
          <Chip href="#Hard_Cover">Hard Cover</Chip>
          <Chip href="#Sustained_Fire_1_Rule">Sustained Fire 1</Chip>
          <span className={CHIP_CLASS}>Bare CHIP_CLASS, no anchor</span>
        </div>
      </Row>

      <Row title="IndexCard">
        <div className="grid md:grid-cols-2 gap-4">
          <IndexCard href="/rules/shooting" title="Shooting Phase">
            <ol className="pl-6 space-y-0.5 text-lg list-decimal">
              <li>Firing Arcs</li>
              <li>Line of Sight</li>
              <li>Cover</li>
            </ol>
          </IndexCard>
          <IndexCard
            href="/rules/shooting"
            title="With a summary"
            summary="The blurb slot, shown here only to prove it renders. No copy exists yet, so cards ship without it."
          >
            <ol className="pl-6 space-y-0.5 text-lg list-decimal">
              <li>Firing Arcs</li>
              <li>Line of Sight</li>
            </ol>
          </IndexCard>
        </div>
      </Row>

      <Row title="JumpBar (non-sticky here; sticky on real pages)">
        <JumpBar items={JUMP_ITEMS} sticky={false} className="w-full" />
      </Row>

      <Row title="JumpBar with FilterField">
        <JumpBar
          items={JUMP_ITEMS}
          sticky={false}
          label="Jump to"
          className="w-full"
        >
          <FilterField
            label="Filter"
            value={filter}
            onChange={setFilter}
            count={filter ? "12 of 191" : "191 profiles"}
            placeholder="e.g. boltgun, plasma, sustained fire"
          />
        </JumpBar>
      </Row>
    </div>
  );
};
