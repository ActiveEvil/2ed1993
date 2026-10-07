import { hasFactionChapter } from "@/lib/anchors";
import { assertNoQueryErrors, supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://2ed1993.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "yearly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/factions`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rules`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wargear`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wargear/weapons`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wargear/armour`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wargear/wargear-cards`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/card-decks`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/card-decks/mission-cards`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/card-decks/strategy-cards`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/card-decks/psychic-power-cards`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/card-decks/special-warp-cards`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/datafaxes`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/datafaxes/fortifications`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gallery`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const factionsPages: MetadataRoute.Sitemap = [];
  const { data: factions, error: factionsError } = await supabase
    .from("factions")
    .select(
      "id, slug, parent_faction_id, created_at, updated_at, army_lists(slug, created_at, updated_at)",
    );
  const { data: datafaxUnits, error: datafaxUnitsError } = await supabase
    .from("units")
    .select("faction_id, datafaxes!inner(id), unit_types!inner(name)")
    .neq("unit_types.name", "Fortification");

  assertNoQueryErrors("/sitemap.xml", factionsError, datafaxUnitsError);

  if (factions) {
    const factionIdsWithDatafaxes = new Set(
      (datafaxUnits ?? [])
        .map(({ faction_id }) => faction_id)
        .filter((id): id is number => id !== null),
    );
    const hasDatafaxes = (factionId: number): boolean =>
      factionIdsWithDatafaxes.has(factionId) ||
      factions.some(
        (other) =>
          other.parent_faction_id === factionId &&
          factionIdsWithDatafaxes.has(other.id),
      );

    for (const faction of factions) {
      factionsPages.push({
        url: `${baseUrl}/factions/${faction.slug}`,
        lastModified: new Date(faction.updated_at || faction.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });

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
  const { data: rule_categories, error: ruleCategoriesError } = await supabase
    .from("rule_categories")
    .select("slug, created_at, updated_at, faction_id, rules(id)");
  const { data: assignmentRows, error: assignmentsError } = await supabase
    .from("unit_special_rule_assignments")
    .select(
      "rule:unit_special_rules(rule, wargear_items(id)), units!inner(faction_id)",
    );

  assertNoQueryErrors("/sitemap.xml", ruleCategoriesError, assignmentsError);

  if (rule_categories) {
    const factionIdsWithUnitRules = new Set(
      (assignmentRows ?? [])
        .filter((row) => row.rule !== null && hasFactionChapter(row.rule))
        .map(({ units }) => units.faction_id)
        .filter((id): id is number => id !== null),
    );

    for (const category of rule_categories) {
      if (
        category.faction_id !== null &&
        category.rules.length === 0 &&
        !factionIdsWithUnitRules.has(category.faction_id)
      ) {
        continue;
      }

      rulesPages.push({
        url: `${baseUrl}/rules/${category.slug}`,
        lastModified: new Date(category.updated_at || category.created_at),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return [...staticPages, ...factionsPages, ...rulesPages];
}
