-- Per-student opt-in JSONB flags for transactional reminders (Results Day,
-- platform updates) and tip-style guidance emails. Defaults all three to
-- true for new rows; existing rows fall back to the JSONB default on first
-- UPDATE through the API. Keys read by the settings UI:
--   * results_day_reminders
--   * platform_updates
--   * tips_and_guidance

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS email_preferences JSONB
  DEFAULT '{"results_day_reminders": true, "platform_updates": true, "tips_and_guidance": true}'::jsonb;

COMMENT ON COLUMN students.email_preferences IS
  'Per-student opt-in flags for transactional (reminders) and promotional email categories. Keys: results_day_reminders, platform_updates, tips_and_guidance.';
