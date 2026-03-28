-- Initial Schema for Barakah Bonds
-- Phase 1: Foundation & Trust

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  privacy_settings JSONB DEFAULT '{
    "burn_after_reading": false,
    "retention_days": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples table for partner linking
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT UNIQUE NOT NULL,
  invitation_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_invitation_code CHECK (LENGTH(invitation_code) = 8)
);

-- Audit log (immutable record of sensitive operations)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_couples_partner_1 ON public.couples(partner_1_id);
CREATE INDEX idx_couples_partner_2 ON public.couples(partner_2_id);
CREATE INDEX idx_couples_status ON public.couples(status);
CREATE INDEX idx_couples_invitation_code ON public.couples(invitation_code);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Partners can view each other's profiles (when couple is active)
CREATE POLICY "Partners can view each other's profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE status = 'active'
      AND (
        (partner_1_id = auth.uid() AND partner_2_id = profiles.id)
        OR
        (partner_2_id = auth.uid() AND partner_1_id = profiles.id)
      )
    )
  );

-- ============================================================================
-- COUPLES POLICIES
-- ============================================================================

-- Users can view their own couple record
CREATE POLICY "Users can view own couple"
  ON public.couples FOR SELECT
  USING (
    auth.uid() = partner_1_id
    OR auth.uid() = partner_2_id
  );

-- Only partner_1 can create (generate invitation)
CREATE POLICY "Only partner_1 can create couple"
  ON public.couples FOR INSERT
  WITH CHECK (auth.uid() = partner_1_id);

-- Both partners can update (status changes)
CREATE POLICY "Partners can update couple"
  ON public.couples FOR UPDATE
  USING (
    auth.uid() = partner_1_id
    OR auth.uid() = partner_2_id
  );

-- Both partners can delete (disconnect)
CREATE POLICY "Partners can delete couple"
  ON public.couples FOR DELETE
  USING (
    auth.uid() = partner_1_id
    OR auth.uid() = partner_2_id
  );

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert (via service role or trigger)
-- Application uses service role key for audit log insertion
CREATE POLICY "System only can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (false);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's partner ID (if any)
CREATE OR REPLACE FUNCTION public.get_partner_id()
RETURNS UUID AS $$
DECLARE
  partner_uuid UUID;
BEGIN
  SELECT
    CASE
      WHEN partner_1_id = auth.uid() THEN partner_2_id
      WHEN partner_2_id = auth.uid() THEN partner_1_id
      ELSE NULL
    END INTO partner_uuid
  FROM public.couples
  WHERE status = 'active'
  AND (partner_1_id = auth.uid() OR partner_2_id = auth.uid());

  RETURN partner_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has active couple
CREATE OR REPLACE FUNCTION public.has_active_couple()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.couples
    WHERE status = 'active'
    AND (partner_1_id = auth.uid() OR partner_2_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
