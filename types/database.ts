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
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      career_sectors: {
        Row: {
          course_subject_areas: string[] | null
          description: string | null
          display_order: number | null
          example_jobs: string[] | null
          growth_outlook: string | null
          id: string
          name: string
          salary_range_entry: string | null
          salary_range_experienced: string | null
        }
        Insert: {
          course_subject_areas?: string[] | null
          description?: string | null
          display_order?: number | null
          example_jobs?: string[] | null
          growth_outlook?: string | null
          id?: string
          name: string
          salary_range_entry?: string | null
          salary_range_experienced?: string | null
        }
        Update: {
          course_subject_areas?: string[] | null
          description?: string | null
          display_order?: number | null
          example_jobs?: string[] | null
          growth_outlook?: string | null
          id?: string
          name?: string
          salary_range_entry?: string | null
          salary_range_experienced?: string | null
        }
        Relationships: []
      }
      course_choice_rules: {
        Row: {
          breadth_requirements: string | null
          compulsory_subjects: string[] | null
          created_at: string | null
          id: string
          is_generic: boolean | null
          non_examined_core: string[] | null
          num_free_choices: number
          num_reserves: number | null
          school_id: string | null
          special_rules: string[] | null
          total_subjects: number
          transition: string
        }
        Insert: {
          breadth_requirements?: string | null
          compulsory_subjects?: string[] | null
          created_at?: string | null
          id?: string
          is_generic?: boolean | null
          non_examined_core?: string[] | null
          num_free_choices: number
          num_reserves?: number | null
          school_id?: string | null
          special_rules?: string[] | null
          total_subjects: number
          transition: string
        }
        Update: {
          breadth_requirements?: string | null
          compulsory_subjects?: string[] | null
          created_at?: string | null
          id?: string
          is_generic?: boolean | null
          non_examined_core?: string[] | null
          num_free_choices?: number
          num_reserves?: number | null
          school_id?: string | null
          special_rules?: string[] | null
          total_subjects?: number
          transition?: string
        }
        Relationships: []
      }
      course_subject_requirements: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          is_mandatory: boolean | null
          min_grade: string | null
          notes: string | null
          qualification_level: string
          subject_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          min_grade?: string | null
          notes?: string | null
          qualification_level: string
          subject_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          min_grade?: string | null
          notes?: string | null
          qualification_level?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_subject_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_subject_requirements_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_url: string | null
          created_at: string | null
          degree_type: Database["public"]["Enums"]["degree_type"] | null
          description: string | null
          duration_years: number | null
          entry_requirements: Json | null
          id: string
          name: string
          slug: string
          subject_area: string | null
          ucas_code: string | null
          university_id: string
          updated_at: string | null
          widening_access_requirements: Json | null
        }
        Insert: {
          course_url?: string | null
          created_at?: string | null
          degree_type?: Database["public"]["Enums"]["degree_type"] | null
          description?: string | null
          duration_years?: number | null
          entry_requirements?: Json | null
          id?: string
          name: string
          slug: string
          subject_area?: string | null
          ucas_code?: string | null
          university_id: string
          updated_at?: string | null
          widening_access_requirements?: Json | null
        }
        Update: {
          course_url?: string | null
          created_at?: string | null
          degree_type?: Database["public"]["Enums"]["degree_type"] | null
          description?: string | null
          duration_years?: number | null
          entry_requirements?: Json | null
          id?: string
          name?: string
          slug?: string
          subject_area?: string | null
          ucas_code?: string | null
          university_id?: string
          updated_at?: string | null
          widening_access_requirements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      curricular_areas: {
        Row: {
          display_order: number
          id: string
          name: string
        }
        Insert: {
          display_order: number
          id?: string
          name: string
        }
        Update: {
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          discount_applied: number
          final_amount: number | null
          id: string
          order_id: string | null
          original_amount: number | null
          promo_code_id: string
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          discount_applied: number
          final_amount?: number | null
          id?: string
          order_id?: string | null
          original_amount?: number | null
          promo_code_id: string
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          discount_applied?: number
          final_amount?: number | null
          id?: string
          order_id?: string | null
          original_amount?: number | null
          promo_code_id?: string
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applies_to: Json | null
          code: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          max_uses_per_user: number | null
          metadata: Json | null
          min_purchase_amount: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to?: Json | null
          code: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          metadata?: Json | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to?: Json | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          metadata?: Json | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      saved_courses: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          notes: string | null
          priority: number | null
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      simd_postcodes: {
        Row: {
          council_area: string | null
          created_at: string | null
          datazone: string | null
          id: string
          postcode: string
          simd_decile: number
        }
        Insert: {
          council_area?: string | null
          created_at?: string | null
          datazone?: string | null
          id?: string
          postcode: string
          simd_decile: number
        }
        Update: {
          council_area?: string | null
          created_at?: string | null
          datazone?: string | null
          id?: string
          postcode?: string
          simd_decile?: number
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          stripe_customer_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          stripe_customer_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          stripe_customer_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          receipt_url: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          receipt_url?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          receipt_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          product_id: string | null
          recurring_interval: string | null
          recurring_interval_count: number | null
          stripe_price_id: string
          stripe_product_id: string | null
          trial_period_days: number | null
          unit_amount: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_price_id: string
          stripe_product_id?: string | null
          trial_period_days?: number | null
          unit_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_price_id?: string
          stripe_product_id?: string | null
          trial_period_days?: number | null
          unit_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stripe_products"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          stripe_product_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          stripe_product_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          stripe_product_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_price_id: string | null
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_price_id?: string | null
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_grades: {
        Row: {
          created_at: string | null
          grade: string
          id: string
          predicted: boolean | null
          qualification_type: Database["public"]["Enums"]["qualification_type"]
          student_id: string
          subject: string
          subject_id: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          grade: string
          id?: string
          predicted?: boolean | null
          qualification_type: Database["public"]["Enums"]["qualification_type"]
          student_id: string
          subject: string
          subject_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          grade?: string
          id?: string
          predicted?: boolean | null
          qualification_type?: Database["public"]["Enums"]["qualification_type"]
          student_id?: string
          subject?: string
          subject_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          care_experienced: boolean | null
          created_at: string | null
          email: string
          first_generation: boolean | null
          first_name: string | null
          id: string
          is_carer: boolean | null
          last_name: string | null
          postcode: string | null
          school_name: string | null
          school_stage: Database["public"]["Enums"]["school_stage"] | null
          simd_decile: number | null
          updated_at: string | null
        }
        Insert: {
          care_experienced?: boolean | null
          created_at?: string | null
          email: string
          first_generation?: boolean | null
          first_name?: string | null
          id: string
          is_carer?: boolean | null
          last_name?: string | null
          postcode?: string | null
          school_name?: string | null
          school_stage?: Database["public"]["Enums"]["school_stage"] | null
          simd_decile?: number | null
          updated_at?: string | null
        }
        Update: {
          care_experienced?: boolean | null
          created_at?: string | null
          email?: string
          first_generation?: boolean | null
          first_name?: string | null
          id?: string
          is_carer?: boolean | null
          last_name?: string | null
          postcode?: string | null
          school_name?: string | null
          school_stage?: Database["public"]["Enums"]["school_stage"] | null
          simd_decile?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subject_career_sectors: {
        Row: {
          career_sector_id: string
          relevance: string | null
          subject_id: string
        }
        Insert: {
          career_sector_id: string
          relevance?: string | null
          subject_id: string
        }
        Update: {
          career_sector_id?: string
          relevance?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_career_sectors_career_sector_id_fkey"
            columns: ["career_sector_id"]
            isOneToOne: false
            referencedRelation: "career_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_career_sectors_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_progressions: {
        Row: {
          from_level: string
          from_subject_id: string | null
          id: string
          min_grade: string | null
          notes: string | null
          recommended_grade: string | null
          to_level: string
          to_subject_id: string | null
        }
        Insert: {
          from_level: string
          from_subject_id?: string | null
          id?: string
          min_grade?: string | null
          notes?: string | null
          recommended_grade?: string | null
          to_level: string
          to_subject_id?: string | null
        }
        Update: {
          from_level?: string
          from_subject_id?: string | null
          id?: string
          min_grade?: string | null
          notes?: string | null
          recommended_grade?: string | null
          to_level?: string
          to_subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_progressions_from_subject_id_fkey"
            columns: ["from_subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_progressions_to_subject_id_fkey"
            columns: ["to_subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          assessment_type: string | null
          created_at: string | null
          curricular_area_id: string | null
          description: string | null
          id: string
          is_academy: boolean | null
          is_available_adv_higher: boolean | null
          is_available_higher: boolean | null
          is_available_n3: boolean | null
          is_available_n4: boolean | null
          is_available_n5: boolean | null
          is_npa: boolean | null
          name: string
          skills_tags: string[] | null
          sqa_course_code: string | null
          typical_availability: string | null
          why_choose: string | null
        }
        Insert: {
          assessment_type?: string | null
          created_at?: string | null
          curricular_area_id?: string | null
          description?: string | null
          id?: string
          is_academy?: boolean | null
          is_available_adv_higher?: boolean | null
          is_available_higher?: boolean | null
          is_available_n3?: boolean | null
          is_available_n4?: boolean | null
          is_available_n5?: boolean | null
          is_npa?: boolean | null
          name: string
          skills_tags?: string[] | null
          sqa_course_code?: string | null
          typical_availability?: string | null
          why_choose?: string | null
        }
        Update: {
          assessment_type?: string | null
          created_at?: string | null
          curricular_area_id?: string | null
          description?: string | null
          id?: string
          is_academy?: boolean | null
          is_available_adv_higher?: boolean | null
          is_available_higher?: boolean | null
          is_available_n3?: boolean | null
          is_available_n4?: boolean | null
          is_available_n5?: boolean | null
          is_npa?: boolean | null
          name?: string
          skills_tags?: string[] | null
          sqa_course_code?: string | null
          typical_availability?: string | null
          why_choose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_curricular_area_id_fkey"
            columns: ["curricular_area_id"]
            isOneToOne: false
            referencedRelation: "curricular_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          russell_group: boolean | null
          slug: string
          type: Database["public"]["Enums"]["university_type"] | null
          updated_at: string | null
          website: string | null
          widening_access_info: Json | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name: string
          russell_group?: boolean | null
          slug: string
          type?: Database["public"]["Enums"]["university_type"] | null
          updated_at?: string | null
          website?: string | null
          widening_access_info?: Json | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          russell_group?: boolean | null
          slug?: string
          type?: Database["public"]["Enums"]["university_type"] | null
          updated_at?: string | null
          website?: string | null
          widening_access_info?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_audit_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      delete_user_data: { Args: { target_user_id?: string }; Returns: Json }
      export_user_data: { Args: { target_user_id?: string }; Returns: Json }
      get_promo_code_stats: { Args: { p_code_id: string }; Returns: Json }
      get_user_subscription: { Args: { p_user_id?: string }; Returns: Json }
      has_active_subscription: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      redeem_promo_code: {
        Args: { p_amount: number; p_code: string; p_order_id?: string }
        Returns: Json
      }
      validate_promo_code: {
        Args: { p_amount?: number; p_code: string; p_user_id?: string }
        Returns: Json
      }
    }
    Enums: {
      degree_type:
        | "bsc"
        | "ba"
        | "ma"
        | "beng"
        | "meng"
        | "llb"
        | "mbchb"
        | "bds"
        | "bvm"
        | "bmus"
        | "bed"
        | "bnurs"
      discount_type: "percentage" | "fixed_amount" | "free_trial"
      qualification_type:
        | "higher"
        | "advanced_higher"
        | "national_5"
        | "a_level"
        | "btec"
      school_stage: "s3" | "s4" | "s5" | "s6" | "college" | "mature"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      university_type: "ancient" | "traditional" | "modern" | "specialist"
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
      degree_type: [
        "bsc",
        "ba",
        "ma",
        "beng",
        "meng",
        "llb",
        "mbchb",
        "bds",
        "bvm",
        "bmus",
        "bed",
        "bnurs",
      ],
      discount_type: ["percentage", "fixed_amount", "free_trial"],
      qualification_type: [
        "higher",
        "advanced_higher",
        "national_5",
        "a_level",
        "btec",
      ],
      school_stage: ["s3", "s4", "s5", "s6", "college", "mature"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
      university_type: ["ancient", "traditional", "modern", "specialist"],
    },
  },
} as const
