import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const organizationQuery = `
      SELECT 
        o.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM organisation o
      LEFT JOIN users uc ON uc.id = o.user_created
      LEFT JOIN users uu ON uu.id = o.user_updated
      WHERE o.id = $1
    `;

    const result = await query(organizationQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
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

    const { user_updated, ...orgData } = body;

    // Build dynamic update query
    const updateFields = Object.keys(orgData)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = Object.values(orgData);

    const updateQuery = `
      UPDATE organisation 
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
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
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
      DELETE FROM organisation 
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Organization deleted successfully',
      id: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
