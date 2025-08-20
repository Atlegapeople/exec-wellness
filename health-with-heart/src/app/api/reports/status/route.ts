import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';
import { ReportStatusData } from '../../../../types';

export async function GET() {
  try {
    const reportStatusQuery = `
      SELECT 
        CASE 
          WHEN mr.doctor_signoff IS NOT NULL THEN 'Signed & Complete'
          WHEN mr.doctor IS NOT NULL AND mr.doctor_signoff IS NULL THEN 'Pending Signature'
          WHEN mr.doctor IS NULL THEN 'Unassigned'
          ELSE 'In Progress'
        END as report_type,
        COUNT(*) as total_reports,
        COUNT(CASE WHEN doctor_signoff IS NOT NULL THEN 1 END) as signed_reports,
        COUNT(CASE WHEN doctor_signoff IS NULL THEN 1 END) as pending_signature,
        ROUND(
          COUNT(*) * 100.0 / (SELECT COUNT(*) FROM medical_report WHERE type = 'Executive Medical' AND date_created >= CURRENT_DATE - INTERVAL '30 days'), 2
        ) as completion_percentage
      FROM medical_report mr
      WHERE mr.type = 'Executive Medical'
      AND date_created >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY 
        CASE 
          WHEN mr.doctor_signoff IS NOT NULL THEN 'Signed & Complete'
          WHEN mr.doctor IS NOT NULL AND mr.doctor_signoff IS NULL THEN 'Pending Signature'
          WHEN mr.doctor IS NULL THEN 'Unassigned'
          ELSE 'In Progress'
        END
      ORDER BY total_reports DESC
    `;

    const result = await query(reportStatusQuery);
    
    const reportStatus: ReportStatusData[] = result.rows.map((row: any) => ({
      report_type: row.report_type,
      total_reports: parseInt(row.total_reports),
      signed_reports: parseInt(row.signed_reports),
      pending_signature: parseInt(row.pending_signature),
      completion_percentage: parseFloat(row.completion_percentage)
    }));

    return NextResponse.json(reportStatus);

  } catch (error) {
    console.error('Error fetching report status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report status data' },
      { status: 500 }
    );
  }
}