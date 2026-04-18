# Phase 2 Backlog

Items parked from the Round 1 end-of-session cleanup (migration `20260423000009_round1_cleanup.sql`, April 2026). Each needs a discrete product or data decision before it can ship.

## 1. `growth_outlook` enumeration rework

- `career_roles.growth_outlook` currently has ~170 unique free-text values.
- Only 4 are canonical: `Growing`, `Stable`, `Declining`, `NULL`. Round-1 cleanup collapsed the one `Stable-Growing` hybrid back to `Stable`.
- Most free-text values use a canonical value as prefix: e.g. `Stable -- core courtroom work remains human`, `Growing -- 42% yearly growth in demand`.
- Decision needed:
  - (a) keep the free-text flavour (students see the nuance inline), **or**
  - (b) canonicalise the column to the 4-value enum and move nuance into a new `growth_outlook_detail TEXT` column, or a structured JSON blob.
- Option (b) is the cleaner long-term shape but needs a full content pass across all 226 roles and a copy review of anywhere the field is rendered.

## 2. SOC bundling display strategy

- Several SOC codes now hold multiple `career_roles` rows that all pool on the same ONS ASHE salary percentiles. Most visible today: 5 Creative Arts roles pooled on SOC 2142.
- Students currently see identical salary medians across those roles, which reads as a data bug even though the underlying source is correct.
- Decision needed:
  - Badge visibly as "grouped SOC estimate" on the role card, **or**
  - Diversify by applying small per-role offsets driven by SDS LMI or sector reports, **or**
  - Collapse near-identical roles into one card with sub-role variants.

## 3. Dentist salary verification

- Current `career_roles` row for Dentist uses ASHE, but the early-career path in Scotland is dominated by NHS Dental Foundation Training (DFT) / Dental Core Training (DCT) pay progression.
- Need to cross-check the stored percentiles against published DFT/DCT bands and the BDA Scotland pay guidance.
- Likely lands as either a manual override or a sector-specific salary note.

## 4. Tail-heavy professions -- salary override policy

- Professions with a very long right tail (Airline Pilot, Advocate, Judge, senior Aerospace Engineer, Chartered Building Services partners, etc.) are understated by ONS ASHE percentiles because the headline feed truncates or suppresses the top decile.
- Today we handle this ad-hoc via `1.5x tail-heavy multiplier` in `salary_source`.
- Decision needed:
  - Standardise which professions qualify for the tail-heavy multiplier (criteria, not case-by-case).
  - Document the multiplier in the role card so students understand the uplift.
  - Consider lifting this into a structured `salary_adjustments` table rather than embedding it in the `salary_source` string.

## 5. Subject-to-career mapping session

- `subject_career_sectors` and `subject_progressions` are seeded structurally but the content mapping (which SQA subjects lead into which career sectors, at what weighting) has not been done end-to-end.
- Pre-req: subjects master list needs to be seeded first (see `CLAUDE.md` -> Subject Pathway & Curriculum Layer).
- Scope: one focused session, probably Opus, working through the 8 CfE areas and tagging each subject to 1 – 3 career sectors with a relevance weighting.

## 6. Broader `ai_rating` sanity-check pass

- Round-1 cleanup fixed the 30 Round-1 roles and the 94 rating-1 roles.
- ~100 roles with pre-Round-1 ratings of 2 – 8 were explicitly left alone this session. Most look reasonable against the 1 – 10 rubric on spot-checks, but a full audit has not been done.
- Low priority -- batch with any future content pass rather than standing it up on its own.
