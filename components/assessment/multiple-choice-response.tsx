'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { Json } from '@/lib/supabase/types'

interface MultipleChoiceOption {
  value: string
  label: string
}

interface MultipleChoiceResponseProps {
  /** Current selected value */
  value: string | null
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Available options */
  options: MultipleChoiceOption[]
  /** Whether the input is disabled */
  disabled?: boolean
}

/**
 * Parse options from question options JSON
 */
function parseOptions(options: Json | null): MultipleChoiceOption[] {
  if (!options) return []
  if (Array.isArray(options)) {
    return options.map((opt, index) => {
      if (typeof opt === 'string') {
        return { value: String(index), label: opt }
      }
      if (typeof opt === 'object' && opt !== null) {
        const obj = opt as Record<string, unknown>
        return {
          value: String(obj.value ?? index),
          label: String(obj.label ?? obj.text ?? obj.value ?? `Option ${index + 1}`)
        }
      }
      return { value: String(index), label: String(opt) }
    })
  }
  return []
}

/**
 * Multiple choice response component
 * Displays a list of options as radio buttons
 */
export function MultipleChoiceResponse({
  value,
  onChange,
  options: propOptions,
  disabled = false
}: MultipleChoiceResponseProps) {
  const options = propOptions.length > 0 ? propOptions : []

  return (
    <RadioGroup
      value={value ?? ''}
      onValueChange={onChange}
      disabled={disabled}
      className="space-y-3"
    >
      {options.map((option, index) => (
        <div
          key={option.value}
          className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
            value === option.value
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <RadioGroupItem
            value={option.value}
            id={`option-${index}`}
            className="shrink-0"
          />
          <Label
            htmlFor={`option-${index}`}
            className="flex-1 cursor-pointer text-sm font-normal leading-relaxed"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

// Re-export parseOptions for external use
export { parseOptions }

export default MultipleChoiceResponse
