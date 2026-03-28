import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { AssessmentScore, RedFlag, CompatibilityScore } from '@/lib/assessment/types'
import { ASSESSMENT_SECTIONS, SCORE_THRESHOLDS } from '@/lib/assessment/constants'

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
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d',
    paddingBottom: 10
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  overallScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 25,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  scorePercent: {
    fontSize: 16,
    color: '#ffffff'
  },
  scoreDetails: {
    flex: 1
  },
  scoreLabel: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 5
  },
  scoreLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  scoreDescription: {
    fontSize: 11,
    color: '#718096',
    lineHeight: 1.4
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25
  },
  sectionCard: {
    width: '47%',
    padding: 15,
    marginBottom: 15,
    marginRight: '3%',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  sectionScore: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  sectionBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  sectionBarFill: {
    height: '100%',
    borderRadius: 4
  },
  findingsContainer: {
    marginBottom: 20
  },
  findingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10
  },
  findingItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 10
  },
  findingBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    marginRight: 8
  },
  findingText: {
    flex: 1,
    fontSize: 11,
    color: '#2d3748',
    lineHeight: 1.4
  },
  flagsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b'
  },
  flagsWarningDanger: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444'
  },
  flagsIcon: {
    fontSize: 18,
    marginRight: 10
  },
  flagsText: {
    flex: 1,
    fontSize: 11,
    color: '#92400e'
  },
  flagsTextDanger: {
    color: '#991b1b'
  }
})

interface SummaryPageProps {
  partner1Scores: AssessmentScore
  partner2Scores: AssessmentScore
  compatibility: CompatibilityScore
  flags: RedFlag[]
}

export function SummaryPage({
  partner1Scores: _partner1Scores,
  partner2Scores: _partner2Scores,
  compatibility,
  flags
}: SummaryPageProps) {
  const overallScore = compatibility.overallAlignment
  const hardFlags = flags.filter((f) => f.severity === 'hard')
  const softFlags = flags.filter((f) => f.severity === 'soft')

  // Determine score color and level
  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT_THRESHOLD) return '#059669'
    if (score >= SCORE_THRESHOLDS.GOOD_THRESHOLD) return '#d97706'
    return '#dc2626'
  }

  const getScoreLevel = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT_THRESHOLD) return 'Excellent Compatibility'
    if (score >= SCORE_THRESHOLDS.GOOD_THRESHOLD) return 'Good Compatibility'
    return 'Needs Discussion'
  }

  const getScoreDescription = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT_THRESHOLD) {
      return 'Strong alignment across most areas. Continue building on your shared values.'
    }
    if (score >= SCORE_THRESHOLDS.GOOD_THRESHOLD) {
      return 'Good foundation with some areas needing discussion. Use the prompts to explore differences.'
    }
    return 'Several areas show differences. Consider discussing with an Imam or counselor.'
  }

  // Get strengths and growth areas
  const getStrengthsAndGrowth = (): {
    strengths: { section: string; score: number }[]
    growthAreas: { section: string; score: number }[]
  } => {
    const sections = compatibility.sectionAlignments.map((s) => ({
      section: s.section,
      score: s.alignment
    }))

    const sorted = [...sections].sort((a, b) => b.score - a.score)
    const strengths = sorted.slice(0, 3).filter((s) => s.score >= 70)
    const growthAreas = sorted
      .reverse()
      .slice(0, 3)
      .filter((s) => s.score < 70)

    return { strengths, growthAreas }
  }

  const { strengths, growthAreas } = getStrengthsAndGrowth()
  const scoreColor = getScoreColor(overallScore)

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Executive Summary</Text>
      </View>

      {/* Overall Score */}
      <View style={styles.overallScoreContainer}>
        <View
          style={[
            styles.scoreCircle,
            { backgroundColor: scoreColor }
          ]}
        >
          <Text style={styles.scoreValue}>{Math.round(overallScore)}</Text>
          <Text style={styles.scorePercent}>%</Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={styles.scoreLabel}>Overall Compatibility Score</Text>
          <Text style={[styles.scoreLevel, { color: scoreColor }]}>
            {getScoreLevel(overallScore)}
          </Text>
          <Text style={styles.scoreDescription}>{getScoreDescription(overallScore)}</Text>
        </View>
      </View>

      {/* Section Scores Grid */}
      <Text style={styles.findingsTitle}>Section Alignment Overview</Text>
      <View style={styles.sectionGrid}>
        {compatibility.sectionAlignments.map((section) => {
          const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === section.section)
          const color = getScoreColor(section.alignment)

          return (
            <View key={section.section} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionName}>
                  {sectionDef?.name || section.section} - {sectionDef?.nameArabic}
                </Text>
                <Text style={[styles.sectionScore, { color }]}>
                  {Math.round(section.alignment)}%
                </Text>
              </View>
              <View style={styles.sectionBar}>
                <View
                  style={[
                    styles.sectionBarFill,
                    { width: `${section.alignment}%`, backgroundColor: color }
                  ]}
                />
              </View>
            </View>
          )
        })}
      </View>

      {/* Strengths */}
      {strengths.length > 0 && (
        <View style={styles.findingsContainer}>
          <Text style={styles.findingsTitle}>Strengths</Text>
          {strengths.map((s, index) => {
            const sectionDef = ASSESSMENT_SECTIONS.find((def) => def.id === s.section)
            return (
              <View key={index} style={styles.findingItem}>
                <View
                  style={[
                    styles.findingBullet,
                    { backgroundColor: '#059669' }
                  ]}
                />
                <Text style={styles.findingText}>
                  {sectionDef?.name}: {Math.round(s.score)}% alignment - Strong shared values in this
                  area
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Growth Areas */}
      {growthAreas.length > 0 && (
        <View style={styles.findingsContainer}>
          <Text style={styles.findingsTitle}>Areas for Discussion</Text>
          {growthAreas.map((s, index) => {
            const sectionDef = ASSESSMENT_SECTIONS.find((def) => def.id === s.section)
            return (
              <View key={index} style={styles.findingItem}>
                <View
                  style={[
                    styles.findingBullet,
                    { backgroundColor: '#d97706' }
                  ]}
                />
                <Text style={styles.findingText}>
                  {sectionDef?.name}: {Math.round(s.score)}% alignment - Topics in this area may
                  benefit from deeper discussion
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Flags Warning */}
      {flags.length > 0 && (
        <View
          style={
            hardFlags.length > 0
              ? [styles.flagsWarning, styles.flagsWarningDanger]
              : styles.flagsWarning
          }
        >
          <Text style={styles.flagsIcon}>
            {hardFlags.length > 0 ? '!' : '*'}
          </Text>
          <Text
            style={
              hardFlags.length > 0
                ? [styles.flagsText, styles.flagsTextDanger]
                : styles.flagsText
            }
          >
            {hardFlags.length > 0
              ? `${hardFlags.length} critical concern(s) and ${softFlags.length} area(s) for discussion detected. Please review the Flags section carefully.`
              : `${softFlags.length} area(s) for discussion detected. Review the Flags section for guidance.`}
          </Text>
        </View>
      )}
    </Page>
  )
}
