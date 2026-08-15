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
  const { data: sectionRows, error: sectionsError } = await supabase
    .from("rule_sections")
    .select(
      "name, numbered, rule_categories(slug, name, position, rules(name, position))",
    )
    .order("position");

  assertNoQueryErrors("/rules", heroImageError, sectionsError);

  if (hero && sectionRows) {
    // PostgREST orders one level of nesting; the rules sit two levels down.
    const byPosition = <T extends { position: number }>(a: T, b: T) =>
      a.position - b.position;

    const sections = sectionRows
      .map((section) => ({
        ...section,
        categories: [...section.rule_categories].sort(byPosition).map((c) => ({
          ...c,
          rules: [...c.rules].sort(byPosition),
        })),
      }))
      .filter(({ categories }) => categories.length > 0);

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
            {sections.map(({ name: title, numbered, categories }) => {
              const first = categories[0].position + 1;
              const last = categories[categories.length - 1].position + 1;

              return (
                <section key={title} className="flex flex-col gap-4">
                  <SectionBar
                    as="h2"
                    title={title}
                    note={
                      !numbered
                        ? null
                        : first === last
                          ? `Chapter ${first}`
                          : `Chapters ${first}\u2013${last}`
                    }
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    {categories.map(({ slug, name, position, rules }) => (
                      <IndexCard
                        key={slug}
                        href={`/rules/${slug}`}
                        title={numbered ? `${position + 1}. ${name}` : name}
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
