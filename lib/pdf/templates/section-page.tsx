import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { SectionScore, SectionAlignment, DiscussionArea } from '@/lib/assessment/types'
import type { AssessmentSection } from '@/lib/supabase/types'
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
  titleArabic: {
    fontSize: 16,
    color: '#059669',
    marginTop: 4
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 6
  },
  scoreBlock: {
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 4
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  alignmentContainer: {
    marginBottom: 20
  },
  alignmentTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10
  },
  alignmentBar: {
    height: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8
  },
  alignmentFill: {
    height: '100%',
    borderRadius: 10
  },
  alignmentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  alignmentLabel: {
    fontSize: 9,
    color: '#718096'
  },
  divergenceContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fcd34d'
  },
  divergenceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8
  },
  divergenceText: {
    fontSize: 11,
    color: '#78350f',
    lineHeight: 1.4
  },
  discussionContainer: {
    marginBottom: 20
  },
  discussionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10
  },
  promptCard: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  promptTopic: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 6
  },
  promptText: {
    fontSize: 11,
    color: '#2d3748',
    lineHeight: 1.5,
    marginBottom: 8
  },
  islamicContext: {
    fontSize: 10,
    color: '#059669',
    fontStyle: 'italic',
    lineHeight: 1.4,
    marginBottom: 4
  },
  citationReference: {
    fontSize: 9,
    color: '#718096'
  },
  guidanceContainer: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  guidanceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 6
  },
  guidanceText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 1.5
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#2d3748'
  }
})

interface SectionPageProps {
  section: AssessmentSection
  partner1Score?: SectionScore
  partner2Score?: SectionScore
  alignment?: SectionAlignment
  discussionPrompts: DiscussionArea[]
}

export function SectionPage({
  section,
  partner1Score,
  partner2Score,
  alignment,
  discussionPrompts
}: SectionPageProps) {
  const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === section)

  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT_THRESHOLD) return '#059669'
    if (score >= SCORE_THRESHOLDS.GOOD_THRESHOLD) return '#d97706'
    return '#dc2626'
  }

  const alignmentValue = alignment?.alignment ?? 0
  const alignmentColor = getScoreColor(alignmentValue)
  const divergentCount = alignment?.divergentQuestions.length ?? 0

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{sectionDef?.name || section}</Text>
        <Text style={styles.titleArabic}>{sectionDef?.nameArabic}</Text>
      </View>

      {/* Description */}
      <Text style={[styles.body, { marginBottom: 20 }]}>
        {sectionDef?.description}
      </Text>

      {/* Scores Container */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Partner A Score</Text>
          <Text style={styles.scoreValue}>
            {partner1Score ? Math.round(partner1Score.score) : '-'}
          </Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Partner B Score</Text>
          <Text style={styles.scoreValue}>
            {partner2Score ? Math.round(partner2Score.score) : '-'}
          </Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Alignment</Text>
          <Text style={[styles.scoreValue, { color: alignmentColor }]}>
            {Math.round(alignmentValue)}%
          </Text>
        </View>
      </View>

      {/* Alignment Visualization */}
      <View style={styles.alignmentContainer}>
        <Text style={styles.alignmentTitle}>Partner Alignment</Text>
        <View style={styles.alignmentBar}>
          <View
            style={[
              styles.alignmentFill,
              {
                width: `${alignmentValue}%`,
                backgroundColor: alignmentColor
              }
            ]}
          />
        </View>
        <View style={styles.alignmentLabels}>
          <Text style={styles.alignmentLabel}>0%</Text>
          <Text style={styles.alignmentLabel}>
            {alignment?.questionsCompared ?? 0} questions compared
          </Text>
          <Text style={styles.alignmentLabel}>100%</Text>
        </View>
      </View>

      {/* Divergence Warning */}
      {divergentCount > 0 && (
        <View style={styles.divergenceContainer}>
          <Text style={styles.divergenceTitle}>
            Discussion Points Identified ({divergentCount})
          </Text>
          <Text style={styles.divergenceText}>
            {divergentCount} question(s) in this section showed significantly different responses
            between partners. These areas may benefit from open discussion and exploration of each
            other&apos;s perspectives.
          </Text>
        </View>
      )}

      {/* Discussion Prompts */}
      {discussionPrompts.length > 0 && (
        <View style={styles.discussionContainer}>
          <Text style={styles.discussionTitle}>Suggested Discussion Topics</Text>
          {discussionPrompts.map((prompt, index) => (
            <View key={index} style={styles.promptCard}>
              <Text style={styles.promptTopic}>{prompt.topic}</Text>
              <Text style={styles.promptText}>{prompt.prompt}</Text>
              <Text style={styles.islamicContext}>{prompt.islamicContext}</Text>
              <Text style={styles.citationReference}>Reference: {prompt.citationReference}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Islamic Guidance */}
      <View style={styles.guidanceContainer}>
        <Text style={styles.guidanceTitle}>Islamic Guidance</Text>
        <Text style={styles.guidanceText}>
          {section === 'deen' &&
            'The foundation of a blessed marriage is shared faith and commitment to Allah. The Prophet (ﷺ) taught that a spouse who helps you remember Allah is among the greatest blessings.'}
          {section === 'dunya' &&
            'Financial compatibility and transparency are essential in Islamic marriage. The Quran encourages fair dealings and mutual support in worldly matters while prioritizing the hereafter.'}
          {section === 'aila' &&
            'Family dynamics require wisdom and balance. Islam honors both extended family ties and the primacy of the marital bond. Clear communication and boundaries serve both.'}
          {section === 'nafs' &&
            'Personal growth and emotional health are vital for a thriving marriage. The Prophet (ﷺ) encouraged self-reflection and personal development throughout life.'}
        </Text>
      </View>
    </Page>
  )
}
