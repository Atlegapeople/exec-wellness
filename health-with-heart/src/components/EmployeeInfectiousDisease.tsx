'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, Eye, Plus, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeInfectiousDiseaseProps {
  employeeId: string;
}

export default function EmployeeInfectiousDisease({ employeeId }: EmployeeInfectiousDiseaseProps) {
  const router = useRouter();
  const { statusData, loading, error } = useEmployeeStatus(employeeId);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-3 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-800 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load infectious disease data</span>
        </div>
      </Card>
    );
  }

  const infectiousData = statusData.find(module => module.table_name === 'infectiouse_disease');
  
  if (!infectiousData) {
    return (
      <div className="text-xs text-gray-500">
        No infectious disease data available
      </div>
    );
  }

  const handleViewInfectious = () => {
    router.push(`/employees?employee=${employeeId}`);
  };

  const handleAddInfectious = () => {
    router.push(`/employees?employee=${employeeId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" />
          <div className="text-xs font-medium text-gray-900">Infectious Disease</div>
        </div>
        <Badge 
          variant={infectiousData.has_records ? "destructive" : "secondary"}
          className="text-xs"
        >
          {infectiousData.record_count} screenings
        </Badge>
      </div>
      
      <div className={`rounded-lg p-3 ${
        infectiousData.has_records 
          ? 'bg-purple-50 border border-purple-200' 
          : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>
              {infectiousData.has_records 
                ? `${infectiousData.record_count} infectious disease screening${infectiousData.record_count !== 1 ? 's' : ''} completed`
                : 'No infectious disease screenings'
              }
            </span>
          </div>
          <div className="flex gap-1">
            {infectiousData.has_records && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewInfectious}
                className="h-6 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddInfectious}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        {infectiousData.has_records && (
          <div className="mt-2 pt-2 border-t border-purple-200">
            <div className="flex items-center gap-2 text-xs text-purple-700">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">
                Requires monitoring - Infectious disease protocols may apply
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}