import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

export async function generateMetadata(props: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const params = await props.params;
  const { data: category } = await supabase
    .from("rule_categories")
    .select("name")
    .eq("id", params.id)
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
  params: Promise<{ id: number; name: string }>;
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
    .eq("id", params.id)
    .order("position", { referencedTable: "rules" })
    .single();

  if (category) {
    if (slugify(category.name) !== params.name) {
      notFound();
    }
    const [hero] = category.images;

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
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              {category.name}
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
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
                    <hr className="md:absolute -z-10 w-[calc(100vw-var(--spacing)*4)] md:w-[calc(100vw-var(--spacing)*8)] h-1 bg-black border border-black" />
                    <h2 className="md:px-2 bg-background font-title text-3xl uppercase">
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
