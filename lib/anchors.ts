import slugify from "@sindresorhus/slugify";

export const generateAnchorId = (name: string): string =>
  slugify(name, {
    separator: "_",
    lowercase: false,
    decamelize: false,
    preserveCharacters: ["-", "."],
  });

type Availability = { name: string; position: number };

export const cardAnchorId = (
  name: string,
  availabilities: readonly (Availability | null)[],
  origin: string,
): string =>
  generateAnchorId(
    [
      name,
      ...availabilities
        .filter((row): row is Availability => row !== null)
        .sort((a, b) => a.position - b.position)
        .map((row) => row.name),
      origin,
    ].join(" "),
  );

export const deckCardAnchorId = (name: string, origin: string): string =>
  generateAnchorId(`${name} ${origin}`);

export const wargearCardHref = (card: {
  name: string;
  origin: string;
  wargear_cards_availabilities: { availabilities: Availability | null }[];
}): string =>
  `/wargear/wargear-cards#${cardAnchorId(
    card.name,
    card.wargear_cards_availabilities.map(
      ({ availabilities }) => availabilities,
    ),
    card.origin,
  )}`;

export const vehicleCardHref = (card: {
  name: string;
  origin: string;
  vehicle_cards_availabilities: { availabilities: Availability | null }[];
}): string =>
  `/wargear/vehicle-cards#${cardAnchorId(
    card.name,
    card.vehicle_cards_availabilities.map(
      ({ availabilities }) => availabilities,
    ),
    card.origin,
  )}`;

export const ruleHref = (
  rule: { name: string; rule_categories: { slug: string } },
  anchor?: string | null,
): string =>
  `/rules/${rule.rule_categories.slug}#${anchor ?? generateAnchorId(rule.name)}`;

export const hasFactionChapter = (rule: {
  rule: string | null;
  wargear_items: unknown[];
}): boolean => rule.rule !== null && rule.wargear_items.length === 0;

export const FACET_HASH = "available-";

export const hashId = (hash: string): string => {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
};

export const facetHref = (name: string): string =>
  `#${FACET_HASH}${name.toLowerCase().replace(/\s+/g, "-")}`;
