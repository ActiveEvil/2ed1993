import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 2nd Edition Rules | 2ed1993",
    description: "Warhammer 40,000 2nd Edition Rules.",
  };
}

export default async function Page() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );

  const { data: hero } = await supabase
    .from("images")
    .select("file_name, artist, title")
    .eq("id", 8)
    .single();
  const { data: rule_categories } = await supabase
    .from("rule_categories")
    .select("slug, name, rules(name)")
    .order("position", { referencedTable: "rules" })
    .order("position");

  if (hero && rule_categories) {
    return (
      <>
        <Breadcrumbs
          crumbs={[
            {
              href: "/",
              anchor: "2ed1993",
            },
            {
              anchor: "Rules",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-5xl text-center">
              Rules
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <nav className="ordered-list">
            <ol className="flex flex-col gap-2 text-2xl">
              {rule_categories.map(({ slug, name, rules }) => {
                const href = `/rules/${slug}`;

                return (
                  <li key={slug}>
                    <Link
                      className="font-subtitle hover:underline underline-offset-4"
                      href={href}
                    >
                      {name}
                    </Link>
                    <ol className="flex flex-col gap-2 text-xl">
                      {rules.map(({ name }) => {
                        const ruleId = name.split(" ").join("_");

                        return (
                          <li key={ruleId}>
                            <Link
                              className="hover:underline underline-offset-4"
                              href={`${href}#${ruleId}`}
                            >
                              {name}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </li>
                );
              })}
            </ol>
          </nav>
        </main>
      </>
    );
  }
}
