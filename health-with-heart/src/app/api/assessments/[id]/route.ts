import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const assessmentQuery = `
      SELECT 
        a.*,
        e.name AS employee_name,
        e.surname AS employee_surname,
        e.employee_number,
        e.work_email AS employee_email,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM assesment a
      LEFT JOIN employee e ON e.id = a.employee_id
      LEFT JOIN users uc ON uc.id = a.user_created
      LEFT JOIN users uu ON uu.id = a.user_updated
      WHERE a.id = $1
    `;

    const result = await query(assessmentQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching assessment record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment record' },
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

    const { user_updated, ...assessmentData } = body;

    // Build dynamic update query
    const updateFields = Object.keys(assessmentData)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = Object.values(assessmentData);

    const updateQuery = `
      UPDATE assesment 
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
        { error: 'Assessment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating assessment record:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment record' },
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
      DELETE FROM assesment 
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Assessment record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Assessment record deleted successfully',
      id: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error deleting assessment record:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment record' },
      { status: 500 }
    );
  }
}
