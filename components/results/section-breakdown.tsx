'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreProgressBar } from './score-display'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment/constants'
import type { AssessmentSection } from '@/lib/supabase/types'
import { ChevronDown, ChevronUp, Moon, Briefcase, Home, Heart, BookOpen } from 'lucide-react'

interface SectionData {
  section: AssessmentSection
  score: number
  category: 'concern' | 'good' | 'excellent'
  answeredCount: number
  totalQuestions: number
  interpretation: string
}

interface SectionBreakdownProps {
  sections: SectionData[]
  onSectionClick?: (section: string) => void
}

/**
 * Icon mapping for sections
 */
const SectionIcon = ({ section }: { section: AssessmentSection }) => {
  const iconProps = { className: 'size-5' }
  switch (section) {
    case 'deen':
      return <Moon {...iconProps} />
    case 'dunya':
      return <Briefcase {...iconProps} />
    case 'aila':
      return <Home {...iconProps} />
    case 'nafs':
      return <Heart {...iconProps} />
    default:
      return <BookOpen {...iconProps} />
  }
}

/**
 * Get additional details for each section
 */
function getSectionDetails(section: AssessmentSection): {
  description: string
  keyAreas: string[]
  hadithReference: string
} {
  switch (section) {
    case 'deen':
      return {
        description: 'Faith & Religious Practice - Your spiritual foundation',
        keyAreas: [
          'Prayer consistency and importance',
          'Islamic knowledge and learning goals',
          'Ramadan and fasting practices',
          'Halal lifestyle commitments'
        ],
        hadithReference: '"The best of you are those who learn the Quran and teach it." - Sunan Abu Dawood'
      }
    case 'dunya':
      return {
        description: 'Finances & Career - Your approach to material life',
        keyAreas: [
          'Financial management style',
          'Career aspirations and work-life balance',
          'Spending and saving habits',
          'Financial goals and priorities'
        ],
        hadithReference: '"The upper hand is better than the lower hand." - Sahih Bukhari'
      }
    case 'aila':
      return {
        description: 'Family & In-laws - Family dynamics and boundaries',
        keyAreas: [
          'Family relationship priorities',
          'Boundaries with extended family',
          'Parenting expectations and style',
          'Living arrangements preferences'
        ],
        hadithReference: '"The best of you is the one who is best to his family." - Sunan at-Tirmidhi'
      }
    case 'nafs':
      return {
        description: 'Self & Mental Health - Personal growth and wellbeing',
        keyAreas: [
          'Emotional awareness and regulation',
          'Communication style',
          'Conflict resolution approach',
          'Self-care and mental health'
        ],
        hadithReference: '"The strong person is not the one who can wrestle, but the one who controls himself when angry." - Sahih Bukhari'
      }
    default:
      return {
        description: '',
        keyAreas: [],
        hadithReference: ''
      }
  }
}

/**
 * Get color for section based on score category
 */
function getSectionColor(category: 'concern' | 'good' | 'excellent'): string {
  switch (category) {
    case 'excellent':
      return 'emerald'
    case 'good':
      return 'emerald'
    case 'concern':
      return 'amber'
    default:
      return 'gray'
  }
}

/**
 * Individual section card with expandable details
 */
function SectionCard({
  data,
  isExpanded,
  onToggle
}: {
  data: SectionData
  isExpanded: boolean
  onToggle: () => void
}) {
  const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === data.section)
  const details = getSectionDetails(data.section)
  const color = getSectionColor(data.category)

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'size-10 rounded-lg flex items-center justify-center',
              color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
            )}>
              <SectionIcon section={data.section} />
            </div>
            <div>
              <CardTitle className="text-lg">
                {sectionDef?.name}{' '}
                <span className="text-muted-foreground font-normal text-sm">
                  {sectionDef?.nameArabic}
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {details.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={cn(
                'text-2xl font-bold',
                data.category === 'excellent' || data.category === 'good'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              )}>
                {Math.round(data.score)}
              </span>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="size-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Progress bar */}
      <CardContent className="pt-0 pb-3">
        <ScoreProgressBar
          score={data.score}
          label=""
          showValue={false}
        />
        <p className="text-sm text-muted-foreground mt-2">
          {data.answeredCount} of {data.totalQuestions} questions answered
        </p>
      </CardContent>

      {/* Expanded details */}
      {isExpanded && (
        <CardContent className="border-t bg-muted/30">
          <div className="space-y-4">
            {/* Key Areas */}
            <div>
              <h4 className="font-medium text-sm mb-2">Key Areas Assessed</h4>
              <ul className="space-y-1">
                {details.keyAreas.map((area, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interpretation */}
            <div>
              <h4 className="font-medium text-sm mb-1">Your Results</h4>
              <p className="text-sm text-muted-foreground">
                {data.interpretation}
              </p>
            </div>

            {/* Islamic Reference */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm italic text-muted-foreground">
                {details.hadithReference}
              </p>
            </div>

            {/* Discussion Prompt */}
            {data.category === 'concern' && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Discussion Prompt:</strong> Consider discussing this area with your partner or a trusted advisor to understand how to strengthen this aspect of your relationship foundation.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Section breakdown grid component
 */
export function SectionBreakdown({
  sections,
  onSectionClick
}: SectionBreakdownProps) {
  const [expandedSection, setExpandedSection] = useState<AssessmentSection | null>(null)

  const handleToggle = (section: AssessmentSection) => {
    setExpandedSection(expandedSection === section ? null : section)
    onSectionClick?.(section)
  }

  // Sort sections in the correct order
  const sortedSections = ['deen', 'dunya', 'aila', 'nafs']
    .map((sectionId) => sections.find((s) => s.section === sectionId))
    .filter(Boolean) as SectionData[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Section Breakdown</h2>
        <p className="text-sm text-muted-foreground">
          Click to expand details
        </p>
      </div>

      <div className="grid gap-4">
        {sortedSections.map((sectionData) => (
          <SectionCard
            key={sectionData.section}
            data={sectionData}
            isExpanded={expandedSection === sectionData.section}
            onToggle={() => handleToggle(sectionData.section)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Compact section grid for side-by-side comparison
 */
export function SectionGrid({
  sections
}: {
  sections: SectionData[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {sections.map((sectionData) => {
        const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === sectionData.section)

        return (
          <div
            key={sectionData.section}
            className={cn(
              'p-4 rounded-lg border',
              sectionData.category === 'excellent' || sectionData.category === 'good'
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <SectionIcon section={sectionData.section} />
              <span className="font-medium text-sm">{sectionDef?.name}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                'text-2xl font-bold',
                sectionData.category === 'excellent' || sectionData.category === 'good'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              )}>
                {Math.round(sectionData.score)}
              </span>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  sectionData.category === 'excellent' || sectionData.category === 'good'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                )}
                style={{ width: `${sectionData.score}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
