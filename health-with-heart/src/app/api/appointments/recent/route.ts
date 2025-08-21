import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Appointment } from '@/types';

export async function GET() {
  try {
    const recentAppointmentsQuery = `
      SELECT 
        a.id,
        a.date_created,
        a.date_updated,
        a.user_created,
        a.user_updated,
        a.report_id,
        a.employee_id,
        CONCAT(e.name, ' ', e.surname) as employee_name,
        a.type,
        a.start_datetime,
        a.end_datetime,
        a.start_date,
        a.end_date,
        a.start_time,
        a.end_time,
        a.notes,
        a.calander_id,
        a.calander_link
      FROM appointments a
      LEFT JOIN employee e ON e.id = a.employee_id
      WHERE a.start_datetime >= CURRENT_DATE - INTERVAL '7 days'
      AND a.type = 'Executive Medical'
      ORDER BY a.start_datetime DESC
      LIMIT 20
    `;

    const result = await query(recentAppointmentsQuery);
    
    const appointments: any[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: new Date(row.date_created),
      date_updated: new Date(row.date_updated),
      user_created: row.user_created,
      user_updated: row.user_updated,
      report_id: row.report_id,
      employee_id: row.employee_id,
      employee_name: row.employee_name,
      type: row.type,
      start_datetime: new Date(row.start_datetime),
      end_datetime: new Date(row.end_datetime),
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      start_time: row.start_time,
      end_time: row.end_time,
      notes: row.notes,
      calander_id: row.calander_id,
      calander_link: row.calander_link
    }));

    return NextResponse.json(appointments);

  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent appointments' },
      { status: 500 }
    );
  }
}