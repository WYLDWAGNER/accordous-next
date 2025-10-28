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
      agent_configs: {
        Row: {
          context_window: number | null
          created_at: string | null
          customer_prompt: string | null
          handoff_triggers: Json | null
          id: string
          is_active: boolean | null
          language: string | null
          lead_prompt: string | null
          max_tokens: number | null
          name: string
          personality: string | null
          system_prompt: string
          temperature: number | null
          tone: string | null
          training_examples: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context_window?: number | null
          created_at?: string | null
          customer_prompt?: string | null
          handoff_triggers?: Json | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          lead_prompt?: string | null
          max_tokens?: number | null
          name: string
          personality?: string | null
          system_prompt: string
          temperature?: number | null
          tone?: string | null
          training_examples?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context_window?: number | null
          created_at?: string | null
          customer_prompt?: string | null
          handoff_triggers?: Json | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          lead_prompt?: string | null
          max_tokens?: number | null
          name?: string
          personality?: string | null
          system_prompt?: string
          temperature?: number | null
          tone?: string | null
          training_examples?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          company: string | null
          contact_type: string
          created_at: string | null
          document: string | null
          email: string | null
          id: string
          lead_score: number | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          contact_type: string
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          lead_score?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          contact_type?: string
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          lead_score?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          adjustment_index: string | null
          co_tenants: Json | null
          contract_number: string | null
          created_at: string | null
          end_date: string | null
          extra_charges: Json | null
          guarantee_type: string | null
          guarantee_value: number | null
          id: string
          payment_day: number | null
          payment_method: string | null
          pre_paid: boolean | null
          property_id: string
          rental_value: number
          start_date: string
          status: string
          tenant_document: string | null
          tenant_email: string | null
          tenant_emergency_phone: string | null
          tenant_name: string
          tenant_phone: string | null
          tenant_profession: string | null
          tenant_rg: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adjustment_index?: string | null
          co_tenants?: Json | null
          contract_number?: string | null
          created_at?: string | null
          end_date?: string | null
          extra_charges?: Json | null
          guarantee_type?: string | null
          guarantee_value?: number | null
          id?: string
          payment_day?: number | null
          payment_method?: string | null
          pre_paid?: boolean | null
          property_id: string
          rental_value: number
          start_date: string
          status?: string
          tenant_document?: string | null
          tenant_email?: string | null
          tenant_emergency_phone?: string | null
          tenant_name: string
          tenant_phone?: string | null
          tenant_profession?: string | null
          tenant_rg?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adjustment_index?: string | null
          co_tenants?: Json | null
          contract_number?: string | null
          created_at?: string | null
          end_date?: string | null
          extra_charges?: Json | null
          guarantee_type?: string | null
          guarantee_value?: number | null
          id?: string
          payment_day?: number | null
          payment_method?: string | null
          pre_paid?: boolean | null
          property_id?: string
          rental_value?: number
          start_date?: string
          status?: string
          tenant_document?: string | null
          tenant_email?: string | null
          tenant_emergency_phone?: string | null
          tenant_name?: string
          tenant_phone?: string | null
          tenant_profession?: string | null
          tenant_rg?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          action_items: Json | null
          conversation_id: string | null
          customer_preferences: Json | null
          id: string
          interaction_patterns: Json | null
          key_information: Json | null
          long_term_memory: Json | null
          next_steps: string | null
          short_term_memory: Json | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          conversation_id?: string | null
          customer_preferences?: Json | null
          id?: string
          interaction_patterns?: Json | null
          key_information?: Json | null
          long_term_memory?: Json | null
          next_steps?: string | null
          short_term_memory?: Json | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          conversation_id?: string | null
          customer_preferences?: Json | null
          id?: string
          interaction_patterns?: Json | null
          key_information?: Json | null
          long_term_memory?: Json | null
          next_steps?: string | null
          short_term_memory?: Json | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_type: string | null
          context_summary: string | null
          created_at: string | null
          customer_type: string | null
          human_agent_id: string | null
          human_takeover: boolean | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          lead_id: string | null
          session_id: string
          takeover_at: string | null
        }
        Insert: {
          agent_type?: string | null
          context_summary?: string | null
          created_at?: string | null
          customer_type?: string | null
          human_agent_id?: string | null
          human_takeover?: boolean | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          lead_id?: string | null
          session_id: string
          takeover_at?: string | null
        }
        Update: {
          agent_type?: string | null
          context_summary?: string | null
          created_at?: string | null
          customer_type?: string | null
          human_agent_id?: string | null
          human_takeover?: boolean | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          lead_id?: string | null
          session_id?: string
          takeover_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          bank_data: Json | null
          condo_fee: number | null
          contract_id: string
          created_at: string | null
          due_date: string
          electricity_amount: number | null
          extra_charges: Json | null
          gas_amount: number | null
          guarantee_installment: number | null
          guarantee_installment_number: number | null
          history: Json | null
          id: string
          internet_amount: number | null
          invoice_number: string | null
          issue_date: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          property_id: string
          reference_month: string
          rental_amount: number
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
          water_amount: number | null
        }
        Insert: {
          bank_data?: Json | null
          condo_fee?: number | null
          contract_id: string
          created_at?: string | null
          due_date: string
          electricity_amount?: number | null
          extra_charges?: Json | null
          gas_amount?: number | null
          guarantee_installment?: number | null
          guarantee_installment_number?: number | null
          history?: Json | null
          id?: string
          internet_amount?: number | null
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          property_id: string
          reference_month: string
          rental_amount?: number
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
          water_amount?: number | null
        }
        Update: {
          bank_data?: Json | null
          condo_fee?: number | null
          contract_id?: string
          created_at?: string | null
          due_date?: string
          electricity_amount?: number | null
          extra_charges?: Json | null
          gas_amount?: number | null
          guarantee_installment?: number | null
          guarantee_installment_number?: number | null
          history?: Json | null
          id?: string
          internet_amount?: number | null
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          property_id?: string
          reference_month?: string
          rental_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
          water_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget_range: string | null
          company: string | null
          created_at: string | null
          decision_maker: boolean | null
          email: string | null
          id: string
          lead_score: number | null
          lead_type: string | null
          name: string | null
          phone_number: string
          segment: string | null
          sentiment: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          company?: string | null
          created_at?: string | null
          decision_maker?: boolean | null
          email?: string | null
          id?: string
          lead_score?: number | null
          lead_type?: string | null
          name?: string | null
          phone_number: string
          segment?: string | null
          sentiment?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          company?: string | null
          created_at?: string | null
          decision_maker?: boolean | null
          email?: string | null
          id?: string
          lead_score?: number | null
          lead_type?: string | null
          name?: string | null
          phone_number?: string
          segment?: string | null
          sentiment?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          data: string | null
          fromMe: string | null
          id: string | null
          message_type: string | null
          pushName: string | null
          session_Id: string
          tipo: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          data?: string | null
          fromMe?: string | null
          id?: string | null
          message_type?: string | null
          pushName?: string | null
          session_Id: string
          tipo: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          data?: string | null
          fromMe?: string | null
          id?: string | null
          message_type?: string | null
          pushName?: string | null
          session_Id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          data_expiracao: string | null
          full_name: string | null
          google_calendar_embed_url: string | null
          id: string
          is_active: boolean | null
          last_access: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          data_expiracao?: string | null
          full_name?: string | null
          google_calendar_embed_url?: string | null
          id: string
          is_active?: boolean | null
          last_access?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          data_expiracao?: string | null
          full_name?: string | null
          google_calendar_embed_url?: string | null
          id?: string
          is_active?: boolean | null
          last_access?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          built_area: number | null
          city: string
          classification: string | null
          complement: string | null
          construction_year: number | null
          country: string | null
          created_at: string | null
          id: string
          land_area: number | null
          name: string
          nearby_facilities: Json | null
          neighborhood: string | null
          number: string | null
          owner_contact: string | null
          owner_email: string | null
          owner_name: string | null
          postal_code: string | null
          property_type: string
          registry_data: string | null
          state: string
          status: string
          total_area: number | null
          updated_at: string | null
          useful_area: number | null
          user_id: string
        }
        Insert: {
          address: string
          built_area?: number | null
          city: string
          classification?: string | null
          complement?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          land_area?: number | null
          name: string
          nearby_facilities?: Json | null
          neighborhood?: string | null
          number?: string | null
          owner_contact?: string | null
          owner_email?: string | null
          owner_name?: string | null
          postal_code?: string | null
          property_type: string
          registry_data?: string | null
          state: string
          status?: string
          total_area?: number | null
          updated_at?: string | null
          useful_area?: number | null
          user_id: string
        }
        Update: {
          address?: string
          built_area?: number | null
          city?: string
          classification?: string | null
          complement?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          land_area?: number | null
          name?: string
          nearby_facilities?: Json | null
          neighborhood?: string | null
          number?: string | null
          owner_contact?: string | null
          owner_email?: string | null
          owner_name?: string | null
          postal_code?: string | null
          property_type?: string
          registry_data?: string | null
          state?: string
          status?: string
          total_area?: number | null
          updated_at?: string | null
          useful_area?: number | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_visits: {
        Row: {
          contact_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          property_id: string | null
          status: string
          updated_at: string
          user_id: string
          visit_date: string
          visit_time: string
          visitor_email: string | null
          visitor_name: string
          visitor_phone: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          visit_date: string
          visit_time: string
          visitor_email?: string | null
          visitor_name: string
          visitor_phone: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          visit_date?: string
          visit_time?: string
          visitor_email?: string | null
          visitor_name?: string
          visitor_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_visits_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          phone_number: string
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          phone_number: string
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          phone_number?: string
          status?: string
        }
        Relationships: []
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
    }
    Enums: {
      app_role:
        | "admin"
        | "sdr"
        | "suporte"
        | "full"
        | "agenda"
        | "cadastro_leads"
        | "financeiro"
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
      app_role: [
        "admin",
        "sdr",
        "suporte",
        "full",
        "agenda",
        "cadastro_leads",
        "financeiro",
      ],
    },
  },
} as const
