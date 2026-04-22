-- Baseline production schema reset -- Session 11b
-- Captures full production schema as of 2026-04-22.
-- All previous migrations (initial_schema through create_pilot_interest, version 20260422061629)
-- are superseded by this single baseline. Their files are archived under
-- supabase/migrations/_archived_pre_11b_reset/.
--
-- Rationale: production tracking had drifted from local files (duplicate timestamps,
-- MCP-applied versions with synthetic timestamps, ~13 local files never tracked
-- remotely). A baseline produced from live production state is the single source of
-- truth going forward.
--
-- See docs/migration-reset-11b.md for context.
--
-- This file is structured as:
--   1. Extensions
--   2. Enum types
--   3. Tables (no FKs)
--   4. Primary keys, UNIQUE constraints, CHECK constraints
--   5. Foreign keys (added separately to avoid creation-order coupling)
--   6. Indexes
--   7. Functions
--   8. Triggers
--   9. RLS enable + policies
--   10. Comments

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- =============================================================================
-- 2. ENUM TYPES
-- =============================================================================

CREATE TYPE public.degree_type AS ENUM ('bsc','ba','ma','beng','meng','llb','mbchb','bds','bvm','bmus','bed','bnurs');
CREATE TYPE public.discount_type AS ENUM ('percentage','fixed_amount','free_trial');
CREATE TYPE public.entry_qualification AS ENUM ('none','national_4','national_5','highers','hnc','hnd','degree','degree_plus_professional');
CREATE TYPE public.qualification_type AS ENUM ('higher','advanced_higher','national_5','a_level','btec');
CREATE TYPE public.role_maturity_tier AS ENUM ('foundational','intermediate','specialised');
CREATE TYPE public.school_stage AS ENUM ('s2','s3','s4','s5','s6','college','mature');
CREATE TYPE public.subscription_status AS ENUM ('trialing','active','canceled','incomplete','incomplete_expired','past_due','unpaid','paused');
CREATE TYPE public.university_type AS ENUM ('ancient','traditional','modern','specialist');

-- =============================================================================
-- 3. TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.benefit_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  display_order integer,
  is_government boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.benefit_clicks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  benefit_id uuid NOT NULL,
  student_id uuid,
  is_affiliate boolean DEFAULT false,
  clicked_at timestamp with time zone DEFAULT now(),
  source_page text
);

CREATE TABLE IF NOT EXISTS public.benefit_reminders (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  benefit_id uuid NOT NULL,
  reminder_date date NOT NULL,
  is_sent boolean DEFAULT false,
  sent_at timestamp with time zone,
  is_dismissed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bursaries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  administering_body text NOT NULL,
  description text,
  student_stages text[] NOT NULL,
  award_type text NOT NULL,
  amount_description text,
  amount_min numeric,
  amount_max numeric,
  is_means_tested boolean DEFAULT false,
  is_repayable boolean DEFAULT false,
  income_threshold_max numeric,
  requires_care_experience boolean,
  requires_estranged boolean,
  requires_carer boolean,
  requires_disability boolean,
  requires_refugee_or_asylum boolean,
  simd_quintile_max integer,
  min_age integer,
  max_age integer,
  specific_courses text[],
  requires_scottish_residency boolean DEFAULT true,
  application_process text,
  application_deadline text,
  url text,
  notes text,
  is_active boolean DEFAULT true,
  last_verified_date date,
  academic_year text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  requires_young_parent boolean,
  slug text NOT NULL,
  priority_score integer DEFAULT 50,
  amount_frequency text,
  is_government_scheme boolean DEFAULT false,
  is_charitable_trust boolean DEFAULT false,
  is_universal boolean DEFAULT false,
  is_competitive boolean DEFAULT false,
  needs_verification boolean DEFAULT false,
  requires_nomination boolean DEFAULT false,
  requires_lone_parent boolean DEFAULT false,
  requires_young_carer boolean DEFAULT false,
  not_eligible_for_saas boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.career_role_subjects (
  career_role_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  relevance text DEFAULT 'recommended'::text
);

CREATE TABLE IF NOT EXISTS public.career_roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  career_sector_id uuid NOT NULL,
  title text NOT NULL,
  ai_description text NOT NULL,
  is_new_ai_role boolean DEFAULT false,
  growth_outlook text,
  created_at timestamp with time zone DEFAULT now(),
  soc_code_2020 text,
  salary_median_scotland integer,
  salary_entry_uk integer,
  salary_median_uk integer,
  salary_experienced_uk integer,
  salary_source text,
  salary_last_updated date,
  salary_needs_verification boolean DEFAULT false,
  salary_notes text,
  salary_entry integer,
  salary_experienced integer,
  ai_rating_2040_2045 integer,
  robotics_rating_2030_2035 integer,
  robotics_rating_2040_2045 integer,
  robotics_description text,
  ai_rating_2030_2035 integer,
  maturity_tier public.role_maturity_tier
);

CREATE TABLE IF NOT EXISTS public.career_sectors (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  description text,
  display_order integer,
  example_jobs text[] DEFAULT '{}'::text[],
  salary_range_entry text,
  salary_range_experienced text,
  growth_outlook text,
  course_subject_areas text[] DEFAULT '{}'::text[],
  ai_impact_rating text,
  ai_impact_description text,
  ai_impact_source text DEFAULT 'Based on research by Anthropic (2024), OpenAI/University of Pennsylvania (2023), and McKinsey Global Institute (2023). Last updated April 2026.'::text,
  ai_sector_narrative text,
  sqa_subjects_text text,
  apprenticeships_text text,
  scottish_context text,
  external_links jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.college_articulation (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  college_id uuid NOT NULL,
  university_id uuid NOT NULL,
  college_qualification text NOT NULL,
  college_scqf_level integer NOT NULL,
  university_degree text NOT NULL,
  entry_year integer NOT NULL,
  is_widening_participation boolean DEFAULT false,
  wp_eligibility text,
  graded_unit_requirement text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.colleges (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  city text NOT NULL,
  postcode text,
  website_url text NOT NULL,
  campuses jsonb DEFAULT '[]'::jsonb,
  course_areas text[] DEFAULT '{}'::text[],
  has_swap boolean DEFAULT false,
  swap_hub text,
  has_foundation_apprenticeships boolean DEFAULT true,
  fa_frameworks text[] DEFAULT '{}'::text[],
  has_modern_apprenticeships boolean DEFAULT false,
  ma_frameworks text[] DEFAULT '{}'::text[],
  uhi_partner boolean DEFAULT false,
  schools_programme boolean DEFAULT false,
  schools_programme_details text,
  student_count integer,
  distinctive_features text,
  description text,
  qualification_levels text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  message text NOT NULL,
  email_sent boolean DEFAULT false NOT NULL,
  email_error text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_choice_rules (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  transition text NOT NULL,
  total_subjects integer NOT NULL,
  compulsory_subjects text[] DEFAULT '{}'::text[],
  num_free_choices integer NOT NULL,
  num_reserves integer DEFAULT 1,
  non_examined_core text[] DEFAULT '{}'::text[],
  breadth_requirements text,
  special_rules text[],
  is_generic boolean DEFAULT true,
  school_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_subject_requirements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  course_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  qualification_level text NOT NULL,
  min_grade text,
  is_mandatory boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  university_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  ucas_code text,
  degree_type public.degree_type,
  subject_area text,
  description text,
  duration_years integer DEFAULT 4,
  entry_requirements jsonb DEFAULT '{}'::jsonb,
  widening_access_requirements jsonb DEFAULT '{}'::jsonb,
  course_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.curricular_areas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.missing_postcodes_log (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  postcode text NOT NULL,
  first_seen timestamp with time zone DEFAULT now() NOT NULL,
  last_seen timestamp with time zone DEFAULT now() NOT NULL,
  count integer DEFAULT 1 NOT NULL,
  source text
);

CREATE TABLE IF NOT EXISTS public.offer_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.offer_clicks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  offer_id uuid NOT NULL,
  student_id uuid,
  click_type text NOT NULL,
  referrer_page text,
  session_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.offer_support_groups (
  offer_id uuid NOT NULL,
  support_group text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  category_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  summary text,
  description text,
  brand text,
  offer_type text DEFAULT 'general'::text NOT NULL,
  discount_text text,
  url text,
  affiliate_url text,
  promo_code text,
  min_age integer,
  max_age integer,
  eligible_stages text[] DEFAULT '{}'::text[] NOT NULL,
  scotland_only boolean DEFAULT false NOT NULL,
  requires_young_scot boolean DEFAULT false NOT NULL,
  requires_totum boolean DEFAULT false NOT NULL,
  requires_unidays boolean DEFAULT false NOT NULL,
  requires_student_beans boolean DEFAULT false NOT NULL,
  verification_method text,
  locations text[] DEFAULT '{}'::text[] NOT NULL,
  university_specific uuid[] DEFAULT '{}'::uuid[] NOT NULL,
  seasonal_tags text[] DEFAULT '{}'::text[] NOT NULL,
  active_from date,
  active_until date,
  partner_id uuid,
  is_featured boolean DEFAULT false NOT NULL,
  featured_until date,
  affiliate_network text,
  commission_type text,
  commission_value numeric,
  cookie_days integer,
  last_verified_at date,
  verified_by text,
  is_active boolean DEFAULT true NOT NULL,
  needs_review boolean DEFAULT false NOT NULL,
  image_url text,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  parent_id uuid,
  student_id uuid NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  invite_code text,
  expires_at timestamp with time zone,
  linked_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.parents (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  postcode text,
  simd_decile integer,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  contact_name text,
  contact_email text,
  partner_type text NOT NULL,
  affiliate_network text,
  account_id text,
  contract_start date,
  contract_end date,
  notes text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pilot_interest (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  role text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  organisation text,
  postcode text,
  message text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prep_checklist_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  item_key text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  notes text
);

CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  promo_code_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid,
  discount_applied numeric(10,2) NOT NULL,
  original_amount numeric(10,2),
  final_amount numeric(10,2),
  redeemed_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  code text NOT NULL,
  description text,
  discount_type public.discount_type DEFAULT 'percentage'::public.discount_type NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  currency text DEFAULT 'GBP'::text,
  min_purchase_amount numeric(10,2) DEFAULT 0,
  max_uses integer,
  max_uses_per_user integer DEFAULT 1,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  applies_to jsonb DEFAULT '{"all": true}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  question_text text NOT NULL,
  riasec_type text NOT NULL,
  display_order integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid,
  realistic_score integer NOT NULL,
  investigative_score integer NOT NULL,
  artistic_score integer NOT NULL,
  social_score integer NOT NULL,
  enterprising_score integer NOT NULL,
  conventional_score integer NOT NULL,
  top_types text[] NOT NULL,
  completed_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.riasec_career_mapping (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  riasec_type text NOT NULL,
  career_area text NOT NULL,
  example_careers text[] NOT NULL,
  recommended_highers text[],
  description text,
  display_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.role_profiles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  career_role_id uuid NOT NULL,
  description text,
  day_in_the_life text,
  career_progression jsonb,
  stress_level text,
  physical_demands text,
  hours_pattern text,
  on_call text,
  travel_requirement text,
  working_location text,
  antisocial_hours text,
  emotionally_demanding text,
  emotionally_demanding_notes text,
  deals_with_public text,
  works_with_vulnerable text,
  team_vs_solo text,
  customer_facing text,
  disclosure_checks text,
  disclosure_notes text,
  dress_code text,
  driving_licence text,
  minimum_age integer,
  health_fitness_requirements text,
  contract_type text,
  job_security text,
  union_presence text,
  self_employment_viability text,
  salary_progression_speed text,
  sick_pay text,
  bonus_payments text,
  tips_or_commission text,
  pension_quality text,
  unpaid_overtime text,
  work_life_balance text,
  remote_hybrid_realistic text,
  entry_cost_notes text,
  competition_level text,
  criminal_record_impact text,
  geographic_availability text,
  geographic_notes text,
  visa_restrictions text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  min_entry_qualification public.entry_qualification,
  typical_entry_qualification public.entry_qualification,
  typical_starting_salary_gbp integer,
  typical_experienced_salary_gbp integer,
  typical_entry_age integer NOT NULL,
  typical_hours_per_week integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_comparisons (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  role_ids uuid[] NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_courses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  priority integer,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_offers (
  student_id uuid NOT NULL,
  offer_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.simd_postcodes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  postcode text NOT NULL,
  simd_decile integer NOT NULL,
  datazone text,
  council_area text,
  created_at timestamp with time zone DEFAULT now(),
  postcode_normalised text DEFAULT upper(replace(postcode, ' '::text, ''::text)),
  simd_rank integer,
  simd_quintile integer,
  source text,
  imported_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.starting_uni_checklist_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  linked_offer_id uuid,
  url text,
  display_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  stripe_customer_id text NOT NULL,
  email text,
  name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stripe_payments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  amount integer NOT NULL,
  currency text DEFAULT 'gbp'::text,
  status text NOT NULL,
  description text,
  receipt_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stripe_prices (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  stripe_price_id text NOT NULL,
  product_id uuid,
  stripe_product_id text,
  active boolean DEFAULT true,
  currency text DEFAULT 'gbp'::text,
  unit_amount integer,
  recurring_interval text,
  recurring_interval_count integer DEFAULT 1,
  trial_period_days integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stripe_products (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  stripe_product_id text NOT NULL,
  name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_price_id text,
  status public.subscription_status NOT NULL,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_academy_choices (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  rank_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_benefits (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  provider text NOT NULL,
  description text NOT NULL,
  short_description text,
  category text NOT NULL,
  discount_value text NOT NULL,
  discount_type text,
  eligibility_s1_s4 boolean DEFAULT false,
  eligibility_s5_s6 boolean DEFAULT false,
  eligibility_college boolean DEFAULT false,
  eligibility_university boolean DEFAULT false,
  min_age integer,
  max_age integer,
  access_method text,
  access_platform text,
  is_scotland_only boolean DEFAULT false,
  is_government_scheme boolean DEFAULT false,
  is_care_experienced_only boolean DEFAULT false,
  is_means_tested boolean DEFAULT false,
  url text NOT NULL,
  affiliate_url text,
  affiliate_network text,
  affiliate_commission text,
  affiliate_cookie_days integer,
  priority_score integer DEFAULT 50,
  is_active boolean DEFAULT true,
  seasonal_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_bursary_matches (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid,
  bursary_id uuid,
  match_status text DEFAULT 'eligible'::text,
  matched_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_checklist_progress (
  student_id uuid NOT NULL,
  checklist_item_id uuid NOT NULL,
  completed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_grades (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  subject text NOT NULL,
  grade text NOT NULL,
  qualification_type public.qualification_type NOT NULL,
  year integer,
  predicted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  subject_id uuid,
  is_actual boolean DEFAULT false,
  predicted_grade text
);

CREATE TABLE IF NOT EXISTS public.student_offers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  university_id uuid NOT NULL,
  status text DEFAULT 'considering'::text NOT NULL,
  offer_grades text,
  is_insurance boolean DEFAULT false,
  is_firm boolean DEFAULT false,
  notes text,
  status_updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_subject_choices (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  transition text NOT NULL,
  rank_order integer,
  is_reserve boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  school_stage public.school_stage,
  school_name text,
  postcode text,
  simd_decile integer,
  care_experienced boolean DEFAULT false,
  is_carer boolean DEFAULT false,
  first_generation boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_type text DEFAULT 'student'::text NOT NULL,
  email_reminders_enabled boolean DEFAULT true,
  reminder_frequency text DEFAULT '30_and_7'::text,
  is_young_carer boolean DEFAULT false NOT NULL,
  has_disability boolean DEFAULT false NOT NULL,
  is_estranged boolean DEFAULT false NOT NULL,
  is_refugee_or_asylum_seeker boolean DEFAULT false NOT NULL,
  is_young_parent boolean DEFAULT false NOT NULL,
  household_income_band text,
  is_single_parent_household boolean DEFAULT false,
  number_of_siblings integer,
  parental_education text,
  disability_details text,
  receives_free_school_meals boolean DEFAULT false,
  receives_ema boolean DEFAULT false,
  local_authority text,
  demographic_completed boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.subject_career_sectors (
  subject_id uuid NOT NULL,
  career_sector_id uuid NOT NULL,
  relevance text DEFAULT 'related'::text
);

CREATE TABLE IF NOT EXISTS public.subject_progressions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  from_subject_id uuid,
  to_subject_id uuid,
  from_level text NOT NULL,
  to_level text NOT NULL,
  min_grade text,
  recommended_grade text,
  notes text
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  curricular_area_id uuid,
  description text,
  why_choose text,
  assessment_type text,
  is_available_n3 boolean DEFAULT false,
  is_available_n4 boolean DEFAULT false,
  is_available_n5 boolean DEFAULT false,
  is_available_higher boolean DEFAULT false,
  is_available_adv_higher boolean DEFAULT false,
  is_npa boolean DEFAULT false,
  is_academy boolean DEFAULT false,
  sqa_course_code text,
  skills_tags text[],
  typical_availability text DEFAULT 'school'::text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.universities (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  type public.university_type,
  city text,
  website text,
  logo_url text,
  description text,
  founded_year integer,
  russell_group boolean DEFAULT false,
  widening_access_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  website_url text,
  widening_access_url text,
  scholarships_url text,
  undergraduate_url text,
  wa_programme_name text,
  wa_programme_description text,
  wa_programme_url text,
  wa_pre_entry_required boolean DEFAULT false,
  wa_pre_entry_details text,
  care_experienced_guarantee text,
  wa_bursary_info text,
  articulation_info text,
  wa_grade_reduction text,
  shep_programmes text[],
  university_type text
);

-- =============================================================================
-- 4. PRIMARY KEYS, UNIQUE, CHECK CONSTRAINTS
-- =============================================================================

ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
ALTER TABLE public.benefit_categories ADD CONSTRAINT benefit_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.benefit_categories ADD CONSTRAINT benefit_categories_slug_key UNIQUE (slug);
ALTER TABLE public.benefit_clicks ADD CONSTRAINT benefit_clicks_pkey PRIMARY KEY (id);
ALTER TABLE public.benefit_reminders ADD CONSTRAINT benefit_reminders_pkey PRIMARY KEY (id);
ALTER TABLE public.benefit_reminders ADD CONSTRAINT benefit_reminders_student_id_benefit_id_reminder_date_key UNIQUE (student_id, benefit_id, reminder_date);
ALTER TABLE public.bursaries ADD CONSTRAINT bursaries_pkey PRIMARY KEY (id);
ALTER TABLE public.bursaries ADD CONSTRAINT bursaries_amount_frequency_check CHECK ((amount_frequency = ANY (ARRAY['per_week'::text, 'per_month'::text, 'per_year'::text, 'one_off'::text, 'total_package'::text, 'variable'::text])));
ALTER TABLE public.bursaries ADD CONSTRAINT bursaries_award_type_check CHECK ((award_type = ANY (ARRAY['grant'::text, 'bursary'::text, 'fee_waiver'::text, 'accommodation'::text, 'loan'::text, 'discount'::text, 'entitlement'::text])));
ALTER TABLE public.career_role_subjects ADD CONSTRAINT career_role_subjects_pkey PRIMARY KEY (career_role_id, subject_id);
ALTER TABLE public.career_role_subjects ADD CONSTRAINT career_role_subjects_relevance_check CHECK ((relevance = ANY (ARRAY['essential'::text, 'recommended'::text, 'useful'::text])));
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_pkey PRIMARY KEY (id);
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_career_sector_id_title_key UNIQUE (career_sector_id, title);
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_ai_rating_2030_2035_check CHECK (((ai_rating_2030_2035 IS NULL) OR ((ai_rating_2030_2035 >= 1) AND (ai_rating_2030_2035 <= 10))));
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_ai_rating_2040_2045_check CHECK (((ai_rating_2040_2045 IS NULL) OR ((ai_rating_2040_2045 >= 1) AND (ai_rating_2040_2045 <= 10))));
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_robotics_rating_2030_2035_check CHECK (((robotics_rating_2030_2035 IS NULL) OR ((robotics_rating_2030_2035 >= 1) AND (robotics_rating_2030_2035 <= 10))));
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_robotics_rating_2040_2045_check CHECK (((robotics_rating_2040_2045 IS NULL) OR ((robotics_rating_2040_2045 >= 1) AND (robotics_rating_2040_2045 <= 10))));
ALTER TABLE public.career_sectors ADD CONSTRAINT career_sectors_pkey PRIMARY KEY (id);
ALTER TABLE public.career_sectors ADD CONSTRAINT career_sectors_name_key UNIQUE (name);
ALTER TABLE public.career_sectors ADD CONSTRAINT career_sectors_ai_impact_rating_check CHECK ((ai_impact_rating = ANY (ARRAY['human-centric'::text, 'ai-augmented'::text, 'ai-exposed'::text])));
ALTER TABLE public.college_articulation ADD CONSTRAINT college_articulation_pkey PRIMARY KEY (id);
ALTER TABLE public.college_articulation ADD CONSTRAINT college_articulation_college_id_university_id_college_quali_key UNIQUE (college_id, university_id, college_qualification, university_degree);
ALTER TABLE public.college_articulation ADD CONSTRAINT college_articulation_college_scqf_level_check CHECK (((college_scqf_level >= 4) AND (college_scqf_level <= 9)));
ALTER TABLE public.college_articulation ADD CONSTRAINT college_articulation_entry_year_check CHECK (((entry_year >= 1) AND (entry_year <= 4)));
ALTER TABLE public.colleges ADD CONSTRAINT colleges_pkey PRIMARY KEY (id);
ALTER TABLE public.colleges ADD CONSTRAINT colleges_swap_hub_check CHECK (((swap_hub = ANY (ARRAY['east'::text, 'west'::text])) OR (swap_hub IS NULL)));
ALTER TABLE public.contact_submissions ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);
ALTER TABLE public.course_choice_rules ADD CONSTRAINT course_choice_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.course_choice_rules ADD CONSTRAINT course_choice_rules_transition_check CHECK ((transition = ANY (ARRAY['s2_to_s3'::text, 's3_to_s4'::text, 's4_to_s5'::text, 's5_to_s6'::text])));
ALTER TABLE public.course_subject_requirements ADD CONSTRAINT course_subject_requirements_pkey PRIMARY KEY (id);
ALTER TABLE public.course_subject_requirements ADD CONSTRAINT course_subject_requirements_course_id_subject_id_qualificat_key UNIQUE (course_id, subject_id, qualification_level);
ALTER TABLE public.course_subject_requirements ADD CONSTRAINT course_subject_requirements_qualification_level_check CHECK ((qualification_level = ANY (ARRAY['n5'::text, 'higher'::text, 'adv_higher'::text])));
ALTER TABLE public.courses ADD CONSTRAINT courses_pkey PRIMARY KEY (id);
ALTER TABLE public.courses ADD CONSTRAINT courses_university_id_slug_key UNIQUE (university_id, slug);
ALTER TABLE public.curricular_areas ADD CONSTRAINT curricular_areas_pkey PRIMARY KEY (id);
ALTER TABLE public.curricular_areas ADD CONSTRAINT curricular_areas_name_key UNIQUE (name);
ALTER TABLE public.missing_postcodes_log ADD CONSTRAINT missing_postcodes_log_pkey PRIMARY KEY (id);
ALTER TABLE public.missing_postcodes_log ADD CONSTRAINT missing_postcodes_log_postcode_key UNIQUE (postcode);
ALTER TABLE public.offer_categories ADD CONSTRAINT offer_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.offer_categories ADD CONSTRAINT offer_categories_name_key UNIQUE (name);
ALTER TABLE public.offer_categories ADD CONSTRAINT offer_categories_slug_key UNIQUE (slug);
ALTER TABLE public.offer_clicks ADD CONSTRAINT offer_clicks_pkey PRIMARY KEY (id);
ALTER TABLE public.offer_clicks ADD CONSTRAINT offer_clicks_click_type_check CHECK ((click_type = ANY (ARRAY['outbound'::text, 'save'::text, 'unsave'::text, 'detail_view'::text, 'copy_code'::text])));
ALTER TABLE public.offer_support_groups ADD CONSTRAINT offer_support_groups_pkey PRIMARY KEY (offer_id, support_group);
ALTER TABLE public.offer_support_groups ADD CONSTRAINT offer_support_groups_support_group_check CHECK ((support_group = ANY (ARRAY['young-carers'::text, 'estranged-students'::text, 'young-parents'::text, 'refugees-asylum-seekers'::text, 'esol-eal'::text, 'disability'::text, 'lgbtq'::text, 'mature-students'::text, 'grt'::text, 'home-educated'::text, 'early-leavers'::text, 'rural-island'::text, 'care-experienced'::text])));
ALTER TABLE public.offers ADD CONSTRAINT offers_pkey PRIMARY KEY (id);
ALTER TABLE public.offers ADD CONSTRAINT offers_slug_key UNIQUE (slug);
ALTER TABLE public.offers ADD CONSTRAINT offers_offer_type_check CHECK ((offer_type = ANY (ARRAY['entitlement'::text, 'free_resource'::text, 'general_discount'::text, 'affiliate'::text, 'exclusive'::text, 'sponsored'::text, 'general'::text])));
ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_pkey PRIMARY KEY (id);
ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_invite_code_key UNIQUE (invite_code);
ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'revoked'::text])));
ALTER TABLE public.parents ADD CONSTRAINT parents_pkey PRIMARY KEY (id);
ALTER TABLE public.parents ADD CONSTRAINT parents_user_id_key UNIQUE (user_id);
ALTER TABLE public.partners ADD CONSTRAINT partners_pkey PRIMARY KEY (id);
ALTER TABLE public.partners ADD CONSTRAINT partners_partner_type_check CHECK ((partner_type = ANY (ARRAY['affiliate'::text, 'exclusive'::text, 'sponsored'::text, 'free'::text])));
ALTER TABLE public.pilot_interest ADD CONSTRAINT pilot_interest_pkey PRIMARY KEY (id);
ALTER TABLE public.pilot_interest ADD CONSTRAINT pilot_interest_role_check CHECK ((role = ANY (ARRAY['teacher'::text, 'adviser'::text, 'parent'::text])));
ALTER TABLE public.prep_checklist_items ADD CONSTRAINT prep_checklist_items_pkey PRIMARY KEY (id);
ALTER TABLE public.prep_checklist_items ADD CONSTRAINT prep_checklist_items_student_id_item_key_key UNIQUE (student_id, item_key);
ALTER TABLE public.promo_code_redemptions ADD CONSTRAINT promo_code_redemptions_pkey PRIMARY KEY (id);
ALTER TABLE public.promo_code_redemptions ADD CONSTRAINT promo_code_redemptions_promo_code_id_user_id_order_id_key UNIQUE (promo_code_id, user_id, order_id);
ALTER TABLE public.promo_codes ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);
ALTER TABLE public.promo_codes ADD CONSTRAINT promo_codes_code_key UNIQUE (code);
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);
ALTER TABLE public.quiz_questions ADD CONSTRAINT quiz_questions_riasec_type_check CHECK ((riasec_type = ANY (ARRAY['R'::text, 'I'::text, 'A'::text, 'S'::text, 'E'::text, 'C'::text])));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_pkey PRIMARY KEY (id);
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_artistic_score_check CHECK (((artistic_score >= 0) AND (artistic_score <= 100)));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_conventional_score_check CHECK (((conventional_score >= 0) AND (conventional_score <= 100)));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_enterprising_score_check CHECK (((enterprising_score >= 0) AND (enterprising_score <= 100)));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_investigative_score_check CHECK (((investigative_score >= 0) AND (investigative_score <= 100)));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_realistic_score_check CHECK (((realistic_score >= 0) AND (realistic_score <= 100)));
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_social_score_check CHECK (((social_score >= 0) AND (social_score <= 100)));
ALTER TABLE public.riasec_career_mapping ADD CONSTRAINT riasec_career_mapping_pkey PRIMARY KEY (id);
ALTER TABLE public.riasec_career_mapping ADD CONSTRAINT riasec_career_mapping_riasec_type_check CHECK ((riasec_type = ANY (ARRAY['R'::text, 'I'::text, 'A'::text, 'S'::text, 'E'::text, 'C'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_career_role_id_key UNIQUE (career_role_id);
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_antisocial_hours_check CHECK ((antisocial_hours = ANY (ARRAY['Yes'::text, 'No'::text, 'Sometimes'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_bonus_payments_check CHECK ((bonus_payments = ANY (ARRAY['Yes'::text, 'No'::text, 'Sometimes'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_competition_level_check CHECK ((competition_level = ANY (ARRAY['Open'::text, 'Moderate'::text, 'Competitive'::text, 'Highly competitive'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_contract_type_check CHECK ((contract_type = ANY (ARRAY['Permanent'::text, 'Fixed-term'::text, 'Freelance'::text, 'Zero hours'::text, 'Seasonal'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_criminal_record_impact_check CHECK ((criminal_record_impact = ANY (ARRAY['None'::text, 'May affect'::text, 'Likely to bar'::text, 'Will bar'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_customer_facing_check CHECK ((customer_facing = ANY (ARRAY['Yes'::text, 'No'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_deals_with_public_check CHECK ((deals_with_public = ANY (ARRAY['Yes'::text, 'No'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_disclosure_checks_check CHECK ((disclosure_checks = ANY (ARRAY['None'::text, 'PVG'::text, 'Basic'::text, 'Enhanced'::text, 'Security Clearance'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_dress_code_check CHECK ((dress_code = ANY (ARRAY['None'::text, 'Smart'::text, 'Uniform'::text, 'PPE required'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_driving_licence_check CHECK ((driving_licence = ANY (ARRAY['No'::text, 'Helpful'::text, 'Essential'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_emotionally_demanding_check CHECK ((emotionally_demanding = ANY (ARRAY['Yes'::text, 'No'::text, 'Sometimes'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_geographic_availability_check CHECK ((geographic_availability = ANY (ARRAY['National'::text, 'Regional'::text, 'Concentrated'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_hours_pattern_check CHECK ((hours_pattern = ANY (ARRAY['Standard'::text, 'Shifts'::text, 'Irregular'::text, 'Seasonal'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_job_security_check CHECK ((job_security = ANY (ARRAY['Very secure'::text, 'Secure'::text, 'Moderate'::text, 'Variable'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_on_call_check CHECK ((on_call = ANY (ARRAY['Never'::text, 'Occasional'::text, 'Regular'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_pension_quality_check CHECK ((pension_quality = ANY (ARRAY['Excellent'::text, 'Good'::text, 'Standard'::text, 'Poor'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_physical_demands_check CHECK ((physical_demands = ANY (ARRAY['Sedentary'::text, 'Light'::text, 'Moderate'::text, 'Heavy'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_remote_hybrid_realistic_check CHECK ((remote_hybrid_realistic = ANY (ARRAY['Yes'::text, 'Hybrid only'::text, 'Rarely'::text, 'No'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_salary_progression_speed_check CHECK ((salary_progression_speed = ANY (ARRAY['Fast'::text, 'Moderate'::text, 'Slow'::text, 'Flat'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_self_employment_viability_check CHECK ((self_employment_viability = ANY (ARRAY['Common'::text, 'Possible'::text, 'Rare'::text, 'No'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_sick_pay_check CHECK ((sick_pay = ANY (ARRAY['Full contractual'::text, 'Contractual then statutory'::text, 'Statutory only'::text, 'None'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_stress_level_check CHECK ((stress_level = ANY (ARRAY['Low'::text, 'Moderate'::text, 'High'::text, 'Very High'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_team_vs_solo_check CHECK ((team_vs_solo = ANY (ARRAY['Mostly team'::text, 'Mixed'::text, 'Mostly solo'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_tips_or_commission_check CHECK ((tips_or_commission = ANY (ARRAY['Yes'::text, 'No'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_travel_requirement_check CHECK ((travel_requirement = ANY (ARRAY['None'::text, 'Local'::text, 'Regional'::text, 'National'::text, 'International'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_typical_entry_age_check CHECK (((typical_entry_age IS NULL) OR ((typical_entry_age >= 14) AND (typical_entry_age <= 40))));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_typical_experienced_salary_gbp_check CHECK (((typical_experienced_salary_gbp >= 10000) AND (typical_experienced_salary_gbp <= 500000)));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_typical_hours_per_week_check CHECK (((typical_hours_per_week IS NULL) OR ((typical_hours_per_week >= 10) AND (typical_hours_per_week <= 80))));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_typical_starting_salary_gbp_check CHECK (((typical_starting_salary_gbp >= 10000) AND (typical_starting_salary_gbp <= 500000)));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_union_presence_check CHECK ((union_presence = ANY (ARRAY['Strong'::text, 'Present'::text, 'Rare'::text, 'None'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_unpaid_overtime_check CHECK ((unpaid_overtime = ANY (ARRAY['Yes'::text, 'No'::text, 'Sometimes'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_visa_restrictions_check CHECK ((visa_restrictions = ANY (ARRAY['None'::text, 'Some roles restricted'::text, 'British citizenship required'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_work_life_balance_check CHECK ((work_life_balance = ANY (ARRAY['Excellent'::text, 'Good'::text, 'Variable'::text, 'Challenging'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_working_location_check CHECK ((working_location = ANY (ARRAY['Office'::text, 'Site'::text, 'Hybrid'::text, 'Home'::text, 'Multiple'::text, 'Outdoor'::text])));
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_works_with_vulnerable_check CHECK ((works_with_vulnerable = ANY (ARRAY['Yes'::text, 'No'::text, 'Sometimes'::text])));
ALTER TABLE public.saved_comparisons ADD CONSTRAINT saved_comparisons_pkey PRIMARY KEY (id);
ALTER TABLE public.saved_comparisons ADD CONSTRAINT saved_comparisons_role_ids_check CHECK (((array_length(role_ids, 1) >= 2) AND (array_length(role_ids, 1) <= 3)));
ALTER TABLE public.saved_courses ADD CONSTRAINT saved_courses_pkey PRIMARY KEY (id);
ALTER TABLE public.saved_courses ADD CONSTRAINT saved_courses_student_id_course_id_key UNIQUE (student_id, course_id);
ALTER TABLE public.saved_offers ADD CONSTRAINT saved_offers_pkey PRIMARY KEY (student_id, offer_id);
ALTER TABLE public.simd_postcodes ADD CONSTRAINT simd_postcodes_pkey PRIMARY KEY (id);
ALTER TABLE public.simd_postcodes ADD CONSTRAINT simd_postcodes_postcode_key UNIQUE (postcode);
ALTER TABLE public.simd_postcodes ADD CONSTRAINT simd_postcodes_simd_decile_check CHECK (((simd_decile >= 1) AND (simd_decile <= 10)));
ALTER TABLE public.starting_uni_checklist_items ADD CONSTRAINT starting_uni_checklist_items_pkey PRIMARY KEY (id);
ALTER TABLE public.starting_uni_checklist_items ADD CONSTRAINT starting_uni_checklist_items_category_check CHECK ((category = ANY (ARRAY['finance'::text, 'health'::text, 'housing'::text, 'admin'::text, 'tech'::text])));
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_stripe_customer_id_key UNIQUE (stripe_customer_id);
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_user_id_key UNIQUE (user_id);
ALTER TABLE public.stripe_payments ADD CONSTRAINT stripe_payments_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_payments ADD CONSTRAINT stripe_payments_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);
ALTER TABLE public.stripe_prices ADD CONSTRAINT stripe_prices_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_prices ADD CONSTRAINT stripe_prices_stripe_price_id_key UNIQUE (stripe_price_id);
ALTER TABLE public.stripe_products ADD CONSTRAINT stripe_products_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_products ADD CONSTRAINT stripe_products_stripe_product_id_key UNIQUE (stripe_product_id);
ALTER TABLE public.stripe_subscriptions ADD CONSTRAINT stripe_subscriptions_pkey PRIMARY KEY (id);
ALTER TABLE public.stripe_subscriptions ADD CONSTRAINT stripe_subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
ALTER TABLE public.student_academy_choices ADD CONSTRAINT student_academy_choices_pkey PRIMARY KEY (id);
ALTER TABLE public.student_academy_choices ADD CONSTRAINT student_academy_choices_student_id_rank_order_key UNIQUE (student_id, rank_order);
ALTER TABLE public.student_academy_choices ADD CONSTRAINT student_academy_choices_rank_order_check CHECK (((rank_order >= 1) AND (rank_order <= 3)));
ALTER TABLE public.student_benefits ADD CONSTRAINT student_benefits_pkey PRIMARY KEY (id);
ALTER TABLE public.student_benefits ADD CONSTRAINT student_benefits_affiliate_network_check CHECK ((affiliate_network = ANY (ARRAY['awin'::text, 'amazon'::text, 'partnerize'::text, 'rakuten'::text, 'sovrn'::text, 'skimlinks'::text, 'direct'::text])));
ALTER TABLE public.student_benefits ADD CONSTRAINT student_benefits_category_check CHECK ((category = ANY (ARRAY['government'::text, 'funding'::text, 'food_drink'::text, 'retail_fashion'::text, 'entertainment'::text, 'technology'::text, 'health_beauty'::text, 'travel_transport'::text, 'banking'::text, 'accommodation'::text, 'education_tools'::text])));
ALTER TABLE public.student_benefits ADD CONSTRAINT student_benefits_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text, 'free'::text, 'cashback'::text, 'subscription'::text, 'other'::text])));
ALTER TABLE public.student_bursary_matches ADD CONSTRAINT student_bursary_matches_pkey PRIMARY KEY (id);
ALTER TABLE public.student_bursary_matches ADD CONSTRAINT student_bursary_matches_student_id_bursary_id_key UNIQUE (student_id, bursary_id);
ALTER TABLE public.student_bursary_matches ADD CONSTRAINT student_bursary_matches_match_status_check CHECK ((match_status = ANY (ARRAY['eligible'::text, 'applied'::text, 'received'::text, 'dismissed'::text])));
ALTER TABLE public.student_checklist_progress ADD CONSTRAINT student_checklist_progress_pkey PRIMARY KEY (student_id, checklist_item_id);
ALTER TABLE public.student_grades ADD CONSTRAINT student_grades_pkey PRIMARY KEY (id);
ALTER TABLE public.student_grades ADD CONSTRAINT student_grades_student_id_subject_qualification_type_key UNIQUE (student_id, subject, qualification_type);
ALTER TABLE public.student_offers ADD CONSTRAINT student_offers_pkey PRIMARY KEY (id);
ALTER TABLE public.student_offers ADD CONSTRAINT student_offers_student_id_course_id_key UNIQUE (student_id, course_id);
ALTER TABLE public.student_offers ADD CONSTRAINT student_offers_status_check CHECK ((status = ANY (ARRAY['considering'::text, 'applied'::text, 'conditional'::text, 'unconditional'::text, 'accepted'::text, 'declined'::text, 'rejected'::text])));
ALTER TABLE public.student_subject_choices ADD CONSTRAINT student_subject_choices_pkey PRIMARY KEY (id);
ALTER TABLE public.student_subject_choices ADD CONSTRAINT student_subject_choices_student_id_subject_id_transition_key UNIQUE (student_id, subject_id, transition);
ALTER TABLE public.student_subject_choices ADD CONSTRAINT student_subject_choices_transition_check CHECK ((transition = ANY (ARRAY['s2_to_s3'::text, 's3_to_s4'::text, 's4_to_s5'::text, 's5_to_s6'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_pkey PRIMARY KEY (id);
ALTER TABLE public.students ADD CONSTRAINT students_household_income_band_check CHECK ((household_income_band = ANY (ARRAY['under_21000'::text, '21000_24000'::text, '24000_34000'::text, '34000_45000'::text, 'over_45000'::text, 'prefer_not_say'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_parental_education_check CHECK ((parental_education = ANY (ARRAY['no_qualifications'::text, 'school_qualifications'::text, 'college_qualifications'::text, 'degree'::text, 'postgraduate'::text, 'unknown'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_reminder_frequency_check CHECK ((reminder_frequency = ANY (ARRAY['30_and_7'::text, '30_only'::text, '7_only'::text, 'none'::text])));
ALTER TABLE public.students ADD CONSTRAINT students_simd_decile_check CHECK (((simd_decile >= 1) AND (simd_decile <= 10)));
ALTER TABLE public.students ADD CONSTRAINT students_user_type_check CHECK ((user_type = ANY (ARRAY['student'::text, 'parent'::text])));
ALTER TABLE public.subject_career_sectors ADD CONSTRAINT subject_career_sectors_pkey PRIMARY KEY (subject_id, career_sector_id);
ALTER TABLE public.subject_career_sectors ADD CONSTRAINT subject_career_sectors_relevance_check CHECK ((relevance = ANY (ARRAY['essential'::text, 'recommended'::text, 'related'::text])));
ALTER TABLE public.subject_progressions ADD CONSTRAINT subject_progressions_pkey PRIMARY KEY (id);
ALTER TABLE public.subject_progressions ADD CONSTRAINT subject_progressions_from_subject_id_to_subject_id_from_lev_key UNIQUE (from_subject_id, to_subject_id, from_level, to_level);
ALTER TABLE public.subject_progressions ADD CONSTRAINT subject_progressions_from_level_check CHECK ((from_level = ANY (ARRAY['bge'::text, 'n3'::text, 'n4'::text, 'n5'::text, 'higher'::text, 'adv_higher'::text])));
ALTER TABLE public.subject_progressions ADD CONSTRAINT subject_progressions_to_level_check CHECK ((to_level = ANY (ARRAY['n3'::text, 'n4'::text, 'n5'::text, 'higher'::text, 'adv_higher'::text])));
ALTER TABLE public.subjects ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);
ALTER TABLE public.subjects ADD CONSTRAINT subjects_name_key UNIQUE (name);
ALTER TABLE public.subjects ADD CONSTRAINT subjects_typical_availability_check CHECK ((typical_availability = ANY (ARRAY['school'::text, 'college_partnership'::text, 'consortia'::text, 'online'::text])));
ALTER TABLE public.universities ADD CONSTRAINT universities_pkey PRIMARY KEY (id);
ALTER TABLE public.universities ADD CONSTRAINT universities_slug_key UNIQUE (slug);
ALTER TABLE public.universities ADD CONSTRAINT universities_university_type_check CHECK ((university_type = ANY (ARRAY['ancient'::text, 'established'::text, 'modern'::text, 'specialist'::text])));

-- =============================================================================
-- 5. FOREIGN KEYS
-- =============================================================================

ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.benefit_clicks ADD CONSTRAINT benefit_clicks_benefit_id_fkey FOREIGN KEY (benefit_id) REFERENCES public.student_benefits(id) ON DELETE CASCADE;
ALTER TABLE public.benefit_clicks ADD CONSTRAINT benefit_clicks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
ALTER TABLE public.benefit_reminders ADD CONSTRAINT benefit_reminders_benefit_id_fkey FOREIGN KEY (benefit_id) REFERENCES public.student_benefits(id) ON DELETE CASCADE;
ALTER TABLE public.benefit_reminders ADD CONSTRAINT benefit_reminders_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.career_role_subjects ADD CONSTRAINT career_role_subjects_career_role_id_fkey FOREIGN KEY (career_role_id) REFERENCES public.career_roles(id) ON DELETE CASCADE;
ALTER TABLE public.career_role_subjects ADD CONSTRAINT career_role_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.career_roles ADD CONSTRAINT career_roles_career_sector_id_fkey FOREIGN KEY (career_sector_id) REFERENCES public.career_sectors(id) ON DELETE CASCADE;
ALTER TABLE public.college_articulation ADD CONSTRAINT college_articulation_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.college_articulation ADD CONSTRAINT college_articulation_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id) ON DELETE CASCADE;
ALTER TABLE public.course_subject_requirements ADD CONSTRAINT course_subject_requirements_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_subject_requirements ADD CONSTRAINT course_subject_requirements_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.courses ADD CONSTRAINT courses_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id) ON DELETE CASCADE;
ALTER TABLE public.offer_clicks ADD CONSTRAINT offer_clicks_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;
ALTER TABLE public.offer_clicks ADD CONSTRAINT offer_clicks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE SET NULL;
ALTER TABLE public.offer_support_groups ADD CONSTRAINT offer_support_groups_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;
ALTER TABLE public.offers ADD CONSTRAINT offers_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.offer_categories(id) ON DELETE RESTRICT;
ALTER TABLE public.offers ADD CONSTRAINT offers_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;
ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id) ON DELETE CASCADE;
ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.parents ADD CONSTRAINT parents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.prep_checklist_items ADD CONSTRAINT prep_checklist_items_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.promo_code_redemptions ADD CONSTRAINT promo_code_redemptions_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id) ON DELETE CASCADE;
ALTER TABLE public.promo_code_redemptions ADD CONSTRAINT promo_code_redemptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.promo_codes ADD CONSTRAINT promo_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.quiz_results ADD CONSTRAINT quiz_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.role_profiles ADD CONSTRAINT role_profiles_career_role_id_fkey FOREIGN KEY (career_role_id) REFERENCES public.career_roles(id) ON DELETE CASCADE;
ALTER TABLE public.saved_comparisons ADD CONSTRAINT saved_comparisons_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.saved_courses ADD CONSTRAINT saved_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.saved_courses ADD CONSTRAINT saved_courses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.saved_offers ADD CONSTRAINT saved_offers_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;
ALTER TABLE public.saved_offers ADD CONSTRAINT saved_offers_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.starting_uni_checklist_items ADD CONSTRAINT starting_uni_checklist_items_linked_offer_id_fkey FOREIGN KEY (linked_offer_id) REFERENCES public.offers(id) ON DELETE SET NULL;
ALTER TABLE public.stripe_customers ADD CONSTRAINT stripe_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stripe_payments ADD CONSTRAINT stripe_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.stripe_prices ADD CONSTRAINT stripe_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.stripe_products(id) ON DELETE CASCADE;
ALTER TABLE public.stripe_subscriptions ADD CONSTRAINT stripe_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.student_academy_choices ADD CONSTRAINT student_academy_choices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.student_academy_choices ADD CONSTRAINT student_academy_choices_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.student_bursary_matches ADD CONSTRAINT student_bursary_matches_bursary_id_fkey FOREIGN KEY (bursary_id) REFERENCES public.bursaries(id) ON DELETE CASCADE;
ALTER TABLE public.student_bursary_matches ADD CONSTRAINT student_bursary_matches_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.student_checklist_progress ADD CONSTRAINT student_checklist_progress_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.starting_uni_checklist_items(id) ON DELETE CASCADE;
ALTER TABLE public.student_checklist_progress ADD CONSTRAINT student_checklist_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.student_grades ADD CONSTRAINT student_grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.student_grades ADD CONSTRAINT student_grades_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.student_offers ADD CONSTRAINT student_offers_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.student_offers ADD CONSTRAINT student_offers_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.student_offers ADD CONSTRAINT student_offers_university_id_fkey FOREIGN KEY (university_id) REFERENCES public.universities(id) ON DELETE CASCADE;
ALTER TABLE public.student_subject_choices ADD CONSTRAINT student_subject_choices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
ALTER TABLE public.student_subject_choices ADD CONSTRAINT student_subject_choices_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.students ADD CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.subject_career_sectors ADD CONSTRAINT subject_career_sectors_career_sector_id_fkey FOREIGN KEY (career_sector_id) REFERENCES public.career_sectors(id) ON DELETE CASCADE;
ALTER TABLE public.subject_career_sectors ADD CONSTRAINT subject_career_sectors_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.subject_progressions ADD CONSTRAINT subject_progressions_from_subject_id_fkey FOREIGN KEY (from_subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.subject_progressions ADD CONSTRAINT subject_progressions_to_subject_id_fkey FOREIGN KEY (to_subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_curricular_area_id_fkey FOREIGN KEY (curricular_area_id) REFERENCES public.curricular_areas(id);

-- =============================================================================
-- 6. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log USING btree (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log USING btree (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_bc_benefit ON public.benefit_clicks USING btree (benefit_id);
CREATE INDEX IF NOT EXISTS idx_bc_date ON public.benefit_clicks USING btree (clicked_at);
CREATE INDEX IF NOT EXISTS idx_bc_student ON public.benefit_clicks USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_br_date ON public.benefit_reminders USING btree (reminder_date);
CREATE INDEX IF NOT EXISTS idx_br_student ON public.benefit_reminders USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_br_unsent ON public.benefit_reminders USING btree (is_sent, reminder_date);
CREATE INDEX IF NOT EXISTS idx_bursaries_active ON public.bursaries USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_bursaries_courses ON public.bursaries USING gin (specific_courses);
CREATE INDEX IF NOT EXISTS idx_bursaries_means_tested ON public.bursaries USING btree (is_means_tested);
CREATE INDEX IF NOT EXISTS idx_bursaries_stages ON public.bursaries USING gin (student_stages);
CREATE INDEX IF NOT EXISTS idx_crs_role ON public.career_role_subjects USING btree (career_role_id);
CREATE INDEX IF NOT EXISTS idx_crs_subject ON public.career_role_subjects USING btree (subject_id);
CREATE INDEX IF NOT EXISTS career_roles_maturity_tier_idx ON public.career_roles USING btree (maturity_tier) WHERE (maturity_tier IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_career_roles_soc ON public.career_roles USING btree (soc_code_2020);
CREATE INDEX IF NOT EXISTS idx_cr_sector ON public.career_roles USING btree (career_sector_id);
CREATE INDEX IF NOT EXISTS idx_ca_college ON public.college_articulation USING btree (college_id);
CREATE INDEX IF NOT EXISTS idx_ca_university ON public.college_articulation USING btree (university_id);
CREATE INDEX IF NOT EXISTS idx_ca_wp ON public.college_articulation USING btree (is_widening_participation);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON public.colleges USING btree (name);
CREATE INDEX IF NOT EXISTS idx_colleges_region ON public.colleges USING btree (region);
CREATE INDEX IF NOT EXISTS idx_colleges_uhi ON public.colleges USING btree (uhi_partner);
CREATE INDEX IF NOT EXISTS idx_course_choice_rules_transition ON public.course_choice_rules USING btree (transition);
CREATE INDEX IF NOT EXISTS idx_csr_course ON public.course_subject_requirements USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_csr_subject ON public.course_subject_requirements USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_name ON public.courses USING btree (name);
CREATE INDEX IF NOT EXISTS idx_courses_subject_area ON public.courses USING btree (subject_area);
CREATE INDEX IF NOT EXISTS idx_courses_university_id ON public.courses USING btree (university_id);
CREATE INDEX IF NOT EXISTS missing_postcodes_log_postcode_idx ON public.missing_postcodes_log USING btree (postcode);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_created_at ON public.offer_clicks USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_offer_id ON public.offer_clicks USING btree (offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_student_id ON public.offer_clicks USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_offer_support_groups_support_group ON public.offer_support_groups USING btree (support_group);
CREATE INDEX IF NOT EXISTS idx_offers_category_id ON public.offers USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_offers_eligible_stages ON public.offers USING gin (eligible_stages);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_offers_is_featured ON public.offers USING btree (is_featured) WHERE (is_featured = true);
CREATE INDEX IF NOT EXISTS idx_offers_locations ON public.offers USING gin (locations);
CREATE INDEX IF NOT EXISTS idx_offers_offer_type ON public.offers USING btree (offer_type);
CREATE INDEX IF NOT EXISTS idx_offers_seasonal_tags ON public.offers USING gin (seasonal_tags);
CREATE INDEX IF NOT EXISTS parent_student_links_invite_idx ON public.parent_student_links USING btree (invite_code) WHERE ((invite_code IS NOT NULL) AND (status = 'pending'::text));
CREATE INDEX IF NOT EXISTS parent_student_links_student_idx ON public.parent_student_links USING btree (student_id);
CREATE INDEX IF NOT EXISTS parents_user_id_idx ON public.parents USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_pci_student ON public.prep_checklist_items USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON public.promo_code_redemptions USING btree (promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_date ON public.promo_code_redemptions USING btree (redeemed_at);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user ON public.promo_code_redemptions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes USING btree (is_active) WHERE (is_active = true);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes USING btree (code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_dates ON public.promo_codes USING btree (valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active_order ON public.quiz_questions USING btree (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON public.quiz_results USING btree (student_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_riasec_mapping_type ON public.riasec_career_mapping USING btree (riasec_type, display_order);
CREATE INDEX IF NOT EXISTS role_profiles_career_role_id_idx ON public.role_profiles USING btree (career_role_id);
CREATE INDEX IF NOT EXISTS saved_comparisons_user_id_idx ON public.saved_comparisons USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_courses_student_id ON public.saved_courses USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_simd_postcodes_postcode ON public.simd_postcodes USING btree (postcode);
CREATE INDEX IF NOT EXISTS simd_postcodes_postcode_normalised_idx ON public.simd_postcodes USING btree (postcode_normalised);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON public.stripe_customers USING btree (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_stripe_id ON public.stripe_payments USING btree (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_user_id ON public.stripe_payments USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product_id ON public.stripe_prices USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON public.stripe_subscriptions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON public.stripe_subscriptions USING btree (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON public.stripe_subscriptions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sac_student ON public.student_academy_choices USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_sb_active ON public.student_benefits USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_sb_category ON public.student_benefits USING btree (category);
CREATE INDEX IF NOT EXISTS idx_sb_eligibility ON public.student_benefits USING btree (eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university);
CREATE INDEX IF NOT EXISTS idx_sb_government ON public.student_benefits USING btree (is_government_scheme);
CREATE INDEX IF NOT EXISTS idx_sbm_bursary ON public.student_bursary_matches USING btree (bursary_id);
CREATE INDEX IF NOT EXISTS idx_sbm_status ON public.student_bursary_matches USING btree (match_status);
CREATE INDEX IF NOT EXISTS idx_sbm_student ON public.student_bursary_matches USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_student_id ON public.student_grades USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_subject_id ON public.student_grades USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_so_status ON public.student_offers USING btree (status);
CREATE INDEX IF NOT EXISTS idx_so_student ON public.student_offers USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_ssc_student ON public.student_subject_choices USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students USING btree (email);
CREATE INDEX IF NOT EXISTS idx_students_simd_decile ON public.students USING btree (simd_decile);
CREATE INDEX IF NOT EXISTS students_user_type_idx ON public.students USING btree (user_type);
CREATE INDEX IF NOT EXISTS idx_subj_career_career_sector_id ON public.subject_career_sectors USING btree (career_sector_id);
CREATE INDEX IF NOT EXISTS idx_subj_prog_from_subject_id ON public.subject_progressions USING btree (from_subject_id);
CREATE INDEX IF NOT EXISTS idx_subj_prog_to_subject_id ON public.subject_progressions USING btree (to_subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_curricular_area_id ON public.subjects USING btree (curricular_area_id);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects USING btree (name);
CREATE INDEX IF NOT EXISTS idx_universities_slug ON public.universities USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_universities_type ON public.universities USING btree (type);

-- =============================================================================
-- 7. FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(retention_days integer DEFAULT 365)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_log
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND action NOT IN ('USER_DATA_DELETED', 'DATA_EXPORT');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    delete_user_id UUID;
    deleted_counts JSONB;
    grades_count INTEGER;
    courses_count INTEGER;
    offers_count INTEGER;
    checklist_count INTEGER;
    subject_choices_count INTEGER;
    academy_choices_count INTEGER;
    reminders_count INTEGER;
    clicks_count INTEGER;
    audit_count INTEGER;
BEGIN
    delete_user_id := COALESCE(target_user_id, auth.uid());

    IF delete_user_id != auth.uid() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Can only delete your own data';
    END IF;

    DELETE FROM public.benefit_clicks WHERE student_id = delete_user_id;
    GET DIAGNOSTICS clicks_count = ROW_COUNT;

    DELETE FROM public.benefit_reminders WHERE student_id = delete_user_id;
    GET DIAGNOSTICS reminders_count = ROW_COUNT;

    DELETE FROM public.prep_checklist_items WHERE student_id = delete_user_id;
    GET DIAGNOSTICS checklist_count = ROW_COUNT;

    DELETE FROM public.student_offers WHERE student_id = delete_user_id;
    GET DIAGNOSTICS offers_count = ROW_COUNT;

    DELETE FROM public.student_subject_choices WHERE student_id = delete_user_id;
    GET DIAGNOSTICS subject_choices_count = ROW_COUNT;

    DELETE FROM public.student_academy_choices WHERE student_id = delete_user_id;
    GET DIAGNOSTICS academy_choices_count = ROW_COUNT;

    DELETE FROM public.student_grades WHERE student_id = delete_user_id;
    GET DIAGNOSTICS grades_count = ROW_COUNT;

    DELETE FROM public.saved_courses WHERE student_id = delete_user_id;
    GET DIAGNOSTICS courses_count = ROW_COUNT;

    UPDATE public.audit_log
    SET old_data = NULL, new_data = NULL
    WHERE user_id = delete_user_id;
    GET DIAGNOSTICS audit_count = ROW_COUNT;

    DELETE FROM public.students WHERE id = delete_user_id;

    deleted_counts := jsonb_build_object(
        'deletion_date', NOW(),
        'user_id', delete_user_id,
        'deleted_records', jsonb_build_object(
            'grades', grades_count,
            'saved_courses', courses_count,
            'offers', offers_count,
            'checklist_items', checklist_count,
            'subject_choices', subject_choices_count,
            'academy_choices', academy_choices_count,
            'benefit_reminders', reminders_count,
            'benefit_clicks', clicks_count,
            'audit_logs_anonymized', audit_count,
            'profile', 1
        ),
        'status', 'complete'
    );

    INSERT INTO public.audit_log (user_id, action, table_name, new_data)
    VALUES (NULL, 'USER_DATA_DELETED', 'all_user_data',
            jsonb_build_object('deleted_user_id', delete_user_id));

    RETURN deleted_counts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.export_user_data(target_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    export_user_id UUID;
    result JSONB;
BEGIN
    export_user_id := COALESCE(target_user_id, auth.uid());

    IF export_user_id != auth.uid() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Can only export your own data';
    END IF;

    SELECT jsonb_build_object(
        'export_date', NOW(),
        'user_id', export_user_id,
        'profile', (
            SELECT to_jsonb(s.*)
            FROM public.students s
            WHERE s.id = export_user_id
        ),
        'grades', (
            SELECT COALESCE(jsonb_agg(to_jsonb(g.*)), '[]'::jsonb)
            FROM public.student_grades g
            WHERE g.student_id = export_user_id
        ),
        'saved_courses', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'course', to_jsonb(c.*),
                    'university', to_jsonb(u.*),
                    'saved_at', sc.created_at,
                    'priority', sc.priority,
                    'notes', sc.notes
                )
            ), '[]'::jsonb)
            FROM public.saved_courses sc
            JOIN public.courses c ON c.id = sc.course_id
            JOIN public.universities u ON u.id = c.university_id
            WHERE sc.student_id = export_user_id
        ),
        'offers', (
            SELECT COALESCE(jsonb_agg(to_jsonb(o.*)), '[]'::jsonb)
            FROM public.student_offers o
            WHERE o.student_id = export_user_id
        ),
        'checklist_items', (
            SELECT COALESCE(jsonb_agg(to_jsonb(p.*)), '[]'::jsonb)
            FROM public.prep_checklist_items p
            WHERE p.student_id = export_user_id
        ),
        'subject_choices', (
            SELECT COALESCE(jsonb_agg(to_jsonb(sc2.*)), '[]'::jsonb)
            FROM public.student_subject_choices sc2
            WHERE sc2.student_id = export_user_id
        ),
        'academy_choices', (
            SELECT COALESCE(jsonb_agg(to_jsonb(ac.*)), '[]'::jsonb)
            FROM public.student_academy_choices ac
            WHERE ac.student_id = export_user_id
        ),
        'benefit_reminders', (
            SELECT COALESCE(jsonb_agg(to_jsonb(br.*)), '[]'::jsonb)
            FROM public.benefit_reminders br
            WHERE br.student_id = export_user_id
        ),
        'benefit_clicks', (
            SELECT COALESCE(jsonb_agg(to_jsonb(bc.*)), '[]'::jsonb)
            FROM public.benefit_clicks bc
            WHERE bc.student_id = export_user_id
        ),
        'audit_history', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'action', al.action,
                    'table', al.table_name,
                    'timestamp', al.created_at
                )
                ORDER BY al.created_at DESC
            ), '[]'::jsonb)
            FROM public.audit_log al
            WHERE al.user_id = export_user_id
        )
    ) INTO result;

    INSERT INTO public.audit_log (user_id, action, table_name)
    VALUES (export_user_id, 'DATA_EXPORT', 'all_user_data');

    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.flag_stale_offers()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  flagged_count INT;
BEGIN
  UPDATE public.offers
     SET needs_review = true
   WHERE last_verified_at < (now() - INTERVAL '6 months')::DATE
     AND needs_review = false
     AND is_active    = true;
  GET DIAGNOSTICS flagged_count = ROW_COUNT;
  RETURN flagged_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_parent_invite_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code TEXT;
  v_student_id UUID := auth.uid();
  v_attempts INT := 0;
  i INT;
  v_part TEXT;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM students WHERE id = v_student_id) THEN
    RAISE EXCEPTION 'Only students can generate invite codes' USING ERRCODE = '42501';
  END IF;

  UPDATE parent_student_links
    SET status = 'revoked', revoked_at = NOW()
    WHERE student_id = v_student_id
      AND status = 'pending'
      AND expires_at IS NOT NULL
      AND expires_at <= NOW();

  LOOP
    v_attempts := v_attempts + 1;
    v_code := '';
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    END LOOP;
    v_part := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4);

    EXIT WHEN NOT EXISTS (SELECT 1 FROM parent_student_links WHERE invite_code = v_part);
    IF v_attempts > 5 THEN
      RAISE EXCEPTION 'Failed to generate unique invite code' USING ERRCODE = 'P0001';
    END IF;
  END LOOP;

  INSERT INTO parent_student_links (student_id, invite_code, status, expires_at)
  VALUES (v_student_id, v_part, 'pending', NOW() + INTERVAL '48 hours');

  RETURN v_part;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_linked_children()
 RETURNS TABLE(link_id uuid, student_id uuid, first_name text, last_name text, email text, school_stage text, school_name text, postcode text, simd_decile integer, linked_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT psl.id, s.id, s.first_name, s.last_name, s.email, s.school_stage::TEXT, s.school_name, s.postcode, s.simd_decile, psl.linked_at
  FROM parent_student_links psl
  JOIN parents p ON p.id = psl.parent_id
  JOIN students s ON s.id = psl.student_id
  WHERE p.user_id = auth.uid() AND psl.status = 'active'
  ORDER BY psl.linked_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_linked_parents()
 RETURNS TABLE(link_id uuid, parent_id uuid, full_name text, email text, linked_at timestamp with time zone, status text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT psl.id, p.id, p.full_name, p.email, psl.linked_at, psl.status
  FROM parent_student_links psl
  JOIN parents p ON p.id = psl.parent_id
  WHERE psl.student_id = auth.uid()
    AND psl.status = 'active'
  ORDER BY psl.linked_at DESC NULLS LAST;
$function$;

CREATE OR REPLACE FUNCTION public.get_promo_code_stats(p_code_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'promo_code_id', pc.id,
        'code', pc.code,
        'total_redemptions', COUNT(pcr.id),
        'total_discount_given', COALESCE(SUM(pcr.discount_applied), 0),
        'total_revenue_generated', COALESCE(SUM(pcr.final_amount), 0),
        'unique_users', COUNT(DISTINCT pcr.user_id),
        'remaining_uses', CASE
            WHEN pc.max_uses IS NULL THEN NULL
            ELSE pc.max_uses - COUNT(pcr.id)
        END,
        'is_active', pc.is_active,
        'valid_until', pc.valid_until
    )
    INTO result
    FROM public.promo_codes pc
    LEFT JOIN public.promo_code_redemptions pcr ON pcr.promo_code_id = pc.id
    WHERE pc.id = p_code_id
    GROUP BY pc.id;

    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    check_user_id UUID;
    result JSONB;
BEGIN
    check_user_id := COALESCE(p_user_id, auth.uid());

    SELECT jsonb_build_object(
        'has_subscription', TRUE,
        'subscription_id', s.stripe_subscription_id,
        'status', s.status,
        'current_period_end', s.current_period_end,
        'cancel_at', s.cancel_at,
        'price', jsonb_build_object(
            'id', p.stripe_price_id,
            'amount', p.unit_amount,
            'currency', p.currency,
            'interval', p.recurring_interval
        ),
        'product', jsonb_build_object(
            'id', pr.stripe_product_id,
            'name', pr.name
        )
    )
    INTO result
    FROM public.stripe_subscriptions s
    LEFT JOIN public.stripe_prices p ON p.stripe_price_id = s.stripe_price_id
    LEFT JOIN public.stripe_products pr ON pr.id = p.product_id
    WHERE s.user_id = check_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF result IS NULL THEN
        result := jsonb_build_object('has_subscription', FALSE);
    END IF;

    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    check_user_id UUID;
BEGIN
    check_user_id := COALESCE(p_user_id, auth.uid());

    RETURN EXISTS (
        SELECT 1 FROM public.stripe_subscriptions
        WHERE user_id = check_user_id
        AND status IN ('active', 'trialing')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_linked_parent(p_student_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM parent_student_links psl
    JOIN parents p ON p.id = psl.parent_id
    WHERE p.user_id = auth.uid()
      AND psl.student_id = p_student_id
      AND psl.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.log_audit_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    audit_user_id UUID;
    old_record JSONB;
    new_record JSONB;
BEGIN
    audit_user_id := auth.uid();

    IF TG_OP = 'DELETE' THEN
        old_record := to_jsonb(OLD);
        new_record := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_record := to_jsonb(OLD);
        new_record := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_record := NULL;
        new_record := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        audit_user_id,
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        old_record,
        new_record
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_missing_postcode(p_postcode text, p_source text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_postcode IS NULL OR length(trim(p_postcode)) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.missing_postcodes_log (postcode, source)
  VALUES (upper(trim(p_postcode)), p_source)
  ON CONFLICT (postcode) DO UPDATE
  SET count     = public.missing_postcodes_log.count + 1,
      last_seen = now(),
      source    = COALESCE(EXCLUDED.source, public.missing_postcodes_log.source);
END;
$function$;

CREATE OR REPLACE FUNCTION public.lookup_simd_for_student()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
    normalised text;
    looked_up integer;
BEGIN
    IF NEW.postcode IS NULL OR NEW.postcode = '' THEN
        NEW.simd_decile := NULL;
        RETURN NEW;
    END IF;

    normalised := upper(replace(NEW.postcode, ' ', ''));

    SELECT simd_decile INTO looked_up
    FROM public.simd_postcodes
    WHERE postcode_normalised = normalised
    LIMIT 1;

    NEW.simd_decile := looked_up;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.match_bursaries_for_student(target_student_id uuid)
 RETURNS TABLE(bursary_id uuid, name text, administering_body text, description text, award_type text, amount_description text, amount_max numeric, url text, application_deadline text, match_confidence text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  s RECORD;
  s_stage_label TEXT;
BEGIN
  SELECT * INTO s FROM students WHERE id = target_student_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found: %', target_student_id;
  END IF;

  s_stage_label := CASE s.school_stage::text
    WHEN 's2' THEN 'S2'
    WHEN 's3' THEN 'S3'
    WHEN 's4' THEN 'S4'
    WHEN 's5' THEN 'S5'
    WHEN 's6' THEN 'S6'
    WHEN 'college' THEN 'FE'
    WHEN 'mature' THEN 'undergraduate'
    ELSE NULL
  END;

  RETURN QUERY
  SELECT
    b.id AS bursary_id,
    b.name,
    b.administering_body,
    b.description,
    b.award_type,
    b.amount_description,
    b.amount_max,
    b.url,
    b.application_deadline,
    CASE
      WHEN (b.requires_care_experience IS TRUE AND COALESCE(s.care_experienced, false) IS TRUE)
        OR (b.requires_estranged IS TRUE AND COALESCE(s.is_estranged, false) IS TRUE)
        OR (b.requires_carer IS TRUE AND (COALESCE(s.is_carer, false) IS TRUE OR COALESCE(s.is_young_carer, false) IS TRUE))
        OR (b.requires_disability IS TRUE AND COALESCE(s.has_disability, false) IS TRUE)
        OR (b.requires_refugee_or_asylum IS TRUE AND COALESCE(s.is_refugee_or_asylum_seeker, false) IS TRUE)
        OR (b.requires_young_parent IS TRUE AND COALESCE(s.is_young_parent, false) IS TRUE)
        THEN 'definite'
      WHEN COALESCE(b.requires_care_experience, false) = false
        AND COALESCE(b.requires_estranged, false) = false
        AND COALESCE(b.requires_carer, false) = false
        AND COALESCE(b.requires_disability, false) = false
        AND COALESCE(b.requires_refugee_or_asylum, false) = false
        AND COALESCE(b.requires_young_parent, false) = false
        AND b.income_threshold_max IS NULL
        AND b.simd_quintile_max IS NULL
        AND b.min_age IS NULL
        AND b.max_age IS NULL
        THEN 'likely'
      ELSE 'check_eligibility'
    END AS match_confidence
  FROM bursaries b
  WHERE b.is_active = true
    AND (COALESCE(b.requires_care_experience, false) = false OR COALESCE(s.care_experienced, false) = true)
    AND (COALESCE(b.requires_estranged, false) = false OR COALESCE(s.is_estranged, false) = true)
    AND (COALESCE(b.requires_carer, false) = false OR COALESCE(s.is_carer, false) = true OR COALESCE(s.is_young_carer, false) = true)
    AND (COALESCE(b.requires_disability, false) = false OR COALESCE(s.has_disability, false) = true)
    AND (COALESCE(b.requires_refugee_or_asylum, false) = false OR COALESCE(s.is_refugee_or_asylum_seeker, false) = true)
    AND (COALESCE(b.requires_young_parent, false) = false OR COALESCE(s.is_young_parent, false) = true)
    AND (b.simd_quintile_max IS NULL OR s.simd_decile IS NULL OR CEIL(s.simd_decile::numeric / 2) <= b.simd_quintile_max)
    AND (s_stage_label IS NULL OR s_stage_label = ANY(b.student_stages))
  ORDER BY
    CASE
      WHEN (b.requires_care_experience IS TRUE AND COALESCE(s.care_experienced, false) IS TRUE)
        OR (b.requires_estranged IS TRUE AND COALESCE(s.is_estranged, false) IS TRUE)
        OR (b.requires_carer IS TRUE AND (COALESCE(s.is_carer, false) IS TRUE OR COALESCE(s.is_young_carer, false) IS TRUE))
        OR (b.requires_disability IS TRUE AND COALESCE(s.has_disability, false) IS TRUE)
        OR (b.requires_refugee_or_asylum IS TRUE AND COALESCE(s.is_refugee_or_asylum_seeker, false) IS TRUE)
        OR (b.requires_young_parent IS TRUE AND COALESCE(s.is_young_parent, false) IS TRUE)
        THEN 0
      WHEN COALESCE(b.requires_care_experience, false) = false
        AND COALESCE(b.requires_estranged, false) = false
        AND COALESCE(b.requires_carer, false) = false
        AND COALESCE(b.requires_disability, false) = false
        AND COALESCE(b.requires_refugee_or_asylum, false) = false
        AND COALESCE(b.requires_young_parent, false) = false
        AND b.income_threshold_max IS NULL
        AND b.simd_quintile_max IS NULL
        AND b.min_age IS NULL
        AND b.max_age IS NULL
        THEN 1
      ELSE 2
    END,
    b.amount_max DESC NULLS LAST,
    b.name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.parents_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $function$;

CREATE OR REPLACE FUNCTION public.prevent_restricted_student_column_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF current_setting('role', true) IN ('service_role', 'postgres') THEN
        RETURN NEW;
    END IF;

    -- simd_decile can only change as a side effect of a postcode change.
    -- auto_lookup_simd runs BEFORE this trigger (alphabetical ordering) and
    -- sets NEW.simd_decile from simd_postcodes lookup when postcode changes.
    IF NEW.simd_decile IS DISTINCT FROM OLD.simd_decile
       AND NEW.postcode IS NOT DISTINCT FROM OLD.postcode THEN
        RAISE EXCEPTION 'simd_decile cannot be modified directly; update postcode to recalculate'
            USING ERRCODE = '42501';
    END IF;
    IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
        RAISE EXCEPTION 'user_type cannot be modified after account creation'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.redeem_parent_invite_code(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_parent_id UUID;
  v_parent_name TEXT;
  v_parent_email TEXT;
  v_link_id UUID;
  v_student_id UUID;
  v_student_first TEXT;
  v_student_last TEXT;
  v_student_email TEXT;
  v_normalised TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT id, full_name, email INTO v_parent_id, v_parent_name, v_parent_email
    FROM parents WHERE user_id = v_user_id;

  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'You must have a parent profile to redeem an invite code' USING ERRCODE = '42501';
  END IF;

  v_normalised := UPPER(REGEXP_REPLACE(COALESCE(p_code, ''), '[^A-Z0-9]', '', 'g'));
  IF length(v_normalised) <> 8 THEN
    RAISE EXCEPTION 'Invalid invite code format' USING ERRCODE = '22023';
  END IF;
  v_normalised := substr(v_normalised, 1, 4) || '-' || substr(v_normalised, 5, 4);

  SELECT id, student_id INTO v_link_id, v_student_id
    FROM parent_student_links
    WHERE invite_code = v_normalised
      AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > NOW())
    FOR UPDATE;

  IF v_link_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code' USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (SELECT 1 FROM parent_student_links WHERE parent_id = v_parent_id AND student_id = v_student_id AND status = 'active') THEN
    RAISE EXCEPTION 'You are already linked to this student' USING ERRCODE = 'P0003';
  END IF;

  UPDATE parent_student_links
    SET parent_id = v_parent_id, status = 'active', linked_at = NOW(), invite_code = NULL
    WHERE id = v_link_id;

  SELECT first_name, last_name, email INTO v_student_first, v_student_last, v_student_email
    FROM students WHERE id = v_student_id;

  RETURN jsonb_build_object(
    'link_id', v_link_id,
    'student_id', v_student_id,
    'student_first_name', v_student_first,
    'student_last_name', v_student_last,
    'student_email', v_student_email,
    'parent_id', v_parent_id,
    'parent_name', v_parent_name,
    'parent_email', v_parent_email
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code text, p_amount numeric, p_order_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    validation JSONB;
    redemption_id UUID;
    final_amount DECIMAL;
    discount_amount DECIMAL;
BEGIN
    validation := public.validate_promo_code(p_code, auth.uid(), p_amount);

    IF NOT (validation->>'valid')::BOOLEAN THEN
        RETURN validation;
    END IF;

    discount_amount := (validation->>'calculated_discount')::DECIMAL;
    final_amount := p_amount - discount_amount;

    INSERT INTO public.promo_code_redemptions (
        promo_code_id,
        user_id,
        order_id,
        discount_applied,
        original_amount,
        final_amount
    )
    VALUES (
        (validation->>'promo_code_id')::UUID,
        auth.uid(),
        p_order_id,
        discount_amount,
        p_amount,
        final_amount
    )
    RETURNING id INTO redemption_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'redemption_id', redemption_id,
        'original_amount', p_amount,
        'discount_applied', discount_amount,
        'final_amount', final_amount,
        'promo_code', validation->>'code'
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_parent_link(p_link_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_updated INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  UPDATE parent_student_links
    SET status = 'revoked', revoked_at = NOW()
    WHERE id = p_link_id AND student_id = v_user_id AND status IN ('active', 'pending');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RAISE EXCEPTION 'Link not found or not yours to revoke' USING ERRCODE = 'P0002';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_offers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ BEGIN NEW.updated_at = NOW(); RETURN NEW;
  END; $function$;

CREATE OR REPLACE FUNCTION public.validate_promo_code(p_code text, p_user_id uuid DEFAULT NULL::uuid, p_amount numeric DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    promo public.promo_codes%ROWTYPE;
    user_redemptions INTEGER;
    total_redemptions INTEGER;
    check_user_id UUID;
BEGIN
    check_user_id := COALESCE(p_user_id, auth.uid());

    SELECT * INTO promo
    FROM public.promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Invalid promo code');
    END IF;

    IF promo.valid_from > NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code not yet active');
    END IF;

    IF promo.valid_until IS NOT NULL AND promo.valid_until < NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code has expired');
    END IF;

    IF p_amount < promo.min_purchase_amount THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'error', 'Minimum purchase amount not met',
            'min_amount', promo.min_purchase_amount
        );
    END IF;

    IF promo.max_uses IS NOT NULL THEN
        SELECT COUNT(*) INTO total_redemptions
        FROM public.promo_code_redemptions
        WHERE promo_code_id = promo.id;

        IF total_redemptions >= promo.max_uses THEN
            RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code usage limit reached');
        END IF;
    END IF;

    IF check_user_id IS NOT NULL AND promo.max_uses_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO user_redemptions
        FROM public.promo_code_redemptions
        WHERE promo_code_id = promo.id AND user_id = check_user_id;

        IF user_redemptions >= promo.max_uses_per_user THEN
            RETURN jsonb_build_object('valid', FALSE, 'error', 'You have already used this promo code');
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'valid', TRUE,
        'promo_code_id', promo.id,
        'code', promo.code,
        'description', promo.description,
        'discount_type', promo.discount_type,
        'discount_value', promo.discount_value,
        'calculated_discount', CASE
            WHEN promo.discount_type = 'percentage' THEN ROUND(p_amount * (promo.discount_value / 100), 2)
            WHEN promo.discount_type = 'fixed_amount' THEN LEAST(promo.discount_value, p_amount)
            ELSE 0
        END
    );
END;
$function$;

-- =============================================================================
-- 8. TRIGGERS
-- =============================================================================

CREATE TRIGGER audit_benefit_reminders AFTER INSERT OR DELETE OR UPDATE ON public.benefit_reminders FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.set_offers_updated_at();
CREATE TRIGGER parents_updated_at_trigger BEFORE UPDATE ON public.parents FOR EACH ROW EXECUTE FUNCTION public.parents_updated_at();
CREATE TRIGGER audit_prep_checklist_items AFTER INSERT OR DELETE OR UPDATE ON public.prep_checklist_items FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_promo_redemptions AFTER INSERT OR DELETE OR UPDATE ON public.promo_code_redemptions FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_promo_codes AFTER INSERT OR DELETE OR UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_saved_comparisons_updated_at BEFORE UPDATE ON public.saved_comparisons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_saved_courses AFTER INSERT OR DELETE OR UPDATE ON public.saved_courses FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON public.stripe_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_stripe_payments AFTER INSERT OR DELETE OR UPDATE ON public.stripe_payments FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_stripe_prices_updated_at BEFORE UPDATE ON public.stripe_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stripe_products_updated_at BEFORE UPDATE ON public.stripe_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_stripe_subscriptions AFTER INSERT OR DELETE OR UPDATE ON public.stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON public.stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_student_grades AFTER INSERT OR DELETE OR UPDATE ON public.student_grades FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_student_grades_updated_at BEFORE UPDATE ON public.student_grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_student_offers AFTER INSERT OR DELETE OR UPDATE ON public.student_offers FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER update_student_subject_choices_updated_at BEFORE UPDATE ON public.student_subject_choices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_students AFTER INSERT OR DELETE OR UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER auto_lookup_simd BEFORE INSERT OR UPDATE OF postcode ON public.students FOR EACH ROW EXECUTE FUNCTION public.lookup_simd_for_student();
CREATE TRIGGER students_restricted_column_guard BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.prevent_restricted_student_column_update();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON public.universities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 9. ROW LEVEL SECURITY + POLICIES
-- =============================================================================

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bursaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_role_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_articulation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_choice_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_subject_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curricular_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_postcodes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riasec_career_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simd_postcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starting_uni_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academy_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_bursary_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_career_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- POLICIES

CREATE POLICY "Service role can insert audit logs" ON public.audit_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Users can view own audit logs" ON public.audit_log FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Public read access" ON public.benefit_categories FOR SELECT USING (true);

CREATE POLICY "Anon insert clicks" ON public.benefit_clicks FOR INSERT TO anon WITH CHECK ((student_id IS NULL));
CREATE POLICY "Insert own clicks only" ON public.benefit_clicks FOR INSERT TO authenticated WITH CHECK (((student_id IS NULL) OR (student_id = auth.uid())));
CREATE POLICY "Service role read clicks" ON public.benefit_clicks FOR SELECT USING ((auth.role() = 'service_role'::text));
CREATE POLICY "Users can view own clicks" ON public.benefit_clicks FOR SELECT TO authenticated USING ((student_id = auth.uid()));

CREATE POLICY "Users can manage own reminders" ON public.benefit_reminders FOR ALL USING ((auth.uid() = student_id));

CREATE POLICY "Anyone can read active bursaries" ON public.bursaries FOR SELECT USING ((is_active = true));

CREATE POLICY "Public read access" ON public.career_role_subjects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.career_roles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.career_sectors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.college_articulation FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.colleges FOR SELECT USING (true);

CREATE POLICY "Authenticated users can read contact submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public read access" ON public.course_choice_rules FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.course_subject_requirements FOR SELECT USING (true);

CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read access" ON public.curricular_areas FOR SELECT USING (true);

CREATE POLICY "offer_categories_select_public" ON public.offer_categories FOR SELECT USING (true);

CREATE POLICY "offer_clicks_insert_any" ON public.offer_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "offer_clicks_select_own" ON public.offer_clicks FOR SELECT USING (((student_id = auth.uid()) OR (student_id IS NULL)));

CREATE POLICY "offer_support_groups_select_public" ON public.offer_support_groups FOR SELECT USING (true);

CREATE POLICY "offers_select_active" ON public.offers FOR SELECT USING ((is_active = true));

CREATE POLICY "Parents can redeem pending links" ON public.parent_student_links FOR UPDATE USING ((parent_id IN ( SELECT parents.id FROM public.parents WHERE (parents.user_id = auth.uid()))));
CREATE POLICY "Parents see own links" ON public.parent_student_links FOR SELECT USING ((parent_id IN ( SELECT parents.id FROM public.parents WHERE (parents.user_id = auth.uid()))));
CREATE POLICY "Students can create invites" ON public.parent_student_links FOR INSERT WITH CHECK (((student_id = auth.uid()) AND (parent_id IS NULL) AND (status = 'pending'::text)));
CREATE POLICY "Students can delete their links" ON public.parent_student_links FOR DELETE USING ((student_id = auth.uid()));
CREATE POLICY "Students can update their links" ON public.parent_student_links FOR UPDATE USING ((student_id = auth.uid()));
CREATE POLICY "Students see links to them" ON public.parent_student_links FOR SELECT USING ((student_id = auth.uid()));

CREATE POLICY "Parents can delete own profile" ON public.parents FOR DELETE USING ((user_id = auth.uid()));
CREATE POLICY "Parents can insert own profile" ON public.parents FOR INSERT WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "Parents can update own profile" ON public.parents FOR UPDATE USING ((user_id = auth.uid()));
CREATE POLICY "Parents can view own profile" ON public.parents FOR SELECT USING ((user_id = auth.uid()));

CREATE POLICY "anon can insert pilot interest" ON public.pilot_interest FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can manage own checklist" ON public.prep_checklist_items FOR ALL USING ((auth.uid() = student_id));

CREATE POLICY "Service role full access to redemptions" ON public.promo_code_redemptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own redemptions" ON public.promo_code_redemptions FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Active promo codes are viewable" ON public.promo_codes FOR SELECT TO anon, authenticated USING (((is_active = true) AND ((valid_until IS NULL) OR (valid_until > now()))));
CREATE POLICY "Service role full access to promo_codes" ON public.promo_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read active questions" ON public.quiz_questions FOR SELECT USING ((is_active = true));

CREATE POLICY "Linked parents read quiz results" ON public.quiz_results FOR SELECT USING (public.is_linked_parent(student_id));
CREATE POLICY "Users see own results" ON public.quiz_results FOR ALL USING ((student_id = auth.uid())) WITH CHECK ((student_id = auth.uid()));

CREATE POLICY "Anyone can read mappings" ON public.riasec_career_mapping FOR SELECT USING (true);

CREATE POLICY "Public read access" ON public.role_profiles FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.role_profiles FOR ALL USING ((auth.role() = 'service_role'::text));

CREATE POLICY "saved_comparisons_delete_own" ON public.saved_comparisons FOR DELETE TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "saved_comparisons_insert_own" ON public.saved_comparisons FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "saved_comparisons_select_own" ON public.saved_comparisons FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "saved_comparisons_update_own" ON public.saved_comparisons FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Linked parents read saved courses" ON public.saved_courses FOR SELECT USING (public.is_linked_parent(student_id));
CREATE POLICY "Users can delete own saved courses" ON public.saved_courses FOR DELETE USING ((auth.uid() = student_id));
CREATE POLICY "Users can insert own saved courses" ON public.saved_courses FOR INSERT WITH CHECK ((auth.uid() = student_id));
CREATE POLICY "Users can update own saved courses" ON public.saved_courses FOR UPDATE USING ((auth.uid() = student_id));
CREATE POLICY "Users can view own saved courses" ON public.saved_courses FOR SELECT USING ((auth.uid() = student_id));

CREATE POLICY "saved_offers_all_own" ON public.saved_offers FOR ALL USING ((student_id = auth.uid())) WITH CHECK ((student_id = auth.uid()));

CREATE POLICY "SIMD postcodes are viewable by everyone" ON public.simd_postcodes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "checklist_items_select_active" ON public.starting_uni_checklist_items FOR SELECT USING ((is_active = true));

CREATE POLICY "Service role manages stripe_customers" ON public.stripe_customers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own stripe customer" ON public.stripe_customers FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Service role manages stripe_payments" ON public.stripe_payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own payments" ON public.stripe_payments FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Prices are viewable by everyone" ON public.stripe_prices FOR SELECT TO anon, authenticated USING ((active = true));
CREATE POLICY "Service role manages stripe_prices" ON public.stripe_prices FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Products are viewable by everyone" ON public.stripe_products FOR SELECT TO anon, authenticated USING ((active = true));
CREATE POLICY "Service role manages stripe_products" ON public.stripe_products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages stripe_subscriptions" ON public.stripe_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own subscriptions" ON public.stripe_subscriptions FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Users can delete own choices" ON public.student_academy_choices FOR DELETE USING ((auth.uid() = student_id));
CREATE POLICY "Users can insert own choices" ON public.student_academy_choices FOR INSERT WITH CHECK ((auth.uid() = student_id));
CREATE POLICY "Users can read own choices" ON public.student_academy_choices FOR SELECT USING ((auth.uid() = student_id));
CREATE POLICY "Users can update own choices" ON public.student_academy_choices FOR UPDATE USING ((auth.uid() = student_id));

CREATE POLICY "Public read access" ON public.student_benefits FOR SELECT USING (true);

CREATE POLICY "Users see own matches" ON public.student_bursary_matches FOR ALL USING ((student_id = auth.uid())) WITH CHECK ((student_id = auth.uid()));

CREATE POLICY "student_checklist_progress_all_own" ON public.student_checklist_progress FOR ALL USING ((student_id = auth.uid())) WITH CHECK ((student_id = auth.uid()));

CREATE POLICY "Linked parents read grades" ON public.student_grades FOR SELECT USING (public.is_linked_parent(student_id));
CREATE POLICY "Users can delete own grades" ON public.student_grades FOR DELETE USING ((auth.uid() = student_id));
CREATE POLICY "Users can insert own grades" ON public.student_grades FOR INSERT WITH CHECK ((auth.uid() = student_id));
CREATE POLICY "Users can update own grades" ON public.student_grades FOR UPDATE USING ((auth.uid() = student_id));
CREATE POLICY "Users can view own grades" ON public.student_grades FOR SELECT USING ((auth.uid() = student_id));

CREATE POLICY "Linked parents read offers" ON public.student_offers FOR SELECT USING (public.is_linked_parent(student_id));
CREATE POLICY "Users can delete own offers" ON public.student_offers FOR DELETE USING ((auth.uid() = student_id));
CREATE POLICY "Users can insert own offers" ON public.student_offers FOR INSERT WITH CHECK ((auth.uid() = student_id));
CREATE POLICY "Users can read own offers" ON public.student_offers FOR SELECT USING ((auth.uid() = student_id));
CREATE POLICY "Users can update own offers" ON public.student_offers FOR UPDATE USING ((auth.uid() = student_id));

CREATE POLICY "Users can delete own choices" ON public.student_subject_choices FOR DELETE USING ((auth.uid() = student_id));
CREATE POLICY "Users can insert own choices" ON public.student_subject_choices FOR INSERT WITH CHECK ((auth.uid() = student_id));
CREATE POLICY "Users can read own choices" ON public.student_subject_choices FOR SELECT USING ((auth.uid() = student_id));
CREATE POLICY "Users can update own choices" ON public.student_subject_choices FOR UPDATE USING ((auth.uid() = student_id));

CREATE POLICY "Users can delete own student profile" ON public.students FOR DELETE USING ((auth.uid() = id));
CREATE POLICY "Users can insert own student profile" ON public.students FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own student profile" ON public.students FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Users can view own student profile" ON public.students FOR SELECT USING ((auth.uid() = id));

CREATE POLICY "Public read access" ON public.subject_career_sectors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.subject_progressions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Universities are viewable by everyone" ON public.universities FOR SELECT TO anon, authenticated USING (true);

-- =============================================================================
-- 10. COMMENTS
-- =============================================================================

COMMENT ON COLUMN public.career_roles.ai_rating_2030_2035 IS 'AI impact rating 1-10 for the 2030-2035 early-career window. See docs/ai-horizon-rubric.md.';
COMMENT ON COLUMN public.career_roles.ai_rating_2040_2045 IS 'AI impact rating 1-10 for the 2040-2045 mid-career window. See docs/ai-horizon-rubric.md.';
COMMENT ON COLUMN public.career_roles.robotics_rating_2030_2035 IS 'Robotics and physical automation impact rating 1-10 for the 2030-2035 early-career window. See docs/robotics-rating-rubric.md.';
COMMENT ON COLUMN public.career_roles.robotics_rating_2040_2045 IS 'Robotics and physical automation impact rating 1-10 for the 2040-2045 mid-career window. See docs/robotics-rating-rubric.md.';
COMMENT ON COLUMN public.career_roles.robotics_description IS 'Free-text description of how robotics and physical automation affects the role, parallel to ai_description.';
COMMENT ON TABLE public.missing_postcodes_log IS 'Scottish postcodes that passed postcodes.io validation but are absent from simd_postcodes. Used to prioritise the Stage 1.5b SIMD data refresh.';
COMMENT ON TABLE public.pilot_interest IS 'Non-student outreach form submissions from /for-teachers /for-advisers /for-parents. Insert-only for anon; no public select.';
COMMENT ON COLUMN public.role_profiles.min_entry_qualification IS 'Lowest Scottish qualification level that reliably leads into this role. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_entry_qualification IS 'Most common entry qualification for new entrants today. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_starting_salary_gbp IS 'UK-wide typical starting salary in GBP, rounded to nearest 1000. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_experienced_salary_gbp IS 'UK-wide typical experienced salary in GBP, rounded to nearest 1000. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_entry_age IS 'Typical age at which a person enters this role, derived from typical_entry_qualification with role-name overrides. Populated in migration 20260421000002.';
COMMENT ON COLUMN public.role_profiles.typical_hours_per_week IS 'Typical contracted hours per week, derived from hours_pattern with role-name overrides. Populated in migration 20260421000002.';
COMMENT ON COLUMN public.students.user_type IS 'Discriminator: ''student'' (default) or ''parent''. Parent rows skip grade entry and see a parent dashboard.';
COMMENT ON COLUMN public.students.is_young_carer IS 'Student self-identifies as a young carer. Drives Young Carer Grant callout on /prep and card highlighting on /support hub.';
COMMENT ON COLUMN public.students.has_disability IS 'Student self-identifies as having a disability or long-term condition. Drives DSA/ILF callouts on /prep and card highlighting on /support hub.';
COMMENT ON COLUMN public.students.is_estranged IS 'Student is estranged from their family (no contact with either biological or adoptive parent). Widening-access flag used by match_bursaries_for_student.';
COMMENT ON COLUMN public.students.is_refugee_or_asylum_seeker IS 'Student holds refugee status, humanitarian protection, or is an asylum seeker. Widening-access flag used by match_bursaries_for_student.';
COMMENT ON COLUMN public.students.is_young_parent IS 'Student has dependent children and is under the age threshold for the Lone Parent Grant or similar schemes. Widening-access flag used by match_bursaries_for_student.';

-- =============================================================================
-- END OF BASELINE
-- =============================================================================
