import { DualScheme, Entry, Group, Source } from "./Shared";
import {
  BUNKER_ASSAULT,
  HUNTER_KILLER_MISSILE,
  PSYCANNON,
  WARBIKE,
} from "./fixtures";
import { CardFace } from "@/components/CardFace";
import { Datafax } from "@/components/Datafax";

const MissionCard: React.FC = () => (
  <article className="flex flex-col items-center gap-2 p-4 border-4 border-frame bg-2ed-dark-blue shadow-lg">
    <h3 className="font-subtitle uppercase text-2xl text-2ed-light-yellow text-center">
      {BUNKER_ASSAULT.name}
    </h3>
    <div className="flex flex-col gap-4 p-4 w-full h-full bg-card-face text-2ed-black">
      <p
        className="text-lg"
        dangerouslySetInnerHTML={{ __html: BUNKER_ASSAULT.description }}
      />
      {BUNKER_ASSAULT.objectives.map(({ heading, html }) => (
        <div key={heading} className="flex flex-col gap-2">
          <h4 className="font-subtitle font-bold text-xl text-2ed-dark-red text-center">
            {heading}
          </h4>
          <div
            className="dynamic-content flex flex-col gap-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ))}
    </div>
  </article>
);

export const Artefacts: React.FC = (): React.JSX.Element => (
  <Group title="Artefacts">
    <Entry
      title="Card face"
      source="card-decks/*/page.tsx &middot; components/CardFace.tsx"
      note="An artefact reproduces a printed object: a black 4px frame in both schemes, a coloured mat around a --card-face surface in 2ed-black, its name centred, and a shadow. The face dims in dark rather than following the scheme, and nothing on it uses --foreground. Mats are the deck colours: dark blue for mission and wargear cards, dark red for strategy, the discipline colour for psychic powers, mid blue for special warp, the availability colour for vehicle cards. Three names sit on the mat: the mission card's in light yellow, the wargear card's in white with points in light yellow, the vehicle card's with points in the mat's ink. Every other name sits on the face in dark blue. Wargear and vehicle cards share CardFace; the other decks keep their markup in their deck page."
    >
      <Source>{BUNKER_ASSAULT.source}</Source>
      <DualScheme>
        <MissionCard />
      </DualScheme>
    </Entry>

    <Entry
      title="Wargear and vehicle cards"
      source="components/CardFace.tsx &middot; deck, card, as"
      note="One face for both decks. A wargear card sits on dark blue, shows its rarity at the foot, may carry armour strips, and lists special rules for an Infantry bearer. A vehicle card takes the mat of its first availability (dark red for Any Army, then the Imperial Guard, Eldar, Orks and Chaos colours), sets its name, points and chips in that mat's ink, has no rarity, and lists special rules for a Vehicle bearer. Every availability shows as a chip. Both anchor on the name followed by each availability, as Psycannon_Imperium. A linked weapon's or armour's rules print beneath the card text unless that text already links them."
    >
      <Source>
        {PSYCANNON.source} &middot; {HUNTER_KILLER_MISSILE.source}
      </Source>
      <div className="grid md:grid-cols-2 gap-4">
        <CardFace deck="wargear" card={PSYCANNON.card} as="h3" />
        <CardFace deck="vehicle" card={HUNTER_KILLER_MISSILE.card} as="h3" />
      </div>
    </Entry>

    <Entry
      title="Datafax"
      source="components/Datafax.tsx &middot; datafax, factionSlug, unitName, unitTypeName, titleHref"
      note="A vehicle's datafax: the faction colour as mat, the name and Datafax label in the faction ink from lib/factions.ts, then the data and damage faces on --card-face, rows alternating with --card-stripe. Weapon data is the WeaponStrip on its card surface; the hit location and damage charts are black-headed tables. The faces balance their blocks into columns by weight. With titleHref the title is an h3 link."
    >
      <Source>{WARBIKE.source}</Source>
      <Datafax
        datafax={WARBIKE.datafax}
        factionSlug={WARBIKE.factionSlug}
        unitName={WARBIKE.unitName}
        unitTypeName={WARBIKE.unitTypeName}
        titleHref={`/datafaxes/${WARBIKE.factionSlug}#${WARBIKE.unitName}`}
      />
    </Entry>
  </Group>
);
