import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const emergencyResponseQuery = `
      SELECT 
        er.id,
        er.date_created,
        er.date_updated,
        uc.name || ' ' || uc.surname AS user_created_name,
        uu.name || ' ' || uu.surname AS user_updated_name,
        er.user_created,
        er.user_updated,
        er.report_id,
        er.employee_id,
        e.name as employee_name,
        e.surname as employee_surname,
        e.work_email as employee_work_email,
        er.injury_date,
        er.injury_time,
        er.arrival_time,
        er.location_id,
        er.place,
        er.emergency_type,
        er.injury,
        er.main_complaint,
        er.diagnosis,
        er.findings,
        er.intervention,
        er.patient_history,
        er.plan,
        er.outcome,
        er.reference,
        er.manager,
        er.sendemail
      FROM public.emergency_responses er
      INNER JOIN public.employee e ON e.id = er.employee_id
      LEFT JOIN public.users uc ON uc.id = er.user_created
      LEFT JOIN public.users uu ON uu.id = er.user_updated
      WHERE er.id = $1
    `;

    const result = await query(emergencyResponseQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Emergency response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching emergency response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency response' },
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
      UPDATE emergency_responses SET
        date_updated = NOW(),
        user_updated = $2,
        report_id = $3,
        employee_id = $4,
        injury_date = $5,
        injury_time = $6,
        arrival_time = $7,
        location_id = $8,
        place = $9,
        emergency_type = $10,
        injury = $11,
        main_complaint = $12,
        diagnosis = $13,
        findings = $14,
        intervention = $15,
        patient_history = $16,
        plan = $17,
        outcome = $18,
        reference = $19,
        manager = $20,
        sendemail = $21
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.report_id,
      body.employee_id,
      body.injury_date,
      body.injury_time,
      body.arrival_time,
      body.location_id,
      body.place,
      body.emergency_type,
      body.injury,
      body.main_complaint,
      body.diagnosis,
      body.findings,
      body.intervention,
      body.patient_history,
      body.plan,
      body.outcome,
      body.reference,
      body.manager,
      body.sendemail,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Emergency response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating emergency response:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency response' },
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

    const deleteQuery =
      'DELETE FROM emergency_responses WHERE id = $1 RETURNING id';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Emergency response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Emergency response deleted successfully',
      id: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error deleting emergency response:', error);
    return NextResponse.json(
      { error: 'Failed to delete emergency response' },
      { status: 500 }
    );
  }
}
