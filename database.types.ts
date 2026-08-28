export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      armour: {
        Row: {
          category_id: number;
          created_at: string;
          id: number;
          name: string;
          profile_description: string | null;
          updated_at: string | null;
        };
        Insert: {
          category_id: number;
          created_at?: string;
          id?: number;
          name: string;
          profile_description?: string | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: number;
          created_at?: string;
          id?: number;
          name?: string;
          profile_description?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "armour_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "armour_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      armour_categories: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      armour_profiles: {
        Row: {
          armour_id: number;
          condition: string | null;
          created_at: string;
          id: number;
          save: string;
          updated_at: string | null;
        };
        Insert: {
          armour_id: number;
          condition?: string | null;
          created_at?: string;
          id?: number;
          save: string;
          updated_at?: string | null;
        };
        Update: {
          armour_id?: number;
          condition?: string | null;
          created_at?: string;
          id?: number;
          save?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "armour_profiles_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
        ];
      };
      armour_special_rule_assignments: {
        Row: {
          armour_id: number;
          special_rule_id: number;
        };
        Insert: {
          armour_id: number;
          special_rule_id: number;
        };
        Update: {
          armour_id?: number;
          special_rule_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "armour_special_rule_assignments_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "armour_special_rule_assignments_special_rule_id_fkey";
            columns: ["special_rule_id"];
            isOneToOne: false;
            referencedRelation: "armour_special_rules";
            referencedColumns: ["id"];
          },
        ];
      };
      armour_special_rules: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          rule: string;
          rule_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          rule: string;
          rule_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          rule?: string;
          rule_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "armour_special_rules_rule_id_fkey";
            columns: ["rule_id"];
            isOneToOne: false;
            referencedRelation: "rules";
            referencedColumns: ["id"];
          },
        ];
      };
      army_list_allies: {
        Row: {
          ally_army_list_id: number | null;
          ally_faction_id: number | null;
          army_list_id: number;
          created_at: string;
          id: number;
          note: string | null;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          ally_army_list_id?: number | null;
          ally_faction_id?: number | null;
          army_list_id: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          position?: number;
          updated_at?: string | null;
        };
        Update: {
          ally_army_list_id?: number | null;
          ally_faction_id?: number | null;
          army_list_id?: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "army_list_allies_ally_army_list_id_fkey";
            columns: ["ally_army_list_id"];
            isOneToOne: false;
            referencedRelation: "army_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_allies_ally_faction_id_fkey";
            columns: ["ally_faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_allies_army_list_id_fkey";
            columns: ["army_list_id"];
            isOneToOne: false;
            referencedRelation: "army_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      army_list_allowance_rules: {
        Row: {
          army_list_entry_id: number | null;
          count: number;
          created_at: string;
          id: number;
          note: string | null;
          per_category_id: number | null;
          per_count: number;
          per_entry_id: number | null;
          unit_category_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          army_list_entry_id?: number | null;
          count: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          per_category_id?: number | null;
          per_count?: number;
          per_entry_id?: number | null;
          unit_category_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          army_list_entry_id?: number | null;
          count?: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          per_category_id?: number | null;
          per_count?: number;
          per_entry_id?: number | null;
          unit_category_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "army_list_allowance_rules_army_list_entry_id_fkey";
            columns: ["army_list_entry_id"];
            isOneToOne: false;
            referencedRelation: "army_list_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_allowance_rules_per_category_id_fkey";
            columns: ["per_category_id"];
            isOneToOne: false;
            referencedRelation: "unit_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_allowance_rules_per_entry_id_fkey";
            columns: ["per_entry_id"];
            isOneToOne: false;
            referencedRelation: "army_list_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_allowance_rules_unit_category_id_fkey";
            columns: ["unit_category_id"];
            isOneToOne: false;
            referencedRelation: "unit_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      army_list_entries: {
        Row: {
          allowance_max: number | null;
          allowance_min: number;
          created_at: string;
          id: number;
          note: string | null;
          points: number | null;
          points_basis_id: number | null;
          position: number;
          unit_category_id: number;
          unit_id: number;
          updated_at: string | null;
        };
        Insert: {
          allowance_max?: number | null;
          allowance_min?: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          points?: number | null;
          points_basis_id?: number | null;
          position: number;
          unit_category_id: number;
          unit_id: number;
          updated_at?: string | null;
        };
        Update: {
          allowance_max?: number | null;
          allowance_min?: number;
          created_at?: string;
          id?: number;
          note?: string | null;
          points?: number | null;
          points_basis_id?: number | null;
          position?: number;
          unit_category_id?: number;
          unit_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "army_list_entries_points_basis_id_fkey";
            columns: ["points_basis_id"];
            isOneToOne: false;
            referencedRelation: "points_bases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entries_unit_category_id_fkey";
            columns: ["unit_category_id"];
            isOneToOne: false;
            referencedRelation: "unit_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entries_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      army_list_entry_options: {
        Row: {
          alternative: number;
          applies_to: string;
          armour_id: number | null;
          army_list_entry_id: number;
          created_at: string;
          granted_unit_id: number | null;
          id: number;
          models_max: number | null;
          note: string | null;
          points: number | null;
          points_basis_id: number | null;
          points_percent: number | null;
          position: number;
          quantity: number;
          replaces_armour_id: number | null;
          replaces_weapon_id: number | null;
          restriction: string | null;
          to_unit_profile_id: number | null;
          unit_option_id: number | null;
          unit_profile_id: number | null;
          updated_at: string | null;
          wargear_category_id: number | null;
          weapon_id: number | null;
        };
        Insert: {
          alternative?: number;
          applies_to?: string;
          armour_id?: number | null;
          army_list_entry_id: number;
          created_at?: string;
          granted_unit_id?: number | null;
          id?: number;
          models_max?: number | null;
          note?: string | null;
          points?: number | null;
          points_basis_id?: number | null;
          points_percent?: number | null;
          position: number;
          quantity?: number;
          replaces_armour_id?: number | null;
          replaces_weapon_id?: number | null;
          restriction?: string | null;
          to_unit_profile_id?: number | null;
          unit_option_id?: number | null;
          unit_profile_id?: number | null;
          updated_at?: string | null;
          wargear_category_id?: number | null;
          weapon_id?: number | null;
        };
        Update: {
          alternative?: number;
          applies_to?: string;
          armour_id?: number | null;
          army_list_entry_id?: number;
          created_at?: string;
          granted_unit_id?: number | null;
          id?: number;
          models_max?: number | null;
          note?: string | null;
          points?: number | null;
          points_basis_id?: number | null;
          points_percent?: number | null;
          position?: number;
          quantity?: number;
          replaces_armour_id?: number | null;
          replaces_weapon_id?: number | null;
          restriction?: string | null;
          to_unit_profile_id?: number | null;
          unit_option_id?: number | null;
          unit_profile_id?: number | null;
          updated_at?: string | null;
          wargear_category_id?: number | null;
          weapon_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "army_list_entry_options_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_army_list_entry_id_fkey";
            columns: ["army_list_entry_id"];
            isOneToOne: false;
            referencedRelation: "army_list_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_granted_unit_id_fkey";
            columns: ["granted_unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_points_basis_id_fkey";
            columns: ["points_basis_id"];
            isOneToOne: false;
            referencedRelation: "points_bases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_replaces_armour_id_fkey";
            columns: ["replaces_armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_replaces_weapon_id_fkey";
            columns: ["replaces_weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_to_unit_profile_id_fkey";
            columns: ["to_unit_profile_id"];
            isOneToOne: false;
            referencedRelation: "unit_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_unit_option_id_fkey";
            columns: ["unit_option_id"];
            isOneToOne: false;
            referencedRelation: "unit_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_unit_profile_id_fkey";
            columns: ["unit_profile_id"];
            isOneToOne: false;
            referencedRelation: "unit_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_wargear_category_id_fkey";
            columns: ["wargear_category_id"];
            isOneToOne: false;
            referencedRelation: "wargear_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "army_list_entry_options_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      army_lists: {
        Row: {
          created_at: string;
          description: string | null;
          faction_id: number;
          id: number;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          faction_id: number;
          id?: number;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          faction_id?: number;
          id?: number;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "army_lists_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
        ];
      };
      availabilities: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: never;
          name: string;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: never;
          name?: string;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      damage_chart_results: {
        Row: {
          created_at: string;
          damage_chart_id: number;
          effect: string;
          id: number;
          position: number;
          roll_max: number;
          roll_min: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          damage_chart_id: number;
          effect: string;
          id?: number;
          position: number;
          roll_max: number;
          roll_min: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          damage_chart_id?: number;
          effect?: string;
          id?: number;
          position?: number;
          roll_max?: number;
          roll_min?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "damage_chart_results_damage_chart_id_fkey";
            columns: ["damage_chart_id"];
            isOneToOne: false;
            referencedRelation: "damage_charts";
            referencedColumns: ["id"];
          },
        ];
      };
      damage_charts: {
        Row: {
          created_at: string;
          datafax_id: number;
          dice: string;
          id: number;
          name: string;
          note: string | null;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          datafax_id: number;
          dice?: string;
          id?: number;
          name: string;
          note?: string | null;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          datafax_id?: number;
          dice?: string;
          id?: number;
          name?: string;
          note?: string | null;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "damage_charts_datafax_id_fkey";
            columns: ["datafax_id"];
            isOneToOne: false;
            referencedRelation: "datafaxes";
            referencedColumns: ["id"];
          },
        ];
      };
      datafax_images: {
        Row: {
          datafax_id: number;
          image_id: number;
          position: number;
        };
        Insert: {
          datafax_id: number;
          image_id: number;
          position?: number;
        };
        Update: {
          datafax_id?: number;
          image_id?: number;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "datafax_images_datafax_id_fkey";
            columns: ["datafax_id"];
            isOneToOne: false;
            referencedRelation: "datafaxes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "datafax_images_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
        ];
      };
      datafax_locations: {
        Row: {
          armour_front: number | null;
          armour_side_rear: number | null;
          created_at: string;
          damage_anchor: string | null;
          damage_chart_id: number | null;
          datafax_id: number;
          datafax_weapon_id: number | null;
          id: number;
          name: string;
          note: string | null;
          position: number;
          roll_max: number;
          roll_min: number;
          updated_at: string | null;
        };
        Insert: {
          armour_front?: number | null;
          armour_side_rear?: number | null;
          created_at?: string;
          damage_anchor?: string | null;
          damage_chart_id?: number | null;
          datafax_id: number;
          datafax_weapon_id?: number | null;
          id?: number;
          name: string;
          note?: string | null;
          position: number;
          roll_max: number;
          roll_min: number;
          updated_at?: string | null;
        };
        Update: {
          armour_front?: number | null;
          armour_side_rear?: number | null;
          created_at?: string;
          damage_anchor?: string | null;
          damage_chart_id?: number | null;
          datafax_id?: number;
          datafax_weapon_id?: number | null;
          id?: number;
          name?: string;
          note?: string | null;
          position?: number;
          roll_max?: number;
          roll_min?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "datafax_locations_damage_chart_id_fkey";
            columns: ["damage_chart_id"];
            isOneToOne: false;
            referencedRelation: "damage_charts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "datafax_locations_datafax_id_fkey";
            columns: ["datafax_id"];
            isOneToOne: false;
            referencedRelation: "datafaxes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "datafax_locations_datafax_weapon_id_fkey";
            columns: ["datafax_weapon_id"];
            isOneToOne: false;
            referencedRelation: "datafax_weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      datafax_weapons: {
        Row: {
          alternative: number;
          arc_note: string | null;
          created_at: string;
          datafax_id: number;
          firing_arc_degrees: number | null;
          id: number;
          linked_group: number | null;
          mount: string | null;
          optional: boolean;
          points: number | null;
          position: number;
          quantity: number;
          updated_at: string | null;
          weapon_id: number;
        };
        Insert: {
          alternative?: number;
          arc_note?: string | null;
          created_at?: string;
          datafax_id: number;
          firing_arc_degrees?: number | null;
          id?: number;
          linked_group?: number | null;
          mount?: string | null;
          optional?: boolean;
          points?: number | null;
          position: number;
          quantity?: number;
          updated_at?: string | null;
          weapon_id: number;
        };
        Update: {
          alternative?: number;
          arc_note?: string | null;
          created_at?: string;
          datafax_id?: number;
          firing_arc_degrees?: number | null;
          id?: number;
          linked_group?: number | null;
          mount?: string | null;
          optional?: boolean;
          points?: number | null;
          position?: number;
          quantity?: number;
          updated_at?: string | null;
          weapon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "datafax_weapons_datafax_id_fkey";
            columns: ["datafax_id"];
            isOneToOne: false;
            referencedRelation: "datafaxes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "datafax_weapons_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      datafaxes: {
        Row: {
          capacity_inside: number | null;
          capacity_roof: number | null;
          created_at: string;
          crew: number | null;
          deployment: string | null;
          id: number;
          large_target: boolean | null;
          location_dice: string;
          motive_type_id: number | null;
          note: string | null;
          open_topped: boolean | null;
          ram_damage: string | null;
          ram_save_modifier: number | null;
          ram_strength: number | null;
          speed_combat: number | null;
          speed_fast: number | null;
          speed_slow: number | null;
          transport_capacity: number | null;
          unit_id: number;
          updated_at: string | null;
        };
        Insert: {
          capacity_inside?: number | null;
          capacity_roof?: number | null;
          created_at?: string;
          crew?: number | null;
          deployment?: string | null;
          id?: number;
          large_target?: boolean | null;
          location_dice?: string;
          motive_type_id?: number | null;
          note?: string | null;
          open_topped?: boolean | null;
          ram_damage?: string | null;
          ram_save_modifier?: number | null;
          ram_strength?: number | null;
          speed_combat?: number | null;
          speed_fast?: number | null;
          speed_slow?: number | null;
          transport_capacity?: number | null;
          unit_id: number;
          updated_at?: string | null;
        };
        Update: {
          capacity_inside?: number | null;
          capacity_roof?: number | null;
          created_at?: string;
          crew?: number | null;
          deployment?: string | null;
          id?: number;
          large_target?: boolean | null;
          location_dice?: string;
          motive_type_id?: number | null;
          note?: string | null;
          open_topped?: boolean | null;
          ram_damage?: string | null;
          ram_save_modifier?: number | null;
          ram_strength?: number | null;
          speed_combat?: number | null;
          speed_fast?: number | null;
          speed_slow?: number | null;
          transport_capacity?: number | null;
          unit_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "datafaxes_motive_type_id_fkey";
            columns: ["motive_type_id"];
            isOneToOne: false;
            referencedRelation: "motive_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "datafaxes_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: true;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment_weapons: {
        Row: {
          army_list_id: number;
          category: string;
          note: string | null;
          points: number;
          weapon_id: number;
        };
        Insert: {
          army_list_id: number;
          category: string;
          note?: string | null;
          points: number;
          weapon_id: number;
        };
        Update: {
          army_list_id?: number;
          category?: string;
          note?: string | null;
          points?: number;
          weapon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "equipment_weapons_army_list_id_fkey";
            columns: ["army_list_id"];
            isOneToOne: false;
            referencedRelation: "army_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "equipment_weapons_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      faction_images: {
        Row: {
          faction_id: number;
          image_id: number;
        };
        Insert: {
          faction_id: number;
          image_id: number;
        };
        Update: {
          faction_id?: number;
          image_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "faction_images_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "faction_images_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
        ];
      };
      factions: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          name: string;
          parent_faction_id: number | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          name: string;
          parent_faction_id?: number | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          name?: string;
          parent_faction_id?: number | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "factions_parent_faction_id_fkey";
            columns: ["parent_faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
        ];
      };
      hero_images: {
        Row: {
          image_id: number;
          position: number;
          slug: string;
        };
        Insert: {
          image_id: number;
          position?: number;
          slug: string;
        };
        Update: {
          image_id?: number;
          position?: number;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hero_images_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
        ];
      };
      image_galleries: {
        Row: {
          image_id: number;
          name: string;
          position: number;
        };
        Insert: {
          image_id: number;
          name: string;
          position?: number;
        };
        Update: {
          image_id?: number;
          name?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "image_galleries_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
        ];
      };
      images: {
        Row: {
          artist: string | null;
          created_at: string;
          file_name: string;
          height: number | null;
          id: number;
          title: string;
          updated_at: string | null;
          width: number | null;
        };
        Insert: {
          artist?: string | null;
          created_at?: string;
          file_name: string;
          height?: number | null;
          id?: number;
          title: string;
          updated_at?: string | null;
          width?: number | null;
        };
        Update: {
          artist?: string | null;
          created_at?: string;
          file_name?: string;
          height?: number | null;
          id?: number;
          title?: string;
          updated_at?: string | null;
          width?: number | null;
        };
        Relationships: [];
      };
      mission_cards: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
          origin: string;
          primary_objective: string;
          secondary_objective: string | null;
          special_rules: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name: string;
          origin: string;
          primary_objective: string;
          secondary_objective?: string | null;
          special_rules?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          name?: string;
          origin?: string;
          primary_objective?: string;
          secondary_objective?: string | null;
          special_rules?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      motive_types: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      points_bases: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      psychic_power_cards: {
        Row: {
          created_at: string;
          deck: Database["public"]["Enums"]["psychic_power_decks"];
          description: string;
          force: string;
          id: number;
          name: string;
          note: string | null;
          range: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          deck: Database["public"]["Enums"]["psychic_power_decks"];
          description: string;
          force: string;
          id?: number;
          name: string;
          note?: string | null;
          range?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          deck?: Database["public"]["Enums"]["psychic_power_decks"];
          description?: string;
          force?: string;
          id?: number;
          name?: string;
          note?: string | null;
          range?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      rule_categories: {
        Row: {
          created_at: string;
          faction_id: number | null;
          id: number;
          name: string;
          position: number;
          section_id: number;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          faction_id?: number | null;
          id?: number;
          name: string;
          position: number;
          section_id: number;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          faction_id?: number | null;
          id?: number;
          name?: string;
          position?: number;
          section_id?: number;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rule_categories_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rule_categories_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "rule_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      rule_category_images: {
        Row: {
          image_id: number;
          rule_category_id: number;
        };
        Insert: {
          image_id: number;
          rule_category_id: number;
        };
        Update: {
          image_id?: number;
          rule_category_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "rule_category_images_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rule_category_images_rule_category_id_fkey";
            columns: ["rule_category_id"];
            isOneToOne: false;
            referencedRelation: "rule_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      rule_sections: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          numbered: boolean;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: never;
          name: string;
          numbered?: boolean;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: never;
          name?: string;
          numbered?: boolean;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      rules: {
        Row: {
          category_id: number;
          created_at: string;
          faction_id: number | null;
          id: number;
          name: string;
          position: number;
          rule: string;
          updated_at: string | null;
        };
        Insert: {
          category_id: number;
          created_at?: string;
          faction_id?: number | null;
          id?: number;
          name: string;
          position: number;
          rule: string;
          updated_at?: string | null;
        };
        Update: {
          category_id?: number;
          created_at?: string;
          faction_id?: number | null;
          id?: number;
          name?: string;
          position?: number;
          rule?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rules_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "rule_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rules_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
        ];
      };
      special_warp_cards: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      strategy_cards: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          name: string;
          origin: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          name: string;
          origin: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          name?: string;
          origin?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      unit_categories: {
        Row: {
          army_list_id: number;
          category: string;
          created_at: string;
          id: number;
          max_percent: number | null;
          min_percent: number | null;
          note: string | null;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          army_list_id: number;
          category: string;
          created_at?: string;
          id?: number;
          max_percent?: number | null;
          min_percent?: number | null;
          note?: string | null;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          army_list_id?: number;
          category?: string;
          created_at?: string;
          id?: number;
          max_percent?: number | null;
          min_percent?: number | null;
          note?: string | null;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "unit_categories_army_list_id_fkey";
            columns: ["army_list_id"];
            isOneToOne: false;
            referencedRelation: "army_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_profile_armour: {
        Row: {
          armour_id: number;
          created_at: string;
          position: number;
          unit_profile_id: number;
          updated_at: string | null;
        };
        Insert: {
          armour_id: number;
          created_at?: string;
          position?: number;
          unit_profile_id: number;
          updated_at?: string | null;
        };
        Update: {
          armour_id?: number;
          created_at?: string;
          position?: number;
          unit_profile_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "unit_profile_armour_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_profile_armour_unit_profile_id_fkey";
            columns: ["unit_profile_id"];
            isOneToOne: false;
            referencedRelation: "unit_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_profile_weapons: {
        Row: {
          alternative: number;
          created_at: string;
          id: number;
          position: number;
          quantity: number;
          unit_profile_id: number;
          updated_at: string | null;
          weapon_id: number;
        };
        Insert: {
          alternative?: number;
          created_at?: string;
          id?: number;
          position?: number;
          quantity?: number;
          unit_profile_id: number;
          updated_at?: string | null;
          weapon_id: number;
        };
        Update: {
          alternative?: number;
          created_at?: string;
          id?: number;
          position?: number;
          quantity?: number;
          unit_profile_id?: number;
          updated_at?: string | null;
          weapon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "unit_profile_weapons_unit_profile_id_fkey";
            columns: ["unit_profile_id"];
            isOneToOne: false;
            referencedRelation: "unit_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_profile_weapons_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_option_categories: {
        Row: {
          position: number;
          unit_option_id: number;
          wargear_category_id: number;
        };
        Insert: {
          position?: number;
          unit_option_id: number;
          wargear_category_id: number;
        };
        Update: {
          position?: number;
          unit_option_id?: number;
          wargear_category_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "unit_option_categories_unit_option_id_fkey";
            columns: ["unit_option_id"];
            isOneToOne: false;
            referencedRelation: "unit_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_option_categories_wargear_category_id_fkey";
            columns: ["wargear_category_id"];
            isOneToOne: false;
            referencedRelation: "wargear_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_options: {
        Row: {
          alternative: number;
          armour_id: number | null;
          created_at: string;
          grant_mode: string | null;
          granted_unit_id: number | null;
          id: number;
          models_max: number | null;
          models_min: number | null;
          models_per: number | null;
          note: string | null;
          option_group: string;
          optional: boolean;
          position: number;
          quantity: number | null;
          replaces_armour_id: number | null;
          replaces_weapon_id: number | null;
          restriction: string | null;
          to_unit_profile_id: number | null;
          unit_id: number;
          unit_profile_id: number | null;
          updated_at: string | null;
          weapon_id: number | null;
          whole_unit: boolean;
        };
        Insert: {
          alternative?: number;
          armour_id?: number | null;
          created_at?: string;
          grant_mode?: string | null;
          granted_unit_id?: number | null;
          id?: number;
          models_max?: number | null;
          models_min?: number | null;
          models_per?: number | null;
          note?: string | null;
          option_group: string;
          optional?: boolean;
          position: number;
          quantity?: number | null;
          replaces_armour_id?: number | null;
          replaces_weapon_id?: number | null;
          restriction?: string | null;
          to_unit_profile_id?: number | null;
          unit_id: number;
          unit_profile_id?: number | null;
          updated_at?: string | null;
          weapon_id?: number | null;
          whole_unit?: boolean;
        };
        Update: {
          alternative?: number;
          armour_id?: number | null;
          created_at?: string;
          grant_mode?: string | null;
          granted_unit_id?: number | null;
          id?: number;
          models_max?: number | null;
          models_min?: number | null;
          models_per?: number | null;
          note?: string | null;
          option_group?: string;
          optional?: boolean;
          position?: number;
          quantity?: number | null;
          replaces_armour_id?: number | null;
          replaces_weapon_id?: number | null;
          restriction?: string | null;
          to_unit_profile_id?: number | null;
          unit_id?: number;
          unit_profile_id?: number | null;
          updated_at?: string | null;
          weapon_id?: number | null;
          whole_unit?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "unit_options_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_granted_unit_id_fkey";
            columns: ["granted_unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_replaces_armour_id_fkey";
            columns: ["replaces_armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_replaces_weapon_id_fkey";
            columns: ["replaces_weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_to_unit_profile_id_fkey";
            columns: ["to_unit_profile_id"];
            isOneToOne: false;
            referencedRelation: "unit_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_unit_profile_id_fkey";
            columns: ["unit_profile_id"];
            isOneToOne: false;
            referencedRelation: "unit_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "unit_options_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_profiles: {
        Row: {
          a: number | null;
          alternative: number;
          bs: number | null;
          created_at: string;
          i: number | null;
          id: number;
          ld: number | null;
          m: number | null;
          mastery_level: number | null;
          models_max: number | null;
          models_min: number;
          name: string;
          points: number | null;
          position: number;
          s: number | null;
          t: number | null;
          unit_id: number;
          updated_at: string | null;
          w: number | null;
          wargear_cards_max: number | null;
          ws: number | null;
        };
        Insert: {
          a?: number | null;
          alternative?: number;
          bs?: number | null;
          created_at?: string;
          i?: number | null;
          id?: number;
          ld?: number | null;
          m?: number | null;
          mastery_level?: number | null;
          models_max?: number | null;
          models_min: number;
          name: string;
          points?: number | null;
          position: number;
          s?: number | null;
          t?: number | null;
          unit_id: number;
          updated_at?: string | null;
          w?: number | null;
          wargear_cards_max?: number | null;
          ws?: number | null;
        };
        Update: {
          a?: number | null;
          alternative?: number;
          bs?: number | null;
          created_at?: string;
          i?: number | null;
          id?: number;
          ld?: number | null;
          m?: number | null;
          mastery_level?: number | null;
          models_max?: number | null;
          models_min?: number;
          name?: string;
          points?: number | null;
          position?: number;
          s?: number | null;
          t?: number | null;
          unit_id?: number;
          updated_at?: string | null;
          w?: number | null;
          wargear_cards_max?: number | null;
          ws?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "unit_profiles_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      units: {
        Row: {
          created_at: string;
          faction_id: number | null;
          id: number;
          name: string;
          points: number | null;
          profile_description: string | null;
          unit_category_id: number | null;
          unit_type_id: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          faction_id?: number | null;
          id?: number;
          name: string;
          points?: number | null;
          profile_description?: string | null;
          unit_category_id?: number | null;
          unit_type_id: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          faction_id?: number | null;
          id?: number;
          name?: string;
          points?: number | null;
          profile_description?: string | null;
          unit_category_id?: number | null;
          unit_type_id?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "units_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "units_unit_category_id_fkey";
            columns: ["unit_category_id"];
            isOneToOne: false;
            referencedRelation: "unit_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "units_unit_type_id_fkey";
            columns: ["unit_type_id"];
            isOneToOne: false;
            referencedRelation: "unit_types";
            referencedColumns: ["id"];
          },
        ];
      };
      unit_types: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          plural_name: string;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          plural_name: string;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          plural_name?: string;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      wargear_categories: {
        Row: {
          army_list_id: number;
          category: string;
          id: number;
          note: string | null;
        };
        Insert: {
          army_list_id: number;
          category: string;
          id?: number;
          note?: string | null;
        };
        Update: {
          army_list_id?: number;
          category?: string;
          id?: number;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wargear_categories_army_list_id_fkey";
            columns: ["army_list_id"];
            isOneToOne: false;
            referencedRelation: "army_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      wargear_items: {
        Row: {
          armour_id: number | null;
          created_at: string;
          id: number;
          points: number | null;
          restriction: string | null;
          unit_id: number | null;
          updated_at: string | null;
          wargear_category_id: number;
          weapon_id: number | null;
        };
        Insert: {
          armour_id?: number | null;
          created_at?: string;
          id?: number;
          points?: number | null;
          restriction?: string | null;
          unit_id?: number | null;
          updated_at?: string | null;
          wargear_category_id: number;
          weapon_id?: number | null;
        };
        Update: {
          armour_id?: number | null;
          created_at?: string;
          id?: number;
          points?: number | null;
          restriction?: string | null;
          unit_id?: number | null;
          updated_at?: string | null;
          wargear_category_id?: number;
          weapon_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "wargear_items_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wargear_items_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wargear_items_wargear_category_id_fkey";
            columns: ["wargear_category_id"];
            isOneToOne: false;
            referencedRelation: "wargear_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wargear_items_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      wargear_cards: {
        Row: {
          created_at: string;
          description: string | null;
          discard_after_use: boolean;
          id: number;
          name: string;
          origin: string;
          points: string | null;
          rarity: Database["public"]["Enums"]["wargear_rarities"];
          restriction: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          discard_after_use?: boolean;
          id?: number;
          name: string;
          origin: string;
          points?: string | null;
          rarity: Database["public"]["Enums"]["wargear_rarities"];
          restriction?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          discard_after_use?: boolean;
          id?: number;
          name?: string;
          origin?: string;
          points?: string | null;
          rarity?: Database["public"]["Enums"]["wargear_rarities"];
          restriction?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      wargear_cards_availabilities: {
        Row: {
          availability_id: number;
          wargear_card_id: number;
        };
        Insert: {
          availability_id: number;
          wargear_card_id: number;
        };
        Update: {
          availability_id?: number;
          wargear_card_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "wargear_cards_availabilities_availability_id_fkey";
            columns: ["availability_id"];
            isOneToOne: false;
            referencedRelation: "availabilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wargear_cards_availabilities_wargear_card_id_fkey";
            columns: ["wargear_card_id"];
            isOneToOne: false;
            referencedRelation: "wargear_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      wargear_cards_armour: {
        Row: {
          armour_id: number;
          position: number;
          wargear_card_id: number;
        };
        Insert: {
          armour_id: number;
          position?: number;
          wargear_card_id: number;
        };
        Update: {
          armour_id?: number;
          position?: number;
          wargear_card_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "wargear_cards_armour_armour_id_fkey";
            columns: ["armour_id"];
            isOneToOne: false;
            referencedRelation: "armour";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wargear_cards_armour_wargear_card_id_fkey";
            columns: ["wargear_card_id"];
            isOneToOne: false;
            referencedRelation: "wargear_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      wargear_cards_weapons: {
        Row: {
          position: number;
          wargear_card_id: number;
          weapon_id: number;
        };
        Insert: {
          position?: number;
          wargear_card_id: number;
          weapon_id: number;
        };
        Update: {
          position?: number;
          wargear_card_id?: number;
          weapon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "wargear_cards_weapons_wargear_card_id_fkey";
            columns: ["wargear_card_id"];
            isOneToOne: false;
            referencedRelation: "wargear_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wargear_cards_weapons_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      weapon_categories: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          position: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          position: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          position?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      weapon_profiles: {
        Row: {
          armour_penetration: string;
          created_at: string;
          damage: string;
          id: number;
          long_range: string;
          long_to_hit: string;
          name: string | null;
          save_modifier: string;
          short_range: string;
          short_to_hit: string;
          strength: string;
          updated_at: string | null;
          weapon_id: number;
        };
        Insert: {
          armour_penetration: string;
          created_at?: string;
          damage: string;
          id?: number;
          long_range: string;
          long_to_hit: string;
          name?: string | null;
          save_modifier: string;
          short_range: string;
          short_to_hit: string;
          strength: string;
          updated_at?: string | null;
          weapon_id: number;
        };
        Update: {
          armour_penetration?: string;
          created_at?: string;
          damage?: string;
          id?: number;
          long_range?: string;
          long_to_hit?: string;
          name?: string | null;
          save_modifier?: string;
          short_range?: string;
          short_to_hit?: string;
          strength?: string;
          updated_at?: string | null;
          weapon_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "weapon_profiles_weapon_id_fkey";
            columns: ["weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
      weapon_profiles_special_rules: {
        Row: {
          special_rule_id: number;
          weapon_profile_id: number;
        };
        Insert: {
          special_rule_id: number;
          weapon_profile_id: number;
        };
        Update: {
          special_rule_id?: number;
          weapon_profile_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "weapon_profiles_special_rules_special_rule_id_fkey";
            columns: ["special_rule_id"];
            isOneToOne: false;
            referencedRelation: "weapon_special_rules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weapon_profiles_special_rules_weapon_profile_id_fkey";
            columns: ["weapon_profile_id"];
            isOneToOne: false;
            referencedRelation: "weapon_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      weapon_special_rules: {
        Row: {
          bearer: string | null;
          created_at: string;
          id: number;
          name: string;
          rule: string;
          rule_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          bearer?: string | null;
          created_at?: string;
          id?: number;
          name: string;
          rule: string;
          rule_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          bearer?: string | null;
          created_at?: string;
          id?: number;
          name?: string;
          rule?: string;
          rule_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "weapon_special_rules_rule_id_fkey";
            columns: ["rule_id"];
            isOneToOne: false;
            referencedRelation: "rules";
            referencedColumns: ["id"];
          },
        ];
      };
      weapons: {
        Row: {
          category_id: number;
          counts_as_weapon_id: number | null;
          created_at: string;
          id: number;
          name: string;
          profile_description: string | null;
          updated_at: string | null;
        };
        Insert: {
          category_id: number;
          counts_as_weapon_id?: number | null;
          created_at?: string;
          id?: number;
          name: string;
          profile_description?: string | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: number;
          counts_as_weapon_id?: number | null;
          created_at?: string;
          id?: number;
          name?: string;
          profile_description?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "weapons_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "weapon_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weapons_counts_as_weapon_id_fkey";
            columns: ["counts_as_weapon_id"];
            isOneToOne: false;
            referencedRelation: "weapons";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      psychic_power_decks:
        | "Librarian"
        | "Inquisition"
        | "Adeptus"
        | "Ork Weirdboyz"
        | "Eldar Seers"
        | "Squat"
        | "Tyranid"
        | "Slaanesh"
        | "Tzeentch"
        | "Nurgle";
      wargear_rarities: "Uncommon" | "Rare" | "Unique";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      psychic_power_decks: [
        "Librarian",
        "Inquisition",
        "Adeptus",
        "Ork Weirdboyz",
        "Eldar Seers",
        "Squat",
        "Tyranid",
        "Slaanesh",
        "Tzeentch",
        "Nurgle",
      ],
      wargear_rarities: ["Uncommon", "Rare", "Unique"],
    },
  },
} as const;
