-- ============================================
-- Subject Pathway & Curriculum Planning Tables
-- Migration: 20260410000002
-- Feature: School curriculum layer — subject choices, progressions, career links
-- ============================================

-- ============================================
-- PART 1: CURRICULAR AREAS (CfE framework)
-- ============================================

CREATE TABLE curricular_areas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT UNIQUE NOT NULL,
  display_order INT NOT NULL
);

-- Seed: 8 official CfE curricular areas (Scottish Government framework)
INSERT INTO curricular_areas (name, display_order) VALUES
  ('Languages',                        1),  -- includes English, Modern Languages, Gàidhlig
  ('Mathematics',                      2),  -- includes Numeracy
  ('Sciences',                         3),
  ('Social Studies',                   4),  -- includes History, Geography, Modern Studies
  ('Expressive Arts',                  5),  -- Art, Drama, Music, Dance
  ('Technologies',                     6),  -- includes Computing, Engineering, Home Economics
  ('Religious and Moral Education',    7),
  ('Health and Wellbeing',             8);  -- includes PE, PSE, Food & Health

-- ============================================
-- PART 2: SUBJECTS (SQA master subject list)
-- ============================================

-- Master reference for all SQA qualifications across Scotland.
-- typical_availability: school = delivered by the school itself;
--   college_partnership = school-college link course;
--   consortia = cross-school consortium offering;
--   online = delivered online (e.g. SQA Academy, Scholar).

CREATE TABLE subjects (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  curricular_area_id     UUID REFERENCES curricular_areas(id),
  description            TEXT,            -- What the course covers (student-facing)
  why_choose             TEXT,            -- Why a student would pick this subject
  assessment_type        TEXT,            -- e.g. 'Exam + coursework', 'Portfolio only'
  is_available_n3        BOOLEAN DEFAULT false,
  is_available_n4        BOOLEAN DEFAULT false,
  is_available_n5        BOOLEAN DEFAULT false,
  is_available_higher    BOOLEAN DEFAULT false,
  is_available_adv_higher BOOLEAN DEFAULT false,
  is_npa                 BOOLEAN DEFAULT false,   -- National Progression Award
  is_academy             BOOLEAN DEFAULT false,   -- Academy / enrichment programme
  sqa_course_code        TEXT,            -- SQA official course code (e.g. C700 76)
  skills_tags            TEXT[],          -- Free-text skill tags for search/matching
  typical_availability   TEXT DEFAULT 'school'
                           CHECK (typical_availability IN
                             ('school', 'college_partnership', 'consortia', 'online')),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- ============================================
-- PART 3: SUBJECT PROGRESSIONS
-- ============================================

-- Maps how subjects connect across qualification levels.
-- Supports same-subject progression (N5 Maths → Higher Maths)
-- and cross-subject progression (N5 Physics → Higher Engineering Science).
-- from_level 'bge' = Broad General Education (S1–S3, no formal SQA level).

CREATE TABLE subject_progressions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  to_subject_id   UUID REFERENCES subjects(id) ON DELETE CASCADE,
  from_level      TEXT NOT NULL
                    CHECK (from_level IN ('bge', 'n3', 'n4', 'n5', 'higher', 'adv_higher')),
  to_level        TEXT NOT NULL
                    CHECK (to_level IN ('n3', 'n4', 'n5', 'higher', 'adv_higher')),
  min_grade       TEXT,          -- Minimum grade to attempt the next level (e.g. 'C')
  recommended_grade TEXT,        -- School-recommended grade (e.g. 'B', 'A')
  notes           TEXT,          -- e.g. 'Interview required', 'Portfolio assessed at entry'
  UNIQUE(from_subject_id, to_subject_id, from_level, to_level)
);

-- ============================================
-- PART 4: COURSE CHOICE RULES
-- ============================================

-- Generic rules for each year-group transition.
-- is_generic = true means the rule applies to all schools (default).
-- school_id allows school-specific overrides (future use).

CREATE TABLE course_choice_rules (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transition           TEXT NOT NULL
                         CHECK (transition IN ('s2_to_s3', 's3_to_s4', 's4_to_s5', 's5_to_s6')),
  total_subjects       INT NOT NULL,      -- Total number of subjects studied in the year
  compulsory_subjects  TEXT[] DEFAULT '{}', -- Subject names that are mandatory (all schools)
  num_free_choices     INT NOT NULL,      -- How many subjects the student freely picks
  num_reserves         INT DEFAULT 1,     -- Number of reserve/backup choices
  non_examined_core    TEXT[] DEFAULT '{}', -- Non-examined subjects (e.g. PSE, PE in BGE)
  breadth_requirements TEXT,             -- Free-text description of breadth rules
  special_rules        TEXT[],           -- e.g. 'Foundation Apprenticeship counts as 2 subjects'
  is_generic           BOOLEAN DEFAULT true,
  school_id            UUID,             -- NULL = applies to all schools; set for school override
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: Generic Scottish secondary school course choice rules.
-- Based on typical CfE practice; individual schools vary.
INSERT INTO course_choice_rules
  (transition, total_subjects, compulsory_subjects, num_free_choices,
   num_reserves, non_examined_core, breadth_requirements, special_rules, is_generic)
VALUES
  (
    's2_to_s3',
    8,
    ARRAY['English', 'Mathematics'],
    6,
    1,
    ARRAY['Religious and Moral Education', 'Physical Education', 'Personal and Social Education'],
    'Choices should span at least 4 of the 8 CfE curricular areas',
    ARRAY['A language (other than English) is strongly recommended'],
    true
  ),
  (
    's3_to_s4',
    7,
    ARRAY['English', 'Mathematics'],
    5,
    1,
    ARRAY[],
    'Students typically choose 7 subjects for National 4 or National 5; breadth expected across sciences, humanities, and a creative/technical subject',
    ARRAY[
      'National 4 does not require a SQA exam — assessed by the school',
      'National 5 includes an externally marked exam component'
    ],
    true
  ),
  (
    's4_to_s5',
    5,
    ARRAY[],
    5,
    1,
    ARRAY[],
    'Students typically sit 4–6 Highers; universities usually look for 5 Highers for competitive courses',
    ARRAY[
      'A minimum of grade C at National 5 is usually required to attempt Higher in the same subject',
      'Grade B or above recommended by most schools',
      'Foundation Apprenticeships count as 1 Higher equivalent'
    ],
    true
  ),
  (
    's5_to_s6',
    4,
    ARRAY[],
    4,
    1,
    ARRAY[],
    'Students typically take 2–3 Advanced Highers alongside additional Highers or specialist study; focus on areas relevant to university application',
    ARRAY[
      'Advanced Higher requires a grade B or above at Higher in the same or closely related subject',
      'Some universities require specific Advanced Highers (e.g. Medicine, Law)',
      'Students may add new Highers not studied at S5'
    ],
    true
  );

-- ============================================
-- PART 5: CAREER SECTORS
-- ============================================

CREATE TABLE career_sectors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  description   TEXT,
  display_order INT
);

-- Junction table linking subjects to career sectors with relevance weighting.
-- 'essential'    = subject is a direct prerequisite for careers in this sector
-- 'recommended'  = subject is strongly advisable but not required
-- 'related'      = subject supports skills used in this sector

CREATE TABLE subject_career_sectors (
  subject_id       UUID REFERENCES subjects(id) ON DELETE CASCADE,
  career_sector_id UUID REFERENCES career_sectors(id) ON DELETE CASCADE,
  relevance        TEXT DEFAULT 'related'
                     CHECK (relevance IN ('essential', 'recommended', 'related')),
  PRIMARY KEY (subject_id, career_sector_id)
);

-- ============================================
-- PART 6: INDEXES
-- ============================================

-- subjects
CREATE INDEX idx_subjects_curricular_area_id    ON subjects(curricular_area_id);
CREATE INDEX idx_subjects_name                  ON subjects(name);

-- subject_progressions
CREATE INDEX idx_subj_prog_from_subject_id      ON subject_progressions(from_subject_id);
CREATE INDEX idx_subj_prog_to_subject_id        ON subject_progressions(to_subject_id);

-- course_choice_rules
CREATE INDEX idx_course_choice_rules_transition ON course_choice_rules(transition);

-- subject_career_sectors
CREATE INDEX idx_subj_career_career_sector_id   ON subject_career_sectors(career_sector_id);

-- ============================================
-- PART 7: ROW LEVEL SECURITY
-- ============================================

-- All new tables are reference data: public read, service_role write only.

ALTER TABLE curricular_areas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects                ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_progressions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_choice_rules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_sectors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_career_sectors  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON curricular_areas
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON subject_progressions
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON course_choice_rules
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON career_sectors
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON subject_career_sectors
  FOR SELECT USING (true);

-- ============================================
-- PART 8: UPDATE student_grades
-- ============================================

-- Add nullable FK to subjects for gradual migration from free-text subject names.
-- Existing rows keep free-text subject column; new entries can reference the master list.
ALTER TABLE student_grades
  ADD COLUMN subject_id UUID REFERENCES subjects(id);

CREATE INDEX idx_student_grades_subject_id ON student_grades(subject_id);

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT ON curricular_areas       TO anon, authenticated;
GRANT SELECT ON subjects               TO anon, authenticated;
GRANT SELECT ON subject_progressions   TO anon, authenticated;
GRANT SELECT ON course_choice_rules    TO anon, authenticated;
GRANT SELECT ON career_sectors         TO anon, authenticated;
GRANT SELECT ON subject_career_sectors TO anon, authenticated;
