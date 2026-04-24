-- Schools-6b: school_notifications
--
-- Per-school notification ledger with recipient targeting by role, staff id,
-- student id, or parent id. Channel can be in_app, email, or both. Read state
-- is tracked as a JSONB array of auth user ids appended when each viewer
-- acknowledges.
--
-- RLS is intentionally broad for staff (all school notifications visible to
-- staff at the school) and narrow for students / parents (only rows whose
-- targeting array contains their id). Filtering by target_role /
-- target_staff_ids is handled at the API layer to avoid JSONB membership
-- checks in every SELECT; see docs/session-learnings.md for rationale.

CREATE TABLE IF NOT EXISTS school_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'choice_deadline', 'tracking_deadline', 'report_ready',
    'parent_evening_reminder', 'intervention_followup',
    'safeguarding_escalation', 'asn_review_due',
    'results_available', 'booking_confirmation',
    'attendance_alert', 'bursary_reminder', 'custom'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_role TEXT,
  target_staff_ids JSONB,
  target_student_ids JSONB,
  target_parent_ids JSONB,
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'both')),
  send_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_by JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes to keep the notification-bell poll cheap even at thousands of
-- rows per school. The (school_id, created_at DESC) pair serves the
-- default "most recent 20" fetch; the type filter supports tab switching
-- on the full notifications page.
CREATE INDEX IF NOT EXISTS idx_school_notifications_school_created
  ON school_notifications (school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_school_notifications_type
  ON school_notifications (school_id, notification_type);

ALTER TABLE school_notifications ENABLE ROW LEVEL SECURITY;

-- Staff at the school see every row for their school. The UI filters by
-- target_role / target_staff_ids after fetch; this keeps the RLS
-- expression simple and avoids jsonb membership checks on every row.
-- Revisit when schools exceed ~10,000 notifications; at that scale a
-- narrower predicate becomes worthwhile.
CREATE POLICY "Staff see school notifications" ON school_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff
      WHERE user_id = auth.uid() AND school_id = school_notifications.school_id
    )
  );

-- Students see notifications that explicitly target their student id.
CREATE POLICY "Students see targeted notifications" ON school_notifications
  FOR SELECT USING (
    target_student_ids IS NOT NULL AND EXISTS (
      SELECT 1 FROM students
      WHERE id = auth.uid()
        AND id::TEXT IN (
          SELECT jsonb_array_elements_text(target_student_ids)
        )
    )
  );

-- Parents see notifications that explicitly target their parent id.
CREATE POLICY "Parents see targeted notifications" ON school_notifications
  FOR SELECT USING (
    target_parent_ids IS NOT NULL AND EXISTS (
      SELECT 1 FROM parents
      WHERE user_id = auth.uid()
        AND id::TEXT IN (
          SELECT jsonb_array_elements_text(target_parent_ids)
        )
    )
  );

-- Staff at the school can insert notifications for their school.
CREATE POLICY "Staff create notifications" ON school_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff
      WHERE user_id = auth.uid() AND school_id = school_notifications.school_id
    )
  );

-- Any authenticated user can UPDATE to append their id to read_by. The
-- application is responsible for not mutating other columns via this
-- verb. Rows are append-on-read in spirit; destructive edits flow through
-- admin delete.
CREATE POLICY "Users mark notifications read" ON school_notifications
  FOR UPDATE USING (true);

-- Only school admins can delete.
CREATE POLICY "Admins delete notifications" ON school_notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff
      WHERE user_id = auth.uid()
        AND school_id = school_notifications.school_id
        AND is_school_admin = true
    )
  );
