import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const updates = await request.json();

    // Build dynamic update query based on provided fields
    const allowedFields = [
      'doctor_signoff',
      'doctor_signature', 
      'nurse_signature',
      'report_work_status',
      'notes_text',
      'recommendation_text',
      'workplace',
      'line_manager',
      'line_manager2',
      'manager_email',
      'employee_work_email',
      'employee_personal_email',
      'doctor_email'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field)) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add date_updated and report ID
    updateFields.push(`date_updated = $${paramIndex}`);
    values.push(new Date().toISOString());
    paramIndex++;
    
    values.push(reportId);

    const updateQuery = `
      UPDATE medical_report 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Report updated successfully',
      report: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating medical report:', error);
    return NextResponse.json(
      { error: 'Failed to update medical report' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    const reportQuery = `
      SELECT 
        mr.*,
        e.name as employee_name,
        e.surname as employee_surname,
        u_doctor.name as doctor_name,
        u_doctor.surname as doctor_surname,
        u_nurse.name as nurse_name,
        u_nurse.surname as nurse_surname
      FROM medical_report mr
      LEFT JOIN employee e ON mr.employee_id = e.id
      LEFT JOIN users u_doctor ON mr.doctor = u_doctor.id
      LEFT JOIN users u_nurse ON mr.nurse = u_nurse.id
      WHERE mr.id = $1
    `;

    const result = await query(reportQuery, [reportId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching medical report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical report' },
      { status: 500 }
    );
  }
}