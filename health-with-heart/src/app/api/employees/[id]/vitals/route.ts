import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the latest 2 vitals records for trend analysis
    const vitalsQuery = `
      SELECT 
        weight_kg,
        height_cm,
        bmi,
        bmi_status,
        pulse_rate,
        systolic_bp,
        diastolic_bp,
        blood_pressure_status,
        finger_prick_glucose_type,
        glucose_result,
        glucose_status,
        hiv_result,
        date_created
      FROM vitals_clinical_metrics 
      WHERE employee_id = $1 
      ORDER BY date_created DESC 
      LIMIT 2
    `;

    const result = await query(vitalsQuery, [id]);
    
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Error fetching employee vitals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee vitals' },
      { status: 500 }
    );
  }
}