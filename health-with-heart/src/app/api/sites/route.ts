import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface Site {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string | null;
  user_updated: string | null;
  organisation_id: string | null;
  name: string | null;
  address: string | null;
  site_admin_email: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  organisation_name?: string;
  employee_count?: number;
  medical_report_count?: number;
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
      searchCondition = `WHERE (s.name ILIKE $4 OR s.address ILIKE $4 OR s.site_admin_email ILIKE $4) AND s.organisation_id = $3`;
      countSearchCondition = `WHERE (s.name ILIKE $2 OR s.address ILIKE $2 OR s.site_admin_email ILIKE $2) AND s.organisation_id = $1`;
    } else if (search) {
      searchCondition = `WHERE (s.name ILIKE $3 OR s.address ILIKE $3 OR s.site_admin_email ILIKE $3)`;
      countSearchCondition = `WHERE (s.name ILIKE $1 OR s.address ILIKE $1 OR s.site_admin_email ILIKE $1)`;
    } else if (organization) {
      searchCondition = `WHERE s.organisation_id = $3`;
      countSearchCondition = `WHERE s.organisation_id = $1`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM sites s
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

    // Get sites with creator/updater names, organization names, employee counts, and medical report counts
    const sitesQuery = `
      SELECT 
        s.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        o.name AS organisation_name,
        COALESCE(emp_counts.employee_count, 0) AS employee_count,
        COALESCE(mr_counts.report_count, 0) AS medical_report_count
      FROM sites s
      LEFT JOIN users uc ON uc.id = s.user_created
      LEFT JOIN users uu ON uu.id = s.user_updated
      LEFT JOIN organisation o ON o.id = s.organisation_id
      LEFT JOIN (
        SELECT 
          e.organisation,
          COUNT(*) AS employee_count
        FROM employee e
        WHERE e.organisation IS NOT NULL 
          AND e.id IN (
            SELECT employee_id
            FROM medical_report
            WHERE type = 'Executive Medical'
          )
        GROUP BY e.organisation
      ) emp_counts ON emp_counts.organisation = s.organisation_id
      LEFT JOIN (
        SELECT 
          site,
          COUNT(*) AS report_count
        FROM medical_report
        WHERE type = 'Executive Medical'
          AND site IS NOT NULL
        GROUP BY site
      ) mr_counts ON mr_counts.site = s.id
      ${searchCondition}
      ORDER BY s.name ASC, s.date_created DESC
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

    const result = await query(sitesQuery, queryParams);

    const sites: Site[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,
      user_updated: row.user_updated,
      organisation_id: row.organisation_id,
      name: row.name,
      address: row.address,
      site_admin_email: row.site_admin_email,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
      organisation_name: row.organisation_name,
      employee_count: parseInt(row.employee_count) || 0,
      medical_report_count: parseInt(row.medical_report_count) || 0,
    }));

    return NextResponse.json({
      sites,
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
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO sites (
        id, date_created, date_updated, user_created, user_updated,
        organisation_id, name, address, site_admin_email
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.organisation_id,
      body.name,
      body.address,
      body.site_admin_email,
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}
