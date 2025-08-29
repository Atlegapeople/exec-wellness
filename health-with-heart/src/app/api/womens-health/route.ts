import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

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
      SELECT e.name, e.surname, w.id, w.date_created, w.date_updated, w.user_created, w.report_id,
      w.employee_id, w.gynaecological_symptoms, w.yes_gynaecological_symptoms, w.pap_header, w.are_you_header, w.hormonal_contraception,
      w.hormonel_replacement_therapy, w.pregnant, w.pregnant_weeks, w.breastfeeding, w.concieve, w.last_pap, w.pap_date,
      w.pap_result, w.require_pap, w.breast_symptoms, w.breast_symptoms_yes, w.mammogram_result, 
      w.last_mammogram, w.breast_problems, w.require_mamogram, w.notes_header, w.notes_text, w.recommendation_text
      FROM employee e
      LEFT JOIN womens_health w 
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
      const searchCondition = `AND (e.id ILIKE $${paramIndex} OR e.name ILIKE $${paramIndex} OR e.surname ILIKE $${paramIndex})`;
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

    // Transform the result to match the new structure
    const womensHealth = result.rows.map((row: any) => ({
      id: row.id || `emp_${row.employee_id}`,
      employee_id: row.employee_id,
      employee_name: row.name,
      employee_surname: row.surname,
      report_id: row.report_id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,

      // Women's health specific fields from the new query
      gynaecological_symptoms: row.gynaecological_symptoms,
      yes_gynaecological_symptoms: row.yes_gynaecological_symptoms,
      pap_header: row.pap_header,
      are_you_header: row.are_you_header,
      hormonal_contraception: row.hormonal_contraception,
      hormonel_replacement_therapy: row.hormonel_replacement_therapy,
      pregnant: row.pregnant,
      pregnant_weeks: row.pregnant_weeks,
      breastfeeding: row.breastfeeding,
      concieve: row.concieve,
      last_pap: row.last_pap,
      pap_date: row.pap_date,
      pap_result: row.pap_result,
      require_pap: row.require_pap,
      breast_symptoms: row.breast_symptoms,
      breast_symptoms_yes: row.breast_symptoms_yes,
      mammogram_result: row.mammogram_result,
      last_mammogram: row.last_mammogram,
      breast_problems: row.breast_problems,
      require_mamogram: row.require_mamogram,
      notes_header: row.notes_header,
      notes_text: row.notes_text,
      recommendation_text: row.recommendation_text,
    }));

    return NextResponse.json({
      womensHealth,
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
    console.error("Error fetching women's health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch women's health data" },
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
      gynaecological_symptoms,
      yes_gynaecological_symptoms,
      pap_header,
      are_you_header,
      hormonal_contraception,
      hormonel_replacement_therapy,
      pregnant,
      pregnant_weeks,
      breastfeeding,
      concieve,
      last_pap,
      pap_date,
      pap_result,
      require_pap,
      breast_symptoms,
      breast_symptoms_yes,
      mammogram_result,
      last_mammogram,
      breast_problems,
      require_mamogram,
      notes_header,
      notes_text,
      recommendation_text,
    } = body;

    const insertQuery = `
      INSERT INTO womens_health (
        employee_id, report_id, gynaecological_symptoms, yes_gynaecological_symptoms,
        pap_header, are_you_header, hormonal_contraception, hormonel_replacement_therapy,
        pregnant, pregnant_weeks, breastfeeding, concieve, last_pap, pap_date,
        pap_result, require_pap, breast_symptoms, breast_symptoms_yes, mammogram_result,
        last_mammogram, breast_problems, require_mamogram, notes_header, notes_text,
        recommendation_text, date_created, user_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *
    `;

    const params = [
      employee_id,
      report_id,
      gynaecological_symptoms,
      yes_gynaecological_symptoms,
      pap_header,
      are_you_header,
      hormonal_contraception,
      hormonel_replacement_therapy,
      pregnant,
      pregnant_weeks,
      breastfeeding,
      concieve,
      last_pap,
      pap_date,
      pap_result,
      require_pap,
      breast_symptoms,
      breast_symptoms_yes,
      mammogram_result,
      last_mammogram,
      breast_problems,
      require_mamogram,
      notes_header,
      notes_text,
      recommendation_text,
      new Date(),
      'system',
    ];

    const result = await query(insertQuery, params);
    const newWomensHealth = result.rows[0];

    return NextResponse.json(newWomensHealth, { status: 201 });
  } catch (error) {
    console.error("Error creating women's health record:", error);
    return NextResponse.json(
      { error: "Failed to create women's health record" },
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
      UPDATE womens_health 
      SET ${setClause}, date_updated = $1, user_updated = 'system'
      WHERE id = $${fields.length + 2}
      RETURNING *
    `;

    const params = [new Date(), ...fields.map(field => updateData[field]), id];
    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Women's health record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating women's health record:", error);
    return NextResponse.json(
      { error: "Failed to update women's health record" },
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

    const deleteQuery = 'DELETE FROM womens_health WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Women's health record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Women's health record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting women's health record:", error);
    return NextResponse.json(
      { error: "Failed to delete women's health record" },
      { status: 500 }
    );
  }
}
