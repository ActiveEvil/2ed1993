import { DualScheme, Entry, Group, Source } from "./Shared";
import { BUNKER_ASSAULT, WARBIKE } from "./fixtures";
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
      source="card-decks/*/page.tsx &middot; wargear/wargear-cards/page.tsx"
      note="An artefact reproduces a printed object and keeps its printed cues: a black 4px frame in both schemes, a coloured mat around a --card-face surface in 2ed-black, its name centred, and a shadow, because a printed card floats on the page. The face dims in dark rather than following the scheme, and nothing on it may use --foreground. The mats are the deck colours: dark blue for mission and wargear cards, dark red for strategy cards, the discipline colour for psychic powers, mid blue for special warp cards. Two names sit on the mat: the mission card's in light yellow, as here, and the wargear card's in white with its points beside it in light yellow. Every other name sits on the face in dark blue. The markup lives in each deck page, not a component."
    >
      <Source>{BUNKER_ASSAULT.source}</Source>
      <DualScheme>
        <MissionCard />
      </DualScheme>
    </Entry>

    <Entry
      title="Datafax"
      source="components/Datafax.tsx &middot; datafax, factionSlug, unitName, unitTypeName, titleHref"
      note="The vehicle card: the faction colour as the mat, the name and the Datafax label on it in the faction ink from lib/factions.ts, then the data face and the damage face on --card-face. Rows alternate with --card-stripe. Weapon data is the WeaponStrip on its card surface; the hit location and damage charts stay black-headed tables. The two faces balance their blocks into columns by weight. With titleHref the title is an h3 link, as on the datafax pages."
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
