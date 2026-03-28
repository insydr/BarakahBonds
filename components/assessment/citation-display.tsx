'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Citation, CitationType } from '@/lib/supabase/types'

interface CitationDisplayProps {
  /** Citation data */
  citation: Citation
  /** Whether the citation is expanded by default */
  expanded?: boolean
  /** Callback when expand/collapse is toggled */
  onToggle?: () => void
}

/**
 * Get icon for citation type
 */
function CitationIcon({ type }: { type: CitationType }) {
  if (type === 'quran') {
    return (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  }
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

/**
 * Citation display component
 * Shows Islamic scholarly citations (Quran/Hadith) in an expandable format
 */
export function CitationDisplay({
  citation,
  expanded = false,
  onToggle
}: CitationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
    onToggle?.()
  }

  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="h-auto w-full justify-start gap-2 p-2 text-muted-foreground hover:text-foreground"
      >
        <CitationIcon type={citation.type} />
        <span className="font-medium text-sm">
          {citation.type === 'quran' ? 'Quran' : 'Hadith'} Reference
        </span>
        <span className="text-xs opacity-70">
          {citation.source} {citation.reference}
        </span>
        <svg
          className={`size-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-3 rounded-lg bg-muted/50 p-4">
          {/* Source and reference */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{citation.source}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{citation.reference}</span>
            {citation.scholar_verified && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </>
            )}
          </div>

          {/* Arabic text (RTL) */}
          {citation.arabic_text && (
            <div className="text-right" dir="rtl" lang="ar">
              <p className="font-arabic text-lg leading-loose text-foreground">
                {citation.arabic_text}
              </p>
            </div>
          )}

          {/* English translation */}
          <div className="border-t border-border/50 pt-3">
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              &ldquo;{citation.translation}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CitationDisplay
