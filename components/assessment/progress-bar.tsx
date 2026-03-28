'use client'

import { useMemo } from 'react'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { ASSESSMENT_SECTIONS, calculateTimeRemaining } from '@/lib/assessment/constants'
import type { AssessmentSection } from '@/lib/supabase/types'

interface ProgressBarProps {
  /** Current section being worked on */
  currentSection: AssessmentSection | null
  /** Number of questions answered */
  questionsAnswered: number
  /** Total number of questions */
  totalQuestions: number
  /** Sections that have been completed */
  sectionsCompleted: AssessmentSection[]
  /** Current section progress (answered in current section) */
  currentSectionAnswered?: number
  /** Total questions in current section */
  currentSectionTotal?: number
}

/**
 * Section status indicator component
 */
function SectionIndicator({
  section,
  status,
  isActive
}: {
  section: typeof ASSESSMENT_SECTIONS[0]
  status: 'completed' | 'in_progress' | 'pending'
  isActive: boolean
}) {
  const statusStyles = {
    completed: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
    in_progress: 'text-primary bg-primary/10',
    pending: 'text-muted-foreground bg-muted'
  }

  const statusIcons = {
    completed: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    in_progress: (
      <span className="size-2 rounded-full bg-current" />
    ),
    pending: (
      <span className="size-2 rounded-full border border-current" />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex size-6 items-center justify-center rounded-full transition-all ${
          statusStyles[status]
        } ${isActive ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}
      >
        {statusIcons[status]}
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
          {section.name}
        </span>
        <span className="text-[10px] text-muted-foreground">{section.nameArabic}</span>
      </div>
    </div>
  )
}

/**
 * Progress bar component for assessment flow
 * Shows overall completion percentage, section indicators, and estimated time remaining
 */
export function ProgressBar({
  currentSection,
  questionsAnswered,
  totalQuestions,
  sectionsCompleted,
  currentSectionAnswered = 0,
  currentSectionTotal = 0
}: ProgressBarProps) {
  const percentage = useMemo(() => {
    if (totalQuestions === 0) return 0
    return Math.round((questionsAnswered / totalQuestions) * 100)
  }, [questionsAnswered, totalQuestions])

  const timeRemaining = useMemo(() => {
    return calculateTimeRemaining(questionsAnswered, totalQuestions)
  }, [questionsAnswered, totalQuestions])

  const getSectionStatus = (sectionId: AssessmentSection): 'completed' | 'in_progress' | 'pending' => {
    if (sectionsCompleted.includes(sectionId)) {
      return 'completed'
    }
    if (currentSection === sectionId) {
      return 'in_progress'
    }
    return 'pending'
  }

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {questionsAnswered} of {totalQuestions} questions
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>~{timeRemaining} min remaining</span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={percentage} className="w-full">
        <ProgressLabel className="sr-only">Assessment progress</ProgressLabel>
        <ProgressValue>{(formattedValue) => `${percentage}%`}</ProgressValue>
      </Progress>

      {/* Section indicators */}
      <div className="grid grid-cols-4 gap-2">
        {ASSESSMENT_SECTIONS.map((section) => (
          <SectionIndicator
            key={section.id}
            section={section}
            status={getSectionStatus(section.id)}
            isActive={currentSection === section.id}
          />
        ))}
      </div>

      {/* Current section detail */}
      {currentSection && currentSectionTotal > 0 && (
        <div className="text-xs text-muted-foreground">
          {ASSESSMENT_SECTIONS.find(s => s.id === currentSection)?.name}: {currentSectionAnswered}/{currentSectionTotal}
        </div>
      )}
    </div>
  )
}

export default ProgressBar
