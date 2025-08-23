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
        { error: 'Medical staff record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching medical staff record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical staff record' },
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
      ...userData
    } = body;

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
        { error: 'Medical staff record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating medical staff record:', error);
    return NextResponse.json(
      { error: 'Failed to update medical staff record' },
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
      DELETE FROM users 
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Medical staff record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Medical staff record deleted successfully',
      id: result.rows[0].id 
    });

  } catch (error) {
    console.error('Error deleting medical staff record:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical staff record' },
      { status: 500 }
    );
  }
}