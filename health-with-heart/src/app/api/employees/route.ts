import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Employee } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const employee = searchParams.get('employee') || '';
    const offset = (page - 1) * limit;

    // Build search condition - only for employees with Executive Medical reports
    let searchCondition = '';
    let countSearchCondition = '';
    let queryParams: (string | number)[] = [];

    if (employee) {
      searchCondition = `AND e.id = $3`;
      countSearchCondition = `AND e.id = $1`;
      queryParams = [employee];
    } else if (search) {
      searchCondition = `AND (e.name ILIKE $3 OR e.surname ILIKE $3 OR e.work_email ILIKE $3 OR e.employee_number ILIKE $3)`;
      countSearchCondition = `AND (e.name ILIKE $1 OR e.surname ILIKE $1 OR e.work_email ILIKE $1 OR e.employee_number ILIKE $1)`;
      queryParams = [`%${search}%`];
    } else {
      searchCondition = '';
      countSearchCondition = '';
      queryParams = [];
    }

    const countQuery = `
      SELECT COUNT(DISTINCT e.id) as total 
      FROM employee e
      INNER JOIN medical_report mr ON mr.employee_id = e.id
      WHERE mr.type = 'Executive Medical'
      ${countSearchCondition}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get employees with resolved workplace and organisation names - only those with Executive Medical reports
    const employeesQuery = `
      SELECT DISTINCT
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
        e.work_startdate,
        COALESCE(mc.manager_count, 0) AS manager_count
      FROM public.employee e
      INNER JOIN medical_report mr ON mr.employee_id = e.id
      LEFT JOIN public.users uc 
             ON uc.id = e.user_created
      LEFT JOIN public.users uu 
             ON uu.id = e.user_updated
      LEFT JOIN public.organisation o 
             ON o.id = e.organisation
      LEFT JOIN public.sites s 
             ON s.id = e.workplace
      LEFT JOIN (
        SELECT 
          organisation_id,
          COUNT(*) AS manager_count
        FROM managers
        WHERE organisation_id IS NOT NULL
        GROUP BY organisation_id
      ) mc ON mc.organisation_id = e.organisation
      WHERE mr.type = 'Executive Medical'
      ${searchCondition}
      ORDER BY e.surname, e.name
      LIMIT $1 OFFSET $2
    `;

    let queryParamsForEmployees: (string | number)[] = [];
    if (employee) {
      queryParamsForEmployees = [limit, offset, employee];
    } else if (search) {
      queryParamsForEmployees = [limit, offset, `%${search}%`];
    } else {
      queryParamsForEmployees = [limit, offset];
    }

    const result = await query(employeesQuery, queryParamsForEmployees);

    const employees: Employee[] = result.rows.map((row: any) => ({
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
      manager_count: parseInt(row.manager_count || 0),
    }));

    return NextResponse.json({
      employees,
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
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO employee (
        id, date_created, date_updated, user_created, user_updated,
        section_header, name, surname, id_number, passport_number,
        gender, date_of_birth, ethnicity, marriage_status, no_of_children,
        personal_email_address, mobile_number, section_header_2,
        medical_aid, medical_aid_number, main_member, main_member_name,
        section_header_3, work_email, employee_number, organisation,
        workplace, job, notes_header, notes_text, work_startdate
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
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

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
