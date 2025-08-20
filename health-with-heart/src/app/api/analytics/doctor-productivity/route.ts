import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Doctor productivity metrics with actual doctor names
    const productivityQuery = `
      SELECT 
        COALESCE(CONCAT(u.name, ' ', u.surname), mr.doctor) as doctor,
        COUNT(*) as total_reports,
        COUNT(CASE WHEN mr.doctor_signoff IS NOT NULL THEN 1 END) as signed_reports,
        COUNT(CASE WHEN mr.doctor_signoff IS NULL THEN 1 END) as pending_reports,
        ROUND(AVG(EXTRACT(epoch FROM (mr.date_updated::timestamp - mr.date_created::timestamp))/86400), 1) as avg_turnaround_days,
        COUNT(CASE WHEN mr.type = 'Comprehensive Medical' THEN 1 END) as fit_outcomes,
        COUNT(CASE WHEN mr.type != 'Comprehensive Medical' THEN 1 END) as unfit_outcomes
      FROM medical_report mr
      LEFT JOIN users u ON u.id = mr.doctor
      WHERE mr.doctor IS NOT NULL 
      AND mr.doctor != ''
      AND mr.date_created >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY u.name, u.surname, mr.doctor
      ORDER BY total_reports DESC
      LIMIT 10
    `;

    const result = await query(productivityQuery);
    
    const productivity = result.rows.map((row: any) => ({
      doctor: row.doctor,
      total_reports: parseInt(row.total_reports),
      signed_reports: parseInt(row.signed_reports),
      pending_reports: parseInt(row.pending_reports),
      avg_turnaround_days: parseFloat(row.avg_turnaround_days) || 0,
      fit_outcomes: parseInt(row.fit_outcomes),
      unfit_outcomes: parseInt(row.unfit_outcomes),
      completion_rate: Math.round((parseInt(row.signed_reports) / parseInt(row.total_reports)) * 100)
    }));

    return NextResponse.json(productivity);

  } catch (error) {
    console.error('Error fetching doctor productivity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor productivity data' },
      { status: 500 }
    );
  }
}