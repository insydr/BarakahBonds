import type { RedFlag, RedFlagRule, RedFlagTrigger, ScoreCalculationInput } from './types'
import { FLAG_CATEGORIES } from './constants'

/**
 * Red Flag Rules Configuration
 * Data-driven approach for maintainability
 *
 * Hard flags: Critical issues requiring immediate attention
 * Soft flags: Areas for discussion and awareness
 */
export const RED_FLAG_RULES: RedFlagRule[] = [
  // ==================== HARD FLAGS ====================
  {
    id: 'abuse_indicator',
    severity: 'hard',
    category: FLAG_CATEGORIES.MENTAL_HEALTH,
    title: 'Potential Abuse Indicators Detected',
    description:
      'Responses suggest possible past or current abuse. This requires professional support and careful consideration.',
    islamicGuidance:
      'Islam strictly prohibits all forms of abuse and oppression. The Prophet (ﷺ) said: "The best of you are those who are best to their families." Seeking help is not a sign of weakness but of wisdom. Professional counseling and community support are recommended.',
    citationReference:
      'Sunan at-Tirmidhi 3895 - "The best of you is the one who is best to his family, and I am the best of you to my family."',
    triggers: [
      // These would map to actual question IDs about abuse indicators
      { questionId: 'nafs_abuse_1', condition: 'equals', value: 1 },
      { questionId: 'nafs_abuse_2', condition: 'equals', value: 1 }
    ]
  },
  {
    id: 'severe_mental_health',
    severity: 'hard',
    category: FLAG_CATEGORIES.MENTAL_HEALTH,
    title: 'Severe Mental Health Concerns',
    description:
      'Responses indicate significant mental health challenges that may benefit from professional support before or during marriage.',
    islamicGuidance:
      'Seeking treatment for illness is an Islamic duty. The Prophet (ﷺ) said: "Allah has sent down both the disease and the cure, and He has appointed a cure for every disease, so treat yourselves medically." Mental health is as important as physical health in Islam.',
    citationReference:
      'Sunan Abu Dawood 3855 - "Allah has sent down both the disease and the cure, and He has appointed a cure for every disease."',
    triggers: [
      { questionId: 'nafs_mental_1', condition: 'less_than', value: 2 },
      { questionId: 'nafs_mental_2', condition: 'less_than', value: 2 }
    ]
  },
  {
    id: 'fundamental_religious_incompatibility',
    severity: 'hard',
    category: FLAG_CATEGORIES.SPIRITUAL_INCOMPATIBILITY,
    title: 'Fundamental Religious Incompatibility',
    description:
      'Responses suggest significant differences in core religious beliefs and practices that may impact marital harmony.',
    islamicGuidance:
      'The Quran emphasizes the importance of religious compatibility in marriage. "And do not marry polytheistic women until they believe." (2:221) While differences in practice levels can work, fundamental disagreements on core beliefs require serious discussion and guidance.',
    citationReference:
      'Quran 2:221 - "And do not marry polytheistic women until they believe. And a believing slave woman is better than a polytheist..."',
    triggers: [
      { questionId: 'deen_core_1', condition: 'equals', value: 1 },
      { questionId: 'deen_core_2', condition: 'equals', value: 1 }
    ]
  },
  {
    id: 'substance_abuse_indicator',
    severity: 'hard',
    category: FLAG_CATEGORIES.MENTAL_HEALTH,
    title: 'Substance Abuse Concerns',
    description:
      'Responses indicate potential substance abuse issues that require professional intervention.',
    islamicGuidance:
      'Islam strictly prohibits intoxicants. The Quran states: "O you who have believed, indeed, intoxicants, gambling, stone altars and divining arrows are but defilement from the work of Satan, so avoid it that you may be successful." Recovery is possible with support and determination.',
    citationReference:
      'Quran 5:90 - "O you who have believed, indeed, intoxicants, gambling, stone altars and divining arrows are but defilement from the work of Satan."',
    triggers: [
      { questionId: 'nafs_substance_1', condition: 'greater_than', value: 4 },
      { questionId: 'nafs_substance_2', condition: 'equals', value: 5 }
    ]
  },

  // ==================== SOFT FLAGS ====================
  {
    id: 'communication_style_difference',
    severity: 'soft',
    category: FLAG_CATEGORIES.COMMUNICATION_STYLE,
    title: 'Communication Style Differences',
    description:
      'Your responses indicate a communication style that may require adjustment when interacting with your partner.',
    islamicGuidance:
      'Good communication is essential in marriage. The Prophet (ﷺ) was known for his excellent communication and listening skills. He said: "The best of you are those with the best character." Developing healthy communication patterns is a learned skill.',
    citationReference:
      'Sunan at-Tirmidhi 2002 - "The best of you are those with the best character."',
    triggers: [
      { questionId: 'nafs_comm_1', condition: 'less_than', value: 2 },
      { questionId: 'nafs_comm_2', condition: 'less_than', value: 3 }
    ]
  },
  {
    id: 'religious_practice_variation',
    severity: 'soft',
    category: FLAG_CATEGORIES.SPIRITUAL_INCOMPATIBILITY,
    title: 'Different Levels of Religious Practice',
    description:
      'There appears to be variation in religious practice intensity that could affect daily life decisions.',
    islamicGuidance:
      'Islam encourages mutual understanding and growth. Different levels of practice can be an opportunity for both partners to grow together. The key is respect, patience, and supporting each other in spiritual growth.',
    citationReference:
      'Quran 5:2 - "Help one another in goodness and piety, and do not help one another in sin and transgression."',
    triggers: [
      { questionId: 'deen_practice_1', condition: 'less_than', value: 3 },
      { questionId: 'deen_practice_2', condition: 'less_than', value: 3 }
    ]
  },
  {
    id: 'financial_disagreement',
    severity: 'soft',
    category: FLAG_CATEGORIES.FINANCIAL_REDFLAG,
    title: 'Financial Approach Differences',
    description:
      'Responses suggest different approaches to financial management that may require discussion.',
    islamicGuidance:
      'Financial compatibility is important in marriage. Islam provides guidance on financial responsibilities. The husband is generally responsible for providing, but decisions about spending should be made mutually. Open discussion about finances strengthens trust.',
    citationReference:
      'Quran 2:233 - "No soul is burdened beyond its capacity." - Financial responsibilities should be reasonable.',
    triggers: [
      { questionId: 'dunya_finance_1', condition: 'equals', value: 1 },
      { questionId: 'dunya_finance_2', condition: 'equals', value: 2 }
    ]
  },
  {
    id: 'family_boundary_concerns',
    severity: 'soft',
    category: FLAG_CATEGORIES.FAMILY_BOUNDARIES,
    title: 'Family Boundary Considerations',
    description:
      'Responses indicate potential concerns around extended family boundaries and involvement.',
    islamicGuidance:
      'Islam emphasizes maintaining family ties while establishing healthy boundaries. The Prophet (ﷺ) taught the importance of both honoring parents and establishing one\'s own household. Balance is key.',
    citationReference:
      'Quran 17:23-24 - "And your Lord has decreed that you not worship except Him, and to parents, good treatment."',
    triggers: [
      { questionId: 'aila_boundary_1', condition: 'less_than', value: 2 },
      { questionId: 'aila_boundary_2', condition: 'equals', value: 1 }
    ]
  },
  {
    id: 'conflict_resolution_style',
    severity: 'soft',
    category: FLAG_CATEGORIES.CONFLICT_RESOLUTION,
    title: 'Conflict Resolution Style Considerations',
    description:
      'Your approach to conflict may need adjustment for healthy marital disagreement resolution.',
    islamicGuidance:
      'The Prophet (ﷺ) advised against going to sleep while angry and encouraged quick resolution of disputes. He said: "The strong person is not the one who can wrestle, but the one who controls himself when he is angry." Learning healthy conflict resolution is essential.',
    citationReference:
      'Sahih Bukhari 6114 - "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger."',
    triggers: [
      { questionId: 'nafs_conflict_1', condition: 'equals', value: 5 },
      { questionId: 'nafs_conflict_2', condition: 'less_than', value: 2 }
    ]
  },
  {
    id: 'emotional_availability',
    severity: 'soft',
    category: FLAG_CATEGORIES.MENTAL_HEALTH,
    title: 'Emotional Availability Considerations',
    description:
      'Responses suggest potential challenges in emotional availability that may benefit from awareness.',
    islamicGuidance:
      'Emotional presence is vital in marriage. The Prophet (ﷺ) was emotionally available and affectionate with his family. He would spend time with his wives, listen to them, and show care. Emotional availability is a skill that can be developed.',
    citationReference:
      'Sahih Bukhari 2581 - The Prophet (ﷺ) showed emotional affection with his family.',
    triggers: [
      { questionId: 'nafs_emotional_1', condition: 'less_than', value: 2 },
      { questionId: 'nafs_emotional_2', condition: 'less_than', value: 3 }
    ]
  }
]

/**
 * Check if a response triggers a specific condition
 */
function checkTrigger(trigger: RedFlagTrigger, responseValue: number): boolean {
  switch (trigger.condition) {
    case 'equals':
      return responseValue === trigger.value

    case 'less_than':
      return responseValue < (trigger.value as number)

    case 'greater_than':
      return responseValue > (trigger.value as number)

    case 'range':
      if (Array.isArray(trigger.value)) {
        const [min, max] = trigger.value
        return responseValue >= min && responseValue <= max
      }
      return false

    default:
      return false
  }
}

/**
 * Create a response lookup map for efficient checking
 */
function createResponseMap(
  responses: ScoreCalculationInput[]
): Map<string, number> {
  const map = new Map<string, number>()
  for (const response of responses) {
    map.set(response.questionId, response.value)
  }
  return map
}

/**
 * Detect red flags from assessment responses
 * Pure function - no side effects
 *
 * @param responses - Array of assessment responses
 * @returns Array of triggered red flags
 */
export function detectRedFlags(responses: ScoreCalculationInput[]): RedFlag[] {
  const responseMap = createResponseMap(responses)
  const triggeredFlags: RedFlag[] = []

  for (const rule of RED_FLAG_RULES) {
    // Check if any trigger conditions are met
    const matchedQuestions: string[] = []

    for (const trigger of rule.triggers) {
      const responseValue = responseMap.get(trigger.questionId)
      if (responseValue !== undefined && checkTrigger(trigger, responseValue)) {
        matchedQuestions.push(trigger.questionId)
      }
    }

    // If any triggers match, create a red flag
    if (matchedQuestions.length > 0) {
      triggeredFlags.push({
        id: rule.id,
        severity: rule.severity,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        islamicGuidance: rule.islamicGuidance,
        citationReference: rule.citationReference,
        relatedQuestions: matchedQuestions
      })
    }
  }

  return triggeredFlags
}

/**
 * Filter and return only hard flags
 */
export function getHardFlags(flags: RedFlag[]): RedFlag[] {
  return flags.filter((flag) => flag.severity === 'hard')
}

/**
 * Filter and return only soft flags
 */
export function getSoftFlags(flags: RedFlag[]): RedFlag[] {
  return flags.filter((flag) => flag.severity === 'soft')
}

/**
 * Check if any hard flags are present
 */
export function hasHardFlags(flags: RedFlag[]): boolean {
  return flags.some((flag) => flag.severity === 'hard')
}

/**
 * Get flags by category
 */
export function getFlagsByCategory(flags: RedFlag[], category: string): RedFlag[] {
  return flags.filter((flag) => flag.category === category)
}

/**
 * Count flags by severity
 */
export function countFlagsBySeverity(flags: RedFlag[]): {
  hard: number
  soft: number
  total: number
} {
  const hard = getHardFlags(flags).length
  const soft = getSoftFlags(flags).length
  return { hard, soft, total: flags.length }
}

/**
 * Get severity level for display
 */
export function getSeverityLevel(flags: RedFlag[]): 'critical' | 'attention' | 'good' {
  const { hard, soft } = countFlagsBySeverity(flags)

  if (hard >= 1) return 'critical'
  if (soft >= 2) return 'attention'
  return 'good'
}

/**
 * Get recommended actions based on flags
 */
export function getRecommendedActions(flags: RedFlag[]): string[] {
  const actions: string[] = []
  const { hard, soft } = countFlagsBySeverity(flags)

  if (hard >= 1) {
    actions.push('We strongly recommend seeking professional guidance before proceeding.')
    actions.push('Consider speaking with a qualified Islamic counselor.')
  }

  if (soft >= 1) {
    actions.push('Discuss the highlighted areas with your potential spouse.')
    actions.push('These topics should be part of your pre-marital conversations.')
  }

  if (flags.length === 0) {
    actions.push('No significant concerns detected based on your responses.')
    actions.push('Continue open communication with your potential spouse.')
  }

  return actions
}
