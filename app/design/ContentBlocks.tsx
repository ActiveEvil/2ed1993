import { DualScheme, Entry, Fixture, Group } from "./Shared";
import { BLOCKQUOTE, HOUSE_RULE, ORDERED_LIST, TEXT_BLOCK } from "./fixtures";

export const ContentBlocks: React.FC = (): React.JSX.Element => (
  <Group id="Content_Blocks" title="Content blocks">
    <Entry
      title="Prose, headings and links"
      source=".dynamic-content"
      note="Injected HTML from the database, styled entirely by the .dynamic-content rules; no classes are authored per rule. h3 and h4 switch to subtitle, paragraphs and list items are 18px, and links are bolder and underlined at a 4px offset."
    >
      <Fixture html={TEXT_BLOCK} />
    </Entry>

    <Entry
      title="House rule"
      source=".house-rule &middot; follows the accent"
      note="The one block whose colour follows the scheme: mid-blue in light, light-blue in dark. The body is italic, and a strong inside it returns to normal. The label is 12px, which puts the light pair under AA."
    >
      <DualScheme>
        <Fixture html={HOUSE_RULE} />
      </DualScheme>
    </Entry>

    <Entry
      title="Blockquote"
      source=".blockquote-container &middot; fixed green"
      note="Fixed light green with dark ink in both schemes, like a card face. This is the one place source text is reproduced word for word, and it carries a credit and a cite."
    >
      <Fixture html={BLOCKQUOTE} />
    </Entry>

    <Entry
      title="Numbered sequences"
      source=".ordered-list &middot; .small-markers"
      note='Markers are CSS counters using counters(item, "."), so a nested list numbers 2.1 without the source knowing where it sits. The first child of a step displays inline. .small-markers drops the marker from 24px to 18px.'
    >
      <Fixture html={ORDERED_LIST} />
    </Entry>
  </Group>
);
