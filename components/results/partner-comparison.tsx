'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreDisplay } from './score-display'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment/constants'
import type { CompatibilityBreakdown } from '@/lib/assessment/compatibility'
import type { DiscussionArea } from '@/lib/assessment/types'
import type { AssessmentSection } from '@/lib/supabase/types'
import {
  Heart,
  Users,
  MessageCircle,
  BookOpen,
  Download
} from 'lucide-react'

interface PartnerComparisonProps {
  compatibility: CompatibilityBreakdown
  partnerName: string
  onGenerateReport: () => void
}

/**
 * Get alignment color based on score
 */
function getAlignmentColor(score: number): {
  bg: string
  text: string
  border: string
} {
  if (score >= 80) {
    return {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800'
    }
  }
  if (score >= 60) {
    return {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800'
    }
  }
  return {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800'
  }
}

/**
 * Section icon component
 */
const SectionIcon = ({ section }: { section: AssessmentSection }) => {
  const icons: Record<AssessmentSection, string> = {
    deen: '🕌',
    dunya: '💼',
    aila: '🏠',
    nafs: '💚'
  }
  return <span className="text-lg">{icons[section]}</span>
}

/**
 * Side-by-side section comparison
 */
function SectionComparison({
  section,
  alignment,
  level
}: {
  section: AssessmentSection
  alignment: number
  level: 'high' | 'moderate' | 'low'
}) {
  const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === section)
  const colors = getAlignmentColor(alignment)

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      colors.bg,
      colors.border
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SectionIcon section={section} />
          <span className="font-medium">{sectionDef?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-lg font-bold', colors.text)}>
            {Math.round(alignment)}%
          </span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            level === 'high' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' :
            level === 'moderate' ? 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300' :
            'bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300'
          )}>
            {level === 'high' ? 'Aligned' : level === 'moderate' ? 'Similar' : 'Different'}
          </span>
        </div>
      </div>
      <div className="mt-2 h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', colors.text.replace('text-', 'bg-'))}
          style={{ width: `${alignment}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Discussion area card
 */
function DiscussionAreaCard({ area }: { area: DiscussionArea }) {
  const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === area.section)

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <SectionIcon section={area.section} />
          <CardTitle className="text-base">{area.topic}</CardTitle>
        </div>
        <CardDescription>
          From {sectionDef?.name} section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <MessageCircle className="size-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            {area.prompt}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-2">
            <BookOpen className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {area.islamicContext}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            {area.citationReference}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Partner comparison component
 */
export function PartnerComparison({
  compatibility,
  partnerName,
  onGenerateReport
}: PartnerComparisonProps) {
  const { overall, level, description, sections, discussionAreas, prioritySections } = compatibility

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="size-5 text-rose-500" />
          <h2 className="text-xl font-semibold">Partner Comparison</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          with {partnerName}
        </span>
      </div>

      {/* Overall Alignment Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreDisplay
              score={overall}
              label="Overall Alignment"
              size="md"
              showInterpretation={false}
            />
            <div className="flex-1 text-center md:text-left">
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3',
                level === 'high' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                level === 'moderate' ? 'bg-amber-100 dark:bg-amber-900/30' :
                'bg-rose-100 dark:bg-rose-900/30'
              )}>
                <Users className={cn(
                  'size-4',
                  level === 'high' ? 'text-emerald-600 dark:text-emerald-400' :
                  level === 'moderate' ? 'text-amber-600 dark:text-amber-400' :
                  'text-rose-600 dark:text-rose-400'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  level === 'high' ? 'text-emerald-700 dark:text-emerald-300' :
                  level === 'moderate' ? 'text-amber-700 dark:text-amber-300' :
                  'text-rose-700 dark:text-rose-300'
                )}>
                  {level === 'high' ? 'Strong Alignment' :
                   level === 'moderate' ? 'Good Foundation' :
                   'Needs Discussion'}
                </span>
              </div>
              <p className="text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Alignment Grid */}
      <div className="space-y-3">
        <h3 className="font-medium">Section Alignment</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((section) => (
            <SectionComparison
              key={section.section}
              section={section.section}
              alignment={section.alignment}
              level={section.level}
            />
          ))}
        </div>
      </div>

      {/* Discussion Areas */}
      {discussionAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Discussion Areas</h3>
            <span className="text-sm text-muted-foreground">
              Topics to explore together
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {discussionAreas.slice(0, 4).map((area, index) => (
              <DiscussionAreaCard key={index} area={area} />
            ))}
          </div>
        </div>
      )}

      {/* Priority Sections */}
      {prioritySections.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-700 dark:text-amber-300">
              Areas to Prioritize
            </CardTitle>
            <CardDescription>
              These sections showed the most divergence and would benefit from focused discussion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prioritySections.map((section) => {
                const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === section.section)
                return (
                  <li
                    key={section.section}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon section={section.section} />
                      <span>{sectionDef?.name}</span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400">
                      {Math.round(section.alignment)}% alignment
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Generate Report Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onGenerateReport} className="gap-2">
          <Download className="size-4" />
          Generate Couple&apos;s Report
        </Button>
      </div>
    </div>
  )
}

/**
 * Mini compatibility indicator
 */
export function CompatibilityIndicator({
  score,
  partnerName
}: {
  score: number
  partnerName: string
}) {
  const level = score >= 80 ? 'high' : score >= 60 ? 'moderate' : 'low'
  const colors = getAlignmentColor(score)

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      colors.bg,
      colors.border
    )}>
      <Heart className={cn('size-5', colors.text)} />
      <div>
        <p className="text-sm font-medium">
          {Math.round(score)}% alignment with {partnerName}
        </p>
        <p className="text-xs text-muted-foreground">
          {level === 'high' ? 'Strong match' :
           level === 'moderate' ? 'Good foundation' :
           'Discuss differences'}
        </p>
      </div>
    </div>
  )
}
