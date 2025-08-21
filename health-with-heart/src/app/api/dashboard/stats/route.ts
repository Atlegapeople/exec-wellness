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

    // Total Executive Medical Reports (matching reports page)
    const completedReportsQuery = `
      SELECT COUNT(*) as count
      FROM medical_report mr
      WHERE mr.type = 'Executive Medical'
    `;

    // Pending Executive Medical Report signatures (reports assigned to doctor but not signed)
    const pendingSignaturesQuery = `
      SELECT COUNT(*) as count
      FROM medical_report 
      WHERE doctor_signoff IS NULL 
      AND doctor IS NOT NULL
      AND type = 'Executive Medical'
    `;

    // Active Doctors (doctors with reports assigned)
    const activeDoctorsQuery = `
      SELECT COUNT(DISTINCT doctor) as count
      FROM medical_report 
      WHERE type = 'Executive Medical'
      AND doctor IS NOT NULL
    `;

    // Execute all queries in parallel
    const [
      todayAppointments,
      completedReports, 
      pendingSignatures,
      activeDoctors
    ] = await Promise.all([
      query(todayAppointmentsQuery),
      query(completedReportsQuery),
      query(pendingSignaturesQuery),
      query(activeDoctorsQuery)
    ]);

    const stats: DashboardStats = {
      todayAppointments: parseInt(todayAppointments.rows[0].count),
      completedReports: parseInt(completedReports.rows[0].count),
      pendingSignatures: parseInt(pendingSignatures.rows[0].count),
      activeDoctors: parseInt(activeDoctors.rows[0].count)
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