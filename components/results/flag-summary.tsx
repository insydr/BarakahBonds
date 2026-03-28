'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { RedFlag } from '@/lib/assessment/types'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  BookOpen,
  Heart
} from 'lucide-react'

interface FlagSummaryProps {
  flags: RedFlag[]
}

/**
 * Hard flag card - Critical concerns
 */
function HardFlagCard({ flag }: { flag: RedFlag }) {
  return (
    <Card className="border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-rose-700 dark:text-rose-300">
              {flag.title}
            </CardTitle>
            <CardDescription className="mt-1 text-rose-600/80 dark:text-rose-400/80">
              {flag.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Islamic Guidance */}
        <div className="p-4 rounded-lg bg-white dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800">
          <div className="flex items-start gap-2">
            <BookOpen className="size-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                Guidance
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {flag.islamicGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* Citation Reference */}
        <div className="p-3 rounded-lg bg-rose-100/50 dark:bg-rose-900/20">
          <p className="text-sm italic text-rose-600 dark:text-rose-400">
            {flag.citationReference}
          </p>
        </div>

        {/* CTA for professional help */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-200/50 dark:bg-rose-900/30">
          <Heart className="size-4 text-rose-600 dark:text-rose-400" />
          <p className="text-sm text-rose-700 dark:text-rose-300">
            We strongly recommend speaking with a qualified Islamic counselor or therapist about this topic.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Soft flag card - Discussion needed
 */
function SoftFlagCard({ flag }: { flag: RedFlag }) {
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base text-amber-700 dark:text-amber-300">
              {flag.title}
            </CardTitle>
            <CardDescription className="mt-1 text-amber-600/80 dark:text-amber-400/80">
              {flag.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Islamic Guidance */}
        <div className="p-3 rounded-lg bg-white dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <BookOpen className="size-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                {flag.islamicGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* Discussion Prompt */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/20">
          <MessageCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Discussion Prompt:</strong> This is a good topic to discuss openly with your partner to understand each other&apos;s perspectives.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * No flags card - Positive message
 */
function NoFlagsCard() {
  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
              No Significant Concerns Detected
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your responses, no major red flags were identified. This is a positive sign!
              Continue nurturing open communication with your partner.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            <strong>Remember:</strong> A strong marriage is built on continuous growth,
            mutual respect, and seeking Allah&apos;s guidance together.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Flag summary component
 */
export function FlagSummary({ flags }: FlagSummaryProps) {
  const hardFlags = flags.filter((f) => f.severity === 'hard')
  const softFlags = flags.filter((f) => f.severity === 'soft')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Insights & Considerations</h2>
        {flags.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {hardFlags.length} critical, {softFlags.length} for discussion
          </span>
        )}
      </div>

      {/* No flags case */}
      {flags.length === 0 && <NoFlagsCard />}

      {/* Hard flags section */}
      {hardFlags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-rose-500" />
            <h3 className="font-medium text-rose-700 dark:text-rose-300">
              Areas Requiring Attention
            </h3>
          </div>
          <div className="space-y-4">
            {hardFlags.map((flag) => (
              <HardFlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Soft flags section */}
      {softFlags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-500" />
            <h3 className="font-medium text-amber-700 dark:text-amber-300">
              Topics for Discussion
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            These areas could benefit from open conversation with your partner:
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {softFlags.map((flag) => (
              <SoftFlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Helpful resources */}
      {flags.length > 0 && (
        <Card className="border-muted bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Getting Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Consider these resources for additional guidance:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Speak with your local Imam or Islamic scholar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Seek pre-marital counseling from a qualified professional
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Discuss these topics openly with your potential spouse
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Continue making istikhara for guidance
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Compact flag indicator for summary views
 */
export function FlagIndicator({ flags }: { flags: RedFlag[] }) {
  const hardCount = flags.filter((f) => f.severity === 'hard').length
  const softCount = flags.filter((f) => f.severity === 'soft').length

  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          No concerns
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {hardCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30">
          <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
            {hardCount} critical
          </span>
        </div>
      )}
      {softCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {softCount} discuss
          </span>
        </div>
      )}
    </div>
  )
}
