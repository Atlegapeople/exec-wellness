import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vitalQuery = `
      SELECT 
        v.*,
        e.name AS employee_name,
        e.surname AS employee_surname,
        e.employee_number,
        e.work_email AS employee_email,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        n.notes_text
      FROM vitals_clinical_metrics v
      LEFT JOIN employee e ON e.id = v.employee_id
      LEFT JOIN users uc ON uc.id = v.user_created
      LEFT JOIN users uu ON uu.id = v.user_updated
      LEFT JOIN medical_reports mr ON mr.id = v.report_id
      LEFT JOIN notes n ON n.report_id = mr.id
      WHERE v.id = $1
    `;

    const result = await query(vitalQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vital record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching vital record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vital record' },
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

    const {
      user_updated,
      date_updated,
      date_created,
      id: bodyId,
      ...vitalData
    } = body;

    // Build dynamic update query
    const updateFields = Object.keys(vitalData)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = Object.values(vitalData);

    // Handle case where no vital data fields are provided
    const vitalFieldsClause = updateFields ? `${updateFields},` : '';

    const updateQuery = `
      UPDATE vitals_clinical_metrics 
      SET 
        ${vitalFieldsClause}
        user_updated = $2,
        date_updated = NOW()
      WHERE id = $1
      RETURNING *
    `;

    console.log('Update query:', updateQuery);
    console.log('Update values:', [id, user_updated, ...values]);
    console.log('Vital data fields:', Object.keys(vitalData));

    const result = await query(updateQuery, [id, user_updated, ...values]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vital record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vital record:', error);
    return NextResponse.json(
      { error: 'Failed to update vital record' },
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

    const deleteQuery = `
      DELETE FROM vitals_clinical_metrics 
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Vital record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Vital record deleted successfully',
      id: (result.rows[0] as any).id,
    });
  } catch (error) {
    console.error('Error deleting vital record:', error);
    return NextResponse.json(
      { error: 'Failed to delete vital record' },
      { status: 500 }
    );
  }
}
