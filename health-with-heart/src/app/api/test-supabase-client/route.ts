import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase client connection...');
    
    // Test basic connection
    const { data: timeData, error: timeError } = await supabaseAdmin
      .rpc('get_current_timestamp');
    
    if (timeError) {
      console.log('RPC failed, trying direct query...');
      // If RPC fails, try a simple select
      const { data: selectData, error: selectError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      if (selectError) {
        throw selectError;
      }
      
      return NextResponse.json({
        success: true,
        method: 'direct_query',
        result: 'Connected but users table query failed',
        error: (selectError as any)?.message
      });
    }
    
    return NextResponse.json({
      success: true,
      method: 'rpc',
      currentTime: timeData
    });

  } catch (error) {
    console.error('Supabase client error:', error);
    
    return NextResponse.json({
      error: 'Supabase client failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        hint: (error as any)?.hint,
        details: (error as any)?.details
      }
    }, { status: 500 });
  }
}