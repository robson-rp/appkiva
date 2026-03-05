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
      allowance_configs: {
        Row: {
          base_amount: number
          child_profile_id: string
          created_at: string
          frequency: string
          id: string
          last_sent_at: string | null
          mission_bonus: number
          parent_profile_id: string
          task_bonus: number
          updated_at: string
        }
        Insert: {
          base_amount?: number
          child_profile_id: string
          created_at?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          mission_bonus?: number
          parent_profile_id: string
          task_bonus?: number
          updated_at?: string
        }
        Update: {
          base_amount?: number
          child_profile_id?: string
          created_at?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          mission_bonus?: number
          parent_profile_id?: string
          task_bonus?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowance_configs_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allowance_configs_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          created_at: string
          id: string
          nickname: string | null
          parent_profile_id: string
          pin_hash: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nickname?: string | null
          parent_profile_id: string
          pin_hash?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string | null
          parent_profile_id?: string
          pin_hash?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          adult_profile_id: string
          child_profile_id: string
          consent_type: string
          granted_at: string
          id: string
          metadata: Json | null
          revoked_at: string | null
        }
        Insert: {
          adult_profile_id: string
          child_profile_id: string
          consent_type: string
          granted_at?: string
          id?: string
          metadata?: Json | null
          revoked_at?: string | null
        }
        Update: {
          adult_profile_id?: string
          child_profile_id?: string
          consent_type?: string
          granted_at?: string
          id?: string
          metadata?: Json | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_adult_profile_id_fkey"
            columns: ["adult_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_vault_comments: {
        Row: {
          created_at: string
          dream_vault_id: string
          emoji: string | null
          id: string
          parent_profile_id: string
          text: string
        }
        Insert: {
          created_at?: string
          dream_vault_id: string
          emoji?: string | null
          id?: string
          parent_profile_id: string
          text: string
        }
        Update: {
          created_at?: string
          dream_vault_id?: string
          emoji?: string | null
          id?: string
          parent_profile_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_vault_comments_dream_vault_id_fkey"
            columns: ["dream_vault_id"]
            isOneToOne: false
            referencedRelation: "dream_vaults"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_vault_comments_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_vaults: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          household_id: string | null
          icon: string
          id: string
          priority: string
          profile_id: string
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          household_id?: string | null
          icon?: string
          id?: string
          priority?: string
          profile_id: string
          target_amount?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          household_id?: string | null
          icon?: string
          id?: string
          priority?: string
          profile_id?: string
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_vaults_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_vaults_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          credit_wallet_id: string
          debit_wallet_id: string
          description: string
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          requires_approval: boolean
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          credit_wallet_id: string
          debit_wallet_id: string
          description: string
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          requires_approval?: boolean
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          credit_wallet_id?: string
          debit_wallet_id?: string
          description?: string
          entry_type?: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          requires_approval?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_credit_wallet_id_fkey"
            columns: ["credit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_balances"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_credit_wallet_id_fkey"
            columns: ["credit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_credit_wallet_id_fkey"
            columns: ["credit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_wallet_id_fkey"
            columns: ["debit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_balances"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_wallet_id_fkey"
            columns: ["debit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_wallet_id_fkey"
            columns: ["debit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string
          household_id: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name: string
          household_id?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          household_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          available: boolean
          category: Database["public"]["Enums"]["reward_category"]
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          parent_profile_id: string
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category?: Database["public"]["Enums"]["reward_category"]
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          parent_profile_id: string
          price?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: Database["public"]["Enums"]["reward_category"]
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          parent_profile_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_vaults: {
        Row: {
          created_at: string
          current_amount: number
          household_id: string | null
          icon: string
          id: string
          interest_rate: number
          name: string
          profile_id: string
          target_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          household_id?: string | null
          icon?: string
          id?: string
          interest_rate?: number
          name: string
          profile_id: string
          target_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          household_id?: string | null
          icon?: string
          id?: string
          interest_rate?: number
          name?: string
          profile_id?: string
          target_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_vaults_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_vaults_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          approved_at: string | null
          category: Database["public"]["Enums"]["task_category"]
          child_profile_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          parent_profile_id: string
          reward: number
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          child_profile_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          parent_profile_id: string
          reward?: number
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          category?: Database["public"]["Enums"]["task_category"]
          child_profile_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          parent_profile_id?: string
          reward?: number
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      wallets: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          profile_id: string
          updated_at: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          profile_id: string
          updated_at?: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          profile_id?: string
          updated_at?: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Relationships: [
          {
            foreignKeyName: "wallets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      wallet_balances: {
        Row: {
          balance: number | null
          currency: string | null
          profile_id: string | null
          wallet_id: string | null
          wallet_type: Database["public"]["Enums"]["wallet_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number | null
          approved_at: string | null
          created_at: string | null
          credit_wallet_id: string | null
          debit_wallet_id: string | null
          description: string | null
          direction: string | null
          entry_type: Database["public"]["Enums"]["ledger_entry_type"] | null
          id: string | null
          metadata: Json | null
          profile_id: string | null
          requires_approval: boolean | null
          wallet_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_credit_wallet_id_fkey"
            columns: ["credit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_balances"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_credit_wallet_id_fkey"
            columns: ["credit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_credit_wallet_id_fkey"
            columns: ["credit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_wallet_id_fkey"
            columns: ["debit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_balances"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_wallet_id_fkey"
            columns: ["debit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["wallet_id"]
          },
          {
            foreignKeyName: "ledger_entries_debit_wallet_id_fkey"
            columns: ["debit_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_profile_balance: { Args: { _profile_id: string }; Returns: number }
      get_user_household_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "parent" | "child" | "teen" | "teacher" | "admin"
      ledger_entry_type:
        | "allowance"
        | "task_reward"
        | "mission_reward"
        | "purchase"
        | "donation"
        | "vault_deposit"
        | "vault_withdraw"
        | "vault_interest"
        | "transfer"
        | "adjustment"
        | "refund"
      reward_category: "experience" | "privilege" | "physical" | "digital"
      task_category: "cleaning" | "studying" | "helping" | "other"
      task_status: "pending" | "in_progress" | "completed" | "approved"
      wallet_type: "virtual" | "real"
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
      app_role: ["parent", "child", "teen", "teacher", "admin"],
      ledger_entry_type: [
        "allowance",
        "task_reward",
        "mission_reward",
        "purchase",
        "donation",
        "vault_deposit",
        "vault_withdraw",
        "vault_interest",
        "transfer",
        "adjustment",
        "refund",
      ],
      reward_category: ["experience", "privilege", "physical", "digital"],
      task_category: ["cleaning", "studying", "helping", "other"],
      task_status: ["pending", "in_progress", "completed", "approved"],
      wallet_type: ["virtual", "real"],
    },
  },
} as const
