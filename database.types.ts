export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      armour: {
        Row: {
          created_at: string
          id: number
          name: string
          profile_description: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          profile_description: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          profile_description?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      army_lists: {
        Row: {
          created_at: string
          description: string | null
          faction_id: number
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          faction_id: number
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          faction_id?: number
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "army_lists_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
        ]
      }
      characteristic_profiles: {
        Row: {
          a: number
          bs: number
          created_at: string
          i: number
          id: number
          ld: number
          m: number
          name: string
          s: number
          t: number
          updated_at: string | null
          w: number
          ws: number
        }
        Insert: {
          a: number
          bs: number
          created_at?: string
          i: number
          id?: number
          ld: number
          m: number
          name: string
          s: number
          t: number
          updated_at?: string | null
          w: number
          ws: number
        }
        Update: {
          a?: number
          bs?: number
          created_at?: string
          i?: number
          id?: number
          ld?: number
          m?: number
          name?: string
          s?: number
          t?: number
          updated_at?: string | null
          w?: number
          ws?: number
        }
        Relationships: []
      }
      equipment_weapons: {
        Row: {
          army_list_id: number
          category: string
          note: string | null
          points: number
          weapon_id: number
        }
        Insert: {
          army_list_id: number
          category: string
          note?: string | null
          points: number
          weapon_id: number
        }
        Update: {
          army_list_id?: number
          category?: string
          note?: string | null
          points?: number
          weapon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_weapons_army_list_id_fkey"
            columns: ["army_list_id"]
            isOneToOne: false
            referencedRelation: "army_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_weapons_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      faction_images: {
        Row: {
          faction_id: number
          image_id: number
        }
        Insert: {
          faction_id: number
          image_id: number
        }
        Update: {
          faction_id?: number
          image_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "faction_images_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faction_images_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      factions: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          parent_faction_id: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          parent_faction_id?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          parent_faction_id?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factions_parent_faction_id_fkey"
            columns: ["parent_faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          artist: string
          created_at: string
          file_name: string
          id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          artist: string
          created_at?: string
          file_name: string
          id?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string
          created_at?: string
          file_name?: string
          id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mission_cards: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          origin: string
          primary_objective: string
          secondary_objective: string | null
          special_rules: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          origin: string
          primary_objective: string
          secondary_objective?: string | null
          special_rules?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          origin?: string
          primary_objective?: string
          secondary_objective?: string | null
          special_rules?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      psychic_power_cards: {
        Row: {
          created_at: string
          deck: Database["public"]["Enums"]["psychic_power_decks"]
          description: string
          force: string
          id: number
          name: string
          range: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deck: Database["public"]["Enums"]["psychic_power_decks"]
          description: string
          force: string
          id?: number
          name: string
          range: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deck?: Database["public"]["Enums"]["psychic_power_decks"]
          description?: string
          force?: string
          id?: number
          name?: string
          range?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rule_categories: {
        Row: {
          created_at: string
          id: number
          name: string
          position: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          position: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          position?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rule_category_images: {
        Row: {
          image_id: number
          rule_category_id: number
        }
        Insert: {
          image_id: number
          rule_category_id: number
        }
        Update: {
          image_id?: number
          rule_category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "rule_category_images_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_category_images_rule_category_id_fkey"
            columns: ["rule_category_id"]
            isOneToOne: false
            referencedRelation: "rule_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          category_id: number
          created_at: string
          id: number
          name: string
          position: number
          rule: string
          updated_at: string | null
        }
        Insert: {
          category_id: number
          created_at?: string
          id?: number
          name: string
          position: number
          rule: string
          updated_at?: string | null
        }
        Update: {
          category_id?: number
          created_at?: string
          id?: number
          name?: string
          position?: number
          rule?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rule_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_cards: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          origin: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          origin: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          origin?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_categories: {
        Row: {
          army_list_id: number
          category: string
          id: number
          position: number
        }
        Insert: {
          army_list_id: number
          category: string
          id?: number
          position: number
        }
        Update: {
          army_list_id?: number
          category?: string
          id?: number
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "unit_categories_army_list_id_fkey"
            columns: ["army_list_id"]
            isOneToOne: false
            referencedRelation: "army_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_profile_wargear: {
        Row: {
          profile_description: string | null
          unit_profile_id: number
          wargear_category_id: number
        }
        Insert: {
          profile_description?: string | null
          unit_profile_id: number
          wargear_category_id: number
        }
        Update: {
          profile_description?: string | null
          unit_profile_id?: number
          wargear_category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "unit_profile_wargear_unit_profile_id_fkey"
            columns: ["unit_profile_id"]
            isOneToOne: false
            referencedRelation: "unit_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_profile_wargear_wargear_category_id_fkey"
            columns: ["wargear_category_id"]
            isOneToOne: false
            referencedRelation: "wargear_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_profile_weapons: {
        Row: {
          unit_profile_id: number
          weapon_id: number
        }
        Insert: {
          unit_profile_id: number
          weapon_id: number
        }
        Update: {
          unit_profile_id?: number
          weapon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "unit_profile_weapons_unit_profile_id_fkey"
            columns: ["unit_profile_id"]
            isOneToOne: false
            referencedRelation: "unit_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_profile_weapons_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_profiles: {
        Row: {
          armour: number | null
          characteristic_profile_id: number
          id: number
          mastery_level: number | null
          max: number
          min: number
          name: string
          points: number | null
          unit_id: number
        }
        Insert: {
          armour?: number | null
          characteristic_profile_id: number
          id?: number
          mastery_level?: number | null
          max: number
          min: number
          name: string
          points?: number | null
          unit_id: number
        }
        Update: {
          armour?: number | null
          characteristic_profile_id?: number
          id?: number
          mastery_level?: number | null
          max?: number
          min?: number
          name?: string
          points?: number | null
          unit_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "unit_profiles_armour_fkey"
            columns: ["armour"]
            isOneToOne: false
            referencedRelation: "armour"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_profiles_characteristic_profile_id_fkey"
            columns: ["characteristic_profile_id"]
            isOneToOne: false
            referencedRelation: "characteristic_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: number
          name: string
          points: number | null
          profile_description: string | null
          type: Database["public"]["Enums"]["unit_types"]
          unit_category_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          points?: number | null
          profile_description?: string | null
          type: Database["public"]["Enums"]["unit_types"]
          unit_category_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          points?: number | null
          profile_description?: string | null
          type?: Database["public"]["Enums"]["unit_types"]
          unit_category_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_unit_category_id_fkey"
            columns: ["unit_category_id"]
            isOneToOne: false
            referencedRelation: "unit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      wargear_categories: {
        Row: {
          army_list_id: number
          category: string
          id: number
          note: string | null
        }
        Insert: {
          army_list_id: number
          category: string
          id?: number
          note?: string | null
        }
        Update: {
          army_list_id?: number
          category?: string
          id?: number
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wargear_categories_army_list_id_fkey"
            columns: ["army_list_id"]
            isOneToOne: false
            referencedRelation: "army_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      wargear_items: {
        Row: {
          armour_id: number | null
          created_at: string
          id: number
          points: number
          updated_at: string | null
          vehicle_id: number | null
          wargear_category_id: number
          weapon_id: number | null
        }
        Insert: {
          armour_id?: number | null
          created_at?: string
          id?: number
          points: number
          updated_at?: string | null
          vehicle_id?: number | null
          wargear_category_id: number
          weapon_id?: number | null
        }
        Update: {
          armour_id?: number | null
          created_at?: string
          id?: number
          points?: number
          updated_at?: string | null
          vehicle_id?: number | null
          wargear_category_id?: number
          weapon_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wargear_items_armour_id_fkey"
            columns: ["armour_id"]
            isOneToOne: false
            referencedRelation: "armour"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wargear_items_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wargear_items_wargear_category_id_fkey"
            columns: ["wargear_category_id"]
            isOneToOne: false
            referencedRelation: "wargear_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wargear_items_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_profiles: {
        Row: {
          armour_penetration: string
          created_at: string
          damage: string
          id: number
          long_range: string
          long_to_hit: string
          name: string | null
          save_modifier: string
          short_range: string
          short_to_hit: string
          strength: string
          updated_at: string | null
          weapon_id: number
        }
        Insert: {
          armour_penetration: string
          created_at?: string
          damage: string
          id?: number
          long_range: string
          long_to_hit: string
          name?: string | null
          save_modifier: string
          short_range: string
          short_to_hit: string
          strength: string
          updated_at?: string | null
          weapon_id: number
        }
        Update: {
          armour_penetration?: string
          created_at?: string
          damage?: string
          id?: number
          long_range?: string
          long_to_hit?: string
          name?: string | null
          save_modifier?: string
          short_range?: string
          short_to_hit?: string
          strength?: string
          updated_at?: string | null
          weapon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "weapon_profiles_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_profiles_special_rules: {
        Row: {
          special_rule_id: number
          weapon_profile_id: number
        }
        Insert: {
          special_rule_id: number
          weapon_profile_id: number
        }
        Update: {
          special_rule_id?: number
          weapon_profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "weapon_profiles_special_rules_special_rule_id_fkey"
            columns: ["special_rule_id"]
            isOneToOne: false
            referencedRelation: "weapon_special_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapon_profiles_special_rules_weapon_profile_id_fkey"
            columns: ["weapon_profile_id"]
            isOneToOne: false
            referencedRelation: "weapon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_special_rules: {
        Row: {
          created_at: string
          id: number
          name: string
          rule: string
          rule_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          rule: string
          rule_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          rule?: string
          rule_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weapon_special_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
        ]
      }
      weapons: {
        Row: {
          category: Database["public"]["Enums"]["weapon_categories"]
          created_at: string
          id: number
          name: string
          profile_description: string | null
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["weapon_categories"]
          created_at?: string
          id?: number
          name: string
          profile_description?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["weapon_categories"]
          created_at?: string
          id?: number
          name?: string
          profile_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
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
        | "Nurgle"
      unit_types: "Character" | "Squad"
      weapon_categories:
        | "Basic"
        | "Close combat"
        | "Heavy"
        | "Pistol"
        | "Grenades"
        | "Support"
        | "Wargear"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      unit_types: ["Character", "Squad"],
      weapon_categories: [
        "Basic",
        "Close combat",
        "Heavy",
        "Pistol",
        "Grenades",
        "Support",
        "Wargear",
      ],
    },
  },
} as const
