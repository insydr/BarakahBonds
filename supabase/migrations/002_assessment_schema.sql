-- Assessment Schema for Barakah Bonds
-- Phase 2: Assessment Engine

-- ============================================================================
-- TABLES
-- ============================================================================

-- Citations table (must be created first as questions reference it)
CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('quran', 'hadith')),
  source TEXT NOT NULL,
  reference TEXT NOT NULL,
  arabic_text TEXT,
  translation TEXT NOT NULL,
  scholar_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.citations IS 'Islamic scholarly citations (Quran verses and Hadith) for assessment questions';
COMMENT ON COLUMN public.citations.type IS 'Type of citation: quran or hadith';
COMMENT ON COLUMN public.citations.source IS 'Source name (e.g., "Sahih Bukhari", "Surah Al-Baqarah")';
COMMENT ON COLUMN public.citations.reference IS 'Reference (e.g., "2:177", "Book 1, Hadith 1")';
COMMENT ON COLUMN public.citations.arabic_text IS 'Original Arabic text';
COMMENT ON COLUMN public.citations.translation IS 'English translation';
COMMENT ON COLUMN public.citations.scholar_verified IS 'Whether this citation has been verified by a scholar';

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL CHECK (section IN ('deen', 'dunya', 'aila', 'nafs')),
  order_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('likert', 'multiple_choice', 'open_text')),
  options JSONB,
  citation_id UUID REFERENCES public.citations(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  scholar_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_section_order UNIQUE (section, order_index, version)
);

COMMENT ON TABLE public.questions IS 'Assessment questions organized by section';
COMMENT ON COLUMN public.questions.section IS 'Assessment section: deen (Faith), dunya (Finances), aila (Family), nafs (Self)';
COMMENT ON COLUMN public.questions.order_index IS 'Display order within section';
COMMENT ON COLUMN public.questions.question_type IS 'Response type: likert (1-5), multiple_choice, open_text';
COMMENT ON COLUMN public.questions.options IS 'JSONB array of options for multiple_choice questions';
COMMENT ON COLUMN public.questions.version IS 'Question version for updates without breaking in-progress assessments';
COMMENT ON COLUMN public.questions.active IS 'Whether question is currently active';
COMMENT ON COLUMN public.questions.scholar_verified IS 'Whether question has been reviewed by Islamic scholar';

-- Assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  current_section TEXT CHECK (current_section IN ('deen', 'dunya', 'aila', 'nafs')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scores JSONB DEFAULT '{}'::jsonb,
  flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT one_assessment_per_user UNIQUE (user_id)
);

COMMENT ON TABLE public.assessments IS 'User assessment records with progress tracking';
COMMENT ON COLUMN public.assessments.status IS 'Assessment status: not_started, in_progress, completed';
COMMENT ON COLUMN public.assessments.current_section IS 'Current section being worked on';
COMMENT ON COLUMN public.assessments.scores IS 'Category scores after completion (JSONB with section scores)';
COMMENT ON COLUMN public.assessments.flags IS 'Red flags detected during assessment (JSONB array)';

-- Assessment responses table
CREATE TABLE public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  response_value JSONB NOT NULL,
  responded_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_response_per_question UNIQUE (assessment_id, question_id)
);

COMMENT ON TABLE public.assessment_responses IS 'Individual question responses linked to assessments';
COMMENT ON COLUMN public.assessment_responses.response_value IS 'Response value (encrypted for sensitive data)';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Citations indexes
CREATE INDEX idx_citations_type ON public.citations(type);
CREATE INDEX idx_citations_scholar_verified ON public.citations(scholar_verified);

-- Questions indexes
CREATE INDEX idx_questions_section ON public.questions(section);
CREATE INDEX idx_questions_order ON public.questions(section, order_index);
CREATE INDEX idx_questions_active ON public.questions(active);
CREATE INDEX idx_questions_scholar_verified ON public.questions(scholar_verified);
CREATE INDEX idx_questions_citation ON public.questions(citation_id);

-- Assessments indexes
CREATE INDEX idx_assessments_user ON public.assessments(user_id);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessments_created ON public.assessments(created_at);

-- Assessment responses indexes
CREATE INDEX idx_responses_assessment ON public.assessment_responses(assessment_id);
CREATE INDEX idx_responses_question ON public.assessment_responses(question_id);
CREATE INDEX idx_responses_responded ON public.assessment_responses(responded_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CITATIONS POLICIES
-- ============================================================================

-- All authenticated users can view scholar_verified citations
CREATE POLICY "Users can view verified citations"
  ON public.citations FOR SELECT
  TO authenticated
  USING (scholar_verified = true);

-- No user INSERT/UPDATE/DELETE (admin only via service role)
CREATE POLICY "System only can insert citations"
  ON public.citations FOR INSERT
  WITH CHECK (false);

CREATE POLICY "System only can update citations"
  ON public.citations FOR UPDATE
  USING (false);

CREATE POLICY "System only can delete citations"
  ON public.citations FOR DELETE
  USING (false);

-- ============================================================================
-- QUESTIONS POLICIES
-- ============================================================================

-- All authenticated users can view active, scholar_verified questions
CREATE POLICY "Users can view active verified questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (active = true AND scholar_verified = true);

-- No user INSERT/UPDATE/DELETE (admin only via service role)
CREATE POLICY "System only can insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (false);

CREATE POLICY "System only can update questions"
  ON public.questions FOR UPDATE
  USING (false);

CREATE POLICY "System only can delete questions"
  ON public.questions FOR DELETE
  USING (false);

-- ============================================================================
-- ASSESSMENTS POLICIES
-- ============================================================================

-- Users can view only their own assessments (partners CANNOT see)
CREATE POLICY "Users can view own assessment"
  ON public.assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own assessment (one per user enforced by constraint)
CREATE POLICY "Users can insert own assessment"
  ON public.assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessment
CREATE POLICY "Users can update own assessment"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own assessment (for account deletion)
CREATE POLICY "Users can delete own assessment"
  ON public.assessments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- ASSESSMENT RESPONSES POLICIES
-- ============================================================================

-- Users can view only their own responses (via assessment ownership)
CREATE POLICY "Users can view own responses"
  ON public.assessment_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- Users can insert responses for their own assessment
CREATE POLICY "Users can insert own responses"
  ON public.assessment_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- Users can update their own responses
CREATE POLICY "Users can update own responses"
  ON public.assessment_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- Users can delete their own responses
CREATE POLICY "Users can delete own responses"
  ON public.assessment_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = assessment_responses.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's assessment ID (returns NULL if none exists)
CREATE OR REPLACE FUNCTION public.get_user_assessment_id()
RETURNS UUID AS $$
DECLARE
  assessment_uuid UUID;
BEGIN
  SELECT id INTO assessment_uuid
  FROM public.assessments
  WHERE user_id = auth.uid()
  LIMIT 1;

  RETURN assessment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_assessment_id() IS 'Returns the current user assessment ID or NULL if none exists';

-- Check if user has completed their assessment
CREATE OR REPLACE FUNCTION public.has_completed_assessment()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.assessments
    WHERE user_id = auth.uid()
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.has_completed_assessment() IS 'Returns true if user has completed their assessment';

-- Get assessment progress (responses count / total questions)
CREATE OR REPLACE FUNCTION public.get_assessment_progress(assessment_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  total_questions INTEGER;
  answered_questions INTEGER;
  section_stats JSONB;
BEGIN
  -- Get total active verified questions
  SELECT COUNT(*) INTO total_questions
  FROM public.questions
  WHERE active = true AND scholar_verified = true;

  -- Get answered questions for this assessment
  SELECT COUNT(*) INTO answered_questions
  FROM public.assessment_responses
  WHERE assessment_id = assessment_uuid;

  -- Get per-section progress
  SELECT jsonb_object_agg(
    section,
    jsonb_build_object(
      'total', section_total,
      'answered', section_answered
    )
  ) INTO section_stats
  FROM (
    SELECT
      q.section,
      COUNT(DISTINCT q.id) as section_total,
      COUNT(DISTINCT ar.id) as section_answered
    FROM public.questions q
    LEFT JOIN public.assessment_responses ar
      ON ar.question_id = q.id AND ar.assessment_id = assessment_uuid
    WHERE q.active = true AND q.scholar_verified = true
    GROUP BY q.section
  ) subq;

  RETURN jsonb_build_object(
    'total_questions', total_questions,
    'answered_questions', answered_questions,
    'percentage', CASE WHEN total_questions > 0
      THEN ROUND((answered_questions::NUMERIC / total_questions) * 100, 1)
      ELSE 0 END,
    'sections', COALESCE(section_stats, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_assessment_progress(UUID) IS 'Returns assessment progress with total, answered, and per-section breakdown';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp for questions
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update updated_at timestamp for assessments
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
