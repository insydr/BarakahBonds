import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  logoContainer: {
    marginBottom: 40
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a365d',
    letterSpacing: 2
  },
  logoArabic: {
    fontSize: 24,
    color: '#059669',
    marginTop: 5,
    letterSpacing: 1
  },
  titleContainer: {
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 1.5
  },
  namesContainer: {
    marginBottom: 40,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8
  },
  and: {
    fontSize: 16,
    color: '#718096',
    marginVertical: 10
  },
  dateContainer: {
    marginBottom: 40
  },
  dateLabel: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 5
  },
  dateValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: 'bold'
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50
  },
  confidentialBox: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f7fafc'
  },
  confidentialTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#718096',
    marginBottom: 4
  },
  confidentialText: {
    fontSize: 9,
    color: '#718096',
    lineHeight: 1.4
  },
  preparedFor: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 10
  }
})

export interface CoverPageProps {
  partner1Name: string
  partner2Name: string
  assessmentDate: string
  anonymous: boolean
}

export function CoverPage({
  partner1Name,
  partner2Name,
  assessmentDate,
  anonymous
}: CoverPageProps) {
  const displayPartner1 = anonymous ? 'Partner A' : partner1Name
  const displayPartner2 = anonymous ? 'Partner B' : partner2Name

  return (
    <Page size="A4" style={styles.page}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Barakah</Text>
        <Text style={styles.logoArabic}>بركة</Text>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Couple&apos;s Assessment Report</Text>
        <Text style={styles.subtitle}>
          A comprehensive compatibility assessment based on
        </Text>
        <Text style={styles.subtitle}>Islamic principles and modern relationship science</Text>
      </View>

      {/* Partner Names */}
      <View style={styles.namesContainer}>
        <Text style={styles.partnerName}>{displayPartner1}</Text>
        <Text style={styles.and}>&</Text>
        <Text style={styles.partnerName}>{displayPartner2}</Text>
      </View>

      {/* Prepared For */}
      <Text style={styles.preparedFor}>Prepared for Imam/Mentor Review</Text>

      {/* Assessment Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Assessment Date</Text>
        <Text style={styles.dateValue}>{assessmentDate}</Text>
      </View>

      {/* Confidentiality Notice */}
      <View style={styles.footerContainer}>
        <View style={styles.confidentialBox}>
          <Text style={styles.confidentialTitle}>CONFIDENTIAL</Text>
          <Text style={styles.confidentialText}>
            This report contains private and sensitive information. It is intended solely
            for the individuals named above and authorized religious counselors or Imams.
            Unauthorized distribution or sharing of this document is prohibited.
          </Text>
        </View>
      </View>
    </Page>
  )
}
