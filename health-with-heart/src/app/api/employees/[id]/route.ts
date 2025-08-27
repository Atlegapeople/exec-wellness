import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employeeQuery = `
      SELECT 
        e.id,
        e.date_created,
        e.date_updated,
        uc.name || ' ' || uc.surname AS created_by,
        uu.name || ' ' || uu.surname AS updated_by,
        e.section_header,
        e.name,
        e.surname,
        e.id_number,
        e.passport_number,
        e.gender,
        e.date_of_birth,
        e.ethnicity,
        e.marriage_status,
        e.no_of_children,
        e.personal_email_address,
        e.mobile_number,
        e.section_header_2,
        e.medical_aid,
        e.medical_aid_number,
        e.main_member,
        e.main_member_name,
        e.section_header_3,
        e.work_email,
        e.employee_number,
        o.name AS organisation_name,
        s.name AS workplace_name,
        e.workplace AS workplace_id,
        e.organisation AS organisation_id,
        e.job,
        e.notes_header,
        e.notes_text,
        e.work_startdate
      FROM public.employee e
      LEFT JOIN public.users uc ON uc.id = e.user_created
      LEFT JOIN public.users uu ON uu.id = e.user_updated
      LEFT JOIN public.organisation o ON o.id = e.organisation
      LEFT JOIN public.sites s ON s.id = e.workplace
      WHERE e.id = $1
    `;

    const result = await query(employeeQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const employee = {
      id: row.id,
      date_created: row.date_created ? new Date(row.date_created) : undefined,
      date_updated: row.date_updated ? new Date(row.date_updated) : undefined,
      created_by: row.created_by,
      updated_by: row.updated_by,
      section_header: row.section_header || '',
      name: row.name,
      surname: row.surname,
      id_number: row.id_number,
      passport_number: row.passport_number,
      gender: row.gender,
      date_of_birth: row.date_of_birth
        ? new Date(row.date_of_birth)
        : undefined,
      ethnicity: row.ethnicity,
      marriage_status: row.marriage_status,
      no_of_children: row.no_of_children,
      personal_email_address: row.personal_email_address,
      mobile_number: row.mobile_number,
      section_header_2: row.section_header_2,
      medical_aid: row.medical_aid,
      medical_aid_number: row.medical_aid_number,
      main_member: row.main_member,
      main_member_name: row.main_member_name,
      section_header_3: row.section_header_3,
      work_email: row.work_email,
      employee_number: row.employee_number,
      organisation: row.organisation_id,
      organisation_name: row.organisation_name,
      workplace: row.workplace_id,
      workplace_name: row.workplace_name,
      job: row.job,
      notes_header: row.notes_header,
      notes_text: row.notes_text,
      work_startdate: row.work_startdate
        ? new Date(row.work_startdate)
        : undefined,
    };

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateQuery = `
      UPDATE employee SET
        date_updated = NOW(),
        user_updated = $2,
        section_header = $3,
        name = $4,
        surname = $5,
        id_number = $6,
        passport_number = $7,
        gender = $8,
        date_of_birth = $9,
        ethnicity = $10,
        marriage_status = $11,
        no_of_children = $12,
        personal_email_address = $13,
        mobile_number = $14,
        section_header_2 = $15,
        medical_aid = $16,
        medical_aid_number = $17,
        main_member = $18,
        main_member_name = $19,
        section_header_3 = $20,
        work_email = $21,
        employee_number = $22,
        organisation = $23,
        workplace = $24,
        job = $25,
        notes_header = $26,
        notes_text = $27,
        work_startdate = $28
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.section_header || '',
      body.name,
      body.surname,
      body.id_number,
      body.passport_number,
      body.gender,
      body.date_of_birth,
      body.ethnicity,
      body.marriage_status,
      body.no_of_children,
      body.personal_email_address,
      body.mobile_number,
      body.section_header_2 || '',
      body.medical_aid,
      body.medical_aid_number,
      body.main_member,
      body.main_member_name,
      body.section_header_3 || '',
      body.work_email,
      body.employee_number,
      body.organisation,
      body.workplace,
      body.job,
      body.notes_header || '',
      body.notes_text,
      body.work_startdate,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if employee has related records (medical reports, etc.)
    const relatedRecordsQuery = `
      SELECT 
        COUNT(mr.id) as medical_reports,
        COUNT(v.id) as vitals,
        COUNT(ce.id) as clinical_exams
      FROM employee e
      LEFT JOIN medical_report mr ON mr.employee_id = e.id
      LEFT JOIN vitals_clinical_metrics v ON v.employee_id = e.id
      LEFT JOIN clinical_examinations ce ON ce.employee_id = e.id
      WHERE e.id = $1
    `;

    const relatedResult = await query(relatedRecordsQuery, [id]);
    const relatedCounts = relatedResult.rows[0];

    if (
      relatedCounts.medical_reports > 0 ||
      relatedCounts.vitals > 0 ||
      relatedCounts.clinical_exams > 0
    ) {
      return NextResponse.json(
        {
          error: 'Cannot delete employee with existing medical records',
          details: {
            medical_reports: parseInt(relatedCounts.medical_reports),
            vitals: parseInt(relatedCounts.vitals),
            clinical_exams: parseInt(relatedCounts.clinical_exams),
          },
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM employee WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Employee deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
