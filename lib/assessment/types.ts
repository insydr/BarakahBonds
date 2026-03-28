import type { AssessmentSection, AssessmentResponse } from '@/lib/supabase/types'

/**
 * Section Score
 * Represents the score for a single assessment section
 */
export interface SectionScore {
  /** Section identifier */
  section: AssessmentSection
  /** Calculated score (0-100) */
  score: number
  /** Total questions in section */
  questionCount: number
  /** Number of answered questions */
  answeredCount: number
  /** Number of skipped questions */
  skippedCount: number
}

/**
 * Assessment Score
 * Complete scoring result for an assessment
 */
export interface AssessmentScore {
  /** Weighted overall score (0-100) */
  overall: number
  /** Individual section scores */
  sections: SectionScore[]
  /** Timestamp of calculation */
  calculatedAt: Date
  /** Confidence level based on completion rate */
  confidence: 'low' | 'medium' | 'high'
}

/**
 * Red Flag
 * Represents a detected concern area in the assessment
 */
export interface RedFlag {
  /** Unique identifier for the flag */
  id: string
  /** Severity level: hard (critical) or soft (discussion needed) */
  severity: 'hard' | 'soft'
  /** Category of the flag */
  category: string
  /** Short title for display */
  title: string
  /** Detailed description */
  description: string
  /** Islamic guidance and recommendations */
  islamicGuidance: string
  /** Quranic or Hadith reference */
  citationReference: string
  /** Related question IDs that triggered this flag */
  relatedQuestions: string[]
}

/**
 * Red Flag Rule
 * Configuration for detecting red flags
 */
export interface RedFlagRule {
  /** Unique identifier */
  id: string
  /** Severity level */
  severity: 'hard' | 'soft'
  /** Category for grouping */
  category: string
  /** Display title */
  title: string
  /** Description template */
  description: string
  /** Islamic guidance template */
  islamicGuidance: string
  /** Citation reference */
  citationReference: string
  /** Trigger conditions */
  triggers: RedFlagTrigger[]
}

/**
 * Red Flag Trigger
 * Condition that triggers a red flag
 */
export interface RedFlagTrigger {
  /** Question ID to check */
  questionId: string
  /** Condition type */
  condition: 'equals' | 'less_than' | 'greater_than' | 'range'
  /** Value(s) to compare against */
  value: number | number[]
}

/**
 * Section Alignment
 * Compatibility alignment for a single section
 */
export interface SectionAlignment {
  /** Section identifier */
  section: AssessmentSection
  /** Alignment percentage (0-100) */
  alignment: number
  /** Questions compared */
  questionsCompared: number
  /** Questions where responses diverge significantly */
  divergentQuestions: DivergentQuestion[]
}

/**
 * Divergent Question
 * Represents a question where partners have significantly different responses
 */
export interface DivergentQuestion {
  /** Question ID */
  questionId: string
  /** Partner 1's response value */
  response1: number
  /** Partner 2's response value */
  response2: number
  /** Difference between responses */
  difference: number
}

/**
 * Discussion Area
 * A topic area for couples to discuss based on divergent responses
 */
export interface DiscussionArea {
  /** Section the discussion relates to */
  section: AssessmentSection
  /** Topic title */
  topic: string
  /** Discussion prompt for the couple */
  prompt: string
  /** Islamic context for the discussion */
  islamicContext: string
  /** Citation reference */
  citationReference: string
}

/**
 * Compatibility Score
 * Complete compatibility assessment between two partners
 */
export interface CompatibilityScore {
  /** Overall alignment percentage (0-100) */
  overallAlignment: number
  /** Per-section alignment data */
  sectionAlignments: SectionAlignment[]
  /** Generated discussion areas for the couple */
  discussionAreas: DiscussionArea[]
  /** Timestamp of calculation */
  calculatedAt: Date
}

/**
 * Response with Question Context
 * Used for scoring when we need question section info
 */
export interface ResponseWithQuestion extends AssessmentResponse {
  question: {
    section: AssessmentSection
    question_type: string
    order_index?: number
  }
}

/**
 * Score Calculation Input
 * Input type for scoring functions
 */
export interface ScoreCalculationInput {
  /** Question ID */
  questionId: string
  /** Section the question belongs to */
  section: AssessmentSection
  /** Response value (Likert 1-5 or other) */
  value: number
}

/**
 * Assessment Result
 * Combined result of assessment scoring and flag detection
 */
export interface AssessmentResult {
  /** Assessment scores */
  score: AssessmentScore
  /** Detected red flags */
  flags: RedFlag[]
  /** Summary insights */
  insights: AssessmentInsight[]
}

/**
 * Assessment Insight
 * A generated insight about the assessment results
 */
export interface AssessmentInsight {
  /** Section the insight relates to */
  section: AssessmentSection
  /** Insight type */
  type: 'strength' | 'growth_area' | 'discussion_point'
  /** The insight text */
  text: string
}
