import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, BookOpen, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react'

export const metadata = {
  title: 'Dashboard | Barakah',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  // Check for partner/couple status
  const { data: couple } = await supabase
    .from('couples')
    .select('id, status')
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .eq('status', 'active')
    .single()

  const hasPartner = !!couple

  // Get assessment status
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status, current_section')
    .eq('user_id', user.id)
    .maybeSingle()

  // Determine assessment state
  const assessmentStatus = assessment?.status || 'not_started'
  const isAssessmentCompleted = assessmentStatus === 'completed'
  const isAssessmentInProgress = assessmentStatus === 'in_progress'

  // Get progress if in progress
  let progressPercentage = 0
  if (isAssessmentInProgress && assessment?.id) {
    try {
      const { data: progressData } = await supabase.rpc('get_assessment_progress', {
        assessment_uuid: assessment.id
      })
      if (progressData && typeof progressData === 'object' && 'percentage' in progressData) {
        progressPercentage = progressData.percentage as number
      }
    } catch {
      // Progress function might fail
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {profile?.display_name ?? 'User'}
        </h1>
        <p className="text-muted-foreground">
          {hasPartner
            ? 'You are connected with your partner.'
            : 'You are in Solo mode. Invite your partner anytime from Settings.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Assessment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Assessment
            </CardTitle>
            <CardDescription>
              {isAssessmentCompleted
                ? 'View your personal insights'
                : isAssessmentInProgress
                ? 'Continue your personal growth assessment'
                : 'Begin your personal growth assessment'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAssessmentCompleted ? (
              <>
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>Completed</span>
                </div>
                <Button asChild className="w-full">
                  <Link href="/assessment/results">
                    View Results
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : isAssessmentInProgress ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>Continue where you left off</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/assessment/${assessment?.current_section || 'deen'}`}>
                    Continue Assessment
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  A comprehensive evaluation covering faith, finances, family, and self.
                  Takes approximately 45-60 minutes.
                </p>
                <Button asChild className="w-full">
                  <Link href="/assessment">
                    Begin Assessment
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Journal Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Journal
            </CardTitle>
            <CardDescription>
              Private reflections and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild disabled className="w-full">
              <span>Coming Soon</span>
            </Button>
          </CardContent>
        </Card>

        {/* Partner Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Partner
            </CardTitle>
            <CardDescription>
              {hasPartner
                ? 'Manage your partner connection'
                : 'Link with your partner for shared features'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/settings/partner">
                {hasPartner ? 'View Connection' : 'Link Partner'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Assessment Completed Users */}
      {isAssessmentCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Continue your journey with these recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {!hasPartner && (
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <Users className="size-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">Invite Your Partner</h4>
                  <p className="text-sm text-muted-foreground">
                    Share results and see discussion areas together.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/settings/partner">
                      Invite Partner
                      <ArrowRight className="size-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <FileText className="size-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">Review Your Results</h4>
                <p className="text-sm text-muted-foreground">
                  Explore insights and reflection prompts from your assessment.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/assessment/results">
                    View Results
                    <ArrowRight className="size-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
