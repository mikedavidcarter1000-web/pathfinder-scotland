-- Personal statement: version history, feedback threads, and sharing controls.
-- Builds on top of personal_statement_drafts (one row per student, working copy).
--
-- Versions are immutable snapshots created on manual save, every 10 minutes
-- of active editing, before a feedback comment is submitted, and on restore.
-- Feedback rows can be anchored to a text range (highlight_start/end) or be
-- general comments on a question. Replies are modelled via parent_feedback_id.
-- Sharing flags on personal_statement_drafts gate which other users can read
-- the draft (RLS) and leave feedback.

-- =====================================================================
-- personal_statement_drafts: sharing controls
-- =====================================================================

ALTER TABLE public.personal_statement_drafts
  ADD COLUMN IF NOT EXISTS shared_with_school BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_with_parent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ps_drafts_school
  ON public.personal_statement_drafts (school_id) WHERE school_id IS NOT NULL;

-- The existing guidance-staff SELECT policy reads via students.school_id;
-- once shared_with_school takes effect, we tighten that policy so guidance
-- can only see drafts the student has explicitly shared. Pre-existing drafts
-- default to shared_with_school = false, which means guidance loses visibility
-- until the student opts in. The session-wide notes call this out.
DROP POLICY IF EXISTS "ps_drafts_guidance_staff_select" ON public.personal_statement_drafts;
CREATE POLICY "ps_drafts_guidance_staff_select" ON public.personal_statement_drafts
    FOR SELECT TO authenticated
    USING (
        shared_with_school = true
        AND EXISTS (
            SELECT 1
            FROM public.school_staff ss
            JOIN public.students s ON s.id = personal_statement_drafts.student_id
            WHERE ss.user_id = auth.uid()
              AND ss.school_id = s.school_id
              AND ss.can_view_individual_students = true
        )
    );

-- Parents linked to the student can read the draft only when the student has
-- ticked the "share with my parent" toggle. Mirror the parent_student_links
-- pattern used elsewhere (status = 'active').
CREATE POLICY "ps_drafts_parent_select" ON public.personal_statement_drafts
    FOR SELECT TO authenticated
    USING (
        shared_with_parent = true
        AND EXISTS (
            SELECT 1
            FROM public.parent_student_links psl
            JOIN public.parents p ON p.id = psl.parent_id
            WHERE psl.student_id = personal_statement_drafts.student_id
              AND p.user_id = auth.uid()
              AND psl.status = 'active'
        )
    );

-- =====================================================================
-- personal_statement_versions
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.personal_statement_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.personal_statement_drafts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    q1_text TEXT NOT NULL DEFAULT '',
    q2_text TEXT NOT NULL DEFAULT '',
    q3_text TEXT NOT NULL DEFAULT '',
    q1_char_count INTEGER GENERATED ALWAYS AS (char_length(COALESCE(q1_text, ''))) STORED,
    q2_char_count INTEGER GENERATED ALWAYS AS (char_length(COALESCE(q2_text, ''))) STORED,
    q3_char_count INTEGER GENERATED ALWAYS AS (char_length(COALESCE(q3_text, ''))) STORED,
    total_char_count INTEGER GENERATED ALWAYS AS (
        char_length(COALESCE(q1_text, '')) + char_length(COALESCE(q2_text, '')) + char_length(COALESCE(q3_text, ''))
    ) STORED,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    save_trigger TEXT NOT NULL DEFAULT 'auto'
        CHECK (save_trigger IN ('auto', 'manual', 'pre_feedback', 'restore')),
    UNIQUE (draft_id, version_number)
);

COMMENT ON TABLE public.personal_statement_versions IS
    'Immutable snapshot history of personal_statement_drafts. Created on manual save, every 10 minutes of active editing, before feedback, and on restore. Update/Delete denied via RLS.';

CREATE INDEX IF NOT EXISTS idx_ps_versions_draft_saved
    ON public.personal_statement_versions (draft_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_ps_versions_student
    ON public.personal_statement_versions (student_id);

ALTER TABLE public.personal_statement_versions ENABLE ROW LEVEL SECURITY;

-- SELECT: the student themselves
CREATE POLICY "ps_versions_student_select" ON public.personal_statement_versions
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

-- SELECT: school staff with can_view_individual_students, only when the
-- underlying draft has shared_with_school = true
CREATE POLICY "ps_versions_guidance_select" ON public.personal_statement_versions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.students s ON s.id = d.student_id
            JOIN public.school_staff ss ON ss.school_id = s.school_id
            WHERE d.id = personal_statement_versions.draft_id
              AND d.shared_with_school = true
              AND ss.user_id = auth.uid()
              AND ss.can_view_individual_students = true
        )
    );

-- SELECT: linked parents, only when shared_with_parent = true
CREATE POLICY "ps_versions_parent_select" ON public.personal_statement_versions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.parent_student_links psl ON psl.student_id = d.student_id
            JOIN public.parents p ON p.id = psl.parent_id
            WHERE d.id = personal_statement_versions.draft_id
              AND d.shared_with_parent = true
              AND p.user_id = auth.uid()
              AND psl.status = 'active'
        )
    );

-- INSERT: only the student (auto-save and manual save flows). The pre_feedback
-- snapshot is also written by the student-owned trigger via the API.
CREATE POLICY "ps_versions_student_insert" ON public.personal_statement_versions
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

-- UPDATE / DELETE intentionally have no policies => RLS denies by default,
-- making versions effectively immutable for all callers (RLS-bypass via the
-- service-role admin client is still possible for administrative cleanup).

-- =====================================================================
-- personal_statement_feedback
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.personal_statement_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.personal_statement_drafts(id) ON DELETE CASCADE,
    version_id UUID REFERENCES public.personal_statement_versions(id) ON DELETE SET NULL,
    question_number INTEGER NOT NULL CHECK (question_number IN (1, 2, 3)),
    author_type TEXT NOT NULL CHECK (author_type IN ('student', 'guidance', 'parent')),
    author_user_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    highlight_start INTEGER,
    highlight_end INTEGER,
    parent_feedback_id UUID REFERENCES public.personal_statement_feedback(id) ON DELETE CASCADE,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Highlight ranges only make sense as a half-open interval [start, end);
    -- end > start when present, both null = general comment.
    CHECK (
        (highlight_start IS NULL AND highlight_end IS NULL)
        OR (highlight_start IS NOT NULL AND highlight_end IS NOT NULL AND highlight_end > highlight_start)
    )
);

COMMENT ON TABLE public.personal_statement_feedback IS
    'Comment threads on personal statement drafts. author_type student | guidance | parent. Anchored comments carry highlight_start/end (half-open interval). Replies set parent_feedback_id.';

CREATE INDEX IF NOT EXISTS idx_ps_feedback_draft_question
    ON public.personal_statement_feedback (draft_id, question_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ps_feedback_thread
    ON public.personal_statement_feedback (parent_feedback_id) WHERE parent_feedback_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ps_feedback_unresolved
    ON public.personal_statement_feedback (draft_id, is_resolved) WHERE is_resolved = false;

ALTER TABLE public.personal_statement_feedback ENABLE ROW LEVEL SECURITY;

-- SELECT: the student who owns the draft, the feedback author, or any
-- principal who can see the draft (sharing-flag gated for guidance / parent).
CREATE POLICY "ps_feedback_select" ON public.personal_statement_feedback
    FOR SELECT TO authenticated
    USING (
        author_user_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.student_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.students s ON s.id = d.student_id
            JOIN public.school_staff ss ON ss.school_id = s.school_id
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.shared_with_school = true
              AND ss.user_id = auth.uid()
              AND ss.can_view_individual_students = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.parent_student_links psl ON psl.student_id = d.student_id
            JOIN public.parents p ON p.id = psl.parent_id
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.shared_with_parent = true
              AND p.user_id = auth.uid()
              AND psl.status = 'active'
        )
    );

-- INSERT: students on their own draft; guidance staff (when shared_with_school);
-- linked parents (when shared_with_parent). author_user_id must equal auth.uid()
-- to prevent forgery; the API route fills author_type / author_name.
CREATE POLICY "ps_feedback_insert_student" ON public.personal_statement_feedback
    FOR INSERT TO authenticated
    WITH CHECK (
        author_user_id = auth.uid()
        AND author_type = 'student'
        AND EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.student_id = auth.uid()
        )
    );

CREATE POLICY "ps_feedback_insert_guidance" ON public.personal_statement_feedback
    FOR INSERT TO authenticated
    WITH CHECK (
        author_user_id = auth.uid()
        AND author_type = 'guidance'
        AND EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.students s ON s.id = d.student_id
            JOIN public.school_staff ss ON ss.school_id = s.school_id
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.shared_with_school = true
              AND ss.user_id = auth.uid()
              AND ss.can_view_individual_students = true
        )
    );

CREATE POLICY "ps_feedback_insert_parent" ON public.personal_statement_feedback
    FOR INSERT TO authenticated
    WITH CHECK (
        author_user_id = auth.uid()
        AND author_type = 'parent'
        AND EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.parent_student_links psl ON psl.student_id = d.student_id
            JOIN public.parents p ON p.id = psl.parent_id
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.shared_with_parent = true
              AND p.user_id = auth.uid()
              AND psl.status = 'active'
        )
    );

-- UPDATE: the original author can edit their own comment within 10 minutes
-- of creation, OR the student can flip is_resolved on any comment on their
-- own draft. The 10-minute window is enforced at the API layer (the policy
-- only enforces author identity / draft ownership; a malicious client could
-- otherwise update old comments).
CREATE POLICY "ps_feedback_update_author" ON public.personal_statement_feedback
    FOR UPDATE TO authenticated
    USING (author_user_id = auth.uid())
    WITH CHECK (author_user_id = auth.uid());

CREATE POLICY "ps_feedback_update_student_resolve" ON public.personal_statement_feedback
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.student_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            WHERE d.id = personal_statement_feedback.draft_id
              AND d.student_id = auth.uid()
        )
    );

-- DELETE: the author within 10 minutes (enforced at API) OR a school admin
-- on a comment attached to a draft for a student at their school.
CREATE POLICY "ps_feedback_delete_author" ON public.personal_statement_feedback
    FOR DELETE TO authenticated
    USING (author_user_id = auth.uid());

CREATE POLICY "ps_feedback_delete_school_admin" ON public.personal_statement_feedback
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.personal_statement_drafts d
            JOIN public.students s ON s.id = d.student_id
            JOIN public.school_staff ss ON ss.school_id = s.school_id
            WHERE d.id = personal_statement_feedback.draft_id
              AND ss.user_id = auth.uid()
              AND ss.is_school_admin = true
        )
    );

-- =====================================================================
-- school_notifications: extend CHECK constraint to add 'ps_feedback'
-- =====================================================================

ALTER TABLE public.school_notifications
    DROP CONSTRAINT IF EXISTS school_notifications_notification_type_check;

ALTER TABLE public.school_notifications
    ADD CONSTRAINT school_notifications_notification_type_check
    CHECK (notification_type IN (
        'choice_deadline', 'tracking_deadline', 'report_ready',
        'parent_evening_reminder', 'intervention_followup',
        'safeguarding_escalation', 'asn_review_due',
        'results_available', 'booking_confirmation',
        'attendance_alert', 'bursary_reminder', 'ps_feedback', 'custom'
    ));
