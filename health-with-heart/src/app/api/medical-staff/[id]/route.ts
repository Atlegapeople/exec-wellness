import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userQuery = `
      SELECT 
        u.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM users u
      LEFT JOIN users uc ON uc.id = u.user_created
      LEFT JOIN users uu ON uu.id = u.user_updated
      WHERE u.id = $1
    `;

    const result = await query(userQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Medical staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching medical staff member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical staff member' },
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

    const { user_updated, ...userData } = body;

    // Build dynamic update query
    const updateFields = Object.keys(userData)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = Object.values(userData);

    const updateQuery = `
      UPDATE users 
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
        { error: 'Medical staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating medical staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update medical staff member' },
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

    // Check if user has related records
    const relatedRecordsQuery = `
      SELECT 
        COUNT(mr.id) as medical_reports_doctor,
        COUNT(mr2.id) as medical_reports_nurse
      FROM users u
      LEFT JOIN medical_report mr ON mr.doctor = u.id
      LEFT JOIN medical_report mr2 ON mr2.nurse = u.id
      WHERE u.id = $1
    `;

    const relatedResult = await query(relatedRecordsQuery, [id]);
    const relatedCounts = relatedResult.rows[0] as {
      medical_reports_doctor: string;
      medical_reports_nurse: string;
    };

    if (
      parseInt(relatedCounts.medical_reports_doctor) > 0 ||
      parseInt(relatedCounts.medical_reports_nurse) > 0
    ) {
      return NextResponse.json(
        {
          error:
            'Cannot delete medical staff member with existing medical reports',
          details: {
            medical_reports_doctor: parseInt(
              relatedCounts.medical_reports_doctor
            ),
            medical_reports_nurse: parseInt(
              relatedCounts.medical_reports_nurse
            ),
          },
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Medical staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Medical staff member deleted successfully',
      id: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error deleting medical staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical staff member' },
      { status: 500 }
    );
  }
}
