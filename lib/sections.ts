import { parse } from "node-html-parser";

export type Subsection = { id: string; name: string };

/**
 * Subsection headings inside a rule's stored HTML.
 *
 * Chart titles are <h3 id> as well, so they are collected first and excluded
 * by id. Parsed rather than matched: the site wraps prose mid-tag, so a
 * pattern over this markup is unreliable.
 */
export const extractSubsections = (html: string): Subsection[] => {
  const root = parse(html);

  const chartIds = new Set(
    root
      .querySelectorAll("section.chart h3[id]")
      .map((heading) => heading.getAttribute("id")),
  );

  return root
    .querySelectorAll("h3[id]")
    .map((heading) => ({
      id: heading.getAttribute("id") ?? "",
      name: heading.text.trim(),
    }))
    .filter(({ id }) => id !== "" && !chartIds.has(id));
};
