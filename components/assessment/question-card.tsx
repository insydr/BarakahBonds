'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LikertResponse } from './likert-response'
import { MultipleChoiceResponse, parseOptions } from './multiple-choice-response'
import { CitationDisplay } from './citation-display'
import type { QuestionWithCitation, QuestionType, Json } from '@/lib/supabase/types'

interface QuestionCardProps {
  /** Question data with citation */
  question: QuestionWithCitation
  /** Current question number within section */
  questionNumber: number
  /** Total questions in section */
  totalInSection: number
  /** Current response value */
  value: ResponseValue | null
  /** Callback when response changes */
  onChange: (value: ResponseValue) => void
  /** Callback when question is skipped */
  onSkip: () => void
  /** Callback to go to next question */
  onNext: () => void
  /** Callback to go to previous question */
  onPrevious: () => void
  /** Whether user can go back */
  canGoBack: boolean
  /** Whether this is the last question */
  isLastQuestion?: boolean
  /** Whether a save is in progress */
  isSaving?: boolean
}

export type ResponseValue = number | string

/**
 * Question card component
 * Displays a question with citation, response area, and navigation
 */
export function QuestionCard({
  question,
  questionNumber,
  totalInSection,
  value,
  onChange,
  onSkip,
  onNext,
  onPrevious,
  canGoBack,
  isLastQuestion = false,
  isSaving = false
}: QuestionCardProps) {
  const questionType: QuestionType = question.question_type

  const handleLikertChange = (newValue: number) => {
    onChange(newValue)
  }

  const handleMultipleChoiceChange = (newValue: string) => {
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value !== null) {
      e.preventDefault()
      onNext()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto" onKeyDown={handleKeyDown}>
      <CardHeader>
        <CardDescription className="flex items-center justify-between">
          <span>Question {questionNumber} of {totalInSection}</span>
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <svg className="size-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          )}
        </CardDescription>
        <CardTitle className="text-xl leading-relaxed">
          {question.question_text}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Response area based on question type */}
        {questionType === 'likert' && (
          <LikertResponse
            value={typeof value === 'number' ? value : null}
            onChange={handleLikertChange}
          />
        )}

        {questionType === 'multiple_choice' && (
          <MultipleChoiceResponse
            value={typeof value === 'string' ? value : null}
            onChange={handleMultipleChoiceChange}
            options={parseOptions(question.options as Json)}
          />
        )}

        {/* Citation */}
        {question.citation && (
          <CitationDisplay citation={question.citation} />
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground"
            >
              I&apos;d rather not answer
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {canGoBack && (
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
            )}
            <Button onClick={onNext} disabled={value === null}>
              {isLastQuestion ? 'Complete Section' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground">Enter</kbd> to continue
        </p>
      </CardContent>
    </Card>
  )
}

export default QuestionCard
