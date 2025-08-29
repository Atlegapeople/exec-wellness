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

    // Base query to get employees with Executive Medical reports
    const baseQuery = `
      SELECT e.name, w.employee_id
      FROM employee e
      LEFT JOIN womens_health w ON e.id = w.employee_id
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

    // Transform the result to match the expected structure
    const womensHealth = result.rows.map((row: any) => ({
      id: row.employee_id || `emp_${row.employee_id}`,
      employee_id: row.employee_id,
      employee_name: row.name,
      employee_surname: null, // Not returned by the query
      employee_work_email: null, // Not returned by the query
      // Add default values for women's health fields
      breast_exam: null,
      breast_findings: null,
      pap_smear: null,
      pap_smear_result: null,
      mammogram: null,
      mammogram_result: null,
      gynecological_exam: null,
      gynecological_findings: null,
      menstrual_health: null,
      pregnancy_status: null,
      family_planning: null,
      fertility_concerns: null,
      menopause_status: null,
      bone_health: null,
      osteoporosis_screening: null,
      heart_disease_risk: null,
      blood_pressure: null,
      cholesterol_level: null,
      diabetes_risk: null,
      stress_level: null,
      anxiety_level: null,
      depression_screening: null,
      sleep_quality: null,
      energy_level: null,
      sexual_health: null,
      sexual_concerns: null,
      exercise_frequency: null,
      diet_quality: null,
      alcohol_consumption: null,
      smoking_status: null,
      weight_management: null,
      cancer_screening: null,
      vaccination_status: null,
      dental_health: null,
      vision_health: null,
      hearing_health: null,
      workplace_stress: null,
      ergonomic_issues: null,
      chemical_exposure: null,
      physical_demands: null,
      notes_text: null,
      recommendation_text: null,
      date_created: new Date(),
      date_updated: new Date(),
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
      breast_exam,
      breast_findings,
      pap_smear,
      pap_smear_result,
      mammogram,
      mammogram_result,
      gynecological_exam,
      gynecological_findings,
      menstrual_health,
      pregnancy_status,
      family_planning,
      fertility_concerns,
      menopause_status,
      bone_health,
      osteoporosis_screening,
      heart_disease_risk,
      blood_pressure,
      cholesterol_level,
      diabetes_risk,
      stress_level,
      anxiety_level,
      depression_screening,
      sleep_quality,
      energy_level,
      sexual_health,
      sexual_concerns,
      exercise_frequency,
      diet_quality,
      alcohol_consumption,
      smoking_status,
      weight_management,
      cancer_screening,
      vaccination_status,
      dental_health,
      vision_health,
      hearing_health,
      workplace_stress,
      ergonomic_issues,
      chemical_exposure,
      physical_demands,
      notes_text,
      recommendation_text,
    } = body;

    const insertQuery = `
      INSERT INTO womens_health (
        employee_id, report_id, breast_exam, breast_findings, pap_smear, pap_smear_result,
        mammogram, mammogram_result, gynecological_exam, gynecological_findings,
        menstrual_health, pregnancy_status, family_planning, fertility_concerns,
        menopause_status, bone_health, osteoporosis_screening, heart_disease_risk,
        blood_pressure, cholesterol_level, diabetes_risk, stress_level, anxiety_level,
        depression_screening, sleep_quality, energy_level, sexual_health, sexual_concerns,
        exercise_frequency, diet_quality, alcohol_consumption, smoking_status,
        weight_management, cancer_screening, vaccination_status, dental_health,
        vision_health, hearing_health, workplace_stress, ergonomic_issues,
        chemical_exposure, physical_demands, notes_text, recommendation_text,
        date_created, user_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
      ) RETURNING *
    `;

    const params = [
      employee_id,
      report_id,
      breast_exam,
      breast_findings,
      pap_smear,
      pap_smear_result,
      mammogram,
      mammogram_result,
      gynecological_exam,
      gynecological_findings,
      menstrual_health,
      pregnancy_status,
      family_planning,
      fertility_concerns,
      menopause_status,
      bone_health,
      osteoporosis_screening,
      heart_disease_risk,
      blood_pressure,
      cholesterol_level,
      diabetes_risk,
      stress_level,
      anxiety_level,
      depression_screening,
      sleep_quality,
      energy_level,
      sexual_health,
      sexual_concerns,
      exercise_frequency,
      diet_quality,
      alcohol_consumption,
      smoking_status,
      weight_management,
      cancer_screening,
      vaccination_status,
      dental_health,
      vision_health,
      hearing_health,
      workplace_stress,
      ergonomic_issues,
      chemical_exposure,
      physical_demands,
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
