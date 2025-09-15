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
      ? `AND (e.name ILIKE $3 OR e.surname ILIKE $3 OR e.employee_number ILIKE $3)`
      : '';

    const countSearchCondition = search
      ? `AND (e.name ILIKE $1 OR e.surname ILIKE $1 OR e.employee_number ILIKE $1)`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM assesment a
      LEFT JOIN employee e ON e.id = a.employee_id
      WHERE a.employee_id IN (
        SELECT employee_id 
        FROM medical_report 
        WHERE type = 'Executive Medical'
      )
      ${countSearchCondition}
    `;

    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as { total: string }).total);

    // Get assessments with employee details
    const assessmentsQuery = `
      SELECT 
        a.*,
        e.name AS employee_name,
        e.surname AS employee_surname,
        e.employee_number,
        e.work_email AS employee_email,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM assesment a
      LEFT JOIN employee e ON e.id = a.employee_id
      LEFT JOIN users uc ON uc.id = a.user_created
      LEFT JOIN users uu ON uu.id = a.user_updated
      WHERE a.employee_id IN (
        SELECT employee_id 
        FROM medical_report 
        WHERE type = 'Executive Medical'
      )
      ${searchCondition}
      ORDER BY a.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search
      ? [limit, offset, `%${search}%`]
      : [limit, offset];
    const result = await query(assessmentsQuery, queryParams);

    return NextResponse.json({
      assessments: result.rows,
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
    console.error('Error fetching assessments:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      {
        error: 'Failed to fetch assessments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id, user_created } = body;

    // Only include fields that definitely exist in the database table
    const insertQuery = `
      INSERT INTO assesment (employee_id, user_created)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await query(insertQuery, [employee_id, user_created]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assessment record:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      {
        error: 'Failed to create assessment record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
