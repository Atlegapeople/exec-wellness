'use client';

import { useEmployeeVitals } from '@/hooks/useEmployeeVitals';

interface WeightDisplayProps {
  employeeId: string;
}

export default function WeightDisplay({ employeeId }: WeightDisplayProps) {
  const { vitalsData, loading, error } = useEmployeeVitals(employeeId);

  if (loading || error || !vitalsData.length) {
    return null;
  }

  const currentVitals = vitalsData[0];
  
  if (!currentVitals.weight_kg) {
    return null;
  }

  return (
    <div className="text-xs text-center mt-1" style={{ color: '#178089' }}>
      Weight: {currentVitals.weight_kg} kg
    </div>
  );
}