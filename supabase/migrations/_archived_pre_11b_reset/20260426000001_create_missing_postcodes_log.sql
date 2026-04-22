-- Tracks postcodes that passed UK-format validation and postcodes.io
-- existence + Scotland checks, but are missing from simd_postcodes.
-- Used to size the simd_postcodes refresh backlog (Stage 1.5b).

CREATE TABLE IF NOT EXISTS public.missing_postcodes_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postcode    text NOT NULL UNIQUE,
  first_seen  timestamptz NOT NULL DEFAULT now(),
  last_seen   timestamptz NOT NULL DEFAULT now(),
  count       integer NOT NULL DEFAULT 1,
  source      text NULL
);

CREATE INDEX IF NOT EXISTS missing_postcodes_log_postcode_idx
  ON public.missing_postcodes_log (postcode);

ALTER TABLE public.missing_postcodes_log ENABLE ROW LEVEL SECURITY;

-- No public SELECT / UPDATE / DELETE policies. Writes happen via a
-- SECURITY DEFINER function so the anon role never touches the table
-- directly.

CREATE OR REPLACE FUNCTION public.log_missing_postcode(
  p_postcode text,
  p_source   text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_postcode IS NULL OR length(trim(p_postcode)) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.missing_postcodes_log (postcode, source)
  VALUES (upper(trim(p_postcode)), p_source)
  ON CONFLICT (postcode) DO UPDATE
  SET count     = public.missing_postcodes_log.count + 1,
      last_seen = now(),
      source    = COALESCE(EXCLUDED.source, public.missing_postcodes_log.source);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_missing_postcode(text, text) TO anon, authenticated;

COMMENT ON TABLE public.missing_postcodes_log IS
  'Scottish postcodes that passed postcodes.io validation but are absent from simd_postcodes. Used to prioritise the Stage 1.5b SIMD data refresh.';

COMMENT ON FUNCTION public.log_missing_postcode(text, text) IS
  'Increments or creates a missing_postcodes_log row. Called from server actions when a valid Scottish postcode has no SIMD match.';
