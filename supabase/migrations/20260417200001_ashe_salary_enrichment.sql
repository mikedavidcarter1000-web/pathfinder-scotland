-- ============================================
-- ASHE salary enrichment for career_roles
-- Migration: 20260417200001
--
-- Adds structured salary columns sourced from ONS ASHE data
-- and SOC 2020 codes. The existing salary_entry and salary_experienced
-- TEXT columns are retained — they will be repopulated with Scotland
-- figures in a later data-seeding step.
-- ============================================

ALTER TABLE public.career_roles
  ADD COLUMN IF NOT EXISTS soc_code_2020 text,
  ADD COLUMN IF NOT EXISTS salary_median_scotland integer,
  ADD COLUMN IF NOT EXISTS salary_entry_uk integer,
  ADD COLUMN IF NOT EXISTS salary_median_uk integer,
  ADD COLUMN IF NOT EXISTS salary_experienced_uk integer,
  ADD COLUMN IF NOT EXISTS salary_source text,
  ADD COLUMN IF NOT EXISTS salary_last_updated date,
  ADD COLUMN IF NOT EXISTS salary_needs_verification boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS salary_notes text;

CREATE INDEX IF NOT EXISTS idx_career_roles_soc ON public.career_roles(soc_code_2020);
