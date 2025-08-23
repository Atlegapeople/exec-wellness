import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { LabTest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // First check if lab_tests table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_tests'
      );
    `;
    
    const tableExists = await query(tableCheckQuery);
    if (!tableExists.rows[0].exists) {
      console.log('lab_tests table does not exist');
      return NextResponse.json({
        labTests: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    }

    // Build search condition - only for employees with Executive Medical reports
    const searchCondition = search 
      ? `AND (lt.id ILIKE $3 OR lt.employee_id ILIKE $3 OR lt.report_id ILIKE $3 OR lt.vitamin_d ILIKE $3 OR lt.total_cholesterol ILIKE $3 OR lt.hiv ILIKE $3 OR e.name ILIKE $3 OR e.surname ILIKE $3 OR e.work_email ILIKE $3)`
      : '';
    
    const countSearchCondition = search 
      ? `AND (lt.id ILIKE $1 OR lt.employee_id ILIKE $1 OR lt.report_id ILIKE $1 OR lt.vitamin_d ILIKE $1 OR lt.total_cholesterol ILIKE $1 OR lt.hiv ILIKE $1 OR e.name ILIKE $1 OR e.surname ILIKE $1 OR e.work_email ILIKE $1)`
      : '';

    // Get total count - only lab test records for employees with Executive Medical reports
    const countQuery = `
      SELECT COUNT(DISTINCT lt.id) as total 
      FROM lab_tests lt
      INNER JOIN employee e ON e.id = lt.employee_id
      INNER JOIN medical_report mr ON mr.employee_id = lt.employee_id
      WHERE mr.type = 'Executive Medical'
      ${countSearchCondition}
    `;
    
    const countParams: string[] = search ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get lab test records with user info and employee names
    const labTestsQuery = `
      SELECT DISTINCT
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
      INNER JOIN public.employee e
             ON e.id = lt.employee_id
      INNER JOIN medical_report mr 
             ON mr.employee_id = lt.employee_id
      LEFT JOIN public.users uc 
             ON uc.id = lt.user_created
      LEFT JOIN public.users uu 
             ON uu.id = lt.user_updated
      WHERE mr.type = 'Executive Medical'
      ${searchCondition}
      ORDER BY lt.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const queryParams = search 
      ? [limit, offset, `%${search}%`]
      : [limit, offset];

    const result = await query(labTestsQuery, queryParams);
    
    const labTests: LabTest[] = result.rows.map((row: any) => ({
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
      full_blood_count_an_esr: row.full_blood_count_an_esr,
      vitamin_d: row.vitamin_d,
      kidney_function: row.kidney_function,
      liver_enzymes: row.liver_enzymes,
      uric_acid: row.uric_acid,
      total_cholesterol: row.total_cholesterol,
      hdl: row.HDL,
      'hs-crp': row['hs-crp'],
      homocysteine: row.homocysteine,
      fasting_glucose: row.fasting_glucose,
      hba1c: row.hba1c,
      insulin_level: row.Insulin_level,
      thyroid_stimulating_hormone: row.thyroid_stimulating_hormone,
      psa: row.psa,
      hormones: row.hormones,
      adrenal_response: row['Adrenal Response'],
      notes_header: row.notes_header,
      notes_text: row.notes_text,
      recommendation_text: row.recommendation_text,
      documents: row.documents,
      hiv: row.hiv
    }));

    return NextResponse.json({
      labTests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    });

  } catch (error: any) {
    console.error('Error fetching lab tests:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to fetch lab tests';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection refused - check if database is running';
    } else if (error.code === '42P01') {
      errorMessage = 'Table does not exist in database';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.code || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const insertQuery = `
      INSERT INTO lab_tests (
        id, date_created, date_updated, user_created, user_updated,
        report_id, employee_id, full_blood_count_an_esr, vitamin_d, kidney_function,
        liver_enzymes, uric_acid, total_cholesterol, "HDL", "hs-crp", homocysteine,
        fasting_glucose, hba1c, "Insulin_level", thyroid_stimulating_hormone, psa,
        hormones, "Adrenal Response", notes_header, notes_text, recommendation_text,
        documents, hiv
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
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
      body.hiv
    ];

    const result = await query(insertQuery, values);
    
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('Error creating lab test:', error);
    return NextResponse.json(
      { error: 'Failed to create lab test' },
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
        { error: 'Lab test ID is required' },
        { status: 400 }
      );
    }

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
      updateData.user_updated || 'system',
      updateData.report_id,
      updateData.employee_id,
      updateData.full_blood_count_an_esr,
      updateData.vitamin_d,
      updateData.kidney_function,
      updateData.liver_enzymes,
      updateData.uric_acid,
      updateData.total_cholesterol,
      updateData.hdl,
      updateData['hs-crp'],
      updateData.homocysteine,
      updateData.fasting_glucose,
      updateData.hba1c,
      updateData.insulin_level,
      updateData.thyroid_stimulating_hormone,
      updateData.psa,
      updateData.hormones,
      updateData.adrenal_response,
      updateData.notes_header,
      updateData.notes_text,
      updateData.recommendation_text,
      updateData.documents,
      updateData.hiv
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Lab test ID is required' },
        { status: 400 }
      );
    }

    const deleteQuery = 'DELETE FROM lab_tests WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Lab test deleted successfully',
      deleted: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting lab test:', error);
    return NextResponse.json(
      { error: 'Failed to delete lab test' },
      { status: 500 }
    );
  }
}