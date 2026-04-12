-- Benefit deadline reminders
--
-- Stores scheduled email reminders for student benefits with upcoming
-- application deadlines. Reminders are auto-generated when a student views
-- the benefits page, completes onboarding, or updates their funding profile.

-- ============================================================================
-- Table: benefit_reminders
-- ============================================================================

CREATE TABLE benefit_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  benefit_id UUID REFERENCES student_benefits(id) ON DELETE CASCADE NOT NULL,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, benefit_id, reminder_date)
);

ALTER TABLE benefit_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders"
  ON benefit_reminders FOR ALL
  USING (auth.uid() = student_id);

CREATE INDEX idx_br_student ON benefit_reminders(student_id);
CREATE INDEX idx_br_date ON benefit_reminders(reminder_date);
CREATE INDEX idx_br_unsent ON benefit_reminders(is_sent, reminder_date);

-- ============================================================================
-- Notification preferences on students
-- ============================================================================

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS email_reminders_enabled BOOLEAN DEFAULT true;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS reminder_frequency TEXT DEFAULT '30_and_7'
  CHECK (reminder_frequency IN ('30_and_7', '30_only', '7_only', 'none'));
