import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ValidationError } from '@/types';

export async function GET() {
  try {
    const validationErrorsQuery = `
      SELECT 
        mr.id as report_id,
        CONCAT(e.name, ' ', e.surname) as employee_name,
        mr.type,
        CASE WHEN mr.doctor IS NULL OR mr.doctor = '' THEN 'Missing Doctor Assignment' END as doctor_error,
        CASE WHEN mr.nurse IS NULL OR mr.nurse = '' THEN 'Missing Nurse Assignment' END as nurse_error,
        CASE WHEN mr.doctor_signoff IS NULL AND mr.doctor IS NOT NULL THEN 'Awaiting Doctor Signature' END as signoff_error,
        CASE WHEN v.height_cm IS NULL OR v.weight_kg IS NULL THEN 'Missing Vital Signs' END as vitals_error,
        CASE WHEN ce.general_assessment IS NULL THEN 'Missing Clinical Examination' END as clinical_error,
        CASE WHEN lt.full_blood_count_an_esr IS NULL AND lt.kidney_function IS NULL THEN 'Missing Lab Results' END as lab_error,
        CASE WHEN mr.recommendation_text IS NULL OR mr.recommendation_text = '' THEN 'Missing Recommendations' END as recommendations_error
      FROM medical_report mr
      JOIN employee e ON mr.employee_id = e.id
      LEFT JOIN vitals_clinical_metrics v ON v.employee_id = e.id
      LEFT JOIN clinical_examinations ce ON ce.employee_id = e.id
      LEFT JOIN lab_tests lt ON lt.employee_id = e.id
      WHERE mr.type = 'Executive Medical'
      AND mr.date_created >= CURRENT_DATE - INTERVAL '14 days'
      AND (
        mr.doctor IS NULL OR mr.doctor = '' OR
        mr.nurse IS NULL OR mr.nurse = '' OR
        (mr.doctor_signoff IS NULL AND mr.doctor IS NOT NULL) OR
        v.height_cm IS NULL OR v.weight_kg IS NULL OR
        ce.general_assessment IS NULL OR
        (lt.full_blood_count_an_esr IS NULL AND lt.kidney_function IS NULL) OR
        mr.recommendation_text IS NULL OR mr.recommendation_text = ''
      )
      ORDER BY mr.date_created DESC
      LIMIT 50
    `;

    const result = await query(validationErrorsQuery);
    
    const validationErrors: ValidationError[] = result.rows.map((row: any) => {
      const errors: string[] = [];
      
      if (row.doctor_error) errors.push(row.doctor_error);
      if (row.nurse_error) errors.push(row.nurse_error);
      if (row.signoff_error) errors.push(row.signoff_error);
      if (row.vitals_error) errors.push(row.vitals_error);
      if (row.clinical_error) errors.push(row.clinical_error);
      if (row.lab_error) errors.push(row.lab_error);
      if (row.recommendations_error) errors.push(row.recommendations_error);
      
      return {
        report_id: row.report_id,
        employee_name: row.employee_name,
        type: row.type,
        errors: errors
      };
    });

    return NextResponse.json(validationErrors);

  } catch (error) {
    console.error('Error fetching validation errors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validation errors' },
      { status: 500 }
    );
  }
}