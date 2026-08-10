import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { IndexCard } from "@/components/IndexCard";
import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { generateAnchorId } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next/types";

export const revalidate = 3600;

// Keyed by slug, not by position: a reorder must not quietly move a chapter
// into the wrong band. Anything unlisted falls into a trailing band rather
// than disappearing.
const BANDS: { title: string; slugs: string[] }[] = [
  { title: "Before the game", slugs: ["the-golden-rule", "how-to-play"] },
  {
    title: "The turn sequence",
    slugs: [
      "movement",
      "shooting",
      "hand-to-hand-combat",
      "psychic",
      "breaking-rallying",
    ],
  },
  {
    title: "General rules, weapons, psychology & vehicles",
    slugs: ["general-rules", "weapon-rules", "psychology", "vehicle-rules"],
  },
];

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Rules | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Rules.",
  };
}

export default async function Page() {
  const { data: heroImage, error: heroImageError } = await supabase
    .from("hero_images")
    .select("images(file_name, artist, title)")
    .eq("slug", "rules")
    .single();
  const hero = heroImage?.images ?? null;
  const { data: rule_categories, error: ruleCategoriesError } = await supabase
    .from("rule_categories")
    .select("slug, name, position, rules(name)")
    .order("position", { referencedTable: "rules" })
    .order("position");

  assertNoQueryErrors("/rules", heroImageError, ruleCategoriesError);

  if (hero && rule_categories) {
    type Category = (typeof rule_categories)[number];

    const bySlug = new Map<string, Category>(
      rule_categories.map((c) => [c.slug, c]),
    );
    const banded = new Set(BANDS.flatMap(({ slugs }) => slugs));
    const leftovers = rule_categories.filter((c) => !banded.has(c.slug));

    const bands = [
      ...BANDS.map(({ title, slugs }) => ({
        title,
        categories: slugs
          .map((slug) => bySlug.get(slug))
          .filter((c): c is Category => c !== undefined),
      })),
      ...(leftovers.length ? [{ title: "Other", categories: leftovers }] : []),
    ].filter(({ categories }) => categories.length > 0);

    return (
      <>
        <Breadcrumbs
          crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Rules" }]}
        />
        <Panel
          as="main"
          className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8"
        >
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              Rules
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <div className="flex flex-col gap-7">
            {bands.map((band) => {
              const first = band.categories[0].position + 1;
              const last =
                band.categories[band.categories.length - 1].position + 1;

              return (
                <section key={band.title} className="flex flex-col gap-4">
                  <SectionBar
                    as="h2"
                    title={band.title}
                    note={
                      first === last
                        ? `Chapter ${first}`
                        : `Chapters ${first}\u2013${last}`
                    }
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    {band.categories.map(({ slug, name, position, rules }) => (
                      <IndexCard
                        key={slug}
                        href={`/rules/${slug}`}
                        title={`${position + 1}. ${name}`}
                      >
                        <ol className="pl-6 space-y-0.5 text-lg list-decimal">
                          {rules.map((rule) => (
                            <li key={rule.name}>
                              <Link
                                className="hover:underline underline-offset-4"
                                href={`/rules/${slug}#${generateAnchorId(rule.name)}`}
                              >
                                {rule.name}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </IndexCard>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </Panel>
      </>
    );
  }

  throw new Error("/rules: rendered with no data");
}
