/* BERKAS INI DIHASILKAN oleh `npm run db:gen-types`. Jangan diedit tangan. */
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      impact_metric: {
        Row: {
          code: string
          created_at: string
          id: string
          is_demo: boolean
          is_public: boolean
          label: string
          period: Database["public"]["Enums"]["metric_period"]
          period_label: string | null
          region_id: string | null
          sort_order: number
          unit: Database["public"]["Enums"]["metric_unit"]
          updated_at: string
          value_numeric: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_demo?: boolean
          is_public?: boolean
          label: string
          period: Database["public"]["Enums"]["metric_period"]
          period_label?: string | null
          region_id?: string | null
          sort_order?: number
          unit: Database["public"]["Enums"]["metric_unit"]
          updated_at?: string
          value_numeric: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          is_public?: boolean
          label?: string
          period?: Database["public"]["Enums"]["metric_period"]
          period_label?: string | null
          region_id?: string | null
          sort_order?: number
          unit?: Database["public"]["Enums"]["metric_unit"]
          updated_at?: string
          value_numeric?: number
        }
        Relationships: [
          {
            foreignKeyName: "impact_metric_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_metric_reference: {
        Row: {
          assumption_note: string
          citation_label: string
          citation_url: string | null
          created_at: string
          id: string
          metric_id: string
        }
        Insert: {
          assumption_note: string
          citation_label: string
          citation_url?: string | null
          created_at?: string
          id?: string
          metric_id: string
        }
        Update: {
          assumption_note?: string
          citation_label?: string
          citation_url?: string | null
          created_at?: string
          id?: string
          metric_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_metric_reference_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "impact_metric"
            referencedColumns: ["id"]
          },
        ]
      }
      kud: {
        Row: {
          city: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          daily_milk_l: number
          farmer_count: number
          id: string
          name: string
          region_id: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          city: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          daily_milk_l?: number
          farmer_count?: number
          id?: string
          name: string
          region_id: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          daily_milk_l?: number
          farmer_count?: number
          id?: string
          name?: string
          region_id?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kud_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      lead: {
        Row: {
          cattle_count: number
          consented_at: string
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          idempotency_key: string
          is_demo: boolean
          kud_id: string | null
          message: string | null
          phone_wa: string
          region_id: string
          sample_requested: boolean
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          cattle_count: number
          consented_at: string
          created_at?: string
          deleted_at?: string | null
          full_name: string
          id?: string
          idempotency_key: string
          is_demo?: boolean
          kud_id?: string | null
          message?: string | null
          phone_wa: string
          region_id: string
          sample_requested?: boolean
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          cattle_count?: number
          consented_at?: string
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          idempotency_key?: string
          is_demo?: boolean
          kud_id?: string | null
          message?: string | null
          phone_wa?: string
          region_id?: string
          sample_requested?: boolean
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_kud_id_fkey"
            columns: ["kud_id"]
            isOneToOne: false
            referencedRelation: "kud"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_event: {
        Row: {
          event_name: string
          id: number
          lead_id: string | null
          metadata: Json
          occurred_at: string
          path: string | null
          placement: string | null
          session_id: string | null
        }
        Insert: {
          event_name: string
          id?: number
          lead_id?: string | null
          metadata?: Json
          occurred_at?: string
          path?: string | null
          placement?: string | null
          session_id?: string | null
        }
        Update: {
          event_name?: string
          id?: number
          lead_id?: string | null
          metadata?: Json
          occurred_at?: string
          path?: string | null
          placement?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_event_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          compare_price_idr: number | null
          created_at: string
          category: string
          description: string
          id: string
          image_path: string | null
          is_active: boolean
          is_bulk: boolean
          name: string
          pack_weight_kg: number
          price_idr: number
          protein_pct: number | null
          sku: string
          slug: string
          unit: string
          updated_at: string
        }
        Insert: {
          compare_price_idr?: number | null
          created_at?: string
          category?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          is_bulk?: boolean
          name: string
          pack_weight_kg: number
          price_idr: number
          protein_pct?: number | null
          sku: string
          slug: string
          unit?: string
          updated_at?: string
        }
        Update: {
          compare_price_idr?: number | null
          created_at?: string
          category?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          is_bulk?: boolean
          name?: string
          pack_weight_kg?: number
          price_idr?: number
          protein_pct?: number | null
          sku?: string
          slug?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_ingredient: {
        Row: {
          function_label: string
          id: string
          name: string
          product_id: string
          share_max_pct: number
          share_min_pct: number
          sort_order: number
        }
        Insert: {
          function_label: string
          id?: string
          name: string
          product_id: string
          share_max_pct: number
          share_min_pct: number
          sort_order?: number
        }
        Update: {
          function_label?: string
          id?: string
          name?: string
          product_id?: string
          share_max_pct?: number
          share_min_pct?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredient_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      region: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          province: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          province: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          province?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_role: { Args: never; Returns: string }
      submit_sample_lead: {
        Args: {
          p_cattle_count: number
          p_full_name: string
          p_idempotency_key?: string
          p_kud_slug?: string
          p_message?: string
          p_phone_wa: string
          p_region_code: string
          p_source?: Database["public"]["Enums"]["lead_source"]
          p_utm?: Json
        }
        Returns: {
          created: boolean
          lead_id: string
        }[]
      }
    }
    Enums: {
      lead_source:
        | "tiktok"
        | "instagram"
        | "facebook"
        | "whatsapp"
        | "referral"
        | "field_visit"
        | "other"
      lead_status: "new" | "contacted" | "sampled" | "converted" | "rejected"
      metric_period: "daily" | "weekly" | "monthly" | "yearly" | "cumulative"
      metric_unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      lead_source: [
        "tiktok",
        "instagram",
        "facebook",
        "whatsapp",
        "referral",
        "field_visit",
        "other",
      ],
      lead_status: ["new", "contacted", "sampled", "converted", "rejected"],
      metric_period: ["daily", "weekly", "monthly", "yearly", "cumulative"],
      metric_unit: ["ton", "kg", "rupiah", "liter", "count", "percent"],
    },
  },
} as const
