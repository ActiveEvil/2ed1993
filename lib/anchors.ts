import slugify from "@sindresorhus/slugify";

export const generateAnchorId = (name: string): string =>
  slugify(name, {
    separator: "_",
    lowercase: false,
    decamelize: false,
    preserveCharacters: ["-", "."],
  });

export const FACET_HASH = "available-";

export const facetHref = (name: string): string =>
  `#${FACET_HASH}${name.toLowerCase().replace(/\s+/g, "-")}`;
