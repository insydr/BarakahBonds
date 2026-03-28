import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment/constants'
import { CheckCircle2, PartyPopper, ArrowRight, Users, FileText, Sparkles } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getResultsAction } from '@/actions/results'
import { ScoreDisplay } from '@/components/results/score-display'
import { SectionGrid } from '@/components/results/section-breakdown'
import { FlagIndicator } from '@/components/results/flag-summary'

export const metadata = {
  title: 'Assessment Complete | Barakah Bonds',
}

export default async function CompletePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get assessment status and results
  const result = await getResultsAction()

  // If assessment not completed, redirect to assessment
  if (!result.success || !result.data) {
    redirect('/assessment')
  }

  const { userResults, partnerResults } = result.data

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1">
              <PartyPopper className="size-8 text-amber-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Congratulations!
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          You have completed the Personal Growth Assessment. Your insights are ready to explore.
        </p>
      </div>

      {/* Score Preview Card */}
      <Card className="border-primary/20">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center">
            <ScoreDisplay
              score={userResults.overallScore}
              label="Your Overall Score"
              size="md"
              showInterpretation={true}
            />
          </div>

          {/* Quick Section Preview */}
          <div className="mt-6 pt-6 border-t">
            <SectionGrid sections={userResults.sections} />
          </div>

          {/* Flag Indicator */}
          {userResults.flagCounts.total > 0 && (
            <div className="mt-4 flex justify-center">
              <FlagIndicator flags={userResults.flags} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Summary</CardTitle>
          <CardDescription>
            You&apos;ve completed all four sections of the assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ASSESSMENT_SECTIONS.map((section) => {
            const sectionData = userResults.sections.find((s) => s.section === section.id)
            return (
              <div
                key={section.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-medium">{section.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {section.nameArabic}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {sectionData ? Math.round(sectionData.score) : 0}/100
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* View Results Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Your Detailed Results
            </CardTitle>
            <CardDescription>
              Explore your insights, section breakdowns, and personalized guidance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/results">
                View Your Results
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Partner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {partnerResults.hasPartner ? 'Partner Results' : 'Invite Partner'}
            </CardTitle>
            <CardDescription>
              {partnerResults.hasPartner
                ? partnerResults.partnerCompleted
                  ? 'Compare results and see discussion areas.'
                  : `Waiting for ${partnerResults.partnerProfile?.displayName || 'partner'} to complete.`
                : 'Share with your partner for combined insights.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {partnerResults.hasPartner && partnerResults.partnerCompleted ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/results">
                  View Couple&apos;s Report
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings/partner">
                  {partnerResults.hasPartner ? 'View Partner Status' : 'Invite Partner'}
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Privacy Reminder */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> Your individual responses are private. Only aggregate
                scores and discussion areas are shared with your partner when they also complete
                the assessment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return to Dashboard */}
      <div className="text-center">
        <Button asChild variant="ghost">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
