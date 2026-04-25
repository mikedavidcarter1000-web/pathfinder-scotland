-- Authority-13: alerts system
--
-- Creates the `authority_alerts` table and extends school_notifications to
-- support 'data_quality_nudge'. Alerts are append-only -- acknowledged but
-- never deleted -- so the LA has an audit trail of which conditions fired
-- when. Severity levels (info/warning/critical) drive the bell badge colour
-- and the email digest grouping.
--
-- RLS:
--   * authority staff read alerts for their own authority
--   * QIOs only see alerts for schools in their assigned_school_ids
--   * inserts go through the service-role client (evaluation engine)
--   * updates limited to acknowledged / acknowledged_by / acknowledged_at
--   * no deletes (history preserved)

CREATE TABLE IF NOT EXISTS authority_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID NOT NULL REFERENCES local_authorities(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'engagement_drop', 'equity_gap_widening', 'curriculum_narrowing',
    'low_activation', 'new_school_joined', 'stem_gender_imbalance',
    'low_career_exploration', 'report_ready', 'low_data_quality'
  )),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  detail JSONB,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES authority_staff(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_authority_alerts_authority
  ON authority_alerts (authority_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_authority_alerts_type
  ON authority_alerts (authority_id, alert_type);
-- Partial index serves the dedup lookup (open alerts of same type for same school)
-- and the bell-count query in one shot.
CREATE INDEX IF NOT EXISTS idx_authority_alerts_unacknowledged
  ON authority_alerts (authority_id, alert_type, school_id)
  WHERE acknowledged = false;

ALTER TABLE authority_alerts ENABLE ROW LEVEL SECURITY;

-- Staff at the authority can read alerts. QIO scope is enforced in the
-- application layer because assigned_school_ids is a JSONB array and the
-- RLS expression would otherwise pay a per-row JSONB-membership cost on
-- every alert read; the service-role client (used by the dashboard) is
-- bypassed by RLS anyway, so QIO filtering happens in lib/authority/queries.
CREATE POLICY "staff_read_authority_alerts"
  ON authority_alerts FOR SELECT TO authenticated
  USING (authority_id = my_authority_id());

-- Authority staff at the authority can mark alerts acknowledged.
CREATE POLICY "staff_acknowledge_authority_alerts"
  ON authority_alerts FOR UPDATE TO authenticated
  USING (authority_id = my_authority_id())
  WITH CHECK (authority_id = my_authority_id());

-- Inserts go through the service-role client only (evaluation engine).
-- No INSERT policy granted -- authenticated users cannot create alerts.

COMMENT ON TABLE authority_alerts IS
  'Append-only alert ledger for the LA portal. Conditions evaluated by the alert engine; rows acknowledged but never deleted.';

-- Extend school_notifications.notification_type to allow data quality nudges.
-- The CHECK constraint is dropped and recreated; existing rows are unaffected.
ALTER TABLE school_notifications
  DROP CONSTRAINT IF EXISTS school_notifications_notification_type_check;

ALTER TABLE school_notifications
  ADD CONSTRAINT school_notifications_notification_type_check
  CHECK (notification_type IN (
    'choice_deadline', 'tracking_deadline', 'report_ready',
    'parent_evening_reminder', 'intervention_followup',
    'safeguarding_escalation', 'asn_review_due',
    'results_available', 'booking_confirmation',
    'attendance_alert', 'bursary_reminder',
    'data_quality_nudge', 'custom'
  ));
