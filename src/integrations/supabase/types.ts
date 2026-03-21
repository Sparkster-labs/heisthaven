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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      boss_vault_progress: {
        Row: {
          boss_id: string
          city_id: string
          cleared_at: string | null
          id: string
          legendary_piece_id: string | null
          user_id: string | null
        }
        Insert: {
          boss_id: string
          city_id: string
          cleared_at?: string | null
          id?: string
          legendary_piece_id?: string | null
          user_id?: string | null
        }
        Update: {
          boss_id?: string
          city_id?: string
          cleared_at?: string | null
          id?: string
          legendary_piece_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boss_vault_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      city_progress: {
        Row: {
          boss_vault_cleared: boolean
          city_id: string
          district_heat: Json
          id: string
          unlocked_districts: string[]
          user_id: string | null
        }
        Insert: {
          boss_vault_cleared?: boolean
          city_id: string
          district_heat?: Json
          id?: string
          unlocked_districts?: string[]
          user_id?: string | null
        }
        Update: {
          boss_vault_cleared?: boolean
          city_id?: string
          district_heat?: Json
          id?: string
          unlocked_districts?: string[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_state: {
        Row: {
          crew_id: string
          id: string
          level: number
          loyalty: number
          unlocked: boolean
          user_id: string | null
        }
        Insert: {
          crew_id: string
          id?: string
          level?: number
          loyalty?: number
          unlocked?: boolean
          user_id?: string | null
        }
        Update: {
          crew_id?: string
          id?: string
          level?: number
          loyalty?: number
          unlocked?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      heist_history: {
        Row: {
          cash_spent: number | null
          chaos_card_id: string | null
          city_id: string | null
          created_at: string | null
          crew_ids: string[] | null
          id: string
          jewel_drops: Json | null
          mini_game_results: boolean[] | null
          payout: number | null
          success: boolean | null
          user_id: string | null
          vault_name: string | null
          vault_tier: number | null
        }
        Insert: {
          cash_spent?: number | null
          chaos_card_id?: string | null
          city_id?: string | null
          created_at?: string | null
          crew_ids?: string[] | null
          id?: string
          jewel_drops?: Json | null
          mini_game_results?: boolean[] | null
          payout?: number | null
          success?: boolean | null
          user_id?: string | null
          vault_name?: string | null
          vault_tier?: number | null
        }
        Update: {
          cash_spent?: number | null
          chaos_card_id?: string | null
          city_id?: string | null
          created_at?: string | null
          crew_ids?: string[] | null
          id?: string
          jewel_drops?: Json | null
          mini_game_results?: boolean[] | null
          payout?: number | null
          success?: boolean | null
          user_id?: string | null
          vault_name?: string | null
          vault_tier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "heist_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      held_loot: {
        Row: {
          amount: number
          expires_at: string
          held_at: string
          id: string
          raid_chance: number
          user_id: string | null
        }
        Insert: {
          amount: number
          expires_at: string
          held_at?: string
          id?: string
          raid_chance?: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          expires_at?: string
          held_at?: string
          id?: string
          raid_chance?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "held_loot_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jail_state: {
        Row: {
          bail_cost: number
          id: string
          jailed_at: string
          offense_count: number
          paid: boolean
          release_at: string
          user_id: string
        }
        Insert: {
          bail_cost?: number
          id?: string
          jailed_at?: string
          offense_count?: number
          paid?: boolean
          release_at: string
          user_id: string
        }
        Update: {
          bail_cost?: number
          id?: string
          jailed_at?: string
          offense_count?: number
          paid?: boolean
          release_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jail_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_weekly: {
        Row: {
          id: string
          net_cash_earned: number
          user_id: string | null
          week_start: string
        }
        Insert: {
          id?: string
          net_cash_earned?: number
          user_id?: string | null
          week_start: string
        }
        Update: {
          id?: string
          net_cash_earned?: number
          user_id?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_weekly_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owned_assets: {
        Row: {
          asset_id: string
          asset_type: string
          id: string
          last_collected: string | null
          level: number | null
          purchased_at: string | null
          user_id: string | null
        }
        Insert: {
          asset_id: string
          asset_type?: string
          id?: string
          last_collected?: string | null
          level?: number | null
          purchased_at?: string | null
          user_id?: string | null
        }
        Update: {
          asset_id?: string
          asset_type?: string
          id?: string
          last_collected?: string | null
          level?: number | null
          purchased_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owned_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: Json
          cash: number
          created_at: string | null
          crew_insurance: boolean
          current_city: string
          display_name: string
          equippedItems: Json
          id: string
          jewels: Json
          last_login: string | null
          minigame_unlocks: Json
          notoriety_title: string
          rep_level: number
          rep_xp: number
          unlocked_cities: string[]
        }
        Insert: {
          avatar?: Json
          cash?: number
          created_at?: string | null
          crew_insurance?: boolean
          current_city?: string
          display_name?: string
          equippedItems?: Json
          id: string
          jewels?: Json
          last_login?: string | null
          minigame_unlocks?: Json
          notoriety_title?: string
          rep_level?: number
          rep_xp?: number
          unlocked_cities?: string[]
        }
        Update: {
          avatar?: Json
          cash?: number
          created_at?: string | null
          crew_insurance?: boolean
          current_city?: string
          display_name?: string
          equippedItems?: Json
          id?: string
          jewels?: Json
          last_login?: string | null
          minigame_unlocks?: Json
          notoriety_title?: string
          rep_level?: number
          rep_xp?: number
          unlocked_cities?: string[]
        }
        Relationships: []
      }
      safehouse: {
        Row: {
          id: string
          rooms: Json
          user_id: string | null
        }
        Insert: {
          id?: string
          rooms?: Json
          user_id?: string | null
        }
        Update: {
          id?: string
          rooms?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safehouse_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe: {
        Row: {
          acquired_at: string | null
          acquired_from: string
          id: string
          item_id: string
          user_id: string | null
        }
        Insert: {
          acquired_at?: string | null
          acquired_from?: string
          id?: string
          item_id: string
          user_id?: string | null
        }
        Update: {
          acquired_at?: string | null
          acquired_from?: string
          id?: string
          item_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wardrobe_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
