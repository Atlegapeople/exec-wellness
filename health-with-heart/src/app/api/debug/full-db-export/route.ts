import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET() {
  try {
    // Single comprehensive query to get everything I need
    const fullExportQuery = `
      WITH table_info AS (
        SELECT 
          t.table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ),
      
      column_info AS (
        SELECT 
          c.table_name,
          json_agg(
            json_build_object(
              'column_name', c.column_name,
              'data_type', c.data_type,
              'is_nullable', c.is_nullable,
              'column_default', c.column_default,
              'character_maximum_length', c.character_maximum_length,
              'ordinal_position', c.ordinal_position
            ) ORDER BY c.ordinal_position
          ) as columns
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        GROUP BY c.table_name
      ),
      
      foreign_keys AS (
        SELECT
          json_agg(
            json_build_object(
              'table_name', tc.table_name,
              'column_name', kcu.column_name,
              'foreign_table_name', ccu.table_name,
              'foreign_column_name', ccu.column_name,
              'constraint_name', tc.constraint_name
            )
          ) as relationships
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      )
      
      SELECT 
        json_build_object(
          'database_overview', json_build_object(
            'total_tables', (SELECT COUNT(*) FROM table_info),
            'generation_time', NOW()
          ),
          'tables', (
            SELECT json_agg(
              json_build_object(
                'table_name', ti.table_name,
                'column_count', ti.column_count,
                'columns', ci.columns
              )
            )
            FROM table_info ti
            JOIN column_info ci ON ti.table_name = ci.table_name
            ORDER BY ti.table_name
          ),
          'relationships', (SELECT relationships FROM foreign_keys)
        ) as complete_schema;
    `;

    const result = await query(fullExportQuery);
    const schemaData = result.rows[0].complete_schema;

    // Now get row counts and sample data for key tables
    const keyTables = ['medical_report', 'employee', 'appointments', 'employee_medical_history'];
    const tableData: any = {};

    for (const tableName of keyTables) {
      try {
        // Get row count
        const countResult = await query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const rowCount = parseInt(countResult.rows[0].count);

        // Get sample data (first 3 rows)
        const sampleResult = await query(`SELECT * FROM "${tableName}" LIMIT 3`);

        // Get distinct values for key columns if the table exists
        let distinctValues = {};
        if (tableName === 'medical_report') {
          try {
            const statusResult = await query(`SELECT report_work_status, COUNT(*) as count FROM medical_report WHERE report_work_status IS NOT NULL GROUP BY report_work_status ORDER BY count DESC LIMIT 10`);
            const typeResult = await query(`SELECT type, COUNT(*) as count FROM medical_report WHERE type IS NOT NULL GROUP BY type ORDER BY count DESC LIMIT 10`);
            distinctValues = {
              report_work_status_values: statusResult.rows,
              type_values: typeResult.rows
            };
          } catch (e) {
            distinctValues = { error: 'Could not fetch distinct values' };
          }
        }

        if (tableName === 'employee') {
          try {
            const ageStats = await query(`
              SELECT 
                COUNT(*) as total_employees,
                COUNT(date_of_birth) as with_birth_date,
                AVG(EXTRACT(YEAR FROM AGE(date_of_birth))) as avg_age,
                MIN(EXTRACT(YEAR FROM AGE(date_of_birth))) as min_age,
                MAX(EXTRACT(YEAR FROM AGE(date_of_birth))) as max_age
              FROM employee 
              WHERE date_of_birth IS NOT NULL
            `);
            distinctValues = {
              age_statistics: ageStats.rows[0]
            };
          } catch (e) {
            distinctValues = { error: 'Could not fetch age statistics' };
          }
        }

        tableData[tableName] = {
          row_count: rowCount,
          sample_data: sampleResult.rows,
          distinct_values: distinctValues
        };

      } catch (error) {
        tableData[tableName] = { 
          error: `Could not access table: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
    }

    // Combine everything
    const completeExport = {
      ...schemaData,
      table_data: tableData,
      export_timestamp: new Date().toISOString(),
      summary: {
        total_tables: schemaData.tables?.length || 0,
        key_tables_analyzed: Object.keys(tableData).length,
        has_medical_data: tableData.medical_report?.row_count > 0,
        has_employee_data: tableData.employee?.row_count > 0,
        has_appointment_data: tableData.appointments?.row_count > 0
      }
    };

    return NextResponse.json(completeExport, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="ohms_database_export.json"'
      }
    });

  } catch (error) {
    console.error('Full database export error:', error);
    return NextResponse.json(
      { 
        error: 'Database export failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}