'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ambulance, Eye, Plus, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeEmergencyResponsesProps {
  employeeId: string;
}

export default function EmployeeEmergencyResponses({ employeeId }: EmployeeEmergencyResponsesProps) {
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
          <span>Failed to load emergency responses</span>
        </div>
      </Card>
    );
  }

  const emergencyData = statusData.find(module => module.table_name === 'emergency_responses');
  
  if (!emergencyData) {
    return (
      <div className="text-xs text-gray-500">
        No emergency response data available
      </div>
    );
  }

  const handleViewEmergencies = () => {
    router.push(`/emergency-responses?employee=${employeeId}`);
  };

  const handleAddEmergency = () => {
    router.push(`/emergency-responses?employee=${employeeId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ambulance className="h-4 w-4 text-red-600" />
          <div className="text-xs font-medium text-gray-900">Emergency Responses</div>
        </div>
        <Badge 
          variant={emergencyData.has_records ? "destructive" : "secondary"}
          className="text-xs"
        >
          {emergencyData.record_count} incidents
        </Badge>
      </div>
      
      <div className={`rounded-lg p-3 ${
        emergencyData.has_records 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>
              {emergencyData.has_records 
                ? `${emergencyData.record_count} emergency response${emergencyData.record_count !== 1 ? 's' : ''} documented`
                : 'No emergency responses recorded'
              }
            </span>
          </div>
          <div className="flex gap-1">
            {emergencyData.has_records && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewEmergencies}
                className="h-6 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddEmergency}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        {emergencyData.has_records && (
          <div className="mt-2 pt-2 border-t border-red-200">
            <div className="flex items-center gap-2 text-xs text-red-700">
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                Historical emergency incidents - Review for safety patterns
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}