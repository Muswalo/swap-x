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
      contact_access: {
        Row: {
          id: string
          user_id: string
          swap_id: string
          granted_at: string | null
          payment_method: string
        }
        Insert: {
          id?: string
          user_id: string
          swap_id: string
          granted_at?: string | null
          payment_method: string
        }
        Update: {
          id?: string
          user_id?: string
          swap_id?: string
          granted_at?: string | null
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_access_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1_id: string | null
          participant_2_id: string | null
          swap_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1_id?: string | null
          participant_2_id?: string | null
          swap_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1_id?: string | null
          participant_2_id?: string | null
          swap_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_tokens: {
        Row: {
          created_at: string | null
          device_type: string | null
          expo_push_token: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          expo_push_token: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          expo_push_token?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          delivery_channel: string | null
          device_token: string | null
          from_user_id: string | null
          id: string
          notification_type: string
          priority: string | null
          read_at: string | null
          scheduled_at: string | null
          status: string | null
          swap_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          delivery_channel?: string | null
          device_token?: string | null
          from_user_id?: string | null
          id?: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          swap_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          delivery_channel?: string | null
          device_token?: string | null
          from_user_id?: string | null
          id?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          swap_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          current_district: string | null
          current_institution: string | null
          current_ministry: string | null
          desired_district: string | null
          desired_ministry: string | null
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          phone_number: string | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          salary_scale: string | null
          subscription_expires_at: string | null
          updated_at: string | null
          user_id: string | null
          views_remaining: number | null
          years_of_service: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          current_district?: string | null
          current_institution?: string | null
          current_ministry?: string | null
          desired_district?: string | null
          desired_ministry?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone_number?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          salary_scale?: string | null
          subscription_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_remaining?: number | null
          years_of_service?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          current_district?: string | null
          current_institution?: string | null
          current_ministry?: string | null
          desired_district?: string | null
          desired_ministry?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone_number?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          salary_scale?: string | null
          subscription_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_remaining?: number | null
          years_of_service?: number | null
        }
        Relationships: []
      }
      swap_identification_queue: {
        Row: {
          created_at: string
          id: string
          processed: boolean
          processed_at: string | null
          swap_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          swap_id: string
        }
        Update: {
          created_at?: string
          id?: string
          processed?: boolean
          processed_at?: string | null
          swap_id?: string
        }
        Relationships: []
      }
      swap_interests: {
        Row: {
          created_at: string | null
          id: string
          interested_user_id: string | null
          message: string | null
          status: string | null
          swap_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interested_user_id?: string | null
          message?: string | null
          status?: string | null
          swap_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interested_user_id?: string | null
          message?: string | null
          status?: string | null
          swap_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swap_interests_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          payment_type: string
          phone_number: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          payment_type: string
          phone_number: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          payment_type?: string
          phone_number?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      swaps: {
        Row: {
          additional_details: string | null
          created_at: string | null
          current_area_type: string
          current_district: string
          current_institution: string | null
          current_ministry: string
          desired_area_type: string
          desired_district: string
          desired_ministry: string | null
          expires_at: string | null
          housing_condition: string | null
          id: string
          images: string[] | null
          job_title: string
          reason_for_swap: string | null
          salary_scale: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_details?: string | null
          created_at?: string | null
          current_area_type: string
          current_district: string
          current_institution?: string | null
          current_ministry: string
          desired_area_type: string
          desired_district: string
          desired_ministry?: string | null
          expires_at?: string | null
          housing_condition?: string | null
          id?: string
          images?: string[] | null
          job_title: string
          reason_for_swap?: string | null
          salary_scale?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_details?: string | null
          created_at?: string | null
          current_area_type?: string
          current_district?: string
          current_institution?: string | null
          current_ministry?: string
          desired_area_type?: string
          desired_district?: string
          desired_ministry?: string | null
          expires_at?: string | null
          housing_condition?: string | null
          id?: string
          images?: string[] | null
          job_title?: string
          reason_for_swap?: string | null
          salary_scale?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swaps_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_notifications: boolean | null
          match_notifications: boolean | null
          message_notifications: boolean | null
          privacy_contact_visible: boolean | null
          privacy_profile_visible: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_notifications?: boolean | null
          match_notifications?: boolean | null
          message_notifications?: boolean | null
          privacy_contact_visible?: boolean | null
          privacy_profile_visible?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_notifications?: boolean | null
          match_notifications?: boolean | null
          message_notifications?: boolean | null
          privacy_contact_visible?: boolean | null
          privacy_profile_visible?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_conversation: {
        Args: { p_swap_id?: string; p_user1_id: string; p_user2_id: string }
        Returns: string
      }
      process_swap_matches: {
        Args: never
        Returns: {
          notifications_created: number
          processed_count: number
        }[]
      }
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
