import { supabaseAdmin } from '@/lib/supabase';

// Helper function to execute raw SQL using Supabase client
export async function supabaseQuery(text: string, params?: unknown[]): Promise<{ rows: unknown; rowCount: number }> {
  try {
    // Replace PostgreSQL $1, $2, etc. with actual values
    let processedText = text;
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        const placeholder = `$${index + 1}`;
        const value = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
        processedText = processedText.replace(new RegExp(`\\${placeholder}\\b`, 'g'), String(value));
      });
    }

    console.log('Executing Supabase query:', processedText.substring(0, 100) + '...');
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: processedText 
    });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw new Error(error.message);
    }
    
    console.log('Supabase query successful, rows:', data?.length || 0);
    
    // Format response to match pg format
    return {
      rows: data || [],
      rowCount: data?.length || 0
    };
    
  } catch (error) {
    console.error('Supabase query failed:', error);
    throw error;
  }
}