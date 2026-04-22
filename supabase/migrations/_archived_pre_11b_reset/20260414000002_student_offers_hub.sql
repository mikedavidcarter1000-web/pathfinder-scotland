-- =============================================================================
-- Student Offers & Entitlements Hub -- Core Schema
-- Migration: 20260414000002_student_offers_hub.sql
-- =============================================================================
--
-- AUDIT OF EXISTING INFRASTRUCTURE (verified 2026-04-14):
--
-- Existing application code (untouched by this migration):
--   app/benefits/page.tsx              server component rendering "/benefits"
--   app/benefits/benefits-client.tsx   client UI consuming student_benefits
--   app/benefits/benefit-card.tsx
--   app/benefits/benefit-recommendations.tsx
--   app/api/benefits/click/route.ts    POST endpoint writing to benefit_clicks
--   components/dashboard/benefits-card.tsx
--
-- Existing database tables in the "benefit_*" namespace (left untouched):
--   student_benefits      flat benefit rows rendered on /benefits
--   benefit_categories    category lookup for student_benefits
--   benefit_clicks        click log written by /api/benefits/click
--   benefit_reminders     deadline reminders (benefits-only)
--   prep_checklist_items  older per-student prep checklist
--   student_offers        older offers junction table (unrelated scope)
--
-- This migration introduces a parallel "offer_*" namespace for the new
-- Student Offers & Entitlements Hub. The naming is intentionally distinct
-- from "benefit_*" so both systems can coexist during the transition.
--
-- Extensions: gen_random_uuid() is provided by core Postgres (13+); no extra
-- extension needed. pg_cron is AVAILABLE (v1.6.4) but NOT installed on this
-- project, so the conditional DO block below only schedules flag_stale_offers
-- if the extension is already installed. Otherwise the function must be run
-- manually (e.g. from the SQL editor) or pg_cron must first be installed via:
--   CREATE EXTENSION pg_cron;
-- then re-run the conditional DO block at the end of this migration.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. offer_categories -- top-level category lookup (15 seeded rows)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offer_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,                                  -- Lucide icon name
  display_order INT  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 2. partners -- commercial relationship tracking (admin-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  contact_name      TEXT,
  contact_email     TEXT,
  partner_type      TEXT NOT NULL CHECK (partner_type IN (
                      'affiliate','exclusive','sponsored','free')),
  affiliate_network TEXT,
  account_id        TEXT,
  contract_start    DATE,
  contract_end      DATE,
  notes             TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ---------------------------------------------------------------------------
-- 3. offers -- core table for the Entitlements Hub
-- ---------------------------------------------------------------------------
-- NOTE: 'general' is included in the CHECK list so the column default
-- (DEFAULT 'general') does not violate the constraint. The task spec listed
-- the other six allowed values; 'general' is the fallback for commercial
-- offers that do not yet have a more specific type.
CREATE TABLE IF NOT EXISTS public.offers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id            UUID NOT NULL REFERENCES public.offer_categories(id)
                           ON DELETE RESTRICT,
  title                  TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  summary                TEXT,
  description            TEXT,
  brand                  TEXT,
  offer_type             TEXT NOT NULL DEFAULT 'general' CHECK (offer_type IN (
                            'entitlement','free_resource','general_discount',
                            'affiliate','exclusive','sponsored','general')),
  discount_text          TEXT,
  url                    TEXT,
  affiliate_url          TEXT,
  promo_code             TEXT,
  min_age                INT,
  max_age                INT,
  eligible_stages        TEXT[] NOT NULL DEFAULT '{}',
  scotland_only          BOOLEAN NOT NULL DEFAULT false,
  requires_young_scot    BOOLEAN NOT NULL DEFAULT false,
  requires_totum         BOOLEAN NOT NULL DEFAULT false,
  requires_unidays       BOOLEAN NOT NULL DEFAULT false,
  requires_student_beans BOOLEAN NOT NULL DEFAULT false,
  verification_method    TEXT,
  locations              TEXT[] NOT NULL DEFAULT '{}', -- empty = nationwide
  university_specific    UUID[] NOT NULL DEFAULT '{}',
  seasonal_tags          TEXT[] NOT NULL DEFAULT '{}',
  active_from            DATE,
  active_until           DATE,
  partner_id             UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  is_featured            BOOLEAN NOT NULL DEFAULT false,
  featured_until         DATE,
  affiliate_network      TEXT,
  commission_type        TEXT,
  commission_value       NUMERIC,
  cookie_days            INT,
  last_verified_at       DATE,
  verified_by            TEXT,
  is_active              BOOLEAN NOT NULL DEFAULT true,
  needs_review           BOOLEAN NOT NULL DEFAULT false,
  image_url              TEXT,
  display_order          INT NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_category_id    ON public.offers (category_id);
CREATE INDEX IF NOT EXISTS idx_offers_offer_type     ON public.offers (offer_type);
CREATE INDEX IF NOT EXISTS idx_offers_is_active      ON public.offers (is_active);
CREATE INDEX IF NOT EXISTS idx_offers_is_featured    ON public.offers (is_featured)
  WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_offers_eligible_stages ON public.offers USING GIN (eligible_stages);
CREATE INDEX IF NOT EXISTS idx_offers_seasonal_tags   ON public.offers USING GIN (seasonal_tags);
CREATE INDEX IF NOT EXISTS idx_offers_locations       ON public.offers USING GIN (locations);


-- ---------------------------------------------------------------------------
-- 4. offer_support_groups -- offer <-> support-group junction
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offer_support_groups (
  offer_id      UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  support_group TEXT NOT NULL CHECK (support_group IN (
                   'young-carers','estranged-students','young-parents',
                   'refugees-asylum-seekers','esol-eal','disability','lgbtq',
                   'mature-students','grt','home-educated','early-leavers',
                   'rural-island','care-experienced')),
  PRIMARY KEY (offer_id, support_group)
);

CREATE INDEX IF NOT EXISTS idx_offer_support_groups_support_group
  ON public.offer_support_groups (support_group);


-- ---------------------------------------------------------------------------
-- 5. offer_clicks -- click & engagement telemetry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offer_clicks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id      UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES public.students(id) ON DELETE SET NULL,
  click_type    TEXT NOT NULL CHECK (click_type IN (
                   'outbound','save','unsave','detail_view','copy_code')),
  referrer_page TEXT,
  session_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_clicks_offer_id   ON public.offer_clicks (offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_student_id ON public.offer_clicks (student_id);
CREATE INDEX IF NOT EXISTS idx_offer_clicks_created_at ON public.offer_clicks (created_at);


-- ---------------------------------------------------------------------------
-- 6. saved_offers -- student bookmarks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_offers (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  offer_id   UUID NOT NULL REFERENCES public.offers(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, offer_id)
);


-- ---------------------------------------------------------------------------
-- 7. starting_uni_checklist_items -- "Starting uni" checklist master list
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.starting_uni_checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL CHECK (category IN (
                     'finance','health','housing','admin','tech')),
  linked_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  url             TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true
);


-- ---------------------------------------------------------------------------
-- 8. student_checklist_progress -- per-student tick state
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_checklist_progress (
  student_id        UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.starting_uni_checklist_items(id)
                      ON DELETE CASCADE,
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, checklist_item_id)
);


-- ---------------------------------------------------------------------------
-- RLS -- enable on every new table
-- ---------------------------------------------------------------------------
ALTER TABLE public.offer_categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_support_groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_clicks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_offers                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starting_uni_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_checklist_progress   ENABLE ROW LEVEL SECURITY;


-- offer_categories: public read
DROP POLICY IF EXISTS offer_categories_select_public ON public.offer_categories;
CREATE POLICY offer_categories_select_public
  ON public.offer_categories
  FOR SELECT
  USING (true);


-- offers: public read of active rows only
DROP POLICY IF EXISTS offers_select_active ON public.offers;
CREATE POLICY offers_select_active
  ON public.offers
  FOR SELECT
  USING (is_active = true);


-- offer_support_groups: public read (used to surface which support tags an offer has)
DROP POLICY IF EXISTS offer_support_groups_select_public ON public.offer_support_groups;
CREATE POLICY offer_support_groups_select_public
  ON public.offer_support_groups
  FOR SELECT
  USING (true);


-- partners: NO public policies -> RLS denies all anon + authenticated reads.
-- Only service_role (which bypasses RLS) can access this table.


-- offer_clicks: anyone may INSERT; users read only their own rows (+ anon rows)
DROP POLICY IF EXISTS offer_clicks_insert_any ON public.offer_clicks;
CREATE POLICY offer_clicks_insert_any
  ON public.offer_clicks
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS offer_clicks_select_own ON public.offer_clicks;
CREATE POLICY offer_clicks_select_own
  ON public.offer_clicks
  FOR SELECT
  USING (student_id = auth.uid() OR student_id IS NULL);


-- saved_offers: full access to own rows
DROP POLICY IF EXISTS saved_offers_all_own ON public.saved_offers;
CREATE POLICY saved_offers_all_own
  ON public.saved_offers
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());


-- starting_uni_checklist_items: public read of active items
DROP POLICY IF EXISTS checklist_items_select_active ON public.starting_uni_checklist_items;
CREATE POLICY checklist_items_select_active
  ON public.starting_uni_checklist_items
  FOR SELECT
  USING (is_active = true);


-- student_checklist_progress: full access to own rows
DROP POLICY IF EXISTS student_checklist_progress_all_own ON public.student_checklist_progress;
CREATE POLICY student_checklist_progress_all_own
  ON public.student_checklist_progress
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());


-- ---------------------------------------------------------------------------
-- Triggers & functions
-- ---------------------------------------------------------------------------

-- offers.updated_at BEFORE UPDATE trigger
CREATE OR REPLACE FUNCTION public.set_offers_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_offers_updated_at ON public.offers;
CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_offers_updated_at();


-- flag_stale_offers(): flips needs_review=true on any active offer whose
-- last_verified_at is older than six months. SECURITY DEFINER with a locked
-- search_path so it can bypass RLS for this maintenance write regardless of
-- who invokes it; EXECUTE is revoked from PUBLIC so only service_role (and
-- the pg_cron job owner) can call it.
CREATE OR REPLACE FUNCTION public.flag_stale_offers()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  flagged_count INT;
BEGIN
  UPDATE public.offers
     SET needs_review = true
   WHERE last_verified_at < (now() - INTERVAL '6 months')::DATE
     AND needs_review = false
     AND is_active    = true;
  GET DIAGNOSTICS flagged_count = ROW_COUNT;
  RETURN flagged_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.flag_stale_offers() FROM PUBLIC;


-- pg_cron schedule -- only runs if the extension is installed. EXECUTE is
-- used so that the cron.schedule symbol is resolved at runtime (not parse
-- time), keeping this migration idempotent on projects where pg_cron is
-- not installed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    EXECUTE $cron$
      SELECT cron.schedule(
        'flag-stale-offers',
        '0 3 * * 1',
        $job$SELECT public.flag_stale_offers()$job$
      )
    $cron$;
  ELSE
    RAISE NOTICE 'pg_cron is not installed -- flag_stale_offers() must be run manually or scheduled after enabling pg_cron via CREATE EXTENSION pg_cron;';
  END IF;
END;
$$;


-- ---------------------------------------------------------------------------
-- Seed: 15 offer categories
-- ---------------------------------------------------------------------------
INSERT INTO public.offer_categories (name, slug, description, icon, display_order) VALUES
  ('Government Entitlements',   'government-entitlements',   'Statutory benefits and free services from Scottish Government, NHS, and local authorities.', 'landmark',     10),
  ('Free Software and Tools',   'free-software-and-tools',   'Free professional software for students -- design, development, productivity.',               'laptop',       20),
  ('Food and Drink',            'food-and-drink',            'Restaurant, cafe, and takeaway discounts.',                                                     'utensils',     30),
  ('Retail and Fashion',        'retail-and-fashion',        'Clothing, accessories, and general retail discounts.',                                          'shopping-bag', 40),
  ('Technology and Hardware',   'technology-and-hardware',   'Discounted laptops, phones, and accessories.',                                                   'smartphone',   50),
  ('Entertainment and Leisure', 'entertainment-and-leisure', 'Cinema, events, attractions, and activities.',                                                   'ticket',       60),
  ('Health and Wellbeing',      'health-and-wellbeing',      'Mental health, fitness, and wellness services.',                                                 'heart-pulse',  70),
  ('Transport and Travel',      'transport-and-travel',      'Rail, bus, and travel discounts.',                                                               'train',        80),
  ('Mobile and Broadband',      'mobile-and-broadband',      'Phone contracts and home broadband.',                                                            'wifi',         90),
  ('Banking and Finance',       'banking-and-finance',       'Student bank accounts and financial services.',                                                  'piggy-bank',  100),
  ('Accommodation Essentials',  'accommodation-essentials',  'Homewares, bedding, and move-in essentials.',                                                    'home',        110),
  ('Insurance',                 'insurance',                 'Contents, travel, and other student insurance.',                                                 'shield-check',120),
  ('Utilities',                 'utilities',                 'Energy, water, and utility providers.',                                                          'zap',         130),
  ('Gym and Fitness',           'gym-and-fitness',           'Gym memberships and fitness services.',                                                          'dumbbell',    140),
  ('Streaming and Media',       'streaming-and-media',       'Music, video, and audio streaming services.',                                                    'play-circle', 150)
ON CONFLICT (slug) DO NOTHING;
