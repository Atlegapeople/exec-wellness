import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { MedicalReport } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const organization = searchParams.get('organization') || '';
    const site = searchParams.get('site') || '';
    const costCenter = searchParams.get('costCenter') || '';
    const employee = searchParams.get('employee') || '';
    const offset = (page - 1) * limit;

    // Build filter conditions
    let filterCondition = '';
    let countQuery = '';
    let countParams: (string | number)[] = [];
    let queryParams: (string | number)[] = [limit, offset];

    if (employee) {
      filterCondition = 'AND mr.employee_id = $3';
      countQuery = `
        SELECT COUNT(*) as total 
        FROM medical_report mr
        WHERE mr.type = 'Executive Medical' AND mr.employee_id = $1
      `;
      countParams = [employee];
      queryParams = [limit, offset, employee];
    } else if (organization) {
      filterCondition = 'AND s.organisation_id = $3';
      countQuery = `
        SELECT COUNT(*) as total 
        FROM medical_report mr
        LEFT JOIN sites s ON mr.site = s.id
        WHERE mr.type = 'Executive Medical' AND s.organisation_id = $1
      `;
      countParams = [organization];
      queryParams = [limit, offset, organization];
    } else if (site) {
      filterCondition = 'AND mr.site = $3';
      countQuery = `
        SELECT COUNT(*) as total 
        FROM medical_report mr
        WHERE mr.type = 'Executive Medical' AND mr.site = $1
      `;
      countParams = [site];
      queryParams = [limit, offset, site];
    } else if (costCenter) {
      filterCondition = 'AND e.workplace = $3';
      countQuery = `
        SELECT COUNT(*) as total 
        FROM medical_report mr
        LEFT JOIN employee e ON mr.employee_id = e.id
        WHERE mr.type = 'Executive Medical' AND e.workplace = $1
      `;
      countParams = [costCenter];
      queryParams = [limit, offset, costCenter];
    } else {
      countQuery = `
        SELECT COUNT(*) as total 
        FROM medical_report mr
        WHERE mr.type = 'Executive Medical'
      `;
      countParams = [];
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as any).total);

    const reportsQuery = `
      SELECT 
        mr.id,
        mr.date_created,
        mr.date_updated,
        mr.user_created,
        mr.user_updated,
        mr.employee_id,
        mr.site,
        mr.type,
        mr.sub_type,
        mr.doctor,
        mr.doctor_signoff,
        mr.doctor_signature,
        mr.nurse,
        mr.nurse_signature,
        mr.report_work_status,
        mr.notes_text,
        mr.recommendation_text,
        mr.email_certificate,
        mr.email_report,
        mr.certificate_send_count,
        mr.report_send_count,
        mr.email_certificate_manager,
        mr.certificate_send_count_manager,
        mr.employee_work_email,
        mr.employee_personal_email,
        mr.manager_email,
        mr.doctor_email,
        mr.workplace,
        mr.line_manager,
        mr.line_manager2,
        mr.column_1,
        mr.column_2,
        mr.column_3,
        mr.column_4,
        mr.column_5,
        mr.column_6,
        mr.column_7,
        e.name as employee_name,
        e.surname as employee_surname,
        u_doctor.name as doctor_name,
        u_doctor.surname as doctor_surname,
        u_nurse.name as nurse_name,
        u_nurse.surname as nurse_surname,
        org.name as workplace_name
      FROM medical_report mr
      LEFT JOIN sites s ON mr.site = s.id
      LEFT JOIN employee e ON mr.employee_id = e.id
      LEFT JOIN users u_doctor ON mr.doctor = u_doctor.id
      LEFT JOIN users u_nurse ON mr.nurse = u_nurse.id
      LEFT JOIN organisation org ON s.organisation_id = org.id
      WHERE mr.type = 'Executive Medical' ${filterCondition}
      ORDER BY mr.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(reportsQuery, queryParams);

    const reports: any[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: new Date(row.date_created),
      date_updated: new Date(row.date_updated),
      user_created: row.user_created,
      user_updated: row.user_updated,
      employee_id: row.employee_id,
      site: row.site,
      type: row.type,
      sub_type: row.sub_type,
      doctor: row.doctor,
      doctor_signoff: row.doctor_signoff,
      doctor_signature: row.doctor_signature,
      nurse: row.nurse,
      nurse_signature: row.nurse_signature,
      report_work_status: row.report_work_status,
      notes_text: row.notes_text,
      recommendation_text: row.recommendation_text,
      email_certificate: row.email_certificate,
      email_report: row.email_report,
      certificate_send_count: row.certificate_send_count,
      report_send_count: row.report_send_count,
      email_certificate_manager: row.email_certificate_manager,
      certificate_send_count_manager: row.certificate_send_count_manager,
      employee_work_email: row.employee_work_email,
      employee_personal_email: row.employee_personal_email,
      manager_email: row.manager_email,
      doctor_email: row.doctor_email,
      workplace: row.workplace,
      line_manager: row.line_manager,
      line_manager2: row.line_manager2,
      column_1: row.column_1,
      column_2: row.column_2,
      column_3: row.column_3,
      column_4: row.column_4,
      column_5: row.column_5,
      column_6: row.column_6,
      column_7: row.column_7,
      employee_name: row.employee_name,
      employee_surname: row.employee_surname,
      doctor_name: row.doctor_name,
      doctor_surname: row.doctor_surname,
      nurse_name: row.nurse_name,
      nurse_surname: row.nurse_surname,
      workplace_name: row.workplace_name,
    }));

    return NextResponse.json({
      reports,
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
    console.error('Error fetching medical reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/reports called');

    const reportData = await request.json();
    console.log('Received report data:', reportData);

    // Validate required fields
    if (
      !reportData.patient_id ||
      !reportData.appointment_id ||
      !reportData.doctor_id
    ) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Patient ID, Appointment ID, and Doctor ID are required' },
        { status: 400 }
      );
    }

    // Validate UUID format for required fields
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(reportData.patient_id)) {
      console.log('Validation failed: invalid patient_id format');
      return NextResponse.json(
        { error: 'Patient ID must be a valid UUID' },
        { status: 400 }
      );
    }

    if (!uuidRegex.test(reportData.appointment_id)) {
      console.log('Validation failed: invalid appointment_id format');
      return NextResponse.json(
        { error: 'Appointment ID must be a valid UUID' },
        { status: 400 }
      );
    }

    if (!uuidRegex.test(reportData.doctor_id)) {
      console.log('Validation failed: invalid doctor_id format');
      return NextResponse.json(
        { error: 'Doctor ID must be a valid UUID' },
        { status: 400 }
      );
    }

    // Set default values for the medical_reports table
    const now = new Date().toISOString();

    const insertData = {
      id: reportData.report_id || null, // Use report_id as the primary key if provided
      patient_id: reportData.patient_id,
      appointment_id: reportData.appointment_id,
      doctor_id: reportData.doctor_id,
      report_title: reportData.report_title || 'Executive Medical Report',
      executive_summary: reportData.executive_summary || null,
      clinical_findings: reportData.clinical_findings || null,
      assessment: reportData.assessment || null,
      recommendations: reportData.recommendations || null,
      follow_up_required: reportData.follow_up_required || false,
      follow_up_notes: reportData.follow_up_notes || null,
      status: reportData.status || 'draft',
      current_workflow_step:
        reportData.current_workflow_step || 'data_collection',
      pdf_url: reportData.pdf_url || null,
      pdf_generated_at: reportData.pdf_generated_at || null,
      pdf_version: reportData.pdf_version || '1.0',
      signed_by: reportData.signed_by || null,
      signed_at: reportData.signed_at || null,
      signature_data: reportData.signature_data || null,
      created_at: now,
      updated_at: now,
      locked_at: reportData.locked_at || null,
    };

    console.log('Prepared insert data:', insertData);

    // Sanitize data types to ensure compatibility with database schema
    const sanitizedData = {
      ...insertData,
      // Ensure boolean fields are properly formatted
      follow_up_required: Boolean(insertData.follow_up_required),
      // Ensure timestamps are properly formatted
      created_at: insertData.created_at,
      updated_at: insertData.updated_at,
      signed_at: insertData.signed_at || null,
      locked_at: insertData.locked_at || null,
      pdf_generated_at: insertData.pdf_generated_at || null,
    };

    console.log('Sanitized insert data:', sanitizedData);

    // Log data types for debugging
    console.log('Data types:');
    Object.entries(sanitizedData).forEach(([key, value]) => {
      console.log(`  ${key}: ${typeof value} = ${value}`);
    });

    // Build insert query
    const fields = Object.keys(sanitizedData);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const values = Object.values(sanitizedData);

    const insertQuery = `
      INSERT INTO medical_reports (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    console.log('Insert query:', insertQuery);
    console.log('Insert values:', values);
    console.log('Fields being inserted:', fields);
    console.log('Number of fields:', fields.length);
    console.log('Number of values:', values.length);

    // Test database connection first
    try {
      const testResult = await query(
        'SELECT COUNT(*) as count FROM medical_reports'
      );
      console.log(
        'Database connection test successful, table has',
        (testResult.rows[0] as any).count,
        'records'
      );
    } catch (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json(
        { error: `Database connection failed: ${testError.message}` },
        { status: 500 }
      );
    }

    const result = await query(insertQuery, values);
    console.log('Insert successful, result:', result.rows[0]);

    return NextResponse.json(
      {
        message: 'Medical report created successfully',
        report: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medical report:', error);

    // Provide more specific error messages for common database issues
    let errorMessage = error.message;
    if (error.message.includes('invalid input syntax for type integer')) {
      errorMessage =
        'Data type mismatch: Some fields expect numeric values but received text';
    } else if (
      error.message.includes('column') &&
      error.message.includes('does not exist')
    ) {
      errorMessage =
        'Database schema mismatch: Some fields do not exist in the table';
    } else if (error.message.includes('violates not-null constraint')) {
      errorMessage =
        'Missing required field: Some required fields are not provided';
    }

    return NextResponse.json(
      { error: `Failed to create medical report: ${errorMessage}` },
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
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Check if report exists
    const checkQuery = 'SELECT id FROM medical_report WHERE id = $1';
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete the report
    const deleteQuery = 'DELETE FROM medical_report WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    return NextResponse.json({
      message: 'Medical report deleted successfully',
      report: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting medical report:', error);
    return NextResponse.json(
      { error: `Failed to delete medical report: ${error.message}` },
      { status: 500 }
    );
  }
}

// Test endpoint to check database connection and table structure
export async function PATCH(request: NextRequest) {
  try {
    // Test database connection
    const testQuery = 'SELECT COUNT(*) as count FROM medical_reports';
    const result = await query(testQuery, []);

    return NextResponse.json({
      message: 'Database connection successful',
      tableExists: true,
      recordCount: (result.rows[0] as any).count,
      tableName: 'medical_reports',
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      {
        message: 'Database connection failed',
        error: error.message,
        tableExists: false,
      },
      { status: 500 }
    );
  }
}
