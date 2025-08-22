import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { MedicalReport } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM medical_report mr
      WHERE mr.type = 'Executive Medical'
    `;
    const countResult = await query(countQuery);
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
      LEFT JOIN employee e ON mr.employee_id = e.id
      LEFT JOIN users u_doctor ON mr.doctor = u_doctor.id
      LEFT JOIN users u_nurse ON mr.nurse = u_nurse.id
      LEFT JOIN organisation org ON e.organisation = org.id
      WHERE mr.type = 'Executive Medical'
      ORDER BY mr.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(reportsQuery, [limit, offset]);

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
    const body = await request.json();
    const {
      type,
      sub_type,
      employee_id,
      doctor,
      nurse,
      site,
      report_work_status,
      notes_text,
      recommendation_text,
      employee_work_email,
      employee_personal_email,
      manager_email,
      doctor_email,
      line_manager,
      line_manager2,
    } = body;

    // Validate required fields
    if (!type || !employee_id) {
      return NextResponse.json(
        { error: 'Missing required fields: type and employee_id are required' },
        { status: 400 }
      );
    }

    // Generate UUID for the report
    const reportId = uuidv4();
    const currentDate = new Date();

    // Insert new medical report
    const insertQuery = `
      INSERT INTO medical_report (
        id,
        date_created,
        date_updated,
        user_created,
        user_updated,
        employee_id,
        site,
        type,
        sub_type,
        doctor,
        doctor_signoff,
        doctor_signature,
        nurse,
        nurse_signature,
        report_work_status,
        notes_text,
        recommendation_text,
        employee_work_email,
        employee_personal_email,
        manager_email,
        doctor_email,
        line_manager,
        line_manager2
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id
    `;

    const insertParams = [
      reportId,
      currentDate,
      currentDate,
      'system', // TODO: Replace with actual user ID from auth
      'system', // TODO: Replace with actual user ID from auth
      employee_id,
      site || null,
      type,
      sub_type || null,
      doctor || null,
      'No', // Default doctor signoff
      null, // Default doctor signature
      nurse || null,
      null, // Default nurse signature
      report_work_status || 'In Progress',
      notes_text || null,
      recommendation_text || null,
      employee_work_email || null,
      employee_personal_email || null,
      manager_email || null,
      doctor_email || null,
      line_manager || null,
      line_manager2 || null,
    ];

    const result = await query(insertQuery, insertParams);

    if (result.rows.length === 0) {
      throw new Error('Failed to insert medical report');
    }

    return NextResponse.json(
      {
        message: 'Medical report created successfully',
        report_id: result.rows[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medical report:', error);
    return NextResponse.json(
      { error: 'Failed to create medical report' },
      { status: 500 }
    );
  }
}
