import { Entry, Group, LABEL, Source } from "./Shared";
import { ORKS_BAND, RULES_CONTENTS, STRATEGY_DECKS } from "./fixtures";
import { StrategyCardRandomiser } from "@/components/CardRandomisers";
import { ContentsRow, ContentsTable } from "@/components/ContentsTable";
import { Gallery } from "@/components/Gallery";
import { SectionHeading } from "@/components/Heading";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { SectionBar } from "@/components/SectionBar";
import { EYEBROW_CLASS, TITLE_CLASS, TitleBand } from "@/components/TitleBand";
import { generateAnchorId } from "@/lib/anchors";

const ASPECTS = [
  {
    aspect: "aspect-video" as const,
    label: "aspect-video &middot; 16 / 9",
    image: {
      src: "images/Eldar-vs-Orks.jpg",
      title: "Eldar vs Orks",
      artist: "David Gallagher",
      dimensions: { width: 1280, height: 824 },
    },
  },
  {
    aspect: "aspect-retro" as const,
    label: "aspect-retro &middot; 4 / 3",
    image: {
      src: "images/Sabinus-Undaunted.jpg",
      title: "Sabinus Undaunted",
      artist: "Tony Hough",
      dimensions: { width: 1700, height: 1278 },
    },
  },
  {
    aspect: "aspect-portrait" as const,
    label: "aspect-portrait &middot; 4 / 5",
    image: {
      src: "images/Terminators.jpg",
      title: "Terminators",
      artist: "John Blanche",
      dimensions: { width: 1283, height: 1600 },
    },
  },
  {
    aspect: "aspect-square" as const,
    label: "aspect-square &middot; 1 / 1, no artist",
    image: {
      src: "images/Preacher.jpeg",
      title: "Preacher",
      artist: null,
      dimensions: { width: 1368, height: 1370 },
    },
  },
];

const GALLERY = [
  {
    file_name: "Preacher.jpeg",
    title: "Preacher",
    width: 1368,
    height: 1370,
  },
  {
    file_name: "Hellhound.jpeg",
    title: "Imperial Hellhound",
    width: 2292,
    height: 2292,
  },
  {
    file_name: "Imperial-Assassin.jpeg",
    title: "Imperial Assassin",
    width: 1320,
    height: 1321,
  },
];

export const Surfaces: React.FC = (): React.JSX.Element => (
  <Group title="Surfaces">
    <Entry
      title="Panel"
      source="components/Panel.tsx &middot; as, id, className"
      note='The one box every page sits in: a 4px --frame border, no padding, no layout and no shadow, since a surface casts none. as takes div, section, article or main; rendered as main it takes id="main" and tabIndex -1, so BackToTop can return focus to it. This page is one, so it is not repeated as a specimen.'
    />

    <Entry
      title="TitleBand"
      source="components/TitleBand.tsx &middot; title, heading, eyebrow, image"
      note="The single header type: an eyebrow in the accent, the title in Merriweather, and the art uncropped at aspect-portrait in a w-40 column, w-56 from lg. The faction and army-list pages pass a Logo as the heading; the home and gallery pages pass an introductory paragraph as children. The specimen sets its title in a p with TITLE_CLASS, so this page keeps one h1."
    >
      <Source>{ORKS_BAND.source}</Source>
      <div className="border-4 border-frame">
        <TitleBand
          eyebrow={ORKS_BAND.eyebrow}
          heading={<p className={TITLE_CLASS}>{ORKS_BAND.title}</p>}
          image={ORKS_BAND.image}
        />
      </div>
      <span className={EYEBROW_CLASS}>EYEBROW_CLASS</span>
    </Entry>

    <Entry
      title="SectionHeading"
      source="components/Heading.tsx &middot; as, id"
      note="Merriweather over a 4px --frame rule, 2xl and 3xl from md. h2 by default; h3 under a group, as on the reference pages. Every group heading on this page is one."
    >
      <SectionHeading as="h3">Before the Game</SectionHeading>
    </Entry>

    <Entry
      title="SectionBar"
      source="components/SectionBar.tsx &middot; as, title, note, className"
      note='A black bar in Plex at 14px. The note is white like the title and on the site is always a count or a range, pinned to one line from sm up. as="h2" makes the bar a heading, as on the index pages. Every entry label on this page is one, and is the single exception: it carries a file path, wrapped so it cannot overflow the bar.'
    >
      <Source>{RULES_CONTENTS.source}</Source>
      <div className="flex flex-col gap-2">
        {RULES_CONTENTS.sections.map(({ name, note }) => (
          <SectionBar key={name} title={name} note={note} />
        ))}
      </div>
    </Entry>

    <Entry
      title="ContentsTable"
      source="components/ContentsTable.tsx &middot; ContentsRow"
      note="The index row: a chapter number in --leader-ink, the title as an h3 link, and its entries as underlined links. Rows are ruled in 4px --frame, and the last group on a page drops its bottom rule. as takes ol, the default, or ul for an unnumbered index."
    >
      <Source>{RULES_CONTENTS.source}</Source>
      <div className="flex flex-col">
        <SectionBar
          title={RULES_CONTENTS.sections[0].name}
          note={RULES_CONTENTS.sections[0].note}
        />
        <ContentsTable>
          {RULES_CONTENTS.sections[0].chapters.map(
            ({ number, title, slug, entries }) => (
              <ContentsRow
                key={slug}
                number={number}
                title={title}
                href={`/rules/${slug}`}
                items={entries.map((name) => ({
                  name,
                  href: `/rules/${slug}#${generateAnchorId(name)}`,
                }))}
              />
            ),
          )}
        </ContentsTable>
      </div>
    </Entry>

    <Entry
      title="ImageWithCredit"
      source="components/ImageWithCredit.tsx &middot; 4 aspects, 4 widths"
      note="The one image component. The caption names the artist when one is known and the title alone otherwise; the alt text names both. Every figure is a button that opens the plate in a lightbox unless openable is false, which is only the faction card, whose whole face is already a link. The figure is a container: below 16rem the caption drops to text-2xs with a thinner box, so a small band plate keeps its art. The four widths set the sizes attribute rather than the box: full is 960px from lg; half is 480px; half-from-md is 480px from lg and half the viewport below; third is 320px from lg, a third from md and half below."
    >
      <div className="grid md:grid-cols-2 gap-4">
        {ASPECTS.map(({ aspect, label, image }) => (
          <div key={aspect} className="flex flex-col gap-2">
            <span
              className={LABEL}
              dangerouslySetInnerHTML={{ __html: label }}
            />
            <ImageWithCredit
              src={image.src}
              title={image.title}
              artist={image.artist}
              dimensions={image.dimensions}
              aspect={aspect}
              width="half-from-md"
            />
          </div>
        ))}
      </div>
    </Entry>

    <Entry
      title="Gallery"
      source="components/Gallery.tsx &middot; Lightbox.tsx"
      note="A grid of ImageWithCredit tiles sharing one Lightbox. Every tile takes one aspect, aspect-square unless the caller passes another; the lightbox then shows the plate whole. A tile is a button, not a link: it opens a real dialog with showModal, so focus trapping, Escape and focus restoration are native. Arrow keys and the arrows step through the set only when there is more than one plate, and a plate with known dimensions can be zoomed to full size."
    >
      <Gallery images={GALLERY} />
    </Entry>

    <Entry
      title="CardRandomisers"
      source="components/CardRandomisers.tsx &middot; StrategyCardRandomiser, MissionCardRandomiser"
      note="The one interactive surface on the card decks: a SectionBar with the count in play, then the deck choices on dark blue in 2ed-white, with light-yellow checkboxes for the selected decks. Draw is white with a black frame, in a bar that sticks below the Jump bar. A draw replaces the location with a random card on its deck page, where the :target frame marks it, so a draw here leaves this page. The mission randomiser is the same shape and leaves Codex: Tyranids out by default. Print drops both."
    >
      <Source>{STRATEGY_DECKS.source}</Source>
      <div className="flex flex-col">
        <StrategyCardRandomiser
          baseHref="/card-decks/strategy-cards"
          cards={STRATEGY_DECKS.cards.map(({ origin, names }) => ({
            origin,
            ids: names.map((name) => generateAnchorId(name)),
          }))}
        />
      </div>
    </Entry>
  </Group>
);
