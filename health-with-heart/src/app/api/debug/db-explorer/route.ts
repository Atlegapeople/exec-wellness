import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    const tableName = searchParams.get('table');
    const limit = parseInt(searchParams.get('limit') || '10');

    switch (action) {
      case 'overview':
        // Get all tables with row counts
        const tablesQuery = `
          SELECT 
            schemaname,
            tablename,
            (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename AND table_schema = schemaname) as column_count
          FROM pg_tables 
          WHERE schemaname = 'public'
          ORDER BY tablename;
        `;
        const tables = await query(tablesQuery);
        
        // Get row counts for each table
        const tablesWithCounts = await Promise.all(
          tables.rows.map(async (table: any) => {
            try {
              const countResult = await query(`SELECT COUNT(*) as count FROM "${table.tablename}"`);
              return {
                ...table,
                row_count: parseInt(countResult.rows[0].count)
              };
            } catch (e) {
              return { ...table, row_count: 'Error' };
            }
          })
        );
        
        return NextResponse.json({ tables: tablesWithCounts });

      case 'schema':
        if (!tableName) {
          return NextResponse.json({ error: 'Table name required' }, { status: 400 });
        }
        
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `;
        const columns = await query(columnsQuery, [tableName]);
        
        return NextResponse.json({ 
          table: tableName,
          columns: columns.rows 
        });

      case 'sample':
        if (!tableName) {
          return NextResponse.json({ error: 'Table name required' }, { status: 400 });
        }
        
        const sampleQuery = `SELECT * FROM "${tableName}" LIMIT $1`;
        const sample = await query(sampleQuery, [limit]);
        
        return NextResponse.json({
          table: tableName,
          limit: limit,
          row_count: sample.rows.length,
          data: sample.rows
        });

      case 'relationships':
        // Find foreign key relationships
        const fkQuery = `
          SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          ORDER BY tc.table_name, kcu.column_name;
        `;
        const relationships = await query(fkQuery);
        
        return NextResponse.json({ relationships: relationships.rows });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Database explorer error:', error);
    return NextResponse.json(
      { 
        error: 'Database exploration failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}