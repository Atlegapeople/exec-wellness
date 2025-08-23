import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface Location {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string | null;
  user_updated: string | null;
  site_id: string | null;
  name: string | null;
  address: string | null;
  manager: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  site_name?: string;
  manager_name?: string;
  employee_count?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const site = searchParams.get('site') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    let searchCondition = '';
    let countSearchCondition = '';
    
    if (search && site) {
      searchCondition = `WHERE (l.name ILIKE $4 OR l.address ILIKE $4) AND l.site_id = $3`;
      countSearchCondition = `WHERE (l.name ILIKE $2 OR l.address ILIKE $2) AND l.site_id = $1`;
    } else if (search) {
      searchCondition = `WHERE (l.name ILIKE $3 OR l.address ILIKE $3)`;
      countSearchCondition = `WHERE (l.name ILIKE $1 OR l.address ILIKE $1)`;
    } else if (site) {
      searchCondition = `WHERE l.site_id = $3`;
      countSearchCondition = `WHERE l.site_id = $1`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM locations l
      ${countSearchCondition}
    `;
    
    let countParams: (string | number)[] = [];
    if (search && site) {
      countParams = [site, `%${search}%`];
    } else if (search) {
      countParams = [`%${search}%`];
    } else if (site) {
      countParams = [site];
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get locations with creator/updater names, site names, and manager names
    const locationsQuery = `
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
      ${searchCondition}
      ORDER BY l.name ASC, l.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    let queryParams: (string | number)[] = [];
    if (search && site) {
      queryParams = [limit, offset, site, `%${search}%`];
    } else if (search) {
      queryParams = [limit, offset, `%${search}%`];
    } else if (site) {
      queryParams = [limit, offset, site];
    } else {
      queryParams = [limit, offset];
    }
    
    const result = await query(locationsQuery, queryParams);

    const locations: Location[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,
      user_updated: row.user_updated,
      site_id: row.site_id,
      name: row.name,
      address: row.address,
      manager: row.manager,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
      site_name: row.site_name,
      manager_name: row.manager_name,
      employee_count: 0
    }));

    return NextResponse.json({
      locations,
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
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const insertQuery = `
      INSERT INTO locations (
        id, date_created, date_updated, user_created, user_updated,
        site_id, name, address, manager
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.site_id,
      body.name,
      body.address,
      body.manager
    ];

    const result = await query(insertQuery, values);
    
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}