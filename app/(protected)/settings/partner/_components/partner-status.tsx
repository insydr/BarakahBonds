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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { disconnectPartner } from '@/actions/couple'
import { format } from 'date-fns'
import { User, Link2, Unlink, Loader2, AlertTriangle } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Couple = Database['public']['Tables']['couples']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface PartnerStatusProps {
  couple: Couple
  partnerProfile: Profile | null
}

export function PartnerStatus({ couple, partnerProfile }: PartnerStatusProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const handleDisconnect = () => {
    setError(null)

    startTransition(async () => {
      const result = await disconnectPartner()

      if (result.error) {
        setError(result.error)
        return
      }

      setIsDialogOpen(false)
      router.refresh()
    })
  }

  const connectedDate = couple.created_at
    ? format(new Date(couple.created_at), 'MMMM d, yyyy')
    : 'Unknown'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-5" />
          Connection Active
        </CardTitle>
        <CardDescription>
          You are connected with another person
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {partnerProfile?.display_name || 'Connected Person'}
              </p>
              <p className="text-sm text-muted-foreground">
                Connected since {connectedDate}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <p>
            You now have access to shared features. Both you and your connected
            person can use these features together.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button variant="outline" className="w-full">
            <Unlink className="size-4" />
            Disconnect
          </Button>}>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Disconnect Confirmation
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect? This will disable all
                shared features.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">This action will:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>End your connection with {partnerProfile?.display_name || 'the other person'}</li>
                <li>Disable all shared features</li>
                <li>Keep your personal data intact</li>
              </ul>
            </div>

            <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
              <p>
                <strong>Note:</strong> Disconnection records are kept for
                security purposes. You can reconnect anytime by generating a new
                invitation code.
              </p>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancel</Button>}>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="size-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
