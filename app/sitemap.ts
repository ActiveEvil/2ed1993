import { Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://2ed1993.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/factions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wargear`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wargear/weapons`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  try {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    );

    const factionsPages: MetadataRoute.Sitemap = [];
    const { data: factions } = await supabase
      .from("factions")
      .select("slug, created_at, updated_at");

    if (factions) {
      for (const faction of factions) {
        factionsPages.push({
          url: `${baseUrl}/factions/${faction.slug}`,
          lastModified: new Date(faction.updated_at || faction.created_at),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }

    const rulesPages: MetadataRoute.Sitemap = [];
    const { data: rule_categories } = await supabase
      .from("rule_categories")
      .select("slug, created_at, updated_at");

    if (rule_categories) {
      for (const category of rule_categories) {
        rulesPages.push({
          url: `${baseUrl}/factions/${category.slug}`,
          lastModified: new Date(category.updated_at || category.created_at),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }

    return [...staticPages, ...factionsPages, ...rulesPages];
  } catch (error) {
    console.log("Error generating sitemap:", error);
    return staticPages;
  }
}
