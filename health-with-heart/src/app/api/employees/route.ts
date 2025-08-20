import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Employee } from '@/types';

export async function GET() {
  try {
    const employeesQuery = `
      SELECT 
        id,
        date_created,
        date_updated,
        user_created,
        user_updated,
        name,
        surname
      FROM employee
      ORDER BY surname, name
      LIMIT 1000
    `;

    const result = await query(employeesQuery);
    
    const employees: Employee[] = result.rows.map((row: any) => ({
      id: row.id,
      date_created: new Date(row.date_created),
      date_updated: new Date(row.date_updated),
      user_created: row.user_created,
      user_updated: row.user_updated,
      section_header: '', // Not selected in query
      name: row.name,
      surname: row.surname,
      // Optional fields set to undefined since we're not selecting them
      employee_id_number: undefined,
      cell_phone: undefined,
      email: undefined,
      date_of_birth: undefined,
      gender: undefined,
      id_number: undefined,
      home_address: undefined,
      postal_address: undefined,
      postal_code: undefined,
      home_phone: undefined,
      work_phone: undefined,
      emergency_contact_name: undefined,
      emergency_contact_number: undefined,
      relationship: undefined,
      marital_status: undefined,
      dependants: undefined,
      employee_personal_email: undefined,
      employee_work_email: undefined,
      race: undefined,
      home_language: undefined,
      nationality: undefined,
      religion: undefined,
      disabilities: undefined,
      medical_aid: undefined,
      medical_aid_number: undefined
    }));

    return NextResponse.json(employees);

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}