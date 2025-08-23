import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;

    const siteQuery = `
      SELECT 
        s.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        o.name AS organisation_name
      FROM sites s
      LEFT JOIN users uc ON uc.id = s.user_created
      LEFT JOIN users uu ON uu.id = s.user_updated
      LEFT JOIN organisation o ON o.id = s.organisation_id
      WHERE s.id = $1
    `;

    const result = await query(siteQuery, [siteId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const body = await request.json();

    const updateQuery = `
      UPDATE sites 
      SET 
        organisation_id = $1,
        name = $2,
        address = $3,
        site_admin_email = $4,
        user_updated = $5,
        date_updated = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      body.organisation_id,
      body.name,
      body.address,
      body.site_admin_email,
      body.user_updated || 'system',
      siteId
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;

    const deleteQuery = 'DELETE FROM sites WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [siteId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Site deleted successfully' });

  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}