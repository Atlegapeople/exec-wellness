import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const siteQuery = `
      SELECT 
        s.*,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name,
        o.name AS organisation_name,
        COALESCE(emp_counts.employee_count, 0) AS employee_count,
        COALESCE(mr_counts.report_count, 0) AS medical_report_count
      FROM sites s
      LEFT JOIN users uc ON uc.id = s.user_created
      LEFT JOIN users uu ON uu.id = s.user_updated
      LEFT JOIN organisation o ON o.id = s.organisation_id
      LEFT JOIN (
        SELECT 
          e.organisation,
          COUNT(*) AS employee_count
        FROM employee e
        WHERE e.organisation IS NOT NULL 
          AND e.id IN (
            SELECT employee_id
            FROM medical_report
            WHERE type = 'Executive Medical'
          )
        GROUP BY e.organisation
      ) emp_counts ON emp_counts.organisation = s.organisation_id
      LEFT JOIN (
        SELECT 
          site,
          COUNT(*) AS report_count
        FROM medical_report
        WHERE type = 'Executive Medical'
          AND site IS NOT NULL
        GROUP BY site
      ) mr_counts ON mr_counts.site = s.id
      WHERE s.id = $1
    `;

    const result = await query(siteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
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
      UPDATE sites 
      SET 
        date_updated = NOW(),
        user_updated = $2,
        organisation_id = $3,
        name = $4,
        address = $5,
        site_admin_email = $6
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.organisation_id,
      body.name,
      body.address,
      body.site_admin_email,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
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

    // Check if site has related records
    const relatedRecordsQuery = `
      SELECT 
        COUNT(e.id) as employees,
        COUNT(mr.id) as medical_reports,
        COUNT(l.id) as locations
      FROM sites s
      LEFT JOIN employee e ON e.workplace = s.id
      LEFT JOIN medical_report mr ON mr.site = s.id
      LEFT JOIN locations l ON l.site_id = s.id
      WHERE s.id = $1
    `;

    const relatedResult = await query(relatedRecordsQuery, [id]);
    const relatedCounts = relatedResult.rows[0];

    if (
      relatedCounts.employees > 0 ||
      relatedCounts.medical_reports > 0 ||
      relatedCounts.locations > 0
    ) {
      return NextResponse.json(
        {
          error: 'Cannot delete site with existing related records',
          details: {
            employees: parseInt(relatedCounts.employees),
            medical_reports: parseInt(relatedCounts.medical_reports),
            locations: parseInt(relatedCounts.locations),
          },
        },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM sites WHERE id = $1 RETURNING id`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Site deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
}
