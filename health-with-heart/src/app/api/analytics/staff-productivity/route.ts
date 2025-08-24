import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // First, let's test a simple query to see if we can get ANY data
    console.log('Testing database connection...');
    
    const testResult = await query('SELECT COUNT(*) as count FROM medical_report');
    console.log('Total medical_report rows:', testResult.rows[0]);
    
    const testResult2 = await query("SELECT COUNT(*) as count FROM medical_report WHERE type = 'Executive Medical'");
    console.log('Executive Medical rows:', testResult2.rows[0]);
    
    const testResult3 = await query('SELECT COUNT(*) as count FROM users WHERE type = \'Doctor\'');
    console.log('Doctor users:', testResult3.rows[0]);
    
    const testResult4 = await query('SELECT COUNT(*) as count FROM users WHERE type = \'Nurse\'');
    console.log('Nurse users:', testResult4.rows[0]);
    
    const testResult5 = await query("SELECT COUNT(*) as count FROM medical_report WHERE type = 'Executive Medical' AND nurse IS NOT NULL");
    console.log('Executive Medical with nurse assigned:', testResult5.rows[0]);
    
    // Test just nurses
    const nurseTestResult = await query(`
      SELECT 
          u.name || ' ' || u.surname AS nurse_name,
          COUNT(*) AS total_reports,
          SUM(CASE WHEN mr.nurse_signature IS NOT NULL AND mr.nurse_signature <> '' THEN 1 ELSE 0 END) AS signed_reports,
          SUM(CASE WHEN mr.nurse_signature IS NULL OR mr.nurse_signature = '' THEN 1 ELSE 0 END) AS unsigned_reports,
          ROUND(
              100.0 * SUM(CASE WHEN mr.nurse_signature IS NOT NULL AND mr.nurse_signature <> '' THEN 1 ELSE 0 END) / COUNT(*),
              2
          ) AS signing_rate_pct
      FROM medical_report mr
      JOIN users u ON mr.nurse = u.id
      WHERE u.type = 'Nurse'
        AND mr.type = 'Executive Medical'
      GROUP BY nurse_name
      ORDER BY total_reports DESC
      LIMIT 5
    `);
    console.log('Nurse test query result:', nurseTestResult.rows);

    // Main staff productivity query
    const staffResult = await query(`
      SELECT 
          u.name || ' ' || u.surname AS staff_name,
          'Doctor' AS staff_role,
          COUNT(*) AS total_reports,
          SUM(CASE WHEN mr.doctor_signoff IS NOT NULL AND mr.doctor_signoff <> '' THEN 1 ELSE 0 END) AS signed_reports,
          SUM(CASE WHEN mr.doctor_signoff IS NULL OR mr.doctor_signoff = '' THEN 1 ELSE 0 END) AS unsigned_reports,
          ROUND(
              100.0 * SUM(CASE WHEN mr.doctor_signoff IS NOT NULL AND mr.doctor_signoff <> '' THEN 1 ELSE 0 END) / COUNT(*),
              2
          ) AS signing_rate_pct
      FROM medical_report mr
      JOIN users u ON mr.doctor = u.id
      WHERE u.type = 'Doctor'
        AND mr.type = 'Executive Medical'
      GROUP BY u.name || ' ' || u.surname
      
      UNION ALL
      
      SELECT 
          u.name || ' ' || u.surname AS staff_name,
          'Nurse' AS staff_role,
          COUNT(*) AS total_reports,
          SUM(CASE WHEN mr.nurse_signature IS NOT NULL AND mr.nurse_signature <> '' THEN 1 ELSE 0 END) AS signed_reports,
          SUM(CASE WHEN mr.nurse_signature IS NULL OR mr.nurse_signature = '' THEN 1 ELSE 0 END) AS unsigned_reports,
          ROUND(
              100.0 * SUM(CASE WHEN mr.nurse_signature IS NOT NULL AND mr.nurse_signature <> '' THEN 1 ELSE 0 END) / COUNT(*),
              2
          ) AS signing_rate_pct
      FROM medical_report mr
      JOIN users u ON mr.nurse = u.id
      WHERE u.type = 'Nurse'
        AND mr.type = 'Executive Medical'
      GROUP BY u.name || ' ' || u.surname
      
      ORDER BY total_reports DESC
    `);

    // Weekly unsigned reports trend
    const weeklyTrendResult = await query(`
      SELECT 
          DATE_TRUNC('week', mr.date_created) AS week_start,
          COUNT(*) AS unsigned_reports
      FROM medical_report mr
      JOIN users u 
          ON (mr.doctor = u.id OR mr.nurse = u.id)
      WHERE mr.type = 'Executive Medical'
        AND (
              (mr.doctor_signoff IS NULL OR mr.doctor_signoff = '')
           OR (mr.nurse_signature IS NULL OR mr.nurse_signature = '')
        )
      GROUP BY week_start
      ORDER BY week_start
    `);

    // Top staff with unsigned reports
    const topUnsignedResult = await query(`
      SELECT 
          u.name || ' ' || u.surname AS staff_name,
          COUNT(*) AS unsigned_reports
      FROM medical_report mr
      JOIN users u 
          ON (mr.doctor = u.id OR mr.nurse = u.id)
      WHERE mr.type = 'Executive Medical'
        AND (
              (mr.doctor_signoff IS NULL OR mr.doctor_signoff = '')
           OR (mr.nurse_signature IS NULL OR mr.nurse_signature = '')
        )
      GROUP BY u.name, u.surname
      ORDER BY unsigned_reports DESC
      LIMIT 10
    `);

    console.log('Staff Productivity Result:', staffResult.rows?.length || 0);
    console.log('Weekly Trend Result:', weeklyTrendResult.rows?.length || 0);
    console.log('Top Unsigned Result:', topUnsignedResult.rows?.length || 0);
    
    const response = NextResponse.json({
      staff: staffResult.rows || [],
      weeklyTrend: weeklyTrendResult.rows || [],
      topUnsigned: topUnsignedResult.rows || []
    });
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('Error fetching staff productivity:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch staff productivity data' },
      { status: 500 }
    );
    
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}