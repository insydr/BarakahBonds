import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateCoupleReport, type CoupleReportProps } from '@/lib/pdf/couple-report'
import {
  calculateCompatibilityScore,
  transformResponsesForScoring
} from '@/lib/assessment/compatibility'
import { detectRedFlags } from '@/lib/assessment/red-flags'
import { calculateAssessmentScore } from '@/lib/assessment/scoring'
import { format } from 'date-fns'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/reports/[id]
 * Generate and download a PDF report for a couple's assessment
 *
 * Authentication: Required
 * Authorization: User must be part of the couple (partner_1 or partner_2)
 *
 * Response:
 * - 200: PDF file
 * - 401: Not authenticated
 * - 403: Not authorized
 * - 404: Assessment not found
 * - 400: Assessment incomplete
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: _assessmentId } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    // Get user's couple relationship
    const { data: couple } = await supabase
      .from('couples')
      .select('id, partner_1_id, partner_2_id, status')
      .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle()

    if (!couple) {
      return NextResponse.json({ error: 'No active couple relationship found' }, { status: 404 })
    }

    // Get partner ID
    const partnerId =
      couple.partner_1_id === user.id ? couple.partner_2_id : couple.partner_1_id

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner not linked yet' }, { status: 400 })
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
      .select(
        `
        id,
        user_id,
        status,
        completed_at,
        scores,
        flags
      `
      )
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .maybeSingle()

    const { data: partnerAssessment } = await supabase
      .from('assessments')
      .select(
        `
        id,
        user_id,
        status,
        completed_at,
        scores,
        flags
      `
      )
      .eq('user_id', partnerId)
      .eq('status', 'completed')
      .maybeSingle()

    // Check both assessments are complete
    if (!userAssessment || !partnerAssessment) {
      return NextResponse.json(
        { error: 'Both partners must complete their assessments before generating a report' },
        { status: 400 }
      )
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

    // Detect red flags from both partners
    const userFlags = detectRedFlags(userScoringInput)
    const partnerFlags = detectRedFlags(partnerScoringInput)

    // Combine unique flags
    const allFlags = [...userFlags]
    for (const flag of partnerFlags) {
      if (!allFlags.find((f) => f.id === flag.id)) {
        allFlags.push(flag)
      }
    }

    // Determine anonymous mode (check privacy settings)
    const { data: privacySettings } = await supabase
      .from('profiles')
      .select('privacy_settings')
      .eq('id', user.id)
      .single()

    const anonymous = (privacySettings?.privacy_settings as { anonymous_mode?: boolean })?.anonymous_mode ?? false

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

    // Generate PDF
    const pdfBlob = await generateCoupleReport(reportProps)

    // Return PDF with appropriate headers
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="barakah-couple-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
