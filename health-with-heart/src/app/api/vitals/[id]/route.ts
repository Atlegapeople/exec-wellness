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
      LEFT JOIN notes n ON n.report_id = v.report_id OR n.employee_id = v.employee_id
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
      ...vitalData
    } = body;

    // Build dynamic update query
    const updateFields = Object.keys(vitalData)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');
    
    const values = Object.values(vitalData);

    const updateQuery = `
      UPDATE vitals_clinical_metrics 
      SET 
        ${updateFields},
        user_updated = $2,
        date_updated = NOW()
      WHERE id = $1
      RETURNING *
    `;

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
      id: result.rows[0].id 
    });

  } catch (error) {
    console.error('Error deleting vital record:', error);
    return NextResponse.json(
      { error: 'Failed to delete vital record' },
      { status: 500 }
    );
  }
}