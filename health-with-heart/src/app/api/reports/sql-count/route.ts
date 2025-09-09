import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Your exact SQL query
    const countQuery = `
      SELECT COUNT(*) as count
      FROM medical_report
      WHERE type = 'Executive Medical'
        AND doctor IS NULL
        AND nurse IS NULL
    `;

    const result = await query(countQuery);
    const count = parseInt((result.rows[0] as any).count);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error in SQL count endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get SQL count' },
      { status: 500 }
    );
  }
}
