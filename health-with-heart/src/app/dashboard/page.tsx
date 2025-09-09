'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import ReportStatusChart from '@/components/ReportStatusChart';
import ValidationErrorsTable from '@/components/ValidationErrorsTable';
import RecentAppointments from '@/components/RecentAppointments';
import WorkplaceHealthTable from '@/components/WorkplaceHealthTable';
import { useAPI } from '@/hooks/useAPI';
import {
  Calendar,
  Users,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  Stethoscope,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';
import {
  DashboardStats,
  ReportStatusData,
  ValidationError,
  Appointment,
  Employee,
  MedicalReport,
  WorkplaceHealth,
} from '@/types';
import {
  mockDashboardStats,
  mockReportStatus,
  mockValidationErrors,
  mockAppointments,
  mockEmployees,
  mockMedicalReports,
  mockWorkplaceHealth,
} from '@/lib/mockData';

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch live data from OHMS database
  const {
    data: dashboardStats,
    loading: statsLoading,
    error: statsError,
  } = useAPI<DashboardStats>('/api/dashboard/stats');
  const {
    data: reportStatus,
    loading: reportLoading,
    error: reportError,
  } = useAPI<ReportStatusData[]>('/api/reports/status');
  const {
    data: validationErrors,
    loading: validationLoading,
    error: validationError,
  } = useAPI<ValidationError[]>('/api/validation/errors');
  const {
    data: appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useAPI<Appointment[]>('/api/appointments/recent');
  const {
    data: employees,
    loading: employeesLoading,
    error: employeesError,
  } = useAPI<Employee[]>('/api/employees');
  const {
    data: reports,
    loading: reportsLoading,
    error: reportsError,
  } = useAPI<{ reports: MedicalReport[]; pagination: any }>('/api/reports');
  const {
    data: workplaceHealth,
    loading: workplaceLoading,
    error: workplaceError,
  } = useAPI<WorkplaceHealth[]>('/api/workplace/health');

  // Only use live data when loaded, otherwise show loading
  const stats = dashboardStats;
  const reportStatusData = reportStatus;
  const validationErrorsData = validationErrors;
  const appointmentsData = appointments as Appointment[];
  const employeesData = employees;
  const reportsData = reports?.reports || [];
  const workplaceHealthData = workplaceHealth;

  // Show connection status
  const isConnected =
    !statsError && !reportError && !validationError && !appointmentsError;
  const isLoading =
    statsLoading || reportLoading || validationLoading || appointmentsLoading;
  const hasErrors =
    statsError || reportError || validationError || appointmentsError;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up'>
          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Medical Data'
                  subtitle='Connecting to OHMS database...'
                />
              </CardContent>
            </Card>
          )}

          <div className='container-query space-y-8'>
            {/* Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Card className='hover-lift  border-light-grey'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-work-sans-medium text-forest'>
                    Today's Appointments
                  </CardTitle>
                  <Calendar className='h-4 w-4 text-fern' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-yrsa-bold text-teal'>
                    {stats?.todayAppointments || 0}
                  </div>
                  <p className='text-xs font-work-sans-regular text-fern'>
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className='hover-lift  border-light-grey'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-work-sans-medium text-forest'>
                    Total Reports
                  </CardTitle>
                  <FileText className='h-4 w-4 text-fern' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-yrsa-bold text-sage'>
                    {stats?.completedReports || 0}
                  </div>
                  <p className='text-xs font-work-sans-regular text-fern'>
                    Executive Medical reports
                  </p>
                </CardContent>
              </Card>
              <Card className='hover-lift  border-light-grey'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-work-sans-medium text-forest'>
                    Pending Signatures
                  </CardTitle>
                  <Activity className='h-4 w-4 text-sunset' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-yrsa-bold text-sunset'>
                    {stats?.pendingSignatures || 0}
                  </div>
                  <p className='text-xs font-work-sans-regular text-fern'>
                    -3% from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card className='hover-lift  border-light-grey'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-work-sans-medium text-forest'>
                    Active Doctors
                  </CardTitle>
                  <Users className='h-4 w-4 text-fern' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-yrsa-bold text-fern'>
                    {stats?.activeDoctors || 0}
                  </div>
                  <p className='text-xs font-work-sans-regular text-fern'>
                    +2 this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className=' border-light-grey'>
              <CardHeader>
                <CardTitle className='text-balance font-yrsa-semibold text-forest'>
                  Quick Actions
                </CardTitle>
                <CardDescription className='font-work-sans-regular text-fern'>
                  Access frequently used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Button
                    variant='outline'
                    className='h-auto p-4 hover-lift justify-start border-sage hover:bg-sage/5'
                    asChild
                  >
                    <a href='/employees'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-sage/10 rounded-lg flex items-center justify-center'>
                          <Users className='h-5 w-5 text-sage' />
                        </div>
                        <div className='text-left'>
                          <h3 className='font-work-sans-semibold text-forest'>
                            Manage Employees
                          </h3>
                          <p className='text-sm font-work-sans-regular text-fern'>
                            View and edit employee records
                          </p>
                        </div>
                      </div>
                    </a>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-auto p-4 hover-lift justify-start border-teal hover:bg-teal/5'
                    asChild
                  >
                    <a href='/reports'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center'>
                          <FileText className='h-5 w-5 text-teal' />
                        </div>
                        <div className='text-left'>
                          <h3 className='font-work-sans-semibold text-forest'>
                            Medical Reports
                          </h3>
                          <p className='text-sm font-work-sans-regular text-fern'>
                            Generate and manage reports
                          </p>
                        </div>
                      </div>
                    </a>
                  </Button>
                  <Button
                    variant='outline'
                    className='h-auto p-4 hover-lift justify-start border-soft-teal hover:bg-soft-teal/5'
                    asChild
                  >
                    <a href='/analytics'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-soft-teal/10 rounded-lg flex items-center justify-center'>
                          <TrendingUp className='h-5 w-5 text-soft-teal' />
                        </div>
                        <div className='text-left'>
                          <h3 className='font-work-sans-semibold text-forest'>
                            Analytics
                          </h3>
                          <p className='text-sm font-work-sans-regular text-fern'>
                            View insights and trends
                          </p>
                        </div>
                      </div>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Report Status */}
              <Card className='hover-lift  border-light-grey'>
                <CardHeader>
                  <CardTitle className='font-yrsa-semibold text-forest'>
                    Report Status Overview
                  </CardTitle>
                  <CardDescription className='font-work-sans-regular text-fern'>
                    Medical report completion progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportStatusChart
                    data={reportStatusData || mockReportStatus}
                  />
                </CardContent>
              </Card>

              {/* Recent Appointments */}
              <Card className='hover-lift  border-light-grey'>
                <CardHeader>
                  <CardTitle className='font-yrsa-semibold text-forest'>
                    Recent Appointments
                  </CardTitle>
                  <CardDescription className='font-work-sans-regular text-fern'>
                    Latest scheduled medical appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentAppointments
                    appointments={appointmentsData || mockAppointments}
                    employees={(employeesData as Employee[]) || mockEmployees}
                    reports={
                      (reportsData as MedicalReport[]) || mockMedicalReports
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Full Width Sections */}
            <div className='space-y-8'>
              {/* Validation Errors */}
              <Card className='hover-lift  border-light-grey'>
                <CardHeader>
                  <CardTitle className='font-yrsa-semibold text-forest'>
                    Validation Errors
                  </CardTitle>
                  <CardDescription className='font-work-sans-regular text-fern'>
                    Issues requiring attention in medical records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ValidationErrorsTable
                    errors={validationErrorsData || mockValidationErrors}
                  />
                </CardContent>
              </Card>

              {/* Workplace Health */}
              <Card className='hover-lift  border-light-grey'>
                <CardHeader>
                  <CardTitle className='font-yrsa-semibold text-forest'>
                    Workplace Health Summary
                  </CardTitle>
                  <CardDescription className='font-work-sans-regular text-fern'>
                    Health metrics across different departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkplaceHealthTable
                    data={workplaceHealthData || mockWorkplaceHealth}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
