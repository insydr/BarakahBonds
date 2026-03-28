import { createClient } from '@/lib/supabase/server'
import type {
  Assessment,
  AssessmentResponse,
  AssessmentSection,
  AssessmentStatus,
  AssessmentScores,
  AssessmentFlag,
  AssessmentProgress,
  Json
} from '@/lib/supabase/types'

/**
 * Get or create a user's assessment
 * If no assessment exists, creates a new one with 'not_started' status
 */
export async function getUserAssessment(userId: string): Promise<Assessment> {
  const supabase = await createClient()

  // Try to get existing assessment
  const { data: existing, error: fetchError } = await supabase
    .from('assessments')
    .select(`
      id,
      user_id,
      status,
      current_section,
      started_at,
      completed_at,
      scores,
      flags,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) {
    console.error('Error fetching user assessment:', fetchError)
    throw new Error('Failed to fetch user assessment')
  }

  if (existing) {
    return existing as Assessment
  }

  // Create new assessment if none exists
  const { data: newAssessment, error: createError } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      status: 'not_started'
    })
    .select(`
      id,
      user_id,
      status,
      current_section,
      started_at,
      completed_at,
      scores,
      flags,
      created_at,
      updated_at
    `)
    .single()

  if (createError) {
    console.error('Error creating user assessment:', createError)
    throw new Error('Failed to create user assessment')
  }

  return newAssessment as Assessment
}

/**
 * Update assessment progress (status and current section)
 */
export async function updateAssessmentProgress(
  assessmentId: string,
  updates: {
    status?: AssessmentStatus
    currentSection?: AssessmentSection | null
    startedAt?: string
  }
): Promise<Assessment> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  if (updates.status !== undefined) {
    updateData.status = updates.status
  }

  if (updates.currentSection !== undefined) {
    updateData.current_section = updates.currentSection
  }

  if (updates.startedAt !== undefined) {
    updateData.started_at = updates.startedAt
  }

  const { data, error } = await supabase
    .from('assessments')
    .update(updateData)
    .eq('id', assessmentId)
    .select(`
      id,
      user_id,
      status,
      current_section,
      started_at,
      completed_at,
      scores,
      flags,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error('Error updating assessment progress:', error)
    throw new Error('Failed to update assessment progress')
  }

  return data as Assessment
}

/**
 * Save a response to a question
 * Uses upsert to handle both insert and update
 */
export async function saveResponse(
  assessmentId: string,
  questionId: string,
  responseValue: unknown
): Promise<AssessmentResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessment_responses')
    .upsert(
      {
        assessment_id: assessmentId,
        question_id: questionId,
        response_value: responseValue as Json,
        responded_at: new Date().toISOString()
      },
      {
        onConflict: 'assessment_id,question_id'
      }
    )
    .select(`
      id,
      assessment_id,
      question_id,
      response_value,
      responded_at
    `)
    .single()

  if (error) {
    console.error('Error saving response:', error)
    throw new Error('Failed to save response')
  }

  return data as AssessmentResponse
}

/**
 * Complete an assessment with final scores and flags
 */
export async function completeAssessment(
  assessmentId: string,
  scores: AssessmentScores,
  flags: AssessmentFlag[]
): Promise<Assessment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      scores: scores as unknown as Json,
      flags: flags as unknown as Json
    })
    .eq('id', assessmentId)
    .select(`
      id,
      user_id,
      status,
      current_section,
      started_at,
      completed_at,
      scores,
      flags,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error('Error completing assessment:', error)
    throw new Error('Failed to complete assessment')
  }

  return data as Assessment
}

/**
 * Get all responses for an assessment
 */
export async function getResponses(assessmentId: string): Promise<AssessmentResponse[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessment_responses')
    .select(`
      id,
      assessment_id,
      question_id,
      response_value,
      responded_at
    `)
    .eq('assessment_id', assessmentId)
    .order('responded_at', { ascending: true })

  if (error) {
    console.error('Error fetching responses:', error)
    throw new Error('Failed to fetch responses')
  }

  return data as AssessmentResponse[]
}

/**
 * Get assessment progress using the database function
 */
export async function getAssessmentProgress(
  assessmentId: string
): Promise<AssessmentProgress> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_assessment_progress', {
    assessment_uuid: assessmentId
  })

  if (error) {
    console.error('Error fetching assessment progress:', error)
    throw new Error('Failed to fetch assessment progress')
  }

  return data as unknown as AssessmentProgress
}

/**
 * Check if user has completed their assessment
 */
export async function hasCompletedAssessment(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessments')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .maybeSingle()

  if (error) {
    console.error('Error checking assessment completion:', error)
    throw new Error('Failed to check assessment completion')
  }

  return !!data
}

/**
 * Get assessment by ID (with ownership check)
 */
export async function getAssessmentById(
  assessmentId: string,
  userId: string
): Promise<Assessment | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      id,
      user_id,
      status,
      current_section,
      started_at,
      completed_at,
      scores,
      flags,
      created_at,
      updated_at
    `)
    .eq('id', assessmentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching assessment by ID:', error)
    throw new Error('Failed to fetch assessment')
  }

  return data as Assessment | null
}

/**
 * Delete a response (for retaking a question)
 */
export async function deleteResponse(
  assessmentId: string,
  questionId: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('assessment_responses')
    .delete()
    .eq('assessment_id', assessmentId)
    .eq('question_id', questionId)

  if (error) {
    console.error('Error deleting response:', error)
    throw new Error('Failed to delete response')
  }
}

/**
 * Get responses with question details for scoring
 */
export async function getResponsesWithQuestions(
  assessmentId: string
): Promise<Array<AssessmentResponse & { question: { section: AssessmentSection; question_type: string } }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessment_responses')
    .select(`
      id,
      assessment_id,
      question_id,
      response_value,
      responded_at,
      question:questions (
        section,
        question_type
      )
    `)
    .eq('assessment_id', assessmentId)

  if (error) {
    console.error('Error fetching responses with questions:', error)
    throw new Error('Failed to fetch responses with questions')
  }

  return data as Array<AssessmentResponse & { question: { section: AssessmentSection; question_type: string } }>
}

/**
 * Start an assessment (transition from not_started to in_progress)
 */
export async function startAssessment(assessmentId: string): Promise<Assessment> {
  return updateAssessmentProgress(assessmentId, {
    status: 'in_progress',
    currentSection: 'deen', // Start with Deen section
    startedAt: new Date().toISOString()
  })
}
