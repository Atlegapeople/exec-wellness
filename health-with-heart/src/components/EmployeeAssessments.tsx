'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ClipboardList, Eye, Plus, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeAssessmentsProps {
  employeeId: string;
}

export default function EmployeeAssessments({ employeeId }: EmployeeAssessmentsProps) {
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
          <span>Failed to load assessments</span>
        </div>
      </Card>
    );
  }

  const assessmentsData = statusData.find(module => module.table_name === 'assesment');
  
  if (!assessmentsData) {
    return (
      <div className="text-xs text-gray-500">
        No assessment data available
      </div>
    );
  }

  const handleViewAssessments = () => {
    router.push(`/assessments?employee=${employeeId}`);
  };

  const handleAddAssessment = () => {
    router.push(`/assessments?employee=${employeeId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-blue-600" />
          <div className="text-xs font-medium text-gray-900">Assessments</div>
        </div>
        <Badge 
          variant={assessmentsData.has_records ? "default" : "secondary"}
          className="text-xs"
        >
          {assessmentsData.record_count} completed
        </Badge>
      </div>
      
      <div className={`rounded-lg p-3 ${
        assessmentsData.has_records 
          ? 'bg-blue-50 border border-blue-200' 
          : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>
              {assessmentsData.has_records 
                ? `${assessmentsData.record_count} assessment${assessmentsData.record_count !== 1 ? 's' : ''} completed`
                : 'No assessments completed'
              }
            </span>
          </div>
          <div className="flex gap-1">
            {assessmentsData.has_records && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewAssessments}
                className="h-6 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddAssessment}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </div>
        
        {assessmentsData.has_records && (
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <CheckCircle className="h-3 w-3" />
              <span className="font-medium">
                Health assessments completed - Review for trends and follow-ups
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}