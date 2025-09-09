'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmployeeStatus } from '@/types';

interface UseEmployeeStatusResult {
  statusData: EmployeeStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEmployeeStatus(
  employeeId: string | null
): UseEmployeeStatusResult {
  const [statusData, setStatusData] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeStatus = useCallback(async () => {
    if (!employeeId) {
      setStatusData([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/employees/${employeeId}/status`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch employee status: ${response.statusText}`
        );
      }

      const data: EmployeeStatus[] = await response.json();
      setStatusData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching employee status:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployeeStatus();
  }, [fetchEmployeeStatus]);

  return {
    statusData,
    loading,
    error,
    refetch: fetchEmployeeStatus,
  };
}
