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
        u.id,
        u.date_created,
        u.date_updated,
        u.user_created,
        u.user_updated,
        u.name,
        u.surname,
        u.email,
        u.mobile,
        u.type,
        u.signature,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM public.users u
      LEFT JOIN public.users uc ON uc.id = u.user_created
      LEFT JOIN public.users uu ON uu.id = u.user_updated
      WHERE u.id = $1
    `;

    const result = await query(userQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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
      UPDATE users SET
        date_updated = NOW(),
        user_updated = $2,
        name = $3,
        surname = $4,
        email = $5,
        mobile = $6,
        type = $7,
        signature = $8
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.name,
      body.surname,
      body.email,
      body.mobile,
      body.type,
      body.signature,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
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
        COUNT(e.id) as employees_created,
        COUNT(e2.id) as employees_updated,
        COUNT(mr.id) as medical_reports_doctor,
        COUNT(mr2.id) as medical_reports_nurse,
        COUNT(o.id) as organizations_created,
        COUNT(o2.id) as organizations_updated,
        COUNT(s.id) as sites_created,
        COUNT(s2.id) as sites_updated
      FROM users u
      LEFT JOIN employee e ON e.user_created = u.id
      LEFT JOIN employee e2 ON e2.user_updated = u.id
      LEFT JOIN medical_report mr ON mr.doctor = u.id
      LEFT JOIN medical_report mr2 ON mr2.nurse = u.id
      LEFT JOIN organisation o ON o.user_created = u.id
      LEFT JOIN organisation o2 ON o2.user_updated = u.id
      LEFT JOIN sites s ON s.user_created = u.id
      LEFT JOIN sites s2 ON s2.user_updated = u.id
      WHERE u.id = $1
    `;

    const relatedResult = await query(relatedRecordsQuery, [id]);
    const relatedCounts = relatedResult.rows[0] as any;

    const totalRelated =
      parseInt(relatedCounts.employees_created) +
      parseInt(relatedCounts.employees_updated) +
      parseInt(relatedCounts.medical_reports_doctor) +
      parseInt(relatedCounts.medical_reports_nurse) +
      parseInt(relatedCounts.organizations_created) +
      parseInt(relatedCounts.organizations_updated) +
      parseInt(relatedCounts.sites_created) +
      parseInt(relatedCounts.sites_updated);

    if (totalRelated > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete user with existing related records',
          details: {
            employees_created: parseInt(relatedCounts.employees_created),
            employees_updated: parseInt(relatedCounts.employees_updated),
            medical_reports_doctor: parseInt(
              relatedCounts.medical_reports_doctor
            ),
            medical_reports_nurse: parseInt(
              relatedCounts.medical_reports_nurse
            ),
            organizations_created: parseInt(
              relatedCounts.organizations_created
            ),
            organizations_updated: parseInt(
              relatedCounts.organizations_updated
            ),
            sites_created: parseInt(relatedCounts.sites_created),
            sites_updated: parseInt(relatedCounts.sites_updated),
          },
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      id: (result.rows[0] as any).id,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
