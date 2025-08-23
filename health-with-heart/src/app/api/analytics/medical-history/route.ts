import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface MedicalHistoryRecord {
  section: string;
  report_id: string;
  medical_report_type: string;
  full_name: string;
  report_created_at_date: string;
  appointment_start_date: string;
  key: string;
  value: string;
}

interface MedicalHistoryInsights {
  totalReports: number;
  totalPatients: number;
  conditionBreakdown: Array<{
    condition: string;
    yesCount: number;
    noCount: number;
    totalResponses: number;
    prevalenceRate: number;
  }>;
  reportTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    month: string;
    reportCount: number;
    patientCount: number;
  }>;
  topConditions: Array<{
    condition: string;
    affectedPatients: number;
    prevalenceRate: number;
  }>;
  medicationAnalysis: {
    onMedication: number;
    notOnMedication: number;
    medicationRate: number;
  };
}

export async function GET() {
  try {
    // Get medical history data from database
    const medicalHistoryQuery = `
      SELECT 
        section,
        report_id,
        medical_report_type,
        full_name,
        report_created_at_date,
        appointment_start_date,
        key,
        value
      FROM prod.dim_ohms__exec_medical_medical_history
      WHERE section = 'MedicalHistory'
        AND key IS NOT NULL 
        AND value IS NOT NULL
      ORDER BY report_created_at_date DESC, full_name, key
    `;
    
    const result = await query(medicalHistoryQuery);
    const records: MedicalHistoryRecord[] = result.rows;

    console.log('Total medical history records found:', records.length);

    const insights = processMedicalHistoryData(records);
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error processing medical history data:', error);
    return NextResponse.json(
      { error: 'Failed to load medical history insights' },
      { status: 500 }
    );
  }
}

function processMedicalHistoryData(records: MedicalHistoryRecord[]): MedicalHistoryInsights {
  // Get unique reports and patients
  const uniqueReports = new Set(records.map(r => r.report_id));
  const uniquePatients = new Set(records.map(r => r.full_name));
  const totalReports = uniqueReports.size;
  const totalPatients = uniquePatients.size;

  // Process condition breakdown
  const conditionCounts = records.reduce((acc, record) => {
    const condition = record.key;
    const response = record.value.toLowerCase();
    
    if (!acc[condition]) {
      acc[condition] = { yes: 0, no: 0, total: 0 };
    }
    
    if (response === 'yes') {
      acc[condition].yes++;
    } else if (response === 'no') {
      acc[condition].no++;
    }
    acc[condition].total++;
    
    return acc;
  }, {} as Record<string, { yes: number; no: number; total: number }>);

  const conditionBreakdown = Object.entries(conditionCounts)
    .map(([condition, counts]) => ({
      condition,
      yesCount: counts.yes,
      noCount: counts.no,
      totalResponses: counts.total,
      prevalenceRate: Math.round((counts.yes / counts.total) * 100)
    }))
    .sort((a, b) => b.yesCount - a.yesCount);

  // Top conditions (highest prevalence)
  const topConditions = conditionBreakdown
    .filter(c => c.yesCount > 0)
    .slice(0, 10)
    .map(condition => ({
      condition: condition.condition,
      affectedPatients: condition.yesCount,
      prevalenceRate: condition.prevalenceRate
    }));

  // Report type breakdown
  const reportTypeCounts = records.reduce((acc, record) => {
    acc[record.medical_report_type] = (acc[record.medical_report_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportTypeBreakdown = Object.entries(reportTypeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Time series data (reports by month)
  const monthlyData = records
    .filter(r => r.report_created_at_date)
    .reduce((acc, record) => {
      const month = new Date(record.report_created_at_date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { reports: new Set(), patients: new Set() };
      }
      acc[month].reports.add(record.report_id);
      acc[month].patients.add(record.full_name);
      return acc;
    }, {} as Record<string, { reports: Set<string>; patients: Set<string> }>);

  const timeSeriesData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      reportCount: data.reports.size,
      patientCount: data.patients.size
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Medication analysis
  const medicationRecords = records.filter(r => 
    r.key === 'Is Currently on Medication' || r.key === 'Medication'
  );
  
  const medicationAnalysis = medicationRecords.reduce((acc, record) => {
    if (record.value.toLowerCase() === 'yes') {
      acc.onMedication++;
    } else if (record.value.toLowerCase() === 'no') {
      acc.notOnMedication++;
    }
    return acc;
  }, { onMedication: 0, notOnMedication: 0 });

  const totalMedicationResponses = medicationAnalysis.onMedication + medicationAnalysis.notOnMedication;
  const medicationRate = totalMedicationResponses > 0 
    ? Math.round((medicationAnalysis.onMedication / totalMedicationResponses) * 100)
    : 0;

  return {
    totalReports,
    totalPatients,
    conditionBreakdown,
    reportTypeBreakdown,
    timeSeriesData,
    topConditions,
    medicationAnalysis: {
      ...medicationAnalysis,
      medicationRate
    }
  };
}