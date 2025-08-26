// Utility functions for treatment plan integration

export interface TreatmentPlanSummary {
  employee_id: string;
  employee_name: string;
  total_reports: number;
  total_actions: number;
  has_actions: boolean;
  medical_staff: {
    doctors: string[];
    nurses: string[];
  };
}

// Cache for treatment plan index to avoid multiple fetches
let treatmentIndexCache: any = null;

/**
 * Load the treatment plan index with caching
 */
export async function loadTreatmentPlanIndex(): Promise<any> {
  if (treatmentIndexCache) {
    return treatmentIndexCache;
  }

  try {
    const response = await fetch('/treatment_plan_index.json', {
      cache: 'force-cache' // Cache the index file
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    treatmentIndexCache = await response.json();
    console.log('Treatment plan index loaded:', treatmentIndexCache.summary_statistics);
    
    return treatmentIndexCache;
  } catch (error) {
    console.error('Failed to load treatment plan index:', error);
    return null;
  }
}

/**
 * Check if a treatment plan exists for an employee
 */
export async function hasTreatmentPlan(employeeId: string): Promise<boolean> {
  try {
    const index = await loadTreatmentPlanIndex();
    if (!index || !index.employees) return false;
    
    return index.employees.some((emp: any) => emp.employee_id === employeeId);
  } catch (error) {
    console.error('Error checking treatment plan existence:', error);
    return false;
  }
}

/**
 * Get treatment plan summary from index (without loading full plan)
 */
export async function getTreatmentPlanSummary(employeeId: string): Promise<TreatmentPlanSummary | null> {
  try {
    const index = await loadTreatmentPlanIndex();
    if (!index || !index.employees) return null;
    
    const employee = index.employees.find((emp: any) => emp.employee_id === employeeId);
    if (!employee) return null;
    
    return {
      employee_id: employee.employee_id,
      employee_name: employee.employee_name,
      total_reports: employee.total_reports,
      total_actions: employee.total_actions,
      has_actions: employee.has_actions,
      medical_staff: employee.medical_staff
    };
  } catch (error) {
    console.error('Error getting treatment plan summary:', error);
    return null;
  }
}

/**
 * Load full treatment plan for an employee
 */
export async function loadFullTreatmentPlan(employeeId: string): Promise<any> {
  try {
    const response = await fetch(`/output/json/treatment_plan_${employeeId}.json`, {
      cache: 'default' // Allow caching of individual treatment plans
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No treatment plan found for employee: ${employeeId}`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading full treatment plan:', error);
    return null;
  }
}

/**
 * Search employees in treatment plan index
 */
export async function searchTreatmentPlans(query?: string, hasActions?: boolean): Promise<TreatmentPlanSummary[]> {
  try {
    const index = await loadTreatmentPlanIndex();
    if (!index || !index.employees) return [];
    
    let results = index.employees;
    
    // Filter by search query
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter((emp: any) => 
        emp.employee_name.toLowerCase().includes(searchTerm) ||
        emp.employee_id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by has actions
    if (hasActions !== undefined) {
      results = results.filter((emp: any) => emp.has_actions === hasActions);
    }
    
    return results.map((emp: any) => ({
      employee_id: emp.employee_id,
      employee_name: emp.employee_name,
      total_reports: emp.total_reports,
      total_actions: emp.total_actions,
      has_actions: emp.has_actions,
      medical_staff: emp.medical_staff
    }));
  } catch (error) {
    console.error('Error searching treatment plans:', error);
    return [];
  }
}

/**
 * Get treatment plan statistics
 */
export async function getTreatmentPlanStats(): Promise<any> {
  try {
    const index = await loadTreatmentPlanIndex();
    if (!index) return null;
    
    return index.summary_statistics;
  } catch (error) {
    console.error('Error getting treatment plan stats:', error);
    return null;
  }
}

/**
 * Debug function to log employee ID matching
 */
export function debugEmployeeIdMatching(employeeId: string) {
  console.group(`🔍 Treatment Plan Debug - Employee ID: ${employeeId}`);
  console.log('Employee ID length:', employeeId.length);
  console.log('Employee ID type:', typeof employeeId);
  console.log('Employee ID (trimmed):', employeeId.trim());
  console.log('Expected file path:', `/output/json/treatment_plan_${employeeId}.json`);
  
  // Test if the file exists by attempting to fetch it
  fetch(`/output/json/treatment_plan_${employeeId}.json`)
    .then(response => {
      console.log('File fetch status:', response.status);
      console.log('File exists:', response.ok);
      if (!response.ok && response.status === 404) {
        console.warn('Treatment plan file not found for this employee');
      }
    })
    .catch(error => {
      console.error('Error testing file existence:', error);
    })
    .finally(() => {
      console.groupEnd();
    });
}

// Export utility for clearing cache (useful for development)
export function clearTreatmentPlanCache() {
  treatmentIndexCache = null;
  console.log('Treatment plan cache cleared');
}