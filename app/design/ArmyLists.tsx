import { Entry, Group, Source } from "./Shared";
import { IMPERIAL_GUARD_SUMMARY, ROUGH_RIDERS } from "./fixtures";
import { ArmyListSummary } from "@/components/ArmyListSummary";
import {
  CharacteristicTable,
  ProfileFrame,
} from "@/components/CharacteristicProfile";
import { UnitEquipment } from "@/components/UnitEquipment";

export const ArmyLists: React.FC = (): React.JSX.Element => (
  <Group title="Army lists">
    <Entry
      title="ArmyListSummary"
      source="components/ArmyListSummary.tsx &middot; bands, allies, strategyRating"
      note="The head of an army list: the composition bands as an h2 chart, label and value pairs at span 3 and span 3, then the strategy rating and the allies as Chips, with any ally's note beneath. A band with no limit is left out, and with nothing to show the component renders nothing."
    >
      <Source>{IMPERIAL_GUARD_SUMMARY.source}</Source>
      <ArmyListSummary
        bands={IMPERIAL_GUARD_SUMMARY.bands}
        allies={IMPERIAL_GUARD_SUMMARY.allies}
        strategyRating={IMPERIAL_GUARD_SUMMARY.strategyRating}
      />
    </Entry>

    <Entry
      title="Army list entry"
      source="components/CharacteristicProfile.tsx &middot; UnitEquipment.tsx"
      note="A ProfileFrame around the CharacteristicTable and UnitEquipment, as the army-list page sets each entry. The table is black-headed and striped --background and --stripe, the same look as a prose table; each row is headed by its profile name, and an alternative profile is marked —or— above its row. UnitEquipment lays out weapons, armour, options and special rules in a LabelledTable: Plex labels at 12px down the left, compact prose in the cells, groups striped by tbody. Wargear categories link to their section on the list page when the list stocks them; on this page they have nowhere to go, so they are text."
    >
      <Source>{ROUGH_RIDERS.source}</Source>
      <ProfileFrame className="min-w-0">
        <CharacteristicTable
          caption={`${ROUGH_RIDERS.unit.name} profile`}
          rows={ROUGH_RIDERS.rows}
          costLabel="Pts"
        />
        <UnitEquipment
          unit={ROUGH_RIDERS.unit}
          compact
          rulesSlug={ROUGH_RIDERS.rulesSlug}
          categoryHref={() => null}
          className="border-t-4 border-frame"
        />
      </ProfileFrame>
    </Entry>
  </Group>
);
