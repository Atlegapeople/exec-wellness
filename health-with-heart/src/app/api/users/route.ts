import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const usersQuery = `
      SELECT 
        id,
        name,
        surname,
        email,
        type,
        date_created
      FROM users
      ORDER BY type, surname, name
    `;

    const result = await query(usersQuery);
    
    const users = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      surname: row.surname,
      email: row.email,
      type: row.type,
      date_created: row.date_created
    }));

    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}