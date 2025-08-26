import { useState, useEffect } from 'react';

export interface VitalsData {
  weight_kg: number;
  height_cm: number;
  bmi: number;
  bmi_status: string;
  pulse_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_pressure_status: string;
  finger_prick_glucose_type: string;
  glucose_result: number;
  glucose_status: string;
  hiv_result: string;
  date_created: string;
}

export function useEmployeeVitals(employeeId: string) {
  const [vitalsData, setVitalsData] = useState<VitalsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitals = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/employees/${employeeId}/vitals`);
        if (!response.ok) {
          throw new Error('Failed to fetch vitals data');
        }
        
        const data = await response.json();
        setVitalsData(data);
      } catch (err) {
        console.error('Error fetching vitals:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [employeeId]);

  return { vitalsData, loading, error };
}