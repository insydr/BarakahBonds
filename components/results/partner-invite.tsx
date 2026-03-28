'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sendPartnerReminderAction } from '@/actions/results'
import {
  Users,
  UserPlus,
  Clock,
  ArrowRight,
  Sparkles,
  Heart,
  Loader2,
  CheckCircle2
} from 'lucide-react'

interface PartnerInviteProps {
  hasPartner: boolean
  partnerName?: string
  partnerCompleted?: boolean
}

/**
 * No partner state - invite to connect
 */
function NoPartnerCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="size-7 text-primary" />
          </div>
        </div>
        <CardTitle>Have a Partner?</CardTitle>
        <CardDescription>
          Connect with your potential spouse to see how your answers align
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Compare Results</strong> - See how your values and preferences align
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Discussion Areas</strong> - Get personalized topics to discuss together
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Users className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Couple&apos;s Report</strong> - Generate a shared PDF report
            </p>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href="/settings/partner">
            Invite Your Partner
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Your individual results remain private. Only aggregate scores are shared.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Partner linked but not completed - waiting state
 */
function WaitingForPartnerCard({
  partnerName
}: {
  partnerName?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [reminderSent, setReminderSent] = useState(false)

  const handleSendReminder = () => {
    startTransition(async () => {
      const result = await sendPartnerReminderAction()
      if (result.success) {
        setReminderSent(true)
      }
    })
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="size-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="size-7 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <CardTitle>Waiting for {partnerName || 'Your Partner'}</CardTitle>
        <CardDescription>
          They haven&apos;t completed their assessment yet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-white dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800">
          <p className="text-sm text-muted-foreground text-center">
            Once {partnerName || 'your partner'} completes their assessment,
            you&apos;ll be able to see how your answers align and explore discussion areas together.
          </p>
        </div>

        {reminderSent ? (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4" />
            <span className="text-sm font-medium">Reminder sent!</span>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/20"
            onClick={handleSendReminder}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                Send a Gentle Reminder
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          You can continue exploring your individual results while you wait.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Solo mode encouragement card
 */
function SoloModeCard() {
  return (
    <Card className="border-muted bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium mb-1">Your Insights Matter</h4>
            <p className="text-sm text-muted-foreground">
              Even without a partner comparison, your individual results provide valuable
              self-reflection. Consider discussing these insights with a trusted mentor,
              family member, or counselor as you prepare for marriage.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Main partner invite component
 */
export function PartnerInvite({
  hasPartner,
  partnerName,
  partnerCompleted
}: PartnerInviteProps) {
  // Show partner comparison card when both have completed
  if (hasPartner && partnerCompleted) {
    return null // Partner comparison is shown separately
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Partner Connection</h2>
      </div>

      {/* State-specific content */}
      {!hasPartner && <NoPartnerCard />}
      {hasPartner && !partnerCompleted && (
        <WaitingForPartnerCard partnerName={partnerName} />
      )}

      {/* Solo mode encouragement */}
      <SoloModeCard />
    </div>
  )
}

/**
 * Compact partner status banner
 */
export function PartnerStatusBanner({
  hasPartner,
  partnerName,
  partnerCompleted
}: PartnerInviteProps) {
  if (!hasPartner) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10">
        <div className="flex items-center gap-3">
          <UserPlus className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Connect with your partner</p>
            <p className="text-xs text-muted-foreground">
              See how your answers align
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/partner">Invite</Link>
        </Button>
      </div>
    )
  }

  if (!partnerCompleted) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-center gap-3">
          <Clock className="size-5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium">Waiting for {partnerName || 'partner'}</p>
            <p className="text-xs text-muted-foreground">
              They haven&apos;t completed their assessment yet
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/partner">View Status</Link>
        </Button>
      </div>
    )
  }

  return null
}
