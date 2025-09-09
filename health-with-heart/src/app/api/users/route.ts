import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;
    const isGetAll = searchParams.get('limit') === '10000';

    // Build search condition
    const searchCondition = search
      ? `WHERE (u.name ILIKE $3 OR u.surname ILIKE $3 OR u.email ILIKE $3 OR u.type ILIKE $3)`
      : '';

    const countSearchCondition = search
      ? `WHERE (name ILIKE $1 OR surname ILIKE $1 OR email ILIKE $1 OR type ILIKE $1)`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users 
      ${countSearchCondition}
    `;

    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as any).total);

    // Get users with creator/updater names
    const usersQuery = `
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
      ${searchCondition}
      ORDER BY u.type, u.surname, u.name
      ${isGetAll ? '' : 'LIMIT $1 OFFSET $2'}
    `;

    const queryParams = isGetAll
      ? search
        ? [`%${search}%`]
        : []
      : search
        ? [limit, offset, `%${search}%`]
        : [limit, offset];

    const result = await query(usersQuery, queryParams);

    const users: (User & {
      created_by_name?: string;
      updated_by_name?: string;
    })[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: new Date(row.date_created),
      date_updated: new Date(row.date_updated),
      user_created: row.user_created,
      user_updated: row.user_updated,
      name: row.name,
      surname: row.surname,
      email: row.email,
      mobile: row.mobile,
      type: row.type,
      signature: row.signature,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
    }));

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO users (
        id, date_created, date_updated, user_created, user_updated,
        name, surname, email, mobile, type, signature
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5, $6, $7
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.name,
      body.surname,
      body.email,
      body.mobile,
      body.type,
      body.signature,
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
