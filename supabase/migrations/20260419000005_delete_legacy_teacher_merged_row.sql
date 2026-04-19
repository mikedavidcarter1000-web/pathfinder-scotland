-- Delete legacy merged "Teacher (Primary/Secondary)" row.
-- Replaced by separate Primary Teacher (SOC 2314) and Secondary Teacher (SOC 2313)
-- rows seeded in migration 20260419000004_seed_batch1_career_roles.sql.
DELETE FROM career_roles
WHERE id = 'b3c4d46b-ea4f-40d0-b709-761731f70dc5'
  AND title = 'Teacher (Primary/Secondary)';
