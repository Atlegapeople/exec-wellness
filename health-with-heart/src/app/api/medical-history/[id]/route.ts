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
      UPDATE employee_medical_history 
      SET 
        date_updated = NOW(),
        user_updated = $2,
        employee_id = $3,
        conditions_header = $4,
        hiv = $5,
        high_blood_pressure = $6,
        high_cholesterol = $7,
        diabetes = $8,
        thyroid_disease = $9,
        asthma = $10,
        epilepsy = $11,
        bipolar_mood_disorder = $12,
        anxiety_or_depression = $13,
        inflammatory_bowel_disease = $14,
        tb = $15,
        hepatitis = $16,
        other = $17,
        notes = $18,
        disability_header = $19,
        "Does this person have a disability?" = $20,
        disability_type = $21,
        disabilty_desription = $22,
        allergies_header = $23,
        medication = $24,
        medication_type = $25,
        medication_severity = $26,
        environmental = $27,
        environmental_type = $28,
        enviromental_severity = $29,
        food = $30,
        food_type = $31,
        food_severity = $32,
        on_medication = $33,
        chronic_medication = $34,
        vitamins_or_supplements = $35,
        family_history_header = $36,
        family_conditions = $37,
        heart_attack = $38,
        heart_attack_60 = $39,
        cancer_family = $40,
        type_cancer = $41,
        age_of_cancer = $42,
        family_members = $43,
        other_family = $44,
        surgery_header = $45,
        surgery = $46,
        surgery_type = $47,
        surgery_year = $48,
        notes_header = $49,
        notes_text = $50,
        recommendation_text = $51
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      body.user_updated || 'system',
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

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Medical history not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating medical history:', error);
    return NextResponse.json(
      { error: 'Failed to update medical history' },
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

    const deleteQuery = `DELETE FROM employee_medical_history WHERE id = $1 RETURNING *`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Medical history not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Medical history deleted successfully' });

  } catch (error) {
    console.error('Error deleting medical history:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical history' },
      { status: 500 }
    );
  }
}