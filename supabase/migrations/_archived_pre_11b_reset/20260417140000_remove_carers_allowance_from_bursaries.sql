-- Remove Carer's Allowance from bursaries table.
-- Rationale: Full-time students are generally ineligible (DWP 21+ hours/week exclusion).
-- Content relocated to the Support Hub young-carers page (/support/young-carers)
-- where it serves as contextual information rather than a personalised match.

DELETE FROM public.bursaries WHERE name = 'Carer''s Allowance';
