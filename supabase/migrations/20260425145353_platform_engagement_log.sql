-- Authority-3: platform engagement log
-- Captures fine-grained student engagement events (page views, feature use,
-- searches, course saves, pathway actions, etc.) for downstream aggregation
-- into authority-level dashboards via materialised views. The table is
-- write-only for students (RLS); reads happen via service-role refresh of
-- the materialised views, never directly.

CREATE TABLE platform_engagement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view', 'feature_use', 'career_explore', 'course_save',
    'course_unsave', 'tool_use', 'search', 'comparison',
    'pathway_action', 'resource_view'
  )),
  event_category TEXT CHECK (event_category IN (
    'career_sector', 'career_role', 'university', 'college',
    'subject', 'tool', 'support', 'blog', 'search',
    'comparison', 'pathway', 'bursary', 'entitlement',
    'results_day', 'personal_statement'
  )),
  event_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pel_student ON platform_engagement_log(student_id);
CREATE INDEX idx_pel_school ON platform_engagement_log(school_id);
CREATE INDEX idx_pel_type ON platform_engagement_log(event_type);
CREATE INDEX idx_pel_category ON platform_engagement_log(event_category);
CREATE INDEX idx_pel_created ON platform_engagement_log(created_at);
CREATE INDEX idx_pel_school_created ON platform_engagement_log(school_id, created_at);

-- RLS: students may insert their own events; nobody may SELECT, UPDATE,
-- or DELETE through anon/authenticated contexts. School staff and LA staff
-- access aggregates via materialised views (refreshed by service role).
ALTER TABLE platform_engagement_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY pel_student_insert
  ON platform_engagement_log
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Deliberately NO SELECT / UPDATE / DELETE policies. With RLS enabled and
-- no permissive policies, all such operations are denied for non-service
-- roles. The service role bypasses RLS for materialised view refresh.

COMMENT ON TABLE platform_engagement_log IS
  'Anonymisable engagement log for LA dashboards. Students INSERT only; reads through materialised views.';
