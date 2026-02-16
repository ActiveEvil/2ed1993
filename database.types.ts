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
      equipment_weapons: {
        Row: {
          faction_id: number
          points: number
          weapon_id: number
        }
        Insert: {
          faction_id: number
          points: number
          weapon_id: number
        }
        Update: {
          faction_id?: number
          points?: number
          weapon_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_weapons_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "factions"
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          parent_faction_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          parent_faction_id?: number | null
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
      weapons: {
        Row: {
          armour_penetration: string
          category: Database["public"]["Enums"]["weapon_categories"]
          created_at: string
          damage: string
          id: number
          long_range: string
          long_to_hit: string
          name: string
          save_modifier: string
          short_range: string
          short_to_hit: string
          strength: string
          updated_at: string | null
        }
        Insert: {
          armour_penetration: string
          category: Database["public"]["Enums"]["weapon_categories"]
          created_at?: string
          damage: string
          id?: number
          long_range: string
          long_to_hit: string
          name: string
          save_modifier: string
          short_range: string
          short_to_hit: string
          strength: string
          updated_at?: string | null
        }
        Update: {
          armour_penetration?: string
          category?: Database["public"]["Enums"]["weapon_categories"]
          created_at?: string
          damage?: string
          id?: number
          long_range?: string
          long_to_hit?: string
          name?: string
          save_modifier?: string
          short_range?: string
          short_to_hit?: string
          strength?: string
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
      weapon_categories:
        | "Basic"
        | "Close combat"
        | "Heavy"
        | "Pistol"
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
      weapon_categories: [
        "Basic",
        "Close combat",
        "Heavy",
        "Pistol",
        "Support",
        "Wargear",
      ],
    },
  },
} as const
