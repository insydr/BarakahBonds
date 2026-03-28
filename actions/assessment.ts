'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  getUserAssessment,
  startAssessment as dbStartAssessment,
  saveResponse as dbSaveResponse,
  updateAssessmentProgress,
  completeAssessment as dbCompleteAssessment,
  getAssessmentProgress,
  hasCompletedAssessment
} from '@/lib/database/assessments'
import { getQuestionsBySection, getTotalQuestionCount, getQuestionCount } from '@/lib/database/questions'
import type { AssessmentSection, Json, AssessmentScores, AssessmentFlag } from '@/lib/supabase/types'

interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

interface AssessmentStatusData {
  status: 'not_started' | 'in_progress' | 'completed'
  currentSection: AssessmentSection | null
  progress: {
    answered: number
    total: number
    percentage: number
  }
}

/**
 * Get the current user's assessment status
 */
export async function getAssessmentStatusAction(): Promise<ActionResult<AssessmentStatusData>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const assessment = await getUserAssessment(user.id)

    // Get total question count
    const totalQuestions = await getTotalQuestionCount()

    // Calculate progress
    let answered = 0
    if (assessment.status === 'in_progress' || assessment.status === 'completed') {
      try {
        const progress = await getAssessmentProgress(assessment.id)
        answered = progress.answered_questions
      } catch {
        // Progress function might fail if no questions exist
        answered = 0
      }
    }

    return {
      success: true,
      data: {
        status: assessment.status,
        currentSection: assessment.current_section,
        progress: {
          answered,
          total: totalQuestions,
          percentage: totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0
        }
      }
    }
  } catch (error) {
    console.error('Error in getAssessmentStatusAction:', error)
    return { success: false, error: 'Failed to get assessment status' }
  }
}

/**
 * Start a new assessment
 */
export async function startAssessmentAction(): Promise<ActionResult<{ assessmentId: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const assessment = await getUserAssessment(user.id)

    if (assessment.status !== 'not_started') {
      return { success: false, error: 'Assessment already started' }
    }

    const updated = await dbStartAssessment(assessment.id)

    revalidatePath('/assessment')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { assessmentId: updated.id }
    }
  } catch (error) {
    console.error('Error in startAssessmentAction:', error)
    return { success: false, error: 'Failed to start assessment' }
  }
}

interface SaveResponseFormData {
  questionId: string
  responseValue: Json
}

/**
 * Save a response to a question
 */
export async function saveResponseAction(formData: SaveResponseFormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const assessment = await getUserAssessment(user.id)

    if (assessment.status !== 'in_progress') {
      return { success: false, error: 'Assessment not in progress' }
    }

    await dbSaveResponse(assessment.id, formData.questionId, formData.responseValue)

    return { success: true }
  } catch (error) {
    console.error('Error in saveResponseAction:', error)
    return { success: false, error: 'Failed to save response' }
  }
}

interface UpdateProgressFormData {
  currentSection?: AssessmentSection
  status?: 'not_started' | 'in_progress' | 'completed'
}

/**
 * Update assessment progress
 */
export async function updateProgressAction(formData: UpdateProgressFormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const assessment = await getUserAssessment(user.id)

    await updateAssessmentProgress(assessment.id, {
      status: formData.status,
      currentSection: formData.currentSection
    })

    revalidatePath('/assessment')

    return { success: true }
  } catch (error) {
    console.error('Error in updateProgressAction:', error)
    return { success: false, error: 'Failed to update progress' }
  }
}

interface CompleteAssessmentFormData {
  scores: AssessmentScores
  flags: AssessmentFlag[]
}

/**
 * Complete an assessment with final scores
 */
export async function completeAssessmentAction(formData: CompleteAssessmentFormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const assessment = await getUserAssessment(user.id)

    if (assessment.status === 'completed') {
      return { success: false, error: 'Assessment already completed' }
    }

    await dbCompleteAssessment(assessment.id, formData.scores, formData.flags)

    revalidatePath('/assessment')
    revalidatePath('/dashboard')
    revalidatePath('/assessment/complete')

    return { success: true }
  } catch (error) {
    console.error('Error in completeAssessmentAction:', error)
    return { success: false, error: 'Failed to complete assessment' }
  }
}

/**
 * Get questions for a specific section
 */
export async function getSectionQuestionsAction(section: AssessmentSection): Promise<
  ActionResult<{
    questions: Array<{
      id: string
      question_text: string
      question_type: string
      options: Json | null
      citation: {
        type: string
        source: string
        reference: string
        arabic_text: string | null
        translation: string
      } | null
    }>
  }>
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const questions = await getQuestionsBySection(section)

    return {
      success: true,
      data: {
        questions: questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          citation: q.citation ? {
            type: q.citation.type,
            source: q.citation.source,
            reference: q.citation.reference,
            arabic_text: q.citation.arabic_text,
            translation: q.citation.translation
          } : null
        }))
      }
    }
  } catch (error) {
    console.error('Error in getSectionQuestionsAction:', error)
    return { success: false, error: 'Failed to get questions' }
  }
}

/**
 * Check if the current user has completed their assessment
 */
export async function checkAssessmentCompletionAction(): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const completed = await hasCompletedAssessment(user.id)

    return {
      success: true,
      data: { completed }
    }
  } catch (error) {
    console.error('Error in checkAssessmentCompletionAction:', error)
    return { success: false, error: 'Failed to check completion' }
  }
}

/**
 * Get question counts for all sections
 */
export async function getQuestionCountsAction(): Promise<
  ActionResult<Record<AssessmentSection, number>>
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const counts = await getQuestionCount()

    return {
      success: true,
      data: counts
    }
  } catch (error) {
    console.error('Error in getQuestionCountsAction:', error)
    return { success: false, error: 'Failed to get question counts' }
  }
}
