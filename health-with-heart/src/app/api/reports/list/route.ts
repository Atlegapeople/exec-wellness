import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const reportsListQuery = `
      SELECT 
        mr.id,
        mr.type,
        mr.date_created,
        CONCAT(e.name, ' ', e.surname) as employee_name,
        CONCAT(doctor_user.name, ' ', doctor_user.surname) as doctor_name,
        mr.doctor_signoff
      FROM medical_report mr
      LEFT JOIN employee e ON e.id = mr.employee_id
      LEFT JOIN users doctor_user ON doctor_user.id = mr.doctor
      WHERE mr.type IS NOT NULL
      ORDER BY mr.date_created DESC
      LIMIT 50
    `;

    const result = await query(reportsListQuery);
    
    const reports = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      date_created: row.date_created,
      employee_name: row.employee_name || 'Unknown Employee',
      doctor_name: row.doctor_name || 'Unknown Doctor',
      is_signed: !!row.doctor_signoff
    }));

    return NextResponse.json(reports);

  } catch (error) {
    console.error('Error fetching reports list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports list' },
      { status: 500 }
    );
  }
}