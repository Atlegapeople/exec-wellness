import { createClient } from '@supabase/supabase-js';
import { Database } from 'health-with-heart/src/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables');
}

export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to get user by ID (server-side)
export const getUserById = async (userId: string) => {
  const { data: user, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return user;
};

// Helper function to get clinic by ID (server-side)
export const getClinicById = async (clinicId: string) => {
  const { data: clinic, error } = await supabaseServer
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  if (error) throw error;
  return clinic;
};

// Helper function to get patient by ID (server-side)
export const getPatientById = async (patientId: string) => {
  const { data: patient, error } = await supabaseServer
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) throw error;
  return patient;
};
