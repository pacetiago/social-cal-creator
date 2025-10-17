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
      approvals: {
        Row: {
          approved_at: string | null
          approved_by: string
          comments: string | null
          created_at: string | null
          id: string
          org_id: string
          post_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by: string
          comments?: string | null
          created_at?: string | null
          id?: string
          org_id: string
          post_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          org_id?: string
          post_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          metadata: Json | null
          mime_type: string | null
          name: string
          org_id: string
          post_id: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          kind: Database["public"]["Enums"]["asset_kind"]
          metadata?: Json | null
          mime_type?: string | null
          name: string
          org_id: string
          post_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          org_id?: string
          post_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          diff: Json | null
          id: string
          metadata: Json | null
          org_id: string | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          diff?: Json | null
          id?: string
          metadata?: Json | null
          org_id?: string | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          diff?: Json | null
          id?: string
          metadata?: Json | null
          org_id?: string | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string | null
          id: string
          ip_address: unknown
          last_attempt: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address: unknown
          last_attempt?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown
          last_attempt?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          start_date: string | null
          updated_at: string | null
          updated_by: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          start_date?: string | null
          updated_at?: string | null
          updated_by?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          start_date?: string | null
          updated_at?: string | null
          updated_by?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          key: Database["public"]["Enums"]["channel_key"]
          name: string
          org_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key: Database["public"]["Enums"]["channel_key"]
          name: string
          org_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          key?: Database["public"]["Enums"]["channel_key"]
          name?: string
          org_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          client_id: string
          color: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id: string
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      filters: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          type: Database["public"]["Enums"]["filter_type"]
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          type: Database["public"]["Enums"]["filter_type"]
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          type?: Database["public"]["Enums"]["filter_type"]
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "filters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          slug: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          slug: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          attachments: Json | null
          campaign_id: string | null
          channel_id: string | null
          client_id: string | null
          company_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          insights: string | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          org_id: string
          persona: string | null
          publish_at: string | null
          responsibility:
            | Database["public"]["Enums"]["post_responsibility"]
            | null
          status: Database["public"]["Enums"]["post_status"] | null
          tags: string[] | null
          theme: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_source: string | null
          variations: Json | null
        }
        Insert: {
          attachments?: Json | null
          campaign_id?: string | null
          channel_id?: string | null
          client_id?: string | null
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insights?: string | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          org_id: string
          persona?: string | null
          publish_at?: string | null
          responsibility?:
            | Database["public"]["Enums"]["post_responsibility"]
            | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          theme?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
          variations?: Json | null
        }
        Update: {
          attachments?: Json | null
          campaign_id?: string | null
          channel_id?: string | null
          client_id?: string | null
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insights?: string | null
          media_type?: Database["public"]["Enums"]["media_type"] | null
          org_id?: string
          persona?: string | null
          publish_at?: string | null
          responsibility?:
            | Database["public"]["Enums"]["post_responsibility"]
            | null
          status?: Database["public"]["Enums"]["post_status"] | null
          tags?: string[] | null
          theme?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      share_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          org_id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_tokens_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client: {
        Args: { client_id: string }
        Returns: boolean
      }
      create_org_with_owner: {
        Args: { org_name: string; org_slug: string }
        Returns: string
      }
      delete_org_cascade: {
        Args: { target_org_id: string }
        Returns: undefined
      }
      generate_share_token: {
        Args: { target_org_id: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_secure: {
        Args: { user_id: string }
        Returns: string
      }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_token: {
        Args: { token_input: string }
        Returns: string
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_org_access: {
        Args: { target_org_id: string }
        Returns: boolean
      }
      user_org_role: {
        Args: { target_org_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      asset_kind: "image" | "video" | "doc"
      channel_key:
        | "instagram"
        | "linkedin"
        | "x"
        | "tiktok"
        | "youtube"
        | "blog"
        | "ebook"
        | "facebook"
        | "roteiro"
      channel_type: "Feed" | "Story" | "Feed e Story" | "Site"
      editorial_line: "SAZONAL" | "INSTITUCIONAL" | "BLOG" | "ROTEIRO"
      filter_type: "theme" | "persona" | "tag"
      media_type:
        | "Imagem"
        | "Vídeo"
        | "Carrossel"
        | "Texto blog"
        | "Post Estático"
        | "Post/Fotos"
        | "Reels"
        | "Story"
      platform_role:
        | "platform_admin"
        | "user"
        | "platform_owner"
        | "platform_viewer"
      post_responsibility: "client" | "agency"
      post_status:
        | "idea"
        | "draft"
        | "review"
        | "approved"
        | "scheduled"
        | "published"
        | "production"
      responsibility_type: "Agência" | "Cliente"
      social_network: "Facebook" | "Instagram" | "LinkedIn" | "Site"
      user_role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
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
      asset_kind: ["image", "video", "doc"],
      channel_key: [
        "instagram",
        "linkedin",
        "x",
        "tiktok",
        "youtube",
        "blog",
        "ebook",
        "facebook",
        "roteiro",
      ],
      channel_type: ["Feed", "Story", "Feed e Story", "Site"],
      editorial_line: ["SAZONAL", "INSTITUCIONAL", "BLOG", "ROTEIRO"],
      filter_type: ["theme", "persona", "tag"],
      media_type: [
        "Imagem",
        "Vídeo",
        "Carrossel",
        "Texto blog",
        "Post Estático",
        "Post/Fotos",
        "Reels",
        "Story",
      ],
      platform_role: [
        "platform_admin",
        "user",
        "platform_owner",
        "platform_viewer",
      ],
      post_responsibility: ["client", "agency"],
      post_status: [
        "idea",
        "draft",
        "review",
        "approved",
        "scheduled",
        "published",
        "production",
      ],
      responsibility_type: ["Agência", "Cliente"],
      social_network: ["Facebook", "Instagram", "LinkedIn", "Site"],
      user_role: ["OWNER", "ADMIN", "EDITOR", "VIEWER"],
    },
  },
} as const
