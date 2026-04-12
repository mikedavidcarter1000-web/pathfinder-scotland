-- Results Day: add columns to track actual vs predicted grades
-- When a student updates from predicted to actual results:
--   1. Copy current grade → predicted_grade
--   2. Set grade = actual result
--   3. Set is_actual = true

ALTER TABLE student_grades ADD COLUMN IF NOT EXISTS is_actual BOOLEAN DEFAULT false;
ALTER TABLE student_grades ADD COLUMN IF NOT EXISTS predicted_grade TEXT;
