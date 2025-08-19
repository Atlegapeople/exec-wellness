import { z } from 'zod';

// User role enum
export const UserRoleSchema = z.enum(['admin', 'doctor', 'nurse', 'patient']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Gender enum
export const GenderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
export type Gender = z.infer<typeof GenderSchema>;

// Appointment status enum
export const AppointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

// Report status enum
export const ReportStatusSchema = z.enum([
  'draft',
  'pending_review',
  'signed',
  'locked',
  'archived'
]);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

// Payment status enum
export const PaymentStatusSchema = z.enum([
  'pending',
  'paid',
  'overdue',
  'cancelled',
  'refunded'
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// User registration schema
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: UserRoleSchema,
  dateOfBirth: z.string().optional(),
  gender: GenderSchema.optional(),
  employeeId: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User login schema
export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Patient registration schema
export const PatientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: GenderSchema,
  idNumber: z.string().length(13, 'South African ID number must be 13 digits'),
  passportNumber: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  province: z.string().min(2, 'Province must be at least 2 characters'),
  postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must give consent to proceed',
  }),
  dataRetentionPolicyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the data retention policy',
  }),
  marketingConsent: z.boolean().optional(),
});

// Appointment booking schema
export const AppointmentBookingSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  doctorId: z.string().uuid('Invalid doctor ID').optional(),
  nurseId: z.string().uuid('Invalid nurse ID').optional(),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  appointmentType: z.string().default('executive_medical'),
  notes: z.string().optional(),
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`);
  const end = new Date(`2000-01-01T${data.endTime}`);
  return start < end;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// Clinical record schema
export const ClinicalRecordSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  appointmentId: z.string().uuid('Invalid appointment ID'),
  recordType: z.enum(['vitals', 'history', 'examination', 'lab_results']),
  // Vitals fields
  bloodPressureSystolic: z.number().min(70).max(250).optional(),
  bloodPressureDiastolic: z.number().min(40).max(150).optional(),
  heartRate: z.number().min(40).max(200).optional(),
  temperature: z.number().min(30.0).max(45.0).optional(),
  heightCm: z.number().min(50).max(300).optional(),
  weightKg: z.number().min(10).max(500).optional(),
  respiratoryRate: z.number().min(8).max(60).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  // Medical history fields
  medicalHistory: z.string().optional(),
  currentMedications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  familyHistory: z.string().optional(),
  lifestyleFactors: z.string().optional(),
  occupationalFactors: z.string().optional(),
  // Physical examination fields
  generalAppearance: z.string().optional(),
  cardiovascular: z.string().optional(),
  respiratory: z.string().optional(),
  gastrointestinal: z.string().optional(),
  musculoskeletal: z.string().optional(),
  neurological: z.string().optional(),
  skin: z.string().optional(),
  otherFindings: z.string().optional(),
  // Lab results fields
  labResults: z.record(z.any()).optional(),
  labDate: z.string().optional(),
  labReference: z.string().optional(),
});

// Medical report schema
export const MedicalReportSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  appointmentId: z.string().uuid('Invalid appointment ID'),
  doctorId: z.string().uuid('Invalid doctor ID'),
  reportTitle: z.string().min(1, 'Report title is required'),
  executiveSummary: z.string().optional(),
  clinicalFindings: z.string().optional(),
  assessment: z.string().optional(),
  recommendations: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional(),
});

// Invoice schema
export const InvoiceSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  medicalReportId: z.string().uuid('Invalid medical report ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  taxAmount: z.number().min(0, 'Tax amount must be non-negative'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  currency: z.string().default('ZAR'),
  dueDate: z.string().optional(),
}).refine((data) => {
  return Math.abs((data.subtotal + data.taxAmount) - data.totalAmount) < 0.01;
}, {
  message: "Total amount must equal subtotal plus tax",
  path: ["totalAmount"],
});

// Search and filter schemas
export const PatientSearchSchema = z.object({
  query: z.string().optional(),
  clinicId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const AppointmentSearchSchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  status: AppointmentStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Form schemas for specific components
export const VitalsFormSchema = ClinicalRecordSchema.pick({
  recordType: true,
  bloodPressureSystolic: true,
  bloodPressureDiastolic: true,
  heartRate: true,
  temperature: true,
  heightCm: true,
  weightKg: true,
  respiratoryRate: true,
  oxygenSaturation: true,
}).extend({
  recordType: z.literal('vitals'),
});

export const MedicalHistoryFormSchema = ClinicalRecordSchema.pick({
  recordType: true,
  medicalHistory: true,
  currentMedications: true,
  allergies: true,
  familyHistory: true,
  lifestyleFactors: true,
  occupationalFactors: true,
}).extend({
  recordType: z.literal('history'),
});

export const PhysicalExaminationFormSchema = ClinicalRecordSchema.pick({
  recordType: true,
  generalAppearance: true,
  cardiovascular: true,
  respiratory: true,
  gastrointestinal: true,
  musculoskeletal: true,
  neurological: true,
  skin: true,
  otherFindings: true,
}).extend({
  recordType: z.literal('examination'),
});
