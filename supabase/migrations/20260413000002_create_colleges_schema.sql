-- ============================================
-- COLLEGES AND COLLEGE ARTICULATION SCHEMA
-- Pathfinder Scotland - Scottish FE Colleges
-- ============================================

-- ============================================
-- COLLEGES TABLE
-- ============================================
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  postcode TEXT,
  website_url TEXT NOT NULL,
  campuses JSONB DEFAULT '[]',
  course_areas TEXT[] DEFAULT '{}',
  has_swap BOOLEAN DEFAULT false,
  swap_hub TEXT CHECK (swap_hub IN ('east', 'west') OR swap_hub IS NULL),
  has_foundation_apprenticeships BOOLEAN DEFAULT true,
  fa_frameworks TEXT[] DEFAULT '{}',
  has_modern_apprenticeships BOOLEAN DEFAULT false,
  ma_frameworks TEXT[] DEFAULT '{}',
  uhi_partner BOOLEAN DEFAULT false,
  schools_programme BOOLEAN DEFAULT false,
  schools_programme_details TEXT,
  student_count INT,
  distinctive_features TEXT,
  description TEXT,
  qualification_levels TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON colleges FOR SELECT USING (true);
CREATE INDEX idx_colleges_region ON colleges(region);
CREATE INDEX idx_colleges_name ON colleges(name);
CREATE INDEX idx_colleges_uhi ON colleges(uhi_partner);

-- ============================================
-- COLLEGE ARTICULATION TABLE
-- ============================================
CREATE TABLE college_articulation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  college_qualification TEXT NOT NULL,
  college_scqf_level INT NOT NULL CHECK (college_scqf_level BETWEEN 4 AND 9),
  university_degree TEXT NOT NULL,
  entry_year INT NOT NULL CHECK (entry_year BETWEEN 1 AND 4),
  is_widening_participation BOOLEAN DEFAULT false,
  wp_eligibility TEXT,
  graded_unit_requirement TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, university_id, college_qualification, university_degree)
);

ALTER TABLE college_articulation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON college_articulation FOR SELECT USING (true);
CREATE INDEX idx_ca_college ON college_articulation(college_id);
CREATE INDEX idx_ca_university ON college_articulation(university_id);
CREATE INDEX idx_ca_wp ON college_articulation(is_widening_participation);
