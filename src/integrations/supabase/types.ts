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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batch_edit_tokens: {
        Row: {
          batch_id: string
          created_at: string
          edit_token: string
          email: string
          expires_at: string | null
          id: string
        }
        Insert: {
          batch_id?: string
          created_at?: string
          edit_token?: string
          email: string
          expires_at?: string | null
          id?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          edit_token?: string
          email?: string
          expires_at?: string | null
          id?: string
        }
        Relationships: []
      }
      listing_edit_tokens: {
        Row: {
          created_at: string
          edit_token: string
          expires_at: string | null
          listing_id: string
        }
        Insert: {
          created_at?: string
          edit_token?: string
          expires_at?: string | null
          listing_id: string
        }
        Update: {
          created_at?: string
          edit_token?: string
          expires_at?: string | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_edit_tokens_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_revisions: {
        Row: {
          changed_at: string
          changed_fields: string[]
          changes_summary: string
          id: string
          listing_id: string
          revision: number
        }
        Insert: {
          changed_at?: string
          changed_fields?: string[]
          changes_summary: string
          id?: string
          listing_id: string
          revision: number
        }
        Update: {
          changed_at?: string
          changed_fields?: string[]
          changes_summary?: string
          id?: string
          listing_id?: string
          revision?: number
        }
        Relationships: []
      }
      listings: {
        Row: {
          batch_id: string | null
          city: string
          complex_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          directions_clicks: number | null
          email_visible: boolean
          favorites_count: number | null
          gate_access_info: string | null
          has_cover_photo: boolean
          id: string
          image_urls: string[] | null
          lat: number | null
          lng: number | null
          max_visitors: number | null
          name_visible: boolean
          operating_hours: Json | null
          parking_info: string | null
          phone_visible: boolean
          postal_code: string
          province: string
          revision: number
          street_name: string
          street_number: string
          submitter_notes: string | null
          suburb: string
          tags: string[] | null
          title: string | null
          unit_no: string | null
          updated_at: string
          youtube_urls: string[] | null
        }
        Insert: {
          batch_id?: string | null
          city: string
          complex_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          directions_clicks?: number | null
          email_visible?: boolean
          favorites_count?: number | null
          gate_access_info?: string | null
          has_cover_photo?: boolean
          id?: string
          image_urls?: string[] | null
          lat?: number | null
          lng?: number | null
          max_visitors?: number | null
          name_visible?: boolean
          operating_hours?: Json | null
          parking_info?: string | null
          phone_visible?: boolean
          postal_code: string
          province: string
          revision?: number
          street_name: string
          street_number: string
          submitter_notes?: string | null
          suburb: string
          tags?: string[] | null
          title?: string | null
          unit_no?: string | null
          updated_at?: string
          youtube_urls?: string[] | null
        }
        Update: {
          batch_id?: string | null
          city?: string
          complex_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          directions_clicks?: number | null
          email_visible?: boolean
          favorites_count?: number | null
          gate_access_info?: string | null
          has_cover_photo?: boolean
          id?: string
          image_urls?: string[] | null
          lat?: number | null
          lng?: number | null
          max_visitors?: number | null
          name_visible?: boolean
          operating_hours?: Json | null
          parking_info?: string | null
          phone_visible?: boolean
          postal_code?: string
          province?: string
          revision?: number
          street_name?: string
          street_number?: string
          submitter_notes?: string | null
          suburb?: string
          tags?: string[] | null
          title?: string | null
          unit_no?: string | null
          updated_at?: string
          youtube_urls?: string[] | null
        }
        Relationships: []
      }
      listings_public_data: {
        Row: {
          city: string | null
          complex_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          directions_clicks: number | null
          email_visible: boolean | null
          favorites_count: number | null
          gate_access_info: string | null
          has_cover_photo: boolean | null
          id: string
          image_urls: string[] | null
          lat: number | null
          lng: number | null
          max_visitors: number | null
          name_visible: boolean | null
          operating_hours: Json | null
          parking_info: string | null
          phone_visible: boolean | null
          postal_code: string | null
          province: string | null
          street_name: string | null
          street_number: string | null
          suburb: string | null
          tags: string[] | null
          title: string | null
          unit_no: string | null
          updated_at: string | null
          youtube_urls: string[] | null
        }
        Insert: {
          city?: string | null
          complex_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          directions_clicks?: number | null
          email_visible?: boolean | null
          favorites_count?: number | null
          gate_access_info?: string | null
          has_cover_photo?: boolean | null
          id: string
          image_urls?: string[] | null
          lat?: number | null
          lng?: number | null
          max_visitors?: number | null
          name_visible?: boolean | null
          operating_hours?: Json | null
          parking_info?: string | null
          phone_visible?: boolean | null
          postal_code?: string | null
          province?: string | null
          street_name?: string | null
          street_number?: string | null
          suburb?: string | null
          tags?: string[] | null
          title?: string | null
          unit_no?: string | null
          updated_at?: string | null
          youtube_urls?: string[] | null
        }
        Update: {
          city?: string | null
          complex_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          directions_clicks?: number | null
          email_visible?: boolean | null
          favorites_count?: number | null
          gate_access_info?: string | null
          has_cover_photo?: boolean | null
          id?: string
          image_urls?: string[] | null
          lat?: number | null
          lng?: number | null
          max_visitors?: number | null
          name_visible?: boolean | null
          operating_hours?: Json | null
          parking_info?: string | null
          phone_visible?: boolean | null
          postal_code?: string | null
          province?: string | null
          street_name?: string | null
          street_number?: string | null
          suburb?: string | null
          tags?: string[] | null
          title?: string | null
          unit_no?: string | null
          updated_at?: string | null
          youtube_urls?: string[] | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          moderation_reason: string | null
          moderation_status: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          moderation_reason?: string | null
          moderation_status?: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          moderation_reason?: string | null
          moderation_status?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      listings_public: {
        Row: {
          city: string | null
          complex_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          directions_clicks: number | null
          email_visible: boolean | null
          favorites_count: number | null
          gate_access_info: string | null
          has_cover_photo: boolean | null
          id: string | null
          image_urls: string[] | null
          lat: number | null
          lng: number | null
          max_visitors: number | null
          name_visible: boolean | null
          operating_hours: Json | null
          parking_info: string | null
          phone_visible: boolean | null
          postal_code: string | null
          province: string | null
          street_name: string | null
          street_number: string | null
          suburb: string | null
          tags: string[] | null
          title: string | null
          unit_no: string | null
          updated_at: string | null
          youtube_urls: string[] | null
        }
        Insert: {
          city?: string | null
          complex_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          directions_clicks?: number | null
          email_visible?: boolean | null
          favorites_count?: number | null
          gate_access_info?: string | null
          has_cover_photo?: boolean | null
          id?: string | null
          image_urls?: string[] | null
          lat?: number | null
          lng?: number | null
          max_visitors?: number | null
          name_visible?: boolean | null
          operating_hours?: Json | null
          parking_info?: string | null
          phone_visible?: boolean | null
          postal_code?: string | null
          province?: string | null
          street_name?: string | null
          street_number?: string | null
          suburb?: string | null
          tags?: string[] | null
          title?: string | null
          unit_no?: string | null
          updated_at?: string | null
          youtube_urls?: string[] | null
        }
        Update: {
          city?: string | null
          complex_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          directions_clicks?: number | null
          email_visible?: boolean | null
          favorites_count?: number | null
          gate_access_info?: string | null
          has_cover_photo?: boolean | null
          id?: string | null
          image_urls?: string[] | null
          lat?: number | null
          lng?: number | null
          max_visitors?: number | null
          name_visible?: boolean | null
          operating_hours?: Json | null
          parking_info?: string | null
          phone_visible?: boolean | null
          postal_code?: string | null
          province?: string | null
          street_name?: string | null
          street_number?: string | null
          suburb?: string | null
          tags?: string[] | null
          title?: string | null
          unit_no?: string | null
          updated_at?: string | null
          youtube_urls?: string[] | null
        }
        Relationships: []
      }
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
