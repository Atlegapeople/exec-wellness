import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Lifestyle } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build search condition - only for employees with Executive Medical reports
    const searchCondition = search 
      ? `AND (l.id ILIKE $3 OR l.employee_id ILIKE $3 OR l.report_id ILIKE $3 OR l.auditc_result ILIKE $3 OR l.tics_result ILIKE $3 OR e.name ILIKE $3 OR e.surname ILIKE $3 OR e.work_email ILIKE $3)`
      : '';
    
    const countSearchCondition = search 
      ? `AND (l.id ILIKE $1 OR l.employee_id ILIKE $1 OR l.report_id ILIKE $1 OR l.auditc_result ILIKE $1 OR l.tics_result ILIKE $1 OR e.name ILIKE $1 OR e.surname ILIKE $1 OR e.work_email ILIKE $1)`
      : '';

    // Get total count - only lifestyle records for employees with Executive Medical reports
    const countQuery = `
      SELECT COUNT(DISTINCT l.id) as total 
      FROM lifestyle l
      INNER JOIN employee e ON e.id = l.employee_id
      INNER JOIN medical_report mr ON mr.employee_id = l.employee_id
      WHERE mr.type = 'Executive Medical'
      ${countSearchCondition}
    `;
    
    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get lifestyle records with user info and employee names
    const lifestylesQuery = `
      SELECT DISTINCT
        l.id,
        l.date_created,
        l.date_updated,
        uc.name || ' ' || uc.surname AS user_created_name,
        uu.name || ' ' || uu.surname AS user_updated_name,
        l.user_created,
        l.user_updated,
        l.report_id,
        l.employee_id,
        e.name as employee_name,
        e.surname as employee_surname,
        e.work_email as employee_work_email,
        l.smoking_header,
        l.smoke,
        l.smoke_qty,
        l.smoke_years,
        l.smoking_duration,
        l.alcohol_header,
        l.alochol_frequency,
        l.alochol_frequency_score,
        l.alocohol_qty,
        l.alocohol_qty_score,
        l.alcohol_excess,
        l.alcohol_excess_score,
        l.alcohol_score,
        l.alcohol_audit_header,
        l.audit_instruction,
        l.audit_q1,
        l.audit_s1,
        l.audit_q2,
        l.audit_s2,
        l.audit_q3,
        l.audit_s3,
        l.audit_q4,
        l.audit_s4,
        l.audit_q5,
        l.audit_s5,
        l.audit_q6,
        l.audit_s6,
        l.audit_q7,
        l.audit_s7,
        l.audit_q8,
        l.audit_s8,
        l.audit_q9,
        l.audit_s9,
        l.audit_q10,
        l.audit_s10,
        l.auditc_points,
        l.auditc_result,
        l.auditc_notes,
        l.drugs_header,
        l.drugs,
        l.drugs_past,
        l.tics_header,
        l.alcohol_overuse,
        l.alcohol_cut,
        l.tics_result,
        l.exercise,
        l.excercise_frequency,
        l.excercise_minutes,
        l.sitting_hours,
        l.diet_header,
        l.eatout_frequency,
        l.fruitveg_frequency,
        l.sugar_consumption,
        l.diet_overall,
        l.sleep_header,
        l.sleep_hours,
        l.sleep_rating,
        l.sleep_rest,
        l.notes_header,
        l.notes_text,
        l.recommendation_text
      FROM public.lifestyle l
      INNER JOIN public.employee e
             ON e.id = l.employee_id
      INNER JOIN medical_report mr 
             ON mr.employee_id = l.employee_id
      LEFT JOIN public.users uc 
             ON uc.id = l.user_created
      LEFT JOIN public.users uu 
             ON uu.id = l.user_updated
      WHERE mr.type = 'Executive Medical'
      ${searchCondition}
      ORDER BY l.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search 
      ? [limit, offset, `%${search}%`]
      : [limit, offset];

    const result = await query(lifestylesQuery, queryParams);
    
    const lifestyles: Lifestyle[] = result.rows.map((row: any) => ({
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
      smoking_header: row.smoking_header,
      smoke: row.smoke,
      smoke_qty: row.smoke_qty,
      smoke_years: row.smoke_years,
      smoking_duration: row.smoking_duration,
      alcohol_header: row.alcohol_header,
      alochol_frequency: row.alochol_frequency,
      alochol_frequency_score: row.alochol_frequency_score,
      alocohol_qty: row.alocohol_qty,
      alocohol_qty_score: row.alocohol_qty_score,
      alcohol_excess: row.alcohol_excess,
      alcohol_excess_score: row.alcohol_excess_score,
      alcohol_score: row.alcohol_score,
      alcohol_audit_header: row.alcohol_audit_header,
      audit_instruction: row.audit_instruction,
      audit_q1: row.audit_q1,
      audit_s1: row.audit_s1,
      audit_q2: row.audit_q2,
      audit_s2: row.audit_s2,
      audit_q3: row.audit_q3,
      audit_s3: row.audit_s3,
      audit_q4: row.audit_q4,
      audit_s4: row.audit_s4,
      audit_q5: row.audit_q5,
      audit_s5: row.audit_s5,
      audit_q6: row.audit_q6,
      audit_s6: row.audit_s6,
      audit_q7: row.audit_q7,
      audit_s7: row.audit_s7,
      audit_q8: row.audit_q8,
      audit_s8: row.audit_s8,
      audit_q9: row.audit_q9,
      audit_s9: row.audit_s9,
      audit_q10: row.audit_q10,
      audit_s10: row.audit_s10,
      auditc_points: row.auditc_points,
      auditc_result: row.auditc_result,
      auditc_notes: row.auditc_notes,
      drugs_header: row.drugs_header,
      drugs: row.drugs,
      drugs_past: row.drugs_past,
      tics_header: row.tics_header,
      alcohol_overuse: row.alcohol_overuse,
      alcohol_cut: row.alcohol_cut,
      tics_result: row.tics_result,
      exercise: row.exercise,
      excercise_frequency: row.excercise_frequency,
      excercise_minutes: row.excercise_minutes,
      sitting_hours: row.sitting_hours,
      diet_header: row.diet_header,
      eatout_frequency: row.eatout_frequency,
      fruitveg_frequency: row.fruitveg_frequency,
      sugar_consumption: row.sugar_consumption,
      diet_overall: row.diet_overall,
      sleep_header: row.sleep_header,
      sleep_hours: row.sleep_hours,
      sleep_rating: row.sleep_rating,
      sleep_rest: row.sleep_rest,
      notes_header: row.notes_header,
      notes_text: row.notes_text,
      recommendation_text: row.recommendation_text
    }));

    return NextResponse.json({
      lifestyles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching lifestyle records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lifestyle records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const insertQuery = `
      INSERT INTO lifestyle (
        id, date_created, date_updated, user_created, user_updated,
        report_id, employee_id, smoking_header, smoke, smoke_qty,
        smoke_years, smoking_duration, alcohol_header, alochol_frequency,
        alochol_frequency_score, alocohol_qty, alocohol_qty_score,
        alcohol_excess, alcohol_excess_score, alcohol_score,
        alcohol_audit_header, audit_instruction, audit_q1, audit_s1,
        audit_q2, audit_s2, audit_q3, audit_s3, audit_q4, audit_s4,
        audit_q5, audit_s5, audit_q6, audit_s6, audit_q7, audit_s7,
        audit_q8, audit_s8, audit_q9, audit_s9, audit_q10, audit_s10,
        auditc_points, auditc_result, auditc_notes, drugs_header,
        drugs, drugs_past, tics_header, alcohol_overuse, alcohol_cut,
        tics_result, exercise, excercise_frequency, excercise_minutes,
        sitting_hours, diet_header, eatout_frequency, fruitveg_frequency,
        sugar_consumption, diet_overall, sleep_header, sleep_hours,
        sleep_rating, sleep_rest, notes_header, notes_text,
        recommendation_text
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48,
        $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62,
        $63, $64, $65, $66, $67
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.report_id,
      body.employee_id,
      body.smoking_header,
      body.smoke,
      body.smoke_qty,
      body.smoke_years,
      body.smoking_duration,
      body.alcohol_header,
      body.alochol_frequency,
      body.alochol_frequency_score,
      body.alocohol_qty,
      body.alocohol_qty_score,
      body.alcohol_excess,
      body.alcohol_excess_score,
      body.alcohol_score,
      body.alcohol_audit_header,
      body.audit_instruction,
      body.audit_q1,
      body.audit_s1,
      body.audit_q2,
      body.audit_s2,
      body.audit_q3,
      body.audit_s3,
      body.audit_q4,
      body.audit_s4,
      body.audit_q5,
      body.audit_s5,
      body.audit_q6,
      body.audit_s6,
      body.audit_q7,
      body.audit_s7,
      body.audit_q8,
      body.audit_s8,
      body.audit_q9,
      body.audit_s9,
      body.audit_q10,
      body.audit_s10,
      body.auditc_points,
      body.auditc_result,
      body.auditc_notes,
      body.drugs_header,
      body.drugs,
      body.drugs_past,
      body.tics_header,
      body.alcohol_overuse,
      body.alcohol_cut,
      body.tics_result,
      body.exercise,
      body.excercise_frequency,
      body.excercise_minutes,
      body.sitting_hours,
      body.diet_header,
      body.eatout_frequency,
      body.fruitveg_frequency,
      body.sugar_consumption,
      body.diet_overall,
      body.sleep_header,
      body.sleep_hours,
      body.sleep_rating,
      body.sleep_rest,
      body.notes_header,
      body.notes_text,
      body.recommendation_text
    ];

    const result = await query(insertQuery, values);
    
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('Error creating lifestyle record:', error);
    return NextResponse.json(
      { error: 'Failed to create lifestyle record' },
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
        { error: 'Lifestyle record ID is required' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE lifestyle SET
        date_updated = NOW(),
        user_updated = $2,
        report_id = $3,
        employee_id = $4,
        smoking_header = $5,
        smoke = $6,
        smoke_qty = $7,
        smoke_years = $8,
        smoking_duration = $9,
        alcohol_header = $10,
        alochol_frequency = $11,
        alochol_frequency_score = $12,
        alocohol_qty = $13,
        alocohol_qty_score = $14,
        alcohol_excess = $15,
        alcohol_excess_score = $16,
        alcohol_score = $17,
        alcohol_audit_header = $18,
        audit_instruction = $19,
        audit_q1 = $20,
        audit_s1 = $21,
        audit_q2 = $22,
        audit_s2 = $23,
        audit_q3 = $24,
        audit_s3 = $25,
        audit_q4 = $26,
        audit_s4 = $27,
        audit_q5 = $28,
        audit_s5 = $29,
        audit_q6 = $30,
        audit_s6 = $31,
        audit_q7 = $32,
        audit_s7 = $33,
        audit_q8 = $34,
        audit_s8 = $35,
        audit_q9 = $36,
        audit_s9 = $37,
        audit_q10 = $38,
        audit_s10 = $39,
        auditc_points = $40,
        auditc_result = $41,
        auditc_notes = $42,
        drugs_header = $43,
        drugs = $44,
        drugs_past = $45,
        tics_header = $46,
        alcohol_overuse = $47,
        alcohol_cut = $48,
        tics_result = $49,
        exercise = $50,
        excercise_frequency = $51,
        excercise_minutes = $52,
        sitting_hours = $53,
        diet_header = $54,
        eatout_frequency = $55,
        fruitveg_frequency = $56,
        sugar_consumption = $57,
        diet_overall = $58,
        sleep_header = $59,
        sleep_hours = $60,
        sleep_rating = $61,
        sleep_rest = $62,
        notes_header = $63,
        notes_text = $64,
        recommendation_text = $65
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      updateData.user_updated || 'system',
      updateData.report_id,
      updateData.employee_id,
      updateData.smoking_header,
      updateData.smoke,
      updateData.smoke_qty,
      updateData.smoke_years,
      updateData.smoking_duration,
      updateData.alcohol_header,
      updateData.alochol_frequency,
      updateData.alochol_frequency_score,
      updateData.alocohol_qty,
      updateData.alocohol_qty_score,
      updateData.alcohol_excess,
      updateData.alcohol_excess_score,
      updateData.alcohol_score,
      updateData.alcohol_audit_header,
      updateData.audit_instruction,
      updateData.audit_q1,
      updateData.audit_s1,
      updateData.audit_q2,
      updateData.audit_s2,
      updateData.audit_q3,
      updateData.audit_s3,
      updateData.audit_q4,
      updateData.audit_s4,
      updateData.audit_q5,
      updateData.audit_s5,
      updateData.audit_q6,
      updateData.audit_s6,
      updateData.audit_q7,
      updateData.audit_s7,
      updateData.audit_q8,
      updateData.audit_s8,
      updateData.audit_q9,
      updateData.audit_s9,
      updateData.audit_q10,
      updateData.audit_s10,
      updateData.auditc_points,
      updateData.auditc_result,
      updateData.auditc_notes,
      updateData.drugs_header,
      updateData.drugs,
      updateData.drugs_past,
      updateData.tics_header,
      updateData.alcohol_overuse,
      updateData.alcohol_cut,
      updateData.tics_result,
      updateData.exercise,
      updateData.excercise_frequency,
      updateData.excercise_minutes,
      updateData.sitting_hours,
      updateData.diet_header,
      updateData.eatout_frequency,
      updateData.fruitveg_frequency,
      updateData.sugar_consumption,
      updateData.diet_overall,
      updateData.sleep_header,
      updateData.sleep_hours,
      updateData.sleep_rating,
      updateData.sleep_rest,
      updateData.notes_header,
      updateData.notes_text,
      updateData.recommendation_text
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lifestyle record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating lifestyle record:', error);
    return NextResponse.json(
      { error: 'Failed to update lifestyle record' },
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
        { error: 'Lifestyle record ID is required' },
        { status: 400 }
      );
    }

    const deleteQuery = 'DELETE FROM lifestyle WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lifestyle record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Lifestyle record deleted successfully',
      deleted: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting lifestyle record:', error);
    return NextResponse.json(
      { error: 'Failed to delete lifestyle record' },
      { status: 500 }
    );
  }
}