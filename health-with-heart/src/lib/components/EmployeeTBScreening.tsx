'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity, Stethoscope, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeTBScreeningProps {
  employeeId: string;
}

export default function EmployeeTBScreening({ employeeId }: EmployeeTBScreeningProps) {
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
        <div className="flex items-center gap-2 text-sm" style={{ color: '#D65241' }}>
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load TB screening data</span>
        </div>
      </Card>
    );
  }

  const tbData = statusData.find(module => module.table_name === 'screening_tb');
  
  if (!tbData) {
    return (
      <div className="text-xs" style={{ color: '#759282' }}>
        No TB screening data available
      </div>
    );
  }

  const handleViewTBScreening = () => {
    router.push(`/employees?employee=${employeeId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4" style={{ color: '#178089' }} />
          <div className="text-xs font-medium" style={{ color: '#586D6A' }}>TB Screening</div>
        </div>
        <Badge 
          variant={tbData.has_records ? "default" : "secondary"}
          className="text-xs"
        >
          {tbData.record_count} completed
        </Badge>
      </div>
      
      <div className="rounded-lg p-3" style={{
        backgroundColor: tbData.has_records ? '#B6D9CE' : '#F2EFED',
        border: tbData.has_records ? '1px solid #56969D' : 'none'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#759282' }}>
            <span>
              {tbData.has_records 
                ? `${tbData.record_count} screening${tbData.record_count !== 1 ? 's' : ''} completed`
                : 'No TB screenings completed'
              }
            </span>
          </div>
          <div className="flex gap-1">
            {tbData.has_records && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewTBScreening}
                className="h-6 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewTBScreening}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        </div>
        
        {tbData.has_records && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: '#56969D' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#178089' }}>
              <Activity className="h-3 w-3" />
              <span className="font-medium">
                TB screenings completed - Monitor for health trends
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}