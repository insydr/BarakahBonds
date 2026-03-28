import { createClient } from '@/lib/supabase/server'
import { PrivacyForm } from './_components/privacy-form'
import type { PrivacySettings } from '@/actions/privacy'

export const metadata = {
  title: 'Privacy | Barakah',
}

export default async function PrivacySettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Default settings
  let privacySettings: PrivacySettings = {
    burn_after_reading: false,
    retention_days: null,
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('privacy_settings')
      .eq('id', user.id)
      .single()

    if (profile?.privacy_settings) {
      privacySettings = {
        burn_after_reading:
          (profile.privacy_settings as Record<string, unknown>)
            ?.burn_after_reading === true,
        retention_days:
          (profile.privacy_settings as Record<string, unknown>)
            ?.retention_days as number | null,
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy</h1>
        <p className="text-muted-foreground">
          Control your data and privacy settings
        </p>
      </div>

      <PrivacyForm initialSettings={privacySettings} />
    </div>
  )
}
