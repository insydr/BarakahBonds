'use client'

import Link from 'next/link'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment/constants'
import type { AssessmentSection } from '@/lib/supabase/types'

interface SectionNavigationProps {
  /** Current section ID */
  currentSection: AssessmentSection
  /** List of completed sections */
  completedSections: AssessmentSection[]
  /** Progress within current section (answered/total) */
  sectionProgress?: {
    answered: number
    total: number
  }
}

/**
 * Section navigation component
 * Shows all sections with status and allows navigation
 */
export function SectionNavigation({
  currentSection,
  completedSections,
  sectionProgress
}: SectionNavigationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Sections</h3>
      <nav className="space-y-2">
        {ASSESSMENT_SECTIONS.map((section) => {
          const isCompleted = completedSections.includes(section.id)
          const isCurrent = currentSection === section.id
          const isAccessible = isCompleted || isCurrent ||
            // Allow access to sections that come before the current one
            ASSESSMENT_SECTIONS.findIndex(s => s.id === section.id) <=
            ASSESSMENT_SECTIONS.findIndex(s => s.id === currentSection)

          return (
            <Link
              key={section.id}
              href={`/assessment/${section.id}`}
              className={`block p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950'
                  : isAccessible
                  ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                  : 'border-border opacity-50 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!isAccessible) {
                  e.preventDefault()
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Status icon */}
                  <div
                    className={`flex size-6 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                        : isCurrent
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium">
                        {ASSESSMENT_SECTIONS.findIndex(s => s.id === section.id) + 1}
                      </span>
                    )}
                  </div>

                  {/* Section info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{section.name}</span>
                      <span className="text-xs text-muted-foreground">{section.nameArabic}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {section.description.split(' - ')[0]}
                    </p>
                  </div>
                </div>

                {/* Progress badge for current section */}
                {isCurrent && sectionProgress && (
                  <span className="text-xs text-muted-foreground">
                    {sectionProgress.answered}/{sectionProgress.total}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default SectionNavigation
