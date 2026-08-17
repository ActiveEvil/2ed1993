import { DualScheme, Entry, Group, LABEL } from "./Shared";
import { Gallery } from "@/components/Gallery";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";

const ASPECTS = [
  {
    aspect: "aspect-video" as const,
    label: "aspect-video &middot; 16 / 9",
    image: {
      src: "images/Eldar-vs-Orks.jpg",
      title: "Eldar vs Orks",
      artist: "David Gallagher",
    },
  },
  {
    aspect: "aspect-retro" as const,
    label: "aspect-retro &middot; 4 / 3",
    image: {
      src: "images/Sabinus-Undaunted.jpg",
      title: "Sabinus Undaunted",
      artist: "Tony Hough",
    },
  },
  {
    aspect: "aspect-portrait" as const,
    label: "aspect-portrait &middot; 4 / 5",
    image: {
      src: "images/Terminators.jpg",
      title: "Terminators",
      artist: "John Blanche",
    },
  },
  {
    aspect: "aspect-square" as const,
    label: "aspect-square &middot; 1 / 1, no artist",
    image: {
      src: "images/Dark-Imperium.jpg",
      title: "Dark Imperium",
      artist: "Geoff Taylor",
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

const CardFace: React.FC = () => (
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
);

export const Surfaces: React.FC = (): React.JSX.Element => (
  <Group id="Surfaces" title="Surfaces">
    <Entry
      title="Panel"
      source="components/Panel.tsx &middot; as, id, className"
      note="It carries no padding or layout; every caller passes those. as takes div, section, article or main. Every section on this page is one."
    >
      <Panel className="p-4">
        <p className="text-lg">
          The bordered box every page sits in&mdash;four-pixel black border and
          a soft shadow. Borders stay black in both schemes.
        </p>
      </Panel>
    </Entry>

    <Entry
      title="SectionBar"
      source="components/SectionBar.tsx &middot; title, note"
      note='The note is the only yellow on the bar, and is always a count or a range. as="h2" makes the bar a heading. Every entry label on this page is one, carrying its source file.'
    >
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
    </Entry>

    <Entry
      title="Card face"
      source="card decks"
      note="A card is a fixed dark frame around a --card-face surface. The face holds dark ink in both schemes and only loses its glare in dark. Nothing on a face may use --foreground."
    >
      <DualScheme>
        <CardFace />
      </DualScheme>
    </Entry>

    <Entry
      title="ImageWithCredit"
      source="components/ImageWithCredit.tsx &middot; 4 aspects, 3 widths"
      note="The caption renders only with a known artist; the alt text then names both. Each specimen uses a plate near the aspect it demonstrates, so the box is what is shown. The three widths set the sizes attribute rather than the box. full is 960px from lg; half is 480px; half-from-md is 480px from lg and half the viewport below."
    >
      <div className="grid md:grid-cols-2 gap-4">
        {ASPECTS.map(({ aspect, label, image }) => (
          <div key={aspect} className="flex flex-col gap-2">
            <span className={LABEL}>{label}</span>
            <ImageWithCredit
              src={image.src}
              title={image.title}
              artist={image.artist}
              aspect={aspect}
              width="half-from-md"
            />
          </div>
        ))}
      </div>
    </Entry>
    <Entry
      title="Gallery"
      source="components/Gallery.tsx &middot; GalleryImage.tsx"
      note="Every plate renders at aspect-square whatever its own ratio; the lightbox then shows it whole. A tile is a button, not a link: it opens a real dialog with showModal, so focus trapping, Escape and focus restoration are native. Arrow keys step through the set, and a plate with known dimensions can be zoomed to full size."
    >
      <Gallery images={GALLERY} />
    </Entry>
  </Group>
);
