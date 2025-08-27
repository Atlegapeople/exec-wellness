import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const costCenterQuery = `
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
      WHERE ew.id = $1
    `;

    const result = await query(costCenterQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cost center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching cost center:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost center' },
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
      UPDATE employee_workplace 
      SET 
        date_updated = NOW(),
        user_updated = $2,
        organisation_id = $3,
        department = $4,
        cost_center = $5,
        workplace_address = $6,
        manager_name = $7,
        manager_email = $8,
        manager_contact_number = $9,
        manager_responsible = $10,
        person_responsible_for_account = $11,
        person_responsible_for_account_email = $12,
        notes_text = $13
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
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

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cost center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cost center:', error);
    return NextResponse.json(
      { error: 'Failed to update cost center' },
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

    // Check if cost center has related records
    const relatedRecordsQuery = `
      SELECT 
        COUNT(e.id) as employees
      FROM employee_workplace ew
      LEFT JOIN employee e ON e.workplace = ew.id
      WHERE ew.id = $1
    `;

    const relatedResult = await query(relatedRecordsQuery, [id]);
    const relatedCounts = relatedResult.rows[0];

    if (relatedCounts.employees > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete cost center with existing employees',
          details: {
            employees: parseInt(relatedCounts.employees),
          },
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM employee_workplace WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cost center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Cost center deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting cost center:', error);
    return NextResponse.json(
      { error: 'Failed to delete cost center' },
      { status: 500 }
    );
  }
}
