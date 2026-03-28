import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResultsAction } from '@/actions/results'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreDisplay } from '@/components/results/score-display'
import { SectionBreakdown } from '@/components/results/section-breakdown'
import { FlagSummary, FlagIndicator } from '@/components/results/flag-summary'
import { PartnerComparison } from '@/components/results/partner-comparison'
import { PartnerInvite, PartnerStatusBanner } from '@/components/results/partner-invite'
import { format } from 'date-fns'
import {
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  Shield,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Your Results | Barakah Bonds',
}

export default async function ResultsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get results data
  const result = await getResultsAction()

  if (!result.success || !result.data) {
    // If assessment not completed, redirect to assessment
    redirect('/assessment')
  }

  const { userResults, partnerResults } = result.data

  // Format completion date
  const completedDate = userResults.completedAt
    ? format(new Date(userResults.completedAt), 'MMMM d, yyyy')
    : 'Recently'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Results</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="size-4" />
            Completed on {completedDate}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Main Score Card */}
      <Card className="border-primary/20">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center">
            <ScoreDisplay
              score={userResults.overallScore}
              label="Overall Score"
              size="lg"
              showInterpretation={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold capitalize">{userResults.confidence}</p>
              </div>
              <Shield className="size-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sections Complete</p>
                <p className="text-2xl font-bold">
                  {userResults.sections.filter((s) => s.answeredCount > 0).length}/4
                </p>
              </div>
              <FileText className="size-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flags</p>
                <p className="text-2xl font-bold">
                  {userResults.flagCounts.total === 0 ? 'None' : userResults.flagCounts.total}
                </p>
              </div>
              <FlagIndicator flags={userResults.flags} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Breakdown */}
      <SectionBreakdown sections={userResults.sections} />

      {/* Flag Summary */}
      <FlagSummary flags={userResults.flags} />

      {/* Partner Status Banner */}
      {partnerResults.hasPartner && !partnerResults.partnerCompleted && (
        <PartnerStatusBanner
          hasPartner={partnerResults.hasPartner}
          partnerName={partnerResults.partnerProfile?.displayName}
          partnerCompleted={partnerResults.partnerCompleted}
        />
      )}

      {/* Partner Comparison (only if both completed) */}
      {partnerResults.hasPartner && partnerResults.partnerCompleted && partnerResults.compatibility && (
        <PartnerComparison
          compatibility={partnerResults.compatibility}
          partnerName={partnerResults.partnerProfile?.displayName || 'Your Partner'}
          onGenerateReport={() => {
            // This would typically trigger PDF generation
            // For now, it's a placeholder
          }}
        />
      )}

      {/* Partner Invite (only if no partner or partner hasn't completed) */}
      {(!partnerResults.hasPartner || !partnerResults.partnerCompleted) && (
        <PartnerInvite
          hasPartner={partnerResults.hasPartner}
          partnerName={partnerResults.partnerProfile?.displayName}
          partnerCompleted={partnerResults.partnerCompleted}
        />
      )}

      {/* Individual Report Download */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Download Your Report</h3>
                <p className="text-sm text-muted-foreground">
                  Save a PDF copy of your individual results
                </p>
              </div>
            </div>
            <Button variant="outline">
              <FileText className="size-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground text-center">
        <Sparkles className="size-4 inline-block mr-2 text-primary" />
        Your individual responses remain private. Only aggregate scores are shared with your partner when they complete their assessment.
      </div>
    </div>
  )
}
