import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        SUPABASE_HOST: process.env.SUPABASE_HOST || 'Not set',
        SUPABASE_USERNAME: process.env.SUPABASE_USERNAME || 'Not set',
        NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'Not set'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}