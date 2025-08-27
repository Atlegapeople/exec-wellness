import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const locationQuery = `
      SELECT 
        l.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        s.name AS site_name,
        m.manager_name AS manager_name
      FROM locations l
      LEFT JOIN users uc ON uc.id = l.user_created
      LEFT JOIN users uu ON uu.id = l.user_updated
      LEFT JOIN sites s ON s.id = l.site_id
      LEFT JOIN managers m ON m.id = l.manager
      WHERE l.id = $1
    `;

    const result = await query(locationQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const updateQuery = `
      UPDATE locations 
      SET 
        date_updated = NOW(),
        user_updated = $2,
        site_id = $3,
        name = $4,
        address = $5,
        manager = $6
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.site_id,
      body.name,
      body.address,
      body.manager,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
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

    const deleteQuery = `DELETE FROM locations WHERE id = $1 RETURNING *`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
