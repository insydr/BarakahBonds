import type { AssessmentSection } from '@/lib/supabase/types'

/**
 * Assessment section definitions
 * Organized in the order they appear in the assessment
 */
export interface SectionDefinition {
  id: AssessmentSection
  name: string
  nameArabic: string
  description: string
  questionCount: number
  icon: string
  color: string
}

export const ASSESSMENT_SECTIONS: SectionDefinition[] = [
  {
    id: 'deen',
    name: 'Deen',
    nameArabic: 'دين',
    description: 'Faith & Religious Practice - Exploring your Islamic values, prayer habits, and spiritual goals',
    questionCount: 40,
    icon: 'moon',
    color: 'emerald'
  },
  {
    id: 'dunya',
    name: 'Dunya',
    nameArabic: 'دنيا',
    description: 'Finances & Career - Understanding your financial habits, career aspirations, and material goals',
    questionCount: 35,
    icon: 'briefcase',
    color: 'amber'
  },
  {
    id: 'aila',
    name: 'Aila',
    nameArabic: 'عائلة',
    description: 'Family & In-laws - Exploring family dynamics, boundaries, and relationships with extended family',
    questionCount: 30,
    icon: 'home',
    color: 'rose'
  },
  {
    id: 'nafs',
    name: 'Nafs',
    nameArabic: 'نفس',
    description: 'Self & Mental Health - Understanding your personality, emotional health, and communication style',
    questionCount: 45,
    icon: 'heart',
    color: 'violet'
  }
]

/**
 * Section weights for overall compatibility score calculation
 * These weights reflect the relative importance in Islamic marriage framework
 */
export const SECTION_WEIGHTS: Record<AssessmentSection, number> = {
  deen: 0.30,  // 30% - Faith is the foundation
  dunya: 0.25, // 25% - Financial compatibility
  aila: 0.20,  // 20% - Family dynamics
  nafs: 0.25   // 25% - Personal/mental health
} as const

/**
 * Time-related constants for assessment
 */
export const TIME_CONSTANTS = {
  /** Estimated total time to complete assessment in minutes */
  ESTIMATED_TIME_MINUTES: 45,
  /** Average time per question in seconds */
  TIME_PER_QUESTION_SECONDS: 20,
  /** Maximum time to complete assessment in hours (before auto-save warning) */
  MAX_SESSION_HOURS: 2,
  /** Auto-save interval in seconds */
  AUTOSAVE_INTERVAL_SECONDS: 30
} as const

/**
 * Likert scale configuration
 */
export const LIKERT_SCALE = {
  /** Minimum value */
  min: 1,
  /** Maximum value */
  max: 5,
  /** Labels for each value */
  labels: {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  },
  /** Numeric labels for display */
  numericLabels: ['1', '2', '3', '4', '5']
} as const

/**
 * Response type constants
 */
export const RESPONSE_TYPES = {
  /** Threshold for skipped questions percentage that triggers warning */
  SKIP_THRESHOLD: 0.20, // 20% skipped triggers warning
  /** Maximum open text response length */
  MAX_OPEN_TEXT_LENGTH: 1000,
  /** Minimum time spent on a question before allowing skip (ms) */
  MIN_QUESTION_TIME_MS: 2000
} as const

/**
 * Assessment status messages
 */
export const STATUS_MESSAGES = {
  NOT_STARTED: "You haven't started your assessment yet",
  IN_PROGRESS: 'Continue your assessment',
  COMPLETED: 'Your assessment is complete',
  SECTION_COMPLETE: 'Section complete! Great progress.',
  ALL_COMPLETE: 'Congratulations! You have completed the assessment.',
  SAVED: 'Your progress has been saved',
  SKIPPED_WARNING: "You've skipped several questions. Consider answering them for better results."
} as const

/**
 * Red flag severity levels
 */
export const FLAG_SEVERITY = {
  HARD: 'hard', // Critical issues requiring immediate attention
  SOFT: 'soft'  // Areas for discussion
} as const

/**
 * Red flag categories
 */
export const FLAG_CATEGORIES = {
  SPIRITUAL_INCOMPATIBILITY: 'spiritual_incompatibility',
  FINANCIAL_REDFLAG: 'financial_redflag',
  FAMILY_BOUNDARIES: 'family_boundaries',
  MENTAL_HEALTH: 'mental_health',
  COMMUNICATION_STYLE: 'communication_style',
  CONFLICT_RESOLUTION: 'conflict_resolution'
} as const

/**
 * Score thresholds
 */
export const SCORE_THRESHOLDS = {
  /** Score below this indicates potential concerns */
  CONCERN_THRESHOLD: 50,
  /** Score above this indicates good alignment */
  GOOD_THRESHOLD: 70,
  /** Score above this indicates excellent alignment */
  EXCELLENT_THRESHOLD: 85
} as const

/**
 * Default section order for assessment flow
 */
export const DEFAULT_SECTION_ORDER: AssessmentSection[] = ['deen', 'dunya', 'aila', 'nafs']

/**
 * Get the next section in the assessment flow
 */
export function getNextSection(currentSection: AssessmentSection): AssessmentSection | null {
  const currentIndex = DEFAULT_SECTION_ORDER.indexOf(currentSection)
  if (currentIndex === -1 || currentIndex === DEFAULT_SECTION_ORDER.length - 1) {
    return null
  }
  return DEFAULT_SECTION_ORDER[currentIndex + 1]
}

/**
 * Get section definition by ID
 */
export function getSectionById(sectionId: AssessmentSection): SectionDefinition | undefined {
  return ASSESSMENT_SECTIONS.find((section) => section.id === sectionId)
}

/**
 * Calculate estimated time remaining based on questions answered
 */
export function calculateTimeRemaining(
  questionsAnswered: number,
  totalQuestions: number
): number {
  const questionsRemaining = totalQuestions - questionsAnswered
  return Math.ceil((questionsRemaining * TIME_CONSTANTS.TIME_PER_QUESTION_SECONDS) / 60)
}
