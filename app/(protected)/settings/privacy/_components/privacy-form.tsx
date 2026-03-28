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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updatePrivacySettings, type PrivacySettings } from '@/actions/privacy'
import { Loader2, Check, Flame, Clock, Download, Trash2 } from 'lucide-react'

interface PrivacyFormProps {
  initialSettings: PrivacySettings
}

const RETENTION_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: null, label: 'Never' },
]

export function PrivacyForm({ initialSettings }: PrivacyFormProps) {
  const [burnAfterReading, setBurnAfterReading] = useState(
    initialSettings.burn_after_reading
  )
  const [retentionDays, setRetentionDays] = useState<number | null>(
    initialSettings.retention_days
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)

    const result = await updatePrivacySettings({
      burn_after_reading: burnAfterReading,
      retention_days: retentionDays,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Burn After Reading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="size-5" />
            Disappearing Messages
          </CardTitle>
          <CardDescription>
            Automatically delete sensitive messages after they have been viewed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="burn-after-reading">Enable</Label>
              <p className="text-sm text-muted-foreground">
                Messages marked as sensitive will be deleted after reading
              </p>
            </div>
            <Switch
              id="burn-after-reading"
              checked={burnAfterReading}
              onCheckedChange={setBurnAfterReading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Data Retention
          </CardTitle>
          <CardDescription>
            How long to keep your data before automatic deletion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {RETENTION_OPTIONS.map((option) => (
              <label
                key={option.value ?? 'never'}
                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:bg-muted"
              >
                <input
                  type="radio"
                  name="retention"
                  value={option.value ?? 'never'}
                  checked={retentionDays === option.value}
                  onChange={() => setRetentionDays(option.value)}
                  className="size-4"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="size-4" />
            Saved
          </>
        ) : (
          'Save Settings'
        )}
      </Button>

      {/* Data Export - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled className="w-full">
            <Download className="size-4" />
            Export Data (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
            <p>
              <strong>Warning:</strong> This action cannot be undone. All your
              data will be permanently deleted.
            </p>
          </div>
          <Button variant="destructive" disabled className="w-full">
            <Trash2 className="size-4" />
            Delete Account (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
