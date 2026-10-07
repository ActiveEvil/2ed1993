import { DualScheme, Entry, Fixture, Group, Source } from "./Shared";
import {
  BLAST_2,
  BLOCKQUOTE,
  HOUSE_RULE,
  ORDERED_LIST,
  TEXT_BLOCK,
  WARBIKE,
} from "./fixtures";
import { SpecialRuleSection } from "@/components/SpecialRuleSection";
import { generateAnchorId } from "@/lib/anchors";

const RULE_ID = `${generateAnchorId(BLAST_2.name)}_Rule`;

const CONTROLS = WARBIKE.datafax.damage_charts[0].damage_chart_results[2];

export const ContentBlocks: React.FC = (): React.JSX.Element => (
  <Group title="Content blocks">
    <Entry
      title="Prose, headings and links"
      source=".dynamic-content &middot; .measure &middot; .compact"
      note="Injected HTML from the database, styled entirely by the .dynamic-content rules; no classes are authored per rule. h3 and h4 switch to Plex, paragraphs and list items are 18px, and links are bolder and underlined at a 4px offset. Rules pages add .measure, which caps headings, paragraphs, lists, house rules and blockquotes at 65ch and leaves charts and tables alone; every prose specimen here is set at it. Army lists and datafaxes add .compact instead: 14px text, tighter paragraphs and smaller chart cells."
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
      note="The one block whose colour follows the scheme, through --house-rule-accent: dark blue in light, light blue in dark. The body is italic, and a strong inside it returns to normal. The label is 12px, which is why the light accent is dark blue rather than mid blue: mid blue falls under AA at that size."
    >
      <Source>{HOUSE_RULE.source}</Source>
      <DualScheme>
        <Fixture html={HOUSE_RULE.html} measure />
      </DualScheme>
    </Entry>

    <Entry
      title="Blockquote"
      source=".blockquote-container &middot; fixed green"
      note="Fixed light green with dark ink in both schemes, like a card face. This is the one place source text is reproduced word for word, and it carries a credit and a cite."
    >
      <Source>{BLOCKQUOTE.source}</Source>
      <Fixture html={BLOCKQUOTE.html} measure />
    </Entry>

    <Entry
      title="Numbered sequences"
      source=".ordered-list &middot; .small-markers"
      note='Markers are CSS counters using counters(item, "."), so a nested list numbers 2.1 without the source knowing where it sits. The first child of a step displays inline. .small-markers drops the marker from 24px to 18px.'
    >
      <Source>{ORDERED_LIST.source}</Source>
      <Fixture html={ORDERED_LIST.html} measure />
    </Entry>

    <Entry
      title="SpecialRuleSection"
      source="components/SpecialRuleSection.tsx &middot; id, name, href, html, related"
      note="A named rule on the weapons and armour references: a SectionHeading h3 that links to itself, the rule's prose at the measure, and a See line when the rule has a chapter of its own. It carries data-search, so the filter can hide it, and its id is what a strip's data-refs names, so a visible strip keeps the rules it cites. Targeted, the whole section turns light yellow."
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
