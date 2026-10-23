export const magazineHead = (citation: string): string =>
  `${citation}, optional`;

const ASIDE =
  /<section class="house-rule"((?:\s+[a-z-]+="[^"]*")*)>(\s*<span class="label">(Citadel Journal|White Dwarf)[^<]*<\/span>)/g;

const CHART = /<section class="chart"[^>]*>[\s\S]*?<\/section>/g;

export const markExtensions = (html: string): string =>
  html.replace(ASIDE, (_, attrs: string, label: string, magazine: string) => {
    const source = /\sdata-source="([^"]*)"/.exec(attrs)?.[1];
    const head = magazineHead(source || magazine);

    return `<section class="house-rule mag-aside"${attrs}>${label}<div class="mag-head">${head}</div>`;
  });

export const bandHeadings = (html: string): string => {
  const out: string[] = [];
  let last = 0;

  for (const chart of html.matchAll(CHART)) {
    out.push(wrapHeadings(html.slice(last, chart.index)), chart[0]);
    last = chart.index + chart[0].length;
  }

  out.push(wrapHeadings(html.slice(last)));

  return out.join("");
};

const wrapHeadings = (html: string): string =>
  html.replace(/<h3\b[^>]*>[\s\S]*?<\/h3>/g, '<div class="mark-band">$&</div>');
