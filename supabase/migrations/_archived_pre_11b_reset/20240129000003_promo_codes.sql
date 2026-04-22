-- Promo Code System
-- Create and manage discount codes with usage tracking

-- ============================================
-- PROMO CODE TABLES
-- ============================================

-- Discount types
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_trial');

-- Main promo codes table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER,  -- NULL = unlimited
    max_uses_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to JSONB DEFAULT '{"all": true}',  -- Can specify product IDs, plans, etc.
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo code redemptions tracking
CREATE TABLE promo_code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID,  -- Reference to order/subscription if applicable
    discount_applied DECIMAL(10, 2) NOT NULL,
    original_amount DECIMAL(10, 2),
    final_amount DECIMAL(10, 2),
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promo_code_id, user_id, order_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until);
CREATE INDEX idx_promo_redemptions_user ON promo_code_redemptions(user_id);
CREATE INDEX idx_promo_redemptions_code ON promo_code_redemptions(promo_code_id);
CREATE INDEX idx_promo_redemptions_date ON promo_code_redemptions(redeemed_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Promo codes: Anyone can read active codes, only admins can modify
CREATE POLICY "Active promo codes are viewable"
    ON promo_codes FOR SELECT
    TO authenticated, anon
    USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Redemptions: Users can see their own redemptions
CREATE POLICY "Users can view own redemptions"
    ON promo_code_redemptions FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access to promo_codes"
    ON promo_codes FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access to redemptions"
    ON promo_code_redemptions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Validate a promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
    p_code TEXT,
    p_user_id UUID DEFAULT NULL,
    p_amount DECIMAL DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    promo promo_codes%ROWTYPE;
    user_redemptions INTEGER;
    total_redemptions INTEGER;
    check_user_id UUID;
BEGIN
    check_user_id := COALESCE(p_user_id, auth.uid());

    -- Find the promo code
    SELECT * INTO promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Invalid promo code');
    END IF;

    -- Check validity dates
    IF promo.valid_from > NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code not yet active');
    END IF;

    IF promo.valid_until IS NOT NULL AND promo.valid_until < NOW() THEN
        RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code has expired');
    END IF;

    -- Check minimum purchase amount
    IF p_amount < promo.min_purchase_amount THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'error', 'Minimum purchase amount not met',
            'min_amount', promo.min_purchase_amount
        );
    END IF;

    -- Check total usage limit
    IF promo.max_uses IS NOT NULL THEN
        SELECT COUNT(*) INTO total_redemptions
        FROM promo_code_redemptions
        WHERE promo_code_id = promo.id;

        IF total_redemptions >= promo.max_uses THEN
            RETURN jsonb_build_object('valid', FALSE, 'error', 'Promo code usage limit reached');
        END IF;
    END IF;

    -- Check per-user usage limit
    IF check_user_id IS NOT NULL AND promo.max_uses_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO user_redemptions
        FROM promo_code_redemptions
        WHERE promo_code_id = promo.id AND user_id = check_user_id;

        IF user_redemptions >= promo.max_uses_per_user THEN
            RETURN jsonb_build_object('valid', FALSE, 'error', 'You have already used this promo code');
        END IF;
    END IF;

    -- Code is valid - calculate discount
    RETURN jsonb_build_object(
        'valid', TRUE,
        'promo_code_id', promo.id,
        'code', promo.code,
        'description', promo.description,
        'discount_type', promo.discount_type,
        'discount_value', promo.discount_value,
        'calculated_discount', CASE
            WHEN promo.discount_type = 'percentage' THEN ROUND(p_amount * (promo.discount_value / 100), 2)
            WHEN promo.discount_type = 'fixed_amount' THEN LEAST(promo.discount_value, p_amount)
            ELSE 0
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redeem a promo code
CREATE OR REPLACE FUNCTION redeem_promo_code(
    p_code TEXT,
    p_amount DECIMAL,
    p_order_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    validation JSONB;
    redemption_id UUID;
    final_amount DECIMAL;
    discount_amount DECIMAL;
BEGIN
    -- Validate first
    validation := validate_promo_code(p_code, auth.uid(), p_amount);

    IF NOT (validation->>'valid')::BOOLEAN THEN
        RETURN validation;
    END IF;

    -- Calculate amounts
    discount_amount := (validation->>'calculated_discount')::DECIMAL;
    final_amount := p_amount - discount_amount;

    -- Record redemption
    INSERT INTO promo_code_redemptions (
        promo_code_id,
        user_id,
        order_id,
        discount_applied,
        original_amount,
        final_amount
    )
    VALUES (
        (validation->>'promo_code_id')::UUID,
        auth.uid(),
        p_order_id,
        discount_amount,
        p_amount,
        final_amount
    )
    RETURNING id INTO redemption_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'redemption_id', redemption_id,
        'original_amount', p_amount,
        'discount_applied', discount_amount,
        'final_amount', final_amount,
        'promo_code', validation->>'code'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get promo code stats (admin function)
CREATE OR REPLACE FUNCTION get_promo_code_stats(p_code_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'promo_code_id', pc.id,
        'code', pc.code,
        'total_redemptions', COUNT(pcr.id),
        'total_discount_given', COALESCE(SUM(pcr.discount_applied), 0),
        'total_revenue_generated', COALESCE(SUM(pcr.final_amount), 0),
        'unique_users', COUNT(DISTINCT pcr.user_id),
        'remaining_uses', CASE
            WHEN pc.max_uses IS NULL THEN NULL
            ELSE pc.max_uses - COUNT(pcr.id)
        END,
        'is_active', pc.is_active,
        'valid_until', pc.valid_until
    )
    INTO result
    FROM promo_codes pc
    LEFT JOIN promo_code_redemptions pcr ON pcr.promo_code_id = pc.id
    WHERE pc.id = p_code_id
    GROUP BY pc.id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_promo_codes
    AFTER INSERT OR UPDATE OR DELETE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_promo_redemptions
    AFTER INSERT OR UPDATE OR DELETE ON promo_code_redemptions
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT USAGE ON TYPE discount_type TO authenticated, anon;
GRANT SELECT ON promo_codes TO authenticated, anon;
GRANT SELECT ON promo_code_redemptions TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code TO authenticated, anon;
GRANT EXECUTE ON FUNCTION redeem_promo_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_promo_code_stats TO service_role;

-- ============================================
-- SAMPLE PROMO CODES
-- ============================================

INSERT INTO promo_codes (code, description, discount_type, discount_value, max_uses, valid_until) VALUES
('WELCOME10', 'Welcome discount - 10% off first purchase', 'percentage', 10, NULL, '2027-12-31 23:59:59+00'),
('STUDENT25', 'Student discount - 25% off', 'percentage', 25, 1000, '2026-12-31 23:59:59+00'),
('EARLYBIRD', 'Early adopter - £5 off', 'fixed_amount', 5, 500, '2026-06-30 23:59:59+00');
