import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface Employee {
  employee_id: string;
  name: string;
  surname: string;
  gender: string;
  age: number;
  ethnicity: string;
  marriage_status: string;
  organisation: string;
  workplace: string;
  job: string;
  medical_aid: string;
  date_created: string;
  work_email: string;
  mobile_number: string;
}

interface EmployeeInsights {
  totalEmployees: number;
  organizationBreakdown: Array<{
    name: string;
    count: number;
    workplaces: Array<{
      name: string;
      count: number;
      jobs: Array<{
        name: string;
        count: number;
        employees: Employee[];
      }>;
    }>;
  }>;
  demographicsBreakdown: {
    gender: Array<{ name: string; count: number; percentage: number }>;
    ethnicity: Array<{ name: string; count: number; percentage: number }>;
    ageGroups: Array<{ name: string; count: number; percentage: number; avgAge: number }>;
    maritalStatus: Array<{ name: string; count: number; percentage: number }>;
  };
  medicalAidBreakdown: Array<{ name: string; count: number; percentage: number }>;
  timeSeriesData: Array<{ month: string; count: number; cumulative: number }>;
}


function getAgeGroup(age: number): string {
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

function processEmployeeData(employees: Employee[]): EmployeeInsights {
  const totalEmployees = employees.length;

  // Organization breakdown with drill-down hierarchy
  const orgMap = new Map<string, Map<string, Map<string, Employee[]>>>();
  
  employees.forEach(emp => {
    if (!orgMap.has(emp.organisation)) {
      orgMap.set(emp.organisation, new Map());
    }
    const workplaces = orgMap.get(emp.organisation)!;
    
    if (!workplaces.has(emp.workplace)) {
      workplaces.set(emp.workplace, new Map());
    }
    const jobs = workplaces.get(emp.workplace)!;
    
    if (!jobs.has(emp.job)) {
      jobs.set(emp.job, []);
    }
    jobs.get(emp.job)!.push(emp);
  });

  const organizationBreakdown = Array.from(orgMap.entries()).map(([orgName, workplaces]) => {
    const workplaceBreakdown = Array.from(workplaces.entries()).map(([workplaceName, jobs]) => {
      const jobBreakdown = Array.from(jobs.entries()).map(([jobName, employees]) => ({
        name: jobName === 'Unknown' ? 'Unassigned' : jobName,
        count: employees.length,
        employees: employees
      }));
      
      return {
        name: workplaceName === 'Unknown' ? 'Unassigned' : workplaceName,
        count: Array.from(jobs.values()).flat().length,
        jobs: jobBreakdown.sort((a, b) => b.count - a.count)
      };
    });
    
    return {
      name: orgName === 'Unknown' ? 'Unassigned' : orgName,
      count: Array.from(workplaces.values()).flat().flat().length,
      workplaces: workplaceBreakdown.sort((a, b) => b.count - a.count)
    };
  }).sort((a, b) => b.count - a.count);

  // Demographics breakdown with normalized labels
  const genderCounts = employees.reduce((acc, emp) => {
    let gender = emp.gender || 'Unknown';
    // Normalize gender labels
    if (gender.toLowerCase() === 'male') gender = 'Male';
    if (gender.toLowerCase() === 'female') gender = 'Female';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ethnicityCounts = employees.reduce((acc, emp) => {
    let ethnicity = emp.ethnicity || 'Unknown';
    // Normalize ethnicity labels
    if (ethnicity.toLowerCase() === 'african') ethnicity = 'African';
    if (ethnicity.toLowerCase() === 'caucasian') ethnicity = 'Caucasian';
    if (ethnicity.toLowerCase() === 'coloured') ethnicity = 'Coloured';
    if (ethnicity.toLowerCase() === 'indian') ethnicity = 'Indian';
    if (ethnicity.toLowerCase() === 'asian') ethnicity = 'Asian';
    acc[ethnicity] = (acc[ethnicity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageGroupCounts = employees.reduce((acc, emp) => {
    const group = getAgeGroup(emp.age);
    if (!acc[group]) {
      acc[group] = { count: 0, totalAge: 0 };
    }
    acc[group].count++;
    acc[group].totalAge += emp.age;
    return acc;
  }, {} as Record<string, { count: number; totalAge: number }>);

  const maritalCounts = employees.reduce((acc, emp) => {
    let status = emp.marriage_status || 'Unknown';
    // Normalize marital status labels
    if (status.toLowerCase() === 'married') status = 'Married';
    if (status.toLowerCase() === 'single') status = 'Single';
    if (status.toLowerCase() === 'divorced') status = 'Divorced';
    if (status.toLowerCase() === 'widowed') status = 'Widowed';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const demographicsBreakdown = {
    gender: Object.entries(genderCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    })).sort((a, b) => b.count - a.count),
    
    ethnicity: Object.entries(ethnicityCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    })).sort((a, b) => b.count - a.count),
    
    ageGroups: Object.entries(ageGroupCounts).map(([name, data]) => ({
      name,
      count: data.count,
      percentage: Math.round((data.count / totalEmployees) * 100),
      avgAge: Math.round(data.totalAge / data.count)
    })).sort((a, b) => {
      const order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    }),
    
    maritalStatus: Object.entries(maritalCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalEmployees) * 100)
    })).sort((a, b) => b.count - a.count)
  };

  // Medical Aid breakdown with normalized names
  const medicalAidCounts = employees.reduce((acc, emp) => {
    let aid = emp.medical_aid === 'None' || !emp.medical_aid ? 'No Medical Aid' : emp.medical_aid;
    
    // Normalize medical aid names
    aid = aid.replace(/MEDICAL SCHEME/gi, '').replace(/HEALTH/gi, '').trim();
    if (aid.toUpperCase().includes('BANKMED')) aid = 'Bankmed';
    if (aid.toUpperCase().includes('DISCOVERY')) aid = 'Discovery Health';
    if (aid.toUpperCase().includes('GEMS')) aid = 'GEMS';
    if (aid.toUpperCase().includes('BESTMED')) aid = 'Bestmed';
    
    acc[aid] = (acc[aid] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const medicalAidBreakdown = Object.entries(medicalAidCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalEmployees) * 100)
  })).sort((a, b) => b.count - a.count);

  // Time series data (patient registration by month)
  const monthlyData = employees
    .filter(emp => emp.date_created)
    .sort((a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime())
    .reduce((acc, emp) => {
      const month = new Date(emp.date_created).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const timeSeriesData = Object.entries(monthlyData).map(([month, count], index, arr) => {
    const cumulative = arr.slice(0, index + 1).reduce((sum, [, c]) => sum + c, 0);
    return {
      month,
      count,
      cumulative
    };
  });

  return {
    totalEmployees,
    organizationBreakdown,
    demographicsBreakdown,
    medicalAidBreakdown,
    timeSeriesData
  };
}

export async function GET() {
  try {
    // Get employees who have Executive Medical reports using the correct view and structure
    const employeeQuery = `
      SELECT DISTINCT
        e.employee_id,
        e.name,
        e.surname,
        e.gender,
        e.date_of_birth,
        e.age,
        e.ethnicity,
        e.marriage_status,
        e.organisation as organisation_id,
        o.name as organisation_name,
        e.workplace as workplace_name,
        e.job,
        e.medical_aid,
        e.date_created,
        e.work_email,
        e.mobile_number
      FROM prod.stg_ohms__employees e
      LEFT JOIN organisation o ON o.id = e.organisation
      WHERE e.employee_id IN (
        SELECT mr.employee_id 
        FROM medical_report mr
        WHERE mr.type = 'Executive Medical'
      )
      AND e.name IS NOT NULL 
      AND e.surname IS NOT NULL
      ORDER BY e.date_created DESC
    `;
    
    const result = await query(employeeQuery);
    const employees = result.rows.map(row => ({
      employee_id: row.employee_id,
      name: row.name,
      surname: row.surname,
      gender: row.gender || 'Unknown',
      age: parseInt(row.age) || 0,
      ethnicity: row.ethnicity || 'Unknown',
      marriage_status: row.marriage_status || 'Unknown',
      organisation: row.organisation_name || 'Unknown Organization',
      workplace: row.workplace_name || 'Unknown Workplace',
      job: row.job || 'Unknown',
      medical_aid: row.medical_aid || 'None',
      date_created: row.date_created,
      work_email: row.work_email,
      mobile_number: row.mobile_number
    }));


    const insights = processEmployeeData(employees);
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error processing employee data:', error);
    return NextResponse.json(
      { error: 'Failed to load employee insights' },
      { status: 500 }
    );
  }
}