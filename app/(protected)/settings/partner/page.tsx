import { createClient } from '@/lib/supabase/server'
import { GenerateInvite } from './_components/generate-invite'
import { AcceptInvite } from './_components/accept-invite'
import { PendingApproval } from './_components/pending-approval'
import { PartnerStatus } from './_components/partner-status'
import type { Database } from '@/lib/supabase/types'

export const metadata = {
  title: 'Partner | Barakah',
}

type Couple = Database['public']['Tables']['couples']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default async function PartnerSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch couple record where user is partner_1 or partner_2
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .or(`partner_1_id.eq.${user.id},partner_2_id.eq.${user.id}`)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Determine UI state
  let partnerProfile: Profile | null = null

  if (couple) {
    // Determine partner ID
    const partnerId =
      couple.partner_1_id === user.id
        ? couple.partner_2_id
        : couple.partner_1_id

    // Fetch partner profile if we have a partner ID
    if (partnerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single()

      partnerProfile = profile
    }
  }

  // State: No couple record exists
  if (!couple) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
          <p className="text-muted-foreground">
            Link with someone to access shared features
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GenerateInvite />
          <AcceptInvite />
        </div>

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            Connecting with someone is optional. You can use all personal
            features without connecting. Shared features require both people to
            be linked.
          </p>
        </div>
      </div>
    )
  }

  // State: Active couple
  if (couple.status === 'active') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
          <p className="text-muted-foreground">Manage your connection</p>
        </div>

        <PartnerStatus couple={couple} partnerProfile={partnerProfile} />
      </div>
    )
  }

  // State: Pending couple - user is initiator (partner_1)
  const isInitiator = couple.partner_1_id === user.id

  // State: Pending without partner_2 (waiting for someone to use code)
  if (isInitiator && !couple.partner_2_id) {
    // Check if invitation is still valid
    const isExpired =
      couple.invitation_expires_at &&
      new Date(couple.invitation_expires_at) < new Date()

    if (isExpired) {
      // Show generate new code option
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
            <p className="text-muted-foreground">
              Link with someone to access shared features
            </p>
          </div>

          <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <p>Your previous invitation code has expired. Generate a new one.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GenerateInvite />
            <AcceptInvite />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
          <p className="text-muted-foreground">Manage your connection</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GenerateInvite
            existingCode={couple.invitation_code}
            existingExpiresAt={couple.invitation_expires_at}
          />
          <PendingApproval
            couple={couple}
            partnerProfile={partnerProfile}
            isInitiator={isInitiator}
          />
        </div>
      </div>
    )
  }

  // State: Pending with partner_2 (waiting for approval)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connect</h1>
        <p className="text-muted-foreground">Manage your connection</p>
      </div>

      <PendingApproval
        couple={couple}
        partnerProfile={partnerProfile}
        isInitiator={isInitiator}
      />
    </div>
  )
}
