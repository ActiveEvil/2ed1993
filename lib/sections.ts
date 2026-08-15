import { parse } from "node-html-parser";

export type Subsection = { id: string; name: string };

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
