// Types based on actual OHMS database structure
export interface Employee {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  created_by?: string;
  updated_by?: string;
  section_header?: string;
  name: string;
  surname: string;
  id_number?: string;
  passport_number?: string;
  gender?: string;
  date_of_birth?: Date;
  ethnicity?: string;
  marriage_status?: string;
  no_of_children?: number;
  personal_email_address?: string;
  mobile_number?: string;
  section_header_2?: string;
  medical_aid?: string;
  medical_aid_number?: string;
  main_member?: boolean;
  main_member_name?: string;
  section_header_3?: string;
  work_email?: string;
  employee_number?: string;
  organisation?: string;
  organisation_name?: string;
  workplace?: string;
  workplace_name?: string;
  job?: string;
  notes_header?: string;
  notes_text?: string;
  work_startdate?: Date;
  manager_count?: number;
}

export interface Appointment {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string;
  user_updated: string;
  report_id?: string;
  employee_id: string;
  type: string;
  start_datetime: Date;
  end_datetime: Date;
  start_date: Date;
  end_date: Date;
  start_time: string;
  end_time: string;
  notes?: string;
  calander_id?: string;
  calander_link?: string;
}

export interface MedicalReport {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created: string;
  user_updated: string;
  employee_id: string;
  site?: string;
  type: string;
  sub_type?: string;
  doctor?: string;
  doctor_signoff?: string;
  doctor_signature?: string;
  nurse?: string;
  nurse_signature?: string;
  report_work_status?: string;
  notes_text?: string;
  recommendation_text?: string;
  email_certificate?: number;
  email_report?: number;
  certificate_send_count?: number;
  report_send_count?: number;
  email_certificate_manager?: number;
  certificate_send_count_manager?: number;
  employee_work_email?: string;
  employee_personal_email?: string;
  manager_email?: string;
  doctor_email?: string;
  workplace?: string;
  line_manager?: string;
  line_manager2?: string;
  column_1?: string;
  column_2?: string;
  column_3?: string;
  column_4?: string;
  column_5?: string;
  column_6?: string;
  column_7?: string;
}

export interface DashboardStats {
  todayAppointments: number;
  completedReports: number;
  pendingSignatures: number;
  activeDoctors: number;
}

export interface ReportStatusData {
  report_type: string;
  total_reports: number;
  signed_reports: number;
  pending_signature: number;
  completion_percentage: number;
}

export interface ValidationError {
  report_id: string;
  employee_name: string;
  type: string;
  errors: string[];
}

export interface MonthlyStats {
  month: string;
  reports_created: number;
  unique_employees: number;
  doctors_involved: number;
  avg_completion_days: number;
}

export interface WorkplaceHealth {
  organisation_id: string;
  department: string;
  total_employees: number;
  medical_reports: number;
  fit_for_work: number;
  not_fit: number;
}

export interface User {
  id: string;
  date_created: Date;
  date_updated: Date;
  user_created?: string;
  user_updated?: string;
  name: string;
  surname: string;
  email: string;
  mobile?: string;
  type: 'Doctor' | 'Nurse' | 'Administrator' | 'Ergonomist';
  signature?: string;
}

export interface Lifestyle {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  report_id?: string;
  employee_id?: string;
  employee_name?: string;
  employee_surname?: string;
  employee_work_email?: string;
  smoking_header?: string;
  smoke?: boolean;
  smoke_qty?: string;
  smoke_years?: string;
  smoking_duration?: string;
  alcohol_header?: string;
  alochol_frequency?: string;
  alochol_frequency_score?: number;
  alocohol_qty?: string;
  alocohol_qty_score?: number;
  alcohol_excess?: string;
  alcohol_excess_score?: number;
  alcohol_score?: number;
  alcohol_audit_header?: string;
  audit_instruction?: string;
  audit_q1?: string;
  audit_s1?: number;
  audit_q2?: string;
  audit_s2?: number;
  audit_q3?: string;
  audit_s3?: number;
  audit_q4?: string;
  audit_s4?: number;
  audit_q5?: string;
  audit_s5?: number;
  audit_q6?: string;
  audit_s6?: number;
  audit_q7?: string;
  audit_s7?: number;
  audit_q8?: string;
  audit_s8?: number;
  audit_q9?: string;
  audit_s9?: number;
  audit_q10?: string;
  audit_s10?: number;
  auditc_points?: number;
  auditc_result?: string;
  auditc_notes?: string;
  drugs_header?: string;
  drugs?: string;
  drugs_past?: string;
  tics_header?: string;
  alcohol_overuse?: boolean;
  alcohol_cut?: boolean;
  tics_result?: string;
  exercise?: string;
  excercise_frequency?: string;
  excercise_minutes?: string;
  sitting_hours?: string;
  diet_header?: string;
  eatout_frequency?: string;
  fruitveg_frequency?: string;
  sugar_consumption?: string;
  diet_overall?: string;
  sleep_header?: string;
  sleep_hours?: string;
  sleep_rating?: string;
  sleep_rest?: string;
  notes_header?: string;
  notes_text?: string;
  recommendation_text?: string;
}

export interface SpecialInvestigation {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  report_id?: string;
  employee_id?: string;
  employee_name?: string;
  employee_surname?: string;
  employee_work_email?: string;
  resting_ecg?: string;
  stress_ecg?: string;
  lung_function?: string;
  urine_dipstix?: string;
  predicted_vo2_max?: string;
  body_fat_percentage?: string;
  cardio_risk_header?: string;
  reynolds_cardiovascular_risk_score?: string;
  risk_score?: number;
  risk_category?: string;
  other_header?: string;
  colonscopy_required?: boolean;
  gastroscopy?: boolean;
  abdominal_ultrasound?: boolean;
  osteroporosis_screen?: boolean;
  notes_header?: string;
  notes_text?: string;
  recommendation_text?: string;
  nerveiq?: string;
  nerviq_note?: string;
  kardiofit?: string;
  kardiofit_note?: string;
  nerveiq_cns?: string;
  nerveiq_cardio?: string;
  nerveiq_cnscomment?: string;
  nerveiq_cardiocomment?: string;
  nerveiq_group?: string;
}

export interface LabTest {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  report_id?: string;
  employee_id?: string;
  employee_name?: string;
  employee_surname?: string;
  employee_work_email?: string;
  full_blood_count_an_esr?: string;
  vitamin_d?: string;
  kidney_function?: string;
  liver_enzymes?: string;
  uric_acid?: string;
  total_cholesterol?: string;
  hdl?: string;
  'hs-crp'?: string;
  homocysteine?: string;
  fasting_glucose?: string;
  hba1c?: string;
  insulin_level?: string;
  thyroid_stimulating_hormone?: string;
  psa?: string;
  hormones?: string;
  adrenal_response?: string;
  notes_header?: string;
  notes_text?: string;
  recommendation_text?: string;
  documents?: string;
  hiv?: string;
}

export interface EmergencyResponse {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  report_id?: string;
  employee_id?: string;
  employee_name?: string;
  employee_surname?: string;
  employee_work_email?: string;
  injury_date?: Date;
  injury_time?: string;
  arrival_time?: string;
  location_id?: string;
  place?: string;
  emergency_type?: string;
  injury?: string;
  main_complaint?: string;
  diagnosis?: string;
  findings?: string;
  intervention?: string;
  patient_history?: string;
  plan?: string;
  outcome?: string;
  reference?: string;
  manager?: string;
  sendemail?: string;
}

export interface EmployeeStatus {
  table_name: string;
  record_count: number;
  has_records: boolean;
  display_name: string;
  status: 'Active' | 'Inactive';
}

export interface EmployeeStatusResponse {
  data: EmployeeStatus[];
}

export interface StatusModule {
  name: string;
  displayName: string;
  recordCount: number;
  isActive: boolean;
  position: { x: number; y: number };
}