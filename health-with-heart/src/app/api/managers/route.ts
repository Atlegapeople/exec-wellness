import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface Manager {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string | null;
  user_updated: string | null;
  organisation_id: string | null;
  manager_type: string | null;
  manager_name: string | null;
  manager_email: string | null;
  manager_contact_number: string | null;
  notes_text: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  organisation_name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const organization = searchParams.get('organization') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    let searchCondition = '';
    let countSearchCondition = '';

    if (search && organization) {
      searchCondition = `WHERE (m.manager_name ILIKE $4 OR m.manager_email ILIKE $4 OR m.manager_type ILIKE $4) AND m.organisation_id = $3`;
      countSearchCondition = `WHERE (m.manager_name ILIKE $2 OR m.manager_email ILIKE $2 OR m.manager_type ILIKE $2) AND m.organisation_id = $1`;
    } else if (search) {
      searchCondition = `WHERE (m.manager_name ILIKE $3 OR m.manager_email ILIKE $3 OR m.manager_type ILIKE $3)`;
      countSearchCondition = `WHERE (m.manager_name ILIKE $1 OR m.manager_email ILIKE $1 OR m.manager_type ILIKE $1)`;
    } else if (organization) {
      searchCondition = `WHERE m.organisation_id = $3`;
      countSearchCondition = `WHERE m.organisation_id = $1`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM managers m
      ${countSearchCondition}
    `;

    let countParams: (string | number)[] = [];
    if (search && organization) {
      countParams = [organization, `%${search}%`];
    } else if (search) {
      countParams = [`%${search}%`];
    } else if (organization) {
      countParams = [organization];
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as { total: string }).total);

    // Get managers with creator/updater names and organization names
    const managersQuery = `
      SELECT 
        m.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        o.name AS organisation_name
      FROM managers m
      LEFT JOIN users uc ON uc.id = m.user_created
      LEFT JOIN users uu ON uu.id = m.user_updated
      LEFT JOIN organisation o ON o.id = m.organisation_id
      ${searchCondition}
      ORDER BY m.manager_name ASC, m.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    let queryParams: (string | number)[] = [];
    if (search && organization) {
      queryParams = [limit, offset, organization, `%${search}%`];
    } else if (search) {
      queryParams = [limit, offset, `%${search}%`];
    } else if (organization) {
      queryParams = [limit, offset, organization];
    } else {
      queryParams = [limit, offset];
    }

    const result = await query(managersQuery, queryParams);

    const managers: Manager[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,
      user_updated: row.user_updated,
      organisation_id: row.organisation_id,
      manager_type: row.manager_type,
      manager_name: row.manager_name,
      manager_email: row.manager_email,
      manager_contact_number: row.manager_contact_number,
      notes_text: row.notes_text,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
      organisation_name: row.organisation_name,
    }));

    return NextResponse.json({
      managers,
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
    console.error('Error fetching managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch managers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO managers (
        id, date_created, date_updated, user_created, user_updated,
        organisation_id, manager_type, manager_name, manager_email, 
        manager_contact_number, notes_text
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5, $6, $7
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.organisation_id,
      body.manager_type,
      body.manager_name,
      body.manager_email,
      body.manager_contact_number,
      body.notes_text,
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating manager:', error);
    return NextResponse.json(
      { error: 'Failed to create manager' },
      { status: 500 }
    );
  }
}
