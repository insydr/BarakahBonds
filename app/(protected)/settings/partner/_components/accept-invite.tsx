'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { acceptInvite } from '@/actions/couple'
import { isValidInvitationCodeFormat } from '@/utils/invitation-code'
import { Loader2 } from 'lucide-react'

const CODE_LENGTH = 8

export function AcceptInvite() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleCodeChange = (value: string) => {
    // Auto-uppercase and limit to 8 characters
    const upperValue = value.toUpperCase().slice(0, CODE_LENGTH)
    setCode(upperValue)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (code.length !== CODE_LENGTH) {
      setError(`Invitation code must be ${CODE_LENGTH} characters.`)
      return
    }

    if (!isValidInvitationCodeFormat(code)) {
      setError('Invalid characters in code. Use only letters and numbers.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await acceptInvite(code)

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(true)

    // Refresh to show pending approval state
    setTimeout(() => {
      router.refresh()
    }, 1500)
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connection Requested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-200">
            <p>
              Your connection request has been submitted. The other person will
              need to approve the connection. You will be notified once they
              respond.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Invitation Code</CardTitle>
        <CardDescription>
          Have an invitation code? Enter it here to request a connection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Enter 8-character code"
              className="text-center font-mono text-lg tracking-wider uppercase"
              maxLength={CODE_LENGTH}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground text-center">
              {code.length}/{CODE_LENGTH} characters
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || code.length !== CODE_LENGTH}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Request Connection'
            )}
          </Button>
        </form>

        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            The person who shared the code with you will need to approve your
            connection request before you can access shared features.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
