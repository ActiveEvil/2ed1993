"use client";

import { FactionCard, IndexCard } from "./Cards";
import { CHIP_CLASS, Chip } from "./Chip";
import { FilterField } from "./FilterField";
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

const TOKENS = [
  { name: "--background", className: "bg-background" },
  { name: "--foreground", className: "bg-foreground" },
  { name: "--house-rule-accent", className: "bg-accent" },
  { name: "--card-face", className: "bg-card-face" },
  { name: "--stripe", className: "bg-[var(--stripe)]" },
];

const Row: React.FC<
  { title: string; note?: string } & React.PropsWithChildren
> = ({ title, note, children }) => (
  <section className="flex flex-col gap-3">
    <h3 className="font-subtitle text-xs uppercase tracking-[0.14em] opacity-60">
      {title}
    </h3>
    {note && <p className="-mt-2 text-sm italic opacity-80">{note}</p>}
    {children}
  </section>
);

export const PrimitiveShowcase: React.FC<{ scheme: string }> = ({ scheme }) => {
  const [filter, setFilter] = useState("");

  return (
    <div className="flex flex-col gap-8 w-full p-4 bg-background text-foreground">
      <h2 className="font-title text-2xl uppercase tracking-wide">{scheme}</h2>

      <Row
        title="Scheme tokens"
        note="The five variables that change between schemes. Everything else in the palette is fixed in both."
      >
        <ul className="flex flex-col gap-2">
          {TOKENS.map(({ name, className }) => (
            <li key={name} className="flex items-center gap-3">
              <span
                className={`shrink-0 size-8 border-2 border-black ${className}`}
              />
              <code className="font-subtitle text-xs">{name}</code>
            </li>
          ))}
        </ul>
      </Row>

      <Row title="Panel">
        <Panel className="p-4">
          <p className="text-lg">
            The bordered box every page sits in&mdash;four-pixel black border
            and a soft shadow. Borders stay black in both schemes.
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

      <Row
        title="Chip"
        note="Border is --foreground, the one deliberate exception to black. The visible box is 20px tall; a transparent ::after overlay takes the tap target to 36px, so a wrapping cluster needs gap-y-4 or a chip steals clicks from the row above. Inside a highlighted row the border inverts to black."
      >
        <div className="flex flex-wrap gap-x-1 gap-y-4">
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

      <Row
        title="ImageCard"
        note="The name and the image are one link. Used on the factions index."
      >
        <div className="grid md:grid-cols-2 gap-4">
          <FactionCard
            href="/rules/eldar"
            name="Eldar"
            image={{
              src: "images/Eldar.jpg",
              title: "Codex Eldar",
              artist: "Geoff Taylor",
            }}
          />
          <FactionCard href="/rules/eldar" name="No image" />
        </div>
      </Row>

      <Row
        title="Card face"
        note="A card is a fixed dark frame around a --card-face surface. The face keeps dark ink in both schemes and only loses its glare in dark mode, so a card still reads as printed card stock."
      >
        <div className="flex flex-col gap-2 p-4 border-4 border-black bg-2ed-dark-blue shadow-lg">
          <h4 className="font-subtitle uppercase text-2xl text-2ed-light-yellow text-center">
            Take And Hold
          </h4>
          <div className="flex flex-col items-center gap-2 p-4 bg-card-face text-2ed-black">
            <p className="text-lg">Body text sits on the face.</p>
            <h5 className="font-subtitle text-xl text-2ed-dark-red">
              Primary Objective
            </h5>
          </div>
        </div>
      </Row>

      <Row
        title="Striped rows"
        note="--stripe is one definition of the zebra, mixed from the two scheme variables. Rows carry it at 80% so a frozen first column veils what scrolls under it rather than hiding it; the alpha composites over --background, not black."
      >
        <div className="flex flex-col bg-background border-4 border-black">
          {["Boltgun", "Bolt Pistol", "Chainsword", "Power Fist"].map(
            (name) => (
              <div
                key={name}
                className="p-2 bg-background/80 even:bg-(--stripe)/80 text-lg font-semibold"
              >
                {name}
              </div>
            ),
          )}
        </div>
      </Row>

      <Row title="JumpBar (non-sticky here; sticky on real pages)">
        <JumpBar items={JUMP_ITEMS} sticky={false} className="w-full" />
      </Row>

      <Row
        title="JumpBar with FilterField"
        note="The same bar carries facets on the wargear cards, where the items are not sections. Its active chip follows the hash, so a pill on a card moves it too."
      >
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

      <Row
        title="BackToTop"
        note="Mounted once in the layout rather than per page, and fixed, so the live one is already on this page — scroll a screenful and it appears bottom right. Not repeated here: two of them would stack in the same corner."
      />
    </div>
  );
};
