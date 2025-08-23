import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

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

    const result = await query(userQuery, [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = {
      id: result.rows[0].id,
      date_created: new Date(result.rows[0].date_created),
      date_updated: new Date(result.rows[0].date_updated),
      user_created: result.rows[0].user_created,
      user_updated: result.rows[0].user_updated,
      name: result.rows[0].name,
      surname: result.rows[0].surname,
      email: result.rows[0].email,
      mobile: result.rows[0].mobile,
      type: result.rows[0].type,
      signature: result.rows[0].signature,
      created_by_name: result.rows[0].created_by_name,
      updated_by_name: result.rows[0].updated_by_name
    };

    return NextResponse.json(user);

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
    const { id: userId } = await params;
    const body = await request.json();

    const updateQuery = `
      UPDATE users 
      SET 
        date_updated = NOW(),
        user_updated = $1,
        name = $2,
        surname = $3,
        email = $4,
        mobile = $5,
        type = $6,
        signature = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      body.user_updated || 'system',
      body.name,
      body.surname,
      body.email,
      body.mobile,
      body.type,
      body.signature,
      userId
    ];

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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
    const { id: userId } = await params;

    // Check if user exists
    const checkQuery = `SELECT id FROM users WHERE id = $1`;
    const checkResult = await query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    const deleteQuery = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [userId]);
    
    return NextResponse.json(
      { message: 'User deleted successfully', id: result.rows[0].id },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}