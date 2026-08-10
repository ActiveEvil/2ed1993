import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CHIP_CLASS } from "@/components/Chip";
import { Highlighter, HighlighterLink } from "@/components/Highlighter";
import { ImageWithCredit } from "@/components/ImageWithCredit";
import { JumpBar } from "@/components/JumpBar";
import { Panel } from "@/components/Panel";
import { generateAnchorId } from "@/lib/anchors";
import { extractSubsections } from "@/lib/sections";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export const revalidate = 3600;

// Cancels the padding on the layout wrapper so the bar spans the viewport.
// self-stretch rather than a width calc: the parent centres its children, so
// the bar needs to be told to fill the cross axis before negative margins can
// widen it past the padding.
const FULL_BLEED = "self-stretch -mx-2 md:-mx-4";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { data: category, error: categoryError } = await supabase
    .from("rule_categories")
    .select("name")
    .eq("slug", params.slug)
    .single();

  assertNoQueryErrors("/rules/[slug]", categoryError);

  if (category) {
    return {
      title: `Warhammer 40,000 2nd Edition ${category.name} | 2ed1993`,
      description: `Warhammer 40,000 2nd Edition ${category.name}.`,
    };
  }

  notFound();
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { data: category, error: categoryError } = await supabase
    .from("rule_categories")
    .select(
      "name, images(file_name, artist, title), rules(name, rule, position)",
    )
    .eq("slug", params.slug)
    .order("position", { referencedTable: "rules" })
    .single();

  assertNoQueryErrors("/rules/[slug]", categoryError);

  if (category) {
    const heros = category.images.slice(0, 2);
    const sections = category.rules.map((item) => ({
      ...item,
      id: generateAnchorId(item.name),
      subsections: extractSubsections(item.rule),
    }));

    return (
      <>
        <Highlighter />
        <Breadcrumbs
          crumbs={[
            { href: "/", anchor: "2ed1993" },
            { href: "/rules", anchor: "Rules" },
            { anchor: category.name },
          ]}
        />
        <main className="flex flex-col items-center gap-4 w-full">
          <Panel className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8">
            <header>
              <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
                {category.name}
              </h1>
            </header>
            {heros.length === 1 ? (
              <ImageWithCredit
                src={`images/${heros[0].file_name}`}
                title={heros[0].title}
                artist={heros[0].artist}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {heros.map((hero) => (
                  <ImageWithCredit
                    key={hero.file_name}
                    src={`images/${hero.file_name}`}
                    title={hero.title}
                    artist={hero.artist}
                    aspect="aspect-portrait"
                    width="half"
                  />
                ))}
              </div>
            )}
          </Panel>

          {sections.length > 1 && (
            <JumpBar
              className={FULL_BLEED}
              items={sections.map(({ id, name }) => ({ id, label: name }))}
            />
          )}

          <Panel className="flex flex-col gap-8 md:gap-12 w-full max-w-5xl p-4 md:p-8">
            {sections.map((item) => (
              <section
                key={item.id}
                id={item.id}
                className="flex flex-col justify-center gap-4"
              >
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      {item.name}
                    </h2>
                  </div>
                  {item.subsections.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {item.subsections.map((subsection) => (
                        <HighlighterLink
                          key={subsection.id}
                          href={`/rules/${params.slug}#${subsection.id}`}
                          className={CHIP_CLASS}
                        >
                          {subsection.name}
                        </HighlighterLink>
                      ))}
                    </div>
                  )}
                </div>
                <section
                  className="dynamic-content flex flex-col justify-center gap-4"
                  dangerouslySetInnerHTML={{ __html: item.rule }}
                />
              </section>
            ))}
          </Panel>
        </main>
      </>
    );
  }

  notFound();
}
