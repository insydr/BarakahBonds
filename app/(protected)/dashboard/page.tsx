import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, BookOpen, Users } from 'lucide-react'

export const metadata = {
  title: 'Dashboard | Barakah',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user?.id)
    .single()

  // Check for partner/couple status
  const { data: couple } = await supabase
    .from('couples')
    .select('id, status')
    .or(`partner_1_id.eq.${user?.id},partner_2_id.eq.${user?.id}`)
    .eq('status', 'active')
    .single()

  const hasPartner = !!couple

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
              Begin your personal growth assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild disabled className="w-full">
              <span>Coming in Phase 2</span>
            </Button>
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
    </div>
  )
}
