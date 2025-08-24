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
        <div className="flex items-center gap-2 text-red-800 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load documents</span>
        </div>
      </Card>
    );
  }

  const documentsData = statusData.find(module => module.table_name === 'documents');
  
  if (!documentsData) {
    return (
      <div className="text-xs text-gray-500">
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
          <FileText className="h-4 w-4 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Documents</div>
        </div>
        <Badge 
          variant={documentsData.has_records ? "default" : "secondary"}
          className="text-xs"
        >
          {documentsData.record_count} files
        </Badge>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>
              {documentsData.has_records 
                ? `${documentsData.record_count} document${documentsData.record_count !== 1 ? 's' : ''} available`
                : 'No documents uploaded'
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