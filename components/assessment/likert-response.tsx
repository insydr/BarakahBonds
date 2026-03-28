'use client'

import { useCallback, useEffect, useRef } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { LIKERT_SCALE } from '@/lib/assessment/constants'

interface LikertResponseProps {
  /** Current selected value (1-5) */
  value: number | null
  /** Callback when value changes */
  onChange: (value: number) => void
  /** Whether the input is disabled */
  disabled?: boolean
}

/**
 * Likert scale response component
 * Displays a 5-point scale from "Strongly Disagree" to "Strongly Agree"
 * Supports keyboard navigation with arrow keys
 */
export function LikertResponse({
  value,
  onChange,
  disabled = false
}: LikertResponseProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(parseInt(newValue, 10))
    },
    [onChange]
  )

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      const currentValue = value ?? 3 // Default to middle if no value
      let newValue: number | null = null

      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = Math.max(LIKERT_SCALE.min, currentValue - 1)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = Math.min(LIKERT_SCALE.max, currentValue + 1)
      }

      if (newValue !== null && newValue !== value) {
        e.preventDefault()
        onChange(newValue)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
      return () => container.removeEventListener('keydown', handleKeyDown)
    }
  }, [value, onChange, disabled])

  return (
    <div ref={containerRef} className="space-y-4" tabIndex={0}>
      {/* Scale labels at top */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs text-muted-foreground">
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="space-y-1">
            <div>{LIKERT_SCALE.labels[num as keyof typeof LIKERT_SCALE.labels]}</div>
          </div>
        ))}
      </div>

      {/* Radio buttons */}
      <RadioGroup
        value={value?.toString() ?? ''}
        onValueChange={handleChange}
        disabled={disabled}
        className="grid grid-cols-5 gap-4"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex flex-col items-center gap-2">
            <RadioGroupItem
              value={num.toString()}
              id={`likert-${num}`}
              className="size-6"
            />
            <Label
              htmlFor={`likert-${num}`}
              className="text-sm font-medium cursor-pointer"
            >
              {num}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Visual scale bar */}
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
          style={{ width: value ? `${((value - 1) / 4) * 100}%` : '0%' }}
        />
        {/* Tick marks */}
        <div className="absolute inset-0 flex justify-between">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={`w-0.5 h-full ${value && value >= num ? 'bg-primary-foreground/30' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-muted-foreground text-center">
        Use arrow keys to navigate
      </p>
    </div>
  )
}

export default LikertResponse
