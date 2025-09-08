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
import ClinicalVitalsDisplay from './ClinicalVitalsDisplay';
import WeightDisplay from './WeightDisplay';

interface Employee360ViewProps {
  employeeId: string;
  employee: Employee;
}

const MODULE_ROUTES: Record<string, string> = {
  medical_report: '/reports',
  appointments: '/appointments',
  vitals_clinical_metrics: '/vitals',
  clinical_examinations: '/employees',
  assesment: '/assessments',
  employee_medical_history: '/medical-history',
  emergency_responses: '/emergency-responses',
  documents: '/employees',
  // eyesight: '/employees',
  // noise: '/employees',
  mental_health: '/employees',
  infectiouse_disease: '/employees',
  mens_health: '/mens-health',
  womens_health: '/womens-health',
  lab_tests: '/lab-tests',
  lifestyle: '/lifestyle',
  current_complaints: '/employees',
  screening_tb: '/employees',
  special_investigations: '/special-investigations',
  symptom_screening: '/employees',
};

function calculateRadialPositions(
  count: number,
  centerX: number = 50,
  centerY: number = 50,
  radius: number = 35
): Array<{ x: number; y: number }> {
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

export default function Employee360View({
  employeeId,
  employee,
}: Employee360ViewProps) {
  const router = useRouter();
  const { statusData, loading, error } = useEmployeeStatus(employeeId);

  const statusModules: StatusModule[] = useMemo(() => {
    if (!statusData.length) return [];

    // Filter out documents, current complaints, emergency responses, infectious disease, assessments, clinical examinations (duplicate of vitals), and gender-specific modules based on employee gender
    const employeeGender = employee.gender?.toLowerCase();
    const filteredData = statusData.filter(status => {
      // Always exclude documents, current complaints, emergency responses, infectious disease, assessments, clinical examinations (duplicate), TB screening, noise, and eyesight
      if (
        [
          'documents',
          'current_complaints',
          'emergency_responses',
          'infectiouse_disease',
          'assesment',
          'clinical_examinations',
          'screening_tb',
          'noise',
          'eyesight',
        ].includes(status.table_name)
      )
        return false;

      // Filter gender-specific modules
      if (
        status.table_name === 'mens_health' &&
        employeeGender !== 'male' &&
        employeeGender !== 'm'
      ) {
        return false;
      }
      if (
        status.table_name === 'womens_health' &&
        employeeGender !== 'female' &&
        employeeGender !== 'f'
      ) {
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
      position: positions[index],
    }));
  }, [statusData, employee.gender]);

  const handleBadgeClick = (moduleName: string) => {
    console.log('StatusBadge clicked!', { moduleName, employeeId });
    const route = MODULE_ROUTES[moduleName] || '/employees';
    console.log('Navigating to:', route);
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

  const getImageSize = () => {
    const gender = employee.gender?.toLowerCase();
    if (gender === 'female' || gender === 'f') {
      return { width: 100, height: 170 }; // Smaller for woman
    }
    return { width: 120, height: 200 }; // Original size for man
  };

  if (loading) {
    return (
      <div className='relative w-full h-[700px] flex items-center justify-center'>
        <div className='space-y-4 w-full'>
          <Skeleton className='h-4 w-3/4 mx-auto' />
          <div className='relative w-full h-[600px]'>
            <Skeleton className='w-40 h-60 mx-auto mb-4' />
            <div className='absolute inset-0'>
              {[...Array(12)].map((_, i) => (
                <Skeleton
                  key={i}
                  className='absolute w-32 h-16 rounded-lg'
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
      <div className='w-full h-[700px] flex items-center justify-center'>
        <Card className='max-w-md p-4 border-red-200 bg-red-50'>
          <div className='flex items-center gap-2 text-red-800'>
            <AlertCircle className='h-4 w-4' />
            <span className='text-sm'>
              Failed to load employee status: {error}
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (!statusModules.length) {
    return (
      <div className='w-full h-[700px] flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <Image
            src={getBodyImage()}
            alt='Employee silhouette'
            width={getImageSize().width}
            height={getImageSize().height}
            className='mx-auto opacity-50'
          />
          <p className='text-gray-500'>
            No status data available for this employee
          </p>
        </div>
      </div>
    );
  }

  const formatDateOfBirth = (dateString: string) => {
    if (!dateString || dateString === 'Not specified')
      return 'Birthday: Not specified';
    try {
      const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return `Birthday: ${formattedDate}`;
    } catch {
      return `Birthday: ${dateString}`;
    }
  };

  const calculateAge = (dateString: string) => {
    if (!dateString || dateString === 'Not specified') return 'Age: Unknown';
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return `Age: ${age}`;
    } catch {
      return 'Age: Unknown';
    }
  };

  return (
    <div
      className='relative w-full h-[850px] overflow-hidden bg-white rounded-xl border border-slate-200/50'
      style={{ backgroundColor: '#F2EFED', borderColor: '#D7D9D9' }}
    >
      {/* Date of Birth - Modern floating card */}
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[160px] z-10'>
        <div
          className='bg-white/95 backdrop-blur-md border border-teal-200/40 rounded-full px-4 py-2 shadow-lg shadow-teal-100/50'
          style={{
            backgroundColor: 'rgba(242, 239, 237, 0.95)',
            borderColor: 'rgba(183, 214, 206, 0.4)',
            boxShadow: '0 10px 15px -3px rgba(183, 214, 206, 0.5)',
          }}
        >
          <div
            className='text-sm font-semibold text-teal-700 text-center whitespace-nowrap'
            style={{ color: '#56969D' }}
          >
            {formatDateOfBirth(
              employee.date_of_birth?.toString() || 'Not specified'
            )}
          </div>
        </div>
      </div>

      {/* Central body silhouette with subtle glow */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='relative'>
          {/* Aggressive fade glow around the image */}
          <div
            className='absolute inset-0 rounded-full blur-lg scale-110'
            style={{
              background:
                'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, rgba(45, 212, 191, 0.1) 40%, transparent 70%)',
            }}
          />
          <div
            className='absolute inset-0 rounded-full blur-md scale-105'
            style={{
              background:
                'radial-gradient(circle, rgba(56, 178, 172, 0.2) 0%, rgba(56, 178, 172, 0.05) 30%, transparent 60%)',
            }}
          />
          <Image
            src={getBodyImage()}
            alt={`${employee.gender || 'Employee'} silhouette`}
            width={getImageSize().width}
            height={getImageSize().height}
            className='object-contain opacity-80 relative z-10 filter drop-shadow-xl'
            priority
          />
        </div>
      </div>

      {/* Clinical Vitals Display - Modern glass morphism */}
      <div className='absolute inset-0 flex items-center justify-center z-20'>
        <div className='flex items-center gap-6'>
          {/* Left side vitals */}
          <div className='flex flex-col gap-2'>
            <ClinicalVitalsDisplay employeeId={employeeId} side='left' />
          </div>

          {/* Space for central image */}
          <div style={{ width: getImageSize().width - 20 }} />

          {/* Right side vitals */}
          <div className='flex flex-col gap-2'>
            <ClinicalVitalsDisplay employeeId={employeeId} side='right' />
          </div>
        </div>
      </div>

      {/* Age and Weight - Combined card */}
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[115px] z-10'>
        <div className='bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg shadow-teal-100/50'>
          <div className='text-sm font-semibold text-teal-700 text-center whitespace-nowrap'>
            {calculateAge(employee.date_of_birth?.toString() || '')}
          </div>
          <WeightDisplay employeeId={employeeId} />
        </div>
      </div>

      {/* Radial status badges with modern styling */}
      {statusModules.map((module, index) => (
        <StatusBadge
          key={`module-${index}-${module.name}`}
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
