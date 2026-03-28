'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { generateInvite } from '@/actions/couple'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface GenerateInviteProps {
  existingCode?: string
  existingExpiresAt?: string | null
}

export function GenerateInvite({
  existingCode,
  existingExpiresAt,
}: GenerateInviteProps) {
  const [code, setCode] = useState<string | null>(existingCode || null)
  const [expiresAt, setExpiresAt] = useState<string | null>(
    existingExpiresAt || null
  )
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    const result = await generateInvite()

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setCode(result.code || null)
    setExpiresAt(result.expiresAt || null)
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (code) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Invitation Code</CardTitle>
          <CardDescription>
            Share this code with someone you want to connect with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-muted p-4 text-center">
              <span className="font-mono text-2xl font-bold tracking-wider">
                {code}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          {expiresAt && (
            <p className="text-sm text-muted-foreground">
              This code expires on{' '}
              <span className="font-medium">
                {format(new Date(expiresAt), 'MMMM d, yyyy')}
              </span>
            </p>
          )}

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p>
              Share this code with the person you want to connect with. They
              will enter it in their app to request a connection. You will need
              to approve their request before the connection is established.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Generate New Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Invitation Code</CardTitle>
        <CardDescription>
          Create a code to share with someone you want to connect with
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate an invitation code to share with your partner. They will use
          this code to request a connection with you. Once they enter the code,
          you will need to approve the connection.
        </p>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Invitation Code'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
