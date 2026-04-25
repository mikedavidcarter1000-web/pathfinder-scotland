-- Migration: local_authority_portal
-- Tables: local_authorities, authority_staff, authority_audit_log, authority_invitations
-- Also adds visible_to_authority column to schools

-- 1a. local_authorities
CREATE TABLE local_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'standard', 'premium')),
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'cancelled')),
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_role TEXT,
  alert_config JSONB DEFAULT '{}',
  report_schedule JSONB DEFAULT '{}',
  share_national BOOLEAN DEFAULT false,
  share_national_opted_at TIMESTAMPTZ,
  term_dates JSONB DEFAULT '{}',
  api_key_hash TEXT,
  school_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_local_authorities_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER local_authorities_updated_at
  BEFORE UPDATE ON local_authorities
  FOR EACH ROW EXECUTE FUNCTION set_local_authorities_updated_at();

-- 1b. authority_staff
CREATE TABLE authority_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('la_admin', 'qio', 'data_analyst')),
  assigned_school_ids JSONB,
  can_export_data BOOLEAN DEFAULT true,
  can_manage_staff BOOLEAN DEFAULT false,
  can_configure_alerts BOOLEAN DEFAULT false,
  can_access_api BOOLEAN DEFAULT false,
  can_build_custom_reports BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, authority_id)
);

CREATE OR REPLACE FUNCTION set_authority_staff_permissions()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role = 'la_admin' THEN
    NEW.can_manage_staff     := true;
    NEW.can_configure_alerts := true;
    NEW.can_access_api       := true;
    NEW.can_build_custom_reports := true;
  ELSIF NEW.role = 'data_analyst' THEN
    NEW.can_access_api           := true;
    NEW.can_build_custom_reports := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER authority_staff_permissions
  BEFORE INSERT ON authority_staff
  FOR EACH ROW EXECUTE FUNCTION set_authority_staff_permissions();

-- 1c. authority_audit_log
CREATE TABLE authority_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES authority_staff(id),
  action TEXT NOT NULL,
  resource TEXT,
  filters_applied JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1d. authority_invitations
CREATE TABLE authority_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID REFERENCES local_authorities(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES authority_staff(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('la_admin', 'qio', 'data_analyst')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1e. Add visible_to_authority to schools
ALTER TABLE schools ADD COLUMN IF NOT EXISTS visible_to_authority BOOLEAN DEFAULT true;

-- Enable RLS on all new tables
ALTER TABLE local_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE authority_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE authority_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE authority_invitations ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's authority_id (SECURITY DEFINER bypasses RLS on authority_staff)
CREATE OR REPLACE FUNCTION my_authority_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT authority_id FROM authority_staff WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS: local_authorities -- public read (name/slug/code for registration dropdown)
CREATE POLICY "la_public_read"
  ON local_authorities FOR SELECT TO anon, authenticated USING (true);

-- RLS: authority_staff -- staff read own authority rows
CREATE POLICY "staff_read_own_authority"
  ON authority_staff FOR SELECT TO authenticated
  USING (authority_id = my_authority_id());

-- RLS: authority_audit_log -- staff read/insert for own authority
CREATE POLICY "staff_read_own_authority_logs"
  ON authority_audit_log FOR SELECT TO authenticated
  USING (authority_id = my_authority_id());

CREATE POLICY "staff_insert_logs"
  ON authority_audit_log FOR INSERT TO authenticated
  WITH CHECK (authority_id = my_authority_id());

-- RLS: authority_invitations -- LA admins read; all writes via service role in API
CREATE POLICY "la_admin_read_invitations"
  ON authority_invitations FOR SELECT TO authenticated
  USING (authority_id = my_authority_id());
