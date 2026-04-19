# AI Horizon Rubric

**Applies to:** `career_roles.ai_rating_2030_2035`, `career_roles.ai_rating_2040_2045`

**Scale:** 1–10, stored as `INTEGER NULL` with `CHECK (col IS NULL OR col BETWEEN 1 AND 10)` on each column. `NULL` means the role has not yet been rated for that horizon.

Both columns share the same 1-10 definition. The difference is the question asked when assigning a value — see horizon-specific guidance below.

---

## The 1-10 scale

**Direction:**
- `1` = AI barely affects this role (embodied, licensed, human-presence work dominates).
- `10` = role is AI-native or exists primarily to supervise, train, govern or develop AI systems.

| Rating | Meaning |
|-------:|---------|
| 1 | AI barely affects the role. Embodied, licensed, fundamentally human-presence work. |
| 2 | Minimal AI impact. Judgement, dexterity or regulated authority dominates; AI is an aside. |
| 3 | Light AI augmentation. Tools assist around the edges but don't reshape the core craft. |
| 4 | Moderate AI augmentation. Productivity tools in daily use; core judgement unchanged. |
| 5 | Significant AI augmentation. Workflows reshaped, but hiring and seniority steady. |
| 6 | Heavy AI augmentation. Hiring patterns and seniority structures shifting; junior work shrinking at the margins. |
| 7 | Substantial AI replacement of routine tasks. Junior headcount measurably shrinking. |
| 8 | Routine work heavily automated. Survivors oversee AI output rather than producing it from scratch. |
| 9 | Role actively being replaced in most cases. Remaining staff primarily supervise AI. |
| 10 | AI-native. Role exists primarily to supervise, train, govern or develop AI systems. |

---

## Horizon-specific guidance

### `ai_rating_2030_2035` — early-career window

Ask: **"What does this role look like for a graduate entering the workforce between 2025 and 2035?"**

This is the horizon most relevant to current S2–S6 students making subject and career choices today. Rate on the basis of:
- AI tooling already in deployment or with a clear near-term deployment path
- Structural changes in hiring (are entry-level posts contracting?)
- Regulatory and statutory constraints that lock in human accountability

Anchor on what is plausibly true by the mid-2030s under a moderate-adoption scenario — not best-case AI capability, not no-change.

### `ai_rating_2040_2045` — mid-career window

Ask: **"What does this role look like for a professional who is mid-career in 2040–2045?"**

This is the horizon relevant to long-term career durability. In most cases this drifts upward from the 2030–2035 value as AI deployment deepens and the workforce adjusts.

**Drift guidance (from 2030–2035 to 2040–2045):**

| Role type | Typical drift |
|-----------|--------------|
| Knowledge-work roles (2030–2035 rating 5–8) | +2 to +3 points |
| Embodied and relational roles (2030–2035 rating 1–3) | +0 to +1 points |
| AI-native roles (2030–2035 rating 9–10) | No drift; already at ceiling |

Maximum capped at 10. Apply larger drift if the role is substantially restructured or displaced; smaller drift if the core activity remains fundamentally unchanged.

---

## Rating heuristics

Start high; work down. Ask in order:

1. **Does the role exist primarily because of AI?** If yes → 9 or 10.
2. **Is the core workflow AI-first (pipelines, models, prompts, digital twins)?** If yes → 7, 8 or 9.
3. **Has AI already reshaped hiring structures for this role?** If yes → 6 or 7.
4. **Are productivity tools in daily use but judgement unchanged?** If yes → 3, 4 or 5.
5. **Is this regulated, licensed, embodied or human-presence work?** If yes → 1 or 2.

For `ai_rating_2030_2035`, anchor on near-term evidence. For `ai_rating_2040_2045`, extrapolate from 2030–2035 using the drift guidance above.

---

## Regulatory anchor

Regulated professions with a legal sign-off requirement (GMC, NMC, HCPC, GDC, CAA, ARB, ICE, IChemE, RAeS, Faculty of Advocates, GTCS, ONR) retain human accountability requirements that constrain ratings even when AI capability exceeds current human performance.

Typical ceiling in the 2040–2045 window for regulated roles: **5–6**, regardless of capability trajectory, because the statutory accountability layer does not move at the pace of AI deployment.

---

## Null policy

A `NULL` value means the role has not yet been rated for that horizon. In the UI:
- List-view tiles: hide the AI rating badge entirely when `NULL`.
- Role detail / comparison table: show "Not yet rated" in muted style.
- Sort order: push `NULL` rows to the end (ascending: `?? 999`; descending: `?? -1`).
- Averages: exclude `NULL` rows from all average calculations.

---

## Pilot examples (April 2026, 15 roles)

| Title | ai_rating_2030_2035 | ai_rating_2040_2045 | Notes |
|-------|--------------------:|--------------------:|-------|
| Plumber | 2 | — | Embodied; 0–1 drift expected |
| Electrician | 3 | — | |
| Welder / Fabricator | 3 | — | |
| Primary Teacher | 3 | — | GTCS cap applies |
| Social Worker | 3 | — | Regulated; relational |
| Nurse | 4 | — | NMC cap applies |
| Paramedic | 4 | — | HCPC regulated |
| Doctor / GP | 4 | 6 | GMC regulated; 2040–2045 drift applied |
| HGV Driver | 5 | — | AV displacement trajectory |
| Delivery Driver | 6 | — | Last-mile automation pressure |
| Architect | 7 | — | BIM/parametric AI; ARB cap ~7–8 |
| Chef (Professional Kitchen) | 3 | — | Embodied craft; slow drift |
| Senior Software Developer | 7 | — | Knowledge-work; already shifting |
| Junior Software Developer | 8 | — | Entry-level most exposed |
| Warehouse Operative | 7 | — | Robotics + AI combined pressure |

Pilot showed 13 % drift from the historical `ai_rating` baseline (Architect had been rated 3; corrected to 6 for current + 7 for 2030–2035 after reviewing ARB AI guidance and BIM adoption data). When running sector batch retrofits, include a baseline audit pass before populating horizon columns.

---

## When to re-rate

Re-rate when one of the following happens:

- A Scottish or UK regulator publishes guidance on AI use in the profession.
- A credible report shows junior headcount has shifted materially (ONS, SDS, professional body).
- The role's core qualification pathway now requires AI training as a mandatory module.
- A new AI-native sub-role splits off that warrants its own `career_roles` entry.

Do not re-rate because of hype cycles or vendor marketing. Evidence first.

---

## Review cadence

Re-review all ratings every 18–24 months. Next review target: late 2027. Assumptions subject to change: capability trajectory, regulatory response, economic incentives.

---

## Related fields

- `robotics_rating_2030_2035`, `robotics_rating_2040_2045` — companion robotics exposure ratings; see `docs/robotics-rating-rubric.md`.
- `is_new_ai_role` — boolean for roles that didn't exist before ~2022. Orthogonal to horizon ratings: a role can be AI-native but rated 6 (e.g. EV/AV Maintenance Technician), and a role can be `false` but rated 8 (e.g. Bioinformatics Specialist).
- `growth_outlook` — unrelated but frequently correlated: high horizon rating + declining `growth_outlook` is the combination that needs the strongest narrative support for students.

---

## History

- **Pre-April 2026:** Single `ai_rating` column (1–10) represented current-day AI exposure. Full calibration history in `docs/audits/ai_rating_historical_snapshot_2026-04-19.csv` (264 rows).
- **April 2026, this session:** `ai_rating` dropped and replaced by two horizon columns (`ai_rating_2030_2035`, `ai_rating_2040_2045`). The old single-horizon rubric (`docs/ai-rating-rubric.md`) was deleted; this document supersedes it.
- **`ai_rating_2040_2045`** was initially created as `ai_rating_2035_2045`; renamed in migration `20260425000001` to align the column name with the decade boundary.
