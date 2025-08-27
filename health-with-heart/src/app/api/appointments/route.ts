import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Appointment } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const isGetAll = searchParams.get('limit') === '10000';
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = search
      ? `WHERE a.type = 'Executive Medical' AND (a.type ILIKE $3 OR a.notes ILIKE $3 OR e.name ILIKE $3 OR e.surname ILIKE $3)`
      : `WHERE a.type = 'Executive Medical'`;

    const countSearchCondition = search
      ? `WHERE a.type = 'Executive Medical' AND (a.type ILIKE $1 OR a.notes ILIKE $1 OR e.name ILIKE $1 OR e.surname ILIKE $1)`
      : `WHERE a.type = 'Executive Medical'`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM appointments a
      LEFT JOIN employee e ON e.id = a.employee_id
      ${countSearchCondition}
    `;

    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get appointments with employee details and user names
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
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM public.appointments a
      LEFT JOIN public.employee e ON e.id = a.employee_id
      LEFT JOIN public.users uc ON uc.id = a.user_created
      LEFT JOIN public.users uu ON uu.id = a.user_updated
      ${searchCondition}
      ORDER BY 
        COALESCE(a.start_datetime, a.date_created) DESC,
        a.start_date DESC,
        a.start_time DESC
      ${isGetAll ? '' : 'LIMIT $1 OFFSET $2'}
    `;

    const queryParams = isGetAll
      ? search
        ? [`%${search}%`]
        : []
      : search
        ? [limit, offset, `%${search}%`]
        : [limit, offset];

    const result = await query(appointmentsQuery, queryParams);

    const appointments: (Appointment & {
      employee_name?: string;
      employee_surname?: string;
      employee_email?: string;
      created_by_name?: string;
      updated_by_name?: string;
    })[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: new Date(row.date_created),
      date_updated: new Date(row.date_updated),
      user_created: row.user_created,
      user_updated: row.user_updated,
      report_id: row.report_id,
      employee_id: row.employee_id,
      type: row.type,
      start_datetime: new Date(row.start_datetime),
      end_datetime: new Date(row.end_datetime),
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
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
    }));

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the incoming data for debugging
    console.log('Creating appointment with data:', body);

    // First, let's check what the actual table structure looks like
    try {
      const tableInfo = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        ORDER BY ordinal_position
      `);
      console.log('Appointments table structure:', tableInfo.rows);
    } catch (tableError) {
      console.error('Error getting table structure:', tableError);
    }

    const insertQuery = `
      INSERT INTO appointments (
        id, date_created, date_updated, user_created, user_updated,
        report_id, employee_id, type, start_datetime, end_datetime,
        start_date, end_date, start_time, end_time, notes,
        calander_id, calander_link
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.report_id,
      body.employee_id,
      body.type || 'Executive Medical',
      body.start_datetime,
      body.end_datetime,
      body.start_date,
      body.end_date,
      body.start_time,
      body.end_time,
      body.notes || '',
      body.calander_id,
      body.calander_link,
    ];

    console.log('Executing query with values:', values);

    const result = await query(insertQuery, values);

    console.log('Insert result:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
