import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = search 
      ? `WHERE (u.name ILIKE $3 OR u.surname ILIKE $3 OR u.email ILIKE $3)`
      : '';
    
    const countSearchCondition = search 
      ? `WHERE (u.name ILIKE $1 OR u.surname ILIKE $1 OR u.email ILIKE $1)`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users u
      ${countSearchCondition}
    `;
    
    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as {total: string}).total);

    // Get users with details
    const usersQuery = `
      SELECT 
        u.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM users u
      LEFT JOIN users uc ON uc.id = u.user_created
      LEFT JOIN users uu ON uu.id = u.user_updated
      ${searchCondition}
      ORDER BY u.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search ? [limit, offset, `%${search}%`] : [limit, offset];
    const result = await query(usersQuery, queryParams);

    return NextResponse.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching medical staff:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch medical staff', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_created,
      ...userData
    } = body;

    // Get all column names from the request (excluding id, date_created, date_updated)
    const columns = Object.keys(userData).join(', ');
    const placeholders = Object.keys(userData).map((_, index) => `$${index + 2}`).join(', ');
    const values = Object.values(userData);

    const insertQuery = `
      INSERT INTO users (user_created, ${columns})
      VALUES ($1, ${placeholders})
      RETURNING *
    `;

    const result = await query(insertQuery, [user_created, ...values]);
    
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error creating medical staff record:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create medical staff record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}