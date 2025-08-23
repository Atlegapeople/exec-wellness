import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

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
      body.notes_text
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

    const deleteQuery = `DELETE FROM employee_workplace WHERE id = $1 RETURNING *`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cost center not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cost center deleted successfully' });

  } catch (error) {
    console.error('Error deleting cost center:', error);
    return NextResponse.json(
      { error: 'Failed to delete cost center' },
      { status: 500 }
    );
  }
}