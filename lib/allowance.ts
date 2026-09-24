type Rule = {
  id: number;
  count: number;
  per_count: number;
  note: string | null;
  qualifier: string | null;
  label: string | null;
  per_entry_id: number | null;
  per_set_id: number | null;
  per_rule_id: number | null;
};

type Entry = {
  id: number;
  allowance_max: number | null;
  units: { name: string };
  army_list_allowance_rules: readonly Rule[];
};

type Band = {
  id: number;
  army_list_allowance_rules: readonly Rule[];
  army_list_entries: readonly Entry[];
};

type AllowanceSet = {
  id: number;
  name: string | null;
  singular: string | null;
  army_list_allowance_set_entries: readonly { army_list_entry_id: number }[];
  army_list_allowance_rules: readonly Rule[];
};

type Governed = {
  lead: string;
  more: boolean;
  singular: string | null;
  plural: string | null;
};

type Line = { id: number; text: string };

const WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

const number = (n: number): string => WORDS[n - 1] ?? String(n);

const join = (items: readonly string[], conjunction: "and" | "or"): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`
    : (items[0] ?? "");

const plural = (name: string): string => `${name}s`;

const capitalise = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

const unique = (items: readonly string[]): string[] => [...new Set(items)];

export const allowances = (
  bands: readonly Band[],
  sets: readonly AllowanceSet[],
) => {
  const placed = bands.flatMap((band) =>
    band.army_list_entries.map((entry) => ({ entry, band: band.id })),
  );
  const entryById = new Map(placed.map(({ entry }) => [entry.id, entry]));
  const pageOrder = new Map(
    placed.map(({ entry }, index) => [entry.id, index]),
  );
  const bandOf = new Map(placed.map(({ entry, band }) => [entry.id, band]));
  const setById = new Map(sets.map((set) => [set.id, set]));
  const ruleById = new Map(
    [
      ...bands.flatMap((band) => band.army_list_allowance_rules),
      ...placed.flatMap(({ entry }) => entry.army_list_allowance_rules),
      ...sets.flatMap((set) => set.army_list_allowance_rules),
    ].map((rule) => [rule.id, rule]),
  );

  const members = (set: AllowanceSet): Entry[] =>
    set.army_list_allowance_set_entries.flatMap(({ army_list_entry_id }) => {
      const entry = entryById.get(army_list_entry_id);

      return entry ? [entry] : [];
    });

  const names = (set: AllowanceSet): string[] =>
    members(set).map(({ units }) => units.name);

  const setSingular = (set: AllowanceSet): string =>
    set.singular ?? join(names(set), "or");

  const setPlural = (set: AllowanceSet, conjunction: "and" | "or"): string =>
    set.name ?? join(names(set).map(plural), conjunction);

  const homeBand = (set: AllowanceSet): number | undefined => {
    const [first] = set.army_list_allowance_set_entries;

    return first && bandOf.get(first.army_list_entry_id);
  };

  const per = (rule: Rule): { text: string; order: number } | null => {
    const many = rule.per_count > 1;

    if (rule.per_entry_id !== null) {
      const entry = entryById.get(rule.per_entry_id);

      if (!entry) {
        return null;
      }

      return {
        text: many
          ? `${number(rule.per_count)} ${plural(entry.units.name)}`
          : entry.units.name,
        order: pageOrder.get(entry.id) ?? Infinity,
      };
    }

    if (rule.per_set_id !== null) {
      const set = setById.get(rule.per_set_id);
      const [first] = set ? members(set) : [];

      if (!set || !first) {
        return null;
      }

      return {
        text: many
          ? `${number(rule.per_count)} ${setPlural(set, "or")}`
          : setSingular(set),
        order: pageOrder.get(first.id) ?? Infinity,
      };
    }

    return null;
  };

  const lines = (rules: readonly Rule[], governed: Governed): Line[] => {
    const out: Line[] = [];
    const merged = new Map<
      number,
      { id: number; targets: { text: string; order: number }[] }
    >();
    const counted = new Map<number, { id: number; labels: string[] }>();
    const more = governed.more ? " more" : "";

    const tier = (rule: Rule): string | null => {
      if (rule.per_rule_id === null) {
        return null;
      }

      const label = ruleById.get(rule.per_rule_id)?.label;

      if (!label) {
        throw new Error(
          `Allowance rule ${rule.id} counts rule ${rule.per_rule_id}, which has no label`,
        );
      }

      return label;
    };

    const each = (labels: readonly string[], count: number): string => {
      const subject = count === 1 ? governed.singular : governed.plural;

      if (subject === null) {
        throw new Error("A rule counted per rule must govern an entry or set");
      }

      return `Each ${join(labels, "or")} taken allows ${number(count)} more ${subject}`;
    };

    for (const rule of [...rules].sort((a, b) => a.id - b.id)) {
      if (rule.note !== null) {
        out.push({ id: rule.id, text: rule.note });
        continue;
      }

      const label = tier(rule);

      if (label !== null) {
        if (rule.qualifier !== null) {
          out.push({
            id: rule.id,
            text: `${each([label], rule.count)}, ${rule.qualifier}`,
          });
        } else {
          const group = counted.get(rule.count);

          if (group) {
            group.labels.push(label);
          } else {
            counted.set(rule.count, { id: rule.id, labels: [label] });
          }
        }

        continue;
      }

      const target = per(rule);

      if (target === null) {
        continue;
      }

      if (rule.qualifier !== null) {
        out.push({
          id: rule.id,
          text: `${governed.lead}${number(rule.count)}${more} per ${target.text}, ${rule.qualifier}`,
        });
        continue;
      }

      const group = merged.get(rule.count);

      if (group) {
        group.targets.push(target);
      } else {
        merged.set(rule.count, { id: rule.id, targets: [target] });
      }
    }

    const parts = [...merged].map(
      ([count, { targets }]) =>
        `${number(count)}${more} per ${join(
          unique(
            [...targets]
              .sort((a, b) => a.order - b.order)
              .map(({ text }) => text),
          ),
          "or",
        )}`,
    );

    if (parts.length) {
      out.push({
        id: Math.min(...[...merged.values()].map(({ id }) => id)),
        text: `${governed.lead}${parts.join(", or ")}`,
      });
    }

    for (const [count, { id, labels }] of counted) {
      out.push({ id, text: each(unique(labels), count) });
    }

    return out.sort((a, b) => a.id - b.id);
  };

  const setLine = (set: AllowanceSet): string | null => {
    const entries = members(set);
    const ids = new Set(entries.map(({ id }) => id));

    if (
      set.name === null ||
      bands.some(
        ({ army_list_entries }) =>
          army_list_entries.length === ids.size &&
          army_list_entries.every(({ id }) => ids.has(id)),
      )
    ) {
      return null;
    }

    const all = entries.map(({ units }) => units.name);
    const last = all.map((name) => name.slice(name.lastIndexOf(" ") + 1));
    const shared =
      all.length > 1 &&
      all.every((name, index) => name.includes(" ") && last[index] === last[0]);
    const named = shared
      ? `${join(
          all.map((name) => name.slice(0, name.lastIndexOf(" "))),
          "and",
        )} ${plural(last[0])}`
      : join(all.map(plural), "and");

    return `${capitalise(set.name)} are the ${named}.`;
  };

  return {
    entry: (entry: Entry): string[] =>
      lines(entry.army_list_allowance_rules, {
        lead: "Up to ",
        more: entry.allowance_max !== null,
        singular: entry.units.name,
        plural: plural(entry.units.name),
      }).map(({ text }) => text),
    band: (band: Band): string[] => {
      const home = sets.filter((set) => homeBand(set) === band.id);

      return [
        ...home.map(setLine).filter((text): text is string => text !== null),
        ...[
          ...lines(band.army_list_allowance_rules, {
            lead: "Up to ",
            more: false,
            singular: null,
            plural: null,
          }),
          ...home.flatMap((set) =>
            lines(set.army_list_allowance_rules, {
              lead: `${capitalise(setPlural(set, "and"))}: up to `,
              more: false,
              singular: setSingular(set),
              plural: setPlural(set, "or"),
            }),
          ),
        ]
          .sort((a, b) => a.id - b.id)
          .map(({ text }) => text),
      ];
    },
  };
};
