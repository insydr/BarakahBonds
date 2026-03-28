import type { AssessmentSection } from '@/lib/supabase/types'
import { SECTION_WEIGHTS, SCORE_THRESHOLDS, LIKERT_SCALE } from './constants'
import type {
  SectionScore,
  AssessmentScore,
  ScoreCalculationInput
} from './types'

/**
 * Convert a Likert scale value (1-5) to a percentage score (0-100)
 * Maps: 1 -> 0, 2 -> 25, 3 -> 50, 4 -> 75, 5 -> 100
 */
export function likertToPercentage(value: number): number {
  // Handle edge cases
  if (typeof value !== 'number' || isNaN(value)) {
    return 0
  }

  // Clamp value to valid range
  const clampedValue = Math.max(LIKERT_SCALE.min, Math.min(LIKERT_SCALE.max, value))

  // Convert to 0-100 scale: (value - min) / (max - min) * 100
  return ((clampedValue - LIKERT_SCALE.min) / (LIKERT_SCALE.max - LIKERT_SCALE.min)) * 100
}

/**
 * Calculate the score for a single assessment section
 * Pure function - no side effects
 *
 * @param responses - Array of responses with question context
 * @param section - The section to calculate score for
 * @param totalQuestionsInSection - Total number of questions in the section
 * @returns SectionScore object with score and counts
 */
export function calculateSectionScore(
  responses: ScoreCalculationInput[],
  section: AssessmentSection,
  totalQuestionsInSection: number
): SectionScore {
  // Filter responses for this section
  const sectionResponses = responses.filter((r) => r.section === section)

  // Count answered vs skipped
  const answeredCount = sectionResponses.length
  const skippedCount = totalQuestionsInSection - answeredCount

  // Calculate average score from answered questions
  let score = 0
  if (answeredCount > 0) {
    const totalPercentage = sectionResponses.reduce((sum, response) => {
      return sum + likertToPercentage(response.value)
    }, 0)
    score = totalPercentage / answeredCount
  }

  return {
    section,
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    questionCount: totalQuestionsInSection,
    answeredCount,
    skippedCount
  }
}

/**
 * Calculate the overall weighted score from section scores
 * Uses SECTION_WEIGHTS for the weight distribution
 * Pure function - no side effects
 *
 * @param sectionScores - Array of section scores
 * @returns Weighted average score (0-100)
 */
export function calculateOverallScore(sectionScores: SectionScore[]): number {
  if (sectionScores.length === 0) {
    return 0
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const sectionScore of sectionScores) {
    const weight = SECTION_WEIGHTS[sectionScore.section]
    if (weight !== undefined && sectionScore.answeredCount > 0) {
      weightedSum += sectionScore.score * weight
      totalWeight += weight
    }
  }

  // If no sections have answers, return 0
  if (totalWeight === 0) {
    return 0
  }

  // Normalize by the total weight of answered sections
  const score = weightedSum / totalWeight
  return Math.round(score * 100) / 100
}

/**
 * Determine confidence level based on completion rate
 */
function determineConfidence(totalAnswered: number, totalQuestions: number): 'low' | 'medium' | 'high' {
  if (totalQuestions === 0) return 'low'

  const completionRate = totalAnswered / totalQuestions

  if (completionRate >= 0.9) return 'high'
  if (completionRate >= 0.7) return 'medium'
  return 'low'
}

/**
 * Calculate complete assessment score from all responses
 * Pure function - no side effects
 *
 * @param responses - Array of all assessment responses with question context
 * @param questionCounts - Object mapping section to total question count
 * @returns Complete AssessmentScore object
 */
export function calculateAssessmentScore(
  responses: ScoreCalculationInput[],
  questionCounts: Record<AssessmentSection, number>
): AssessmentScore {
  const sections: SectionScore[] = []
  let totalAnswered = 0
  let totalQuestions = 0

  // Calculate score for each section
  for (const section of Object.keys(questionCounts) as AssessmentSection[]) {
    const sectionCount = questionCounts[section]
    const sectionScore = calculateSectionScore(responses, section, sectionCount)
    sections.push(sectionScore)
    totalAnswered += sectionScore.answeredCount
    totalQuestions += sectionCount
  }

  // Calculate overall weighted score
  const overall = calculateOverallScore(sections)

  // Determine confidence level
  const confidence = determineConfidence(totalAnswered, totalQuestions)

  return {
    overall,
    sections,
    calculatedAt: new Date(),
    confidence
  }
}

/**
 * Get score category based on thresholds
 */
export function getScoreCategory(score: number): 'concern' | 'good' | 'excellent' {
  if (score >= SCORE_THRESHOLDS.EXCELLENT_THRESHOLD) {
    return 'excellent'
  }
  if (score >= SCORE_THRESHOLDS.GOOD_THRESHOLD) {
    return 'good'
  }
  return 'concern'
}

/**
 * Get score interpretation text
 */
export function getScoreInterpretation(score: number): string {
  const category = getScoreCategory(score)

  switch (category) {
    case 'excellent':
      return 'Excellent! This area shows strong alignment and positive indicators.'
    case 'good':
      return 'Good. This area shows healthy patterns with room for growth.'
    case 'concern':
      return 'This area may need attention and discussion.'
  }
}

/**
 * Transform database responses to scoring input format
 * Helper function for use in server actions
 */
export function transformResponsesForScoring(
  responses: Array<{
    question_id: string
    response_value: unknown
    question: { section: AssessmentSection; question_type: string }
  }>
): ScoreCalculationInput[] {
  return responses
    .filter((r) => {
      // Only include Likert scale responses
      const value = r.response_value
      if (typeof value === 'number') return true
      if (typeof value === 'object' && value !== null && 'likert' in value) return true
      if (typeof value === 'object' && value !== null && 'value' in value) return true
      return false
    })
    .map((r) => {
      let value = 0
      if (typeof r.response_value === 'number') {
        value = r.response_value
      } else if (typeof r.response_value === 'object' && r.response_value !== null) {
        const rv = r.response_value as Record<string, unknown>
        if ('likert' in rv && typeof rv.likert === 'number') {
          value = rv.likert
        } else if ('value' in rv && typeof rv.value === 'number') {
          value = rv.value
        }
      }

      return {
        questionId: r.question_id,
        section: r.question.section,
        value
      }
    })
}

/**
 * Calculate score summary for display
 */
export interface ScoreSummary {
  overall: number
  category: 'concern' | 'good' | 'excellent'
  interpretation: string
  sections: Array<{
    section: AssessmentSection
    score: number
    category: 'concern' | 'good' | 'excellent'
    answeredCount: number
    totalQuestions: number
  }>
}

export function calculateScoreSummary(
  assessmentScore: AssessmentScore
): ScoreSummary {
  return {
    overall: assessmentScore.overall,
    category: getScoreCategory(assessmentScore.overall),
    interpretation: getScoreInterpretation(assessmentScore.overall),
    sections: assessmentScore.sections.map((s) => ({
      section: s.section,
      score: s.score,
      category: getScoreCategory(s.score),
      answeredCount: s.answeredCount,
      totalQuestions: s.questionCount
    }))
  }
}
