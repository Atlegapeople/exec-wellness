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
    const total = parseInt(countResult.rows[0].total);

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
    if (!reportData.employee_id || !reportData.type) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Employee ID and type are required' },
        { status: 400 }
      );
    }

    // Validate employee_id format (should be a valid UUID or string)
    if (
      typeof reportData.employee_id !== 'string' ||
      reportData.employee_id.trim() === ''
    ) {
      console.log('Validation failed: invalid employee_id format');
      return NextResponse.json(
        { error: 'Employee ID must be a valid string' },
        { status: 400 }
      );
    }

    // Set default values and only include fields that exist in the table
    const now = new Date().toISOString();
    const insertData = {
      employee_id: reportData.employee_id,
      type: reportData.type || 'Executive Medical',
      sub_type: reportData.sub_type || 'Initial',
      doctor: reportData.doctor || null,
      nurse: reportData.nurse || null,
      workplace: reportData.workplace || null,
      line_manager: reportData.line_manager || null,
      line_manager2: reportData.line_manager2 || null,
      notes_text: reportData.notes_text || null,
      recommendation_text: reportData.recommendation_text || null,
      manager_email: reportData.manager_email || null,
      employee_work_email: reportData.employee_work_email || null,
      employee_personal_email: reportData.employee_personal_email || null,
      doctor_email: reportData.doctor_email || null,
      date_created: now,
      date_updated: now,
      user_created: reportData.user_created || 'system',
      user_updated: reportData.user_updated || 'system',
      doctor_signoff: reportData.doctor_signoff || 'No',
      report_work_status: reportData.report_work_status || 'Draft',
      // Set default values for required fields that might not be in the form
      site: null,
      doctor_signature: null,
      nurse_signature: null,
      email_certificate: 0, // Use integer 0 instead of boolean false
      email_report: 0, // Use integer 0 instead of boolean false
      certificate_send_count: 0,
      report_send_count: 0,
      email_certificate_manager: 0, // Use integer 0 instead of boolean false
      certificate_send_count_manager: 0,
      column_1: null,
      column_2: null,
      column_3: null,
      column_4: null,
      column_5: null,
      column_6: null,
      column_7: null,
    };

    console.log('Prepared insert data:', insertData);

    // Sanitize data types to ensure compatibility with database schema
    const sanitizedData = {
      ...insertData,
      // Ensure numeric fields are integers
      email_certificate: Number(insertData.email_certificate) || 0,
      email_report: Number(insertData.email_report) || 0,
      certificate_send_count: Number(insertData.certificate_send_count) || 0,
      report_send_count: Number(insertData.report_send_count) || 0,
      email_certificate_manager:
        Number(insertData.email_certificate_manager) || 0,
      certificate_send_count_manager:
        Number(insertData.certificate_send_count_manager) || 0,
      // Ensure doctor and nurse are either valid UUIDs or null
      doctor: insertData.doctor || null,
      nurse: insertData.nurse || null,
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
      INSERT INTO medical_report (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    console.log('Insert query:', insertQuery);
    console.log('Insert values:', values);

    // Test database connection first
    try {
      const testResult = await query(
        'SELECT COUNT(*) as count FROM medical_report'
      );
      console.log(
        'Database connection test successful, table has',
        testResult.rows[0].count,
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
    const testQuery = 'SELECT COUNT(*) as count FROM medical_report';
    const result = await query(testQuery, []);

    return NextResponse.json({
      message: 'Database connection successful',
      tableExists: true,
      recordCount: result.rows[0].count,
      tableName: 'medical_report',
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
