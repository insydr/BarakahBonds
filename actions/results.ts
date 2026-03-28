'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserAssessment, getResponsesWithQuestions } from '@/lib/database/assessments'
import {
  calculateAssessmentScore,
  calculateScoreSummary,
  transformResponsesForScoring,
  type ScoreSummary
} from '@/lib/assessment/scoring'
import {
  detectRedFlags,
  countFlagsBySeverity
} from '@/lib/assessment/red-flags'
import {
  calculateCompatibilityScore,
  calculateCompatibilityBreakdown,
  type CompatibilityBreakdown
} from '@/lib/assessment/compatibility'
import { getQuestionCount } from '@/lib/database/questions'
import type { AssessmentSection } from '@/lib/supabase/types'
import type { RedFlag } from '@/lib/assessment/types'

interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * User's individual results data
 */
export interface UserResults {
  /** Overall score */
  overallScore: number
  /** Score summary with category and interpretation */
  scoreSummary: ScoreSummary
  /** User's section scores */
  sections: Array<{
    section: AssessmentSection
    score: number
    category: 'concern' | 'good' | 'excellent'
    answeredCount: number
    totalQuestions: number
    interpretation: string
  }>
  /** Detected red flags */
  flags: RedFlag[]
  /** Flag counts */
  flagCounts: {
    hard: number
    soft: number
    total: number
  }
  /** Completion confidence level */
  confidence: 'low' | 'medium' | 'high'
  /** Assessment completion date */
  completedAt: string | null
}

/**
 * Partner status and comparison data
 */
export interface PartnerResults {
  /** Whether user has a linked partner */
  hasPartner: boolean
  /** Partner's profile info */
  partnerProfile: {
    displayName: string
  } | null
  /** Whether partner has completed their assessment */
  partnerCompleted: boolean
  /** Compatibility breakdown (only if both completed) */
  compatibility: CompatibilityBreakdown | null
}

/**
 * Results data returned by getResultsAction
 */
export interface ResultsData {
  /** User's individual results */
  userResults: UserResults
  /** Partner status and compatibility */
  partnerResults: PartnerResults
}

/**
 * Get the current user's results data
 */
export async function getResultsAction(): Promise<ActionResult<ResultsData>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user's assessment
    const assessment = await getUserAssessment(user.id)

    if (assessment.status !== 'completed') {
      return { success: false, error: 'Assessment not completed' }
    }

    // Get responses with question context
    const responses = await getResponsesWithQuestions(assessment.id)

    // Transform responses for scoring
    const scoringInputs = transformResponsesForScoring(responses)

    // Get question counts
    const questionCounts = await getQuestionCount()

    // Calculate assessment score
    const assessmentScore = calculateAssessmentScore(scoringInputs, questionCounts)
    const scoreSummary = calculateScoreSummary(assessmentScore)

    // Detect red flags
    const flags = detectRedFlags(scoringInputs)
    const flagCounts = countFlagsBySeverity(flags)

    // Build section data with interpretations
    const sectionInterpretations: Record<AssessmentSection, string> = {
      deen: 'Your spiritual foundation and religious practice alignment.',
      dunya: 'Your approach to finances, career, and material aspects of life.',
      aila: 'Family dynamics, boundaries, and relationships with extended family.',
      nafs: 'Personal growth, mental health, and communication patterns.'
    }

    const sections = scoreSummary.sections.map((s) => ({
      section: s.section,
      score: s.score,
      category: s.category,
      answeredCount: s.answeredCount,
      totalQuestions: s.totalQuestions,
      interpretation: sectionInterpretations[s.section]
    }))

    // Build user results
    const userResults: UserResults = {
      overallScore: assessmentScore.overall,
      scoreSummary,
      sections,
      flags,
      flagCounts,
      confidence: assessmentScore.confidence,
      completedAt: assessment.completed_at
    }

    // Get partner status
    const partnerResults = await getPartnerResultsInternal(supabase, user.id, scoringInputs)

    return {
      success: true,
      data: {
        userResults,
        partnerResults
      }
    }
  } catch (error) {
    console.error('Error in getResultsAction:', error)
    return { success: false, error: 'Failed to get results' }
  }
}

/**
 * Get partner results and compatibility data
 */
export async function getPartnerResultsAction(): Promise<ActionResult<PartnerResults>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user's assessment and responses
    const assessment = await getUserAssessment(user.id)
    const responses = await getResponsesWithQuestions(assessment.id)
    const scoringInputs = transformResponsesForScoring(responses)

    const partnerResults = await getPartnerResultsInternal(supabase, user.id, scoringInputs)

    return {
      success: true,
      data: partnerResults
    }
  } catch (error) {
    console.error('Error in getPartnerResultsAction:', error)
    return { success: false, error: 'Failed to get partner results' }
  }
}

/**
 * Internal function to get partner results
 */
async function getPartnerResultsInternal(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  userId: string,
  userScoringInputs: ReturnType<typeof transformResponsesForScoring>
): Promise<PartnerResults> {
  // Check for linked partner
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .select('id, partner_1_id, partner_2_id, status')
    .or(`partner_1_id.eq.${userId},partner_2_id.eq.${userId}`)
    .eq('status', 'active')
    .maybeSingle()

  if (coupleError || !couple) {
    return {
      hasPartner: false,
      partnerProfile: null,
      partnerCompleted: false,
      compatibility: null
    }
  }

  // Get partner ID
  const partnerId = couple.partner_1_id === userId ? couple.partner_2_id : couple.partner_1_id

  if (!partnerId) {
    return {
      hasPartner: true,
      partnerProfile: null,
      partnerCompleted: false,
      compatibility: null
    }
  }

  // Get partner's profile
  const { data: partnerProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', partnerId)
    .single()

  // Check if partner has completed assessment
  const { data: partnerAssessment } = await supabase
    .from('assessments')
    .select('id, status')
    .eq('user_id', partnerId)
    .eq('status', 'completed')
    .maybeSingle()

  const partnerCompleted = !!partnerAssessment

  // If partner hasn't completed, return early
  if (!partnerCompleted || !partnerAssessment) {
    return {
      hasPartner: true,
      partnerProfile: partnerProfile ? { displayName: partnerProfile.display_name } : null,
      partnerCompleted: false,
      compatibility: null
    }
  }

  // Get partner's responses
  const { data: partnerResponses, error: partnerResponsesError } = await supabase
    .from('assessment_responses')
    .select(`
      question_id,
      response_value,
      question:questions (
        section,
        question_type
      )
    `)
    .eq('assessment_id', partnerAssessment.id)

  if (partnerResponsesError || !partnerResponses) {
    return {
      hasPartner: true,
      partnerProfile: partnerProfile ? { displayName: partnerProfile.display_name } : null,
      partnerCompleted: true,
      compatibility: null
    }
  }

  // Transform partner responses
  const partnerScoringInputs = transformResponsesForScoring(
    partnerResponses as Array<{
      question_id: string
      response_value: unknown
      question: { section: AssessmentSection; question_type: string }
    }>
  )

  // Calculate compatibility
  const compatibilityScore = calculateCompatibilityScore(userScoringInputs, partnerScoringInputs)
  const compatibilityBreakdown = calculateCompatibilityBreakdown(compatibilityScore)

  return {
    hasPartner: true,
    partnerProfile: partnerProfile ? { displayName: partnerProfile.display_name } : null,
    partnerCompleted: true,
    compatibility: compatibilityBreakdown
  }
}

/**
 * Send a reminder to partner to complete their assessment
 * Rate-limited to 1 per 24 hours
 */
export async function sendPartnerReminderAction(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check for linked partner
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('id, partner_1_id, partner_2_id, status')
      .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle()

    if (coupleError || !couple) {
      return { success: false, error: 'No partner linked' }
    }

    // Get partner ID
    const partnerId = couple.partner_1_id === user.id ? couple.partner_2_id : couple.partner_1_id

    if (!partnerId) {
      return { success: false, error: 'Partner not found' }
    }

    // Check rate limit - only 1 reminder per 24 hours
    const { data: recentReminders } = await supabase
      .from('audit_logs')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('action', 'partner_reminder_sent')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)

    if (recentReminders && recentReminders.length > 0) {
      return { success: false, error: 'You can only send one reminder per 24 hours' }
    }

    // Check if partner has already completed
    const { data: partnerAssessment } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', partnerId)
      .eq('status', 'completed')
      .maybeSingle()

    if (partnerAssessment) {
      return { success: false, error: 'Partner has already completed their assessment' }
    }

    // Log the reminder (for rate limiting)
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'partner_reminder_sent',
      resource_type: 'couple',
      resource_id: couple.id,
      metadata: { partner_id: partnerId }
    })

    // TODO: In a real app, send notification via email/push
    // For now, we just log it and return success
    // The partner will see a notification in their dashboard

    revalidatePath('/results')

    return { success: true }
  } catch (error) {
    console.error('Error in sendPartnerReminderAction:', error)
    return { success: false, error: 'Failed to send reminder' }
  }
}

/**
 * Check if user can view results (has completed assessment)
 */
export async function canViewResultsAction(): Promise<ActionResult<{ canView: boolean; status: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: assessment } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    const canView = assessment?.status === 'completed'

    return {
      success: true,
      data: {
        canView,
        status: assessment?.status || 'not_started'
      }
    }
  } catch (error) {
    console.error('Error in canViewResultsAction:', error)
    return { success: false, error: 'Failed to check results status' }
  }
}
