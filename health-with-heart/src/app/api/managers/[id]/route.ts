import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const result = await query(managerQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
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
    const { id } = await params;
    const body = await request.json();

    const updateQuery = `
      UPDATE managers 
      SET 
        date_updated = NOW(),
        user_updated = $2,
        organisation_id = $3,
        manager_type = $4,
        manager_name = $5,
        manager_email = $6,
        manager_contact_number = $7,
        notes_text = $8
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.organisation_id,
      body.manager_type,
      body.manager_name,
      body.manager_email,
      body.manager_contact_number,
      body.notes_text,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
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
    const { id } = await params;

    // Check if manager has related records
    const relatedRecordsQuery = `
      SELECT 
        COUNT(l.id) as locations
      FROM managers m
      LEFT JOIN locations l ON l.manager = m.id
      WHERE m.id = $1
    `;

    const relatedResult = await query(relatedRecordsQuery, [id]);
    const relatedCounts = relatedResult.rows[0];

    if (relatedCounts.locations > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete manager with existing related locations',
          details: {
            locations: parseInt(relatedCounts.locations),
          },
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM managers WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Manager deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting manager:', error);
    return NextResponse.json(
      { error: 'Failed to delete manager' },
      { status: 500 }
    );
  }
}
