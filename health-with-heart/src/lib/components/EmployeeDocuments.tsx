'use client';

import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileText, Download, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeDocumentsProps {
  employeeId: string;
}

export default function EmployeeDocuments({ employeeId }: EmployeeDocumentsProps) {
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
          <span>Failed to load documents</span>
        </div>
      </Card>
    );
  }

  const documentsData = statusData.find(module => module.table_name === 'documents');
  
  if (!documentsData) {
    return (
      <div className="text-xs" style={{ color: '#759282' }}>
        No document data available
      </div>
    );
  }

  const handleViewDocuments = () => {
    router.push(`/employees?employee=${employeeId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" style={{ color: '#178089' }} />
          <div className="text-xs font-medium" style={{ color: '#586D6A' }}>Documents</div>
        </div>
        <Badge 
          variant={documentsData.has_records ? "default" : "secondary"}
          className="text-xs"
        >
          {documentsData.record_count} documents
        </Badge>
      </div>
      
      <div className="rounded-lg p-3" style={{ backgroundColor: '#F2EFED' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#759282' }}>
            <span>
              {documentsData.has_records 
                ? `${documentsData.record_count} document${documentsData.record_count !== 1 ? 's' : ''} on file`
                : 'No documents available'
              }
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDocuments}
              className="h-6 px-2 text-xs"
              disabled={!documentsData.has_records}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {documentsData.has_records && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewDocuments}
                className="h-6 px-2 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}