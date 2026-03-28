import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ASSESSMENT_SECTIONS, TIME_CONSTANTS } from '@/lib/assessment/constants'
import { getTotalQuestionCount } from '@/lib/database/questions'
import { CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Assessment | Barakah',
}

export default async function AssessmentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get assessment status
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, status, current_section, started_at')
    .eq('user_id', user.id)
    .single()

  const isCompleted = assessment?.status === 'completed'
  const isInProgress = assessment?.status === 'in_progress'

  // Get total questions
  let totalQuestions = 0
  try {
    totalQuestions = await getTotalQuestionCount()
  } catch {
    // If questions don't exist yet, use placeholder
    totalQuestions = 150
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Personal Growth Assessment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive evaluation to understand yourself better and prepare for meaningful
          conversations about your future together.
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle2 className="size-5 text-emerald-500" />
                Assessment Complete
              </>
            ) : isInProgress ? (
              <>
                <Clock className="size-5 text-amber-500" />
                Continue Your Assessment
              </>
            ) : (
              <>
                <BookOpen className="size-5" />
                Begin Your Journey
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isCompleted
              ? 'You have completed your assessment. View your results to see insights.'
              : isInProgress
              ? `You've started the assessment. Continue from where you left off.`
              : 'Start your personal growth assessment when you are ready.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <Button asChild className="w-full">
              <Link href="/assessment/results">
                View Your Results
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          ) : isInProgress ? (
            <Button asChild className="w-full">
              <Link href={`/assessment/${assessment?.current_section || 'deen'}`}>
                Continue Assessment
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/assessment/deen">
                Begin Assessment
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Clock className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{TIME_CONSTANTS.ESTIMATED_TIME_MINUTES}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">4</div>
                <div className="text-sm text-muted-foreground">Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Sections</CardTitle>
          <CardDescription>
            The assessment covers four key areas of life, each grounded in Islamic teachings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ASSESSMENT_SECTIONS.map((section, index) => (
            <div
              key={section.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{section.name}</h3>
                  <span className="text-sm text-muted-foreground">{section.nameArabic}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ~{section.questionCount} questions
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Your Privacy Matters:</strong> Your responses are private and will not be shared
            with your partner. Only aggregate scores and discussion areas are shared when both partners
            complete the assessment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
