const TITLE_SUFFIX = " | 2ed1993";

export const pageTitle = (subject: string): string => {
  const long = `${subject} in Warhammer 40,000 2nd Edition`;

  if (`${long}${TITLE_SUFFIX}`.length <= 60) {
    return long;
  }

  return `${subject} in 40k 2nd Edition`;
};

const joinWithAnd = (items: readonly string[]): string => {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

export const joinWithinBudget = (
  items: readonly string[],
  prefix: string,
  suffix: string,
  max = 155,
): string => {
  let chosen: string[] = [];

  for (const item of items) {
    const next = [...chosen, item];

    if (
      chosen.length > 0 &&
      `${prefix}${joinWithAnd(next)}${suffix}`.length > max
    ) {
      break;
    }

    chosen = next;
  }

  return `${prefix}${joinWithAnd(chosen)}${suffix}`;
};

export const toPlainText = (html: string, maxLength?: number): string => {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  if (maxLength === undefined || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
};

export const armyListShortName = (
  name: string,
  factionName: string,
): string => {
  const prefix = `${factionName}: `;

  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
};
