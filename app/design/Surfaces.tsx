import { Entry, Group, LABEL, Source } from "./Shared";
import { ORKS_BAND, RULES_CONTENTS, STRATEGY_DECKS } from "./fixtures";
import { StrategyCardRandomiser } from "@/components/CardRandomisers";
import { ContentsRow, ContentsTable } from "@/components/ContentsTable";
import { Gallery } from "@/components/Gallery";
import { SectionHeading } from "@/components/Heading";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { SectionBar } from "@/components/SectionBar";
import { EYEBROW_CLASS, TITLE_CLASS, TitleBand } from "@/components/TitleBand";
import { deckCardAnchorId, generateAnchorId } from "@/lib/anchors";

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
      note='The box every page sits in: a 4px --frame border with no padding, layout or shadow. as takes div, section, article or main; as main it carries id="main" for the skip link. This page is the specimen.'
    />

    <Entry
      title="TitleBand"
      source="components/TitleBand.tsx &middot; title, heading, eyebrow, image"
      note="The one header type: an eyebrow in the accent, the title in Merriweather, and the art uncropped at aspect-portrait in a w-40 column, w-56 from lg. Faction and army-list pages pass a Logo as the heading; the home and gallery pages pass an intro paragraph. The specimen's title is a p in TITLE_CLASS, keeping one h1 on this page."
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
      note="Merriweather over a 4px --frame rule, 2xl, 3xl from md. h2 by default, h3 under a group. The group headings on this page are specimens."
    >
      <SectionHeading as="h3">Before the Game</SectionHeading>
    </Entry>

    <Entry
      title="SectionBar"
      source="components/SectionBar.tsx &middot; as, title, note, className"
      note='A black bar in Plex at 14px. The note is white and, on the site, always a count or range, held to one line from sm. as="h2" makes the bar a heading, as on the index pages. The entry labels on this page are SectionBars carrying a file path, wrapped so it cannot overflow.'
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
      note="The index row: a chapter number in --leader-ink, the title as an h3 link, its entries as underlined links. Rows rule in 4px --frame; the last group on a page drops its bottom rule. as takes ol, the default, or ul."
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
      note="The image component. The caption names the artist when known, otherwise the title; the alt text names both. Each figure is a button opening the plate in a lightbox, except the faction card, whose face is already a link. Below 16rem the caption drops to text-2xs in a thinner box. The four widths set sizes, not the box: full is 960px from lg; half 480px; half-from-md 480px from lg and half the viewport below; third 320px from lg, a third from md and half below."
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
      note="A grid of ImageWithCredit tiles sharing one Lightbox. Tiles take one aspect, aspect-square by default; the lightbox shows the plate whole. A tile opens a dialog with showModal, so focus trapping, Escape and focus return are native. Arrows step through the set when there is more than one plate; a plate with known dimensions zooms to full size."
    >
      <Gallery images={GALLERY} />
    </Entry>

    <Entry
      title="CardRandomisers"
      source="components/CardRandomisers.tsx &middot; StrategyCardRandomiser, MissionCardRandomiser"
      note="The one interactive surface on the card decks: a SectionBar with the count in play, the deck choices on dark blue with light-yellow checkboxes, and a white Draw button in a bar that sticks below the Jump bar. A draw goes to a random card on its deck page, where the :target frame marks it, so a draw here leaves this page. The mission randomiser matches and leaves Codex: Tyranids out by default. Print drops both."
    >
      <Source>{STRATEGY_DECKS.source}</Source>
      <div className="flex flex-col">
        <StrategyCardRandomiser
          baseHref="/card-decks/strategy-cards"
          cards={STRATEGY_DECKS.cards.map(({ origin, names }) => ({
            origin,
            ids: names.map((name) => ({
              name,
              id: deckCardAnchorId(name, origin),
            })),
          }))}
        />
      </div>
    </Entry>
  </Group>
);
