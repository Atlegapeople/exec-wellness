import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

const TABLE_DISPLAY_NAMES = {
  'medical_report': 'Medical Reports',
  'appointments': 'Appointments',
  'vitals_clinical_metrics': 'Vitals & Clinical Metrics',
  'clinical_examinations': 'Clinical Examinations',
  'assesment': 'Assessments',
  'employee_medical_history': 'Medical History',
  'emergency_responses': 'Emergency Responses',
  'documents': 'Documents',
  'eyesight': 'Eyesight Screening',
  'noise': 'Noise Assessment',
  'mental_health': 'Mental Health',
  'infectiouse_disease': 'Infectious Disease',
  'mens_health': "Men's Health",
  'womens_health': "Women's Health",
  'lab_tests': 'Lab Tests',
  'lifestyle': 'Lifestyle Assessment',
  'current_complaints': 'Current Complaints',
  'screening_tb': 'TB Screening',
  'special_investigations': 'Special Investigations',
  'symptom_screening': 'Symptom Screening'
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const statusQuery = `
      SELECT 'medical_report' AS table_name,
             COUNT(mr.id) AS record_count,
             (COUNT(mr.id) > 0) AS has_records
      FROM employee e
      LEFT JOIN medical_report mr ON mr.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'appointments',
             COUNT(a.id),
             (COUNT(a.id) > 0)
      FROM employee e
      LEFT JOIN appointments a ON a.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'vitals_clinical_metrics',
             COUNT(v.id),
             (COUNT(v.id) > 0)
      FROM employee e
      LEFT JOIN vitals_clinical_metrics v ON v.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'clinical_examinations',
             COUNT(ce.id),
             (COUNT(ce.id) > 0)
      FROM employee e
      LEFT JOIN clinical_examinations ce ON ce.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'assesment',
             COUNT(asmt.id),
             (COUNT(asmt.id) > 0)
      FROM employee e
      LEFT JOIN assesment asmt ON asmt.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'employee_medical_history',
             COUNT(mh.id),
             (COUNT(mh.id) > 0)
      FROM employee e
      LEFT JOIN employee_medical_history mh ON mh.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'emergency_responses',
             COUNT(er.id),
             (COUNT(er.id) > 0)
      FROM employee e
      LEFT JOIN emergency_responses er ON er.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'documents',
             COUNT(d.id),
             (COUNT(d.id) > 0)
      FROM employee e
      LEFT JOIN documents d ON d.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'eyesight',
             COUNT(es.id),
             (COUNT(es.id) > 0)
      FROM employee e
      LEFT JOIN eyesight es ON es.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'noise',
             COUNT(no.id),
             (COUNT(no.id) > 0)
      FROM employee e
      LEFT JOIN noise no ON no.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'mental_health',
             COUNT(mh2.id),
             (COUNT(mh2.id) > 0)
      FROM employee e
      LEFT JOIN mental_health mh2 ON mh2.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'infectiouse_disease',
             COUNT(idz.id),
             (COUNT(idz.id) > 0)
      FROM employee e
      LEFT JOIN infectiouse_disease idz ON idz.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'mens_health',
             COUNT(men.id),
             (COUNT(men.id) > 0)
      FROM employee e
      LEFT JOIN mens_health men ON men.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'lab_tests',
             COUNT(lt.id),
             (COUNT(lt.id) > 0)
      FROM employee e
      LEFT JOIN lab_tests lt ON lt.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'lifestyle',
             COUNT(ls.id),
             (COUNT(ls.id) > 0)
      FROM employee e
      LEFT JOIN lifestyle ls ON ls.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'current_complaints',
             COUNT(cc.id),
             (COUNT(cc.id) > 0)
      FROM employee e
      LEFT JOIN current_complaints cc ON cc.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'womens_health',
             COUNT(wm.id),
             (COUNT(wm.id) > 0)
      FROM employee e
      LEFT JOIN womens_health wm ON wm.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'screening_tb',
             COUNT(tb.id),
             (COUNT(tb.id) > 0)
      FROM employee e
      LEFT JOIN screening_tb tb ON tb.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'special_investigations',
             COUNT(si.id),
             (COUNT(si.id) > 0)
      FROM employee e
      LEFT JOIN special_investigations si ON si.employee_id = e.id
      WHERE e.id = $1

      UNION ALL
      SELECT 'symptom_screening',
             COUNT(ss.id),
             (COUNT(ss.id) > 0)
      FROM employee e
      LEFT JOIN symptom_screening ss ON ss.employee_id = e.id
      WHERE e.id = $1
    `;

    const result = await query(statusQuery, [employeeId]);

    const statusData = result.rows.map((row: any) => ({
      table_name: row.table_name,
      record_count: parseInt(row.record_count),
      has_records: row.has_records,
      display_name: TABLE_DISPLAY_NAMES[row.table_name as keyof typeof TABLE_DISPLAY_NAMES] || row.table_name,
      status: row.has_records ? 'Active' : 'Inactive'
    }));

    return NextResponse.json(statusData);
  } catch (error) {
    console.error('Error fetching employee status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee status' },
      { status: 500 }
    );
  }
}