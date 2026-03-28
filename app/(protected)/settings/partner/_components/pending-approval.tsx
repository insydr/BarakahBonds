'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { approveLink, rejectLink } from '@/actions/couple'
import { Check, X, Loader2 } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Couple = Database['public']['Tables']['couples']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PendingApprovalProps {
  couple: Couple
  partnerProfile: Profile | null
  isInitiator: boolean
}

export function PendingApproval({
  couple,
  partnerProfile,
  isInitiator,
}: PendingApprovalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [optimisticState, setOptimisticState] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending')
  const router = useRouter()

  const handleApprove = () => {
    setError(null)
    setOptimisticState('approved')

    startTransition(async () => {
      const result = await approveLink(couple.id)

      if (result.error) {
        setError(result.error)
        setOptimisticState('pending')
        return
      }

      router.refresh()
    })
  }

  const handleReject = () => {
    setError(null)
    setOptimisticState('rejected')

    startTransition(async () => {
      const result = await rejectLink(couple.id)

      if (result.error) {
        setError(result.error)
        setOptimisticState('pending')
        return
      }

      router.refresh()
    })
  }

  // If we're the initiator (partner_1) and partner_2 has accepted
  if (isInitiator && couple.partner_2_id && optimisticState === 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connection Request</CardTitle>
          <CardDescription>
            Someone wants to connect with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium">
              {partnerProfile?.display_name || 'Someone'}
            </p>
            <p className="text-sm text-muted-foreground">
              has requested to connect with you using your invitation code.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isPending}
              className="flex-1"
            >
              {isPending && optimisticState === 'approved' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isPending}
              className="flex-1"
            >
              {isPending && optimisticState === 'rejected' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="size-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If we're the responder (partner_2) waiting for approval
  if (!isInitiator && couple.partner_2_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waiting for Approval</CardTitle>
          <CardDescription>
            Your connection request is pending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="mb-2">
              <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              The person who shared the code needs to approve your connection
              request. You will be notified once they respond.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Initiator waiting for someone to use their code
  return (
    <Card>
      <CardHeader>
        <CardTitle>Waiting for Response</CardTitle>
        <CardDescription>
          No one has used your invitation code yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            Share your invitation code with someone you want to connect with.
            Once they enter the code, you will see their request here and can
            approve or reject it.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
