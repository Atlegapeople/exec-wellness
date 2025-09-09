import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointmentQuery = `
      SELECT 
        a.*,
        e.name AS employee_name,
        e.surname AS employee_surname,
        e.work_email AS employee_email,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM appointments a
      LEFT JOIN employee e ON e.id = a.employee_id
      LEFT JOIN users uc ON uc.id = a.user_created
      LEFT JOIN users uu ON uc.id = a.user_updated
      WHERE a.id = $1
    `;

    const result = await query(appointmentQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateQuery = `
      UPDATE appointments SET
        date_updated = NOW(),
        user_updated = $2,
        report_id = $3,
        employee_id = $4,
        type = $5,
        start_datetime = $6,
        end_datetime = $7,
        start_date = $8,
        end_date = $9,
        start_time = $10,
        end_time = $11,
        notes = $12,
        calander_id = $13,
        calander_link = $14
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.report_id,
      body.employee_id,
      body.type,
      body.start_datetime,
      body.end_datetime,
      body.start_date,
      body.end_date,
      body.start_time,
      body.end_time,
      body.notes,
      body.calander_id,
      body.calander_link,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleteQuery = `DELETE FROM appointments WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully',
      id: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
