-- ============================================
-- Add AI impact ratings to career_sectors
-- Migration: 20260411000007
-- Adds three columns capturing each sector's exposure to AI-driven change,
-- sourced from published research (Anthropic 2024, OpenAI/UPenn 2023,
-- McKinsey 2023) and populated for all 16 seeded sectors.
-- ============================================

-- 1. Columns
ALTER TABLE career_sectors
  ADD COLUMN IF NOT EXISTS ai_impact_rating TEXT
    CHECK (ai_impact_rating IN ('human-centric', 'ai-augmented', 'ai-exposed'));

ALTER TABLE career_sectors
  ADD COLUMN IF NOT EXISTS ai_impact_description TEXT;

ALTER TABLE career_sectors
  ADD COLUMN IF NOT EXISTS ai_impact_source TEXT
    DEFAULT 'Based on research by Anthropic (2024), OpenAI/University of Pennsylvania (2023), and McKinsey Global Institute (2023). Last updated April 2026.';

-- 2. Populate ratings
-- Human-centric ----------------------------------------------------------
UPDATE career_sectors SET
  ai_impact_rating = 'human-centric',
  ai_impact_description = 'Healthcare relies on physical care, empathy, and clinical judgement. AI assists with diagnostics and admin but cannot replace hands-on patient care.'
WHERE name = 'Healthcare & Medicine';

UPDATE career_sectors SET
  ai_impact_rating = 'human-centric',
  ai_impact_description = 'Skilled trades require physical dexterity in unpredictable environments. AI may assist with planning and safety monitoring but the hands-on work remains human.'
WHERE name = 'Construction & Trades';

UPDATE career_sectors SET
  ai_impact_rating = 'human-centric',
  ai_impact_description = 'Coaching, motivation, and physical instruction require human connection. AI apps offer workout plans but cannot replace a real coach.'
WHERE name = 'Sport & Fitness';

UPDATE career_sectors SET
  ai_impact_rating = 'human-centric',
  ai_impact_description = 'Outdoor physical work in variable conditions resists automation. AI assists with precision farming and monitoring but fieldwork stays human.'
WHERE name = 'Agriculture & Environment';

-- AI-augmented -----------------------------------------------------------
UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'AI accelerates design simulations and quality control. Engineers who work with AI tools will be more productive. Core design and problem-solving remain human.'
WHERE name = 'Engineering & Manufacturing';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'AI speeds up data analysis, literature review, and drug discovery. Experimental design, hypothesis generation, and scientific creativity remain distinctly human.'
WHERE name = 'Science & Research';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'AI automates document review and legal research. High-level advisory, advocacy, and client relationships become more valuable. Junior roles face most change.'
WHERE name = 'Law & Justice';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'AI helps with lesson planning, marking, and personalised learning. The relational core of teaching — inspiring, mentoring, safeguarding — is irreplaceable.'
WHERE name = 'Education & Teaching';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'AI automates routine analysis and reporting. The role shifts toward advisory, strategy, and client relationships. Accountants become business coaches.'
WHERE name = 'Business & Finance';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'AI assists with data analysis and routine processing. Policy judgement, stakeholder management, and citizen-facing services remain human.'
WHERE name = 'Public Services & Government';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'Assessment, therapeutic intervention, and advocacy require deep human expertise. AI may assist with case management and data analysis.'
WHERE name = 'Social Work & Community';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-augmented',
  ai_impact_description = 'Service warmth and guest experience remain essential. AI handles booking, pricing, and back-office tasks. Human service is especially valued in quality venues.'
WHERE name = 'Hospitality & Tourism';

-- AI-exposed -------------------------------------------------------------
UPDATE career_sectors SET
  ai_impact_rating = 'ai-exposed',
  ai_impact_description = 'Paradoxically both the most exposed and most in-demand sector. AI writes code, analyses data, and automates testing. But demand for people who build, deploy, and govern AI is exploding.'
WHERE name = 'Computing & Digital Technology';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-exposed',
  ai_impact_description = 'AI generates images, copy, and designs. Routine production work is under threat. But creative direction, brand strategy, and bespoke design become more valuable.'
WHERE name = 'Creative Arts & Design';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-exposed',
  ai_impact_description = 'AI produces basic content, summaries, and translations. Investigative journalism, editorial judgement, and strategic communications remain human. Entry-level writing roles face most pressure.'
WHERE name = 'Media & Communications';

UPDATE career_sectors SET
  ai_impact_rating = 'ai-exposed',
  ai_impact_description = 'AI creates music, scripts, and visual effects. Live performance and genuine creative expression retain unique value. The sector is polarising between AI-assisted production and human artistry.'
WHERE name = 'Performing Arts & Entertainment';

-- 3. Verify
DO $$
DECLARE
  missing INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing
  FROM career_sectors
  WHERE ai_impact_rating IS NULL;

  IF missing > 0 THEN
    RAISE EXCEPTION 'AI impact rating missing for % career sector(s)', missing;
  END IF;

  RAISE NOTICE 'AI impact ratings populated for all career sectors';
END $$;
