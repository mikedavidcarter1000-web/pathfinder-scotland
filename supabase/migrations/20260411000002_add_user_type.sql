-- ============================================
-- Add user_type column to students
-- Migration: 20260411000002
-- Feature: Parent-facing experience — distinguishes student vs parent accounts
-- ============================================
--
-- Adds a `user_type` discriminator to the students table so the dashboard,
-- onboarding, and navigation can render the appropriate experience for
-- parents/carers vs students.
--
-- Defaults to 'student' so every existing row keeps its current behaviour
-- without a backfill. Parent rows are inserted by the parent onboarding flow
-- with user_type = 'parent'.
--
-- Existing RLS policies on `students` are keyed on `id = auth.uid()` and
-- continue to apply unchanged — a parent and a student row are still scoped
-- to their respective auth users.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'student'
  CHECK (user_type IN ('student', 'parent'));

CREATE INDEX IF NOT EXISTS students_user_type_idx ON students (user_type);

COMMENT ON COLUMN students.user_type IS
  'Discriminator: ''student'' (default) or ''parent''. Parent rows skip grade entry and see a parent dashboard.';
