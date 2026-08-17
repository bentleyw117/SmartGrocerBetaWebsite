-- Applied to the existing Smart Grocer project.
-- Public/anon: INSERT-only. No public SELECT of the waitlist.

CREATE TABLE public.beta_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  zip text,
  stores_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  CONSTRAINT beta_waitlist_email_len CHECK (char_length(email) BETWEEN 3 AND 320),
  CONSTRAINT beta_waitlist_zip_format CHECK (zip IS NULL OR zip ~ '^\d{5}$')
);

CREATE UNIQUE INDEX beta_waitlist_email_lower_idx ON public.beta_waitlist (lower(email));

COMMENT ON TABLE public.beta_waitlist IS 'Public beta waitlist. Anon may INSERT only; no public SELECT.';

ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_waitlist FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.beta_waitlist FROM PUBLIC, anon, authenticated;
GRANT INSERT (email, name, zip, stores_text, user_agent) ON TABLE public.beta_waitlist TO anon;

CREATE POLICY beta_waitlist_anon_insert
  ON public.beta_waitlist
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL
    AND char_length(email) BETWEEN 3 AND 320
    AND (zip IS NULL OR zip ~ '^\d{5}$')
  );
