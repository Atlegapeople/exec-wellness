'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeComplaintsProps {
  employeeId: string;
}

export default function EmployeeComplaints({ employeeId }: EmployeeComplaintsProps) {
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
          <span>Failed to load complaints</span>
        </div>
      </Card>
    );
  }

  const complaintsData = statusData.find(module => module.table_name === 'current_complaints');
  
  if (!complaintsData) {
    return (
      <div className="text-xs" style={{ color: '#759282' }}>
        No complaints data available
      </div>
    );
  }

  const handleViewComplaints = () => {
    router.push(`/employees?employee=${employeeId}`);
  };

  const handleAddComplaint = () => {
    router.push(`/employees?employee=${employeeId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" style={{ color: '#EAB75C' }} />
          <div className="text-xs font-medium" style={{ color: '#586D6A' }}>Current Complaints</div>
        </div>
        <Badge 
          variant={complaintsData.has_records ? "destructive" : "secondary"}
          className="text-xs"
        >
          {complaintsData.record_count} reported
        </Badge>
      </div>
      
      <div className="rounded-lg p-3" style={{
        backgroundColor: complaintsData.has_records ? '#EADC99' : '#F2EFED',
        border: complaintsData.has_records ? '1px solid #EAB75C' : 'none'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#759282' }}>
            <span>
              {complaintsData.has_records 
                ? `${complaintsData.record_count} complaint${complaintsData.record_count !== 1 ? 's' : ''} reported`
                : 'No complaints reported'
              }
            </span>
          </div>
          <div className="flex gap-1">
            {complaintsData.has_records && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewComplaints}
                className="h-6 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddComplaint}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
        
        {complaintsData.has_records && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: '#EAB75C' }}>
            <div className="text-xs font-medium" style={{ color: '#D65241' }}>
              ⚠️ Requires attention - Employee complaints need review
            </div>
          </div>
        )}
      </div>
    </div>
  );
}