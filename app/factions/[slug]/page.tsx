import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Panel } from "@/components/Panel";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

const DASH = "–";
const DATAFAX_BASIS = "See datafax";
const DATAFAX_COST = "See Datafax";

const BAND = "md:px-2 bg-background font-title text-3xl text-center uppercase";
const RULE = "md:absolute -z-10 w-full h-1 bg-black border border-black";
const BAND_WRAPPER =
  "relative flex flex-col items-center justify-center gap-4 w-full";
const ROW = "flex items-baseline gap-2 text-lg";
const LEADER = "flex-1 border-b-2 border-dotted border-black";
const CELL = "whitespace-nowrap";
const LINK = "whitespace-nowrap underline underline-offset-4";

const toPlainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const formatPoints = (points: number): string =>
  `${points}${points === 1 ? "pt" : "pts"}`;

const formatAllowance = (min: number, max: number | null): string | null =>
  max === null ? null : max === min ? String(min) : `${min}${DASH}${max}`;

const formatCost = (points: number, basis: string | null): string => {
  switch (basis) {
    case "Per model upgrade":
      return `+${formatPoints(points)} per model`;
    case "Per model":
      return `${formatPoints(points)} per model`;
    case "Per base":
      return `${formatPoints(points)} per base`;
    default:
      return formatPoints(points);
  }
};

const entryCost = (entry: {
  points: number | null;
  points_bases: { name: string } | null;
  army_list_entry_options: { points: number | null }[];
}): string | null => {
  const basis = entry.points_bases?.name ?? null;

  if (basis === DATAFAX_BASIS) {
    return DATAFAX_COST;
  }

  if (entry.points !== null) {
    return formatCost(entry.points, basis);
  }

  const options = entry.army_list_entry_options
    .map(({ points }) => points)
    .filter((points): points is number => points !== null);

  if (!options.length) {
    return null;
  }

  const lowest = Math.min(...options);
  const highest = Math.max(...options);

  return lowest === highest
    ? formatPoints(highest)
    : `${lowest}${DASH}${formatPoints(highest)}`;
};

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("name, description")
    .eq("slug", params.slug)
    .single();

  assertNoQueryErrors("/factions/[slug]", factionError);

  if (faction) {
    const { name, description } = faction;
    return {
      title: name + " in Warhammer 40,000 2nd Edition | 2ed1993",
      description: toPlainText(description),
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select(
      `slug, name, description, images(file_name, artist, title), army_lists(id, name, description, unit_categories(category, note, position, army_list_entries(id, position, allowance_min, allowance_max, points, note, points_bases(name), army_list_entry_options(points), units(id, name)))), wargear_categories(category, note, wargear_items(id, points, armour(name), weapons(name), units(id, name)))`,
    )
    .eq("slug", params.slug)
    .order("name", { referencedTable: "army_lists" })
    .order("position", { referencedTable: "army_lists.unit_categories" })
    .order("position", {
      referencedTable: "army_lists.unit_categories.army_list_entries",
    })
    .order("position", { referencedTable: "wargear_categories" })
    .order("position", {
      referencedTable: "wargear_categories.wargear_items",
    })
    .single();

  assertNoQueryErrors("/factions/[slug]", factionError);

  if (faction) {
    const heros = faction.images.slice(0, 2);
    const stockedSections = faction.wargear_categories.filter(
      ({ wargear_items }) => wargear_items.length,
    );

    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/factions",
              anchor: "Factions",
            },
            {
              anchor: faction.name,
            },
          ]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              {faction.name}
            </h1>
          </header>
          <section className="grid md:grid-cols-2 gap-4">
            {heros.length === 1 ? (
              <ImageWithCredit
                key={heros[0].file_name}
                src={`images/${heros[0].file_name}`}
                title={heros[0].title}
                artist={heros[0].artist}
                width="half-from-md"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {heros.map((hero) => (
                  <div key={hero.file_name}>
                    <ImageWithCredit
                      src={`images/${hero.file_name}`}
                      title={hero.title}
                      artist={hero.artist}
                      aspect="aspect-portrait"
                      width="half"
                    />
                  </div>
                ))}
              </div>
            )}
            <section
              className="dynamic-content flex flex-col justify-center gap-4"
              dangerouslySetInnerHTML={{ __html: faction.description }}
            />
          </section>
          {Boolean(faction.army_lists.length) && (
            <section className="flex flex-col gap-8">
              <div className={BAND_WRAPPER}>
                <hr className={RULE} />
                <h2 className={BAND}>Army Lists</h2>
              </div>
              {faction.army_lists.length > 1 && (
                <nav className="ordered-list">
                  <ol className="flex flex-col gap-2 text-2xl">
                    {faction.army_lists.map((list) => (
                      <li key={list.id}>
                        <Link
                          className="font-subtitle hover:underline underline-offset-4"
                          href={`/factions/${faction.slug}#${generateAnchorId(list.name)}`}
                        >
                          {list.name}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              {faction.army_lists.map((list) => {
                const listId = generateAnchorId(list.name);

                return (
                  <section
                    id={listId}
                    key={listId}
                    className="flex flex-col gap-6"
                  >
                    <h3 className="font-subtitle text-3xl">{list.name}</h3>
                    {list.description && (
                      <div
                        className="dynamic-content flex flex-col gap-4"
                        dangerouslySetInnerHTML={{ __html: list.description }}
                      />
                    )}
                    {list.unit_categories.map((section) => (
                      <div
                        key={section.category}
                        className="flex flex-col gap-2"
                      >
                        <h4 className="font-subtitle text-2xl capitalize">
                          {section.category}
                        </h4>
                        {section.note && <p>{section.note}</p>}
                        <ul className="flex flex-col gap-2">
                          {section.army_list_entries.map((entry) => {
                            const allowance = formatAllowance(
                              entry.allowance_min,
                              entry.allowance_max,
                            );
                            const cost = entryCost(entry);

                            return (
                              <li
                                key={entry.id}
                                className="flex flex-col gap-1"
                              >
                                <div className={ROW}>
                                  <Link
                                    href={`/profiles/${faction.slug}#${generateAnchorId(entry.units.name)}`}
                                    className={LINK}
                                  >
                                    {entry.units.name}
                                  </Link>
                                  {allowance && (
                                    <span className={CELL}>{allowance}</span>
                                  )}
                                  {cost && (
                                    <>
                                      <span
                                        className={LEADER}
                                        aria-hidden="true"
                                      />
                                      <span className={CELL}>{cost}</span>
                                    </>
                                  )}
                                </div>
                                {entry.note && (
                                  <p className="text-sm">{entry.note}</p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </section>
                );
              })}
            </section>
          )}
          {Boolean(stockedSections.length) && (
            <section className="flex flex-col gap-8">
              <div className={BAND_WRAPPER}>
                <hr className={RULE} />
                <h2 className={BAND}>Equipment</h2>
              </div>
              <ul className="md:columns-3 gap-8 [&>*:nth-child(n+2)]:mt-4">
                {stockedSections.map((section) => (
                  <li
                    key={section.category}
                    className="flex flex-col gap-2 break-inside-avoid-column"
                  >
                    <h3 className="font-subtitle text-2xl capitalize">
                      {section.category}
                    </h3>
                    <p>{section.note}</p>
                    <ul>
                      {section.wargear_items.map((item) => {
                        if (item.armour) {
                          return (
                            <li key={item.id} className={ROW}>
                              <Link
                                href={`/wargear/armour#${generateAnchorId(item.armour.name)}`}
                                className={LINK}
                              >
                                {item.armour.name}
                              </Link>
                              <span className={LEADER} aria-hidden="true" />
                              <span className={CELL}>
                                {item.points}
                                {item.points === 1 ? "pt" : "pts"}
                              </span>
                            </li>
                          );
                        }

                        if (item.weapons) {
                          return (
                            <li key={item.id} className={ROW}>
                              <Link
                                href={`/wargear/weapons#${generateAnchorId(item.weapons.name)}`}
                                className={LINK}
                              >
                                {item.weapons.name}
                              </Link>
                              <span className={LEADER} aria-hidden="true" />
                              <span className={CELL}>
                                {item.points}
                                {item.points === 1 ? "pt" : "pts"}
                              </span>
                            </li>
                          );
                        }

                        if (item.units) {
                          return (
                            <li key={item.id} className={ROW}>
                              <Link
                                href={`/profiles/${faction.slug}#${generateAnchorId(item.units.name)}`}
                                className={LINK}
                              >
                                {item.units.name}
                              </Link>
                              <span className={LEADER} aria-hidden="true" />
                              <span className={CELL}>{DATAFAX_COST}</span>
                            </li>
                          );
                        }

                        return null;
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Panel>
      </>
    );
  }

  notFound();
}
