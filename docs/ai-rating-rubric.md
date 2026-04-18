# AI Rating Rubric (career_roles.ai_rating)

**Scale:** 1 – 10, stored as `INTEGER` on `public.career_roles.ai_rating` with a `CHECK (ai_rating BETWEEN 1 AND 10)` constraint.

**Direction:**
- `1` = AI barely affects this role (embodied, licensed, human-presence dominates).
- `10` = role is AI-native or exists primarily to supervise, train, govern or develop AI systems.

Ratings are student-facing. They translate how exposed a given Scottish career is to AI-driven change today, and carry forward to filters, sort order and narrative copy across Pathfinder.

## The 10 bands

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

## Examples (post-remap, April 2026)

- **Rating 1** — Midwife, Bricklayer, Dancer, Nursery Practitioner, Youth Worker, Outdoor Activities Instructor, Family/Homelessness/Mental Health Support Workers.
- **Rating 2** — Airline Pilot, Dentist, Occupational Therapist, Nuclear Engineer, Plasterer, Advocate, Police Officer, Prison Officer, Child Protection Social Worker.
- **Rating 3** — Architect, Civil Engineer, Aerospace Engineer, Procurator Fiscal Depute, Fashion Designer, Housing Officer.
- **Rating 5 – 6** — Economist, Management Consultant, Freight Forwarder, Tax Adviser, Investment Banker, Games Artist, Animator.
- **Rating 7** — Illustrator, Drone Operator, Peatland Restoration Specialist, Carbon Footprint / Sustainability Officer.
- **Rating 8** — Clinical Informatician, BIM / Digital Twin Manager, Data Engineer–adjacent analytics roles, Retail/Sports/Environmental Data Scientists.
- **Rating 9** — AI Healthcare Data Analyst, Legal AI Product Manager, Government Chief AI Officer, AI Policy Analyst.
- **Rating 10** — AI / ML Engineer, AI Safety Researcher, Prompt Engineer, AI Ethics Officer, Clinical AI Safety Specialist.

## Rating heuristics

Start high; work down. Ask, in order:

1. **Does the role exist primarily because of AI?** If yes -> 9 or 10.
2. **Is the core workflow AI-first (pipelines, models, prompts, digital twins)?** If yes -> 7, 8 or 9.
3. **Has AI already reshaped hiring structures for this role?** If yes -> 6 or 7.
4. **Are productivity tools in daily use but judgement unchanged?** If yes -> 3, 4 or 5.
5. **Is this regulated, licensed, embodied or human-presence work?** If yes -> 1 or 2.

Always check the regulator / statutory status. Roles with a legal sign-off requirement (GMC, NMC, HCPC, GDC, CAA, ARB, ICE, IChemE, RAeS, Faculty of Advocates, ONR) sit at 1 – 3 regardless of how much AI tooling they use, because the accountability remains human.

## When to re-rate

Re-rate when one of the following happens:

- A new Scottish or UK regulator publishes guidance on AI use in the profession.
- A credible report shows junior headcount has shifted materially in the sector (ONS, SDS, professional body).
- The role's core qualification pathway now requires AI training as a mandatory module.
- A new AI-native sub-role splits off that warrants its own `career_roles` entry.

Do not re-rate because of hype cycles or vendor marketing. Evidence first.

## Related fields

- `is_new_ai_role` — boolean tag for AI-native roles that didn't exist before ~2022. Orthogonal to `ai_rating`: a role can be AI-native (`true`) but rated 6 (for example, an EV/AV maintenance technician whose hands stay on the vehicle), and a role can be `false` but rated 8 (for example, Bioinformatics Specialist — established scientific discipline now fully AI-pipeline-driven).
- `salary_source` — unrelated; tracks ONS ASHE / manual-estimate provenance.
- `growth_outlook` — unrelated but frequently correlated: high `ai_rating` + declining `growth_outlook` is the combination that needs the strongest narrative support for students.

## History

- **Pre-Round-1 (up to April 2026):** Range 1 – 8. Rating 1 was overloaded, bundling embodied trades with AI-native roles (because the legacy prompt treated "1" as "new/emerging AI" rather than "AI-unaffected").
- **Round 1, Sessions 1 – 6:** Prompts specified a compressed 1 – 5 scale. Resulting roles need remapping to 1 – 10.
- **Round 1, Sessions 7 – 8:** Prompts corrected to 1 – 10. Roles already on the canonical scale.
- **Migration `20260423000009_round1_cleanup.sql` (April 2026):** Remapped all 30 Round 1 roles + all 94 pre-Round-1 rating-1 roles to an internally consistent 1 – 10 position against this rubric.
