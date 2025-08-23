import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const nurseId = searchParams.get('nurseId');

    if (!doctorId && !nurseId) {
      return NextResponse.json({ error: 'Either Doctor ID or Nurse ID is required' }, { status: 400 });
    }

    // Get staff member info (doctor or nurse)
    const staffId = doctorId || nurseId;
    const staffQuery = `
      SELECT id, name, surname, email, type, mobile
      FROM users 
      WHERE id = $1
    `;
    const staffResult = await query(staffQuery, [staffId]);
    const doctor = staffResult.rows[0]; // Keep same variable name for compatibility

    if (!doctor) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Initialize default empty data
    let stats = { total_reports: 0, total_employees: 0, signed_reports: 0, pending_reports: 0 };
    let teamResult = { rows: [] };
    let sitesResult = { rows: [] };
    let reportsOverTimeResult = { rows: [] };
    let repeatEmployeesResult = { rows: [] };
    let workplacesResult = { rows: [] };
    let recentReportsResult = { rows: [] };
    let allReportsResult = { rows: [] };

    // Check if medical_report table exists and has data
    try {
      const checkQuery = `SELECT COUNT(*) as count FROM medical_report LIMIT 1`;
      await query(checkQuery);
      
      // Get stats - using the exact queries from your requirements
      const statsQuery = doctorId ? `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(employee_id) as total_employees,
          COUNT(*) FILTER (WHERE doctor_signoff IS NOT NULL) as signed_reports,
          COUNT(*) FILTER (WHERE doctor_signoff IS NULL) as pending_reports
        FROM medical_report
        WHERE doctor = $1 AND type = 'Executive Medical'
      ` : `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(employee_id) as total_employees,
          COUNT(*) FILTER (WHERE nurse_signature IS NOT NULL) as signed_reports,
          COUNT(*) FILTER (WHERE nurse_signature IS NULL) as pending_reports
        FROM medical_report
        WHERE nurse = $1 AND type = 'Executive Medical'
      `;
      const statsResult = await query(statsQuery, [staffId]);
      stats = statsResult.rows[0] || stats;

      // Get team members (nurses for doctors, doctors for nurses)
      const teamQuery = doctorId ? `
        SELECT DISTINCT 
          u.id,
          u.name,
          u.surname,
          u.email
        FROM medical_report mr
        JOIN users u ON u.id = mr.nurse
        WHERE mr.doctor = $1 AND mr.nurse IS NOT NULL
        ORDER BY u.surname, u.name
      ` : `
        SELECT DISTINCT 
          u.id,
          u.name,
          u.surname,
          u.email
        FROM medical_report mr
        JOIN users u ON u.id = mr.doctor
        WHERE mr.nurse = $1 AND mr.doctor IS NOT NULL
        ORDER BY u.surname, u.name
      `;
      teamResult = await query(teamQuery, [staffId]);

      // Get sites
      const sitesQuery = doctorId ? `
        SELECT 
          s.name AS site_name,
          COUNT(DISTINCT mr.employee_id) AS employee_count
        FROM medical_report mr
        LEFT JOIN sites s ON s.id = mr.site
        WHERE mr.doctor = $1 AND mr.type = 'Executive Medical'
        GROUP BY s.name
        ORDER BY employee_count DESC
      ` : `
        SELECT 
          s.name AS site_name,
          COUNT(DISTINCT mr.employee_id) AS employee_count
        FROM medical_report mr
        LEFT JOIN sites s ON s.id = mr.site
        WHERE mr.nurse = $1 AND mr.type = 'Executive Medical'
        GROUP BY s.name
        ORDER BY employee_count DESC
      `;
      sitesResult = await query(sitesQuery, [staffId]);

      // Get reports over time (last 12 months)
      const reportsOverTimeQuery = doctorId ? `
        SELECT 
          DATE_TRUNC('month', date_created) AS month,
          COUNT(*) AS report_count
        FROM medical_report
        WHERE doctor = $1 
          AND type = 'Executive Medical'
          AND date_created >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month
      ` : `
        SELECT 
          DATE_TRUNC('month', date_created) AS month,
          COUNT(*) AS report_count
        FROM medical_report
        WHERE nurse = $1 
          AND type = 'Executive Medical'
          AND date_created >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month
      `;
      reportsOverTimeResult = await query(reportsOverTimeQuery, [staffId]);

      // Get repeat employees
      const repeatEmployeesQuery = doctorId ? `
        SELECT 
          employee_id,
          COUNT(*) AS report_count
        FROM medical_report
        WHERE doctor = $1 AND type = 'Executive Medical'
        GROUP BY employee_id
        HAVING COUNT(*) > 1
        ORDER BY report_count DESC
        LIMIT 10
      ` : `
        SELECT 
          employee_id,
          COUNT(*) AS report_count
        FROM medical_report
        WHERE nurse = $1 AND type = 'Executive Medical'
        GROUP BY employee_id
        HAVING COUNT(*) > 1
        ORDER BY report_count DESC
        LIMIT 10
      `;
      repeatEmployeesResult = await query(repeatEmployeesQuery, [staffId]);

      // Get top workplaces
      const workplacesQuery = doctorId ? `
        SELECT 
          workplace,
          COUNT(DISTINCT employee_id) AS employee_count
        FROM medical_report
        WHERE doctor = $1 AND type = 'Executive Medical'
        GROUP BY workplace
        ORDER BY employee_count DESC
        LIMIT 10
      ` : `
        SELECT 
          workplace,
          COUNT(DISTINCT employee_id) AS employee_count
        FROM medical_report
        WHERE nurse = $1 AND type = 'Executive Medical'
        GROUP BY workplace
        ORDER BY employee_count DESC
        LIMIT 10
      `;
      workplacesResult = await query(workplacesQuery, [staffId]);

      // Get all reports for this staff member - similar to reports page
      const allReportsQuery = doctorId ? `
        SELECT 
          mr.id,
          mr.date_created,
          mr.date_updated,
          mr.employee_id,
          mr.type,
          mr.sub_type,
          mr.doctor,
          mr.doctor_signoff,
          mr.doctor_signature,
          mr.nurse,
          mr.nurse_signature,
          mr.report_work_status,
          mr.notes_text,
          mr.recommendation_text,
          mr.employee_work_email,
          mr.employee_personal_email,
          mr.manager_email,
          mr.doctor_email,
          mr.workplace,
          mr.line_manager,
          mr.line_manager2,
          e.name as employee_name,
          e.surname as employee_surname,
          d.name as doctor_name,
          d.surname as doctor_surname,
          n.name as nurse_name,
          n.surname as nurse_surname,
          mr.workplace as workplace_name
        FROM medical_report mr
        LEFT JOIN employee e ON e.id = mr.employee_id
        LEFT JOIN users d ON d.id = mr.doctor
        LEFT JOIN users n ON n.id = mr.nurse
        WHERE mr.doctor = $1 
          AND mr.type = 'Executive Medical'
        ORDER BY mr.date_created DESC
      ` : `
        SELECT 
          mr.id,
          mr.date_created,
          mr.date_updated,
          mr.employee_id,
          mr.type,
          mr.sub_type,
          mr.doctor,
          mr.doctor_signoff,
          mr.doctor_signature,
          mr.nurse,
          mr.nurse_signature,
          mr.report_work_status,
          mr.notes_text,
          mr.recommendation_text,
          mr.employee_work_email,
          mr.employee_personal_email,
          mr.manager_email,
          mr.doctor_email,
          mr.workplace,
          mr.line_manager,
          mr.line_manager2,
          e.name as employee_name,
          e.surname as employee_surname,
          d.name as doctor_name,
          d.surname as doctor_surname,
          n.name as nurse_name,
          n.surname as nurse_surname,
          mr.workplace as workplace_name
        FROM medical_report mr
        LEFT JOIN employee e ON e.id = mr.employee_id
        LEFT JOIN users d ON d.id = mr.doctor
        LEFT JOIN users n ON n.id = mr.nurse
        WHERE mr.nurse = $1 
          AND mr.type = 'Executive Medical'
        ORDER BY mr.date_created DESC
      `;
      allReportsResult = await query(allReportsQuery, [staffId]);
      
      // Get recent reports (limit 5 for the recent reports section)
      const recentReportsQuery = doctorId ? `
        SELECT 
          mr.id,
          mr.employee_id,
          mr.date_created,
          mr.doctor_signoff,
          e.name as employee_name,
          e.surname as employee_surname
        FROM medical_report mr
        LEFT JOIN employee e ON e.id = mr.employee_id
        WHERE mr.doctor = $1 
          AND mr.type = 'Executive Medical'
        ORDER BY mr.date_created DESC
        LIMIT 5
      ` : `
        SELECT 
          mr.id,
          mr.employee_id,
          mr.date_created,
          mr.nurse_signature as doctor_signoff,
          e.name as employee_name,
          e.surname as employee_surname
        FROM medical_report mr
        LEFT JOIN employee e ON e.id = mr.employee_id
        WHERE mr.nurse = $1 
          AND mr.type = 'Executive Medical'
        ORDER BY mr.date_created DESC
        LIMIT 5
      `;
      recentReportsResult = await query(recentReportsQuery, [staffId]);
      
    } catch (error) {
      console.log('Error fetching medical report data, using defaults:', error);
    }

    return NextResponse.json({
      doctor,
      stats: {
        totalReports: parseInt(stats.total_reports) || 0,
        totalEmployees: parseInt(stats.total_employees) || 0,
        signedReports: parseInt(stats.signed_reports) || 0,
        pendingReports: parseInt(stats.pending_reports) || 0,
        signoffRate: stats.total_reports > 0 ? Math.round((stats.signed_reports / stats.total_reports) * 100) : 0
      },
      team: teamResult.rows,
      sites: sitesResult.rows,
      reportsOverTime: reportsOverTimeResult.rows,
      repeatEmployees: repeatEmployeesResult.rows,
      topWorkplaces: workplacesResult.rows,
      recentReports: recentReportsResult.rows,
      allReports: (allReportsResult?.rows || [])
    });

  } catch (error) {
    console.error('My Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}