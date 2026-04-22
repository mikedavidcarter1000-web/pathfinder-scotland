-- Add support/demographic flag columns to students table for support hub & prep page callouts.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS is_young_carer BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_disability BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN students.is_young_carer IS 'Student self-identifies as a young carer. Drives Young Carer Grant callout on /prep and card highlighting on /support hub.';
COMMENT ON COLUMN students.has_disability IS 'Student self-identifies as having a disability or long-term condition. Drives DSA/ILF callouts on /prep and card highlighting on /support hub.';
