'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestionCard, type ResponseValue } from '@/components/assessment/question-card'
import { SectionNavigation } from '@/components/assessment/section-navigation'
import {
  DEFAULT_SECTION_ORDER,
  getNextSection,
  getSectionById
} from '@/lib/assessment/constants'
import type {
  AssessmentSection,
  QuestionWithCitation,
  Json,
  AssessmentProgress
} from '@/lib/supabase/types'
import { startAssessmentAction, saveResponseAction, updateProgressAction } from '@/actions/assessment'

// Debounce helper
function debounce<T extends any[], R>(
  fn: (...args: T) => R,
  delay: number
): (...args: T) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export default function SectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.section as AssessmentSection

  // Validate section
  const isValidSection = DEFAULT_SECTION_ORDER.includes(sectionId)
  const sectionDef = getSectionById(sectionId)

  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questions, setQuestions] = useState<QuestionWithCitation[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Map<string, Json>>(new Map())
  const [progress, setProgress] = useState<AssessmentProgress | null>(null)
  const [sectionsCompleted, setSectionsCompleted] = useState<AssessmentSection[]>([])
  const [error, setError] = useState<string | null>(null)

  // Current question
  const currentQuestion = questions[currentIndex] || null
  const isLastQuestion = currentIndex === questions.length - 1
  const isFirstQuestion = currentIndex === 0

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      try {
        setLoading(true)

        // Get user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get or create assessment
        let { data: assessment } = await supabase
          .from('assessments')
          .select('id, status, current_section')
          .eq('user_id', user.id)
          .single()

        if (!assessment) {
          // Create assessment
          const { data: newAssessment, error: createError } = await supabase
            .from('assessments')
            .insert({ user_id: user.id, status: 'not_started' })
            .select('id, status, current_section')
            .single()

          if (createError) throw createError
          assessment = newAssessment
        }

        // Start assessment if not started
        if (assessment.status === 'not_started') {
          await startAssessmentAction()
        }

        // Fetch questions for this section
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            section,
            order_index,
            question_text,
            question_type,
            options,
            citation_id,
            version,
            active,
            scholar_verified,
            created_at,
            updated_at,
            citation:citations (
              id,
              type,
              source,
              reference,
              arabic_text,
              translation,
              scholar_verified,
              created_at
            )
          `)
          .eq('section', sectionId)
          .eq('active', true)
          .eq('scholar_verified', true)
          .order('order_index', { ascending: true })

        if (questionsError) throw questionsError
        setQuestions(questionsData as QuestionWithCitation[])

        // Fetch existing responses
        const { data: responsesData } = await supabase
          .from('assessment_responses')
          .select('question_id, response_value')
          .eq('assessment_id', assessment.id)

        const responseMap = new Map<string, Json>()
        responsesData?.forEach((r) => {
          responseMap.set(r.question_id, r.response_value)
        })
        setResponses(responseMap)

        // Find first unanswered question
        let firstUnanswered = 0
        for (let i = 0; i < (questionsData?.length || 0); i++) {
          if (!responseMap.has(questionsData![i].id)) {
            firstUnanswered = i
            break
          }
          firstUnanswered = i + 1
        }
        setCurrentIndex(Math.min(firstUnanswered, (questionsData?.length || 1) - 1))

        // Get progress
        const { data: progressData } = await supabase.rpc('get_assessment_progress', {
          assessment_uuid: assessment.id
        })
        const typedProgress = progressData as unknown as AssessmentProgress | null
        if (typedProgress) {
          setProgress(typedProgress)
        }

        // Determine completed sections
        const completed: AssessmentSection[] = []
        for (const sec of DEFAULT_SECTION_ORDER) {
          if (sec === sectionId) break
          const secProgress = typedProgress?.sections?.[sec as AssessmentSection]
          if (secProgress && secProgress.answered === secProgress.total && secProgress.total > 0) {
            completed.push(sec as AssessmentSection)
          }
        }
        setSectionsCompleted(completed)

        // Update current section in database
        await updateProgressAction({ currentSection: sectionId })

      } catch (err) {
        console.error('Error fetching section data:', err)
        setError('Failed to load assessment. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (isValidSection) {
      fetchData()
    }
  }, [sectionId, router, isValidSection])

  // Debounced save
  const debouncedSave = useMemo(
    () =>
      debounce(async (questionId: string, value: Json) => {
        setSaving(true)
        try {
          await saveResponseAction({ questionId, responseValue: value })
          // Dispatch save event
          window.dispatchEvent(new CustomEvent('assessment-saved'))
        } catch (err) {
          console.error('Error saving response:', err)
        } finally {
          setSaving(false)
        }
      }, 500),
    []
  )

  // Handle response change
  const handleResponseChange = useCallback(
    (value: ResponseValue) => {
      if (!currentQuestion) return

      setResponses((prev) => {
        const newMap = new Map(prev)
        newMap.set(currentQuestion.id, value as Json)
        return newMap
      })

      debouncedSave(currentQuestion.id, value as Json)
    },
    [currentQuestion, debouncedSave]
  )

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // Complete section and move to next or complete
      const nextSection = getNextSection(sectionId)

      if (nextSection) {
        setSectionsCompleted((prev) => [...prev, sectionId])
        router.push(`/assessment/${nextSection}`)
      } else {
        // Assessment complete
        router.push('/assessment/complete')
      }
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLastQuestion, sectionId, router])

  const handlePrevious = useCallback(() => {
    if (!isFirstQuestion) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [isFirstQuestion])

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return
    setResponses((prev) => {
      const newMap = new Map(prev)
      newMap.set(currentQuestion.id, { skipped: true })
      return newMap
    })
    debouncedSave(currentQuestion.id, { skipped: true })
    handleNext()
  }, [currentQuestion, debouncedSave, handleNext])

  // Invalid section
  if (!isValidSection) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Section Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The section &quot;{sectionId}&quot; does not exist.
            </p>
            <Button asChild>
              <Link href="/assessment">Go to Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-24 mx-auto" />
              <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-4 text-destructive">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No questions
  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-2">{sectionDef?.name} Section</h2>
            <p className="text-muted-foreground mb-6">
              Questions for this section are coming soon. Please check back later.
            </p>
            <Button asChild>
              <Link href="/assessment">Back to Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Current response value
  const currentValue = currentQuestion ? responses.get(currentQuestion.id) : null
  const typedValue =
    typeof currentValue === 'number'
      ? currentValue
      : typeof currentValue === 'string'
      ? currentValue
      : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section Navigation Sidebar - Desktop */}
      <div className="hidden lg:block mb-6">
        <SectionNavigation
          currentSection={sectionId}
          completedSections={sectionsCompleted}
          sectionProgress={
            progress?.sections?.[sectionId]
              ? {
                  answered: progress.sections[sectionId].answered,
                  total: progress.sections[sectionId].total
                }
              : undefined
          }
        />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalInSection={questions.length}
          value={typedValue}
          onChange={handleResponseChange}
          onSkip={handleSkip}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoBack={!isFirstQuestion}
          isLastQuestion={isLastQuestion}
          isSaving={saving}
        />
      )}

      {/* Mobile Section Navigation */}
      <div className="lg:hidden mt-6">
        <SectionNavigation
          currentSection={sectionId}
          completedSections={sectionsCompleted}
        />
      </div>
    </div>
  )
}
