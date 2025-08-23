import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface MedicalHistory {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string | null;
  user_updated: string | null;
  employee_id: string;
  conditions_header: string | null;
  hiv: string | null;
  high_blood_pressure: boolean;
  high_cholesterol: boolean;
  diabetes: boolean;
  thyroid_disease: boolean;
  asthma: boolean;
  epilepsy: boolean;
  bipolar_mood_disorder: boolean;
  anxiety_or_depression: boolean;
  inflammatory_bowel_disease: boolean;
  tb: boolean;
  hepatitis: boolean;
  other: string | null;
  notes: string | null;
  disability_header: string | null;
  disability: boolean;
  disability_type: string | null;
  disabilty_desription: string | null;
  allergies_header: string | null;
  medication: boolean;
  medication_type: string | null;
  medication_severity: string | null;
  environmental: boolean;
  environmental_type: string | null;
  enviromental_severity: string | null;
  food: boolean;
  food_type: string | null;
  food_severity: string | null;
  on_medication: boolean;
  chronic_medication: string | null;
  vitamins_or_supplements: string | null;
  family_history_header: string | null;
  family_conditions: string | null;
  heart_attack: boolean;
  heart_attack_60: string | null;
  cancer_family: boolean;
  type_cancer: string | null;
  age_of_cancer: string | null;
  family_members: string | null;
  other_family: string | null;
  surgery_header: string | null;
  surgery: boolean;
  surgery_type: string | null;
  surgery_year: string | null;
  notes_header: string | null;
  notes_text: string | null;
  recommendation_text: string | null;
  employee_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const employee = searchParams.get('employee') || '';
    const offset = (page - 1) * limit;

    // Build search condition
    let searchCondition = '';
    let countSearchCondition = '';
    
    if (search && employee) {
      searchCondition = `WHERE (e.name ILIKE $4 OR e.surname ILIKE $4 OR emh.notes_text ILIKE $4) AND emh.employee_id = $3`;
      countSearchCondition = `WHERE (e.name ILIKE $2 OR e.surname ILIKE $2 OR emh.notes_text ILIKE $2) AND emh.employee_id = $1`;
    } else if (search) {
      searchCondition = `WHERE (e.name ILIKE $3 OR e.surname ILIKE $3 OR emh.notes_text ILIKE $3)`;
      countSearchCondition = `WHERE (e.name ILIKE $1 OR e.surname ILIKE $1 OR emh.notes_text ILIKE $1)`;
    } else if (employee) {
      searchCondition = `WHERE emh.employee_id = $3`;
      countSearchCondition = `WHERE emh.employee_id = $1`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM employee_medical_history emh
      LEFT JOIN employee e ON e.id = emh.employee_id
      WHERE emh.employee_id IN (SELECT employee_id FROM medical_report WHERE type = 'Executive Medical')
      ${countSearchCondition ? `AND (${countSearchCondition.replace('WHERE ', '')})` : ''}
    `;
    
    let countParams: (string | number)[] = [];
    if (search && employee) {
      countParams = [employee, `%${search}%`];
    } else if (search) {
      countParams = [`%${search}%`];
    } else if (employee) {
      countParams = [employee];
    }
    
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get medical history with employee names and user names
    const medicalHistoryQuery = `
      SELECT 
        emh.*,
        e.name || ' ' || e.surname AS employee_name,
        uc.name || ' ' || uc.surname AS created_by_name,
        uu.name || ' ' || uu.surname AS updated_by_name
      FROM employee_medical_history emh
      LEFT JOIN employee e ON e.id = emh.employee_id
      LEFT JOIN users uc ON uc.id = emh.user_created
      LEFT JOIN users uu ON uu.id = emh.user_updated
      WHERE emh.employee_id IN (SELECT employee_id FROM medical_report WHERE type = 'Executive Medical')
      ${searchCondition ? `AND (${searchCondition.replace('WHERE ', '')})` : ''}
      ORDER BY emh.date_updated DESC, emh.date_created DESC
      LIMIT $1 OFFSET $2
    `;

    let queryParams: (string | number)[] = [];
    if (search && employee) {
      queryParams = [limit, offset, employee, `%${search}%`];
    } else if (search) {
      queryParams = [limit, offset, `%${search}%`];
    } else if (employee) {
      queryParams = [limit, offset, employee];
    } else {
      queryParams = [limit, offset];
    }
    
    const result = await query(medicalHistoryQuery, queryParams);

    const medicalHistories: MedicalHistory[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: row.date_created,
      date_updated: row.date_updated,
      user_created: row.user_created,
      user_updated: row.user_updated,
      employee_id: row.employee_id,
      conditions_header: row.conditions_header,
      hiv: row.hiv,
      high_blood_pressure: row.high_blood_pressure,
      high_cholesterol: row.high_cholesterol,
      diabetes: row.diabetes,
      thyroid_disease: row.thyroid_disease,
      asthma: row.asthma,
      epilepsy: row.epilepsy,
      bipolar_mood_disorder: row.bipolar_mood_disorder,
      anxiety_or_depression: row.anxiety_or_depression,
      inflammatory_bowel_disease: row.inflammatory_bowel_disease,
      tb: row.tb,
      hepatitis: row.hepatitis,
      other: row.other,
      notes: row.notes,
      disability_header: row.disability_header,
      disability: row['Does this person have a disability?'] || row.disability,
      disability_type: row.disability_type,
      disabilty_desription: row.disabilty_desription,
      allergies_header: row.allergies_header,
      medication: row.medication,
      medication_type: row.medication_type,
      medication_severity: row.medication_severity,
      environmental: row.environmental,
      environmental_type: row.environmental_type,
      enviromental_severity: row.enviromental_severity,
      food: row.food,
      food_type: row.food_type,
      food_severity: row.food_severity,
      on_medication: row.on_medication,
      chronic_medication: row.chronic_medication,
      vitamins_or_supplements: row.vitamins_or_supplements,
      family_history_header: row.family_history_header,
      family_conditions: row.family_conditions,
      heart_attack: row.heart_attack,
      heart_attack_60: row.heart_attack_60,
      cancer_family: row.cancer_family,
      type_cancer: row.type_cancer,
      age_of_cancer: row.age_of_cancer,
      family_members: row.family_members,
      other_family: row.other_family,
      surgery_header: row.surgery_header,
      surgery: row.surgery,
      surgery_type: row.surgery_type,
      surgery_year: row.surgery_year,
      notes_header: row.notes_header,
      notes_text: row.notes_text,
      recommendation_text: row.recommendation_text,
      employee_name: row.employee_name,
      created_by_name: row.created_by_name,
      updated_by_name: row.updated_by_name
    }));

    return NextResponse.json({
      medicalHistories,
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
    console.error('Error fetching medical histories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical histories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const insertQuery = `
      INSERT INTO employee_medical_history (
        id, date_created, date_updated, user_created, user_updated,
        employee_id, conditions_header, hiv, high_blood_pressure, high_cholesterol,
        diabetes, thyroid_disease, asthma, epilepsy, bipolar_mood_disorder,
        anxiety_or_depression, inflammatory_bowel_disease, tb, hepatitis, other,
        notes, disability_header, "Does this person have a disability?", disability_type,
        disabilty_desription, allergies_header, medication, medication_type,
        medication_severity, environmental, environmental_type, enviromental_severity,
        food, food_type, food_severity, on_medication, chronic_medication,
        vitamins_or_supplements, family_history_header, family_conditions,
        heart_attack, heart_attack_60, cancer_family, type_cancer, age_of_cancer,
        family_members, other_family, surgery_header, surgery, surgery_type,
        surgery_year, notes_header, notes_text, recommendation_text
      ) VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $1,
        $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,
        $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45,
        $46, $47, $48, $49, $50
      )
      RETURNING *
    `;

    const values = [
      body.user_created || 'system',
      body.employee_id,
      body.conditions_header,
      body.hiv,
      body.high_blood_pressure || false,
      body.high_cholesterol || false,
      body.diabetes || false,
      body.thyroid_disease || false,
      body.asthma || false,
      body.epilepsy || false,
      body.bipolar_mood_disorder || false,
      body.anxiety_or_depression || false,
      body.inflammatory_bowel_disease || false,
      body.tb || false,
      body.hepatitis || false,
      body.other,
      body.notes,
      body.disability_header,
      body.disability || false,
      body.disability_type,
      body.disabilty_desription,
      body.allergies_header,
      body.medication || false,
      body.medication_type,
      body.medication_severity,
      body.environmental || false,
      body.environmental_type,
      body.enviromental_severity,
      body.food || false,
      body.food_type,
      body.food_severity,
      body.on_medication || false,
      body.chronic_medication,
      body.vitamins_or_supplements,
      body.family_history_header,
      body.family_conditions,
      body.heart_attack || false,
      body.heart_attack_60,
      body.cancer_family || false,
      body.type_cancer,
      body.age_of_cancer,
      body.family_members,
      body.other_family,
      body.surgery_header,
      body.surgery || false,
      body.surgery_type,
      body.surgery_year,
      body.notes_header,
      body.notes_text,
      body.recommendation_text
    ];

    const result = await query(insertQuery, values);
    
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('Error creating medical history:', error);
    return NextResponse.json(
      { error: 'Failed to create medical history' },
      { status: 500 }
    );
  }
}