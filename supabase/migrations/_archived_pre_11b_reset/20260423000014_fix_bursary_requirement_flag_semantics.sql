-- Fix four bursaries with AND-semantic flag combinations that make them un-matchable
-- (or match the wrong cohort) under match_bursaries_for_student's current AND-across-flags
-- semantics.
--
-- Background:
--   match_bursaries_for_student joins each requires_* clause with AND. A bursary with two
--   requires_* flags = true requires the student to have BOTH flags. For widening-access
--   bursaries that grant eligibility to ANY of several qualifying groups (Buttle, Unite,
--   SAAS Lone Parent Grant), this is the wrong default.
--
-- Workaround applied here: normalise each affected bursary to the single most inclusive
-- flag, accepting that some edge cases (e.g. care-experienced student who is NOT also
-- estranged for Buttle UK) will not surface a match. Counter-balanced by:
--   1. Buttle UK and Unite Foundation: care-leavers who self-identify as estranged still
--      match. Currently-looked-after children are correctly excluded by Buttle anyway.
--   2. Lone Parent Grant family: SAAS has no age requirement, so removing the
--      young-parent gate is the correct semantic.
--
-- Phase 2 backlog item logged for proper fix (requirement_logic enum, OR-default function,
-- or bursary_requirements junction table).
--
-- Transaction boundary owned by applying tool (no BEGIN/COMMIT here).

-- 1. Buttle UK Education Support Fund.
--    Was: requires_care_experience=true AND requires_estranged=true (impossible match).
--    Now: requires_estranged only. Buttle excludes currently-LAC per published criteria;
--    care-leavers can self-identify as estranged.
UPDATE public.bursaries
SET requires_care_experience = false,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'buttle-uk-education-support-fund';

-- 2. Unite Foundation Scholarship.
--    Was: requires_care_experience=true AND requires_estranged=true (impossible match).
--    Now: requires_estranged only. Description updated to make either-group eligibility
--    explicit for students.
UPDATE public.bursaries
SET requires_care_experience = false,
    description = 'Free student accommodation for up to three years (365 days per year). Eligibility is open to either care-experienced young people OR students estranged from their family -- you do not need to belong to both groups to apply.',
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'unite-foundation-scholarship';

-- 3. Lone Parent Grant.
--    Was: requires_young_parent=true AND requires_lone_parent=true (excludes non-young
--    lone parents who do qualify for the SAAS grant).
--    Now: requires_lone_parent only (note: requires_lone_parent is not currently consulted
--    by the match function, so this row will surface universally to undergraduates --
--    appropriate for a SAAS grant whose only real gate is being a lone parent, which the
--    student declares at SAAS application time).
UPDATE public.bursaries
SET requires_young_parent = false,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'lone-parent-grant';

-- 4. Lone Parents' Childcare Grant. Same fix as #3.
UPDATE public.bursaries
SET requires_young_parent = false,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'lone-parents-childcare-grant';
