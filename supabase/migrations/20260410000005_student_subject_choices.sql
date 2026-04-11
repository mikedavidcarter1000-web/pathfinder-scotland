-- ============================================
-- Student Subject & Academy Choices
-- Migration: 20260410000005
-- Feature: Persist pathway planner selections for each transition
-- ============================================

-- Student's ranked subject picks for a given year-group transition.
-- rank_order captures the order the student ticked the subjects so we can
-- re-hydrate the picker in the same order next time they load the page.
CREATE TABLE student_subject_choices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  transition TEXT NOT NULL
               CHECK (transition IN ('s2_to_s3', 's3_to_s4', 's4_to_s5', 's5_to_s6')),
  rank_order INT,
  is_reserve BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, transition)
);

-- Student's 1st/2nd/3rd academy ranking (S2 → S3 only at present).
CREATE TABLE student_academy_choices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  rank_order INT NOT NULL CHECK (rank_order BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, rank_order)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_ssc_student ON student_subject_choices(student_id);
CREATE INDEX idx_sac_student ON student_academy_choices(student_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE student_subject_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_academy_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own choices"
  ON student_subject_choices FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own choices"
  ON student_subject_choices FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own choices"
  ON student_subject_choices FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Users can delete own choices"
  ON student_subject_choices FOR DELETE
  USING (auth.uid() = student_id);

CREATE POLICY "Users can read own choices"
  ON student_academy_choices FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own choices"
  ON student_academy_choices FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own choices"
  ON student_academy_choices FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Users can delete own choices"
  ON student_academy_choices FOR DELETE
  USING (auth.uid() = student_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_student_subject_choices_updated_at
  BEFORE UPDATE ON student_subject_choices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANTS
-- ============================================

GRANT ALL ON student_subject_choices TO authenticated;
GRANT ALL ON student_academy_choices TO authenticated;
