import { Entry, Group } from "./Shared";
import { FactionCard, IndexCard } from "@/components/Cards";

export const Cards: React.FC = (): React.JSX.Element => (
  <Group id="Cards" title="Cards">
    <Entry
      title="IndexCard"
      source="components/Cards.tsx &middot; href, title, summary"
      note="Only the title is a link; the list beneath carries its own deep links. The summary rule is mid-blue in both schemes, unlike a house rule, which follows the accent."
    >
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
    </Entry>

    <Entry
      title="FactionCard"
      source="components/Cards.tsx &middot; href, name, image"
      note="The name and the image are one link. The Logo sits over the plate and reads its size from the card; with no image the card is the Logo alone. The Logo is fixed as an h2 here, which is why two appear in this page's outline."
    >
      <div className="grid md:grid-cols-2 gap-4">
        <FactionCard
          href="/factions/eldar"
          name="Eldar"
          image={{
            src: "images/Eldar.jpg",
            title: "Eldar",
            artist: "Geoff Taylor",
          }}
        />
        <FactionCard href="/factions/eldar" name="No image" />
      </div>
    </Entry>
  </Group>
);
