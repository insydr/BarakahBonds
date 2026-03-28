'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/callback`,
      data: {
        display_name: displayName,
      },
    },
  })

  if (error) {
    return { error: 'Unable to create account. Please try again.' }
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`)
}
