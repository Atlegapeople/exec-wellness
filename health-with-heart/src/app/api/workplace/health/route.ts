import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { WorkplaceHealth } from '@/types';

export async function GET() {
  try {
    const workplaceHealthQuery = `
      SELECT 
        COALESCE(org.name, 'Unknown Organization') as organisation_id,
        COALESCE(e.workplace, 'Unknown Department') as department,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(mr.id) as medical_reports,
        COUNT(CASE WHEN mr.type = 'Comprehensive Medical' THEN 1 END) as fit_for_work,
        COUNT(CASE WHEN mr.type != 'Comprehensive Medical' THEN 1 END) as not_fit
      FROM employee e
      LEFT JOIN organisation org ON org.id = e.organisation
      LEFT JOIN medical_report mr ON e.id = mr.employee_id 
        AND mr.date_created >= CURRENT_DATE - INTERVAL '6 months'
      WHERE (e.organisation IS NOT NULL AND e.organisation != '') 
         OR (e.workplace IS NOT NULL AND e.workplace != '')
      GROUP BY org.name, e.workplace
      HAVING COUNT(DISTINCT e.id) >= 5
      ORDER BY total_employees DESC
      LIMIT 15
    `;

    const result = await query(workplaceHealthQuery);
    
    const workplaceHealth: WorkplaceHealth[] = result.rows.map((row: any) => ({
      organisation_id: row.organisation_id || 'Unknown',
      department: row.department || 'Unknown Department',
      total_employees: parseInt(row.total_employees),
      medical_reports: parseInt(row.medical_reports),
      fit_for_work: parseInt(row.fit_for_work),
      not_fit: parseInt(row.not_fit)
    }));

    return NextResponse.json(workplaceHealth);

  } catch (error) {
    console.error('Error fetching workplace health data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workplace health data' },
      { status: 500 }
    );
  }
}