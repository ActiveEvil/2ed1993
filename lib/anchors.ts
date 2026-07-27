import slugify from "@sindresorhus/slugify";

/**
 * Derives the in-page anchor id for a named entity (rule, weapon, heading).
 *
 * Options are deliberate:
 * - separator "_" + lowercase false preserve the existing `Vehicle_Datafax`
 *   format. Every href already authored in the database depends on it.
 * - preserveCharacters "-" stops hyphens becoming word breaks
 *   (`Hand-to-Hand` must not become `Hand_to_Hand`).
 * - preserveCharacters "." keeps `Blast 1.5"` as `Blast_1.5` rather than
 *   `Blast_15`. A "." is unreserved in a URL fragment and valid in an HTML id.
 * - decamelize false stops names splitting on internal capitals.
 */
export const generateAnchorId = (name: string): string =>
  slugify(name, {
    separator: "_",
    lowercase: false,
    decamelize: false,
    preserveCharacters: ["-", "."],
  });
