import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { RedFlag } from '@/lib/assessment/types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d',
    paddingBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  noFlagsContainer: {
    padding: 30,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
    alignItems: 'center',
    marginBottom: 20
  },
  noFlagsIcon: {
    fontSize: 40,
    marginBottom: 15
  },
  noFlagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8
  },
  noFlagsText: {
    fontSize: 12,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 1.5
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 15
  },
  hardTitle: {
    color: '#dc2626'
  },
  softTitle: {
    color: '#d97706'
  },
  flagCard: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 8
  },
  hardCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  softCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d'
  },
  flagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  flagIcon: {
    fontSize: 16,
    marginRight: 8
  },
  flagTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1
  },
  hardFlagTitle: {
    color: '#991b1b'
  },
  softFlagTitle: {
    color: '#92400e'
  },
  flagDescription: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 10
  },
  hardFlagDesc: {
    color: '#7f1d1d'
  },
  softFlagDesc: {
    color: '#78350f'
  },
  guidanceBox: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    marginBottom: 8
  },
  guidanceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4
  },
  guidanceText: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 1.5
  },
  citationText: {
    fontSize: 9,
    color: '#718096',
    fontStyle: 'italic'
  },
  recommendationBox: {
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginTop: 15
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6
  },
  recommendationText: {
    fontSize: 11,
    color: '#78350f',
    lineHeight: 1.5
  },
  criticalRecommendationBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444'
  },
  criticalRecommendationTitle: {
    color: '#991b1b'
  },
  criticalRecommendationText: {
    color: '#7f1d1d'
  },
  footer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  footerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 6
  },
  footerText: {
    fontSize: 10,
    color: '#718096',
    lineHeight: 1.4
  }
})

interface FlagsPageProps {
  flags: RedFlag[]
}

export function FlagsPage({ flags }: FlagsPageProps) {
  const hardFlags = flags.filter((f) => f.severity === 'hard')
  const softFlags = flags.filter((f) => f.severity === 'soft')
  const hasNoFlags = flags.length === 0

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Assessment Flags & Guidance</Text>
      </View>

      {/* No Flags Scenario */}
      {hasNoFlags && (
        <View style={styles.noFlagsContainer}>
          <Text style={styles.noFlagsIcon}>✓</Text>
          <Text style={styles.noFlagsTitle}>No Significant Concerns Detected</Text>
          <Text style={styles.noFlagsText}>
            Based on the assessment responses, no critical concerns or flags were identified. This is
            a positive indicator for the relationship. However, all couples benefit from ongoing
            communication and growth together.
          </Text>
        </View>
      )}

      {/* Hard Flags Section */}
      {hardFlags.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.hardTitle]}>
            Critical Concerns ({hardFlags.length})
          </Text>
          {hardFlags.map((flag, index) => (
            <View key={index} style={[styles.flagCard, styles.hardCard]}>
              <View style={styles.flagHeader}>
                <Text style={styles.flagIcon}>!</Text>
                <Text style={[styles.flagTitle, styles.hardFlagTitle]}>{flag.title}</Text>
              </View>
              <Text style={[styles.flagDescription, styles.hardFlagDesc]}>
                {flag.description}
              </Text>
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceLabel}>Islamic Guidance</Text>
                <Text style={styles.guidanceText}>{flag.islamicGuidance}</Text>
                <Text style={styles.citationText}>{flag.citationReference}</Text>
              </View>
            </View>
          ))}

          <View style={[styles.recommendationBox, styles.criticalRecommendationBox]}>
            <Text
              style={[styles.recommendationTitle, styles.criticalRecommendationTitle]}
            >
              Professional Support Recommended
            </Text>
            <Text
              style={[styles.recommendationText, styles.criticalRecommendationText]}
            >
              Critical concerns have been identified that warrant professional attention. We
              strongly recommend consulting with a qualified Islamic counselor, therapist, or Imam
              before proceeding. These professionals can provide appropriate guidance and support
              tailored to the specific situation.
            </Text>
          </View>
        </>
      )}

      {/* Soft Flags Section */}
      {softFlags.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.softTitle]}>
            Areas for Discussion ({softFlags.length})
          </Text>
          {softFlags.map((flag, index) => (
            <View key={index} style={[styles.flagCard, styles.softCard]}>
              <View style={styles.flagHeader}>
                <Text style={styles.flagIcon}>*</Text>
                <Text style={[styles.flagTitle, styles.softFlagTitle]}>{flag.title}</Text>
              </View>
              <Text style={[styles.flagDescription, styles.softFlagDesc]}>
                {flag.description}
              </Text>
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceLabel}>Islamic Guidance</Text>
                <Text style={styles.guidanceText}>{flag.islamicGuidance}</Text>
                <Text style={styles.citationText}>{flag.citationReference}</Text>
              </View>
            </View>
          ))}

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Discussion Recommended</Text>
            <Text style={styles.recommendationText}>
              These areas have been identified as potential discussion points. While not critical,
              addressing them openly can strengthen the relationship. Consider discussing these
              topics with your potential spouse and, if needed, seeking guidance from an Imam or
              mentor.
            </Text>
          </View>
        </>
      )}

      {/* Footer Guidance */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Important Note</Text>
        <Text style={styles.footerText}>
          This assessment is a tool for self-reflection and guided discussion. It is not a
          definitive judgment on compatibility or a substitute for professional counseling. The
          flags and guidance provided are based on general principles and should be interpreted in
          the context of individual circumstances. Always seek advice from qualified religious
          scholars and counselors for personal matters.
        </Text>
      </View>
    </Page>
  )
}
