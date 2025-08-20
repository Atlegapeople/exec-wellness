import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET() {
  try {
    // Monthly appointment volume with completion rates
    const volumeQuery = `
      SELECT 
        DATE_TRUNC('month', a.start_datetime) as month,
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT mr.id) as completed_reports,
        COUNT(DISTINCT CASE WHEN mr.doctor_signoff IS NOT NULL THEN mr.id END) as signed_reports,
        ROUND(COUNT(DISTINCT mr.id) * 100.0 / COUNT(DISTINCT a.id), 1) as completion_rate,
        ROUND(AVG(EXTRACT(epoch FROM (mr.date_updated::timestamp - mr.date_created::timestamp))/86400), 1) as avg_turnaround_days
      FROM appointments a
      LEFT JOIN medical_report mr ON a.report_id = mr.id
      WHERE a.start_datetime >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', a.start_datetime)
      ORDER BY month DESC
      LIMIT 12
    `;

    // Daily patterns for current month
    const dailyPatternQuery = `
      SELECT 
        EXTRACT(hour FROM start_datetime) as hour,
        COUNT(*) as appointment_count
      FROM appointments 
      WHERE start_datetime >= DATE_TRUNC('month', CURRENT_DATE)
      AND start_datetime < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      GROUP BY EXTRACT(hour FROM start_datetime)
      ORDER BY hour
    `;

    // Weekly appointment distribution
    const weeklyPatternQuery = `
      SELECT 
        EXTRACT(dow FROM start_datetime) as day_of_week,
        CASE EXTRACT(dow FROM start_datetime)
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
        END as day_name,
        COUNT(*) as appointment_count
      FROM appointments 
      WHERE start_datetime >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY EXTRACT(dow FROM start_datetime), day_name
      ORDER BY day_of_week
    `;

    const [volume, daily, weekly] = await Promise.all([
      query(volumeQuery),
      query(dailyPatternQuery),
      query(weeklyPatternQuery)
    ]);

    return NextResponse.json({
      volume: volume.rows.map((row: any) => ({
        month: row.month,
        total_appointments: parseInt(row.total_appointments),
        completed_reports: parseInt(row.completed_reports),
        signed_reports: parseInt(row.signed_reports),
        completion_rate: parseFloat(row.completion_rate) || 0,
        avg_turnaround_days: parseFloat(row.avg_turnaround_days) || 0
      })),
      dailyPattern: daily.rows.map((row: any) => ({
        hour: parseInt(row.hour),
        appointment_count: parseInt(row.appointment_count)
      })),
      weeklyPattern: weekly.rows.map((row: any) => ({
        day_of_week: parseInt(row.day_of_week),
        day_name: row.day_name,
        appointment_count: parseInt(row.appointment_count)
      }))
    });

  } catch (error) {
    console.error('Error fetching monthly volume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volume data' },
      { status: 500 }
    );
  }
}