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
      ? `WHERE (o.name ILIKE $3 OR o.registration_number ILIKE $3)`
      : '';

    const countSearchCondition = search
      ? `WHERE (o.name ILIKE $1 OR o.registration_number ILIKE $1)`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM organisation o
      ${countSearchCondition}
    `;

    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as { total: string }).total);

    // Get organizations with details, employee count (only employees with Executive Medical reports), manager count, site count, and medical report count
    const organizationsQuery = `
      SELECT 
        o.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        COALESCE(em_counts.employee_count, 0) AS employee_count,
        COALESCE(mg_counts.manager_count, 0) AS manager_count,
        COALESCE(site_counts.site_count, 0) AS site_count,
        COALESCE(mr_counts.report_count, 0) AS medical_report_count
      FROM organisation o
      LEFT JOIN users uc ON uc.id = o.user_created
      LEFT JOIN users uu ON uu.id = o.user_updated
      LEFT JOIN (
        SELECT 
          e.organisation,
          COUNT(DISTINCT mr.employee_id) AS employee_count
        FROM employee e
        INNER JOIN medical_report mr ON mr.employee_id = e.id
        WHERE mr.type = 'Executive Medical'
        GROUP BY e.organisation
      ) em_counts ON em_counts.organisation = o.id
      LEFT JOIN (
        SELECT 
          organisation_id,
          COUNT(*) AS manager_count
        FROM managers
        WHERE organisation_id IS NOT NULL
        GROUP BY organisation_id
      ) mg_counts ON mg_counts.organisation_id = o.id
      LEFT JOIN (
        SELECT 
          organisation_id,
          COUNT(*) AS site_count
        FROM sites
        WHERE organisation_id IS NOT NULL
        GROUP BY organisation_id
      ) site_counts ON site_counts.organisation_id = o.id
      LEFT JOIN (
        SELECT 
          e.organisation,
          COUNT(*) AS report_count
        FROM employee e
        INNER JOIN medical_report mr ON mr.employee_id = e.id
        WHERE e.organisation IS NOT NULL 
          AND e.id IN (
            SELECT employee_id
            FROM medical_report
            WHERE type = 'Executive Medical'
          )
        GROUP BY e.organisation
      ) mr_counts ON mr_counts.organisation = o.id
      ${searchCondition}
      ORDER BY COALESCE(em_counts.employee_count, 0) DESC, o.name ASC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search
      ? [limit, offset, `%${search}%`]
      : [limit, offset];
    const result = await query(organizationsQuery, queryParams);

    return NextResponse.json({
      organizations: result.rows,
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
    console.error('Error fetching organizations:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      {
        error: 'Failed to fetch organizations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_created, ...orgData } = body;

    // Get all column names from the request (excluding id, date_created, date_updated)
    const columns = Object.keys(orgData).join(', ');
    const placeholders = Object.keys(orgData)
      .map((_, index) => `$${index + 2}`)
      .join(', ');
    const values = Object.values(orgData);

    const insertQuery = `
      INSERT INTO organisation (user_created, ${columns})
      VALUES ($1, ${placeholders})
      RETURNING *
    `;

    const result = await query(insertQuery, [user_created, ...values]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating organization:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      {
        error: 'Failed to create organization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
