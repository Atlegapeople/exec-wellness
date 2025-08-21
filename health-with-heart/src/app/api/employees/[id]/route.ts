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
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
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
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
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
      work_startdate: row.work_startdate ? new Date(row.work_startdate) : undefined
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
        employee_id_number = $6,
        cell_phone = $7,
        email = $8,
        date_of_birth = $9,
        gender = $10,
        id_number = $11,
        passport_number = $12,
        home_address = $13,
        postal_address = $14,
        postal_code = $15,
        home_phone = $16,
        work_phone = $17,
        emergency_contact_name = $18,
        emergency_contact_number = $19,
        relationship = $20,
        marital_status = $21,
        dependants = $22,
        employee_personal_email = $23,
        employee_work_email = $24,
        race = $25,
        home_language = $26,
        nationality = $27,
        religion = $28,
        disabilities = $29,
        medical_aid = $30,
        medical_aid_number = $31
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.section_header || '',
      body.name,
      body.surname,
      body.employee_id_number,
      body.cell_phone,
      body.email,
      body.date_of_birth,
      body.gender,
      body.id_number,
      body.passport_number,
      body.home_address,
      body.postal_address,
      body.postal_code,
      body.home_phone,
      body.work_phone,
      body.emergency_contact_name,
      body.emergency_contact_number,
      body.relationship,
      body.marital_status,
      body.dependants,
      body.employee_personal_email,
      body.employee_work_email,
      body.race,
      body.home_language,
      body.nationality,
      body.religion,
      body.disabilities,
      body.medical_aid,
      body.medical_aid_number
    ];

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
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

    if (relatedCounts.medical_reports > 0 || relatedCounts.vitals > 0 || relatedCounts.clinical_exams > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete employee with existing medical records',
          details: {
            medical_reports: parseInt(relatedCounts.medical_reports),
            vitals: parseInt(relatedCounts.vitals),
            clinical_exams: parseInt(relatedCounts.clinical_exams)
          }
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM employee WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee deleted successfully', id: result.rows[0].id });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}