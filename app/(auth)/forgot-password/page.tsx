'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    // Always show success message to prevent enumeration
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Check Your Email
          </h2>
          <p className="text-sm text-muted-foreground">
            If an account exists with this email, you will receive a password
            reset link.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Reset Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <p className="text-center text-sm">
        <Link
          href="/login"
          className="text-muted-foreground hover:underline"
        >
          Back to Sign In
        </Link>
      </p>
    </form>
  )
}
