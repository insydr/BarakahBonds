import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { DiscussionArea } from '@/lib/assessment/types'
import type { AssessmentSection } from '@/lib/supabase/types'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment/constants'

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
  introContainer: {
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    marginBottom: 20
  },
  introTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8
  },
  introText: {
    fontSize: 11,
    color: '#4a5568',
    lineHeight: 1.5
  },
  sectionContainer: {
    marginBottom: 15
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a365d'
  },
  priorityBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  highPriority: {
    backgroundColor: '#fee2e2'
  },
  mediumPriority: {
    backgroundColor: '#fef3c7'
  },
  lowPriority: {
    backgroundColor: '#f0fdf4'
  },
  priorityText: {
    fontSize: 9,
    fontWeight: 'bold'
  },
  highPriorityText: {
    color: '#991b1b'
  },
  mediumPriorityText: {
    color: '#92400e'
  },
  lowPriorityText: {
    color: '#166534'
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
  promptQuestion: {
    fontSize: 11,
    color: '#2d3748',
    lineHeight: 1.5,
    marginBottom: 8
  },
  contextContainer: {
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    marginBottom: 6
  },
  contextLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 3
  },
  contextText: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 1.4
  },
  citationText: {
    fontSize: 9,
    color: '#718096',
    fontStyle: 'italic'
  },
  approachContainer: {
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 4
  },
  approachLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 3
  },
  approachText: {
    fontSize: 10,
    color: '#1e40af',
    lineHeight: 1.4
  },
  nextStepsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fefce8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde047'
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 10
  },
  nextStepsItem: {
    flexDirection: 'row',
    marginBottom: 8
  },
  nextStepsNumber: {
    width: 20,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#a16207'
  },
  nextStepsText: {
    flex: 1,
    fontSize: 11,
    color: '#713f12',
    lineHeight: 1.4
  },
  footer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  footerText: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 1.4
  }
})

interface DiscussionPageProps {
  discussionAreas: DiscussionArea[]
}

export function DiscussionPage({ discussionAreas }: DiscussionPageProps) {
  // Group discussion areas by section
  const groupedBySection = discussionAreas.reduce(
    (acc, area) => {
      if (!acc[area.section]) {
        acc[area.section] = []
      }
      acc[area.section].push(area)
      return acc
    },
    {} as Record<AssessmentSection, DiscussionArea[]>
  )

  // Assign priority based on position
  const getPriority = (
    index: number,
    total: number
  ): { level: string; style: typeof styles.highPriority; textStyle: typeof styles.highPriorityText } => {
    if (index === 0) return { level: 'High Priority', style: styles.highPriority, textStyle: styles.highPriorityText }
    if (index < total / 2) return { level: 'Medium Priority', style: styles.mediumPriority, textStyle: styles.mediumPriorityText }
    return { level: 'Optional', style: styles.lowPriority, textStyle: styles.lowPriorityText }
  }

  const sectionOrder: AssessmentSection[] = ['deen', 'dunya', 'aila', 'nafs']

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suggested Conversation Topics</Text>
      </View>

      {/* Introduction */}
      <View style={styles.introContainer}>
        <Text style={styles.introTitle}>How to Use These Prompts</Text>
        <Text style={styles.introText}>
          These conversation topics are designed to help you explore important areas of your
          relationship. Each prompt includes Islamic context and suggested approaches. We recommend
          setting aside dedicated time for these conversations in a comfortable, private setting.
          Remember: the goal is understanding, not agreement.
        </Text>
      </View>

      {/* Discussion Areas by Section */}
      {sectionOrder.map((section) => {
        const areas = groupedBySection[section]
        if (!areas || areas.length === 0) return null

        const sectionDef = ASSESSMENT_SECTIONS.find((s) => s.id === section)
        const totalPrompts = discussionAreas.length

        return (
          <View key={section} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {sectionDef?.name} - {sectionDef?.nameArabic}
              </Text>
            </View>

            {areas.map((area, index) => {
              const priority = getPriority(
                discussionAreas.indexOf(area),
                totalPrompts
              )

              return (
                <View key={index} style={styles.promptCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={styles.promptTopic}>{area.topic}</Text>
                    <View style={[styles.priorityBadge, priority.style]}>
                      <Text style={[styles.priorityText, priority.textStyle]}>
                        {priority.level}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.promptQuestion}>{area.prompt}</Text>

                  <View style={styles.contextContainer}>
                    <Text style={styles.contextLabel}>Islamic Context</Text>
                    <Text style={styles.contextText}>{area.islamicContext}</Text>
                    <Text style={styles.citationText}>Reference: {area.citationReference}</Text>
                  </View>

                  <View style={styles.approachContainer}>
                    <Text style={styles.approachLabel}>Suggested Approach</Text>
                    <Text style={styles.approachText}>
                      {section === 'deen' &&
                        'Share your personal journey with faith and listen without judgment to your partner\'s perspective. Discuss how you envision growing together spiritually.'}
                      {section === 'dunya' &&
                        'Be transparent about your financial situation and goals. Discuss practical matters like budgeting, savings, and financial responsibilities openly.'}
                      {section === 'aila' &&
                        'Talk about your ideal relationship with extended family. Discuss boundaries, holiday traditions, and how you\'ll navigate family dynamics together.'}
                      {section === 'nafs' &&
                        'Share your communication preferences and emotional needs. Discuss how you handle stress and conflict, and how you can support each other\'s growth.'}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )
      })}

      {/* Next Steps */}
      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>Next Steps</Text>
        <View style={styles.nextStepsItem}>
          <Text style={styles.nextStepsNumber}>1.</Text>
          <Text style={styles.nextStepsText}>
            Schedule regular check-ins to discuss these topics in a calm, private setting.
          </Text>
        </View>
        <View style={styles.nextStepsItem}>
          <Text style={styles.nextStepsNumber}>2.</Text>
          <Text style={styles.nextStepsText}>
            Consider involving an Imam or Islamic counselor for guidance on complex topics.
          </Text>
        </View>
        <View style={styles.nextStepsItem}>
          <Text style={styles.nextStepsNumber}>3.</Text>
          <Text style={styles.nextStepsText}>
            Approach these conversations with an open heart and a desire to understand, not convince.
          </Text>
        </View>
        <View style={styles.nextStepsItem}>
          <Text style={styles.nextStepsNumber}>4.</Text>
          <Text style={styles.nextStepsText}>
            Take notes during your discussions and revisit areas that need more exploration.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          &quot;And among His Signs is that He created for you mates from among yourselves, that you may
          dwell in tranquility with them, and He has put love and mercy between your hearts.&quot; -
          Quran 30:21
        </Text>
      </View>
    </Page>
  )
}
