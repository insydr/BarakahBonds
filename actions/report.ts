'use server'

import { createClient } from '@/lib/supabase/server'
import { generateCoupleReport, type CoupleReportProps } from '@/lib/pdf/couple-report'
import {
  calculateCompatibilityScore,
  transformResponsesForScoring
} from '@/lib/assessment/compatibility'
import { detectRedFlags } from '@/lib/assessment/red-flags'
import { calculateAssessmentScore } from '@/lib/assessment/scoring'
import { format } from 'date-fns'

interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

interface ReportStatus {
  status: 'ready' | 'waiting_partner' | 'incomplete'
  userCompleted: boolean
  partnerCompleted: boolean
  partnerName?: string
}

/**
 * Check if the couple can generate a report
 * Returns the status of both partners' assessments
 */
export async function getReportStatusAction(): Promise<ActionResult<ReportStatus>> {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user's assessment status
    const { data: userAssessment } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    const userCompleted = userAssessment?.status === 'completed'

    // Get couple relationship
    const { data: couple } = await supabase
      .from('couples')
      .select('id, partner_1_id, partner_2_id, status')
      .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle()

    if (!couple) {
      return {
        success: true,
        data: {
          status: 'incomplete',
          userCompleted,
          partnerCompleted: false
        }
      }
    }

    // Get partner ID
    const partnerId =
      couple.partner_1_id === user.id ? couple.partner_2_id : couple.partner_1_id

    if (!partnerId) {
      return {
        success: true,
        data: {
          status: 'waiting_partner',
          userCompleted,
          partnerCompleted: false
        }
      }
    }

    // Get partner's profile
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', partnerId)
      .single()

    // Get partner's assessment status
    const { data: partnerAssessment } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', partnerId)
      .maybeSingle()

    const partnerCompleted = partnerAssessment?.status === 'completed'

    // Determine overall status
    let status: ReportStatus['status']
    if (userCompleted && partnerCompleted) {
      status = 'ready'
    } else if (!userCompleted) {
      status = 'incomplete'
    } else {
      status = 'waiting_partner'
    }

    return {
      success: true,
      data: {
        status,
        userCompleted,
        partnerCompleted,
        partnerName: partnerProfile?.display_name
      }
    }
  } catch (error) {
    console.error('Error in getReportStatusAction:', error)
    return { success: false, error: 'Failed to get report status' }
  }
}

/**
 * Generate a report for the couple
 * Returns the PDF as a base64 string for client download
 */
export async function generateReportAction(): Promise<
  ActionResult<{ pdfBase64: string; filename: string }>
> {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, privacy_settings')
      .eq('id', user.id)
      .single()

    // Get couple relationship
    const { data: couple } = await supabase
      .from('couples')
      .select('id, partner_1_id, partner_2_id, status')
      .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle()

    if (!couple) {
      return { success: false, error: 'No active couple relationship found' }
    }

    // Get partner ID
    const partnerId =
      couple.partner_1_id === user.id ? couple.partner_2_id : couple.partner_1_id

    if (!partnerId) {
      return { success: false, error: 'Partner not linked yet' }
    }

    // Get partner's profile
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', partnerId)
      .single()

    // Get both assessments
    const { data: userAssessment } = await supabase
      .from('assessments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .maybeSingle()

    const { data: partnerAssessment } = await supabase
      .from('assessments')
      .select('id, status')
      .eq('user_id', partnerId)
      .eq('status', 'completed')
      .maybeSingle()

    if (!userAssessment || !partnerAssessment) {
      return {
        success: false,
        error: 'Both partners must complete their assessments'
      }
    }

    // Get responses for both partners
    const { data: userResponses } = await supabase
      .from('assessment_responses')
      .select(
        `
        id,
        question_id,
        response_value,
        question:questions (
          section,
          question_type
        )
      `
      )
      .eq('assessment_id', userAssessment.id)

    const { data: partnerResponses } = await supabase
      .from('assessment_responses')
      .select(
        `
        id,
        question_id,
        response_value,
        question:questions (
          section,
          question_type
        )
      `
      )
      .eq('assessment_id', partnerAssessment.id)

    // Get question counts
    const { data: questions } = await supabase.from('questions').select('section').eq('active', true)

    const questionCounts: Record<string, number> = {}
    for (const q of questions || []) {
      questionCounts[q.section] = (questionCounts[q.section] || 0) + 1
    }

    // Transform responses for scoring
    const userScoringInput = transformResponsesForScoring(
      (userResponses || []).map((r) => ({
        ...r,
        question: r.question as { section: 'deen' | 'dunya' | 'aila' | 'nafs'; question_type: string }
      }))
    )

    const partnerScoringInput = transformResponsesForScoring(
      (partnerResponses || []).map((r) => ({
        ...r,
        question: r.question as { section: 'deen' | 'dunya' | 'aila' | 'nafs'; question_type: string }
      }))
    )

    // Calculate scores
    const userScores = calculateAssessmentScore(userScoringInput, questionCounts as Record<'deen' | 'dunya' | 'aila' | 'nafs', number>)
    const partnerScores = calculateAssessmentScore(partnerScoringInput, questionCounts as Record<'deen' | 'dunya' | 'aila' | 'nafs', number>)

    // Calculate compatibility
    const compatibility = calculateCompatibilityScore(userScoringInput, partnerScoringInput)

    // Detect red flags
    const userFlags = detectRedFlags(userScoringInput)
    const partnerFlags = detectRedFlags(partnerScoringInput)
    const allFlags = [...userFlags]
    for (const flag of partnerFlags) {
      if (!allFlags.find((f) => f.id === flag.id)) {
        allFlags.push(flag)
      }
    }

    // Determine anonymous mode
    const anonymous =
      (profile?.privacy_settings as { anonymous_mode?: boolean })?.anonymous_mode ?? false

    // Prepare report props
    const reportProps: CoupleReportProps = {
      partner1Name: profile?.display_name || 'Partner A',
      partner2Name: partnerProfile?.display_name || 'Partner B',
      assessmentDate: format(new Date(), 'MMMM d, yyyy'),
      anonymous,
      partner1Scores: userScores,
      partner2Scores: partnerScores,
      compatibility,
      flags: allFlags,
      discussionAreas: compatibility.discussionAreas
    }

    // Generate PDF as blob
    const pdfBlob = await generateCoupleReport(reportProps)

    // Convert to base64
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const filename = `barakah-couple-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`

    return {
      success: true,
      data: {
        pdfBase64: base64,
        filename
      }
    }
  } catch (error) {
    console.error('Error in generateReportAction:', error)
    return { success: false, error: 'Failed to generate report' }
  }
}

/**
 * Check if both partners have completed their assessments
 * Simple boolean check for UI display
 */
export async function canGenerateReportAction(): Promise<ActionResult<{ canGenerate: boolean }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check user's assessment
    const { data: userAssessment } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .maybeSingle()

    if (!userAssessment) {
      return { success: true, data: { canGenerate: false } }
    }

    // Get couple relationship
    const { data: couple } = await supabase
      .from('couples')
      .select('partner_1_id, partner_2_id, status')
      .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle()

    if (!couple) {
      return { success: true, data: { canGenerate: false } }
    }

    const partnerId =
      couple.partner_1_id === user.id ? couple.partner_2_id : couple.partner_1_id

    if (!partnerId) {
      return { success: true, data: { canGenerate: false } }
    }

    // Check partner's assessment
    const { data: partnerAssessment } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', partnerId)
      .eq('status', 'completed')
      .maybeSingle()

    return {
      success: true,
      data: { canGenerate: !!partnerAssessment }
    }
  } catch (error) {
    console.error('Error in canGenerateReportAction:', error)
    return { success: false, error: 'Failed to check report availability' }
  }
}
