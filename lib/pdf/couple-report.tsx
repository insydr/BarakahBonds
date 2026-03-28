import {
  Document,
  StyleSheet,
  pdf
} from '@react-pdf/renderer'
import type { AssessmentScore, RedFlag, CompatibilityScore, DiscussionArea } from '@/lib/assessment/types'
import type { AssessmentSection } from '@/lib/supabase/types'
import { CoverPage } from './templates/cover-page'
import { SummaryPage } from './templates/summary-page'
import { SectionPage } from './templates/section-page'
import { FlagsPage } from './templates/flags-page'
import { DiscussionPage } from './templates/discussion-page'

/**
 * Props for the Couple Report Document
 */
export interface CoupleReportProps {
  /** Partner 1's display name */
  partner1Name: string
  /** Partner 2's display name */
  partner2Name: string
  /** Assessment date */
  assessmentDate: string
  /** Whether to use anonymous mode (Partner A/B) */
  anonymous: boolean
  /** Partner 1's assessment scores */
  partner1Scores: AssessmentScore
  /** Partner 2's assessment scores */
  partner2Scores: AssessmentScore
  /** Combined compatibility score */
  compatibility: CompatibilityScore
  /** Detected red flags from both partners */
  flags: RedFlag[]
  /** Discussion areas for the couple */
  discussionAreas: DiscussionArea[]
}

/**
 * Color constants for PDF styling
 */
export const colors = {
  primary: '#1a365d',
  secondary: '#4a5568',
  accent: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  lightGray: '#f7fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#2d3748'
}

/**
 * Global styles for the PDF document
 */
export const globalStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 20
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.primary
  },
  subheading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.darkGray
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.darkGray
  },
  text: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 6
  },
  textBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary
  },
  container: {
    marginBottom: 15
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10
  },
  column: {
    flexDirection: 'column'
  },
  spacer: {
    height: 15
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.mediumGray,
    marginBottom: 15
  }
})

/**
 * Main PDF Document Component
 * Composes all pages for the Couple's Assessment Report
 */
export function CoupleReportDocument(props: CoupleReportProps) {
  const sections: AssessmentSection[] = ['deen', 'dunya', 'aila', 'nafs']

  return (
    <Document>
      {/* Cover Page */}
      <CoverPage
        partner1Name={props.partner1Name}
        partner2Name={props.partner2Name}
        assessmentDate={props.assessmentDate}
        anonymous={props.anonymous}
      />

      {/* Executive Summary Page */}
      <SummaryPage
        partner1Scores={props.partner1Scores}
        partner2Scores={props.partner2Scores}
        compatibility={props.compatibility}
        flags={props.flags}
      />

      {/* Section Detail Pages (one per section) */}
      {sections.map((section) => {
        const sectionAlignment = props.compatibility.sectionAlignments.find(
          (s) => s.section === section
        )
        const sectionDiscussions = props.discussionAreas.filter(
          (d) => d.section === section
        )

        return (
          <SectionPage
            key={section}
            section={section}
            partner1Score={props.partner1Scores.sections.find(
              (s) => s.section === section
            )}
            partner2Score={props.partner2Scores.sections.find(
              (s) => s.section === section
            )}
            alignment={sectionAlignment}
            discussionPrompts={sectionDiscussions}
          />
        )
      })}

      {/* Red Flags Page */}
      <FlagsPage flags={props.flags} />

      {/* Discussion Prompts Page */}
      <DiscussionPage discussionAreas={props.discussionAreas} />
    </Document>
  )
}

/**
 * Generate PDF blob from the couple report
 * Used by the API route to return the PDF file
 *
 * @param props - Report data
 * @returns Promise resolving to PDF Blob
 */
export async function generateCoupleReport(
  props: CoupleReportProps
): Promise<Blob> {
  const blob = await pdf(<CoupleReportDocument {...props} />).toBlob()
  return blob
}

/**
 * Generate PDF as base64 string
 * Alternative output format for storage or transmission
 *
 * @param props - Report data
 * @returns Promise resolving to base64 encoded PDF string
 */
export async function generateCoupleReportBase64(
  props: CoupleReportProps
): Promise<string> {
  const blob = await generateCoupleReport(props)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      // Remove the data URL prefix
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Get display names for the report
 * Handles anonymous mode
 */
export function getDisplayNames(
  partner1Name: string | null | undefined,
  partner2Name: string | null | undefined,
  anonymous: boolean
): { partner1: string; partner2: string } {
  if (anonymous) {
    return {
      partner1: 'Partner A',
      partner2: 'Partner B'
    }
  }
  return {
    partner1: partner1Name || 'Partner A',
    partner2: partner2Name || 'Partner B'
  }
}
