ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_home_educated BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'mainstream'
  CHECK (student_type IN ('mainstream', 'home_educated', 'part_time', 'flexible', 'alternative_provision'));
ALTER TABLE students ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS demographic_source TEXT
  CHECK (demographic_source IN ('seemis_import', 'guidance_teacher', 'self_declared', 'mixed'));
ALTER TABLE students ADD COLUMN IF NOT EXISTS demographic_updated_at TIMESTAMPTZ;
