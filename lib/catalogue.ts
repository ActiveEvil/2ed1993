import { assertNoQueryErrors, supabase } from "@/lib/supabase";

const CONTEXT = "lib/catalogue";

const loadList = (listId: number) =>
  supabase
    .from("army_lists")
    .select("id, name, slug, source, faction_id, factions(id, slug)")
    .eq("id", listId)
    .single();

const loadBands = (listId: number) =>
  supabase
    .from("unit_categories")
    .select("id, category, min_percent, max_percent, position")
    .eq("army_list_id", listId)
    .order("position");

const loadEntryGroups = (listId: number) =>
  supabase
    .from("army_list_entry_groups")
    .select("id, name, position")
    .eq("army_list_id", listId)
    .order("position");

const loadEntries = (listId: number) =>
  supabase
    .from("army_list_entries")
    .select(
      "id, unit_category_id, unit_id, entry_group_id, position, allowance_min, allowance_max, points, points_basis_id, transport_scope, squadron_max, mastery_level_max, allowed_as_ally, affiliation_id, affiliation_label, unit_categories!inner()",
    )
    .eq("unit_categories.army_list_id", listId)
    .order("position");

const loadEntryOptions = (listId: number) =>
  supabase
    .from("army_list_entry_options")
    .select(
      "id, army_list_entry_id, position, points, points_percent, points_basis_id, optional, alternative, unit_profile_id, unit_option_id, weapon_id, armour_id, wargear_card_id, granted_unit_id, wargear_category_id, to_unit_profile_id, replaces_weapon_id, replaces_armour_id, quantity, models_max, applies_to, army_list_entries!inner(unit_categories!inner())",
    )
    .eq("army_list_entries.unit_categories.army_list_id", listId)
    .order("position");

const loadRequirements = (listId: number) =>
  supabase
    .from("army_list_requirements")
    .select(
      "id, army_list_id, kind, mode, position, count, label, entry_id, set_id, unit_category_id, entry_option_id, unit_option_id, wargear_item_id, ally_id, subject_profile_id, target_entry_id, target_set_id, target_category_id, target_profile_id, target_wargear_item_id, target_unit_id, target_ally_id, target_unit_option_id, target_entry_option_id, target_datafax_weapon_id, variant_id, under_variant",
    )
    .eq("army_list_id", listId)
    .order("position");

const loadAllowanceSets = (listId: number) =>
  supabase
    .from("army_list_allowance_sets")
    .select("id, name, singular, position")
    .eq("army_list_id", listId)
    .order("position");

const loadAllowanceSetEntries = (listId: number) =>
  supabase
    .from("army_list_allowance_set_entries")
    .select(
      "set_id, army_list_entry_id, position, count_as, army_list_allowance_sets!inner()",
    )
    .eq("army_list_allowance_sets.army_list_id", listId)
    .order("position");

const ALLOWANCE_RULE_COLUMNS =
  "id, unit_category_id, army_list_entry_id, set_id, count, min_count, per_count, deduction, per_entry_id, per_category_id, per_set_id, per_rule_id";

const loadBandAllowanceRules = (listId: number) =>
  supabase
    .from("army_list_allowance_rules")
    .select(
      `${ALLOWANCE_RULE_COLUMNS}, unit_categories!army_list_allowance_rules_unit_category_id_fkey!inner()`,
    )
    .eq("unit_categories.army_list_id", listId);

const loadEntryAllowanceRules = (listId: number) =>
  supabase
    .from("army_list_allowance_rules")
    .select(
      `${ALLOWANCE_RULE_COLUMNS}, army_list_entries!army_list_allowance_rules_army_list_entry_id_fkey!inner(unit_categories!inner())`,
    )
    .eq("army_list_entries.unit_categories.army_list_id", listId);

const loadSetAllowanceRules = (listId: number) =>
  supabase
    .from("army_list_allowance_rules")
    .select(
      `${ALLOWANCE_RULE_COLUMNS}, army_list_allowance_sets!army_list_allowance_rules_set_id_fkey!inner()`,
    )
    .eq("army_list_allowance_sets.army_list_id", listId);

const loadAffiliations = (listId: number) =>
  supabase
    .from("affiliations")
    .select("id, name, label, position")
    .eq("army_list_id", listId)
    .order("position");

const loadSections = (listId: number) =>
  supabase
    .from("wargear_categories")
    .select(
      "id, category, position, limit_scope, limit_max, limit_min, combination_counts_as_one, distinct_items",
    )
    .eq("army_list_id", listId)
    .order("position");

const loadItems = (listId: number) =>
  supabase
    .from("wargear_items")
    .select(
      "id, wargear_category_id, position, points, weapon_id, armour_id, unit_id, special_rule_id, affiliation_id, wargear_categories!inner()",
    )
    .eq("wargear_categories.army_list_id", listId)
    .order("position");

const loadItemComponents = (listId: number) =>
  supabase
    .from("wargear_item_components")
    .select(
      "id, wargear_item_id, position, quantity, weapon_id, armour_id, wargear_card_id, wargear_items!inner(wargear_categories!inner())",
    )
    .eq("wargear_items.wargear_categories.army_list_id", listId)
    .order("position");

const loadItemEligibility = (listId: number) =>
  supabase
    .from("wargear_item_eligibility")
    .select(
      "wargear_item_id, unit_id, unit_type_id, excluded, position, wargear_items!inner(wargear_categories!inner())",
    )
    .eq("wargear_items.wargear_categories.army_list_id", listId)
    .order("position");

const loadAllies = (listId: number) =>
  supabase
    .from("army_list_allies")
    .select("id, ally_faction_id, ally_army_list_id, display, mode, position")
    .eq("army_list_id", listId)
    .order("position");

const loadArmour = () =>
  supabase.from("armour").select("id, name, bars_bike, bars_jump_pack");

const loadPointsBases = () =>
  supabase.from("points_bases").select("id, name").order("position");

const loadUnits = (unitIds: number[]) =>
  supabase
    .from("units")
    .select(
      "id, name, source, unit_type_id, datafaxes(id, points, motive_type_id), unit_profiles(id, name, position, alternative, models_min, models_max, mastery_level, wargear_cards_max, points, unit_profile_weapons(id, weapon_id, quantity, alternative, position), unit_profile_armour(armour_id, alternative, position), unit_profile_wargear_cards(wargear_card_id, position), unit_profile_vehicle_cards(vehicle_card_id, position))",
    )
    .in("id", unitIds)
    .order("position", { referencedTable: "unit_profiles" });

const loadDatafaxWeapons = (unitIds: number[]) =>
  supabase
    .from("datafax_weapons")
    .select(
      "id, datafax_id, weapon_id, position, quantity, optional, alternative, alternative_max, points, add_points, grant_mode, replaces_datafax_weapon_id, targeter, per_models, built_in_of, linked_group, datafaxes!inner()",
    )
    .in("datafaxes.unit_id", unitIds)
    .order("position");

const loadUnitOptions = (unitIds: number[]) =>
  supabase
    .from("unit_options")
    .select(
      "id, unit_id, unit_profile_id, to_unit_profile_id, weapon_id, replaces_weapon_id, armour_id, replaces_armour_id, wargear_card_id, vehicle_card_id, granted_unit_id, models_min, models_max, models_per, whole_unit, quantity, grant_mode, option_group, alternative, optional, position, per_half, affiliation_id, unit_option_categories(wargear_category_id, position), unit_option_replaced_weapons(weapon_id, position)",
    )
    .in("unit_id", unitIds)
    .order("position");

const loadWargearCards = (cardIds: number[]) =>
  supabase.from("wargear_cards").select("id, name, points").in("id", cardIds);

const loadVehicleCards = (cardIds: number[]) =>
  supabase
    .from("vehicle_cards")
    .select("id, name, points, points_basis_id")
    .in("id", cardIds);

const distinct = (ids: (number | null)[]) =>
  [...new Set(ids)].filter((id): id is number => id !== null);

export async function loadCatalogue(listId: number) {
  const [
    list,
    bands,
    entryGroups,
    entries,
    entryOptions,
    requirements,
    allowanceSets,
    allowanceSetEntries,
    bandAllowanceRules,
    entryAllowanceRules,
    setAllowanceRules,
    affiliations,
    sections,
    items,
    itemComponents,
    itemEligibility,
    allies,
    armour,
    pointsBases,
  ] = await Promise.all([
    loadList(listId),
    loadBands(listId),
    loadEntryGroups(listId),
    loadEntries(listId),
    loadEntryOptions(listId),
    loadRequirements(listId),
    loadAllowanceSets(listId),
    loadAllowanceSetEntries(listId),
    loadBandAllowanceRules(listId),
    loadEntryAllowanceRules(listId),
    loadSetAllowanceRules(listId),
    loadAffiliations(listId),
    loadSections(listId),
    loadItems(listId),
    loadItemComponents(listId),
    loadItemEligibility(listId),
    loadAllies(listId),
    loadArmour(),
    loadPointsBases(),
  ]);

  assertNoQueryErrors(
    CONTEXT,
    list.error,
    bands.error,
    entryGroups.error,
    entries.error,
    entryOptions.error,
    requirements.error,
    allowanceSets.error,
    allowanceSetEntries.error,
    bandAllowanceRules.error,
    entryAllowanceRules.error,
    setAllowanceRules.error,
    affiliations.error,
    sections.error,
    items.error,
    itemComponents.error,
    itemEligibility.error,
    allies.error,
    armour.error,
    pointsBases.error,
  );

  if (!list.data) {
    return null;
  }

  const unitIds = distinct((entries.data ?? []).map((entry) => entry.unit_id));

  const [units, datafaxWeapons, unitOptions] = await Promise.all([
    loadUnits(unitIds),
    loadDatafaxWeapons(unitIds),
    loadUnitOptions(unitIds),
  ]);

  assertNoQueryErrors(
    CONTEXT,
    units.error,
    datafaxWeapons.error,
    unitOptions.error,
  );

  const profiles = (units.data ?? []).flatMap((unit) => unit.unit_profiles);

  const wargearCardIds = distinct([
    ...profiles.flatMap((profile) =>
      profile.unit_profile_wargear_cards.map((card) => card.wargear_card_id),
    ),
    ...(unitOptions.data ?? []).map((option) => option.wargear_card_id),
    ...(entryOptions.data ?? []).map((option) => option.wargear_card_id),
  ]);

  const vehicleCardIds = distinct([
    ...profiles.flatMap((profile) =>
      profile.unit_profile_vehicle_cards.map((card) => card.vehicle_card_id),
    ),
    ...(unitOptions.data ?? []).map((option) => option.vehicle_card_id),
  ]);

  const [wargearCards, vehicleCards] = await Promise.all([
    loadWargearCards(wargearCardIds),
    loadVehicleCards(vehicleCardIds),
  ]);

  assertNoQueryErrors(CONTEXT, wargearCards.error, vehicleCards.error);

  return {
    list: list.data,
    bands: bands.data ?? [],
    entryGroups: entryGroups.data ?? [],
    entries: entries.data ?? [],
    entryOptions: entryOptions.data ?? [],
    requirements: requirements.data ?? [],
    allowanceSets: allowanceSets.data ?? [],
    allowanceSetEntries: allowanceSetEntries.data ?? [],
    allowanceRules: [
      ...(bandAllowanceRules.data ?? []),
      ...(entryAllowanceRules.data ?? []),
      ...(setAllowanceRules.data ?? []),
    ],
    affiliations: affiliations.data ?? [],
    sections: sections.data ?? [],
    items: items.data ?? [],
    itemComponents: itemComponents.data ?? [],
    itemEligibility: itemEligibility.data ?? [],
    allies: allies.data ?? [],
    units: units.data ?? [],
    datafaxWeapons: datafaxWeapons.data ?? [],
    unitOptions: unitOptions.data ?? [],
    wargearCards: wargearCards.data ?? [],
    vehicleCards: vehicleCards.data ?? [],
    armour: armour.data ?? [],
    pointsBases: pointsBases.data ?? [],
  };
}

export type Catalogue = NonNullable<Awaited<ReturnType<typeof loadCatalogue>>>;
