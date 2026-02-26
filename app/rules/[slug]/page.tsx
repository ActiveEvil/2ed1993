import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next/types";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const params = await props.params;
  const { data: category } = await supabase
    .from("rule_categories")
    .select("name")
    .eq("slug", params.slug)
    .single();

  if (category) {
    const { name } = category;
    return {
      title: `Warhammer 40,000 2nd Edition ${category.name}  Rules | 2ed1993`,
      description: `Warhammer 40,000 2nd Edition  ${category.name} Rules.`,
    };
  }

  throw new Error("No data");
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const params = await props.params;
  const { data: category } = await supabase
    .from("rule_categories")
    .select(
      "name, images(file_name, artist, title), rules(name, rule, position)",
    )
    .eq("slug", params.slug)
    .order("position", { referencedTable: "rules" })
    .single();

  if (category) {
    const heros = category.images.slice(0, 2);

    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              href: "/rules",
              anchor: "Rules",
            },
            {
              anchor: category.name,
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
              {category.name}
            </h1>
          </header>
          {heros.length === 1 ? (
            <ImageWithCredit
              key={heros[0].file_name}
              src={`images/${heros[0].file_name}`}
              title={heros[0].title}
              artist={heros[0].artist}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {heros.map((hero, index) => (
                <div key={hero.file_name}>
                  <ImageWithCredit
                    src={`images/${hero.file_name}`}
                    title={hero.title}
                    artist={hero.artist}
                    aspect="aspect-portrait"
                  />
                </div>
              ))}
            </div>
          )}
          <section className="flex flex-col justify-center gap-8 md:gap-16 md:mt-8">
            {category.rules.map((item) => {
              const ruleId = item.name.split(" ").join("_");
              return (
                <section
                  key={ruleId}
                  id={ruleId}
                  className="flex flex-col justify-center gap-4"
                >
                  <div className="relative flex flex-col items-center justify-center gap-4 w-full">
                    <hr className="md:absolute -z-10 max-w-5xl w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
                      {item.name}
                    </h2>
                  </div>
                  <section
                    className="dynamic-content flex flex-col justify-center gap-4"
                    dangerouslySetInnerHTML={{ __html: item.rule }}
                  />
                </section>
              );
            })}
          </section>
        </main>
      </>
    );
  }
}
