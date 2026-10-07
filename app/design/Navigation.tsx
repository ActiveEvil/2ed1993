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
      note="Every dimension scales from font-size in em, so a size is one number, and every size clamps on cqw, so it reads its container, or the viewport where there is none. The fins are a gradient mask over a clipped yellow plate, not artwork, so they hold over a photograph. dropCaps enlarges the first and last letter; grayscale marks the current page. as sets the element: div by default, h1 in a band, h2 or h3 on a faction card."
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
      note='A static specimen; the live bar needs a route to compare against. Items are Plex at 16px, uppercase. The current page is inert text with aria-current="page", black on a yellow fill and underlined; an ancestor stays a link with the same fill and aria-current="true". On the home page the logo goes grayscale and is not a link. Under md the list collapses to a 44px burger whose menu closes on Escape or an outside click.'
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
      note='Sits above the Panel, and never on the home page. The last crumb carries no href, so it renders as plain text with aria-current="page" and truncates. Below md only the parent crumb and the current page show. The separator is an ::after.'
    />

    <Entry
      title="JumpBar"
      source="components/JumpBar.tsx &middot; rail, bar"
      note="Two modes. The rail is live at the left of this page from lg: a w-56 sticky column headed On this page, the current item in yellow with its subsections listed under it, and the page's filter or controls beneath. The bar, shown here unstuck, sets its items as chips on one black band from md. Below lg the rail, and below md the bar, fold into a sticky details: a Jump toggle and the current target's name in yellow, opening to rows of 44px. Either publishes its height to --jump-bar-height (the rail publishes 0 from lg), which every anchor reads through --jump-offset as scroll-margin. The active item follows the hash and the scroll position; a struck-through item is a section the filter has emptied."
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
      note="The border is --foreground, the one frame that is not black. The box is 20px; a transparent ::after takes the tap target to 36px, so a wrapping cluster needs gap-y-4. It underlines on hover and never fills. Inside a highlighted row the border turns black. On rule pages the chip is a HighlighterLink, so a repeat tap re-fires the highlight."
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
      note="The name and the image are one link. The Logo sits over the plate and reads its size from the card; with no image the card is the Logo alone. as sets the Logo's heading level: h2 on the factions index, h3 for the subfactions on a faction page and here. disabled lays a Coming soon bar over the card and stops the link; it has no call site."
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
      note="Mounted once in the layout and fixed, so the live one is already here. Not repeated as a specimen: two would stack in the same corner. It appears past one viewport of scroll, returns to the top and moves focus to the page's main. It keeps its yellow by decision, since it sits over content."
    />
  </Group>
);
