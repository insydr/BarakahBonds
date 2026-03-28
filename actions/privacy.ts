'use server'

import { createClient } from '@/lib/supabase/server'

export interface PrivacySettings {
  burn_after_reading: boolean
  retention_days: number | null
}

export interface PrivacyActionResult {
  success?: boolean
  error?: string
}

/**
 * Update user's privacy settings.
 * Updates the privacy_settings JSONB field in profiles table.
 */
export async function updatePrivacySettings(
  settings: PrivacySettings
): Promise<PrivacyActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update settings.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      privacy_settings: {
        burn_after_reading: settings.burn_after_reading,
        retention_days: settings.retention_days,
      },
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update privacy settings:', error)
    return { error: 'Failed to update settings. Please try again.' }
  }

  return { success: true }
}
