'use client';

import { useEmployeeVitals, VitalsData } from '@/hooks/useEmployeeVitals';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicalVitalsDisplayProps {
  employeeId: string;
  side?: 'left' | 'right' | 'weight';
}

export default function ClinicalVitalsDisplay({ employeeId, side }: ClinicalVitalsDisplayProps) {
  const { vitalsData, loading, error } = useEmployeeVitals(employeeId);

  if (loading) {
    return (
      <div className="space-y-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-sm rounded px-1 py-0.5 shadow-sm border border-gray-200 w-16">
            <Skeleton className="h-2 w-10 mb-0.5" />
            <Skeleton className="h-2 w-6" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !vitalsData.length) {
    return null;
  }

  const currentVitals = vitalsData[0];
  const previousVitals = vitalsData[1];

  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('normal') || lowerStatus.includes('negative')) {
      return 'text-green-700 bg-green-50 border-green-200';
    }
    if (lowerStatus.includes('high') || lowerStatus.includes('overweight') || lowerStatus.includes('positive')) {
      return 'text-red-700 bg-red-50 border-red-200';
    }
    if (lowerStatus.includes('low')) {
      return 'text-amber-700 bg-amber-50 border-amber-200';
    }
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const VitalCard = ({ 
    label, 
    value, 
    unit, 
    status, 
    currentVal, 
    previousVal 
  }: { 
    label: string; 
    value: string | number; 
    unit?: string; 
    status?: string; 
    currentVal?: number; 
    previousVal?: number; 
  }) => {
    const trend = currentVal && previousVal ? getTrend(currentVal, previousVal) : null;
    
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-lg px-1.5 py-1 shadow-lg shadow-teal-100/30 border border-teal-200/30 w-[4.5rem] hover:shadow-xl hover:shadow-teal-200/40 transition-all duration-300 hover:scale-105 transform-gpu">
        <div className="text-[7px] font-semibold text-teal-700 uppercase tracking-wide mb-0.5 drop-shadow-sm">
          {label}
        </div>
        <div className="flex items-start justify-between mb-0.5">
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-800 drop-shadow-sm break-words">
              {value}{unit && <span className="text-[6px] text-teal-600 ml-0.5 font-medium">{unit}</span>}
            </span>
          </div>
          {trend && (
            <div className="flex-shrink-0 ml-1 mt-0.5">
              <div className="scale-[0.4] origin-top-right opacity-80">
                {getTrendIcon(trend)}
              </div>
            </div>
          )}
        </div>
        {status && (
          <div className="flex justify-center mt-0.5">
            <div 
              className={cn(
                "w-2 h-2 rounded-full shadow-sm transition-all duration-200",
                status.toLowerCase().includes('normal') || status.toLowerCase().includes('negative') ? "bg-emerald-500" :
                status.toLowerCase().includes('high') || status.toLowerCase().includes('overweight') || status.toLowerCase().includes('positive') ? "bg-red-500" :
                status.toLowerCase().includes('low') ? "bg-amber-500" :
                "bg-gray-400"
              )}
              title={status}
            />
          </div>
        )}
      </div>
    );
  };

  // Split vitals based on side - 3 cards each
  const leftVitals = [
    {
      label: "BMI",
      value: currentVitals.bmi?.toFixed(1) || 'N/A',
      status: currentVitals.bmi_status,
      currentVal: currentVitals.bmi,
      previousVal: previousVitals?.bmi
    },
    {
      label: "BP",
      value: `${currentVitals.systolic_bp}/${currentVitals.diastolic_bp}`,
      unit: "mmHg",
      status: currentVitals.blood_pressure_status,
      currentVal: currentVitals.systolic_bp + currentVitals.diastolic_bp,
      previousVal: previousVitals ? (previousVitals.systolic_bp + previousVitals.diastolic_bp) : undefined
    },
    {
      label: "Glucose",
      value: currentVitals.glucose_result !== null && currentVitals.glucose_result !== undefined ? currentVitals.glucose_result : 'N/A',
      unit: (currentVitals.glucose_result !== null && currentVitals.glucose_result !== undefined) ? "mmol/L" : "",
      status: currentVitals.glucose_status,
      currentVal: currentVitals.glucose_result,
      previousVal: previousVitals?.glucose_result
    }
  ];

  const rightVitals = [
    {
      label: "Height",
      value: currentVitals.height_cm,
      unit: "cm",
      currentVal: currentVitals.height_cm,
      previousVal: previousVitals?.height_cm
    },
    {
      label: "Pulse",
      value: currentVitals.pulse_rate,
      unit: "bpm",
      currentVal: currentVitals.pulse_rate,
      previousVal: previousVitals?.pulse_rate
    },
    {
      label: "HIV Test",
      value: currentVitals.hiv_result || 'Not Done',
      status: currentVitals.hiv_result || 'Not Done'
    }
  ];

  const weightVitals = [
    {
      label: "Weight",
      value: currentVitals.weight_kg,
      unit: "kg",
      currentVal: currentVitals.weight_kg,
      previousVal: previousVitals?.weight_kg
    }
  ];

  const vitalsToShow = side === 'left' ? leftVitals : side === 'right' ? rightVitals : weightVitals;

  return (
    <div className="space-y-2">
      {vitalsToShow.map((vital, index) => (
        <VitalCard key={`${side}-${index}`} {...vital} />
      ))}
    </div>
  );
}