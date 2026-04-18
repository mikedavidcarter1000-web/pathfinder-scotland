-- Fix three bursaries that gated on columns the match function does not read.
--
-- match_bursaries_for_student reads: requires_care_experience, requires_estranged,
-- requires_carer, requires_disability, requires_refugee_or_asylum, requires_young_parent.
-- It does NOT read: requires_young_carer, requires_lone_parent.
--
-- Three rows currently rely on at least one dead column as a primary gate, causing them
-- to surface universally (no real gating) instead of to their intended cohort:
--   1. MCR Pathways Young Carer Bursary -- requires_young_carer=true only.
--   2. Lone Parent Grant -- requires_lone_parent=true only (post 20260423000014).
--   3. Lone Parents' Childcare Grant -- requires_lone_parent=true only (post 20260423000014).
--
-- Young Carer Grant has both requires_carer (read) and requires_young_carer (dead/harmless)
-- so it is correctly gated. No change needed there.
--
-- Phase 2 backlog logged for the underlying column-cleanup decision.
-- Transaction boundary owned by applying tool (no BEGIN/COMMIT here).

-- 1. MCR Pathways Young Carer Bursary -- migrate from dead requires_young_carer to read requires_carer.
--    Function's carer clause OR-handles is_carer and is_young_carer student-side, so this
--    correctly gates to any carer (young or otherwise).
UPDATE public.bursaries
SET requires_carer = true,
    requires_young_carer = false,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'mcr-pathways-young-carer-bursary';

-- 2. Lone Parent Grant -- revert to requires_young_parent (the read flag).
--    Real-world: SAAS Lone Parent Grant is age-neutral, but our student schema only has
--    is_young_parent. Any student self-identifying as young parent is unambiguously a
--    lone parent for our purposes.
UPDATE public.bursaries
SET requires_young_parent = true,
    requires_lone_parent = false,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'lone-parent-grant';

-- 3. Lone Parents' Childcare Grant -- same fix.
UPDATE public.bursaries
SET requires_young_parent = true,
    requires_lone_parent = false,
    last_verified_date = DATE '2026-04-18',
    updated_at = NOW()
WHERE slug = 'lone-parents-childcare-grant';
