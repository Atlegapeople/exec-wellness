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
      if (['documents', 'current_complaints', 'emergency_responses', 'infectiouse_disease', 'assesment', 'clinical_examinations', 'screening_tb', 'noise', 'eyesight'].includes(status.table_name)) return false;
      
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
    <div className="bg-white/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg shadow-teal-100/30 border border-teal-200/30">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs font-semibold text-teal-800">Module Completion</div>
        <div className="text-xs font-bold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
          {activeModules} / {totalModules}
        </div>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2 mb-1.5 shadow-inner">
        <div 
          className="h-2 rounded-full transition-all duration-700 ease-out shadow-sm" 
          style={{ 
            width: `${completionPercentage}%`,
            background: `linear-gradient(90deg, hsl(${completionPercentage * 1.2}, 65%, 55%), hsl(${completionPercentage * 1.2 + 20}, 70%, 60%))`
          }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-bold text-slate-800">
            {completionPercentage.toFixed(0)}%
          </div>
          <span className="text-[10px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">
            complete
          </span>
        </div>
        <div className="text-[10px] text-slate-500 bg-slate-50 rounded-full px-1.5 py-0.5">
          {totalModules - activeModules} remaining
        </div>
      </div>
    </div>
  );
}