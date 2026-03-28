'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScoreDisplayProps {
  /** Score value (0-100) */
  score: number
  /** Label for the score */
  label: string
  /** Whether to show interpretation text */
  showInterpretation?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

/**
 * Get color classes based on score
 */
function getScoreColors(score: number): {
  text: string
  bg: string
  stroke: string
  ring: string
} {
  if (score >= 70) {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      stroke: 'stroke-emerald-500',
      ring: 'ring-emerald-500/20'
    }
  }
  if (score >= 50) {
    return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      stroke: 'stroke-amber-500',
      ring: 'ring-amber-500/20'
    }
  }
  return {
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    stroke: 'stroke-rose-500',
    ring: 'ring-rose-500/20'
  }
}

/**
 * Get interpretation text based on score
 */
function getInterpretation(score: number): string {
  if (score >= 85) {
    return 'Excellent - Strong foundation for marriage'
  }
  if (score >= 70) {
    return 'Good - Healthy patterns with room to grow'
  }
  if (score >= 50) {
    return 'Fair - Some areas need attention'
  }
  return 'Needs Attention - Discuss with your partner'
}

/**
 * Get category label based on score
 */
function getCategoryLabel(score: number): string {
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Needs Work'
}

/**
 * Circular gauge that displays a score with color coding
 */
export function ScoreDisplay({
  score,
  label,
  showInterpretation = true,
  size = 'lg',
  className
}: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const colors = getScoreColors(score)

  // Animate score on mount
  useEffect(() => {
    const duration = 1000
    const startTime = Date.now()
    const startScore = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentScore = startScore + (score - startScore) * easeOut

      setAnimatedScore(currentScore)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score])

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-24 h-24',
      text: 'text-2xl font-bold',
      label: 'text-xs',
      interpretation: 'text-xs',
      strokeWidth: 6
    },
    md: {
      container: 'w-32 h-32',
      text: 'text-3xl font-bold',
      label: 'text-sm',
      interpretation: 'text-sm',
      strokeWidth: 8
    },
    lg: {
      container: 'w-40 h-40',
      text: 'text-4xl font-bold',
      label: 'text-base',
      interpretation: 'text-sm',
      strokeWidth: 10
    }
  }

  const config = sizeConfig[size]
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Circular Gauge */}
      <div className={cn('relative', config.container)}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-300', colors.stroke)}
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(config.text, colors.text)}>
            {Math.round(animatedScore)}
          </span>
          <span className={cn('text-muted-foreground', config.label)}>
            out of 100
          </span>
        </div>
      </div>

      {/* Label */}
      <h3 className={cn('mt-3 font-medium', config.label)}>
        {label}
      </h3>

      {/* Category Badge */}
      <div className={cn('mt-2 px-3 py-1 rounded-full ring-2', colors.bg, colors.ring)}>
        <span className={cn('font-medium', config.label, colors.text)}>
          {getCategoryLabel(score)}
        </span>
      </div>

      {/* Interpretation */}
      {showInterpretation && (
        <p className={cn('mt-3 text-center text-muted-foreground max-w-xs', config.interpretation)}>
          {getInterpretation(score)}
        </p>
      )}
    </div>
  )
}

/**
 * Mini gauge for inline score display
 */
export function MiniScoreGauge({
  score,
  label,
  className
}: {
  score: number
  label: string
  className?: string
}) {
  const colors = getScoreColors(score)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Mini circular gauge */}
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted/20"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 - (score / 100) * 2 * Math.PI * 40}
            className={colors.stroke}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-sm font-bold', colors.text)}>
            {Math.round(score)}
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

/**
 * Progress bar score display
 */
export function ScoreProgressBar({
  score,
  label,
  showValue = true,
  className
}: {
  score: number
  label: string
  showValue?: boolean
  className?: string
}) {
  const colors = getScoreColors(score)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        {showValue && (
          <span className={cn('text-sm font-bold', colors.text)}>
            {Math.round(score)}
          </span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors.bg.replace('/30', ''))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
