import type { AssessmentSection, Json } from '@/lib/supabase/types'
import { SECTION_WEIGHTS } from './constants'
import type {
  ScoreCalculationInput,
  SectionAlignment,
  DivergentQuestion,
  DiscussionArea,
  CompatibilityScore
} from './types'

/**
 * Threshold for considering responses as divergent (difference > 2 on Likert scale)
 */
const DIVERGENCE_THRESHOLD = 2

/**
 * Transform database responses into scoring input format
 * Converts raw database response records into the format expected by scoring functions
 */
export function transformResponsesForScoring(
  responses: Array<{
    id: string
    question_id: string
    response_value: Json
    question: { section: AssessmentSection; question_type: string }
  }>
): ScoreCalculationInput[] {
  return responses.map((r) => {
    const value =
      typeof r.response_value === 'object' && r.response_value !== null && 'value' in r.response_value
        ? (r.response_value as { value: number | string }).value
        : 0
    return {
      questionId: r.question_id,
      value: typeof value === 'number' ? value : parseInt(String(value), 10) || 0,
      section: r.question.section,
      questionType: r.question.question_type
    }
  })
}

/**
 * Calculate alignment between two responses on a single question
 * Returns a percentage from 0 (completely opposite) to 100 (identical)
 */
function calculateQuestionAlignment(value1: number, value2: number): number {
  // Likert scale is 1-5, so max difference is 4
  const maxDifference = 4
  const actualDifference = Math.abs(value1 - value2)

  // Convert to alignment percentage
  // 0 difference = 100% alignment
  // 4 difference = 0% alignment
  return ((maxDifference - actualDifference) / maxDifference) * 100
}

/**
 * Calculate alignment for a single section between two partners
 * Pure function - no side effects
 *
 * @param responses1 - Partner 1's responses
 * @param responses2 - Partner 2's responses
 * @param section - The section to calculate alignment for
 * @returns SectionAlignment object
 */
export function calculateSectionAlignment(
  responses1: ScoreCalculationInput[],
  responses2: ScoreCalculationInput[],
  section: AssessmentSection
): SectionAlignment {
  // Create maps for quick lookup by question ID
  const map1 = new Map<string, number>()
  const map2 = new Map<string, number>()

  for (const r of responses1.filter((r) => r.section === section)) {
    map1.set(r.questionId, r.value)
  }
  for (const r of responses2.filter((r) => r.section === section)) {
    map2.set(r.questionId, r.value)
  }

  // Find common questions (both partners answered)
  const commonQuestionIds = [...map1.keys()].filter((id) => map2.has(id))

  if (commonQuestionIds.length === 0) {
    return {
      section,
      alignment: 0,
      questionsCompared: 0,
      divergentQuestions: []
    }
  }

  // Calculate alignment for each common question
  let totalAlignment = 0
  const divergentQuestions: DivergentQuestion[] = []

  for (const questionId of commonQuestionIds) {
    const value1 = map1.get(questionId)!
    const value2 = map2.get(questionId)!

    const alignment = calculateQuestionAlignment(value1, value2)
    totalAlignment += alignment

    // Track significantly divergent questions
    const difference = Math.abs(value1 - value2)
    if (difference > DIVERGENCE_THRESHOLD) {
      divergentQuestions.push({
        questionId,
        response1: value1,
        response2: value2,
        difference
      })
    }
  }

  const averageAlignment = totalAlignment / commonQuestionIds.length

  return {
    section,
    alignment: Math.round(averageAlignment * 100) / 100,
    questionsCompared: commonQuestionIds.length,
    divergentQuestions
  }
}

/**
 * Generate discussion areas from divergent responses
 * Creates actionable prompts with Islamic context
 */
export function generateDiscussionAreas(
  sectionAlignments: SectionAlignment[]
): DiscussionArea[] {
  const discussionAreas: DiscussionArea[] = []

  // Discussion templates by section
  const discussionTemplates: Record<AssessmentSection, Array<{ topic: string; promptTemplate: string; islamicContext: string; citationReference: string }>> = {
    deen: [
      {
        topic: 'Prayer and Worship Practices',
        promptTemplate: 'Discuss how you would like to grow together in your spiritual practices. What role does prayer play in your daily life, and how can you support each other?',
        islamicContext:
          'The Quran encourages mutual support in righteousness: "Help one another in goodness and piety." (5:2) Spouses should encourage each other in worship.',
        citationReference: 'Quran 5:2'
      },
      {
        topic: 'Islamic Knowledge and Learning',
        promptTemplate: 'Talk about your approach to learning about Islam. How do you seek knowledge, and how can you grow together religiously?',
        islamicContext:
          'The Prophet (ﷺ) said: "Seeking knowledge is an obligation upon every Muslim." Supporting each other in seeking religious knowledge strengthens the marriage.',
        citationReference: 'Sunan Ibn Majah 224'
      }
    ],
    dunya: [
      {
        topic: 'Financial Management',
        promptTemplate: 'Have an open conversation about your financial expectations and responsibilities. How will you handle finances as a couple?',
        islamicContext:
          'The Prophet (ﷺ) said: "When a person spends on his family, seeking Allah\'s pleasure, it is counted as charity." Financial transparency builds trust.',
        citationReference: 'Sahih Bukhari 55'
      },
      {
        topic: 'Career and Work-Life Balance',
        promptTemplate: 'Discuss your career goals and how they align with family priorities. What sacrifices or compromises might be needed?',
        islamicContext:
          'Islam emphasizes balance. The Quran mentions: "And seek the home of the Hereafter, but do not forget your share of this world." (28:77)',
        citationReference: 'Quran 28:77'
      }
    ],
    aila: [
      {
        topic: 'Family Boundaries',
        promptTemplate: 'Discuss how you will balance relationships with extended family. What boundaries feel comfortable for both of you?',
        islamicContext:
          'The Prophet (ﷺ) taught the importance of family ties while establishing one\'s own household. Balance and clear communication prevent conflicts.',
        citationReference: 'Quran 17:23-24'
      },
      {
        topic: 'Parenting Expectations',
        promptTemplate: 'Share your thoughts on parenting styles and children. How do you envision raising a family together?',
        islamicContext:
          'The Prophet (ﷺ) said: "Each of you is a shepherd and each of you is responsible for his flock." Parenting is a shared responsibility in Islam.',
        citationReference: 'Sahih Bukhari 7138'
      }
    ],
    nafs: [
      {
        topic: 'Communication Styles',
        promptTemplate: 'Explore how you each prefer to communicate during difficult times. What helps you feel heard and understood?',
        islamicContext:
          'The Prophet (ﷺ) was known for excellent communication. He listened attentively and spoke with kindness. Good communication is a prophetic trait.',
        citationReference: 'Sahih Bukhari 5685'
      },
      {
        topic: 'Emotional Needs',
        promptTemplate: 'Discuss what makes you feel loved and supported. How can you better understand each other\'s emotional needs?',
        islamicContext:
          'The Quran describes spouses as "garments for one another" (2:187), indicating closeness, protection, and comfort in the marital relationship.',
        citationReference: 'Quran 2:187'
      }
    ]
  }

  // Generate discussion areas based on sections with divergent questions
  for (const alignment of sectionAlignments) {
    if (alignment.divergentQuestions.length > 0) {
      const templates = discussionTemplates[alignment.section]

      // Add relevant discussion area
      for (const template of templates) {
        discussionAreas.push({
          section: alignment.section,
          topic: template.topic,
          prompt: template.promptTemplate,
          islamicContext: template.islamicContext,
          citationReference: template.citationReference
        })
      }

      // Only add one discussion area per section (break after first)
      break
    }
  }

  // If no divergent areas but we need discussion areas, add general ones
  if (discussionAreas.length === 0) {
    // Add a general discussion area from each section
    for (const section of ['deen', 'dunya', 'aila', 'nafs'] as AssessmentSection[]) {
      const templates = discussionTemplates[section]
      if (templates.length > 0) {
        discussionAreas.push({
          section,
          topic: templates[0].topic,
          prompt: templates[0].promptTemplate,
          islamicContext: templates[0].islamicContext,
          citationReference: templates[0].citationReference
        })
      }
    }
  }

  return discussionAreas
}

/**
 * Calculate overall compatibility score between two partners
 * Pure function - no side effects
 *
 * @param responses1 - Partner 1's complete responses
 * @param responses2 - Partner 2's complete responses
 * @returns Complete CompatibilityScore object
 */
export function calculateCompatibilityScore(
  responses1: ScoreCalculationInput[],
  responses2: ScoreCalculationInput[]
): CompatibilityScore {
  const sections: AssessmentSection[] = ['deen', 'dunya', 'aila', 'nafs']
  const sectionAlignments: SectionAlignment[] = []

  // Calculate alignment for each section
  for (const section of sections) {
    const alignment = calculateSectionAlignment(responses1, responses2, section)
    sectionAlignments.push(alignment)
  }

  // Calculate overall alignment (weighted average)
  let weightedSum = 0
  let totalWeight = 0

  for (const alignment of sectionAlignments) {
    if (alignment.questionsCompared > 0) {
      const weight = SECTION_WEIGHTS[alignment.section]
      weightedSum += alignment.alignment * weight
      totalWeight += weight
    }
  }

  const overallAlignment = totalWeight > 0 ? weightedSum / totalWeight : 0

  // Generate discussion areas
  const discussionAreas = generateDiscussionAreas(sectionAlignments)

  return {
    overallAlignment: Math.round(overallAlignment * 100) / 100,
    sectionAlignments,
    discussionAreas,
    calculatedAt: new Date()
  }
}

/**
 * Get compatibility level description
 */
export function getCompatibilityLevel(score: number): {
  level: 'high' | 'moderate' | 'low'
  description: string
} {
  if (score >= 80) {
    return {
      level: 'high',
      description:
        'Strong alignment across most areas. Continue building on your shared values while discussing areas of difference.'
    }
  }
  if (score >= 60) {
    return {
      level: 'moderate',
      description:
        'Good foundation with some areas needing discussion. Use the discussion prompts to explore differences together.'
    }
  }
  return {
    level: 'low',
    description:
      'Several areas show significant differences. Professional pre-marital counseling is recommended to navigate these differences.'
  }
}

/**
 * Get sections with most divergence for priority attention
 */
export function getPrioritySections(
  sectionAlignments: SectionAlignment[]
): SectionAlignment[] {
  return [...sectionAlignments]
    .filter((s) => s.divergentQuestions.length > 0)
    .sort((a, b) => a.alignment - b.alignment)
    .slice(0, 2) // Top 2 areas needing attention
}

/**
 * Calculate detailed compatibility breakdown for display
 */
export interface CompatibilityBreakdown {
  overall: number
  level: 'high' | 'moderate' | 'low'
  description: string
  sections: Array<{
    section: AssessmentSection
    alignment: number
    level: 'high' | 'moderate' | 'low'
    questionsCompared: number
    divergentCount: number
  }>
  discussionAreas: DiscussionArea[]
  prioritySections: SectionAlignment[]
}

export function calculateCompatibilityBreakdown(
  compatibilityScore: CompatibilityScore
): CompatibilityBreakdown {
  const { overallAlignment, sectionAlignments, discussionAreas } = compatibilityScore
  const { level, description } = getCompatibilityLevel(overallAlignment)

  return {
    overall: overallAlignment,
    level,
    description,
    sections: sectionAlignments.map((s) => ({
      section: s.section,
      alignment: s.alignment,
      level: getCompatibilityLevel(s.alignment).level,
      questionsCompared: s.questionsCompared,
      divergentCount: s.divergentQuestions.length
    })),
    discussionAreas,
    prioritySections: getPrioritySections(sectionAlignments)
  }
}

/**
 * Check if partners can view compatibility (both must have completed)
 */
export function canViewCompatibility(
  hasCompletedAssessment1: boolean,
  hasCompletedAssessment2: boolean
): boolean {
  return hasCompletedAssessment1 && hasCompletedAssessment2
}
