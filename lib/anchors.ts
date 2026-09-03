import slugify from "@sindresorhus/slugify";

export const generateAnchorId = (name: string): string =>
  slugify(name, {
    separator: "_",
    lowercase: false,
    decamelize: false,
    preserveCharacters: ["-", "."],
  });

export const ruleHref = (
  rule: { name: string; rule_categories: { slug: string } },
  anchor?: string | null,
): string =>
  `/rules/${rule.rule_categories.slug}#${anchor ?? generateAnchorId(rule.name)}`;

export const FACET_HASH = "available-";

export const facetHref = (name: string): string =>
  `#${FACET_HASH}${name.toLowerCase().replace(/\s+/g, "-")}`;
