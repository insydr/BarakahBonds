import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface VerifyPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Check Your Email
        </h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification link to{' '}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            'your email address'
          )}
          .
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to verify your account. The link will
          expire in 24 hours.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or
        </p>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
