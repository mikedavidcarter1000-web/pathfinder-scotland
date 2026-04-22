-- Round 1 end-of-session cleanup
-- 1. AI rating remap to 1-10 scale (Round 1 roles + existing rating-1 roles)
-- 2. salary_source normalisation (em-dash -> double-hyphen + stray variant consolidation)
-- 3. growth_outlook narrow fix ('Stable-Growing' -> 'Stable')
-- 4. ai_rating column comment documenting 1-10 rubric

BEGIN;

-- ============================================================================
-- Task 2a: Round 1 role ai_rating remap
-- Applied by id for the 30 Round 1 roles. Entries where current == target
-- are included as explicit no-ops to document the audit decision.
-- ============================================================================

-- Changes (11 rows where value differs)
UPDATE career_roles SET ai_rating = 2 WHERE id = '1852775c-2ca6-49e0-a051-c7dae884349c'; -- Airline Pilot: 4->2
UPDATE career_roles SET ai_rating = 6 WHERE id = 'a5f0b614-bafa-4633-80e0-175fa5ebe2f7'; -- Freight Forwarder: 3->6
UPDATE career_roles SET ai_rating = 2 WHERE id = '46545111-2911-462c-9776-f1caf0d58226'; -- Dentist: 5->2
UPDATE career_roles SET ai_rating = 1 WHERE id = 'c5b10c38-4543-49a5-9703-d3bfd2fa375c'; -- Midwife: 5->1
UPDATE career_roles SET ai_rating = 2 WHERE id = 'f6a2f011-ce00-406e-9e8f-c88d0c6e4011'; -- Occupational Therapist: 4->2
UPDATE career_roles SET ai_rating = 5 WHERE id = '6cac69d5-2337-4527-8c5e-2051aeb77ea1'; -- Economist: 3->5
UPDATE career_roles SET ai_rating = 6 WHERE id = '94ec2fb3-cdbb-411a-b62a-5790e144fb9f'; -- Investment Banker: 2->6
UPDATE career_roles SET ai_rating = 5 WHERE id = 'b1a93caa-f4e9-4758-bf35-7b5c50930bd8'; -- Management Consultant: 3->5
UPDATE career_roles SET ai_rating = 6 WHERE id = '09f4f42c-e205-459d-a539-9ac70ef42532'; -- Tax Adviser: 3->6
UPDATE career_roles SET ai_rating = 2 WHERE id = '9388e85a-5a3c-49d3-ba2c-8dae82e84051'; -- Plasterer: 4->2
UPDATE career_roles SET ai_rating = 2 WHERE id = '988abbb7-42f7-44b5-9684-5ad06de1cfae'; -- Nuclear Engineer: 4->2
UPDATE career_roles SET ai_rating = 2 WHERE id = '5af0d60c-21cd-4453-9cd5-754f9ebd050a'; -- Advocate: 3->2

-- ============================================================================
-- Task 2b: Group A -- existing rating-1 AI-native/overlay roles (86 roles)
-- Targets span 6-10 on the new rubric.
-- ============================================================================

-- Target 10: purely AI-native roles
UPDATE career_roles SET ai_rating = 10 WHERE title IN (
  'AI / ML Engineer',
  'AI Safety Researcher',
  'AI Safety Researcher (Scientific)',
  'Prompt Engineer',
  'AI Ethics Officer',
  'AI Ethics and Copyright Specialist',
  'AI Compliance / Ethics Specialist',
  'AI Product Manager',
  'AI Solutions Engineer',
  'AI Operations Engineer',
  'Clinical AI Safety Specialist',
  'Chatbot / AI System Trainer',
  'AI Drug Discovery Scientist',
  'Prompt Artist / Designer',
  'AI Creative Director'
);

-- Target 9: AI-first specialist roles
UPDATE career_roles SET ai_rating = 9 WHERE title IN (
  'AI Content Strategist',
  'AI News Verification Specialist',
  'AI Literacy Curriculum Developer',
  'AI Music Production Specialist',
  'AI Policy Analyst',
  'i.AI Prototyping Specialist',
  'Government Chief AI Officer',
  'Public Sector AI Adoption Specialist',
  'AI Quality Systems Analyst',
  'AI-Savvy Financial Analyst',
  'Financial AI Compliance Specialist',
  'Forensic AI Auditor',
  'FinTech Product Manager',
  'Data Governance Manager (Finance)',
  'AI Healthcare Data Analyst',
  'AI-Enhanced Performance Coach',
  'AI-Assisted Customer Experience Manager',
  'Data Engineer',
  'AI Logistics Analyst',
  'Automated Media Monitoring Analyst',
  'Legal AI Product Manager',
  'Legal Data Analyst',
  'Legal Technologist',
  'LawTech Consultant',
  'CreaTech Specialist'
);

-- Target 8: digital-first / AI-augmented specialist roles
UPDATE career_roles SET ai_rating = 8 WHERE title IN (
  'Chief Nursing Information Officer (CNIO)',
  'Clinical Informatician',
  'Health Data Scientist',
  'Digital Medicines Specialist',
  'Digital Learning Designer',
  'Online / AI-Assisted Tutoring Coordinator',
  'Digital Manufacturing Engineer',
  'Digital Transformation Manager',
  'Digital Supply Chain Manager',
  'Digital Concierge Manager',
  'Digital Fitness Content Creator',
  'Digital Inclusion Worker',
  'Hospitality Technology Manager',
  'Guest Experience Designer',
  'BIM / Digital Twin Manager',
  'Construction Technology Specialist',
  'Smart Building Technician',
  'Smart Factory Coordinator',
  'Sustainability / Energy Modelling Analyst',
  'Sustainability / Waste Optimisation Specialist',
  'Revenue / Yield Analyst',
  'E-commerce Personalisation Specialist',
  'Retail Data / AI Analyst',
  'Sports Data Analyst',
  'Environmental Data Scientist',
  'Agricultural Data Analyst',
  'Predictive Maintenance Analyst',
  'Computational Scientist',
  'Laboratory Automation Specialist',
  'Robotics Integration Engineer',
  'Virtual Production Technician',
  'Bioinformatics Specialist',
  'Warehouse Automation / Robotics Engineer',
  'AV Fleet Operations Manager',
  'Remote Vehicle Operator',
  'TechTrack Apprentice'
);

-- Target 7: tech-heavy but partly embodied roles
UPDATE career_roles SET ai_rating = 7 WHERE title IN (
  'Carbon Footprint / Sustainability Officer',
  'Peatland Restoration Specialist',
  'Precision Agriculture Technologist',
  'Drone Operator / Pilot',
  'Drone Delivery Operator',
  'Drone Survey Operator',
  'Wearable Technology Specialist'
);

-- Target 6: embodied trades with AI-aware tooling
UPDATE career_roles SET ai_rating = 6 WHERE title IN (
  'EV / AV Maintenance Technician',
  'Robotics Technician',
  'E-sports / Gaming Coach'
);

-- ============================================================================
-- Task 2b: Group B -- embodied/care roles currently at rating 1
-- All 8 remain at target 1 on the new rubric (no UPDATE needed, documented here)
-- Bricklayer, Dancer, Nursery Practitioner / Childcare Worker,
-- Family Support Worker, Homelessness Support Worker,
-- Mental Health Support Worker, Youth Worker, Outdoor Activities Instructor
-- ============================================================================

-- ============================================================================
-- Task 2d: ai_rating column comment
-- ============================================================================
COMMENT ON COLUMN public.career_roles.ai_rating IS
'AI impact rating on a 1-10 scale. 1 = AI barely affects this role (embodied, licensed, human-presence). 10 = role is AI-native or exists primarily to supervise, train, govern or develop AI systems. See docs/ai-rating-rubric.md for full rubric.';

-- ============================================================================
-- Task 3a: salary_source em-dash -> double-hyphen bulk conversion
-- ============================================================================
UPDATE career_roles
SET salary_source = REPLACE(salary_source, '—', '--')
WHERE salary_source LIKE '%—%';

-- ============================================================================
-- Task 3b: consolidate stray salary_source variants
-- ============================================================================

-- Two "UK percentiles" variants -> canonical "UK fallback -- Scotland data suppressed"
UPDATE career_roles
SET salary_source = 'ONS ASHE 2025 (UK fallback -- Scotland data suppressed)'
WHERE salary_source IN (
  'ONS ASHE 2025 (UK percentiles only)',
  'ONS ASHE 2025 (UK percentiles)'
);

-- "UK percentiles + 1.5x fallback multiplier" -> canonical tail-heavy form
UPDATE career_roles
SET salary_source = 'ONS ASHE 2025 (UK fallback -- Scotland data suppressed) + 1.5x tail-heavy multiplier'
WHERE salary_source = 'ONS ASHE 2025 (UK percentiles + 1.5x fallback multiplier)';

-- Parenthesised multiplier -> move outside parentheses for consistency
UPDATE career_roles
SET salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles) + 1.2x physical-trade multiplier'
WHERE salary_source = 'ONS ASHE 2025 (Scotland median + UK percentiles + 1.2x physical-trade multiplier)';

-- ============================================================================
-- Task 4a: growth_outlook narrow fix
-- ============================================================================
UPDATE career_roles
SET growth_outlook = 'Stable'
WHERE growth_outlook = 'Stable-Growing';

COMMIT;
