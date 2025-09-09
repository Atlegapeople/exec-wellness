import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface CostCenter {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string | null;
  user_updated: string | null;
  organisation_id: string | null;
  department: string | null;
  cost_center: string | null;
  workplace_address: string | null;
  manager_name: string | null;
  manager_email: string | null;
  manager_contact_number: string | null;
  manager_responsible: boolean | null;
  person_responsible_for_account: string | null;
  person_responsible_for_account_email: string | null;
  notes_text: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  organisation_name?: string;
  employee_count?: number;
  medical_report_count?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const organization = searchParams.get('organization') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    let searchCondition = '';
    let countSearchCondition = '';

    if (search && organization) {
      searchCondition = `WHERE (ew.department ILIKE $4 OR ew.cost_center ILIKE $4 OR ew.manager_name ILIKE $4 OR ew.manager_email ILIKE $4) AND ew.organisation_id = $3`;
      countSearchCondition = `WHERE (ew.department ILIKE $2 OR ew.cost_center ILIKE $2 OR ew.manager_name ILIKE $2 OR ew.manager_email ILIKE $2) AND ew.organisation_id = $1`;
    } else if (search) {
      searchCondition = `WHERE (ew.department ILIKE $3 OR ew.cost_center ILIKE $3 OR ew.manager_name ILIKE $3 OR ew.manager_email ILIKE $3)`;
      countSearchCondition = `WHERE (ew.department ILIKE $1 OR ew.cost_center ILIKE $1 OR ew.manager_name ILIKE $1 OR ew.manager_email ILIKE $1)`;
    } else if (organization) {
      searchCondition = `WHERE ew.organisation_id = $3`;
      countSearchCondition = `WHERE ew.organisation_id = $1`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM employee_workplace ew
      ${countSearchCondition}
    `;

    let countParams: (string | number)[] = [];
    if (search && organization) {
      countParams = [organization, `%${search}%`];
    } else if (search) {
      countParams = [`%${search}%`];
    } else if (organization) {
      countParams = [organization];
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt((countResult.rows[0] as { total: string }).total);

    // Get cost centers with creator/updater names, organization names, employee counts, and medical report counts
    const costCentersQuery = `
      SELECT 
        ew.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        o.name AS organisation_name,
        COALESCE(emp_counts.employee_count, 0) AS employee_count,
        COALESCE(mr_counts.report_count, 0) AS medical_report_count
      FROM employee_workplace ew
      LEFT JOIN users uc ON uc.id = ew.user_created
      LEFT JOIN users uu ON uu.id = ew.user_updated
      LEFT JOIN organisation o ON o.id = ew.organisation_id
      LEFT JOIN (
        SELECT 
          e.workplace,
          COUNT(*) AS employee_count
        FROM employee e
        WHERE e.workplace IS NOT NULL 
          AND e.id IN (
            SELECT employee_id
            FROM medical_report
            WHERE type = 'Executive Medical'
          )
        GROUP BY e.workplace
      ) emp_counts ON emp_counts.workplace = ew.id
      LEFT JOIN (
        SELECT 
          e.workplace,
          COUNT(*) AS report_count
        FROM employee e
        INNER JOIN medical_report mr ON mr.employee_id = e.id
        WHERE e.workplace IS NOT NULL 
          AND mr.type = 'Executive Medical'
        GROUP BY e.workplace
      ) mr_counts ON mr_counts.workplace = ew.id
      ${searchCondition}
      ORDER BY ew.department ASC, ew.cost_center ASC, ew.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    let queryParams: (string | number)[] = [];
    if (search && organization) {
      queryParams = [limit, offset, organization, `%${search}%`];
    } else if (search) {
      queryParams = [limit, offset, `%${search}%`];
    } else if (organization) {
      queryParams = [limit, offset, organization];
    } else {
      queryParams = [limit, offset];
    }

    const result = await query(costCentersQuery, queryParams);

    const costCenters: CostCenter[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,
      user_updated: row.user_updated,
      organisation_id: row.organisation_id,
      department: row.department,
      cost_center: row.cost_center,
      workplace_address: row.workplace_address,
      manager_name: row.manager_name,
      manager_email: row.manager_email,
      manager_contact_number: row.manager_contact_number,
      manager_responsible: row.manager_responsible,
      person_responsible_for_account: row.person_responsible_for_account,
      person_responsible_for_account_email:
        row.person_responsible_for_account_email,
      notes_text: row.notes_text,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name,
      organisation_name: row.organisation_name,
      employee_count: parseInt(row.employee_count) || 0,
      medical_report_count: parseInt(row.medical_report_count) || 0,
    }));

    return NextResponse.json({
      costCenters,
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
    console.error('Error fetching cost centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost centers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO employee_workplace (
        id, date_created, date_updated, user_created, user_updated,
        organisation_id, department, cost_center, workplace_address,
        manager_name, manager_email, manager_contact_number, manager_responsible,
        person_responsible_for_account, person_responsible_for_account_email, notes_text
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.organisation_id,
      body.department,
      body.cost_center,
      body.workplace_address,
      body.manager_name,
      body.manager_email,
      body.manager_contact_number,
      body.manager_responsible || false,
      body.person_responsible_for_account,
      body.person_responsible_for_account_email,
      body.notes_text,
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating cost center:', error);
    return NextResponse.json(
      { error: 'Failed to create cost center' },
      { status: 500 }
    );
  }
}
