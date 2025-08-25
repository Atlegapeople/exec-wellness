import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { EmergencyResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // First, check if the emergency_responses table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'emergency_responses'
      );
    `;

    const tableExists = await query(tableExistsQuery);
    if (!tableExists.rows[0].exists) {
      return NextResponse.json({
        emergencyResponses: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        message:
          'Emergency responses table does not exist yet. Please run the database schema first.',
      });
    }

    // Build search condition
    const searchCondition = search
      ? `AND (er.id ILIKE $3 OR er.employee_id ILIKE $3 OR er.report_id ILIKE $3 OR er.emergency_type ILIKE $3 OR er.main_complaint ILIKE $3 OR er.diagnosis ILIKE $3 OR er.place ILIKE $3)`
      : '';

    const countSearchCondition = search
      ? `AND (er.id ILIKE $1 OR er.employee_id ILIKE $1 OR er.report_id ILIKE $1 OR er.emergency_type ILIKE $1 OR er.main_complaint ILIKE $1 OR er.diagnosis ILIKE $1 OR er.place ILIKE $1)`
      : '';

    // Get total count - simplified query without complex joins
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM emergency_responses er
      WHERE 1=1
      ${countSearchCondition}
    `;

    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get emergency response records with simplified joins
    const emergencyResponsesQuery = `
      SELECT 
        er.id,
        er.date_created,
        er.date_updated,
        er.user_created,
        er.user_updated,
        er.report_id,
        er.employee_id,
        COALESCE(e.name, 'Unknown') as employee_name,
        COALESCE(e.surname, '') as employee_surname,
        COALESCE(e.work_email, '') as employee_work_email,
        er.injury_date,
        er.injury_time,
        er.arrival_time,
        er.location_id,
        er.place,
        er.emergency_type,
        er.injury,
        er.main_complaint,
        er.diagnosis,
        er.findings,
        er.intervention,
        er.patient_history,
        er.plan,
        er.outcome,
        er.reference,
        er.manager,
        er.sendemail
      FROM emergency_responses er
      LEFT JOIN employee e ON e.id = er.employee_id
      WHERE 1=1
      ${searchCondition}
      ORDER BY er.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search
      ? [limit, offset, `%${search}%`]
      : [limit, offset];

    const result = await query(emergencyResponsesQuery, queryParams);

    const emergencyResponses: EmergencyResponse[] = result.rows.map(
      (row: any) => ({
        id: row.id,
        date_created: row.date_created ? new Date(row.date_created) : undefined,
        date_updated: row.date_updated ? new Date(row.date_updated) : undefined,
        user_created: row.user_created,
        user_updated: row.user_updated,
        report_id: row.report_id,
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        employee_surname: row.employee_surname,
        employee_work_email: row.employee_work_email,
        injury_date: row.injury_date ? new Date(row.injury_date) : undefined,
        injury_time: row.injury_time,
        arrival_time: row.arrival_time,
        location_id: row.location_id,
        place: row.place,
        emergency_type: row.emergency_type,
        injury: row.injury,
        main_complaint: row.main_complaint,
        diagnosis: row.diagnosis,
        findings: row.findings,
        intervention: row.intervention,
        patient_history: row.patient_history,
        plan: row.plan,
        outcome: row.outcome,
        reference: row.reference,
        manager: row.manager,
        sendemail: row.sendemail,
      })
    );

    return NextResponse.json({
      emergencyResponses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching emergency responses:', error);

    // Provide more specific error information
    let errorMessage = 'Failed to fetch emergency responses';
    if (error.code === 'ECONNREFUSED') {
      errorMessage =
        'Database connection refused - check if database is running';
    } else if (error.code === '42P01') {
      errorMessage =
        'Table does not exist in database - please run the database schema first';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.code || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.employee_id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    if (!body.emergency_type) {
      return NextResponse.json(
        { error: 'Emergency type is required' },
        { status: 400 }
      );
    }

    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'emergency_responses'
      );
    `;

    const tableExists = await query(tableExistsQuery);
    if (!tableExists.rows[0].exists) {
      return NextResponse.json(
        {
          error:
            'Emergency responses table does not exist. Please run the database schema first.',
        },
        { status: 500 }
      );
    }

    const insertQuery = `
      INSERT INTO emergency_responses (
        id, date_created, date_updated, user_created, user_updated,
        report_id, employee_id, injury_date, injury_time, arrival_time,
        location_id, place, emergency_type, injury, main_complaint,
        diagnosis, findings, intervention, patient_history, plan,
        outcome, reference, manager, sendemail
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.report_id || null,
      body.employee_id,
      body.injury_date || null,
      body.injury_time || null,
      body.arrival_time || null,
      body.location_id || null,
      body.place || null,
      body.emergency_type,
      body.injury || null,
      body.main_complaint || null,
      body.diagnosis || null,
      body.findings || null,
      body.intervention || null,
      body.patient_history || null,
      body.plan || null,
      body.outcome || null,
      body.reference || null,
      body.manager || null,
      body.sendemail || null,
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating emergency response:', error);

    let errorMessage = 'Failed to create emergency response';
    if (error.code === '23505') {
      errorMessage =
        'Duplicate record - this emergency response already exists';
    } else if (error.code === '23503') {
      errorMessage = 'Invalid employee ID - employee does not exist';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.code || 'Unknown error' },
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
        { error: 'Emergency response ID is required' },
        { status: 400 }
      );
    }

    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'emergency_responses'
      );
    `;

    const tableExists = await query(tableExistsQuery);
    if (!tableExists.rows[0].exists) {
      return NextResponse.json(
        {
          error:
            'Emergency responses table does not exist. Please run the database schema first.',
        },
        { status: 500 }
      );
    }

    // Check if record exists
    const checkQuery = 'SELECT id FROM emergency_responses WHERE id = $1';
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Emergency response not found' },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE emergency_responses SET
        date_updated = NOW(),
        user_updated = $2,
        report_id = $3,
        employee_id = $4,
        injury_date = $5,
        injury_time = $6,
        arrival_time = $7,
        location_id = $8,
        place = $9,
        emergency_type = $10,
        injury = $11,
        main_complaint = $12,
        diagnosis = $13,
        findings = $14,
        intervention = $15,
        patient_history = $16,
        plan = $17,
        outcome = $18,
        reference = $19,
        manager = $20,
        sendemail = $21
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      updateData.user_updated || 'system',
      updateData.report_id || null,
      updateData.employee_id,
      updateData.injury_date || null,
      updateData.injury_time || null,
      updateData.arrival_time || null,
      updateData.location_id || null,
      updateData.place || null,
      updateData.emergency_type,
      updateData.injury || null,
      updateData.main_complaint || null,
      updateData.diagnosis || null,
      updateData.findings || null,
      updateData.intervention || null,
      updateData.patient_history || null,
      updateData.plan || null,
      updateData.outcome || null,
      updateData.reference || null,
      updateData.manager || null,
      updateData.sendemail || null,
    ];

    const result = await query(updateQuery, values);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating emergency response:', error);

    let errorMessage = 'Failed to update emergency response';
    if (error.code === '23503') {
      errorMessage = 'Invalid employee ID - employee does not exist';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.code || 'Unknown error' },
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
        { error: 'Emergency response ID is required' },
        { status: 400 }
      );
    }

    // Check if table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'emergency_responses'
      );
    `;

    const tableExists = await query(tableExistsQuery);
    if (!tableExists.rows[0].exists) {
      return NextResponse.json(
        {
          error:
            'Emergency responses table does not exist. Please run the database schema first.',
        },
        { status: 500 }
      );
    }

    const deleteQuery =
      'DELETE FROM emergency_responses WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Emergency response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Emergency response deleted successfully',
      deleted: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error deleting emergency response:', error);

    let errorMessage = 'Failed to delete emergency response';
    if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.code || 'Unknown error' },
      { status: 500 }
    );
  }
}
