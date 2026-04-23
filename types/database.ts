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
      benefit_categories: {
        Row: {
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_government: boolean | null
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_government?: boolean | null
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_government?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      benefit_clicks: {
        Row: {
          benefit_id: string
          clicked_at: string | null
          id: string
          is_affiliate: boolean | null
          source_page: string | null
          student_id: string | null
        }
        Insert: {
          benefit_id: string
          clicked_at?: string | null
          id?: string
          is_affiliate?: boolean | null
          source_page?: string | null
          student_id?: string | null
        }
        Update: {
          benefit_id?: string
          clicked_at?: string | null
          id?: string
          is_affiliate?: boolean | null
          source_page?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_clicks_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "student_benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_clicks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_reminders: {
        Row: {
          id: string
          student_id: string
          benefit_id: string
          reminder_date: string
          is_sent: boolean | null
          sent_at: string | null
          is_dismissed: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          benefit_id: string
          reminder_date: string
          is_sent?: boolean | null
          sent_at?: string | null
          is_dismissed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          benefit_id?: string
          reminder_date?: string
          is_sent?: boolean | null
          sent_at?: string | null
          is_dismissed?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_reminders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_reminders_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "student_benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      bursaries: {
        Row: {
          academic_year: string | null
          administering_body: string
          amount_description: string | null
          amount_frequency: string | null
          amount_max: number | null
          amount_min: number | null
          application_deadline: string | null
          application_process: string | null
          award_type: string
          created_at: string | null
          description: string | null
          id: string
          income_threshold_max: number | null
          is_active: boolean | null
          is_charitable_trust: boolean | null
          is_competitive: boolean | null
          is_government_scheme: boolean | null
          is_means_tested: boolean | null
          is_repayable: boolean | null
          is_universal: boolean | null
          last_verified_date: string | null
          max_age: number | null
          min_age: number | null
          name: string
          needs_verification: boolean | null
          not_eligible_for_saas: boolean | null
          notes: string | null
          priority_score: number | null
          requires_care_experience: boolean | null
          requires_carer: boolean | null
          requires_disability: boolean | null
          requires_estranged: boolean | null
          requires_lone_parent: boolean | null
          requires_nomination: boolean | null
          requires_refugee_or_asylum: boolean | null
          requires_scottish_residency: boolean | null
          requires_young_carer: boolean | null
          requires_young_parent: boolean | null
          simd_quintile_max: number | null
          slug: string
          specific_courses: string[] | null
          student_stages: string[]
          updated_at: string | null
          url: string | null
        }
        Insert: {
          academic_year?: string | null
          administering_body: string
          amount_description?: string | null
          amount_frequency?: string | null
          amount_max?: number | null
          amount_min?: number | null
          application_deadline?: string | null
          application_process?: string | null
          award_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          income_threshold_max?: number | null
          is_active?: boolean | null
          is_charitable_trust?: boolean | null
          is_competitive?: boolean | null
          is_government_scheme?: boolean | null
          is_means_tested?: boolean | null
          is_repayable?: boolean | null
          is_universal?: boolean | null
          last_verified_date?: string | null
          max_age?: number | null
          min_age?: number | null
          name: string
          needs_verification?: boolean | null
          not_eligible_for_saas?: boolean | null
          notes?: string | null
          priority_score?: number | null
          requires_care_experience?: boolean | null
          requires_carer?: boolean | null
          requires_disability?: boolean | null
          requires_estranged?: boolean | null
          requires_lone_parent?: boolean | null
          requires_nomination?: boolean | null
          requires_refugee_or_asylum?: boolean | null
          requires_scottish_residency?: boolean | null
          requires_young_carer?: boolean | null
          requires_young_parent?: boolean | null
          simd_quintile_max?: number | null
          slug: string
          specific_courses?: string[] | null
          student_stages: string[]
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          academic_year?: string | null
          administering_body?: string
          amount_description?: string | null
          amount_frequency?: string | null
          amount_max?: number | null
          amount_min?: number | null
          application_deadline?: string | null
          application_process?: string | null
          award_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          income_threshold_max?: number | null
          is_active?: boolean | null
          is_charitable_trust?: boolean | null
          is_competitive?: boolean | null
          is_government_scheme?: boolean | null
          is_means_tested?: boolean | null
          is_repayable?: boolean | null
          is_universal?: boolean | null
          last_verified_date?: string | null
          max_age?: number | null
          min_age?: number | null
          name?: string
          needs_verification?: boolean | null
          not_eligible_for_saas?: boolean | null
          notes?: string | null
          priority_score?: number | null
          requires_care_experience?: boolean | null
          requires_carer?: boolean | null
          requires_disability?: boolean | null
          requires_estranged?: boolean | null
          requires_lone_parent?: boolean | null
          requires_nomination?: boolean | null
          requires_refugee_or_asylum?: boolean | null
          requires_scottish_residency?: boolean | null
          requires_young_carer?: boolean | null
          requires_young_parent?: boolean | null
          simd_quintile_max?: number | null
          slug?: string
          specific_courses?: string[] | null
          student_stages?: string[]
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      student_benefits: {
        Row: {
          access_method: string | null
          access_platform: string | null
          administering_body: string | null
          affiliate_commission: string | null
          affiliate_cookie_days: number | null
          affiliate_network: string | null
          affiliate_url: string | null
          application_deadline: string | null
          application_process: string | null
          award_details: Json | null
          category: string
          created_at: string | null
          description: string
          discount_type: string | null
          discount_value: string
          eligibility_college: boolean | null
          eligibility_details: string | null
          eligibility_s1_s4: boolean | null
          eligibility_s5_s6: boolean | null
          eligibility_university: boolean | null
          id: string
          income_thresholds: Json | null
          is_active: boolean | null
          is_care_experienced_only: boolean | null
          is_government_scheme: boolean | null
          is_means_tested: boolean | null
          is_repayable: boolean | null
          is_scotland_only: boolean | null
          last_verified: string | null
          max_age: number | null
          min_age: number | null
          name: string
          priority_score: number | null
          provider: string
          related_university_id: string | null
          seasonal_notes: string | null
          short_description: string | null
          support_group: string | null
          updated_at: string | null
          url: string
          verification_notes: string | null
        }
        Insert: {
          access_method?: string | null
          access_platform?: string | null
          administering_body?: string | null
          affiliate_commission?: string | null
          affiliate_cookie_days?: number | null
          affiliate_network?: string | null
          affiliate_url?: string | null
          application_deadline?: string | null
          application_process?: string | null
          award_details?: Json | null
          category: string
          created_at?: string | null
          description: string
          discount_type?: string | null
          discount_value: string
          eligibility_college?: boolean | null
          eligibility_details?: string | null
          eligibility_s1_s4?: boolean | null
          eligibility_s5_s6?: boolean | null
          eligibility_university?: boolean | null
          id?: string
          income_thresholds?: Json | null
          is_active?: boolean | null
          is_care_experienced_only?: boolean | null
          is_government_scheme?: boolean | null
          is_means_tested?: boolean | null
          is_repayable?: boolean | null
          is_scotland_only?: boolean | null
          last_verified?: string | null
          max_age?: number | null
          min_age?: number | null
          name: string
          priority_score?: number | null
          provider: string
          related_university_id?: string | null
          seasonal_notes?: string | null
          short_description?: string | null
          support_group?: string | null
          updated_at?: string | null
          url: string
          verification_notes?: string | null
        }
        Update: {
          access_method?: string | null
          access_platform?: string | null
          administering_body?: string | null
          affiliate_commission?: string | null
          affiliate_cookie_days?: number | null
          affiliate_network?: string | null
          affiliate_url?: string | null
          application_deadline?: string | null
          application_process?: string | null
          award_details?: Json | null
          category?: string
          created_at?: string | null
          description?: string
          discount_type?: string | null
          discount_value?: string
          eligibility_college?: boolean | null
          eligibility_details?: string | null
          eligibility_s1_s4?: boolean | null
          eligibility_s5_s6?: boolean | null
          eligibility_university?: boolean | null
          id?: string
          income_thresholds?: Json | null
          is_active?: boolean | null
          is_care_experienced_only?: boolean | null
          is_government_scheme?: boolean | null
          is_means_tested?: boolean | null
          is_repayable?: boolean | null
          is_scotland_only?: boolean | null
          last_verified?: string | null
          max_age?: number | null
          min_age?: number | null
          name?: string
          priority_score?: number | null
          provider?: string
          related_university_id?: string | null
          seasonal_notes?: string | null
          short_description?: string | null
          support_group?: string | null
          updated_at?: string | null
          url?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_benefits_related_university_id_fkey"
            columns: ["related_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      career_role_subjects: {
        Row: {
          career_role_id: string
          relevance: string | null
          subject_id: string
        }
        Insert: {
          career_role_id: string
          relevance?: string | null
          subject_id: string
        }
        Update: {
          career_role_id?: string
          relevance?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_role_subjects_career_role_id_fkey"
            columns: ["career_role_id"]
            isOneToOne: false
            referencedRelation: "career_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_role_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      career_roles: {
        Row: {
          ai_description: string
          ai_rating_2030_2035: number | null
          ai_rating_2040_2045: number | null
          career_sector_id: string
          created_at: string | null
          growth_outlook: string | null
          id: string
          is_new_ai_role: boolean | null
          maturity_tier: 'foundational' | 'intermediate' | 'specialised' | null
          robotics_description: string | null
          robotics_rating_2030_2035: number | null
          robotics_rating_2040_2045: number | null
          salary_entry: number | null
          salary_entry_uk: number | null
          salary_experienced: number | null
          salary_experienced_uk: number | null
          salary_last_updated: string | null
          salary_median_scotland: number | null
          salary_median_uk: number | null
          salary_needs_verification: boolean | null
          salary_notes: string | null
          salary_source: string | null
          soc_code_2020: string | null
          title: string
        }
        Insert: {
          ai_description: string
          ai_rating_2030_2035?: number | null
          ai_rating_2040_2045?: number | null
          career_sector_id: string
          created_at?: string | null
          growth_outlook?: string | null
          id?: string
          is_new_ai_role?: boolean | null
          maturity_tier?: 'foundational' | 'intermediate' | 'specialised' | null
          robotics_description?: string | null
          robotics_rating_2030_2035?: number | null
          robotics_rating_2040_2045?: number | null
          salary_entry?: number | null
          salary_entry_uk?: number | null
          salary_experienced?: number | null
          salary_experienced_uk?: number | null
          salary_last_updated?: string | null
          salary_median_scotland?: number | null
          salary_median_uk?: number | null
          salary_needs_verification?: boolean | null
          salary_notes?: string | null
          salary_source?: string | null
          soc_code_2020?: string | null
          title: string
        }
        Update: {
          ai_description?: string
          ai_rating_2030_2035?: number | null
          ai_rating_2040_2045?: number | null
          career_sector_id?: string
          created_at?: string | null
          growth_outlook?: string | null
          id?: string
          is_new_ai_role?: boolean | null
          maturity_tier?: 'foundational' | 'intermediate' | 'specialised' | null
          robotics_description?: string | null
          robotics_rating_2030_2035?: number | null
          robotics_rating_2040_2045?: number | null
          salary_entry?: number | null
          salary_entry_uk?: number | null
          salary_experienced?: number | null
          salary_experienced_uk?: number | null
          salary_last_updated?: string | null
          salary_median_scotland?: number | null
          salary_median_uk?: number | null
          salary_needs_verification?: boolean | null
          salary_notes?: string | null
          salary_source?: string | null
          soc_code_2020?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_roles_career_sector_id_fkey"
            columns: ["career_sector_id"]
            isOneToOne: false
            referencedRelation: "career_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      career_sectors: {
        Row: {
          ai_impact_description: string | null
          ai_impact_rating: string | null
          ai_impact_source: string | null
          ai_sector_narrative: string | null
          apprenticeships_text: string | null
          card_image_url: string | null
          course_subject_areas: string[] | null
          description: string | null
          display_order: number | null
          example_jobs: string[] | null
          external_links: Json | null
          growth_outlook: string | null
          hero_image_url: string | null
          id: string
          name: string
          salary_range_entry: string | null
          salary_range_experienced: string | null
          scottish_context: string | null
          sqa_subjects_text: string | null
        }
        Insert: {
          ai_impact_description?: string | null
          ai_impact_rating?: string | null
          ai_impact_source?: string | null
          ai_sector_narrative?: string | null
          apprenticeships_text?: string | null
          card_image_url?: string | null
          course_subject_areas?: string[] | null
          description?: string | null
          display_order?: number | null
          example_jobs?: string[] | null
          external_links?: Json | null
          growth_outlook?: string | null
          hero_image_url?: string | null
          id?: string
          name: string
          salary_range_entry?: string | null
          salary_range_experienced?: string | null
          scottish_context?: string | null
          sqa_subjects_text?: string | null
        }
        Update: {
          ai_impact_description?: string | null
          ai_impact_rating?: string | null
          ai_impact_source?: string | null
          ai_sector_narrative?: string | null
          apprenticeships_text?: string | null
          card_image_url?: string | null
          course_subject_areas?: string[] | null
          description?: string | null
          display_order?: number | null
          example_jobs?: string[] | null
          external_links?: Json | null
          growth_outlook?: string | null
          hero_image_url?: string | null
          id?: string
          name?: string
          salary_range_entry?: string | null
          salary_range_experienced?: string | null
          scottish_context?: string | null
          sqa_subjects_text?: string | null
        }
        Relationships: []
      }
      college_articulation: {
        Row: {
          id: string
          college_id: string
          university_id: string
          college_qualification: string
          college_scqf_level: number
          university_degree: string
          entry_year: number
          is_widening_participation: boolean | null
          wp_eligibility: string | null
          graded_unit_requirement: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          college_id: string
          university_id: string
          college_qualification: string
          college_scqf_level: number
          university_degree: string
          entry_year: number
          is_widening_participation?: boolean | null
          wp_eligibility?: string | null
          graded_unit_requirement?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          college_id?: string
          university_id?: string
          college_qualification?: string
          college_scqf_level?: number
          university_degree?: string
          entry_year?: number
          is_widening_participation?: boolean | null
          wp_eligibility?: string | null
          graded_unit_requirement?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_articulation_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "college_articulation_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          id: string
          name: string
          region: string
          city: string
          postcode: string | null
          website_url: string
          campuses: Json | null
          course_areas: string[] | null
          has_swap: boolean | null
          swap_hub: string | null
          has_foundation_apprenticeships: boolean | null
          fa_frameworks: string[] | null
          has_modern_apprenticeships: boolean | null
          ma_frameworks: string[] | null
          uhi_partner: boolean | null
          schools_programme: boolean | null
          schools_programme_details: string | null
          student_count: number | null
          distinctive_features: string | null
          description: string | null
          qualification_levels: string[] | null
          is_active: boolean | null
          created_at: string | null
          image_url: string | null
          card_image_url: string | null
          hero_image_url: string | null
        }
        Insert: {
          id?: string
          name: string
          region: string
          city: string
          postcode?: string | null
          website_url: string
          campuses?: Json | null
          course_areas?: string[] | null
          has_swap?: boolean | null
          swap_hub?: string | null
          has_foundation_apprenticeships?: boolean | null
          fa_frameworks?: string[] | null
          has_modern_apprenticeships?: boolean | null
          ma_frameworks?: string[] | null
          uhi_partner?: boolean | null
          schools_programme?: boolean | null
          schools_programme_details?: string | null
          student_count?: number | null
          distinctive_features?: string | null
          description?: string | null
          qualification_levels?: string[] | null
          is_active?: boolean | null
          created_at?: string | null
          image_url?: string | null
          card_image_url?: string | null
          hero_image_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          region?: string
          city?: string
          postcode?: string | null
          website_url?: string
          campuses?: Json | null
          course_areas?: string[] | null
          has_swap?: boolean | null
          swap_hub?: string | null
          has_foundation_apprenticeships?: boolean | null
          fa_frameworks?: string[] | null
          has_modern_apprenticeships?: boolean | null
          ma_frameworks?: string[] | null
          uhi_partner?: boolean | null
          schools_programme?: boolean | null
          schools_programme_details?: string | null
          student_count?: number | null
          distinctive_features?: string | null
          description?: string | null
          qualification_levels?: string[] | null
          is_active?: boolean | null
          created_at?: string | null
          image_url?: string | null
          card_image_url?: string | null
          hero_image_url?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          email_error: string | null
          email_sent: boolean
          id: string
          message: string
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          email_error?: string | null
          email_sent?: boolean
          id?: string
          message: string
          name: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          email_error?: string | null
          email_sent?: boolean
          id?: string
          message?: string
          name?: string
          role?: string
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
      offer_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      offer_clicks: {
        Row: {
          click_type: string
          created_at: string
          id: string
          offer_id: string
          referrer_page: string | null
          session_id: string | null
          student_id: string | null
        }
        Insert: {
          click_type: string
          created_at?: string
          id?: string
          offer_id: string
          referrer_page?: string | null
          session_id?: string | null
          student_id?: string | null
        }
        Update: {
          click_type?: string
          created_at?: string
          id?: string
          offer_id?: string
          referrer_page?: string | null
          session_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_clicks_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_clicks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_support_groups: {
        Row: {
          offer_id: string
          support_group: string
        }
        Insert: {
          offer_id: string
          support_group: string
        }
        Update: {
          offer_id?: string
          support_group?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_support_groups_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active_from: string | null
          active_until: string | null
          affiliate_network: string | null
          affiliate_url: string | null
          brand: string | null
          category_id: string
          commission_type: string | null
          commission_value: number | null
          cookie_days: number | null
          created_at: string
          description: string | null
          discount_text: string | null
          display_order: number
          eligible_stages: string[]
          featured_until: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          last_verified_at: string | null
          locations: string[]
          max_age: number | null
          min_age: number | null
          needs_review: boolean
          offer_type: string
          partner_id: string | null
          promo_code: string | null
          requires_student_beans: boolean
          requires_totum: boolean
          requires_unidays: boolean
          requires_young_scot: boolean
          scotland_only: boolean
          seasonal_tags: string[]
          slug: string
          summary: string | null
          title: string
          university_specific: string[]
          updated_at: string
          url: string | null
          verification_method: string | null
          verified_by: string | null
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          affiliate_network?: string | null
          affiliate_url?: string | null
          brand?: string | null
          category_id: string
          commission_type?: string | null
          commission_value?: number | null
          cookie_days?: number | null
          created_at?: string
          description?: string | null
          discount_text?: string | null
          display_order?: number
          eligible_stages?: string[]
          featured_until?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          locations?: string[]
          max_age?: number | null
          min_age?: number | null
          needs_review?: boolean
          offer_type?: string
          partner_id?: string | null
          promo_code?: string | null
          requires_student_beans?: boolean
          requires_totum?: boolean
          requires_unidays?: boolean
          requires_young_scot?: boolean
          scotland_only?: boolean
          seasonal_tags?: string[]
          slug: string
          summary?: string | null
          title: string
          university_specific?: string[]
          updated_at?: string
          url?: string | null
          verification_method?: string | null
          verified_by?: string | null
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          affiliate_network?: string | null
          affiliate_url?: string | null
          brand?: string | null
          category_id?: string
          commission_type?: string | null
          commission_value?: number | null
          cookie_days?: number | null
          created_at?: string
          description?: string | null
          discount_text?: string | null
          display_order?: number
          eligible_stages?: string[]
          featured_until?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          locations?: string[]
          max_age?: number | null
          min_age?: number | null
          needs_review?: boolean
          offer_type?: string
          partner_id?: string | null
          promo_code?: string | null
          requires_student_beans?: boolean
          requires_totum?: boolean
          requires_unidays?: boolean
          requires_young_scot?: boolean
          scotland_only?: boolean
          seasonal_tags?: string[]
          slug?: string
          summary?: string | null
          title?: string
          university_specific?: string[]
          updated_at?: string
          url?: string | null
          verification_method?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "offer_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
      pilot_interest: {
        Row: {
          id: string
          role: string
          name: string
          email: string
          organisation: string | null
          postcode: string | null
          message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          role: string
          name: string
          email: string
          organisation?: string | null
          postcode?: string | null
          message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          role?: string
          name?: string
          email?: string
          organisation?: string | null
          postcode?: string | null
          message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          account_id: string | null
          affiliate_network: string | null
          contact_email: string | null
          contact_name: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          partner_type: string
        }
        Insert: {
          account_id?: string | null
          affiliate_network?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          partner_type: string
        }
        Update: {
          account_id?: string | null
          affiliate_network?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          partner_type?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          question_text: string
          riasec_type: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          is_active?: boolean | null
          question_text: string
          riasec_type: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          question_text?: string
          riasec_type?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          artistic_score: number
          completed_at: string | null
          conventional_score: number
          enterprising_score: number
          id: string
          investigative_score: number
          realistic_score: number
          social_score: number
          student_id: string | null
          top_types: string[]
        }
        Insert: {
          artistic_score: number
          completed_at?: string | null
          conventional_score: number
          enterprising_score: number
          id?: string
          investigative_score: number
          realistic_score: number
          social_score: number
          student_id?: string | null
          top_types: string[]
        }
        Update: {
          artistic_score?: number
          completed_at?: string | null
          conventional_score?: number
          enterprising_score?: number
          id?: string
          investigative_score?: number
          realistic_score?: number
          social_score?: number
          student_id?: string | null
          top_types?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      riasec_career_mapping: {
        Row: {
          career_area: string
          description: string | null
          display_order: number | null
          example_careers: string[]
          id: string
          recommended_highers: string[] | null
          riasec_type: string
        }
        Insert: {
          career_area: string
          description?: string | null
          display_order?: number | null
          example_careers: string[]
          id?: string
          recommended_highers?: string[] | null
          riasec_type: string
        }
        Update: {
          career_area?: string
          description?: string | null
          display_order?: number | null
          example_careers?: string[]
          id?: string
          recommended_highers?: string[] | null
          riasec_type?: string
        }
        Relationships: []
      }
      role_profiles: {
        Row: {
          antisocial_hours: string | null
          bonus_payments: string | null
          career_progression: Json | null
          career_role_id: string
          competition_level: string | null
          contract_type: string | null
          created_at: string | null
          criminal_record_impact: string | null
          customer_facing: string | null
          day_in_the_life: string | null
          deals_with_public: string | null
          description: string | null
          disclosure_checks: string | null
          disclosure_notes: string | null
          dress_code: string | null
          driving_licence: string | null
          emotionally_demanding: string | null
          emotionally_demanding_notes: string | null
          entry_cost_notes: string | null
          geographic_availability: string | null
          geographic_notes: string | null
          health_fitness_requirements: string | null
          hours_pattern: string | null
          id: string
          job_security: string | null
          min_entry_qualification:
            | 'none'
            | 'national_4'
            | 'national_5'
            | 'highers'
            | 'hnc'
            | 'hnd'
            | 'degree'
            | 'degree_plus_professional'
            | null
          minimum_age: number | null
          on_call: string | null
          pension_quality: string | null
          physical_demands: string | null
          remote_hybrid_realistic: string | null
          salary_progression_speed: string | null
          self_employment_viability: string | null
          sick_pay: string | null
          stress_level: string | null
          team_vs_solo: string | null
          tips_or_commission: string | null
          travel_requirement: string | null
          typical_entry_age: number
          typical_entry_qualification:
            | 'none'
            | 'national_4'
            | 'national_5'
            | 'highers'
            | 'hnc'
            | 'hnd'
            | 'degree'
            | 'degree_plus_professional'
            | null
          typical_experienced_salary_gbp: number | null
          typical_hours_per_week: number
          typical_starting_salary_gbp: number | null
          union_presence: string | null
          unpaid_overtime: string | null
          updated_at: string | null
          visa_restrictions: string | null
          work_life_balance: string | null
          working_location: string | null
          works_with_vulnerable: string | null
        }
        Insert: {
          antisocial_hours?: string | null
          bonus_payments?: string | null
          career_progression?: Json | null
          career_role_id: string
          competition_level?: string | null
          contract_type?: string | null
          created_at?: string | null
          criminal_record_impact?: string | null
          customer_facing?: string | null
          day_in_the_life?: string | null
          deals_with_public?: string | null
          description?: string | null
          disclosure_checks?: string | null
          disclosure_notes?: string | null
          dress_code?: string | null
          driving_licence?: string | null
          emotionally_demanding?: string | null
          emotionally_demanding_notes?: string | null
          entry_cost_notes?: string | null
          geographic_availability?: string | null
          geographic_notes?: string | null
          health_fitness_requirements?: string | null
          hours_pattern?: string | null
          id?: string
          job_security?: string | null
          min_entry_qualification?:
            | 'none'
            | 'national_4'
            | 'national_5'
            | 'highers'
            | 'hnc'
            | 'hnd'
            | 'degree'
            | 'degree_plus_professional'
            | null
          minimum_age?: number | null
          on_call?: string | null
          pension_quality?: string | null
          physical_demands?: string | null
          remote_hybrid_realistic?: string | null
          salary_progression_speed?: string | null
          self_employment_viability?: string | null
          sick_pay?: string | null
          stress_level?: string | null
          team_vs_solo?: string | null
          tips_or_commission?: string | null
          travel_requirement?: string | null
          typical_entry_age: number
          typical_entry_qualification?:
            | 'none'
            | 'national_4'
            | 'national_5'
            | 'highers'
            | 'hnc'
            | 'hnd'
            | 'degree'
            | 'degree_plus_professional'
            | null
          typical_experienced_salary_gbp?: number | null
          typical_hours_per_week: number
          typical_starting_salary_gbp?: number | null
          union_presence?: string | null
          unpaid_overtime?: string | null
          updated_at?: string | null
          visa_restrictions?: string | null
          work_life_balance?: string | null
          working_location?: string | null
          works_with_vulnerable?: string | null
        }
        Update: {
          antisocial_hours?: string | null
          bonus_payments?: string | null
          career_progression?: Json | null
          career_role_id?: string
          competition_level?: string | null
          contract_type?: string | null
          created_at?: string | null
          criminal_record_impact?: string | null
          customer_facing?: string | null
          day_in_the_life?: string | null
          deals_with_public?: string | null
          description?: string | null
          disclosure_checks?: string | null
          disclosure_notes?: string | null
          dress_code?: string | null
          driving_licence?: string | null
          emotionally_demanding?: string | null
          emotionally_demanding_notes?: string | null
          entry_cost_notes?: string | null
          geographic_availability?: string | null
          geographic_notes?: string | null
          health_fitness_requirements?: string | null
          hours_pattern?: string | null
          id?: string
          job_security?: string | null
          min_entry_qualification?:
            | 'none'
            | 'national_4'
            | 'national_5'
            | 'highers'
            | 'hnc'
            | 'hnd'
            | 'degree'
            | 'degree_plus_professional'
            | null
          minimum_age?: number | null
          on_call?: string | null
          pension_quality?: string | null
          physical_demands?: string | null
          remote_hybrid_realistic?: string | null
          salary_progression_speed?: string | null
          self_employment_viability?: string | null
          sick_pay?: string | null
          stress_level?: string | null
          team_vs_solo?: string | null
          tips_or_commission?: string | null
          travel_requirement?: string | null
          typical_entry_age?: number
          typical_entry_qualification?:
            | 'none'
            | 'national_4'
            | 'national_5'
            | 'highers'
            | 'hnc'
            | 'hnd'
            | 'degree'
            | 'degree_plus_professional'
            | null
          typical_experienced_salary_gbp?: number | null
          typical_hours_per_week?: number
          typical_starting_salary_gbp?: number | null
          union_presence?: string | null
          unpaid_overtime?: string | null
          updated_at?: string | null
          visa_restrictions?: string | null
          work_life_balance?: string | null
          working_location?: string | null
          works_with_vulnerable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_profiles_career_role_id_fkey"
            columns: ["career_role_id"]
            isOneToOne: true
            referencedRelation: "career_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_comparisons: {
        Row: {
          created_at: string
          id: string
          name: string
          role_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role_ids: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role_ids?: string[]
          updated_at?: string
          user_id?: string
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
      saved_offers: {
        Row: {
          created_at: string
          offer_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          offer_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          offer_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_offers_student_id_fkey"
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
          imported_at: string | null
          postcode: string
          postcode_normalised: string | null
          simd_decile: number
          simd_quintile: number | null
          simd_rank: number | null
          source: string | null
        }
        Insert: {
          council_area?: string | null
          created_at?: string | null
          datazone?: string | null
          id?: string
          imported_at?: string | null
          postcode: string
          simd_decile: number
          simd_quintile?: number | null
          simd_rank?: number | null
          source?: string | null
        }
        Update: {
          council_area?: string | null
          created_at?: string | null
          datazone?: string | null
          id?: string
          imported_at?: string | null
          postcode?: string
          simd_decile?: number
          simd_quintile?: number | null
          simd_rank?: number | null
          source?: string | null
        }
        Relationships: []
      }
      starting_uni_checklist_items: {
        Row: {
          category: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          linked_offer_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          category: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          linked_offer_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          linked_offer_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "starting_uni_checklist_items_linked_offer_id_fkey"
            columns: ["linked_offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
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
      student_academy_choices: {
        Row: {
          created_at: string | null
          id: string
          rank_order: number
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rank_order: number
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rank_order?: number
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_academy_choices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_academy_choices_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_bursary_matches: {
        Row: {
          bursary_id: string | null
          id: string
          match_status: string | null
          matched_at: string | null
          student_id: string | null
        }
        Insert: {
          bursary_id?: string | null
          id?: string
          match_status?: string | null
          matched_at?: string | null
          student_id?: string | null
        }
        Update: {
          bursary_id?: string | null
          id?: string
          match_status?: string | null
          matched_at?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_bursary_matches_bursary_id_fkey"
            columns: ["bursary_id"]
            isOneToOne: false
            referencedRelation: "bursaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_bursary_matches_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_checklist_progress: {
        Row: {
          checklist_item_id: string
          completed_at: string
          student_id: string
        }
        Insert: {
          checklist_item_id: string
          completed_at?: string
          student_id: string
        }
        Update: {
          checklist_item_id?: string
          completed_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_checklist_progress_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "starting_uni_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_checklist_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_grades: {
        Row: {
          created_at: string | null
          grade: string
          id: string
          is_actual: boolean | null
          predicted: boolean | null
          predicted_grade: string | null
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
          is_actual?: boolean | null
          predicted?: boolean | null
          predicted_grade?: string | null
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
          is_actual?: boolean | null
          predicted?: boolean | null
          predicted_grade?: string | null
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
      student_subject_choices: {
        Row: {
          created_at: string | null
          id: string
          is_reserve: boolean | null
          rank_order: number | null
          student_id: string
          subject_id: string
          transition: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_reserve?: boolean | null
          rank_order?: number | null
          student_id: string
          subject_id: string
          transition: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_reserve?: boolean | null
          rank_order?: number | null
          student_id?: string
          subject_id?: string
          transition?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_subject_choices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_subject_choices_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_checklist_items: {
        Row: {
          id: string
          student_id: string
          item_key: string
          is_completed: boolean | null
          completed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          student_id: string
          item_key: string
          is_completed?: boolean | null
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          item_key?: string
          is_completed?: boolean | null
          completed_at?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prep_checklist_items_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_offers: {
        Row: {
          id: string
          student_id: string
          course_id: string
          university_id: string
          status: string
          offer_grades: string | null
          is_insurance: boolean | null
          is_firm: boolean | null
          notes: string | null
          status_updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          university_id: string
          status?: string
          offer_grades?: string | null
          is_insurance?: boolean | null
          is_firm?: boolean | null
          notes?: string | null
          status_updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          university_id?: string
          status?: string
          offer_grades?: string | null
          is_insurance?: boolean | null
          is_firm?: boolean | null
          notes?: string | null
          status_updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_offers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_offers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_offers_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          care_experienced: boolean | null
          created_at: string | null
          demographic_completed: boolean | null
          disability_details: string | null
          email: string
          email_preferences: Json | null
          email_reminders_enabled: boolean | null
          first_generation: boolean | null
          first_name: string | null
          has_disability: boolean
          household_income_band: string | null
          id: string
          is_carer: boolean | null
          is_estranged: boolean | null
          is_refugee_or_asylum_seeker: boolean | null
          is_single_parent_household: boolean | null
          is_young_carer: boolean
          is_young_parent: boolean | null
          last_name: string | null
          local_authority: string | null
          number_of_siblings: number | null
          parental_education: string | null
          postcode: string | null
          receives_ema: boolean | null
          receives_free_school_meals: boolean | null
          reminder_frequency: string | null
          school_name: string | null
          school_stage: Database["public"]["Enums"]["school_stage"] | null
          simd_decile: number | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          care_experienced?: boolean | null
          created_at?: string | null
          demographic_completed?: boolean | null
          disability_details?: string | null
          email: string
          email_preferences?: Json | null
          email_reminders_enabled?: boolean | null
          first_generation?: boolean | null
          first_name?: string | null
          has_disability?: boolean
          household_income_band?: string | null
          id: string
          is_carer?: boolean | null
          is_estranged?: boolean | null
          is_refugee_or_asylum_seeker?: boolean | null
          is_single_parent_household?: boolean | null
          is_young_carer?: boolean
          is_young_parent?: boolean | null
          last_name?: string | null
          local_authority?: string | null
          number_of_siblings?: number | null
          parental_education?: string | null
          postcode?: string | null
          receives_ema?: boolean | null
          receives_free_school_meals?: boolean | null
          reminder_frequency?: string | null
          school_name?: string | null
          school_stage?: Database["public"]["Enums"]["school_stage"] | null
          simd_decile?: number | null
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          care_experienced?: boolean | null
          created_at?: string | null
          demographic_completed?: boolean | null
          disability_details?: string | null
          email?: string
          email_preferences?: Json | null
          email_reminders_enabled?: boolean | null
          first_generation?: boolean | null
          first_name?: string | null
          has_disability?: boolean
          household_income_band?: string | null
          id?: string
          is_carer?: boolean | null
          is_estranged?: boolean | null
          is_refugee_or_asylum_seeker?: boolean | null
          is_single_parent_household?: boolean | null
          is_young_carer?: boolean
          is_young_parent?: boolean | null
          last_name?: string | null
          local_authority?: string | null
          number_of_siblings?: number | null
          parental_education?: string | null
          postcode?: string | null
          receives_ema?: boolean | null
          receives_free_school_meals?: boolean | null
          reminder_frequency?: string | null
          school_name?: string | null
          school_stage?: Database["public"]["Enums"]["school_stage"] | null
          simd_decile?: number | null
          updated_at?: string | null
          user_type?: string
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
          articulation_info: string | null
          care_experienced_guarantee: string | null
          city: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          russell_group: boolean | null
          scholarships_url: string | null
          shep_programmes: string[] | null
          slug: string
          type: Database["public"]["Enums"]["university_type"] | null
          undergraduate_url: string | null
          university_type: string | null
          updated_at: string | null
          wa_bursary_info: string | null
          wa_grade_reduction: string | null
          wa_pre_entry_details: string | null
          wa_pre_entry_required: boolean | null
          wa_programme_description: string | null
          wa_programme_name: string | null
          wa_programme_url: string | null
          website: string | null
          website_url: string | null
          widening_access_info: Json | null
          widening_access_url: string | null
          image_url: string | null
          card_image_url: string | null
          hero_image_url: string | null
        }
        Insert: {
          articulation_info?: string | null
          care_experienced_guarantee?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name: string
          russell_group?: boolean | null
          scholarships_url?: string | null
          shep_programmes?: string[] | null
          slug: string
          type?: Database["public"]["Enums"]["university_type"] | null
          undergraduate_url?: string | null
          university_type?: string | null
          updated_at?: string | null
          wa_bursary_info?: string | null
          wa_grade_reduction?: string | null
          wa_pre_entry_details?: string | null
          wa_pre_entry_required?: boolean | null
          wa_programme_description?: string | null
          wa_programme_name?: string | null
          wa_programme_url?: string | null
          website?: string | null
          website_url?: string | null
          widening_access_info?: Json | null
          widening_access_url?: string | null
          image_url?: string | null
          card_image_url?: string | null
          hero_image_url?: string | null
        }
        Update: {
          articulation_info?: string | null
          care_experienced_guarantee?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          russell_group?: boolean | null
          scholarships_url?: string | null
          shep_programmes?: string[] | null
          slug?: string
          type?: Database["public"]["Enums"]["university_type"] | null
          undergraduate_url?: string | null
          university_type?: string | null
          updated_at?: string | null
          wa_bursary_info?: string | null
          wa_grade_reduction?: string | null
          wa_pre_entry_details?: string | null
          wa_pre_entry_required?: boolean | null
          wa_programme_description?: string | null
          wa_programme_name?: string | null
          wa_programme_url?: string | null
          website?: string | null
          website_url?: string | null
          widening_access_info?: Json | null
          widening_access_url?: string | null
          image_url?: string | null
          card_image_url?: string | null
          hero_image_url?: string | null
        }
        Relationships: []
      }
      parents: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string | null
          postcode: string | null
          simd_decile: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          phone?: string | null
          postcode?: string | null
          simd_decile?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          postcode?: string | null
          simd_decile?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      parent_student_links: {
        Row: {
          id: string
          parent_id: string | null
          student_id: string
          status: 'pending' | 'active' | 'revoked'
          invite_code: string | null
          expires_at: string | null
          linked_at: string | null
          revoked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          student_id: string
          status?: 'pending' | 'active' | 'revoked'
          invite_code?: string | null
          expires_at?: string | null
          linked_at?: string | null
          revoked_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          student_id?: string
          status?: 'pending' | 'active' | 'revoked'
          invite_code?: string | null
          expires_at?: string | null
          linked_at?: string | null
          revoked_at?: string | null
          created_at?: string
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
      flag_stale_offers: { Args: never; Returns: number }
      generate_parent_invite_code: { Args: never; Returns: string }
      get_linked_children: {
        Args: never
        Returns: {
          email: string
          first_name: string
          last_name: string
          link_id: string
          linked_at: string
          postcode: string
          school_name: string
          school_stage: string
          simd_decile: number
          student_id: string
        }[]
      }
      get_linked_parents: {
        Args: never
        Returns: {
          email: string
          full_name: string
          link_id: string
          linked_at: string
          parent_id: string
          status: string
        }[]
      }
      get_promo_code_stats: { Args: { p_code_id: string }; Returns: Json }
      get_user_subscription: { Args: { p_user_id?: string }; Returns: Json }
      has_active_subscription: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_linked_parent: { Args: { p_student_id: string }; Returns: boolean }
      match_bursaries_for_student: {
        Args: { target_student_id: string }
        Returns: {
          administering_body: string
          amount_description: string
          amount_max: number
          application_deadline: string
          award_type: string
          bursary_id: string
          description: string
          match_confidence: string
          name: string
          url: string
        }[]
      }
      redeem_parent_invite_code: { Args: { p_code: string }; Returns: Json }
      redeem_promo_code: {
        Args: { p_amount: number; p_code: string; p_order_id?: string }
        Returns: Json
      }
      revoke_parent_link: { Args: { p_link_id: string }; Returns: undefined }
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
      school_stage: "s2" | "s3" | "s4" | "s5" | "s6" | "college" | "mature"
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

// Convenience aliases — some hooks import these names instead of the
// long-form Tables{Insert,Update} that the Supabase generator emits.
export type InsertTables<T extends keyof DefaultSchema["Tables"]> = TablesInsert<T>
export type UpdateTables<T extends keyof DefaultSchema["Tables"]> = TablesUpdate<T>

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
      school_stage: ["s2", "s3", "s4", "s5", "s6", "college", "mature"],
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
