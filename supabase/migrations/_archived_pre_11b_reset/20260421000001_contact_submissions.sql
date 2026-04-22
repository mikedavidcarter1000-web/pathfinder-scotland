-- Contact form submissions table
-- Every submission is stored here regardless of whether the email notification
-- (via Resend) succeeds. This ensures no message is ever lost.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  email_sent  BOOLEAN     NOT NULL DEFAULT false,
  email_error TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS for INSERT, so the server-side API route can always write.
-- Authenticated users (admins) can read all submissions.
CREATE POLICY "Authenticated users can read contact submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Intentionally no INSERT policy for anon/authenticated roles.
-- Inserts come exclusively from the server-side API route using the service role key.
