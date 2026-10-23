import { DualScheme, Entry, Fixture, Group, Source } from "./Shared";
import {
  ARID_TERRAIN,
  BLAST_2,
  BLOCKQUOTE,
  HOUSE_RULE,
  MAGAZINE_ASIDE,
  ORDERED_LIST,
  TEXT_BLOCK,
  WARBIKE,
} from "./fixtures";
import { MagazineBand } from "@/components/Heading";
import { SpecialRuleSection } from "@/components/SpecialRuleSection";
import { generateAnchorId } from "@/lib/anchors";
import { bandHeadings, markExtensions } from "@/lib/magazine";

const RULE_ID = `${generateAnchorId(BLAST_2.name)}_Rule`;

const CONTROLS = WARBIKE.datafax.damage_charts[0].damage_chart_results[2];

export const ContentBlocks: React.FC = (): React.JSX.Element => (
  <Group title="Content blocks">
    <Entry
      title="Prose, headings and links"
      source=".dynamic-content &middot; .measure &middot; .compact"
      note="Injected HTML from the database, styled by the .dynamic-content rules alone. h3 and h4 switch to Plex, paragraphs and list items are 18px, links are bolder and underlined at a 4px offset. Rules pages add .measure, capping headings, paragraphs, lists, house rules and blockquotes at 65ch and leaving charts and tables alone; every prose specimen here uses it. Army lists and datafaxes add .compact: 14px text, tighter paragraphs, smaller chart cells."
    >
      <Source>{TEXT_BLOCK.source} &middot; .measure</Source>
      <Fixture html={TEXT_BLOCK.html} measure />
      <Source>
        {WARBIKE.source} &middot; damage chart, roll 3 &middot; .compact
      </Source>
      <Fixture html={CONTROLS.effect} compact />
    </Entry>

    <Entry
      title="House rule"
      source=".house-rule &middot; follows the accent"
      note="The one block whose colour follows the scheme, through --house-rule-accent: dark blue in light, light blue in dark. The body is italic; a strong inside returns to normal. The label is 12px, which is why the light accent is dark blue: mid blue fails AA at that size."
    >
      <Source>{HOUSE_RULE.source}</Source>
      <DualScheme>
        <Fixture html={HOUSE_RULE.html} measure />
      </DualScheme>
    </Entry>

    <Entry
      title="Magazine material"
      source=".mag &middot; .mag-aside &middot; --mag-strong on --mag-ink"
      note="Rules and extensions from Citadel Journal and White Dwarf. A whole rule is a block: the heading row becomes a band carrying the citation from rules.source, with optional added by the renderer; each h3 inside is a slim band joined to the spine; a spine runs down the right edge; a foot closes it. An extension is the same block at the prose width, built from a house-rule aside whose label names the magazine, with the citation lifted from data-source into the head. Black in both schemes, like the frames. The rail marks a whole rule with a square and no words."
    >
      <Source>{ARID_TERRAIN.source}</Source>
      <DualScheme>
        <section className="mag flex flex-col gap-4">
          <MagazineBand source={ARID_TERRAIN.citation}>
            {ARID_TERRAIN.name}
          </MagazineBand>
          <Fixture html={bandHeadings(ARID_TERRAIN.html)} measure />
        </section>
      </DualScheme>
      <Source>{MAGAZINE_ASIDE.source}</Source>
      <DualScheme>
        <Fixture html={markExtensions(MAGAZINE_ASIDE.html)} measure />
      </DualScheme>
    </Entry>

    <Entry
      title="Blockquote"
      source=".blockquote-container &middot; fixed green"
      note="Fixed light green with dark ink in both schemes. The one place source text is reproduced verbatim; it carries a credit and a cite."
    >
      <Source>{BLOCKQUOTE.source}</Source>
      <Fixture html={BLOCKQUOTE.html} measure />
    </Entry>

    <Entry
      title="Numbered sequences"
      source=".ordered-list &middot; .small-markers"
      note='Markers are CSS counters using counters(item, "."), so a nested list numbers 2.1 without the source knowing its depth. The first child of a step displays inline. .small-markers drops the marker from 24px to 18px.'
    >
      <Source>{ORDERED_LIST.source}</Source>
      <Fixture html={ORDERED_LIST.html} measure />
    </Entry>

    <Entry
      title="SpecialRuleSection"
      source="components/SpecialRuleSection.tsx &middot; id, name, href, html, related"
      note="A named rule on the weapons and armour references: a SectionHeading h3 linking to itself, the prose at the measure, and a See line where the rule has its own chapter. It carries data-search for the filter, and its id is what a strip's data-refs names, so a visible strip keeps the rules it cites. Targeted, the section turns light yellow."
    >
      <Source>{BLAST_2.source}</Source>
      <SpecialRuleSection
        id={RULE_ID}
        name={BLAST_2.name}
        href={`/design#${RULE_ID}`}
        html={BLAST_2.html}
        related={BLAST_2.related}
      />
    </Entry>
  </Group>
);
