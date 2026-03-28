'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProgressBar } from '@/components/assessment/progress-bar'
import type { AssessmentSection, AssessmentProgress } from '@/lib/supabase/types'

interface AssessmentLayoutProps {
  children: React.ReactNode
}

export default function AssessmentLayout({ children }: AssessmentLayoutProps) {
  const [progress, setProgress] = useState<AssessmentProgress | null>(null)
  const [currentSection, setCurrentSection] = useState<AssessmentSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get assessment
        const { data: assessment } = await supabase
          .from('assessments')
          .select('id, current_section, status')
          .eq('user_id', user.id)
          .single()

        if (assessment) {
          setCurrentSection(assessment.current_section as AssessmentSection)

          // Get progress using the database function
          const { data: progressData } = await supabase.rpc('get_assessment_progress', {
            assessment_uuid: assessment.id
          })

          if (progressData) {
            setProgress(progressData as unknown as AssessmentProgress)
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  // Listen for save events
  useEffect(() => {
    const handleSave = () => {
      setSaved(false)
      setTimeout(() => setSaved(true), 1000)
    }

    window.addEventListener('assessment-saved', handleSave)
    return () => window.removeEventListener('assessment-saved', handleSave)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Progress header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-12">
              <div className="animate-pulse flex space-x-4">
                <div className="h-4 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            </div>
          ) : progress ? (
            <ProgressBar
              currentSection={currentSection}
              questionsAnswered={progress.answered_questions}
              totalQuestions={progress.total_questions}
              sectionsCompleted={[]}
              currentSectionAnswered={
                currentSection && progress.sections?.[currentSection]
                  ? progress.sections[currentSection].answered
                  : 0
              }
              currentSectionTotal={
                currentSection && progress.sections?.[currentSection]
                  ? progress.sections[currentSection].total
                  : 0
              }
            />
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assessment</h2>
              <span className="text-sm text-muted-foreground">
                {saved ? 'Progress saved' : 'Saving...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
