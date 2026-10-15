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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          position?: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      import_issues: {
        Row: {
          created_at: string
          id: string
          issue: string
          product_name: string | null
          row_number: number | null
          sku: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue: string
          product_name?: string | null
          row_number?: number | null
          sku?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue?: string
          product_name?: string | null
          row_number?: number | null
          sku?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image_url: string | null
          name: string
          options: Json
          order_id: string
          product_id: string | null
          quantity: number
          sku: string | null
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          name: string
          options?: Json
          order_id: string
          product_id?: string | null
          quantity: number
          sku?: string | null
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          name?: string
          options?: Json
          order_id?: string
          product_id?: string | null
          quantity?: number
          sku?: string | null
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string | null
          email: string
          id: string
          mp_payment_id: string | null
          mp_preference_id: string | null
          order_number: number
          payment_status: string
          shipping_address: Json | null
          shipping_cost: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          email: string
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          order_number?: never
          payment_status?: string
          shipping_address?: Json | null
          shipping_cost?: number
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          email?: string
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          order_number?: never
          payment_status?: string
          shipping_address?: Json | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          position: number
          product_id: string
          storage_path: string | null
          url: string
        }
        Insert: {
          id?: string
          position?: number
          product_id: string
          storage_path?: string | null
          url: string
        }
        Update: {
          id?: string
          position?: number
          product_id?: string
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          compare_at_price: number | null
          id: string
          image_url: string | null
          option1: string | null
          option2: string | null
          option3: string | null
          own_stock: number
          position: number
          price: number
          product_id: string
          sku: string
        }
        Insert: {
          active?: boolean
          compare_at_price?: number | null
          id?: string
          image_url?: string | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          own_stock?: number
          position?: number
          price: number
          product_id: string
          sku: string
        }
        Update: {
          active?: boolean
          compare_at_price?: number | null
          id?: string
          image_url?: string | null
          option1?: string | null
          option2?: string | null
          option3?: string | null
          own_stock?: number
          position?: number
          price?: number
          product_id?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_bestseller: boolean
          is_new: boolean
          name: string
          option1_name: string | null
          option2_name: string | null
          option3_name: string | null
          slug: string
          source_category: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_bestseller?: boolean
          is_new?: boolean
          name: string
          option1_name?: string | null
          option2_name?: string | null
          option3_name?: string | null
          slug: string
          source_category?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_bestseller?: boolean
          is_new?: boolean
          name?: string
          option1_name?: string | null
          option2_name?: string | null
          option3_name?: string | null
          slug?: string
          source_category?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_supplier_info: {
        Row: {
          cost_price: number | null
          supplier_available: boolean | null
          supplier_link: string | null
          supplier_stock: number | null
          variant_id: string
        }
        Insert: {
          cost_price?: number | null
          supplier_available?: boolean | null
          supplier_link?: string | null
          supplier_stock?: number | null
          variant_id: string
        }
        Update: {
          cost_price?: number | null
          supplier_available?: boolean | null
          supplier_link?: string | null
          supplier_stock?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_supplier_info_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_order_paid: {
        Args: { p_order_id: string; p_payment_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
