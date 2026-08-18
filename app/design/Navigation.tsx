"use client";

import { Entry, Group, LABEL } from "./Shared";
import { CHIP_CLASS, Chip } from "@/components/Chip";
import { FilterField } from "@/components/FilterField";
import { JumpBar } from "@/components/JumpBar";
import { Logo } from "@/components/Logos";
import { useState } from "react";

const JUMP_ITEMS = [
  { id: "Firing_Arcs", label: "Firing Arcs" },
  { id: "Line_of_Sight", label: "Line of Sight" },
  { id: "Cover", label: "Cover" },
  { id: "Choosing_a_Target", label: "Choosing a Target" },
];

const NAV_ITEM = "font-subtitle text-xl uppercase";

const Specimen: React.FC<{ label: string } & React.PropsWithChildren> = ({
  label,
  children,
}) => (
  <div className="flex flex-col justify-between items-center gap-3 p-4 border-4 border-black">
    <div className="flex grow items-center w-full justify-center">
      {children}
    </div>
    <span className={LABEL}>{label}</span>
  </div>
);

export const Navigation: React.FC = (): React.JSX.Element => {
  const [filter, setFilter] = useState("");

  return (
    <Group id="Navigation" title="Navigation">
      <Entry
        title="Logo"
        source="components/Logos.tsx &middot; sm md lg xl"
        note="Every dimension scales from font-size in em, so a size is one number. The fins are a gradient mask over a clipped yellow plate, not artwork, so they hold over a photograph. dropCaps enlarges the first and last letter; grayscale marks the current page; md reads its size from its container. lg has no call site: from md up it matches xl, and it does not step down on a phone."
      >
        <div className="flex flex-col gap-4">
          <Specimen label="xl &middot; dropCaps &middot; the home page mark">
            <Logo
              size="xl"
              title="Oldhammer"
              subtitle="40K 2nd Edition"
              dropCaps
            />
          </Specimen>

          <div className="grid sm:grid-cols-3 gap-4">
            <Specimen label="sm &middot; nav">
              <Logo size="sm" title="2ed" subtitle="1993" />
            </Specimen>
            <Specimen label="sm grayscale &middot; nav, current page">
              <Logo size="sm" title="2ed" subtitle="1993" grayscale />
            </Specimen>
            <Specimen label="md &middot; faction card, fluid">
              <div className="@container w-full">
                <Logo size="md" title="Eldar" />
              </div>
            </Specimen>
          </div>

          <Specimen label="lg &middot; no call site">
            <Logo size="lg" title="Orks" dropCaps />
          </Specimen>
        </div>
      </Entry>

      <Entry
        title="TopNav"
        source="components/TopNav.tsx &middot; live at the top of this page"
        note='A static specimen; the live bar needs a route to compare against. The current page is inert text with aria-current="page"; an ancestor stays a link and takes the same yellow with aria-current="true". On the home page the logo goes grayscale. Under md the list collapses to a 44px burger.'
      >
        <div className="flex flex-wrap items-center gap-4 p-3 bg-black text-white">
          <span className={NAV_ITEM}>Rules</span>
          <span className={`${NAV_ITEM} text-2ed-light-yellow`}>Wargear</span>
          <span className={`${NAV_ITEM} underline underline-offset-4`}>
            Gallery
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span className={LABEL}>default</span>
          <span className={LABEL}>current page or ancestor</span>
          <span className={LABEL}>hover</span>
        </div>
      </Entry>

      <Entry
        title="Breadcrumbs"
        source="components/Breadcrumbs.tsx"
        note='Sits above the Panel, and never on the home page. The last crumb carries no href, so it renders as plain text with aria-current="page". The separator is an ::after. The trail above this page is the live one.'
      >
        <ul className="flex gap-2">
          <li className="font-subtitle after:content-['/'] after:ml-2">
            <span className="underline underline-offset-4">2ed1993</span>
          </li>
          <li className="font-subtitle after:content-['/'] after:ml-2">
            <span className="underline underline-offset-4">Rules</span>
          </li>
          <li aria-current="page" className="font-subtitle">
            Shooting
          </li>
        </ul>
      </Entry>

      <Entry
        title="JumpBar"
        source="components/JumpBar.tsx &middot; sticky, live above"
        note="The bar above is the live one. It publishes its height to --jump-bar-height, which every anchor reads as scroll-margin; the active chip follows the hash and the scroll position. A struck-through chip is a section the filter has hidden. Under md it folds into a details and summary at 52px a row."
      >
        <JumpBar items={JUMP_ITEMS} sticky={false} className="w-full" />
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
      </Entry>

      <Entry
        title="Chip"
        source="components/Chip.tsx &middot; CHIP_CLASS"
        note="The border is --foreground, the one exception to black. The box is 20px; a transparent ::after takes the tap target to 36px, so a wrapping cluster needs gap-y-4. Inside a highlighted row the border inverts to black. On rule pages the chip is a HighlighterLink, so a repeat tap re-fires the highlight."
      >
        <div className="flex flex-wrap gap-x-1 gap-y-4">
          <Chip href="#Vantage_Points">Vantage Points</Chip>
          <Chip href="#Hard_Cover">Hard Cover</Chip>
          <Chip href="#Sustained_Fire_1_Rule">Sustained Fire 1</Chip>
          <span className={CHIP_CLASS}>Bare CHIP_CLASS, no anchor</span>
        </div>
      </Entry>

      <Entry
        title="BackToTop"
        source="components/BackToTop.tsx &middot; live bottom right"
        note="Mounted once in the layout and fixed, so the live one is already here. Not repeated as a specimen: two would stack in the same corner. It appears past one viewport of scroll and returns focus to the skip link."
      />
    </Group>
  );
};
