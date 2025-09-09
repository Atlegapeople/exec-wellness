import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { SpecialInvestigation } from '@/types';

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
      searchCondition = `AND si.employee_id = $3`;
      countSearchCondition = `AND si.employee_id = $1`;
      queryParams = [employee];
    } else if (search) {
      searchCondition = `AND (si.id ILIKE $3 OR si.employee_id ILIKE $3 OR si.report_id ILIKE $3 OR si.urine_dipstix ILIKE $3 OR si.risk_category ILIKE $3 OR e.name ILIKE $3 OR e.surname ILIKE $3 OR e.work_email ILIKE $3)`;
      countSearchCondition = `AND (si.id ILIKE $1 OR si.employee_id ILIKE $1 OR si.report_id ILIKE $1 OR si.urine_dipstix ILIKE $1 OR si.risk_category ILIKE $1 OR e.name ILIKE $1 OR e.surname ILIKE $1 OR e.work_email ILIKE $1)`;
      queryParams = [`%${search}%`];
    } else {
      searchCondition = '';
      countSearchCondition = '';
      queryParams = [];
    }

    // Get total count - only special investigation records for employees with Executive Medical reports
    const countQuery = `
      SELECT COUNT(DISTINCT si.id) as total 
      FROM special_investigations si
      INNER JOIN employee e ON e.id = si.employee_id
      INNER JOIN medical_report mr ON mr.employee_id = si.employee_id
      WHERE mr.type = 'Executive Medical'
      ${countSearchCondition}
    `;

    const countResult = await query(countQuery, queryParams);
    const total = parseInt((countResult.rows[0] as any).total);

    // Get special investigation records with user info and employee names
    const investigationsQuery = `
      SELECT DISTINCT
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
      INNER JOIN public.employee e
             ON e.id = si.employee_id
      INNER JOIN medical_report mr 
             ON mr.employee_id = si.employee_id
      LEFT JOIN public.users uc 
             ON uc.id = si.user_created
      LEFT JOIN public.users uu 
             ON uu.id = si.user_updated
      WHERE mr.type = 'Executive Medical'
      ${searchCondition}
      ORDER BY si.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    let finalQueryParams: (string | number)[] = [];
    if (employee) {
      finalQueryParams = [limit, offset, employee];
    } else if (search) {
      finalQueryParams = [limit, offset, `%${search}%`];
    } else {
      finalQueryParams = [limit, offset];
    }

    const result = await query(investigationsQuery, finalQueryParams);

    const investigations: SpecialInvestigation[] = result.rows.map(
      (row: any) => ({
        id: row.id,
        date_created: row.date_created ? new Date(row.date_created) : undefined,
        date_updated: row.date_updated ? new Date(row.date_updated) : undefined,
        user_created: row.user_created,
        user_updated: row.user_updated,
        report_id: row.report_id,
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        employee_surname: row.employee_surname,
        employee_work_email: row.employee_work_email,
        resting_ecg: row.resting_ecg,
        stress_ecg: row.stress_ecg,
        lung_function: row.lung_function,
        urine_dipstix: row.urine_dipstix,
        predicted_vo2_max: row.predicted_vo2_max,
        body_fat_percentage: row.body_fat_percentage,
        cardio_risk_header: row.cardio_risk_header,
        reynolds_cardiovascular_risk_score:
          row.reynolds_cardiovascular_risk_score,
        risk_score: row.risk_score,
        risk_category: row.risk_category,
        other_header: row.other_header,
        colonscopy_required: row.colonscopy_required,
        gastroscopy: row.gastroscopy,
        abdominal_ultrasound: row.abdominal_ultrasound,
        osteroporosis_screen: row.osteroporosis_screen,
        notes_header: row.notes_header,
        notes_text: row.notes_text,
        recommendation_text: row.recommendation_text,
        nerveiq: row.nerveiq,
        nerviq_note: row.nerviq_note,
        kardiofit: row.kardiofit,
        kardiofit_note: row.kardiofit_note,
        nerveiq_cns: row.nerveiq_cns,
        nerveiq_cardio: row.nerveiq_cardio,
        nerveiq_cnscomment: row.nerveiq_cnscomment,
        nerveiq_cardiocomment: row.nerveiq_cardiocomment,
        nerveiq_group: row.nerveiq_group,
      })
    );

    return NextResponse.json({
      investigations,
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
    console.error('Error fetching special investigations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special investigations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const insertQuery = `
      INSERT INTO special_investigations (
        id, date_created, date_updated, user_created, user_updated,
        report_id, employee_id, resting_ecg, stress_ecg, lung_function,
        urine_dipstix, predicted_vo2_max, body_fat_percentage, cardio_risk_header,
        reynolds_cardiovascular_risk_score, risk_score, risk_category, other_header,
        colonscopy_required, gastroscopy, abdominal_ultrasound, osteroporosis_screen,
        notes_header, notes_text, recommendation_text, nerveiq, nerviq_note,
        kardiofit, kardiofit_note, nerveiq_cns, nerveiq_cardio, nerveiq_cnscomment,
        nerveiq_cardiocomment, nerveiq_group
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
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

    const result = await query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating special investigation:', error);
    return NextResponse.json(
      { error: 'Failed to create special investigation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Special investigation ID is required' },
        { status: 400 }
      );
    }

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
      updateData.user_updated || 'system',
      updateData.report_id,
      updateData.employee_id,
      updateData.resting_ecg,
      updateData.stress_ecg,
      updateData.lung_function,
      updateData.urine_dipstix,
      updateData.predicted_vo2_max,
      updateData.body_fat_percentage,
      updateData.cardio_risk_header,
      updateData.reynolds_cardiovascular_risk_score,
      updateData.risk_score,
      updateData.risk_category,
      updateData.other_header,
      updateData.colonscopy_required,
      updateData.gastroscopy,
      updateData.abdominal_ultrasound,
      updateData.osteroporosis_screen,
      updateData.notes_header,
      updateData.notes_text,
      updateData.recommendation_text,
      updateData.nerveiq,
      updateData.nerviq_note,
      updateData.kardiofit,
      updateData.kardiofit_note,
      updateData.nerveiq_cns,
      updateData.nerveiq_cardio,
      updateData.nerveiq_cnscomment,
      updateData.nerveiq_cardiocomment,
      updateData.nerveiq_group,
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Special investigation ID is required' },
        { status: 400 }
      );
    }

    const deleteQuery =
      'DELETE FROM special_investigations WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Special investigation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Special investigation deleted successfully',
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting special investigation:', error);
    return NextResponse.json(
      { error: 'Failed to delete special investigation' },
      { status: 500 }
    );
  }
}
