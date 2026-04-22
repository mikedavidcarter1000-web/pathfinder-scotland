-- ============================================
-- Pilot interest register
-- Migration: 20260425000001
-- Feature: Non-student outreach forms on /for-teachers, /for-advisers, /for-parents
-- ============================================
--
-- A single table captures interest submissions from three non-student surfaces
-- (teacher pilot, careers-adviser pilot, parent sign-up-their-child flow).
-- Insert-only for anon and authenticated; no select for public.

CREATE TABLE IF NOT EXISTS pilot_interest (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('teacher','adviser','parent')),
  name text not null,
  email text not null,
  organisation text,
  postcode text,
  message text,
  created_at timestamptz default now()
);

ALTER TABLE pilot_interest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can insert pilot interest" ON pilot_interest;
CREATE POLICY "anon can insert pilot interest"
  ON pilot_interest FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE pilot_interest IS
  'Non-student outreach form submissions from /for-teachers /for-advisers /for-parents. Insert-only for anon; no public select.';
