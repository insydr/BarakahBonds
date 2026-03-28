'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUserAssessment,
  startAssessment as dbStartAssessment,
  saveResponse as dbSaveResponse,
  updateAssessmentProgress,
  getResponses,
  completeAssessment as dbCompleteAssessment,
  getAssessmentProgress
} from '@/lib/database/assessments'
import { getQuestionsBySection } from '@/lib/database/questions'
import { getNextSection } from '@/lib/assessment/constants'
import type {
  Assessment,
  AssessmentSection,
  AssessmentProgress,
  QuestionWithCitation,
  Json
} from '@/lib/supabase/types'

// Debounce time for auto-save (500ms)
const DEBOUNCE_MS = 500

interface SectionData {
  questions: QuestionWithCitation[]
  total: number
}

interface UseAssessmentReturn {
  // State
  assessment: Assessment | null
  currentSection: AssessmentSection | null
  currentQuestionIndex: number
  questions: QuestionWithCitation[]
  responses: Map<string, Json>
  progress: AssessmentProgress | null
  sectionsCompleted: AssessmentSection[]
  loading: boolean
  saving: boolean
  error: string | null

  // Computed
  currentQuestion: QuestionWithCitation | null
  totalQuestions: number
  questionsAnswered: number
  currentSectionData: SectionData | null
  sectionProgress: { answered: number; total: number } | null

  // Actions
  startAssessment: () => Promise<void>
  resumeAssessment: () => Promise<void>
  saveResponse: (questionId: string, value: Json) => void
  goToNextQuestion: () => void
  goToPreviousQuestion: () => void
  skipQuestion: () => void
  completeSection: () => Promise<void>
  completeAssessment: () => Promise<void>
  setCurrentSection: (section: AssessmentSection) => Promise<void>
}

export function useAssessment(userId: string | null): UseAssessmentReturn {
  const router = useRouter()

  // Core state
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [currentSection, setCurrentSectionState] = useState<AssessmentSection | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<QuestionWithCitation[]>([])
  const [responses, setResponses] = useState<Map<string, Json>>(new Map())
  const [progress, setProgress] = useState<AssessmentProgress | null>(null)
  const [sectionsCompleted, setSectionsCompleted] = useState<AssessmentSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingResponseRef = useRef<{ questionId: string; value: Json } | null>(null)
  const assessmentRef = useRef<Assessment | null>(null)

  // Keep assessment ref in sync
  useEffect(() => {
    assessmentRef.current = assessment
  }, [assessment])

  // Fetch assessment data on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get or create assessment
        const assessmentData = await getUserAssessment(userId)
        setAssessment(assessmentData)

        if (assessmentData.status === 'in_progress') {
          // Load existing progress
          setCurrentSectionState(assessmentData.current_section || 'deen')

          // Load responses
          const responsesData = await getResponses(assessmentData.id)
          const responseMap = new Map<string, Json>()
          responsesData.forEach((r) => {
            responseMap.set(r.question_id, r.response_value)
          })
          setResponses(responseMap)

          // Load progress
          try {
            const progressData = await getAssessmentProgress(assessmentData.id)
            setProgress(progressData)
          } catch {
            // Progress function might not work if no questions exist yet
          }

          // Load questions for current section
          if (assessmentData.current_section) {
            const sectionQuestions = await getQuestionsBySection(assessmentData.current_section)
            setQuestions(sectionQuestions)
          }
        }
      } catch (err) {
        console.error('Error fetching assessment data:', err)
        setError('Failed to load assessment. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [userId])

  // Compute derived state
  const currentQuestion = questions[currentQuestionIndex] || null
  const totalQuestions = progress?.total_questions || 0
  const questionsAnswered = progress?.answered_questions || 0
  const currentSectionData: SectionData | null = currentSection ? {
    questions,
    total: questions.length
  } : null
  const sectionProgress = currentSection && progress?.sections?.[currentSection]
    ? {
        answered: progress.sections[currentSection].answered,
        total: progress.sections[currentSection].total
      }
    : null

  // Debounced save function
  const debouncedSave = useCallback(async () => {
    if (!pendingResponseRef.current || !assessmentRef.current) return

    const { questionId, value } = pendingResponseRef.current
    setSaving(true)

    try {
      await dbSaveResponse(assessmentRef.current.id, questionId, value)
      // Update progress after save
      try {
        const newProgress = await getAssessmentProgress(assessmentRef.current.id)
        setProgress(newProgress)
      } catch {
        // Ignore progress errors
      }
    } catch (err) {
      console.error('Error saving response:', err)
      setError('Failed to save response. Your answer has been saved locally.')
    } finally {
      setSaving(false)
      pendingResponseRef.current = null
    }
  }, [])

  // Start assessment
  const startAssessment = useCallback(async () => {
    if (!assessmentRef.current) return

    try {
      setLoading(true)
      setError(null)

      const updated = await dbStartAssessment(assessmentRef.current.id)
      setAssessment(updated)
      setCurrentSectionState('deen')

      // Load questions for Deen section
      const sectionQuestions = await getQuestionsBySection('deen')
      setQuestions(sectionQuestions)
      setCurrentQuestionIndex(0)

      // Initialize progress
      try {
        const progressData = await getAssessmentProgress(assessmentRef.current.id)
        setProgress(progressData)
      } catch {
        // Progress might not work initially
      }
    } catch (err) {
      console.error('Error starting assessment:', err)
      setError('Failed to start assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Resume assessment
  const resumeAssessment = useCallback(async () => {
    if (!assessmentRef.current || !assessmentRef.current.current_section) return

    try {
      setLoading(true)
      setError(null)

      // Load questions for current section
      const sectionQuestions = await getQuestionsBySection(assessmentRef.current.current_section)
      setQuestions(sectionQuestions)

      // Find the first unanswered question in section
      const responsesData = await getResponses(assessmentRef.current.id)
      const responseMap = new Map<string, Json>()
      responsesData.forEach((r) => {
        responseMap.set(r.question_id, r.response_value)
      })
      setResponses(responseMap)

      // Find first unanswered
      let firstUnanswered = 0
      for (let i = 0; i < sectionQuestions.length; i++) {
        if (!responseMap.has(sectionQuestions[i].id)) {
          firstUnanswered = i
          break
        }
        firstUnanswered = i + 1
      }
      setCurrentQuestionIndex(Math.min(firstUnanswered, sectionQuestions.length - 1))

      // Load progress
      try {
        const progressData = await getAssessmentProgress(assessmentRef.current.id)
        setProgress(progressData)
      } catch {
        // Ignore progress errors
      }
    } catch (err) {
      console.error('Error resuming assessment:', err)
      setError('Failed to resume assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save response with debounce
  const saveResponse = useCallback((questionId: string, value: Json) => {
    // Update local state immediately
    setResponses((prev) => {
      const newMap = new Map(prev)
      newMap.set(questionId, value)
      return newMap
    })

    // Debounce server save
    pendingResponseRef.current = { questionId, value }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave()
    }, DEBOUNCE_MS)
  }, [debouncedSave])

  // Complete current section
  const completeSection = useCallback(async () => {
    if (!assessmentRef.current || !currentSection) return

    try {
      // Mark section as completed
      setSectionsCompleted((prev) => [...prev, currentSection])

      const nextSection = getNextSection(currentSection)

      if (nextSection) {
        // Move to next section
        await updateAssessmentProgress(assessmentRef.current.id, { currentSection: nextSection })
        setCurrentSectionState(nextSection)

        // Load questions for next section
        const nextQuestions = await getQuestionsBySection(nextSection)
        setQuestions(nextQuestions)
        setCurrentQuestionIndex(0)

        // Update progress
        try {
          const progressData = await getAssessmentProgress(assessmentRef.current.id)
          setProgress(progressData)
        } catch {
          // Ignore progress errors
        }

        // Navigate to next section
        router.push(`/assessment/${nextSection}`)
      } else {
        // All sections complete - finish assessment
        await dbCompleteAssessment(assessmentRef.current.id, {}, [])
        router.push('/assessment/complete')
      }
    } catch (err) {
      console.error('Error completing section:', err)
      setError('Failed to complete section. Please try again.')
    }
  }, [currentSection, router])

  // Go to next question
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // End of section - complete it
      completeSection()
    }
  }, [currentQuestionIndex, questions.length, completeSection])

  // Go to previous question
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }, [currentQuestionIndex])

  // Skip question
  const skipQuestion = useCallback(() => {
    // Mark as skipped (empty response)
    if (currentQuestion) {
      saveResponse(currentQuestion.id, { skipped: true } as Json)
    }
    goToNextQuestion()
  }, [currentQuestion, saveResponse, goToNextQuestion])

  // Complete entire assessment
  const completeAssessment = useCallback(async () => {
    if (!assessmentRef.current) return

    try {
      setLoading(true)

      // Calculate final scores (placeholder - real scoring would be more complex)
      const scores = {
        deen: 75,
        dunya: 70,
        aila: 80,
        nafs: 72,
        overall: 74
      }

      const flags: Array<{ type: 'hard' | 'soft'; category: string; description: string; section: AssessmentSection }> = []

      await dbCompleteAssessment(assessmentRef.current.id, scores, flags)

      setAssessment((prev) => prev ? { ...prev, status: 'completed', scores, flags } : null)

      // Navigate to completion page
      router.push('/assessment/complete')
    } catch (err) {
      console.error('Error completing assessment:', err)
      setError('Failed to complete assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  // Set current section manually
  const setCurrentSection = useCallback(async (section: AssessmentSection) => {
    if (!assessmentRef.current) return

    try {
      setLoading(true)

      await updateAssessmentProgress(assessmentRef.current.id, { currentSection: section })
      setCurrentSectionState(section)

      const sectionQuestions = await getQuestionsBySection(section)
      setQuestions(sectionQuestions)
      setCurrentQuestionIndex(0)

      // Reload responses for this section
      const responsesData = await getResponses(assessmentRef.current.id)
      const responseMap = new Map<string, Json>()
      responsesData.forEach((r) => {
        responseMap.set(r.question_id, r.response_value)
      })
      setResponses(responseMap)

      // Find first unanswered
      let firstUnanswered = 0
      for (let i = 0; i < sectionQuestions.length; i++) {
        if (!responseMap.has(sectionQuestions[i].id)) {
          firstUnanswered = i
          break
        }
        firstUnanswered = i + 1
      }
      setCurrentQuestionIndex(Math.min(firstUnanswered, sectionQuestions.length - 1))
    } catch (err) {
      console.error('Error changing section:', err)
      setError('Failed to change section. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    assessment,
    currentSection,
    currentQuestionIndex,
    questions,
    responses,
    progress,
    sectionsCompleted,
    loading,
    saving,
    error,

    // Computed
    currentQuestion,
    totalQuestions,
    questionsAnswered,
    currentSectionData,
    sectionProgress,

    // Actions
    startAssessment,
    resumeAssessment,
    saveResponse,
    goToNextQuestion,
    goToPreviousQuestion,
    skipQuestion,
    completeSection,
    completeAssessment,
    setCurrentSection
  }
}

export default useAssessment
