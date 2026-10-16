"use client";

import { Entry, Group, LABEL } from "./Shared";
import { FactionCard } from "@/components/Cards";
import { CHIP_CLASS, Chip } from "@/components/Chip";
import { JumpBar } from "@/components/JumpBar";
import { Logo } from "@/components/Logos";
import { RowFilter } from "@/components/RowFilter";
import { clsx } from "clsx";

const JUMP_ITEMS = [
  { id: "Firing_Arcs", label: "Firing Arcs" },
  { id: "Line_of_Sight", label: "Line of Sight" },
  { id: "Cover", label: "Cover" },
  { id: "Choosing_a_Target", label: "Choosing a Target" },
];

const NAV_ITEM = "font-subtitle uppercase";

const Specimen: React.FC<{ label: string } & React.PropsWithChildren> = ({
  label,
  children,
}) => (
  <div className="flex flex-col justify-between items-center gap-3 p-4 border-4 border-frame">
    <div className="flex grow items-center w-full justify-center">
      {children}
    </div>
    <span className={LABEL} dangerouslySetInnerHTML={{ __html: label }} />
  </div>
);

export const Navigation: React.FC = (): React.JSX.Element => (
  <Group title="Navigation">
    <Entry
      title="Logo"
      source="components/Logos.tsx &middot; sm md lg xl"
      note="Every dimension is in em, so a size is one number, and each size clamps on cqw against its container, or the viewport without one. The fins are a gradient mask over a clipped yellow plate and hold over a photograph. dropCaps enlarges the first and last letter; grayscale marks the current page. as is div by default, h1 in a band, h2 or h3 on a faction card."
    >
      <div className="flex flex-col gap-4">
        <Specimen label="xl &middot; dropCaps &middot; the home page heading">
          <div className="@container w-full flex justify-center">
            <Logo
              size="xl"
              title="Oldhammer"
              subtitle="40K 2nd Edition"
              dropCaps
            />
          </div>
        </Specimen>

        <Specimen label="lg &middot; the faction and army-list headings">
          <div className="@container w-full flex justify-center">
            <Logo size="lg" title="Orks" />
          </div>
        </Specimen>

        <div className="grid sm:grid-cols-3 gap-4">
          <Specimen label="sm &middot; nav">
            <Logo size="sm" title="2ed" subtitle="1993" />
          </Specimen>
          <Specimen label="sm grayscale &middot; nav, home page">
            <Logo size="sm" title="2ed" subtitle="1993" grayscale />
          </Specimen>
          <Specimen label="md &middot; faction card">
            <div className="@container w-full flex justify-center">
              <Logo size="md" title="Eldar" />
            </div>
          </Specimen>
        </div>
      </div>
    </Entry>

    <Entry
      title="TopNav"
      source="components/TopNav.tsx &middot; live at the top of this page"
      note='A static specimen, since the live bar needs a route. Items are Plex at 16px, uppercase. The current page is inert text with aria-current="page", black on yellow, underlined; an ancestor stays a link with the same fill and aria-current="true". On the home page the logo is grayscale and not a link. Under md the list collapses to a 44px burger; its menu closes on Escape or an outside click.'
    >
      <div className="flex flex-wrap items-center gap-8 p-4 bg-black text-white">
        <span className={NAV_ITEM}>Rules</span>
        <span
          className={clsx(
            NAV_ITEM,
            "p-1 bg-2ed-light-yellow text-black underline underline-offset-4",
          )}
        >
          Wargear
        </span>
        <span className={clsx(NAV_ITEM, "underline underline-offset-4")}>
          Gallery
        </span>
      </div>
      <div className="flex flex-wrap gap-4">
        <span className={LABEL}>default</span>
        <span className={LABEL}>current page</span>
        <span className={LABEL}>hover</span>
      </div>
    </Entry>

    <Entry
      title="Breadcrumbs"
      source="components/Breadcrumbs.tsx &middot; live above this page"
      note='Above the Panel; absent on the home page. The last crumb has no href, renders as text with aria-current="page" and truncates. Below md only the parent and current crumbs show. The separator is an ::after.'
    />

    <Entry
      title="JumpBar"
      source="components/JumpBar.tsx &middot; rail, bar"
      note="Two modes. The rail, live at the left of this page from lg, is a w-56 sticky column headed On this page: the current item in yellow with its subsections beneath, then the page's filter or controls. The bar, shown unstuck, sets its items as chips on one black band from md. Below lg the rail, and below md the bar, fold into a sticky details: a Jump toggle and the current target in yellow, opening to 44px rows. Each publishes its height to --jump-bar-height (0 for the rail from lg), which every anchor reads through --jump-offset as scroll-margin. The active item follows the hash and scroll; a struck-through item is a section the filter has emptied."
    >
      <JumpBar
        items={JUMP_ITEMS}
        sticky={false}
        label="Jump to"
        className="w-full"
      >
        <RowFilter
          label="Filter"
          unit="entries"
          total={2}
          placeholder="e.g. boltgun, plasma, sustained fire"
        />
      </JumpBar>
      <p className={LABEL}>
        The filter is live: it acts on the WeaponStrip and SpecialRuleSection
        specimens below.
      </p>
    </Entry>

    <Entry
      title="Chip"
      source="components/Chip.tsx &middot; CHIP_CLASS"
      note="The border is --foreground. The box is 20px, with a transparent ::after taking the tap target to 36px, so a wrapping cluster needs gap-y-4. Underlines on hover, never fills; inside a highlighted row the border turns black. On rule pages the chip is a HighlighterLink, so a repeat tap re-fires the highlight."
    >
      <div className="flex flex-wrap gap-x-1 gap-y-4">
        <Chip href="#Grenade_Launcher">Grenade Launcher</Chip>
        <Chip href="#Blast_2_Rule">Blast 2&quot;</Chip>
        <span className={CHIP_CLASS}>Bare CHIP_CLASS, no anchor</span>
      </div>
    </Entry>

    <Entry
      title="FactionCard"
      source="components/Cards.tsx &middot; href, name, image, as, disabled"
      note="Name and image are one link. The Logo sits over the plate and takes its size from the card; without an image the card is the Logo alone. as sets the heading level: h2 on the factions index, h3 for subfactions and here. disabled lays a Coming soon bar over the card and stops the link; nothing calls it."
    >
      <div className="grid md:grid-cols-2 gap-4">
        <FactionCard
          href="/factions/eldar"
          name="Eldar"
          as="h3"
          image={{
            src: "images/Eldar.jpg",
            title: "Codex Eldar",
            artist: "Geoff Taylor",
          }}
        />
        <FactionCard
          href="/factions/necrons"
          name="Necrons"
          as="h3"
          disabled
          image={{
            src: "images/Necron-Pariah.jpg",
            title: "Necron Pariah",
            artist: "John Blanche",
          }}
        />
      </div>
    </Entry>

    <Entry
      title="BackToTop"
      source="components/BackToTop.tsx &middot; live bottom right"
      note="Mounted once in the layout, so the live one is here and a specimen would stack on it. It appears after one viewport of scroll, returns to the top and focuses the skip link. Keeps its yellow, since it sits over content."
    />
  </Group>
);
