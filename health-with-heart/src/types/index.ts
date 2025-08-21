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