-- ============================================
-- Parent accounts with invite-code linking
-- Migration: 20260420000002
-- Feature: Task 15 - dedicated parent profiles, invite-code linking to
--          one or more student accounts, read-only parent access to
--          non-sensitive child data with GDPR-safe column whitelist.
-- ============================================
--
-- Design:
--  * Parents live in a dedicated `parents` table (NOT students with user_type='parent').
--    Existing students.user_type stays for backwards-compat with legacy rows.
--  * `parent_student_links` is the join table. A student-initiated INSERT
--    creates a pending row with an invite_code + 48h expiry but no parent_id.
--    Redemption (by the parent) UPDATEs the row to set parent_id + status=active.
--  * Parents get read-only access to saved_courses, student_grades,
--    student_offers, quiz_results via permissive SELECT policies that call
--    `is_linked_parent(student_id)`.
--  * Parents do NOT get a direct RLS policy on `students` — that row contains
--    GDPR special-category demographics. Instead, `get_linked_children()` is a
--    SECURITY DEFINER function that whitelists only safe columns.

-- ==========================================================================
-- Tables
-- ==========================================================================

CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  -- Optional postcode so a parent can see widening-access hints before
  -- they've linked to a child. Safe to store; not a GDPR special category.
  postcode TEXT,
  simd_decile INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS parents_user_id_idx ON parents (user_id);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can view own profile" ON parents;
CREATE POLICY "Parents can view own profile" ON parents
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Parents can insert own profile" ON parents;
CREATE POLICY "Parents can insert own profile" ON parents
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Parents can update own profile" ON parents;
CREATE POLICY "Parents can update own profile" ON parents
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Parents can delete own profile" ON parents;
CREATE POLICY "Parents can delete own profile" ON parents
  FOR DELETE USING (user_id = auth.uid());


CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked')),
  invite_code TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique (parent_id, student_id) but only when parent_id is set — we insert
-- pending rows with NULL parent_id before redemption.
CREATE UNIQUE INDEX IF NOT EXISTS parent_student_links_parent_student_uniq
  ON parent_student_links (parent_id, student_id)
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS parent_student_links_student_idx
  ON parent_student_links (student_id);
CREATE INDEX IF NOT EXISTS parent_student_links_invite_idx
  ON parent_student_links (invite_code)
  WHERE invite_code IS NOT NULL AND status = 'pending';

ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

-- Parent can see rows where parent_id matches their parent profile.
DROP POLICY IF EXISTS "Parents see own links" ON parent_student_links;
CREATE POLICY "Parents see own links" ON parent_student_links
  FOR SELECT USING (
    parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  );

-- Student sees pending codes they generated, plus active links to them.
DROP POLICY IF EXISTS "Students see links to them" ON parent_student_links;
CREATE POLICY "Students see links to them" ON parent_student_links
  FOR SELECT USING (student_id = auth.uid());

-- Student creates a pending invite for themselves.
DROP POLICY IF EXISTS "Students can create invites" ON parent_student_links;
CREATE POLICY "Students can create invites" ON parent_student_links
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND parent_id IS NULL AND status = 'pending'
  );

-- Student can revoke/delete links to them.
DROP POLICY IF EXISTS "Students can update their links" ON parent_student_links;
CREATE POLICY "Students can update their links" ON parent_student_links
  FOR UPDATE USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete their links" ON parent_student_links;
CREATE POLICY "Students can delete their links" ON parent_student_links
  FOR DELETE USING (student_id = auth.uid());

-- Parent can update a pending row while redeeming (the SECURITY DEFINER
-- function does the heavy lifting, but we keep a policy for safety).
DROP POLICY IF EXISTS "Parents can redeem pending links" ON parent_student_links;
CREATE POLICY "Parents can redeem pending links" ON parent_student_links
  FOR UPDATE USING (
    parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  );

-- ==========================================================================
-- Helper: is the current user a parent linked to this student?
-- ==========================================================================

CREATE OR REPLACE FUNCTION is_linked_parent(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM parent_student_links psl
    JOIN parents p ON p.id = psl.parent_id
    WHERE p.user_id = auth.uid()
      AND psl.student_id = p_student_id
      AND psl.status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION is_linked_parent(UUID) TO authenticated;

-- ==========================================================================
-- Cross-table read-only policies for linked parents
-- ==========================================================================
-- PostgreSQL evaluates RLS policies per-operation as OR of permissive policies.
-- Adding these SELECT policies grants parents read access without affecting
-- the existing student self-access policies.

DROP POLICY IF EXISTS "Linked parents read saved courses" ON saved_courses;
CREATE POLICY "Linked parents read saved courses" ON saved_courses
  FOR SELECT USING (is_linked_parent(student_id));

DROP POLICY IF EXISTS "Linked parents read grades" ON student_grades;
CREATE POLICY "Linked parents read grades" ON student_grades
  FOR SELECT USING (is_linked_parent(student_id));

DROP POLICY IF EXISTS "Linked parents read offers" ON student_offers;
CREATE POLICY "Linked parents read offers" ON student_offers
  FOR SELECT USING (is_linked_parent(student_id));

DROP POLICY IF EXISTS "Linked parents read quiz results" ON quiz_results;
CREATE POLICY "Linked parents read quiz results" ON quiz_results
  FOR SELECT USING (is_linked_parent(student_id));

-- ==========================================================================
-- get_linked_children() - GDPR-safe whitelist of child profile columns
-- ==========================================================================
-- Parents must NOT see disability, care experience, carer status, estranged
-- status, refugee status, household income or any other special-category
-- demographic. This function returns only basic identity + school stage.

CREATE OR REPLACE FUNCTION get_linked_children()
RETURNS TABLE (
  link_id UUID,
  student_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  school_stage TEXT,
  school_name TEXT,
  postcode TEXT,
  simd_decile INTEGER,
  linked_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    psl.id AS link_id,
    s.id AS student_id,
    s.first_name,
    s.last_name,
    s.email,
    s.school_stage::TEXT,
    s.school_name,
    s.postcode,
    s.simd_decile,
    psl.linked_at
  FROM parent_student_links psl
  JOIN parents p ON p.id = psl.parent_id
  JOIN students s ON s.id = psl.student_id
  WHERE p.user_id = auth.uid()
    AND psl.status = 'active'
  ORDER BY psl.linked_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_linked_children() TO authenticated;

-- ==========================================================================
-- get_linked_parents() - parents currently linked to the calling student
-- ==========================================================================

CREATE OR REPLACE FUNCTION get_linked_parents()
RETURNS TABLE (
  link_id UUID,
  parent_id UUID,
  full_name TEXT,
  email TEXT,
  linked_at TIMESTAMPTZ,
  status TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT psl.id, p.id, p.full_name, p.email, psl.linked_at, psl.status
  FROM parent_student_links psl
  JOIN parents p ON p.id = psl.parent_id
  WHERE psl.student_id = auth.uid()
    AND psl.status IN ('active')
  ORDER BY psl.linked_at DESC NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION get_linked_parents() TO authenticated;

-- ==========================================================================
-- generate_parent_invite_code() - student-only, creates pending link
-- ==========================================================================
-- Returns an 8-char code in XXXX-XXXX format with unambiguous alphabet
-- (no 0/O/I/1). 48-hour expiry. One active pending invite per student.

CREATE OR REPLACE FUNCTION generate_parent_invite_code()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_alphabet TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code TEXT;
  v_student_id UUID := auth.uid();
  v_attempts INT := 0;
  i INT;
  v_part TEXT;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  -- Caller must be a real student (not a parent row misusing the function).
  IF NOT EXISTS (SELECT 1 FROM students WHERE id = v_student_id) THEN
    RAISE EXCEPTION 'Only students can generate invite codes' USING ERRCODE = '42501';
  END IF;

  -- Expire any of this student's existing pending codes older than their
  -- expires_at — keeps the table tidy.
  UPDATE parent_student_links
    SET status = 'revoked', revoked_at = NOW()
    WHERE student_id = v_student_id
      AND status = 'pending'
      AND expires_at IS NOT NULL
      AND expires_at <= NOW();

  LOOP
    v_attempts := v_attempts + 1;
    v_code := '';
    -- 8 chars split XXXX-XXXX
    FOR i IN 1..8 LOOP
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    END LOOP;
    v_part := substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4);

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM parent_student_links WHERE invite_code = v_part
    );
    IF v_attempts > 5 THEN
      RAISE EXCEPTION 'Failed to generate unique invite code' USING ERRCODE = 'P0001';
    END IF;
  END LOOP;

  INSERT INTO parent_student_links
    (student_id, invite_code, status, expires_at)
  VALUES
    (v_student_id, v_part, 'pending', NOW() + INTERVAL '48 hours');

  RETURN v_part;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_parent_invite_code() TO authenticated;

-- ==========================================================================
-- redeem_parent_invite_code() - parent-only, activates a pending link
-- ==========================================================================

CREATE OR REPLACE FUNCTION redeem_parent_invite_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_parent_id UUID;
  v_parent_name TEXT;
  v_parent_email TEXT;
  v_link_id UUID;
  v_student_id UUID;
  v_student_first TEXT;
  v_student_last TEXT;
  v_student_email TEXT;
  v_normalised TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT id, full_name, email
    INTO v_parent_id, v_parent_name, v_parent_email
    FROM parents WHERE user_id = v_user_id;

  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'You must have a parent profile to redeem an invite code'
      USING ERRCODE = '42501';
  END IF;

  -- Accept case-insensitive, allow with or without dash
  v_normalised := UPPER(REGEXP_REPLACE(COALESCE(p_code, ''), '[^A-Z0-9]', '', 'g'));
  IF length(v_normalised) <> 8 THEN
    RAISE EXCEPTION 'Invalid invite code format' USING ERRCODE = '22023';
  END IF;
  v_normalised := substr(v_normalised, 1, 4) || '-' || substr(v_normalised, 5, 4);

  -- Lock the row while we redeem
  SELECT id, student_id INTO v_link_id, v_student_id
    FROM parent_student_links
    WHERE invite_code = v_normalised
      AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > NOW())
    FOR UPDATE;

  IF v_link_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code' USING ERRCODE = 'P0002';
  END IF;

  -- Reject duplicate active link (parent already linked to this student).
  IF EXISTS (
    SELECT 1 FROM parent_student_links
    WHERE parent_id = v_parent_id
      AND student_id = v_student_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'You are already linked to this student' USING ERRCODE = 'P0003';
  END IF;

  UPDATE parent_student_links
    SET parent_id = v_parent_id,
        status = 'active',
        linked_at = NOW(),
        invite_code = NULL  -- code is single-use; free the unique constraint
    WHERE id = v_link_id;

  SELECT first_name, last_name, email
    INTO v_student_first, v_student_last, v_student_email
    FROM students WHERE id = v_student_id;

  RETURN jsonb_build_object(
    'link_id', v_link_id,
    'student_id', v_student_id,
    'student_first_name', v_student_first,
    'student_last_name', v_student_last,
    'student_email', v_student_email,
    'parent_id', v_parent_id,
    'parent_name', v_parent_name,
    'parent_email', v_parent_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_parent_invite_code(TEXT) TO authenticated;

-- ==========================================================================
-- revoke_parent_link() - student-only, terminates a link
-- ==========================================================================

CREATE OR REPLACE FUNCTION revoke_parent_link(p_link_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_updated INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  UPDATE parent_student_links
    SET status = 'revoked', revoked_at = NOW()
    WHERE id = p_link_id
      AND student_id = v_user_id
      AND status IN ('active', 'pending');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RAISE EXCEPTION 'Link not found or not yours to revoke' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION revoke_parent_link(UUID) TO authenticated;

-- ==========================================================================
-- updated_at triggers
-- ==========================================================================

CREATE OR REPLACE FUNCTION parents_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS parents_updated_at_trigger ON parents;
CREATE TRIGGER parents_updated_at_trigger
  BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION parents_updated_at();

COMMENT ON TABLE parents IS 'Parent/guardian profiles. Distinct from students. Linked to student accounts via parent_student_links.';
COMMENT ON TABLE parent_student_links IS 'Join table: parent↔student, created via student-generated invite codes with 48h expiry.';
COMMENT ON FUNCTION is_linked_parent(UUID) IS 'Helper for RLS: true if current auth user is a parent with an active link to the given student_id.';
COMMENT ON FUNCTION get_linked_children() IS 'GDPR-safe whitelist of child profile columns for parents. Does NOT return demographic special-category data.';
