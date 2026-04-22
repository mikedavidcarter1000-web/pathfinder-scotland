-- Stripe Integration
-- Customer management, subscriptions, and payment tracking

-- ============================================
-- SUBSCRIPTION STATUS ENUM
-- ============================================

CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);

-- ============================================
-- STRIPE TABLES
-- ============================================

-- Stripe customers (linked to auth.users)
CREATE TABLE stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (synced from Stripe)
CREATE TABLE stripe_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_product_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prices (synced from Stripe)
CREATE TABLE stripe_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_price_id TEXT NOT NULL UNIQUE,
    product_id UUID REFERENCES stripe_products(id) ON DELETE CASCADE,
    stripe_product_id TEXT,
    active BOOLEAN DEFAULT TRUE,
    currency TEXT DEFAULT 'gbp',
    unit_amount INTEGER, -- in pence
    recurring_interval TEXT, -- 'month', 'year', null for one-time
    recurring_interval_count INTEGER DEFAULT 1,
    trial_period_days INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE stripe_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT,
    status subscription_status NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE stripe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    amount INTEGER NOT NULL, -- in pence
    currency TEXT DEFAULT 'gbp',
    status TEXT NOT NULL, -- 'succeeded', 'pending', 'failed'
    description TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX idx_stripe_payments_user_id ON stripe_payments(user_id);
CREATE INDEX idx_stripe_payments_stripe_id ON stripe_payments(stripe_payment_intent_id);
CREATE INDEX idx_stripe_prices_product_id ON stripe_prices(product_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

-- Customers: Users can view their own
CREATE POLICY "Users can view own stripe customer"
    ON stripe_customers FOR SELECT
    USING (auth.uid() = user_id);

-- Products: Public read
CREATE POLICY "Products are viewable by everyone"
    ON stripe_products FOR SELECT
    TO authenticated, anon
    USING (active = TRUE);

-- Prices: Public read
CREATE POLICY "Prices are viewable by everyone"
    ON stripe_prices FOR SELECT
    TO authenticated, anon
    USING (active = TRUE);

-- Subscriptions: Users can view their own
CREATE POLICY "Users can view own subscriptions"
    ON stripe_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Payments: Users can view their own
CREATE POLICY "Users can view own payments"
    ON stripe_payments FOR SELECT
    USING (auth.uid() = user_id);

-- Service role full access for webhook updates
CREATE POLICY "Service role manages stripe_customers"
    ON stripe_customers FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages stripe_products"
    ON stripe_products FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages stripe_prices"
    ON stripe_prices FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages stripe_subscriptions"
    ON stripe_subscriptions FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages stripe_payments"
    ON stripe_payments FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get user's active subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    check_user_id UUID;
    result JSONB;
BEGIN
    check_user_id := COALESCE(p_user_id, auth.uid());

    SELECT jsonb_build_object(
        'has_subscription', TRUE,
        'subscription_id', s.stripe_subscription_id,
        'status', s.status,
        'current_period_end', s.current_period_end,
        'cancel_at', s.cancel_at,
        'price', jsonb_build_object(
            'id', p.stripe_price_id,
            'amount', p.unit_amount,
            'currency', p.currency,
            'interval', p.recurring_interval
        ),
        'product', jsonb_build_object(
            'id', pr.stripe_product_id,
            'name', pr.name
        )
    )
    INTO result
    FROM stripe_subscriptions s
    LEFT JOIN stripe_prices p ON p.stripe_price_id = s.stripe_price_id
    LEFT JOIN stripe_products pr ON pr.id = p.product_id
    WHERE s.user_id = check_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF result IS NULL THEN
        result := jsonb_build_object('has_subscription', FALSE);
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    check_user_id UUID;
BEGIN
    check_user_id := COALESCE(p_user_id, auth.uid());

    RETURN EXISTS (
        SELECT 1 FROM stripe_subscriptions
        WHERE user_id = check_user_id
        AND status IN ('active', 'trialing')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_products_updated_at
    BEFORE UPDATE ON stripe_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_prices_updated_at
    BEFORE UPDATE ON stripe_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_stripe_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON stripe_subscriptions
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_stripe_payments
    AFTER INSERT OR UPDATE OR DELETE ON stripe_payments
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT USAGE ON TYPE subscription_status TO authenticated, anon;
GRANT SELECT ON stripe_customers TO authenticated;
GRANT SELECT ON stripe_products TO authenticated, anon;
GRANT SELECT ON stripe_prices TO authenticated, anon;
GRANT SELECT ON stripe_subscriptions TO authenticated;
GRANT SELECT ON stripe_payments TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription TO authenticated;
