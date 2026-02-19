import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageWithCredit } from "@/components/Image";
import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Metadata } from "next/types";

export function generateMetadata(): Metadata {
  return {
    title: "Warhammer 40,000 Second Edition Rules | 2ed1993",
    description: "Warhammer 40,000 Second Edition Rules.",
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
    .eq("id", 9)
    .single();

  const { data: rules } = await supabase
    .from("rules")
    .select("name, rule")
    .eq("category_id", 1)
    .order("position");

  if (hero && rules) {
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
              anchor: "Weapon Rules",
            },
          ]}
        />
        <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
          <header>
            <h1 className="font-title uppercase tracking-wide text-6xl text-center">
              Weapon Rules
            </h1>
          </header>
          <ImageWithCredit
            src={`images/${hero.file_name}`}
            title={hero.title}
            artist={hero.artist}
          />
          <section className="flex flex-col justify-center gap-8 md:gap-16 mt-8">
            {rules.map((item) => {
              const ruleId = item.name.split(" ").join("_");
              return (
                <section
                  key={ruleId}
                  className="flex flex-col justify-center gap-4"
                >
                  <div className="relative flex items-center justify-center w-full h-9">
                    <hr className="w-full h-1 bg-black border border-black" />
                    <h2 className="absolute px-2 bg-background font-title text-3xl uppercase">
                      {item.name}
                    </h2>
                  </div>
                  <section
                    className="flex flex-col justify-center gap-4"
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
