import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const view = searchParams.get('view') || 'month';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Get appointments within the date range with employee and user details
    const appointmentsQuery = `
      SELECT 
        a.id,
        a.date_created,
        a.date_updated,
        a.user_created,
        a.user_updated,
        a.report_id,
        a.employee_id,
        a.type,
        a.start_datetime,
        a.end_datetime,
        a.start_date,
        a.end_date,
        a.start_time,
        a.end_time,
        a.notes,
        a.calander_id,
        a.calander_link,
        e.name AS employee_name,
        e.surname AS employee_surname,
        e.work_email AS employee_email,
        e.mobile_number AS employee_mobile,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM public.appointments a
      LEFT JOIN public.employee e ON e.id = a.employee_id
      LEFT JOIN public.users uc ON uc.id = a.user_created
      LEFT JOIN public.users uu ON uu.id = a.user_updated
      WHERE 
        a.type = 'Executive Medical'
        AND (
          (a.start_date >= $1 AND a.start_date <= $2)
          OR (a.end_date >= $1 AND a.end_date <= $2)
          OR (a.start_date <= $1 AND a.end_date >= $2)
        )
      ORDER BY 
        COALESCE(a.start_datetime, a.date_created) ASC,
        a.start_date ASC,
        a.start_time ASC
    `;

    const result = await query(appointmentsQuery, [startDate, endDate]);
    
    const appointments = result.rows.map((row: any) => ({
      id: row.id,
      date_created: new Date(row.date_created),
      date_updated: new Date(row.date_updated),
      user_created: row.user_created,
      user_updated: row.user_updated,
      report_id: row.report_id,
      employee_id: row.employee_id,
      type: row.type,
      start_datetime: row.start_datetime ? new Date(row.start_datetime) : null,
      end_datetime: row.end_datetime ? new Date(row.end_datetime) : null,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      start_time: row.start_time,
      end_time: row.end_time,
      notes: row.notes,
      calander_id: row.calander_id,
      calander_link: row.calander_link,
      employee_name: row.employee_name,
      employee_surname: row.employee_surname,
      employee_email: row.employee_email,
      employee_mobile: row.employee_mobile,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
      // Calendar-specific fields
      title: `${row.type} - ${row.employee_name} ${row.employee_surname}`,
      start: row.start_datetime || new Date(`${row.start_date}T${row.start_time || '09:00:00'}`),
      end: row.end_datetime || new Date(`${row.end_date}T${row.end_time || '10:00:00'}`),
      allDay: !row.start_datetime && !row.end_datetime,
      color: getAppointmentColor(row.type, row.report_id),
      status: row.report_id ? 'completed' : 'scheduled'
    }));

    // Get summary statistics for the date range
    const statsQuery = `
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN report_id IS NOT NULL THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN report_id IS NULL THEN 1 END) as scheduled_appointments,
        COUNT(DISTINCT employee_id) as unique_employees,
        COUNT(DISTINCT type) as appointment_types
      FROM public.appointments a
      WHERE 
        a.type = 'Executive Medical'
        AND (
          (a.start_date >= $1 AND a.start_date <= $2)
          OR (a.end_date >= $1 AND a.end_date <= $2)
          OR (a.start_date <= $1 AND a.end_date >= $2)
        )
    `;

    const statsResult = await query(statsQuery, [startDate, endDate]);
    const stats = statsResult.rows[0];

    return NextResponse.json({
      appointments,
      stats: {
        total: parseInt(stats.total_appointments),
        completed: parseInt(stats.completed_appointments),
        scheduled: parseInt(stats.scheduled_appointments),
        uniqueEmployees: parseInt(stats.unique_employees),
        appointmentTypes: parseInt(stats.appointment_types)
      },
      dateRange: {
        start: startDate,
        end: endDate,
        view
      }
    });

  } catch (error) {
    console.error('Error fetching calendar appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar appointments' },
      { status: 500 }
    );
  }
}

function getAppointmentColor(type: string, reportId: string | null): string {
  // Color based on appointment type and completion status
  if (reportId) {
    // Completed appointments - darker colors
    switch (type?.toLowerCase()) {
      case 'comprehensive medical':
      case 'comprehensive medical for 40yrs and older':
        return '#10b981'; // emerald-500
      case 'medical examination':
        return '#3b82f6'; // blue-500
      case 'follow-up':
        return '#8b5cf6'; // violet-500
      default:
        return '#6b7280'; // gray-500
    }
  } else {
    // Scheduled appointments - lighter colors
    switch (type?.toLowerCase()) {
      case 'comprehensive medical':
      case 'comprehensive medical for 40yrs and older':
        return '#34d399'; // emerald-400
      case 'medical examination':
        return '#60a5fa'; // blue-400
      case 'follow-up':
        return '#a78bfa'; // violet-400
      default:
        return '#9ca3af'; // gray-400
    }
  }
}