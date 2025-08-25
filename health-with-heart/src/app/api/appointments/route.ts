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

    // Extract appointment data from request body
    const {
      employee_id,
      type,
      start_datetime,
      end_datetime,
      start_date,
      end_date,
      start_time,
      end_time,
      notes,
      calander_id,
      calander_link,
      report_id,
    } = body;

    // Validate required fields
    if (!employee_id || !type) {
      return NextResponse.json(
        { error: 'Employee ID and type are required' },
        { status: 400 }
      );
    }

    // Insert new appointment into database
    const insertQuery = `
      INSERT INTO appointments (
        employee_id,
        type,
        start_datetime,
        end_datetime,
        start_date,
        end_date,
        start_time,
        end_time,
        notes,
        calander_id,
        calander_link,
        report_id,
        date_created,
        date_updated,
        user_created,
        user_updated
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
        NOW(), NOW(), $13, $13
      ) RETURNING *
    `;

    const insertParams = [
      employee_id,
      type,
      start_datetime || null,
      end_datetime || null,
      start_date || null,
      end_date || null,
      start_time || null,
      end_time || null,
      notes || null,
      calander_id || null,
      calander_link || null,
      report_id || null,
      body.user_created || 'system', // Default to 'system' if not provided
    ];

    const result = await query(insertQuery, insertParams);

    if (result.rows.length === 0) {
      throw new Error('Failed to insert appointment');
    }

    const newAppointment = result.rows[0];

    // Fetch the complete appointment with employee details
    const fetchQuery = `
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
      WHERE a.id = $1
    `;

    const fetchResult = await query(fetchQuery, [newAppointment.id]);
    const appointmentWithDetails = fetchResult.rows[0];

    // Transform the data to match the expected format
    const appointment: Appointment & {
      employee_name?: string;
      employee_surname?: string;
      employee_email?: string;
      created_by_name?: string;
      updated_by_name?: string;
    } = {
      id: appointmentWithDetails.id,
      date_created: new Date(appointmentWithDetails.date_created),
      date_updated: new Date(appointmentWithDetails.date_updated),
      user_created: appointmentWithDetails.user_created,
      user_updated: appointmentWithDetails.user_updated,
      report_id: appointmentWithDetails.report_id,
      employee_id: appointmentWithDetails.employee_id,
      type: appointmentWithDetails.type,
      start_datetime: appointmentWithDetails.start_datetime
        ? new Date(appointmentWithDetails.start_datetime)
        : undefined,
      end_datetime: appointmentWithDetails.end_datetime
        ? new Date(appointmentWithDetails.end_datetime)
        : undefined,
      start_date: appointmentWithDetails.start_date
        ? new Date(appointmentWithDetails.start_date)
        : undefined,
      end_date: appointmentWithDetails.end_date
        ? new Date(appointmentWithDetails.end_date)
        : undefined,
      start_time: appointmentWithDetails.start_time,
      end_time: appointmentWithDetails.end_time,
      notes: appointmentWithDetails.notes,
      calander_id: appointmentWithDetails.calander_id,
      calander_link: appointmentWithDetails.calander_link,
      employee_name: appointmentWithDetails.employee_name,
      employee_surname: appointmentWithDetails.employee_surname,
      employee_email: appointmentWithDetails.employee_email,
      created_by_name: appointmentWithDetails.created_by_name,
      updated_by_name: appointmentWithDetails.updated_by_name,
    };

    return NextResponse.json(
      {
        message: 'Appointment created successfully',
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE request received for appointments');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Appointment ID to delete:', id);

    if (!id) {
      console.log('No ID provided, returning 400');
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // For now, just return a success response to test the API endpoint
    console.log('DELETE endpoint working - returning test response');
    return NextResponse.json({
      message: 'DELETE endpoint working - test response',
      deletedId: id,
      status: 'test',
    });
  } catch (error) {
    console.error('Error in DELETE method:', error);
    return NextResponse.json(
      { error: 'DELETE method error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Check if appointment exists before updating
    const checkQuery = 'SELECT id FROM appointments WHERE id = $1';
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Add updateData fields to the query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    // Add date_updated and user_updated
    updateFields.push('date_updated = NOW()');
    if (body.user_updated) {
      updateFields.push('user_updated = $' + paramIndex);
      updateValues.push(body.user_updated);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add the ID as the last parameter
    updateValues.push(id);

    const updateQuery = `
      UPDATE appointments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      throw new Error('Failed to update appointment');
    }

    const updatedAppointment = result.rows[0];

    // Fetch the complete updated appointment with employee details
    const fetchQuery = `
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
      WHERE a.id = $1
    `;

    const fetchResult = await query(fetchQuery, [id]);
    const appointmentWithDetails = fetchResult.rows[0];

    // Transform the data to match the expected format
    const appointment: Appointment & {
      employee_name?: string;
      employee_surname?: string;
      employee_email?: string;
      created_by_name?: string;
      updated_by_name?: string;
    } = {
      id: appointmentWithDetails.id,
      date_created: new Date(appointmentWithDetails.date_created),
      date_updated: new Date(appointmentWithDetails.date_updated),
      user_created: appointmentWithDetails.user_created,
      user_updated: appointmentWithDetails.user_updated,
      report_id: appointmentWithDetails.report_id,
      employee_id: appointmentWithDetails.employee_id,
      type: appointmentWithDetails.type,
      start_datetime: appointmentWithDetails.start_datetime
        ? new Date(appointmentWithDetails.start_datetime)
        : undefined,
      end_datetime: appointmentWithDetails.end_datetime
        ? new Date(appointmentWithDetails.end_datetime)
        : undefined,
      start_date: appointmentWithDetails.start_date
        ? new Date(appointmentWithDetails.start_date)
        : undefined,
      end_date: appointmentWithDetails.end_date
        ? new Date(appointmentWithDetails.end_date)
        : undefined,
      start_time: appointmentWithDetails.start_time,
      end_time: appointmentWithDetails.end_time,
      notes: appointmentWithDetails.notes,
      calander_id: appointmentWithDetails.calander_id,
      calander_link: appointmentWithDetails.calander_link,
      employee_name: appointmentWithDetails.employee_name,
      employee_surname: appointmentWithDetails.employee_surname,
      employee_email: appointmentWithDetails.employee_email,
      created_by_name: appointmentWithDetails.created_by_name,
      updated_by_name: appointmentWithDetails.updated_by_name,
    };

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
