import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

export const revalidate = 3600;

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
    {
      url: `${baseUrl}/wargear/armour`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wargear/wargear-cards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/card-decks`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/card-decks/mission-cards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/card-decks/strategy-cards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/card-decks/psychic-power-cards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/card-decks/special-warp-cards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/datafaxes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/datafaxes/fortifications`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    const factionsPages: MetadataRoute.Sitemap = [];
    const { data: factions } = await supabase
      .from("factions")
      .select(
        "id, slug, parent_faction_id, created_at, updated_at, army_lists(slug, created_at, updated_at)",
      );
    const { data: datafaxUnits } = await supabase
      .from("units")
      .select("faction_id, datafaxes!inner(id)");

    if (factions) {
      const factionIdsWithDatafaxes = new Set(
        (datafaxUnits ?? [])
          .map(({ faction_id }) => faction_id)
          .filter((id): id is number => id !== null),
      );
      const hasArmyLists = (faction: (typeof factions)[number]): boolean =>
        faction.army_lists.length > 0 ||
        factions.some(
          (other) =>
            other.parent_faction_id === faction.id &&
            other.army_lists.length > 0,
        );
      const hasDatafaxes = (factionId: number): boolean =>
        factionIdsWithDatafaxes.has(factionId) ||
        factions.some(
          (other) =>
            other.parent_faction_id === factionId &&
            factionIdsWithDatafaxes.has(other.id),
        );

      for (const faction of factions) {
        if (hasArmyLists(faction)) {
          factionsPages.push({
            url: `${baseUrl}/factions/${faction.slug}`,
            lastModified: new Date(faction.updated_at || faction.created_at),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }

        if (faction.parent_faction_id === null && hasDatafaxes(faction.id)) {
          factionsPages.push({
            url: `${baseUrl}/datafaxes/${faction.slug}`,
            lastModified: new Date(faction.updated_at || faction.created_at),
            changeFrequency: "weekly",
            priority: 0.5,
          });
        }

        for (const list of faction.army_lists) {
          factionsPages.push({
            url: `${baseUrl}/factions/${faction.slug}/${list.slug}`,
            lastModified: new Date(list.updated_at || list.created_at),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    }

    const rulesPages: MetadataRoute.Sitemap = [];
    const { data: rule_categories } = await supabase
      .from("rule_categories")
      .select("slug, created_at, updated_at");

    if (rule_categories) {
      for (const category of rule_categories) {
        rulesPages.push({
          url: `${baseUrl}/rules/${category.slug}`,
          lastModified: new Date(category.updated_at || category.created_at),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }

    return [...staticPages, ...factionsPages, ...rulesPages];
  } catch (error) {
    console.log("Error generating sitemap:", error);
    return staticPages;
  }
}
