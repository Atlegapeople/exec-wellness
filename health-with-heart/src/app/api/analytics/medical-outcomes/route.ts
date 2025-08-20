import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Medical report type distribution (since report_work_status is NULL)
    const outcomesQuery = `
      SELECT 
        type as report_work_status,
        COUNT(*) as count,
        type as report_type
      FROM medical_report 
      WHERE type IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
    `;

    // Monthly report volume trends (real data)
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', date_created) as month,
        COUNT(*) as total_reports,
        COUNT(CASE WHEN type = 'Comprehensive Medical' THEN 1 END) as fit_count,
        COUNT(CASE WHEN type != 'Comprehensive Medical' THEN 1 END) as unfit_count,
        ROUND(COUNT(CASE WHEN type = 'Comprehensive Medical' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as fit_percentage
      FROM medical_report 
      WHERE date_created >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date_created)
      ORDER BY month DESC
      LIMIT 12
    `;

    // Age group analysis based on employees with medical reports
    const ageGroupQuery = `
      SELECT 
        age_group,
        COUNT(*) as total_reports,
        COUNT(CASE WHEN type = 'Comprehensive Medical' THEN 1 END) as fit_count,
        ROUND(COUNT(CASE WHEN type = 'Comprehensive Medical' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as fit_percentage
      FROM (
        SELECT 
          mr.type,
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(e.date_of_birth)) < 25 THEN 'Under 25'
            WHEN EXTRACT(YEAR FROM AGE(e.date_of_birth)) BETWEEN 25 AND 34 THEN '25-34'
            WHEN EXTRACT(YEAR FROM AGE(e.date_of_birth)) BETWEEN 35 AND 44 THEN '35-44'
            WHEN EXTRACT(YEAR FROM AGE(e.date_of_birth)) BETWEEN 45 AND 54 THEN '45-54'
            ELSE '55+'
          END as age_group
        FROM medical_report mr
        INNER JOIN employee e ON mr.employee_id = e.id
        WHERE mr.date_created >= CURRENT_DATE - INTERVAL '12 months'
        AND e.date_of_birth IS NOT NULL
      ) subquery
      WHERE age_group IS NOT NULL
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Under 25' THEN 1
          WHEN '25-34' THEN 2
          WHEN '35-44' THEN 3
          WHEN '45-54' THEN 4
          WHEN '55+' THEN 5
        END
    `;

    console.log('Executing queries...');
    
    // Execute queries one by one to see which one fails
    let outcomes, trends, ageGroups;
    
    try {
      console.log('Executing outcomes query...');
      outcomes = await query(outcomesQuery);
      console.log('Outcomes query successful, rows:', outcomes.rows.length);
    } catch (error) {
      console.error('Outcomes query failed:', error);
      throw new Error(`Outcomes query failed: ${error.message}`);
    }
    
    try {
      console.log('Executing trends query...');
      trends = await query(trendsQuery);
      console.log('Trends query successful, rows:', trends.rows.length);
    } catch (error) {
      console.error('Trends query failed:', error);
      throw new Error(`Trends query failed: ${error.message}`);
    }
    
    try {
      console.log('Executing age groups query...');
      ageGroups = await query(ageGroupQuery);
      console.log('Age groups query successful, rows:', ageGroups.rows.length);
    } catch (error) {
      console.error('Age groups query failed:', error);
      throw new Error(`Age groups query failed: ${error.message}`);
    }

    return NextResponse.json({
      outcomes: outcomes.rows,
      trends: trends.rows.map((row: any) => ({
        month: row.month,
        total_reports: parseInt(row.total_reports),
        fit_count: parseInt(row.fit_count),
        unfit_count: parseInt(row.unfit_count),
        fit_percentage: parseFloat(row.fit_percentage)
      })),
      ageGroups: ageGroups.rows.map((row: any) => ({
        age_group: row.age_group,
        total_reports: parseInt(row.total_reports),
        fit_count: parseInt(row.fit_count),
        fit_percentage: parseFloat(row.fit_percentage)
      }))
    });

  } catch (error) {
    console.error('Error fetching medical outcomes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch medical outcomes data',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}