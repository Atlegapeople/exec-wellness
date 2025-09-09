import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const investigationQuery = `
      SELECT 
        si.id,
        si.date_created,
        si.date_updated,
        uc.name || ' ' || uc.surname AS user_created_name,
        uu.name || ' ' || uu.surname AS user_updated_name,
        si.user_created,
        si.user_updated,
        si.report_id,
        si.employee_id,
        e.name as employee_name,
        e.surname as employee_surname,
        e.work_email as employee_work_email,
        si.resting_ecg,
        si.stress_ecg,
        si.lung_function,
        si.urine_dipstix,
        si.predicted_vo2_max,
        si.body_fat_percentage,
        si.cardio_risk_header,
        si.reynolds_cardiovascular_risk_score,
        si.risk_score,
        si.risk_category,
        si.other_header,
        si.colonscopy_required,
        si.gastroscopy,
        si.abdominal_ultrasound,
        si.osteroporosis_screen,
        si.notes_header,
        si.notes_text,
        si.recommendation_text,
        si.nerveiq,
        si.nerviq_note,
        si.kardiofit,
        si.kardiofit_note,
        si.nerveiq_cns,
        si.nerveiq_cardio,
        si.nerveiq_cnscomment,
        si.nerveiq_cardiocomment,
        si.nerveiq_group
      FROM public.special_investigations si
      INNER JOIN public.employee e ON e.id = si.employee_id
      LEFT JOIN public.users uc ON uc.id = si.user_created
      LEFT JOIN public.users uu ON uu.id = si.user_updated
      WHERE si.id = $1
    `;

    const result = await query(investigationQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Special investigation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching special investigation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special investigation' },
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
      UPDATE special_investigations SET
        date_updated = NOW(),
        user_updated = $2,
        report_id = $3,
        employee_id = $4,
        resting_ecg = $5,
        stress_ecg = $6,
        lung_function = $7,
        urine_dipstix = $8,
        predicted_vo2_max = $9,
        body_fat_percentage = $10,
        cardio_risk_header = $11,
        reynolds_cardiovascular_risk_score = $12,
        risk_score = $13,
        risk_category = $14,
        other_header = $15,
        colonscopy_required = $16,
        gastroscopy = $17,
        abdominal_ultrasound = $18,
        osteroporosis_screen = $19,
        notes_header = $20,
        notes_text = $21,
        recommendation_text = $22,
        nerveiq = $23,
        nerviq_note = $24,
        kardiofit = $25,
        kardiofit_note = $26,
        nerveiq_cns = $27,
        nerveiq_cardio = $28,
        nerveiq_cnscomment = $29,
        nerveiq_cardiocomment = $30,
        nerveiq_group = $31
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
      body.report_id,
      body.employee_id,
      body.resting_ecg,
      body.stress_ecg,
      body.lung_function,
      body.urine_dipstix,
      body.predicted_vo2_max,
      body.body_fat_percentage,
      body.cardio_risk_header,
      body.reynolds_cardiovascular_risk_score,
      body.risk_score,
      body.risk_category,
      body.other_header,
      body.colonscopy_required,
      body.gastroscopy,
      body.abdominal_ultrasound,
      body.osteroporosis_screen,
      body.notes_header,
      body.notes_text,
      body.recommendation_text,
      body.nerveiq,
      body.nerviq_note,
      body.kardiofit,
      body.kardiofit_note,
      body.nerveiq_cns,
      body.nerveiq_cardio,
      body.nerveiq_cnscomment,
      body.nerveiq_cardiocomment,
      body.nerveiq_group,
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Special investigation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating special investigation:', error);
    return NextResponse.json(
      { error: 'Failed to update special investigation' },
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

    const deleteQuery =
      'DELETE FROM special_investigations WHERE id = $1 RETURNING id';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Special investigation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Special investigation deleted successfully',
      id: (result.rows[0] as any).id,
    });
  } catch (error) {
    console.error('Error deleting special investigation:', error);
    return NextResponse.json(
      { error: 'Failed to delete special investigation' },
      { status: 500 }
    );
  }
}
