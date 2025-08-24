'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Employee, StatusModule } from '@/types';
import { useEmployeeStatus } from '@/hooks/useEmployeeStatus';
import StatusBadge from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Employee360ViewProps {
  employeeId: string;
  employee: Employee;
}

const MODULE_ROUTES: Record<string, string> = {
  'medical_report': '/reports',
  'appointments': '/appointments',
  'vitals_clinical_metrics': '/vitals',
  'clinical_examinations': '/employees',
  'assesment': '/assessments',
  'employee_medical_history': '/medical-history',
  'emergency_responses': '/emergency-responses',
  'documents': '/employees',
  'eyesight': '/employees',
  'noise': '/employees',
  'mental_health': '/employees',
  'infectiouse_disease': '/employees',
  'mens_health': '/employees',
  'womens_health': '/employees',
  'lab_tests': '/lab-tests',
  'lifestyle': '/lifestyle',
  'current_complaints': '/employees',
  'screening_tb': '/employees',
  'special_investigations': '/special-investigations',
  'symptom_screening': '/employees'
};

function calculateRadialPositions(count: number, centerX: number = 50, centerY: number = 50, radius: number = 42): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const angleStep = (2 * Math.PI) / count;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.push({ x, y });
  }
  
  return positions;
}

export default function Employee360View({ employeeId, employee }: Employee360ViewProps) {
  const router = useRouter();
  const { statusData, loading, error } = useEmployeeStatus(employeeId);

  const statusModules: StatusModule[] = useMemo(() => {
    if (!statusData.length) return [];

    // Filter out documents, current complaints, emergency responses, infectious disease, assessments, clinical examinations (duplicate of vitals), and gender-specific modules based on employee gender
    const employeeGender = employee.gender?.toLowerCase();
    const filteredData = statusData.filter(status => {
      // Always exclude documents, current complaints, emergency responses, infectious disease, assessments, and clinical examinations (duplicate)
      if (['documents', 'current_complaints', 'emergency_responses', 'infectiouse_disease', 'assesment', 'clinical_examinations'].includes(status.table_name)) return false;
      
      // Filter gender-specific modules
      if (status.table_name === 'mens_health' && employeeGender !== 'male' && employeeGender !== 'm') {
        return false;
      }
      if (status.table_name === 'womens_health' && employeeGender !== 'female' && employeeGender !== 'f') {
        return false;
      }
      
      return true;
    });
    
    const positions = calculateRadialPositions(filteredData.length);
    
    return filteredData.map((status, index) => ({
      name: status.table_name,
      displayName: status.display_name,
      recordCount: status.record_count,
      isActive: status.has_records,
      position: positions[index]
    }));
  }, [statusData, employee.gender]);

  const handleBadgeClick = (moduleName: string) => {
    const route = MODULE_ROUTES[moduleName] || '/employees';
    router.push(`${route}?employee=${employeeId}`);
  };

  const getBodyImage = () => {
    const gender = employee.gender?.toLowerCase();
    if (gender === 'male' || gender === 'm') {
      return '/user_images/body-man.png';
    } else if (gender === 'female' || gender === 'f') {
      return '/user_images/body-woman.png';
    }
    // Default to male silhouette if gender is not specified
    return '/user_images/body-man.png';
  };

  if (loading) {
    return (
      <div className="relative w-full h-[700px] flex items-center justify-center">
        <div className="space-y-4 w-full">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <div className="relative w-full h-[600px]">
            <Skeleton className="w-40 h-60 mx-auto mb-4" />
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="absolute w-32 h-16 rounded-lg"
                  style={{
                    left: `${15 + (i % 4) * 20}%`,
                    top: `${15 + Math.floor(i / 3) * 25}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[700px] flex items-center justify-center">
        <Card className="max-w-md p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load employee status: {error}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!statusModules.length) {
    return (
      <div className="w-full h-[700px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Image
            src={getBodyImage()}
            alt="Employee silhouette"
            width={150}
            height={250}
            className="mx-auto opacity-50"
          />
          <p className="text-gray-500">No status data available for this employee</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      {/* Central body silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={getBodyImage()}
          alt={`${employee.gender || 'Employee'} silhouette`}
          width={150}
          height={250}
          className="object-contain opacity-80"
          priority
        />
      </div>

      {/* Radial status badges */}
      {statusModules.map((module) => (
        <StatusBadge
          key={module.name}
          moduleName={module.name}
          displayName={module.displayName}
          recordCount={module.recordCount}
          isActive={module.isActive}
          position={module.position}
          onClick={() => handleBadgeClick(module.name)}
        />
      ))}

    </div>
  );
}