import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: managerId } = await params;

    const managerQuery = `
      SELECT 
        m.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        o.name AS organisation_name
      FROM managers m
      LEFT JOIN users uc ON uc.id = m.user_created
      LEFT JOIN users uu ON uu.id = m.user_updated
      LEFT JOIN organisation o ON o.id = m.organisation_id
      WHERE m.id = $1
    `;

    const result = await query(managerQuery, [managerId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching manager:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manager' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: managerId } = await params;
    const body = await request.json();

    const updateQuery = `
      UPDATE managers 
      SET 
        organisation_id = $1,
        manager_type = $2,
        manager_name = $3,
        manager_email = $4,
        manager_contact_number = $5,
        notes_text = $6,
        user_updated = $7,
        date_updated = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      body.organisation_id,
      body.manager_type,
      body.manager_name,
      body.manager_email,
      body.manager_contact_number,
      body.notes_text,
      body.user_updated || 'system',
      managerId
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating manager:', error);
    return NextResponse.json(
      { error: 'Failed to update manager' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: managerId } = await params;

    const deleteQuery = 'DELETE FROM managers WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [managerId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Manager not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Manager deleted successfully' });

  } catch (error) {
    console.error('Error deleting manager:', error);
    return NextResponse.json(
      { error: 'Failed to delete manager' },
      { status: 500 }
    );
  }
}