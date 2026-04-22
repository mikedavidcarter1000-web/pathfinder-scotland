-- Student benefits & discounts system
--
-- Tracks every free entitlement / discount available to Scottish students plus
-- affiliate-link infrastructure and click analytics for internal revenue
-- tracking. Government schemes are modelled alongside commercial discounts so
-- the catalogue acts as a single source of truth.

-- ============================================================================
-- Tables
-- ============================================================================

CREATE TABLE student_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'government', 'funding', 'food_drink', 'retail_fashion',
    'entertainment', 'technology', 'health_beauty', 'travel_transport',
    'banking', 'accommodation', 'education_tools'
  )),
  discount_value TEXT NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free', 'cashback', 'subscription', 'other')),
  eligibility_s1_s4 BOOLEAN DEFAULT false,
  eligibility_s5_s6 BOOLEAN DEFAULT false,
  eligibility_college BOOLEAN DEFAULT false,
  eligibility_university BOOLEAN DEFAULT false,
  min_age INT,
  max_age INT,
  access_method TEXT,
  access_platform TEXT,
  is_scotland_only BOOLEAN DEFAULT false,
  is_government_scheme BOOLEAN DEFAULT false,
  is_care_experienced_only BOOLEAN DEFAULT false,
  is_means_tested BOOLEAN DEFAULT false,
  url TEXT NOT NULL,
  affiliate_url TEXT,
  affiliate_network TEXT CHECK (affiliate_network IN ('awin', 'amazon', 'partnerize', 'rakuten', 'sovrn', 'skimlinks', 'direct')),
  affiliate_commission TEXT,
  affiliate_cookie_days INT,
  priority_score INT DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  seasonal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE benefit_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_id UUID REFERENCES student_benefits(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  is_affiliate BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  source_page TEXT
);

CREATE TABLE benefit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INT,
  is_government BOOLEAN DEFAULT false
);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE student_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON student_benefits FOR SELECT USING (true);
CREATE POLICY "Public read access" ON benefit_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated insert clicks" ON benefit_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role read clicks" ON benefit_clicks FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_sb_category ON student_benefits(category);
CREATE INDEX idx_sb_eligibility ON student_benefits(eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university);
CREATE INDEX idx_sb_government ON student_benefits(is_government_scheme);
CREATE INDEX idx_sb_active ON student_benefits(is_active);
CREATE INDEX idx_bc_benefit ON benefit_clicks(benefit_id);
CREATE INDEX idx_bc_student ON benefit_clicks(student_id);
CREATE INDEX idx_bc_date ON benefit_clicks(clicked_at);

-- ============================================================================
-- Seed: benefit_categories
-- ============================================================================

INSERT INTO benefit_categories (slug, name, description, display_order, is_government) VALUES
  ('government',       'Government Schemes',      'Free entitlements and support available to all Scottish students', 1, true),
  ('funding',          'Funding & Bursaries',     'Financial support for tuition, living costs, and special circumstances', 2, true),
  ('travel_transport', 'Travel & Transport',      'Free bus travel, rail discounts, and travel savings', 3, false),
  ('technology',       'Technology & Software',   'Free and discounted software, hardware, and developer tools', 4, false),
  ('food_drink',       'Food & Drink',            'Discounts at restaurants, takeaways, supermarkets, and delivery apps', 5, false),
  ('retail_fashion',   'Retail & Fashion',        'Savings on clothing, shoes, accessories, and outdoor gear', 6, false),
  ('entertainment',    'Entertainment & Leisure', 'Cinema, streaming, music, gyms, and cultural venues', 7, false),
  ('health_beauty',    'Health & Beauty',         'Healthcare, prescriptions, beauty products, and personal care', 8, false),
  ('banking',          'Student Banking',         'Bank accounts with interest-free overdrafts and signup bonuses', 9, false),
  ('accommodation',    'Accommodation',           'Housing support, free accommodation schemes, and hostel access', 10, false),
  ('education_tools',  'Education Tools',         'Learning platforms, stationery, and study resources', 11, false);
