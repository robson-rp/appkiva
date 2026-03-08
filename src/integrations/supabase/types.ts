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
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          profile_id: string | null
          resource_id: string | null
          resource_type: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          profile_id?: string | null
          resource_id?: string | null
          resource_type: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          profile_id?: string | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_clicks: {
        Row: {
          banner_id: string
          clicked_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          banner_id: string
          clicked_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          banner_id?: string
          clicked_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_clicks_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "login_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_exception_requests: {
        Row: {
          amount: number
          child_profile_id: string
          created_at: string
          id: string
          parent_profile_id: string
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          reward_id: string
          status: Database["public"]["Enums"]["budget_exception_status"]
        }
        Insert: {
          amount: number
          child_profile_id: string
          created_at?: string
          id?: string
          parent_profile_id: string
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["budget_exception_status"]
        }
        Update: {
          amount?: number
          child_profile_id?: string
          created_at?: string
          id?: string
          parent_profile_id?: string
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["budget_exception_status"]
        }
        Relationships: [
          {
            foreignKeyName: "budget_exception_requests_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_exception_requests_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_exception_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_exception_requests_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          created_at: string
          daily_spend_limit: number
          date_of_birth: string | null
          id: string
          monthly_budget: number
          nickname: string | null
          parent_profile_id: string
          pin_hash: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_spend_limit?: number
          date_of_birth?: string | null
          id?: string
          monthly_budget?: number
          nickname?: string | null
          parent_profile_id: string
          pin_hash?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_spend_limit?: number
          date_of_birth?: string | null
          id?: string
          monthly_budget?: number
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
      classroom_students: {
        Row: {
          added_at: string
          classroom_id: string
          id: string
          student_profile_id: string
        }
        Insert: {
          added_at?: string
          classroom_id: string
          id?: string
          student_profile_id: string
        }
        Update: {
          added_at?: string
          classroom_id?: string
          id?: string
          student_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_students_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          description: string | null
          grade: string
          icon: string
          id: string
          name: string
          schedule: string | null
          school_tenant_id: string | null
          subject: string | null
          teacher_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade?: string
          icon?: string
          id?: string
          name: string
          schedule?: string | null
          school_tenant_id?: string | null
          subject?: string | null
          teacher_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: string
          icon?: string
          id?: string
          name?: string
          schedule?: string | null
          school_tenant_id?: string | null
          subject?: string | null
          teacher_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_school_tenant_id_fkey"
            columns: ["school_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_teacher_profile_id_fkey"
            columns: ["teacher_profile_id"]
            isOneToOne: false
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
          ip_metadata: Json | null
          metadata: Json | null
          revocation_reason: string | null
          revoked_at: string | null
        }
        Insert: {
          adult_profile_id: string
          child_profile_id: string
          consent_type: string
          granted_at?: string
          id?: string
          ip_metadata?: Json | null
          metadata?: Json | null
          revocation_reason?: string | null
          revoked_at?: string | null
        }
        Update: {
          adult_profile_id?: string
          child_profile_id?: string
          consent_type?: string
          granted_at?: string
          id?: string
          ip_metadata?: Json | null
          metadata?: Json | null
          revocation_reason?: string | null
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
      currency_exchange_rates: {
        Row: {
          base_currency: string
          id: string
          rate: number
          target_currency: string
          updated_at: string
        }
        Insert: {
          base_currency?: string
          id?: string
          rate: number
          target_currency: string
          updated_at?: string
        }
        Update: {
          base_currency?: string
          id?: string
          rate?: number
          target_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          created_at: string
          id: string
          mood: string
          profile_id: string
          tags: string[] | null
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood?: string
          profile_id: string
          tags?: string[] | null
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          profile_id?: string
          tags?: string[] | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_causes: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string | null
          total_received: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id?: string | null
          total_received?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string | null
          total_received?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_causes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_causes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          cause_id: string
          created_at: string | null
          id: string
          profile_id: string
        }
        Insert: {
          amount?: number
          cause_id: string
          created_at?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          amount?: number
          cause_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "donation_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_profile_id_fkey"
            columns: ["profile_id"]
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
      family_invite_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          household_id: string
          id: string
          parent_profile_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          household_id: string
          id?: string
          parent_profile_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          household_id?: string
          id?: string
          parent_profile_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invite_codes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invite_codes_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invite_codes_used_by_fkey"
            columns: ["used_by"]
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
          monthly_emission_limit_override: number | null
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_emission_limit_override?: number | null
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_emission_limit_override?: number | null
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          kiva_points_earned: number
          lesson_id: string
          profile_id: string
          score: number
        }
        Insert: {
          completed_at?: string
          id?: string
          kiva_points_earned?: number
          lesson_id: string
          profile_id: string
          score?: number
        }
        Update: {
          completed_at?: string
          id?: string
          kiva_points_earned?: number
          lesson_id?: string
          profile_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          blocks: Json
          category: string
          created_at: string
          description: string
          difficulty: string
          estimated_minutes: number
          icon: string
          id: string
          is_active: boolean
          kiva_points_reward: number
          quiz: Json
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          estimated_minutes?: number
          icon?: string
          id?: string
          is_active?: boolean
          kiva_points_reward?: number
          quiz?: Json
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          estimated_minutes?: number
          icon?: string
          id?: string
          is_active?: boolean
          kiva_points_reward?: number
          quiz?: Json
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_banners: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          title?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          created_at: string
          date: string
          id: string
          notification_id: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notification_id?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notification_id?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          cooldown_minutes: number
          created_at: string
          event: Database["public"]["Enums"]["notification_event"]
          icon: string
          id: string
          is_active: boolean
          is_urgent: boolean
          message_template: string
          recipient_role: string
          title_template: string
          type: string
          updated_at: string
        }
        Insert: {
          cooldown_minutes?: number
          created_at?: string
          event: Database["public"]["Enums"]["notification_event"]
          icon?: string
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          message_template: string
          recipient_role?: string
          title_template: string
          type?: string
          updated_at?: string
        }
        Update: {
          cooldown_minutes?: number
          created_at?: string
          event?: Database["public"]["Enums"]["notification_event"]
          icon?: string
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          message_template?: string
          recipient_role?: string
          title_template?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          profile_id: string
          read: boolean
          title: string
          type: string
          urgent: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          profile_id: string
          read?: boolean
          title: string
          type?: string
          urgent?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          profile_id?: string
          read?: boolean
          title?: string
          type?: string
          urgent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          profile_id: string
          role: string
          step_index: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          profile_id: string
          role: string
          step_index?: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          profile_id?: string
          role?: string
          step_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          profile_id: string
          skipped: boolean
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          profile_id: string
          skipped?: boolean
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          profile_id?: string
          skipped?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          created_at: string
          cta: string | null
          description: string
          id: string
          illustration_key: string
          is_active: boolean
          role: string
          step_index: number
          title: string
          updated_at: string
          visible_from: string | null
          visible_until: string | null
        }
        Insert: {
          created_at?: string
          cta?: string | null
          description?: string
          id?: string
          illustration_key?: string
          is_active?: boolean
          role: string
          step_index?: number
          title: string
          updated_at?: string
          visible_from?: string | null
          visible_until?: string | null
        }
        Update: {
          created_at?: string
          cta?: string | null
          description?: string
          id?: string
          illustration_key?: string
          is_active?: boolean
          role?: string
          step_index?: number
          title?: string
          updated_at?: string
          visible_from?: string | null
          visible_until?: string | null
        }
        Relationships: []
      }
      partner_programs: {
        Row: {
          budget_spent: number
          children_count: number
          created_at: string
          id: string
          investment_amount: number
          partner_tenant_id: string
          program_name: string
          program_type: string
          started_at: string
          status: string
          target_household_id: string | null
          target_tenant_id: string | null
          updated_at: string
        }
        Insert: {
          budget_spent?: number
          children_count?: number
          created_at?: string
          id?: string
          investment_amount?: number
          partner_tenant_id: string
          program_name: string
          program_type?: string
          started_at?: string
          status?: string
          target_household_id?: string | null
          target_tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          budget_spent?: number
          children_count?: number
          created_at?: string
          id?: string
          investment_amount?: number
          partner_tenant_id?: string
          program_name?: string
          program_type?: string
          started_at?: string
          status?: string
          target_household_id?: string | null
          target_tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_programs_partner_tenant_id_fkey"
            columns: ["partner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_programs_target_household_id_fkey"
            columns: ["target_household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_programs_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string
          gender: string | null
          household_id: string | null
          id: string
          institution_name: string | null
          language: string
          phone: string | null
          school_tenant_id: string | null
          sector: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name: string
          gender?: string | null
          household_id?: string | null
          id?: string
          institution_name?: string | null
          language?: string
          phone?: string | null
          school_tenant_id?: string | null
          sector?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          gender?: string | null
          household_id?: string | null
          id?: string
          institution_name?: string | null
          language?: string
          phone?: string | null
          school_tenant_id?: string | null
          sector?: string | null
          tenant_id?: string | null
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
          {
            foreignKeyName: "profiles_school_tenant_id_fkey"
            columns: ["school_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      program_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          code: string
          created_at: string
          expires_at: string
          id: string
          partner_tenant_id: string
          program_id: string
          status: string
          target_type: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          partner_tenant_id: string
          program_id: string
          status?: string
          target_type?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          partner_tenant_id?: string
          program_id?: string
          status?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_invitations_partner_tenant_id_fkey"
            columns: ["partner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_invitations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "partner_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          profile_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          profile_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      risk_flags: {
        Row: {
          created_at: string
          description: string
          flag_type: Database["public"]["Enums"]["risk_flag_type"]
          id: string
          metadata: Json | null
          profile_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["risk_severity"]
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          flag_type: Database["public"]["Enums"]["risk_flag_type"]
          id?: string
          metadata?: Json | null
          profile_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          flag_type?: Database["public"]["Enums"]["risk_flag_type"]
          id?: string
          metadata?: Json | null
          profile_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      sponsored_challenges: {
        Row: {
          completion_rate: number
          created_at: string
          description: string | null
          end_date: string
          id: string
          participants_count: number
          partner_tenant_id: string
          program_id: string | null
          reward_amount: number
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          participants_count?: number
          partner_tenant_id: string
          program_id?: string | null
          reward_amount?: number
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completion_rate?: number
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          participants_count?: number
          partner_tenant_id?: string
          program_id?: string | null
          reward_amount?: number
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_challenges_partner_tenant_id_fkey"
            columns: ["partner_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_challenges_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "partner_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_activities: {
        Row: {
          active_date: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          active_date: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          active_date?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_reward_claims: {
        Row: {
          claimed_at: string
          id: string
          kiva_points: number
          milestone_days: number
          profile_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          kiva_points?: number
          milestone_days: number
          profile_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          kiva_points?: number
          milestone_days?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_reward_claims_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          profile_id: string
          total_active_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          profile_id: string
          total_active_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          profile_id?: string
          total_active_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          currency: string
          extra_child_price: number
          features: Json
          id: string
          is_active: boolean
          max_children: number
          max_classrooms: number
          max_programs: number
          monthly_emission_limit: number
          name: string
          price_monthly: number
          price_yearly: number
          tier_type: Database["public"]["Enums"]["subscription_tier_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          extra_child_price?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_children?: number
          max_classrooms?: number
          max_programs?: number
          monthly_emission_limit?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          tier_type?: Database["public"]["Enums"]["subscription_tier_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          extra_child_price?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_children?: number
          max_classrooms?: number
          max_programs?: number
          monthly_emission_limit?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          tier_type?: Database["public"]["Enums"]["subscription_tier_type"]
          updated_at?: string
        }
        Relationships: []
      }
      supported_currencies: {
        Row: {
          code: string
          created_at: string
          decimal_places: number
          is_active: boolean
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string
          decimal_places?: number
          is_active?: boolean
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string
          decimal_places?: number
          is_active?: boolean
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
          is_recurring: boolean | null
          parent_profile_id: string
          recurrence: string | null
          recurrence_source_id: string | null
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
          is_recurring?: boolean | null
          parent_profile_id: string
          recurrence?: string | null
          recurrence_source_id?: string | null
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
          is_recurring?: boolean | null
          parent_profile_id?: string
          recurrence?: string | null
          recurrence_source_id?: string | null
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
          {
            foreignKeyName: "tasks_recurrence_source_id_fkey"
            columns: ["recurrence_source_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          real_money_enabled: boolean
          settings: Json
          subscription_tier_id: string | null
          tenant_type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          real_money_enabled?: boolean
          settings?: Json
          subscription_tier_id?: string | null
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          real_money_enabled?: boolean
          settings?: Json
          subscription_tier_id?: string | null
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_subscription_tier_id_fkey"
            columns: ["subscription_tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_regional_prices: {
        Row: {
          created_at: string
          currency_code: string
          extra_child_price: number
          id: string
          price_monthly: number
          price_yearly: number
          tier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          extra_child_price?: number
          id?: string
          price_monthly?: number
          price_yearly?: number
          tier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          extra_child_price?: number
          id?: string
          price_monthly?: number
          price_yearly?: number
          tier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_regional_prices_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
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
          is_system: boolean
          profile_id: string
          updated_at: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          profile_id: string
          updated_at?: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
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
      accept_program_invitation: {
        Args: { _code: string; _profile_id: string }
        Returns: Json
      }
      check_anomalies: { Args: never; Returns: number }
      check_notification_throttle: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      claim_invite_code: {
        Args: { _code: string; _profile_id: string }
        Returns: undefined
      }
      delete_child_safe: { Args: { _child_id: string }; Returns: undefined }
      get_money_supply_stats: { Args: never; Returns: Json }
      get_parent_emission_stats: {
        Args: { _parent_profile_id: string }
        Returns: Json
      }
      get_profile_balance: { Args: { _profile_id: string }; Returns: number }
      get_system_wallet_id: { Args: never; Returns: string }
      get_user_household_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_daily_activity: { Args: { _profile_id: string }; Returns: Json }
      update_child_profile: {
        Args: {
          _avatar?: string
          _child_id: string
          _date_of_birth?: string
          _nickname?: string
        }
        Returns: undefined
      }
      update_tenant_currency: {
        Args: { _currency: string; _tenant_id: string }
        Returns: undefined
      }
      validate_invite_code: { Args: { _code: string }; Returns: Json }
      validate_program_invite: { Args: { _code: string }; Returns: Json }
    }
    Enums: {
      app_role: "parent" | "child" | "teen" | "teacher" | "admin" | "partner"
      audit_action:
        | "insert"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "consent_granted"
        | "consent_revoked"
        | "role_changed"
        | "wallet_transfer"
        | "admin_action"
      budget_exception_status: "pending" | "approved" | "rejected"
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
      notification_event:
        | "task_created"
        | "task_completed"
        | "task_approved"
        | "lesson_completed"
        | "donation_made"
        | "reward_claimed"
        | "allowance_sent"
        | "vault_deposit"
        | "vault_withdraw"
        | "vault_milestone"
        | "streak_milestone"
        | "badge_unlocked"
        | "level_up"
        | "budget_warning"
        | "system_broadcast"
      reward_category: "experience" | "privilege" | "physical" | "digital"
      risk_flag_type:
        | "excessive_rewards"
        | "unusual_transactions"
        | "rate_limit_hit"
        | "task_exploitation"
      risk_severity: "low" | "medium" | "high" | "critical"
      subscription_tier_type:
        | "free"
        | "family_premium"
        | "school_institutional"
        | "partner_program"
      task_category: "cleaning" | "studying" | "helping" | "other"
      task_status: "pending" | "in_progress" | "completed" | "approved"
      tenant_type: "family" | "school" | "institutional_partner"
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
      app_role: ["parent", "child", "teen", "teacher", "admin", "partner"],
      audit_action: [
        "insert",
        "update",
        "delete",
        "login",
        "logout",
        "consent_granted",
        "consent_revoked",
        "role_changed",
        "wallet_transfer",
        "admin_action",
      ],
      budget_exception_status: ["pending", "approved", "rejected"],
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
      notification_event: [
        "task_created",
        "task_completed",
        "task_approved",
        "lesson_completed",
        "donation_made",
        "reward_claimed",
        "allowance_sent",
        "vault_deposit",
        "vault_withdraw",
        "vault_milestone",
        "streak_milestone",
        "badge_unlocked",
        "level_up",
        "budget_warning",
        "system_broadcast",
      ],
      reward_category: ["experience", "privilege", "physical", "digital"],
      risk_flag_type: [
        "excessive_rewards",
        "unusual_transactions",
        "rate_limit_hit",
        "task_exploitation",
      ],
      risk_severity: ["low", "medium", "high", "critical"],
      subscription_tier_type: [
        "free",
        "family_premium",
        "school_institutional",
        "partner_program",
      ],
      task_category: ["cleaning", "studying", "helping", "other"],
      task_status: ["pending", "in_progress", "completed", "approved"],
      tenant_type: ["family", "school", "institutional_partner"],
      wallet_type: ["virtual", "real"],
    },
  },
} as const
