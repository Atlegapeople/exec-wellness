import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define the comprehensive styles matching the specification
const styles = StyleSheet.create({
  page: {
    size: 'A4',
    orientation: 'portrait',
    paddingTop: 18,
    paddingRight: 16,
    paddingBottom: 18,
    paddingLeft: 16,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1E1E1E',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },

  headerLeft: {
    fontSize: 9,
    color: '#666666',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F8A88',
    textAlign: 'center',
    flex: 1,
  },

  headerRight: {
    fontSize: 10,
    color: '#666666',
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 16,
    right: 16,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#E6E8EB',
    borderTopStyle: 'solid',
    paddingTop: 8,
  },

  // Section styles
  section: {
    marginBottom: 15,
    orphans: 2,
    widows: 2,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F8A88',
    marginBottom: 8,
    textTransform: 'uppercase',
    flexWrap: 'nowrap',
  },

  subsectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 6,
    flexWrap: 'nowrap',
  },

  // Overview note styles
  overviewNote: {
    backgroundColor: '#F8FAFB',
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#1F8A88',
    borderLeftStyle: 'solid',
    marginBottom: 15,
  },

  overviewText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1E1E1E',
    wordWrap: 'break-word',
    hyphenationFactor: 0,
  },

  // Risk summary styles
  riskContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  riskTable: {
    flex: 2,
    marginRight: 15,
  },

  riskChart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderStyle: 'solid',
    minHeight: 120,
  },

  // Table styles
  table: {
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderStyle: 'solid',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1F8A88',
    padding: 6,
  },

  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    flexWrap: 'nowrap',
  },

  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
    borderBottomStyle: 'solid',
    minHeight: 28,
  },

  tableRowAlt: {
    backgroundColor: '#F8FAFB',
  },

  tableCell: {
    flex: 1,
    fontSize: 10,
    justifyContent: 'center',
    wordWrap: 'break-word',
    hyphenationFactor: 0,
  },

  // Badge styles
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 60,
    maxWidth: 100,
    flexWrap: 'nowrap',
  },

  badgeSuccess: {
    backgroundColor: '#1F9D55',
    color: '#FFFFFF',
  },

  badgeWarning: {
    backgroundColor: '#F0B429',
    color: '#FFFFFF',
  },

  badgeDanger: {
    backgroundColor: '#E02424',
    color: '#FFFFFF',
  },

  badgeMuted: {
    backgroundColor: '#666666',
    color: '#FFFFFF',
  },

  // Three column layout for core panel
  threeColumnContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    orphans: 2,
    widows: 2,
  },

  column: {
    flex: 1,
    marginRight: 10,
  },

  columnLast: {
    marginRight: 0,
  },

  card: {
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
    breakInside: 'avoid',
  },

  cardHeader: {
    backgroundColor: '#1F8A88',
    padding: 8,
  },

  cardHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flexWrap: 'nowrap',
  },

  cardBody: {
    padding: 8,
  },

  // Field row styles
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
    minHeight: 16,
  },

  fieldLabel: {
    fontSize: 9,
    color: '#666666',
    width: '45%',
    flexWrap: 'nowrap',
  },

  fieldValue: {
    fontSize: 9,
    color: '#1E1E1E',
    width: '55%',
    wordWrap: 'break-word',
    hyphenationFactor: 0,
  },

  // Notes styles
  notesContainer: {
    backgroundColor: '#F8FAFB',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    borderStyle: 'solid',
    marginBottom: 15,
  },

  noteItem: {
    marginBottom: 8,
    fontSize: 10,
    lineHeight: 1.4,
    wordWrap: 'break-word',
    hyphenationFactor: 0,
  },

  // Disclaimer styles
  disclaimer: {
    backgroundColor: '#E7F3FF',
    padding: 12,
    borderWidth: 1,
    borderColor: '#B8DAFF',
    borderStyle: 'solid',
    marginBottom: 15,
  },

  disclaimerText: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#1E1E1E',
    textAlign: 'justify',
    wordWrap: 'break-word',
    hyphenationFactor: 0,
  },

  // Quote banner styles
  quoteBanner: {
    backgroundColor: '#1F8A88',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
    wordWrap: 'break-word',
    hyphenationFactor: 0,
  },

  quoteAuthor: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Pie chart styles
  pieChart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    marginBottom: 10,
  },

  pieLegend: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  legendColor: {
    width: 8,
    height: 8,
    marginRight: 5,
  },

  legendText: {
    fontSize: 8,
    color: '#1E1E1E',
  },
});

interface ExecutiveMedicalReportPDFProps {
  reportData: Record<string, unknown>;
}

export const ExecutiveMedicalReportPDF: React.FC<
  ExecutiveMedicalReportPDFProps
> = ({ reportData }) => {
  // Data normalization functions
  const normalizeRiskStatus = (value: string): string => {
    if (!value) return 'Low Risk';
    const lower = value.toLowerCase();
    if (
      lower.includes('no risk') ||
      lower.includes('normal') ||
      lower.includes('negative')
    )
      return 'No Risk';
    if (lower.includes('low risk') || lower.includes('low')) return 'Low Risk';
    if (lower.includes('medium') || lower.includes('moderate')) return 'Medium';
    if (
      lower.includes('at risk') ||
      lower.includes('high') ||
      lower.includes('abnormal')
    )
      return 'At Risk';
    return 'Low Risk';
  };

  const normalizeExamStatus = (value: string): string => {
    if (!value || value === 'Not Done' || value === 'Unknown')
      return 'Not Done';
    const lower = value.toLowerCase();
    if (lower.includes('normal') || lower.includes('negative')) return 'Normal';
    if (lower.includes('out of range') && lower.includes('acceptable'))
      return 'Out of Range, Acceptable';
    if (lower.includes('abnormal') || lower.includes('positive'))
      return 'Abnormal';
    return value;
  };

  const normalizeMentalHealth = (value: string): string => {
    if (!value) return 'MEDIUM';
    const lower = value.toLowerCase();
    if (lower.includes('low')) return 'LOW';
    if (lower.includes('high')) return 'HIGH';
    return 'MEDIUM';
  };

  // Calculate BMI and WHtR
  const calculateBMI = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(2));
  };

  const calculateWHtR = (waist: number, height: number): number => {
    if (!waist || !height) return 0;
    return parseFloat(((waist / height) * 100).toFixed(2));
  };

  const getBMIStatus = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getWHtRStatus = (whtr: number): string => {
    if (whtr < 50) return 'Low Risk';
    if (whtr < 60) return 'Elevated Risk';
    return 'High Risk';
  };

  // Normalize the report data
  const personalDetails = reportData.personal_details || {};
  const calculatedBMI = calculateBMI(
    (personalDetails as any)?.weight_kg,
    (personalDetails as any)?.height_cm
  );
  const calculatedWHtR = calculateWHtR(
    (personalDetails as any)?.waist,
    (personalDetails as any)?.height_cm
  );

  const normalizedData = {
    ...reportData,
    personal_details: {
      ...(personalDetails as Record<string, unknown>),
      bmi: calculatedBMI,
      bmi_status: getBMIStatus(calculatedBMI),
      whtr_percent: calculatedWHtR,
      whtr_status: getWHtRStatus(calculatedWHtR),
    },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBadgeStyle = (value: string) => {
    const normalizedValue = normalizeExamStatus(value);
    const lowerValue = normalizedValue.toLowerCase();

    // Success badge
    if (
      lowerValue.includes('normal') ||
      lowerValue.includes('no risk') ||
      lowerValue.includes('low risk') ||
      lowerValue.includes('negative') ||
      lowerValue.includes('excellent') ||
      lowerValue.includes('good') ||
      lowerValue.includes('very good')
    ) {
      return styles.badgeSuccess;
    }

    // Warning badge
    if (
      lowerValue.includes('medium') ||
      lowerValue.includes('out of range') ||
      lowerValue.includes('fair') ||
      lowerValue.includes('not done') ||
      lowerValue.includes('elevated risk')
    ) {
      return styles.badgeWarning;
    }

    // Danger badge
    if (
      lowerValue.includes('at risk') ||
      lowerValue.includes('abnormal') ||
      lowerValue.includes('positive') ||
      lowerValue.includes('high risk') ||
      (lowerValue.includes('high') && !lowerValue.includes('high risk'))
    ) {
      return styles.badgeDanger;
    }

    return styles.badgeMuted;
  };

  const renderBadge = (value: string) => {
    if (!value || value === 'null' || value === 'undefined') return null;

    return (
      <View style={[styles.badge, getBadgeStyle(value)]}>
        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{value}</Text>
      </View>
    );
  };

  const renderFieldRow = (
    label: string,
    value: unknown,
    useBadge: boolean = false
  ) => {
    if (!value || value === 'null' || value === 'undefined' || value === '')
      return null;

    return (
      <View style={styles.fieldRow} key={label}>
        <Text style={styles.fieldLabel}>{label}:</Text>
        {useBadge ? (
          renderBadge(value.toString())
        ) : (
          <Text style={styles.fieldValue}>{value?.toString() || ''}</Text>
        )}
      </View>
    );
  };

  // Calculate risk summary data with normalized statuses - ALL cardiovascular risk factors
  const riskData = [
    {
      label: 'Age & Gender Risk',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.age_and_gender_risk || 'Low Risk'
      ),
    },
    {
      label: 'Blood Pressure',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.blood_pressure ||
          'Low Risk'
      ),
    },
    {
      label: 'Cholesterol',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.cholesterol ||
          'Low Risk'
      ),
    },
    {
      label: 'Diabetes Risk',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.diabetes ||
          'Low Risk'
      ),
    },
    {
      label: 'Obesity',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.obesity ||
          'Low Risk'
      ),
    },
    {
      label: 'Waist to Hip Ratio',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.waist_to_hip_ratio || 'Low Risk'
      ),
    },
    {
      label: 'Overall Diet',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.overall_diet ||
          'Low Risk'
      ),
    },
    {
      label: 'Exercise',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.exercise ||
          'Low Risk'
      ),
    },
    {
      label: 'Alcohol Consumption',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.alcohol_consumption || 'No Risk'
      ),
    },
    {
      label: 'Smoking Risk',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.smoking ||
          'No Risk'
      ),
    },
    {
      label: 'Stress Level',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk?.stress_level ||
          'Low Risk'
      ),
    },
    {
      label: 'Previous Cardiac Event',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.previous_cardiac_event || 'Low Risk'
      ),
    },
    {
      label: 'Cardiac History In Family',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.cardiac_history_in_family || 'Low Risk'
      ),
    },
    {
      label: 'Stroke History In Family',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.stroke_history_in_family || 'Low Risk'
      ),
    },
    {
      label: 'Reynolds Risk Score',
      status: normalizeRiskStatus(
        (normalizedData as any)?.cardiovascular_stroke_risk
          ?.reynolds_risk_score || 'Low Risk'
      ),
    },
  ];

  // Calculate risk distribution for pie chart
  const riskCounts = riskData.reduce(
    (acc, risk) => {
      acc[risk.status] = (acc[risk.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const renderPieChart = () => {
    const total = Object.values(riskCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const colors = {
      'No Risk': '#1F9D55',
      'Low Risk': '#1F9D55',
      Medium: '#F0B429',
      'At Risk': '#E02424',
    };

    // Calculate slices with proper percentages
    const slices = Object.entries(riskCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[status as keyof typeof colors] || '#666666',
    }));

    // Sort by count descending
    slices.sort((a, b) => b.count - a.count);

    return (
      <View style={styles.riskChart}>
        <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 10 }}>
          Risk Distribution
        </Text>

        {/* Simple representation for PDF - showing total with breakdown */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: slices[0]?.color || '#E6E8EB',
            marginBottom: 10,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderWidth: slices.length > 1 ? 2 : 0,
            borderColor: slices[1]?.color || 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 8,
              textAlign: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}
          >
            {total} Factors
          </Text>
          <Text
            style={{
              fontSize: 7,
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            Assessed
          </Text>
        </View>

        {/* Legend showing all categories with accurate counts */}
        <View style={styles.pieLegend}>
          {slices.map(({ status, count, percentage, color }) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color }]} />
              <Text style={styles.legendText}>
                {status}: {count} ({percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Gender-specific screening
  const getGenderSpecificScreening = () => {
    const gender = (normalizedData.personal_details as any)?.gender;
    const screening = (normalizedData as any)?.screening || {};

    if (gender === 'Female') {
      return [
        ['Colonoscopy', screening.colonoscopy],
        ['Mammogram', screening.mammogram || 'Not Required'],
        ['PAP Smear', screening.pap_smear || 'Not Required'],
      ].filter(([, value]) => value && value !== 'Not Required');
    } else {
      return [
        ['Colonoscopy', screening.colonoscopy],
        ['Prostate Screening', screening.prostate_screening],
      ].filter(([, value]) => value && value !== 'Not Required');
    }
  };

  const hasContent = (obj: Record<string, unknown>): boolean => {
    return (
      obj &&
      Object.values(obj).some(
        value =>
          value !== null &&
          value !== undefined &&
          value !== '' &&
          value !== 'Unknown'
      )
    );
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLeft}>Health with Heart logo</Text>
          <Text style={styles.headerTitle}>Executive Medical Report</Text>
          <Text style={styles.headerRight}>
            {formatDate((normalizedData as any)?.report_heading?.date_updated)}
          </Text>
        </View>

        {/* Masthead with Patient Details */}
        <View style={styles.section}>
          <View style={styles.overviewNote}>
            <Text style={styles.overviewText}>
              <Text style={{ fontWeight: 'bold' }}>Patient: </Text>
              {(normalizedData.personal_details as any)?.name}{' '}
              {(normalizedData.personal_details as any)?.surname} •
              <Text style={{ fontWeight: 'bold' }}> Age: </Text>
              {(normalizedData.personal_details as any)?.age} •
              <Text style={{ fontWeight: 'bold' }}> Gender: </Text>
              {(normalizedData.personal_details as any)?.gender} •
              <Text style={{ fontWeight: 'bold' }}> ID: </Text>
              {(normalizedData.personal_details as any)?.id_or_passport}
            </Text>
            <Text style={[styles.overviewText, { marginTop: 8 }]}>
              <Text style={{ fontWeight: 'bold' }}>Doctor: </Text>
              {(normalizedData as any)?.report_heading?.doctor_name} •
              <Text style={{ fontWeight: 'bold' }}> Nurse: </Text>
              {(normalizedData as any)?.report_heading?.nurse_name}
            </Text>
          </View>
        </View>

        {/* Executive Summary */}
        {(normalizedData as any)?.overview?.notes_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
            <View style={styles.overviewNote}>
              <Text style={styles.overviewText}>
                {(normalizedData as any)?.overview?.notes_text}
              </Text>
            </View>
          </View>
        )}

        {/* Risk Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RISK SUMMARY</Text>
          <View style={styles.riskContainer}>
            <View style={styles.riskTable}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Risk Factor</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                </View>
                {riskData.map((risk, index) => (
                  <View
                    key={risk.label}
                    style={[
                      styles.tableRow,
                      ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
                    ]}
                  >
                    <Text style={styles.tableCell}>{risk.label}</Text>
                    <View
                      style={[styles.tableCell, { alignItems: 'flex-start' }]}
                    >
                      {renderBadge(risk.status)}
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {renderPieChart()}
          </View>
        </View>

        {/* Clinical Notes & Recommendations */}
        {(normalizedData as any)?.notes_recommendations
          ?.recommendation_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              CLINICAL NOTES & RECOMMENDATIONS
            </Text>
            <View style={styles.notesContainer}>
              <Text style={styles.noteItem}>
                {
                  (normalizedData as any)?.notes_recommendations
                    ?.recommendation_text
                }
              </Text>
            </View>
          </View>
        )}

        {/* Gender-Specific Health Notes */}
        {(normalizedData as any)?.mens_health?.recommendation_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MEN&apos;S HEALTH NOTES</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.noteItem}>
                {(normalizedData as any)?.mens_health?.recommendation_text}
              </Text>
            </View>
          </View>
        )}

        {(normalizedData as any)?.womens_health?.recommendation_text && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WOMEN&apos;S HEALTH NOTES</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.noteItem}>
                {(normalizedData as any)?.womens_health?.recommendation_text}
              </Text>
            </View>
          </View>
        )}

        {/* Medical History & Allergies */}
        {(hasContent((normalizedData as any)?.medical_history) ||
          hasContent((normalizedData as any)?.allergies)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MEDICAL HISTORY & ALLERGIES</Text>
            <View style={styles.threeColumnContainer}>
              {/* Medical History */}
              {hasContent((normalizedData as any)?.medical_history) && (
                <View style={styles.column}>
                  <Text style={styles.subsectionTitle}>Medical History</Text>
                  {renderFieldRow(
                    'High Blood Pressure',
                    (normalizedData as any)?.medical_history
                      ?.high_blood_pressure
                  )}
                  {renderFieldRow(
                    'Diabetes',
                    (normalizedData as any)?.medical_history?.diabetes
                  )}
                  {renderFieldRow(
                    'High Cholesterol',
                    (normalizedData as any)?.medical_history?.high_cholesterol
                  )}
                  {renderFieldRow(
                    'Asthma',
                    (normalizedData as any)?.medical_history?.asthma
                  )}
                  {renderFieldRow(
                    'Thyroid Disease',
                    (normalizedData as any)?.medical_history?.thyroid_disease
                  )}
                  {renderFieldRow(
                    'TB History',
                    (normalizedData as any)?.medical_history
                      ?.pulmonary_tb_history
                  )}
                </View>
              )}

              {/* Family History & Mental Health */}
              <View style={styles.column}>
                {hasContent((normalizedData as any)?.medical_history) && (
                  <>
                    <Text style={styles.subsectionTitle}>Family History</Text>
                    {renderFieldRow(
                      'Cardiac Events',
                      (normalizedData as any)?.medical_history
                        ?.cardiac_event_in_family
                    )}
                    {renderFieldRow(
                      'Cancer',
                      (normalizedData as any)?.medical_history?.cancer_in_family
                    )}
                  </>
                )}

                {hasContent((normalizedData as any)?.mental_health) && (
                  <>
                    <Text style={[styles.subsectionTitle, { marginTop: 10 }]}>
                      Mental Health
                    </Text>
                    {renderFieldRow(
                      'Anxiety/Depression',
                      (normalizedData as any)?.medical_history
                        ?.anxiety_or_depression
                    )}
                    {renderFieldRow(
                      'Stress Level',
                      normalizeMentalHealth(
                        (normalizedData as any)?.mental_health?.stress_level
                      ),
                      true
                    )}
                  </>
                )}
              </View>

              {/* Allergies & Screening */}
              <View style={[styles.column, styles.columnLast]}>
                {hasContent((normalizedData as any)?.allergies) && (
                  <>
                    <Text style={styles.subsectionTitle}>Allergies</Text>
                    {renderFieldRow(
                      'Environmental',
                      (normalizedData as any)?.allergies?.environmental
                    )}
                    {renderFieldRow(
                      'Food',
                      (normalizedData as any)?.allergies?.food
                    )}
                    {renderFieldRow(
                      'Medication',
                      (normalizedData as any)?.allergies?.medication
                    )}
                  </>
                )}

                {hasContent((normalizedData as any)?.screening) && (
                  <>
                    <Text style={[styles.subsectionTitle, { marginTop: 10 }]}>
                      Screening
                    </Text>
                    {getGenderSpecificScreening().map(([label, value]) =>
                      renderFieldRow(label, value, true)
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Core Panel - Three Column Layout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REPORT CORE PANEL</Text>
          <View style={styles.threeColumnContainer}>
            {/* Personal Details Card */}
            <View style={styles.column}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Personal Details</Text>
                </View>
                <View style={styles.cardBody}>
                  {renderFieldRow(
                    'Height',
                    `${(normalizedData.personal_details as any)?.height_cm} cm`
                  )}
                  {renderFieldRow(
                    'Weight',
                    `${(normalizedData.personal_details as any)?.weight_kg} kg`
                  )}
                  {renderFieldRow(
                    'BMI',
                    normalizedData.personal_details.bmi?.toFixed(2)
                  )}
                  {renderFieldRow(
                    'BMI Status',
                    normalizedData.personal_details.bmi_status,
                    true
                  )}
                  {renderFieldRow(
                    'Blood Pressure',
                    (normalizedData.personal_details as any)?.blood_pressure
                  )}
                  {renderFieldRow(
                    'Waist',
                    `${(normalizedData.personal_details as any)?.waist} cm`
                  )}
                  {renderFieldRow(
                    'WHtR',
                    normalizedData.personal_details.whtr_percent
                  )}
                  {renderFieldRow(
                    'WHtR Status',
                    normalizedData.personal_details.whtr_status,
                    true
                  )}
                </View>
              </View>
            </View>

            {/* Lab Tests Card */}
            <View style={styles.column}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>Lab Tests</Text>
                </View>
                <View style={styles.cardBody}>
                  {renderFieldRow(
                    'Full Blood Count',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests
                        ?.full_blood_count_an_esr
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Kidney Function',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests?.kidney_function
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Liver Enzymes',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests?.liver_enzymes
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Total Cholesterol',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests?.total_cholesterol
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Fasting Glucose',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests?.fasting_glucose
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Vitamin D',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests?.vitamin_d
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'TSH',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests
                        ?.thyroid_stimulating_hormone
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'HIV',
                    normalizeExamStatus(
                      (normalizedData as any)?.lab_tests?.hiv
                    ),
                    true
                  )}
                </View>
              </View>
            </View>

            {/* Clinical Examination & Special Investigations Card */}
            <View style={[styles.column, styles.columnLast]}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>
                    Clinical Exam & Investigations
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  {renderFieldRow(
                    'General Assessment',
                    normalizeExamStatus(
                      (normalizedData as any)?.clinical_examinations
                        ?.general_assessment
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Cardiovascular',
                    normalizeExamStatus(
                      (normalizedData as any)?.clinical_examinations
                        ?.cardiovascular
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Respiratory',
                    normalizeExamStatus(
                      (normalizedData as any)?.clinical_examinations
                        ?.respiratory
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Neurological',
                    normalizeExamStatus(
                      (normalizedData as any)?.clinical_examinations
                        ?.neurological
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Resting ECG',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations
                        ?.resting_ecg
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Stress ECG',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations
                        ?.stress_ecg
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Lung Function',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations
                        ?.lung_function
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Urine Dipstix',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations
                        ?.urine_dipstix
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'NerviQ Cardiac',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations
                        ?.nerveiq_cardio
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'NerviQ CNS',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations
                        ?.nerveiq_cns
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'NerviQ Overall',
                    normalizeExamStatus(
                      (normalizedData as any)?.special_investigations?.nerveiq
                    ),
                    true
                  )}
                  {renderFieldRow(
                    'Predicted VO2 Max',
                    (normalizedData as any)?.special_investigations
                      ?.predicted_vo2_max,
                    true
                  )}
                  {renderFieldRow(
                    'Body Fat %',
                    (normalizedData as any)?.special_investigations
                      ?.body_fat_percentage,
                    true
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Important Information and Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {
              (normalizedData as any)?.important_information_disclaimer
                ?.disclaimer_text
            }
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>We care • We integrate • We empower</Text>
        </View>

        {/* Quote Banner */}
        <View style={styles.quoteBanner}>
          <Text style={styles.quoteText}>
            &quot;The groundwork for all happiness is good health.&quot;
          </Text>
          <Text style={styles.quoteAuthor}>— Leigh Hunt</Text>
        </View>
      </Page>
    </Document>
  );
};
