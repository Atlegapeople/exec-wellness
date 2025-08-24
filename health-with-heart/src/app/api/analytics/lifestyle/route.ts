import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface LifestyleRecord {
  lifestyle_id: string;
  report_id: string;
  employee_id: string;
  smoke: string;
  smoke_qty: string;
  smoke_years: string;
  alcohol_frequency: string;
  alcohol_frequency_score: number;
  alcohol_qty: string;
  alcohol_qty_score: number;
  alcohol_score: number;
  auditc_result: string;
  drugs: string;
  drugs_past: string;
  exercise: string;
  excercise_frequency: string;
  excercise_minutes: string;
  sitting_hours: string;
  eatout_frequency: string;
  fruitveg_frequency: string;
  sugar_consumption: string;
  diet_overall: string;
  sleep_hours: string;
  sleep_rating: string;
  sleep_rest: string;
  created_at: string;
}

interface LifestyleInsights {
  totalRecords: number;
  totalPatients: number;
  smokingAnalysis: {
    smokers: number;
    nonSmokers: number;
    smokingRate: number;
    smokingBreakdown: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  alcoholAnalysis: {
    breakdown: Array<{
      frequency: string;
      count: number;
      percentage: number;
    }>;
    riskBreakdown: Array<{
      risk: string;
      count: number;
      percentage: number;
    }>;
    averageScore: number;
  };
  exerciseAnalysis: {
    breakdown: Array<{
      frequency: string;
      count: number;
      percentage: number;
    }>;
    durationBreakdown: Array<{
      duration: string;
      count: number;
      percentage: number;
    }>;
  };
  dietAnalysis: {
    overallBreakdown: Array<{
      rating: string;
      count: number;
      percentage: number;
    }>;
    eatoutBreakdown: Array<{
      frequency: string;
      count: number;
      percentage: number;
    }>;
    fruitVegBreakdown: Array<{
      frequency: string;
      count: number;
      percentage: number;
    }>;
  };
  sleepAnalysis: {
    hoursBreakdown: Array<{
      hours: string;
      count: number;
      percentage: number;
    }>;
    qualityBreakdown: Array<{
      quality: string;
      count: number;
      percentage: number;
    }>;
  };
  timeSeriesData: Array<{
    month: string;
    recordCount: number;
    patientCount: number;
  }>;
  drugsAnalysis: {
    currentUsers: number;
    pastUsers: number;
    neverUsers: number;
    drugUsageRate: number;
  };
}

export async function GET() {
  try {
    // Get lifestyle data from database
    const lifestyleQuery = `
      SELECT 
        lifestyle_id,
        created_at,
        report_id,
        employee_id,
        smoke,
        smoke_qty,
        smoke_years,
        alcohol_frequency,
        alcohol_frequency_score,
        alcohol_qty,
        alcohol_qty_score,
        alcohol_score,
        auditc_result,
        drugs,
        drugs_past,
        exercise,
        excercise_frequency,
        excercise_minutes,
        sitting_hours,
        eatout_frequency,
        fruitveg_frequency,
        sugar_consumption,
        diet_overall,
        sleep_hours,
        sleep_rating,
        sleep_rest
      FROM prod.stg_ohms__lifestyle
      WHERE lifestyle_id IS NOT NULL
        AND employee_id IS NOT NULL
      ORDER BY created_at DESC
    `;
    
    const result = await query(lifestyleQuery);
    const records: LifestyleRecord[] = result.rows;

    console.log('Total lifestyle records found:', records.length);

    const insights = processLifestyleData(records);
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error processing lifestyle data:', error);
    return NextResponse.json(
      { error: 'Failed to load lifestyle insights' },
      { status: 500 }
    );
  }
}

function processLifestyleData(records: LifestyleRecord[]): LifestyleInsights {
  // Get unique records and patients
  const uniqueRecords = new Set(records.map(r => r.lifestyle_id));
  const uniquePatients = new Set(records.map(r => r.employee_id));
  const totalRecords = uniqueRecords.size;
  const totalPatients = uniquePatients.size;

  // Smoking analysis
  const smokingCounts = records.reduce((acc, record) => {
    const smokes = record.smoke === 'True' || record.smoke === 'true' || (record.smoke as any) === true;
    acc[smokes ? 'smokers' : 'nonSmokers']++;
    return acc;
  }, { smokers: 0, nonSmokers: 0 });

  const smokingRate = Math.round((smokingCounts.smokers / records.length) * 100);

  const smokingBreakdown = records
    .filter(r => r.smoke_qty)
    .reduce((acc, record) => {
      const qty = record.smoke_qty || 'Unknown';
      acc[qty] = (acc[qty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const smokingBreakdownArray = Object.entries(smokingBreakdown)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Alcohol analysis
  const alcoholFrequencyCounts = records.reduce((acc, record) => {
    const frequency = record.alcohol_frequency || 'Unknown';
    acc[frequency] = (acc[frequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alcoholBreakdown = Object.entries(alcoholFrequencyCounts)
    .map(([frequency, count]) => ({
      frequency,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const alcoholRiskCounts = records.reduce((acc, record) => {
    const risk = record.auditc_result || 'Unknown';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskBreakdown = Object.entries(alcoholRiskCounts)
    .map(([risk, count]) => ({
      risk,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const averageScore = records
    .filter(r => r.alcohol_score !== null && r.alcohol_score !== undefined)
    .reduce((sum, r) => sum + (r.alcohol_score || 0), 0) / 
    records.filter(r => r.alcohol_score !== null && r.alcohol_score !== undefined).length || 0;

  // Exercise analysis
  const exerciseFrequencyCounts = records.reduce((acc, record) => {
    const frequency = record.excercise_frequency || 'Unknown';
    acc[frequency] = (acc[frequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exerciseBreakdown = Object.entries(exerciseFrequencyCounts)
    .map(([frequency, count]) => ({
      frequency,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const exerciseDurationCounts = records.reduce((acc, record) => {
    const duration = record.excercise_minutes || 'Unknown';
    acc[duration] = (acc[duration] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const durationBreakdown = Object.entries(exerciseDurationCounts)
    .map(([duration, count]) => ({
      duration,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Diet analysis
  const dietOverallCounts = records.reduce((acc, record) => {
    const rating = record.diet_overall || 'Unknown';
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const overallBreakdown = Object.entries(dietOverallCounts)
    .map(([rating, count]) => ({
      rating,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const eatoutCounts = records.reduce((acc, record) => {
    const frequency = record.eatout_frequency || 'Unknown';
    acc[frequency] = (acc[frequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eatoutBreakdown = Object.entries(eatoutCounts)
    .map(([frequency, count]) => ({
      frequency,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const fruitVegCounts = records.reduce((acc, record) => {
    const frequency = record.fruitveg_frequency || 'Unknown';
    acc[frequency] = (acc[frequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fruitVegBreakdown = Object.entries(fruitVegCounts)
    .map(([frequency, count]) => ({
      frequency,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Sleep analysis
  const sleepHoursCounts = records.reduce((acc, record) => {
    const hours = record.sleep_hours || 'Unknown';
    acc[hours] = (acc[hours] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hoursBreakdown = Object.entries(sleepHoursCounts)
    .map(([hours, count]) => ({
      hours,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const sleepQualityCounts = records.reduce((acc, record) => {
    const quality = record.sleep_rating || 'Unknown';
    acc[quality] = (acc[quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const qualityBreakdown = Object.entries(sleepQualityCounts)
    .map(([quality, count]) => ({
      quality,
      count,
      percentage: Math.round((count / records.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Drugs analysis
  const drugsAnalysis = records.reduce((acc, record) => {
    if (record.drugs === 'Yes' || record.drugs === 'Rarely') {
      acc.currentUsers++;
    } else if (record.drugs_past === 'Yes') {
      acc.pastUsers++;
    } else {
      acc.neverUsers++;
    }
    return acc;
  }, { currentUsers: 0, pastUsers: 0, neverUsers: 0 });

  const drugUsageRate = Math.round((drugsAnalysis.currentUsers / records.length) * 100);

  // Time series data (records by month)
  const monthlyData = records
    .filter(r => r.created_at)
    .reduce((acc, record) => {
      const month = new Date(record.created_at).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { records: new Set(), patients: new Set() };
      }
      acc[month].records.add(record.lifestyle_id);
      acc[month].patients.add(record.employee_id);
      return acc;
    }, {} as Record<string, { records: Set<string>; patients: Set<string> }>);

  const timeSeriesData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      recordCount: data.records.size,
      patientCount: data.patients.size
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalRecords,
    totalPatients,
    smokingAnalysis: {
      smokers: smokingCounts.smokers,
      nonSmokers: smokingCounts.nonSmokers,
      smokingRate,
      smokingBreakdown: smokingBreakdownArray
    },
    alcoholAnalysis: {
      breakdown: alcoholBreakdown,
      riskBreakdown,
      averageScore: Math.round(averageScore * 10) / 10
    },
    exerciseAnalysis: {
      breakdown: exerciseBreakdown,
      durationBreakdown
    },
    dietAnalysis: {
      overallBreakdown,
      eatoutBreakdown,
      fruitVegBreakdown
    },
    sleepAnalysis: {
      hoursBreakdown,
      qualityBreakdown
    },
    timeSeriesData,
    drugsAnalysis: {
      ...drugsAnalysis,
      drugUsageRate
    }
  };
}