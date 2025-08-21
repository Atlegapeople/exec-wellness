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
      ? `WHERE (e.name ILIKE $3 OR e.surname ILIKE $3 OR e.employee_number ILIKE $3)`
      : '';
    
    const countSearchCondition = search 
      ? `WHERE (e.name ILIKE $1 OR e.surname ILIKE $1 OR e.employee_number ILIKE $1)`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM vitals_clinical_metrics v
      LEFT JOIN employee e ON e.id = v.employee_id
      ${countSearchCondition}
    `;
    
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get vitals with employee details and notes
    const vitalsQuery = `
      SELECT 
        v.*,
        e.name AS employee_name,
        e.surname AS employee_surname,
        e.employee_number,
        e.work_email AS employee_email,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        n.notes_text
      FROM vitals_clinical_metrics v
      LEFT JOIN employee e ON e.id = v.employee_id
      LEFT JOIN users uc ON uc.id = v.user_created
      LEFT JOIN users uu ON uu.id = v.user_updated
      LEFT JOIN notes n ON n.report_id = v.report_id OR n.employee_id = v.employee_id
      ${searchCondition}
      ORDER BY v.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search ? [limit, offset, `%${search}%`] : [limit, offset];
    const result = await query(vitalsQuery, queryParams);

    return NextResponse.json({
      vitals: result.rows,
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
    console.error('Error fetching vitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vitals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employee_id,
      user_created,
      ...vitalData
    } = body;

    // Get all column names from the table (excluding id, date_created, date_updated)
    const columns = Object.keys(vitalData).join(', ');
    const placeholders = Object.keys(vitalData).map((_, index) => `$${index + 3}`).join(', ');
    const values = Object.values(vitalData);

    const insertQuery = `
      INSERT INTO vitals_clinical_metrics (employee_id, user_created, ${columns})
      VALUES ($1, $2, ${placeholders})
      RETURNING *
    `;

    const result = await query(insertQuery, [employee_id, user_created, ...values]);
    
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error creating vital record:', error);
    return NextResponse.json(
      { error: 'Failed to create vital record' },
      { status: 500 }
    );
  }
}