-- Re-tag 7 pre-Round-1 roles whose ai_rating values were inconsistent with
-- the documented 1-10 rubric (docs/ai-rating-rubric.md). Scoped by title +
-- created_at = 2026-04-11 to avoid touching any Round 1 roles (those sit at
-- created_at = 2026-04-18).
--
-- Category A: data/AI analytics roles rated far too low
--   Data Scientist                 3 -> 8  (rubric anchor names data scientists at 8; description is explicit build/deploy/validate AI models)
--   Social Services Data Analyst   2 -> 7  (description: uses AI and data tools; hybrid analytical role)
--   Learning Technologist          2 -> 7  (description: evaluates, implements, trains colleagues on AI tools)
--
-- Category B: knowledge-worker roles understating current AI augmentation
--   Senior Software Developer      4 -> 6  (description matches rating 6 verbatim; Junior sits at 7 in same cohort)
--   Court Clerk                    4 -> 6  (admin portion exposed like Legal Secretary/Paralegal at 7; in-court role keeps at 6)
--   Communications Officer         4 -> 6  (peers Copywriter/Social Media Manager/Journalist all at 6)
--   Public Relations Officer       4 -> 6  (same reasoning as Communications Officer)

UPDATE career_roles
SET ai_rating = CASE title
  WHEN 'Data Scientist'                then 8
  WHEN 'Social Services Data Analyst'  then 7
  WHEN 'Learning Technologist'         then 7
  WHEN 'Senior Software Developer'     then 6
  WHEN 'Court Clerk'                   then 6
  WHEN 'Communications Officer'        then 6
  WHEN 'Public Relations Officer'      then 6
END
WHERE title IN (
  'Data Scientist',
  'Social Services Data Analyst',
  'Learning Technologist',
  'Senior Software Developer',
  'Court Clerk',
  'Communications Officer',
  'Public Relations Officer'
) AND DATE(created_at) = '2026-04-11';
