/* BERKAS INI DIHASILKAN. Jangan diedit tangan. */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      impact_metric: {
        Row: {
          id: string;
          code: string;
          label: string;
          value_numeric: number;
          unit: Database["public"]["Enums"]["metric_unit"];
          period: Database["public"]["Enums"]["metric_period"];
          period_label: string | null;
          region_id: string | null;
          is_demo: boolean;
          is_public: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          label: string;
          value_numeric: number;
          unit: Database["public"]["Enums"]["metric_unit"];
          period: Database["public"]["Enums"]["metric_period"];
          period_label?: string | null;
          region_id?: string | null;
          is_demo?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          label?: string;
          value_numeric?: number;
          unit?: Database["public"]["Enums"]["metric_unit"];
          period?: Database["public"]["Enums"]["metric_period"];
          period_label?: string | null;
          region_id?: string | null;
          is_demo?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "impact_metric_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "region";
            referencedColumns: ["id"];
          },
        ];
      };
      impact_metric_reference: {
        Row: {
          id: string;
          metric_id: string;
          citation_label: string;
          citation_url: string | null;
          assumption_note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          metric_id: string;
          citation_label: string;
          citation_url?: string | null;
          assumption_note: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          metric_id?: string;
          citation_label?: string;
          citation_url?: string | null;
          assumption_note?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "impact_metric_reference_metric_id_fkey";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "impact_metric";
            referencedColumns: ["id"];
          },
        ];
      };
      kud: {
        Row: {
          id: string;
          region_id: string;
          slug: string;
          name: string;
          city: string;
          status: string;
          farmer_count: number;
          daily_milk_l: number;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          region_id: string;
          slug: string;
          name: string;
          city: string;
          status?: string;
          farmer_count?: number;
          daily_milk_l?: number;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          region_id?: string;
          slug?: string;
          name?: string;
          city?: string;
          status?: string;
          farmer_count?: number;
          daily_milk_l?: number;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kud_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "region";
            referencedColumns: ["id"];
          },
        ];
      };
      lead: {
        Row: {
          id: string;
          full_name: string;
          phone_wa: string;
          cattle_count: number;
          region_id: string;
          kud_id: string | null;
          message: string | null;
          source: Database["public"]["Enums"]["lead_source"];
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          sample_requested: boolean;
          is_demo: boolean;
          idempotency_key: string;
          consented_at: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone_wa: string;
          cattle_count: number;
          region_id: string;
          kud_id?: string | null;
          message?: string | null;
          source?: Database["public"]["Enums"]["lead_source"];
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          sample_requested?: boolean;
          is_demo?: boolean;
          idempotency_key: string;
          consented_at: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone_wa?: string;
          cattle_count?: number;
          region_id?: string;
          kud_id?: string | null;
          message?: string | null;
          source?: Database["public"]["Enums"]["lead_source"];
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          sample_requested?: boolean;
          is_demo?: boolean;
          idempotency_key?: string;
          consented_at?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_kud_id_fkey";
            columns: ["kud_id"];
            isOneToOne: false;
            referencedRelation: "kud";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "region";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_event: {
        Row: {
          id: number;
          lead_id: string | null;
          session_id: string | null;
          event_name: string;
          path: string | null;
          placement: string | null;
          metadata: Json;
          occurred_at: string;
        };
        Insert: {
          id?: number;
          lead_id?: string | null;
          session_id?: string | null;
          event_name: string;
          path?: string | null;
          placement?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
        Update: {
          id?: number;
          lead_id?: string | null;
          session_id?: string | null;
          event_name?: string;
          path?: string | null;
          placement?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_event_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "lead";
            referencedColumns: ["id"];
          },
        ];
      };
      product: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          name: string;
          description: string;
          unit: string;
          pack_weight_kg: number;
          price_idr: number;
          compare_price_idr: number | null;
          protein_pct: number | null;
          is_bulk: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          slug: string;
          name: string;
          description?: string;
          unit?: string;
          pack_weight_kg: number;
          price_idr: number;
          compare_price_idr?: number | null;
          protein_pct?: number | null;
          is_bulk?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          slug?: string;
          name?: string;
          description?: string;
          unit?: string;
          pack_weight_kg?: number;
          price_idr?: number;
          compare_price_idr?: number | null;
          protein_pct?: number | null;
          is_bulk?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      product_ingredient: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          share_min_pct: number;
          share_max_pct: number;
          function_label: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          share_min_pct: number;
          share_max_pct: number;
          function_label: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          share_min_pct?: number;
          share_max_pct?: number;
          function_label?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_ingredient_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product";
            referencedColumns: ["id"];
          },
        ];
      };
      region: {
        Row: {
          id: string;
          code: string;
          name: string;
          province: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          province: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          province?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      submit_sample_lead: {
        Args: { p_full_name: string | null; p_phone_wa: string | null; p_cattle_count: number | null; p_region_code: string | null; p_kud_slug?: string | null; p_message?: string | null; p_source?: Database["public"]["Enums"]["lead_source"] | null; p_utm?: Json | null; p_idempotency_key?: string | null };
        Returns: { lead_id: string; created: boolean }[];
      };
    };
    Enums: {
      lead_source: "tiktok" | "instagram" | "facebook" | "whatsapp" | "referral" | "field_visit" | "other";
      lead_status: "new" | "contacted" | "sampled" | "converted" | "rejected";
      metric_period: "daily" | "weekly" | "monthly" | "yearly" | "cumulative";
      metric_unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent";
    };
    CompositeTypes: Record<never, never>;
  };
}
