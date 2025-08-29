import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { MenHealth } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '29');
    const employee = searchParams.get('employee');
    const search = searchParams.get('search') || '';

    let whereClause = '';
    let params: any[] = [];
    let paramIndex = 1;

    // Base query using the new structure
    const baseQuery = `
      SELECT 
        e.name, e.surname,
        w.id, 
        w.date_created, 
        w.date_updated,
        w.user_created, 
        w.user_updated,
        w.report_id, 
        w.employee_id, 
        w.ever_diagnosed_with,
        w.prostate_enlarged, 
        w.prostate_infection, 
        w.prostate_cancer, 
        w.testes_growth, 
        w.erections, 
        w.require_urologist,
        w.notes_header, 
        w.notes_text,
        w.recommendation_text
      FROM employee e
      LEFT JOIN mens_health w 
        ON e.id = w.employee_id
      WHERE w.employee_id IN (
        SELECT mr.employee_id
        FROM medical_report mr
        WHERE mr.type = 'Executive Medical'
      )
    `;

    if (employee) {
      whereClause += `AND e.id = $${paramIndex}`;
      params.push(employee);
      paramIndex++;
    }

    if (search) {
      const searchCondition = `AND (e.id ILIKE $${paramIndex} OR e.name ILIKE $${paramIndex})`;
      whereClause += searchCondition;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM employee e
      WHERE e.id IN (
        SELECT mr.employee_id
        FROM medical_report mr
        WHERE mr.type = 'Executive Medical'
      )
      ${whereClause}
    `;

    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count || '0');

    console.log('Count query result:', countResult.rows[0]);
    console.log('Total records found:', total);

    // Get paginated data
    const offset = (page - 1) * limit;
    const dataQuery = `
      ${baseQuery}
      ${whereClause}
      ORDER BY e.name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    console.log('Data query:', dataQuery);
    console.log('Query parameters:', params);

    params.push(limit, offset);
    const result = await query(dataQuery, params);

    console.log('Data query result rows:', result.rows.length);

    // Transform the result to match the expected structure with new fields
    const mensHealth = result.rows.map((row: any) => ({
      id: row.id || `emp_${row.employee_id}`,
      employee_id: row.employee_id,
      employee_name: row.name,
      employee_surname: row.surname,
      report_id: row.report_id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,
      user_updated: row.user_updated,
      ever_diagnosed_with: row.ever_diagnosed_with,
      prostate_enlarged: row.prostate_enlarged,
      prostate_infection: row.prostate_infection,
      prostate_cancer: row.prostate_cancer,
      testes_growth: row.testes_growth,
      erections: row.erections,
      require_urologist: row.require_urologist,
      notes_header: row.notes_header,
      notes_text: row.notes_text,
      recommendation_text: row.recommendation_text,
    }));

    return NextResponse.json({
      mensHealth,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching men's health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch men's health data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employee_id,
      report_id,
      ever_diagnosed_with,
      prostate_enlarged,
      prostate_infection,
      prostate_cancer,
      testes_growth,
      erections,
      require_urologist,
      notes_header,
      notes_text,
      recommendation_text,
    } = body;

    const insertQuery = `
      INSERT INTO mens_health (
        employee_id, report_id, ever_diagnosed_with, prostate_enlarged, prostate_infection,
        prostate_cancer, testes_growth, erections, require_urologist, notes_header,
        notes_text, recommendation_text, date_created, user_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `;

    const params = [
      employee_id,
      report_id,
      ever_diagnosed_with,
      prostate_enlarged,
      prostate_infection,
      prostate_cancer,
      testes_growth,
      erections,
      require_urologist,
      notes_header,
      notes_text,
      recommendation_text,
      new Date(),
      'system',
    ];

    const result = await query(insertQuery, params);
    const newMenHealth = result.rows[0];

    return NextResponse.json(newMenHealth, { status: 201 });
  } catch (error) {
    console.error("Error creating men's health record:", error);
    return NextResponse.json(
      { error: "Failed to create men's health record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for update' },
        { status: 400 }
      );
    }

    const fields = Object.keys(updateData).filter(
      key => updateData[key] !== undefined
    );
    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');
    const updateQuery = `
      UPDATE mens_health 
      SET ${setClause}, date_updated = $1, user_updated = 'system'
      WHERE id = $${fields.length + 2}
      RETURNING *
    `;

    const params = [new Date(), ...fields.map(field => updateData[field]), id];
    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Men's health record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating men's health record:", error);
    return NextResponse.json(
      { error: "Failed to update men's health record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for deletion' },
        { status: 400 }
      );
    }

    const deleteQuery = 'DELETE FROM mens_health WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Men's health record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Men's health record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting men's health record:", error);
    return NextResponse.json(
      { error: "Failed to delete men's health record" },
      { status: 500 }
    );
  }
}
