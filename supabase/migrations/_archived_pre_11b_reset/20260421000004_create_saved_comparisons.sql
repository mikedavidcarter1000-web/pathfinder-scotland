-- Stage 2.1 (part 3): saved_comparisons table.
-- Stores 2-3 role_ids per comparison, scoped to the authenticated user.
-- RLS: users can only see / mutate their own rows.

CREATE TABLE public.saved_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role_ids uuid[] NOT NULL CHECK (array_length(role_ids, 1) BETWEEN 2 AND 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX saved_comparisons_user_id_idx
  ON public.saved_comparisons(user_id);

CREATE TRIGGER set_saved_comparisons_updated_at
  BEFORE UPDATE ON public.saved_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.saved_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_comparisons_select_own"
  ON public.saved_comparisons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_comparisons_insert_own"
  ON public.saved_comparisons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_comparisons_update_own"
  ON public.saved_comparisons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_comparisons_delete_own"
  ON public.saved_comparisons
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
