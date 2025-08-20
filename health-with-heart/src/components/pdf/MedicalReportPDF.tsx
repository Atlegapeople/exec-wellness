import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c5aa0',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    fontSize: 9,
  },
  value: {
    width: '60%',
    fontSize: 9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 4,
  },
  metadataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metadataItem: {
    fontSize: 9,
  },
  riskSection: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  highRisk: {
    color: '#d63384',
    fontWeight: 'bold',
  },
  normalResult: {
    color: '#198754',
  },
  abnormalResult: {
    color: '#dc3545',
  },
  notes: {
    fontSize: 9,
    marginTop: 5,
    fontStyle: 'italic',
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e7f3ff',
    borderWidth: 1,
    borderColor: '#b8daff',
    borderStyle: 'solid',
    fontSize: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

interface MedicalReportPDFProps {
  reportData: any;
}

export const MedicalReportPDF: React.FC<MedicalReportPDFProps> = ({ reportData }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRiskColor = (value: string) => {
    if (value.toLowerCase().includes('at risk') || value.toLowerCase().includes('high')) {
      return '#dc3545';
    }
    if (value.toLowerCase().includes('low risk') || value.toLowerCase().includes('normal')) {
      return '#198754';
    }
    return '#000000';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>COMPREHENSIVE MEDICAL REPORT</Text>
          <Text style={styles.subtitle}>OHMS - Occupational Health Management System</Text>
          
          <View style={styles.metadataGrid}>
            <Text style={styles.metadataItem}>Report ID: {reportData.report_metadata.report_id}</Text>
            <Text style={styles.metadataItem}>Date: {formatDate(reportData.report_metadata.date)}</Text>
            <Text style={styles.metadataItem}>Type: {reportData.report_metadata.report_type}</Text>
          </View>
          
          <View style={styles.metadataGrid}>
            <Text style={styles.metadataItem}>Doctor: {reportData.report_metadata.doctor}</Text>
            <Text style={styles.metadataItem}>Nurse: {reportData.report_metadata.nurse}</Text>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{reportData.personal_details.first_name} {reportData.personal_details.last_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Gender:</Text>
                <Text style={styles.value}>{reportData.personal_details.gender}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Age:</Text>
                <Text style={styles.value}>{reportData.personal_details.age} years</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>ID Number:</Text>
                <Text style={styles.value}>{reportData.personal_details.id_number}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Height:</Text>
                <Text style={styles.value}>{reportData.personal_details.height_cm} cm</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Weight:</Text>
                <Text style={styles.value}>{reportData.personal_details.weight_kg} kg</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>BMI:</Text>
                <Text style={styles.value}>{reportData.personal_details.bmi} ({reportData.personal_details.bmi_status})</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Blood Pressure:</Text>
                <Text style={styles.value}>{reportData.personal_details.blood_pressure} mmHg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>High Blood Pressure:</Text>
                <Text style={styles.value}>{reportData.medical_history.high_blood_pressure}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Diabetes:</Text>
                <Text style={styles.value}>{reportData.medical_history.diabetes}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>High Cholesterol:</Text>
                <Text style={styles.value}>{reportData.medical_history.high_cholesterol}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Asthma:</Text>
                <Text style={styles.value}>{reportData.medical_history.asthma}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Thyroid Disease:</Text>
                <Text style={styles.value}>{reportData.medical_history.thyroid_disease}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>HIV Test:</Text>
                <Text style={styles.value}>{reportData.medical_history.hiv_test}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Anxiety/Depression:</Text>
                <Text style={styles.value}>{reportData.medical_history.anxiety_or_depression}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Surgical History:</Text>
                <Text style={styles.value}>{reportData.medical_history.surgical_history}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>TB History:</Text>
                <Text style={styles.value}>{reportData.medical_history.pulmonary_tb_history}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Family Cancer:</Text>
                <Text style={styles.value}>{reportData.medical_history.cancer_in_family}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cardiovascular Risk Assessment */}
        <View style={[styles.section, styles.riskSection]}>
          <Text style={styles.sectionTitle}>Cardiovascular & Stroke Risk Assessment</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Age & Gender Risk:</Text>
                <Text style={[styles.value, { color: getRiskColor(reportData.cardiovascular_stroke_risk.age_and_gender) }]}>
                  {reportData.cardiovascular_stroke_risk.age_and_gender}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Blood Pressure:</Text>
                <Text style={[styles.value, { color: getRiskColor(reportData.cardiovascular_stroke_risk.blood_pressure) }]}>
                  {reportData.cardiovascular_stroke_risk.blood_pressure}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Diabetes Risk:</Text>
                <Text style={[styles.value, { color: getRiskColor(reportData.cardiovascular_stroke_risk.diabetes) }]}>
                  {reportData.cardiovascular_stroke_risk.diabetes}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Obesity Risk:</Text>
                <Text style={[styles.value, { color: getRiskColor(reportData.cardiovascular_stroke_risk.obesity) }]}>
                  {reportData.cardiovascular_stroke_risk.obesity}
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Smoking Risk:</Text>
                <Text style={[styles.value, { color: getRiskColor(reportData.cardiovascular_stroke_risk.smoking) }]}>
                  {reportData.cardiovascular_stroke_risk.smoking}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Exercise Level:</Text>
                <Text style={styles.value}>{reportData.cardiovascular_stroke_risk.exercise}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Stress Level:</Text>
                <Text style={styles.value}>{reportData.cardiovascular_stroke_risk.stress_level}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Family History:</Text>
                <Text style={[styles.value, { color: getRiskColor(reportData.cardiovascular_stroke_risk.cardiac_history_in_family) }]}>
                  {reportData.cardiovascular_stroke_risk.cardiac_history_in_family}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lab Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Laboratory Tests</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Full Blood Count:</Text>
                <Text style={styles.value}>{reportData.lab_tests.full_blood_count_esr}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Kidney Function:</Text>
                <Text style={styles.value}>{reportData.lab_tests.kidney_function}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Liver Enzymes:</Text>
                <Text style={styles.value}>{reportData.lab_tests.liver_enzymes}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total Cholesterol:</Text>
                <Text style={styles.value}>{reportData.lab_tests.total_cholesterol}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fasting Sugar:</Text>
                <Text style={styles.value}>{reportData.lab_tests.fasting_sugar}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Vitamin D:</Text>
                <Text style={styles.value}>{reportData.lab_tests.vitamin_d}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>TSH:</Text>
                <Text style={styles.value}>{reportData.lab_tests.thyroid_stimulating_hormone}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>PSA/Pap:</Text>
                <Text style={styles.value}>{reportData.lab_tests.psa_pap}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>HIV Test:</Text>
                <Text style={styles.value}>{reportData.lab_tests.hiv_test}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>HS-CRP:</Text>
                <Text style={styles.value}>{reportData.lab_tests.hs_crp}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clinical Examination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Examination</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>General Assessment:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.general_assessment}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cardiovascular:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.cardiovascular}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Respiratory:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.respiratory}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Neurological:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.neurological}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Head & Neck:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.head_neck_thyroid}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Gastrointestinal:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.gastrointestinal}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Musculoskeletal:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.musculoskeletal}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Skin:</Text>
                <Text style={styles.value}>{reportData.clinical_examination.skin}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mental Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mental Health Assessment</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Stress Level:</Text>
                <Text style={styles.value}>{reportData.mental_health.stress_level}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Anxiety Level:</Text>
                <Text style={styles.value}>{reportData.mental_health.anxiety_level}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Energy Level:</Text>
                <Text style={styles.value}>{reportData.mental_health.energy_level}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Sleep Rating:</Text>
                <Text style={styles.value}>{reportData.mental_health.sleep_rating}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Work Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Status & Recommendations</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Work Status:</Text>
            <Text style={[styles.value, { fontWeight: 'bold', fontSize: 11 }]}>{reportData.work_status.status}</Text>
          </View>
          {reportData.notes_and_recommendations.general_notes && (
            <View style={styles.notes}>
              <Text style={styles.label}>General Notes:</Text>
              <Text>{reportData.notes_and_recommendations.general_notes}</Text>
            </View>
          )}
          {reportData.notes_and_recommendations.recommendations && (
            <View style={styles.notes}>
              <Text style={styles.label}>Recommendations:</Text>
              <Text>{reportData.notes_and_recommendations.recommendations}</Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>{reportData.disclaimer}</Text>
        </View>
      </Page>
    </Document>
  );
};