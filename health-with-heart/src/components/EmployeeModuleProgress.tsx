'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface EmployeeModuleProgressProps {
  employeeId: string;
}

export default function EmployeeModuleProgress({ employeeId }: EmployeeModuleProgressProps) {
  const { statusData, loading, error } = useEmployeeStatus(employeeId);

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

  if (!statusData.length) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Health Module Completion</div>
        <div className="text-xs text-gray-500">No module data available</div>
      </div>
    );
  }

  const activeModules = statusData.filter(module => module.has_records).length;
  const totalModules = statusData.length;
  const completionPercentage = totalModules > 0 ? (activeModules / totalModules) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-900">Module Completion</div>
        <div className="text-xs text-gray-600">
          {activeModules} / {totalModules}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-500" 
          style={{ 
            width: `${completionPercentage}%`,
            background: `hsl(${completionPercentage * 1.2}, 70%, 50%)`
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {completionPercentage.toFixed(0)}% complete
        </span>
        <span>
          {totalModules - activeModules} remaining
        </span>
      </div>
    </div>
  );
}