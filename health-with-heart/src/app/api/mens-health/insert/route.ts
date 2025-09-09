import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

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

    // Validate required fields
    if (!employee_id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    if (!report_id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Check if a record already exists for this employee and report
    const checkExistingQuery = `
      SELECT id FROM mens_health 
      WHERE employee_id = $1 AND report_id = $2
    `;

    const existingResult = await query(checkExistingQuery, [
      employee_id,
      report_id,
    ]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "A men's health record already exists for this employee and report",
          existingId: (existingResult.rows[0] as { id: string }).id,
        },
        { status: 409 }
      );
    }

    // Insert new record
    const insertQuery = `
      INSERT INTO mens_health (
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
        date_created, 
        user_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `;

    const params = [
      employee_id,
      report_id,
      ever_diagnosed_with || null,
      prostate_enlarged || null,
      prostate_infection || null,
      prostate_cancer || null,
      testes_growth || null,
      erections || null,
      require_urologist || null,
      notes_header || null,
      notes_text || null,
      recommendation_text || null,
      new Date(),
      'system',
    ];

    const result = await query(insertQuery, params);
    const newMenHealth = result.rows[0];

    // Get employee name for response
    const employeeQuery = `
      SELECT name, surname FROM employee WHERE id = $1
    `;
    const employeeResult = await query(employeeQuery, [employee_id]);
    const employeeName = employeeResult.rows[0]
      ? `${(employeeResult.rows[0] as { name: string }).name} ${(employeeResult.rows[0] as { surname: string }).surname}`
      : 'Unknown Employee';

    return NextResponse.json(
      {
        message: "Men's health record created successfully",
        record: newMenHealth,
        employeeName: employeeName,
        created: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating men's health record:", error);
    return NextResponse.json(
      { error: "Failed to create men's health record" },
      { status: 500 }
    );
  }
}
