-- Seed launch promo codes
-- Uses ON CONFLICT DO NOTHING so this is safe to re-run

INSERT INTO promo_codes (code, description, discount_type, discount_value, max_uses, valid_until, is_active)
VALUES
  (
    'LAUNCH50',
    'Launch discount — 50% off any paid plan',
    'percentage',
    50,
    100,     -- max 100 total uses
    NULL,    -- no expiry
    TRUE
  ),
  (
    'CAREFREE',
    'Free access for care-experienced students',
    'percentage',
    100,
    NULL,    -- unlimited uses
    NULL,    -- no expiry
    TRUE
  ),
  (
    'SCHOOL2025',
    'School partnership discount — 50% off',
    'percentage',
    50,
    NULL,    -- unlimited uses
    NULL,    -- no expiry
    TRUE
  )
ON CONFLICT (code) DO NOTHING;
