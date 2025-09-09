import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const labTestQuery = `
      SELECT 
        lt.id,
        lt.date_created,
        lt.date_updated,
        uc.name || ' ' || uc.surname AS user_created_name,
        uu.name || ' ' || uu.surname AS user_updated_name,
        lt.user_created,
        lt.user_updated,
        lt.report_id,
        lt.employee_id,
        e.name as employee_name,
        e.surname as employee_surname,
        e.work_email as employee_work_email,
        lt.full_blood_count_an_esr,
        lt.vitamin_d,
        lt.kidney_function,
        lt.liver_enzymes,
        lt.uric_acid,
        lt.total_cholesterol,
        lt."HDL",
        lt."hs-crp",
        lt.homocysteine,
        lt.fasting_glucose,
        lt.hba1c,
        lt."Insulin_level",
        lt.thyroid_stimulating_hormone,
        lt.psa,
        lt.hormones,
        lt."Adrenal Response",
        lt.notes_header,
        lt.notes_text,
        lt.recommendation_text,
        lt.documents,
        lt.hiv
      FROM public.lab_tests lt
      INNER JOIN public.employee e ON e.id = lt.employee_id
      LEFT JOIN public.users uc ON uc.id = lt.user_created
      LEFT JOIN public.users uu ON uu.id = lt.user_updated
      WHERE lt.id = $1
    `;

    const result = await query(labTestQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lab test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab test' },
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
      UPDATE lab_tests SET
        date_updated = NOW(),
        user_updated = $2,
        report_id = $3,
        employee_id = $4,
        full_blood_count_an_esr = $5,
        vitamin_d = $6,
        kidney_function = $7,
        liver_enzymes = $8,
        uric_acid = $9,
        total_cholesterol = $10,
        "HDL" = $11,
        "hs-crp" = $12,
        homocysteine = $13,
        fasting_glucose = $14,
        hba1c = $15,
        "Insulin_level" = $16,
        thyroid_stimulating_hormone = $17,
        psa = $18,
        hormones = $19,
        "Adrenal Response" = $20,
        notes_header = $21,
        notes_text = $22,
        recommendation_text = $23,
        documents = $24,
        hiv = $25
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.report_id,
      body.employee_id,
      body.full_blood_count_an_esr,
      body.vitamin_d,
      body.kidney_function,
      body.liver_enzymes,
      body.uric_acid,
      body.total_cholesterol,
      body.hdl,
      body['hs-crp'],
      body.homocysteine,
      body.fasting_glucose,
      body.hba1c,
      body.insulin_level,
      body.thyroid_stimulating_hormone,
      body.psa,
      body.hormones,
      body.adrenal_response,
      body.notes_header,
      body.notes_text,
      body.recommendation_text,
      body.documents,
      body.hiv,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lab test:', error);
    return NextResponse.json(
      { error: 'Failed to update lab test' },
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

    const deleteQuery = 'DELETE FROM lab_tests WHERE id = $1 RETURNING id';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Lab test deleted successfully',
      id: (result.rows[0] as { id: string }).id,
    });
  } catch (error) {
    console.error('Error deleting lab test:', error);
    return NextResponse.json(
      { error: 'Failed to delete lab test' },
      { status: 500 }
    );
  }
}
