import { ContentsTable } from "@/components/ContentsTable";
import { SectionHeading } from "@/components/Heading";
import { dimensionsOf } from "@/components/ImageWithCredit";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { Logo } from "@/components/Logos";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { TitleBand } from "@/components/TitleBand";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Rules & Army Lists",
    description:
      "A record of the Warhammer 40,000 2nd Edition rules, army lists, unit profiles, weapons, wargear, cards and vehicle datafaxes.",
  };
}

export default async function Page() {
  const heroImagesQuery = supabase
    .from("hero_images")
    .select("images(file_name, artist, title, width, height)")
    .eq("slug", "home")
    .order("position");
  const chaptersQuery = supabase
    .from("rule_categories")
    .select("id", { count: "exact", head: true });
  const sectionsQuery = supabase
    .from("rules")
    .select("id", { count: "exact", head: true });
  const factionsQuery = supabase
    .from("factions")
    .select("id", { count: "exact", head: true })
    .is("parent_faction_id", null);
  const datafaxesQuery = supabase
    .from("datafaxes")
    .select("units!inner(unit_types(plural_name, position))");
  const subfactionsQuery = supabase
    .from("factions")
    .select("id", { count: "exact", head: true })
    .not("parent_faction_id", "is", null);
  const wargearQuery = Promise.all(
    (["weapons", "armour", "wargear_cards"] as const).map((table) =>
      supabase.from(table).select("id", { count: "exact", head: true }),
    ),
  );
  const decksQuery = Promise.all(
    (
      [
        "mission_cards",
        "strategy_cards",
        "psychic_power_cards",
        "special_warp_cards",
      ] as const
    ).map((table) =>
      supabase.from(table).select("id", { count: "exact", head: true }),
    ),
  );

  const [
    { data: heroImages, error: heroImageError },
    { count: chapters, error: chaptersError },
    { count: sections, error: sectionsError },
    { count: factions, error: factionsError },
    { data: datafaxRows, error: datafaxesError },
    { count: subfactions, error: subfactionsError },
    wargear,
    decks,
  ] = await Promise.all([
    heroImagesQuery,
    chaptersQuery,
    sectionsQuery,
    factionsQuery,
    datafaxesQuery,
    subfactionsQuery,
    wargearQuery,
    decksQuery,
  ]);
  const heros = heroImages?.map(({ images }) => images) ?? [];
  const [hero, second] = heros;

  assertNoQueryErrors(
    "/",
    heroImageError,
    chaptersError,
    sectionsError,
    factionsError,
    datafaxesError,
    subfactionsError,
    ...wargear.map(({ error }) => error),
    ...decks.map(({ error }) => error),
  );

  if (
    hero &&
    second &&
    chapters !== null &&
    sections !== null &&
    factions !== null &&
    datafaxRows &&
    subfactions !== null &&
    wargear.every(({ count }) => count !== null) &&
    decks.every(({ count }) => count !== null)
  ) {
    const [weaponCount, armourCount, wargearCardCount] = wargear.map(
      ({ count }) => count ?? 0,
    );
    const cardCount = decks.reduce(
      (total, { count }) => total + (count ?? 0),
      0,
    );
    const datafaxCounts = Object.values(
      datafaxRows.reduce<
        Record<string, { pluralName: string; position: number; count: number }>
      >((acc, { units }) => {
        const { plural_name: pluralName, position } = units.unit_types;
        acc[pluralName] = acc[pluralName] ?? {
          pluralName,
          position,
          count: 0,
        };
        acc[pluralName].count += 1;
        return acc;
      }, {}),
    ).sort((a, b) => a.position - b.position);

    const record = [
      {
        href: "/rules",
        title: "Rules",
        stat: `${chapters} chapters \u00b7 ${sections} sections`,
      },
      {
        href: "/factions",
        title: "Factions",
        stat: `${factions} factions \u00b7 ${subfactions} subfactions`,
      },
      {
        href: "/datafaxes",
        title: "Datafaxes",
        stat: `${datafaxCounts.map(({ pluralName, count }) => `${pluralName} ${count}`).join(" \u00b7 ")}`,
      },
      {
        href: "/wargear",
        title: "Wargear",
        stat: `${weaponCount} weapons \u00b7 ${armourCount} armour \u00b7 ${wargearCardCount} wargear cards`,
      },
      {
        href: "/card-decks",
        title: "Card Decks",
        stat: `${decks.length} decks \u00b7 ${cardCount} cards`,
      },
      {
        href: "/gallery",
        title: "Gallery",
        stat: "Classic Oldhammer Painting",
      },
    ];

    return (
      <Panel as="main" className="flex flex-col w-full max-w-5xl">
        <TitleBand
          heading={
            <Logo
              as="h1"
              size="xl"
              title="Oldhammer"
              subtitle="40K 2nd Edition"
              dropCaps
            />
          }
        >
          <div className="flex flex-col gap-4 w-full text-lg text-left">
            <p>
              2ed1993 is a record, not an archive&mdash;a digitised reference
              for playing Warhammer 40,000 2nd Edition. The intention is to
              collate and document every rule, army list, unit profile, FAQ, or
              similar material in one location.
            </p>
            <p>
              For reasons that should be obvious, this is not a direct copy of
              the original material produced by Games Workshop. Instead, it is a
              functionally identical yet legally distinct record&mdash;with an
              emphasis on clarity, inclusivity and accessibility.
            </p>
          </div>
        </TitleBand>

        <section className="group flex flex-col">
          <SectionBar as="h2" title="The Record" />
          <ContentsTable as="ul">
            {record.map(({ href, title, stat }) => (
              <li
                key={href}
                className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8 px-4 md:px-8 py-3"
              >
                <Link
                  href={href}
                  className="md:w-48 shrink-0 font-subtitle text-lg hover:underline underline-offset-4"
                >
                  {title}
                </Link>
                <span className="text-base">{stat}</span>
              </li>
            ))}
          </ContentsTable>
        </section>

        <article className="flex flex-col gap-4 mt-12 px-4 md:px-8 pb-4 md:pb-8">
          <SectionHeading>A Brief History</SectionHeading>
          <section className="flex flex-col gap-4 text-lg md:block md:columns-2 md:column-gap-8 md:[&>*+*]:mt-8">
            <ImageWithCredit
              src={`images/${hero.file_name}`}
              title={hero.title}
              artist={hero.artist}
              dimensions={dimensionsOf(hero)}
              aspect="aspect-retro"
              width="half-from-md"
            />
            <p>
              Warhammer 40,000 2nd Edition was released in 1993, succeeding
              Warhammer 40,000: Rogue Trader (1987). Whereas Rogue Trader was a
              roleplaying and tabletop wargaming hybrid, 2nd Edition established
              Warhammer 40,000 as the tabletop wargame we know today.
            </p>
            <p>
              Often referred to by collectors as the <i>Red Period</i>,
              Warhammer 40,000 2nd Edition is visually defined by its bright,
              high-contrast paint schemes, the introduction of the Goblin Green
              base, and of course Sci-Fi Cacti!
            </p>
            <p>
              It was also Warhammer 40,000&apos;s <i>Hero Hammer</i>{" "}
              edition&mdash;where certain characters were effectively an army
              unto themselves.
            </p>
            <p>
              Although mechanically complex by today&apos;s standards, 2nd
              Edition significantly streamlined the game. It introduced
              structured gameplay without the need for a gamemaster. It was the
              first edition to introduce Codex army books, expanding individual
              factions with unit profiles, wargear, special characters, and
              bespoke army lists. The edition also established the foundational
              lore of the Warhammer 40,000 universe as we would recognise it
              today.
            </p>
            <p>
              Games were intended to be played on a smaller scale than modern
              Warhammer 40,000, typically ranging from 500 to 2,000 points per
              side&mdash;but with a significantly lower model count. This
              encouraged narrative-driven skirmishes built around mission cards
              and story hooks rather than strict match-play objectives. Although
              tournaments did exist, competitive matched play was not yet the
              default. Games were more likely to revolve around personal
              campaigns, custom missions, and the scenario cards included in
              supplements like Dark Millennium.
            </p>
            <ImageWithCredit
              src={`images/${second.file_name}`}
              title={second.title}
              artist={second.artist}
              dimensions={dimensionsOf(second)}
              aspect="aspect-retro"
              width="half-from-md"
            />
          </section>
        </article>
      </Panel>
    );
  }

  throw new Error("/: rendered with no data");
}
