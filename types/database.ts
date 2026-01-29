export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          school_stage: 's3' | 's4' | 's5' | 's6' | 'college' | 'mature' | null
          school_name: string | null
          postcode: string | null
          simd_decile: number | null
          care_experienced: boolean | null
          is_carer: boolean | null
          first_generation: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          school_stage?: 's3' | 's4' | 's5' | 's6' | 'college' | 'mature' | null
          school_name?: string | null
          postcode?: string | null
          simd_decile?: number | null
          care_experienced?: boolean | null
          is_carer?: boolean | null
          first_generation?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          school_stage?: 's3' | 's4' | 's5' | 's6' | 'college' | 'mature' | null
          school_name?: string | null
          postcode?: string | null
          simd_decile?: number | null
          care_experienced?: boolean | null
          is_carer?: boolean | null
          first_generation?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          slug: string
          type: 'ancient' | 'traditional' | 'modern' | 'specialist' | null
          city: string | null
          website: string | null
          logo_url: string | null
          description: string | null
          founded_year: number | null
          russell_group: boolean | null
          widening_access_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type?: 'ancient' | 'traditional' | 'modern' | 'specialist' | null
          city?: string | null
          website?: string | null
          logo_url?: string | null
          description?: string | null
          founded_year?: number | null
          russell_group?: boolean | null
          widening_access_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: 'ancient' | 'traditional' | 'modern' | 'specialist' | null
          city?: string | null
          website?: string | null
          logo_url?: string | null
          description?: string | null
          founded_year?: number | null
          russell_group?: boolean | null
          widening_access_info?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          university_id: string
          name: string
          slug: string
          ucas_code: string | null
          degree_type: 'bsc' | 'ba' | 'ma' | 'beng' | 'meng' | 'llb' | 'mbchb' | 'bds' | 'bvm' | 'bmus' | 'bed' | 'bnurs' | null
          subject_area: string | null
          description: string | null
          duration_years: number | null
          entry_requirements: Json | null
          widening_access_requirements: Json | null
          course_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university_id: string
          name: string
          slug: string
          ucas_code?: string | null
          degree_type?: 'bsc' | 'ba' | 'ma' | 'beng' | 'meng' | 'llb' | 'mbchb' | 'bds' | 'bvm' | 'bmus' | 'bed' | 'bnurs' | null
          subject_area?: string | null
          description?: string | null
          duration_years?: number | null
          entry_requirements?: Json | null
          widening_access_requirements?: Json | null
          course_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          name?: string
          slug?: string
          ucas_code?: string | null
          degree_type?: 'bsc' | 'ba' | 'ma' | 'beng' | 'meng' | 'llb' | 'mbchb' | 'bds' | 'bvm' | 'bmus' | 'bed' | 'bnurs' | null
          subject_area?: string | null
          description?: string | null
          duration_years?: number | null
          entry_requirements?: Json | null
          widening_access_requirements?: Json | null
          course_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      simd_postcodes: {
        Row: {
          id: string
          postcode: string
          simd_decile: number
          datazone: string | null
          council_area: string | null
          created_at: string
        }
        Insert: {
          id?: string
          postcode: string
          simd_decile: number
          datazone?: string | null
          council_area?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          postcode?: string
          simd_decile?: number
          datazone?: string | null
          council_area?: string | null
          created_at?: string
        }
      }
      saved_courses: {
        Row: {
          id: string
          student_id: string
          course_id: string
          priority: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          priority?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          priority?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      student_grades: {
        Row: {
          id: string
          student_id: string
          subject: string
          grade: string
          qualification_type: 'higher' | 'advanced_higher' | 'national_5' | 'a_level' | 'btec'
          year: number | null
          predicted: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject: string
          grade: string
          qualification_type: 'higher' | 'advanced_higher' | 'national_5' | 'a_level' | 'btec'
          year?: number | null
          predicted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject?: string
          grade?: string
          qualification_type?: 'higher' | 'advanced_higher' | 'national_5' | 'a_level' | 'btec'
          year?: number | null
          predicted?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      school_stage: 's3' | 's4' | 's5' | 's6' | 'college' | 'mature'
      university_type: 'ancient' | 'traditional' | 'modern' | 'specialist'
      degree_type: 'bsc' | 'ba' | 'ma' | 'beng' | 'meng' | 'llb' | 'mbchb' | 'bds' | 'bvm' | 'bmus' | 'bed' | 'bnurs'
      qualification_type: 'higher' | 'advanced_higher' | 'national_5' | 'a_level' | 'btec'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Entry requirements JSON structure
export interface EntryRequirements {
  highers?: string
  advanced_highers?: string
  national_5s?: string
  a_levels?: string
  ucas_points?: number
  required_subjects?: string[]
  notes?: string
}

// Widening access requirements JSON structure
export interface WideningAccessRequirements {
  simd20_offer?: string
  simd40_offer?: string
  care_experienced_offer?: string
  general_offer?: string
  notes?: string
}

// University widening access info JSON structure
export interface WideningAccessInfo {
  programs?: string[]
  contact_email?: string
  contact_phone?: string
  website_url?: string
  eligibility_criteria?: string[]
  benefits?: string[]
}
