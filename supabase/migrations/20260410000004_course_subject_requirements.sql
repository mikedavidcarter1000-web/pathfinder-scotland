-- ============================================
-- Course ↔ Subject relational link
-- Migration: 20260410000004
-- Feature: Normalise courses.subject_area + add course_subject_requirements
--          junction table so the pathway planner and subject pages can
--          accurately answer "pick these subjects → qualify for these courses".
-- ============================================

-- ============================================
-- PART 1: Normalise courses.subject_area
-- ============================================
-- Canonicalise to match the subjects master list where there is a clean
-- semantic overlap. Other subject_area values (Medicine, Law, Nursing, etc.)
-- are kept as-is because they are university-level groupings with no direct
-- school-subject equivalent.

UPDATE courses SET subject_area = 'Business Management'
 WHERE subject_area IN ('Business', 'Business & Management', 'Business/Management');

UPDATE courses SET subject_area = 'Computing Science'
 WHERE subject_area IN ('Computer Science', 'Computing', 'Computer Studies');

UPDATE courses SET subject_area = 'Media Studies'
 WHERE subject_area IN ('Media', 'Media & Communication');

UPDATE courses SET subject_area = 'Sport and Fitness'
 WHERE subject_area IN ('Sport', 'Sports Science', 'Sport & Exercise');

UPDATE courses SET subject_area = 'Travel and Tourism'
 WHERE subject_area IN ('Tourism', 'Travel & Tourism');

UPDATE courses SET subject_area = 'Art and Design'
 WHERE subject_area IN ('Art & Design', 'Art', 'Art and design');

-- ============================================
-- PART 2: course_subject_requirements junction table
-- ============================================

CREATE TABLE IF NOT EXISTS course_subject_requirements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  subject_id          UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  qualification_level TEXT NOT NULL
                        CHECK (qualification_level IN ('n5', 'higher', 'adv_higher')),
  min_grade           TEXT,
  is_mandatory        BOOLEAN DEFAULT true,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (course_id, subject_id, qualification_level)
);

ALTER TABLE course_subject_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON course_subject_requirements;
CREATE POLICY "Public read access" ON course_subject_requirements
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_csr_course  ON course_subject_requirements(course_id);
CREATE INDEX IF NOT EXISTS idx_csr_subject ON course_subject_requirements(subject_id);

GRANT SELECT ON course_subject_requirements TO anon, authenticated;
