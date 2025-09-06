import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Simple query that should work on any Supabase instance
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      // If that fails, try a different approach
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      return NextResponse.json({
        method: 'auth_check',
        authWorks: !authError,
        error: error.message,
        authError: authError?.message
      });
    }

    return NextResponse.json({
      success: true,
      tables: data?.map(row => row.table_name) || []
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}