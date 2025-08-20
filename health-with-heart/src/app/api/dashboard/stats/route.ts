import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { DashboardStats } from '@/types';

export async function GET() {
  try {
    // Today's Executive Medical appointments
    const todayAppointmentsQuery = `
      SELECT COUNT(*) as count
      FROM appointments 
      WHERE DATE(start_datetime) = CURRENT_DATE
      AND type ILIKE '%Executive%'
    `;

    // Completed Executive Medical Reports this month (with doctor signoff)
    const completedReportsQuery = `
      SELECT COUNT(*) as count
      FROM medical_report 
      WHERE doctor_signoff IS NOT NULL 
      AND type = 'Executive Medical'
      AND DATE_TRUNC('month', date_updated) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Pending Executive Medical Report signatures (reports assigned to doctor but not signed)
    const pendingSignaturesQuery = `
      SELECT COUNT(*) as count
      FROM medical_report 
      WHERE doctor_signoff IS NULL 
      AND doctor IS NOT NULL
      AND type = 'Executive Medical'
    `;

    // High-risk patients requiring attention (cardiovascular risk indicators)
    const highRiskPatientsQuery = `
      SELECT COUNT(DISTINCT e.id) as count
      FROM employee e
      LEFT JOIN vitals_clinical_metrics v ON v.employee_id = e.id
      LEFT JOIN lab_tests l ON l.employee_id = e.id
      LEFT JOIN employee_medical_history emh ON emh.employee_id = e.id
      WHERE (
        -- High cardiovascular risk indicators
        v.blood_pressure_status ILIKE 'High'
        OR v.bmi_status ILIKE 'Obese'
        OR (l.total_cholesterol ~ '^[0-9]+(\.[0-9]+)?$' AND l.total_cholesterol::numeric > 5.0)
        OR (l.fasting_glucose ~ '^[0-9]+(\.[0-9]+)?$' AND l.fasting_glucose::numeric >= 7.0)
        OR emh.diabetes = TRUE
        OR emh.high_blood_pressure = TRUE
        OR emh.high_cholesterol = TRUE
        OR (DATE_PART('year', AGE(e.date_of_birth)) >= 45 AND e.gender ILIKE 'Male')
      )
      AND EXISTS (
        SELECT 1 FROM medical_report mr 
        WHERE mr.employee_id = e.id 
        AND mr.type = 'Executive Medical'
        AND mr.date_created >= CURRENT_DATE - INTERVAL '6 months'
      )
    `;

    // Execute all queries in parallel
    const [
      todayAppointments,
      completedReports, 
      pendingSignatures,
      highRiskPatients
    ] = await Promise.all([
      query(todayAppointmentsQuery),
      query(completedReportsQuery),
      query(pendingSignaturesQuery),
      query(highRiskPatientsQuery)
    ]);

    const stats: DashboardStats = {
      todayAppointments: parseInt(todayAppointments.rows[0].count),
      completedReports: parseInt(completedReports.rows[0].count),
      pendingSignatures: parseInt(pendingSignatures.rows[0].count),
      activeDoctors: parseInt(highRiskPatients.rows[0].count) // Changed to high-risk patients
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}