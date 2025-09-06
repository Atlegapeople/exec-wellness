'use client';

import { useMemo } from 'react';
import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Employee } from '@/types';

interface EmployeeModuleProgressProps {
  employeeId: string;
  employee: Employee;
}

export default function EmployeeModuleProgress({ employeeId, employee }: EmployeeModuleProgressProps) {
  const { statusData, loading, error } = useEmployeeStatus(employeeId);

  // Filter modules to match 360 view (exclude documents, complaints, emergency responses, infectious disease, assessments, clinical examinations, TB screening, and gender-specific modules)
  const filteredStatusData = useMemo(() => {
    if (!statusData.length) return [];

    const employeeGender = employee.gender?.toLowerCase();
    return statusData.filter(status => {
      // Always exclude documents, current complaints, emergency responses, infectious disease, assessments, clinical examinations (duplicate), and TB screening
      if (['documents', 'current_complaints', 'emergency_responses', 'infectiouse_disease', 'assesment', 'clinical_examinations', 'screening_tb'].includes(status.table_name)) return false;
      
      // Filter gender-specific modules
      if (status.table_name === 'mens_health' && employeeGender !== 'male' && employeeGender !== 'm') {
        return false;
      }
      if (status.table_name === 'womens_health' && employeeGender !== 'female' && employeeGender !== 'f') {
        return false;
      }
      
      return true;
    });
  }, [statusData, employee.gender]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-3 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-800 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load module status</span>
        </div>
      </Card>
    );
  }

  if (!filteredStatusData.length) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Health Module Completion</div>
        <div className="text-xs text-gray-500">No module data available</div>
      </div>
    );
  }

  const activeModules = filteredStatusData.filter(module => module.has_records).length;
  const totalModules = filteredStatusData.length;
  const completionPercentage = totalModules > 0 ? (activeModules / totalModules) * 100 : 0;

  return (
    <div className="backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border" style={{ backgroundColor: 'rgba(242, 239, 237, 0.95)', borderColor: 'rgba(183, 214, 206, 0.3)', boxShadow: '0 10px 15px -3px rgba(183, 214, 206, 0.3)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs font-semibold" style={{ color: '#56969D' }}>Module Completion</div>
        <div className="text-xs font-bold rounded-full px-2 py-0.5" style={{ color: '#178089', backgroundColor: '#B6D9CE' }}>
          {activeModules} / {totalModules}
        </div>
      </div>
      
      <div className="w-full rounded-full h-2 mb-1.5 shadow-inner" style={{ backgroundColor: '#D7D9D9' }}>
        <div 
          className="h-2 rounded-full transition-all duration-700 ease-out shadow-sm" 
          style={{ 
            width: `${completionPercentage}%`,
            background: completionPercentage >= 80 ? 
              'linear-gradient(90deg, #B4CABC, #759282)' : // Sage to Fern for high completion
              completionPercentage >= 50 ? 
              'linear-gradient(90deg, #EAB75C, #EADC99)' : // Daisy to Warm Light for medium completion
              'linear-gradient(90deg, #E19985, #D65241)' // Coral to Sunset for low completion
          }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-bold" style={{ color: '#586D6A' }}>
            {completionPercentage.toFixed(0)}%
          </div>
          <span className="text-[10px] rounded-full px-1.5 py-0.5" style={{ color: '#759282', backgroundColor: '#E6DDD6' }}>
            complete
          </span>
        </div>
        <div className="text-[10px] rounded-full px-1.5 py-0.5" style={{ color: '#759282', backgroundColor: '#F2EFED' }}>
          {totalModules - activeModules} remaining
        </div>
      </div>
    </div>
  );
}