-- Personal statement drafts for logged-in students.
-- Students' draft persists across devices; anonymous users still have
-- localStorage-only drafts handled client-side.
-- School staff with can_view_individual_students can read their caseload
-- students' drafts for guidance review (e.g. S6 personal statement
-- feedback session) but cannot edit.

CREATE TABLE IF NOT EXISTS public.personal_statement_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    q1_text TEXT NOT NULL DEFAULT '',
    q2_text TEXT NOT NULL DEFAULT '',
    q3_text TEXT NOT NULL DEFAULT '',
    last_saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id)
);

COMMENT ON TABLE public.personal_statement_drafts IS 'UCAS 2026-entry personal statement drafts. One row per student. Anonymous users use localStorage; logged-in users sync to this table.';

CREATE INDEX IF NOT EXISTS idx_ps_drafts_student ON public.personal_statement_drafts (student_id);

ALTER TABLE public.personal_statement_drafts ENABLE ROW LEVEL SECURITY;

-- Students: see + manage their own draft
CREATE POLICY "ps_drafts_student_select_own" ON public.personal_statement_drafts
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "ps_drafts_student_insert_own" ON public.personal_statement_drafts
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "ps_drafts_student_update_own" ON public.personal_statement_drafts
    FOR UPDATE TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "ps_drafts_student_delete_own" ON public.personal_statement_drafts
    FOR DELETE TO authenticated
    USING (student_id = auth.uid());

-- School staff with can_view_individual_students: read-only access to
-- drafts from students at their school. Matches the access pattern used
-- by guidance notes + tracking.
CREATE POLICY "ps_drafts_guidance_staff_select" ON public.personal_statement_drafts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.school_staff ss
            JOIN public.students s ON s.id = personal_statement_drafts.student_id
            WHERE ss.user_id = auth.uid()
              AND ss.school_id = s.school_id
              AND ss.can_view_individual_students = true
        )
    );

-- last_saved_at trigger so every UPDATE bumps the timestamp without
-- client having to send it.
CREATE OR REPLACE FUNCTION public.set_personal_statement_drafts_last_saved_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_saved_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_ps_drafts_last_saved_at ON public.personal_statement_drafts;
CREATE TRIGGER tr_ps_drafts_last_saved_at
    BEFORE UPDATE ON public.personal_statement_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_personal_statement_drafts_last_saved_at();
