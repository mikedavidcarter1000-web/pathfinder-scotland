-- P1 #6: schema-qualify all table references inside get_user_subscription so
-- the function works correctly under SET search_path TO ''.
-- The empty search_path is a security measure and must stay; the fix is to
-- prefix every unqualified relation with its schema (public.*).
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    FROM public.stripe_subscriptions s
    LEFT JOIN public.stripe_prices p ON p.stripe_price_id = s.stripe_price_id
    LEFT JOIN public.stripe_products pr ON pr.id = p.product_id
    WHERE s.user_id = check_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF result IS NULL THEN
        result := jsonb_build_object('has_subscription', FALSE);
    END IF;

    RETURN result;
END;
$function$;
