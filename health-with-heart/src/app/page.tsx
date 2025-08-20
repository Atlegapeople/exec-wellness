'use client';

import StatCard from '@/components/StatCard';
import ReportStatusChart from '@/components/ReportStatusChart';
import ValidationErrorsTable from '@/components/ValidationErrorsTable';
import RecentAppointments from '@/components/RecentAppointments';
import WorkplaceHealthTable from '@/components/WorkplaceHealthTable';
import { useAPI } from '@/hooks/useAPI';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  Database,
  Smartphone,
  BarChart3,
  ClipboardList,
  UserCheck,
} from 'lucide-react';

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
  const appointmentsData = appointments;
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Header */}
      <header className='bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/60 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0 gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg'>
                  <Heart className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
                    OHMS Dashboard
                  </h1>
                  <p className='text-sm text-slate-600'>
                    Replacing Tableau • {currentDate}
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <div className='flex items-center gap-2 mt-2'>
                {isLoading ? (
                  <Badge
                    variant='secondary'
                    className='bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
                  >
                    <div className='w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2'></div>
                    Loading...
                  </Badge>
                ) : isConnected ? (
                  <Badge
                    variant='secondary'
                    className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                  >
                    <div className='w-2 h-2 bg-emerald-500 rounded-full mr-2'></div>
                    Live OHMS Data
                  </Badge>
                ) : (
                  <Badge
                    variant='secondary'
                    className='bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200'
                  >
                    <div className='w-2 h-2 bg-orange-500 rounded-full mr-2'></div>
                    Mock Data (DB Offline)
                  </Badge>
                )}
              </div>
            </div>

            <div className='flex items-center gap-3 w-full sm:w-auto'>
              <div className='flex gap-2'>
                <Button
                  asChild
                  size='sm'
                  className='bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg text-white'
                >
                  <a href='/reports'>
                    <FileText className='h-4 w-4 mr-2' />
                    Reports
                  </a>
                </Button>
                <Button
                  asChild
                  size='sm'
                  variant='outline'
                  className='border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm'
                >
                  <a href='/analytics'>
                    <TrendingUp className='h-4 w-4 mr-2' />
                    Analytics
                  </a>
                </Button>
              </div>

              <div className='flex items-center gap-3'>
                <div className='hidden sm:block text-right'>
                  <div className='text-sm text-slate-600'>Welcome,</div>
                  <div className='text-sm font-semibold text-slate-900'>
                    Dr. Smith
                  </div>
                </div>
                <Avatar className='h-10 w-10 border-2 border-blue-200 shadow-md'>
                  <AvatarImage src='/api/placeholder/40/40' />
                  <AvatarFallback className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold'>
                    DS
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Loading State */}
        {isLoading && (
          <Card className='border-0 shadow-xl bg-white/90 backdrop-blur-sm'>
            <CardContent className='flex items-center justify-center py-20'>
              <div className='text-center'>
                <div className='relative mb-6'>
                  <div className='animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto'></div>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Heart className='h-10 w-10 text-blue-600' />
                  </div>
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                  Loading Medical Data
                </h3>
                <p className='text-slate-600 mb-6'>
                  Connecting to OHMS database...
                </p>
                <div className='space-y-3'>
                  <div className='flex items-center justify-center gap-3'>
                    <div
                      className={`w-3 h-3 rounded-full ${statsLoading ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}
                    ></div>
                    <span className='text-sm text-slate-600'>
                      Dashboard Stats
                    </span>
                  </div>
                  <div className='flex items-center justify-center gap-3'>
                    <div
                      className={`w-3 h-3 rounded-full ${appointmentsLoading ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}
                    ></div>
                    <span className='text-sm text-slate-600'>Appointments</span>
                  </div>
                  <div className='flex items-center justify-center gap-3'>
                    <div
                      className={`w-3 h-3 rounded-full ${reportsLoading ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}
                    ></div>
                    <span className='text-sm text-slate-600'>
                      Medical Reports
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!isLoading && hasErrors && (
          <Card className='border-red-200 bg-red-50/50 shadow-lg'>
            <CardContent className='p-8 text-center'>
              <div className='text-6xl mb-6'>⚠️</div>
              <h3 className='text-xl font-semibold text-red-800 mb-3'>
                Database Connection Error
              </h3>
              <p className='text-red-700 mb-6 max-w-md mx-auto'>
                Unable to load live data from OHMS database. Please check your
                connection.
              </p>
              <div className='space-y-2 mb-8 max-w-sm mx-auto'>
                {statsError && (
                  <div className='text-sm text-red-600 flex items-center justify-center gap-2'>
                    <AlertTriangle className='h-4 w-4' />
                    Dashboard statistics failed
                  </div>
                )}
                {appointmentsError && (
                  <div className='text-sm text-red-600 flex items-center justify-center gap-2'>
                    <AlertTriangle className='h-4 w-4' />
                    Appointments failed
                  </div>
                )}
                {reportsError && (
                  <div className='text-sm text-red-600 flex items-center justify-center gap-2'>
                    <AlertTriangle className='h-4 w-4' />
                    Medical reports failed
                  </div>
                )}
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant='destructive'
                size='lg'
                className='shadow-lg'
              >
                <Database className='h-4 w-4 mr-2' />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content - Only show when data is loaded */}
        {!isLoading && !hasErrors && stats && (
          <>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
              <Card className='border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-blue-100 text-sm font-medium'>
                        Executive Medicals Today
                      </p>
                      <p className='text-3xl font-bold mt-2'>
                        {stats.todayAppointments}
                      </p>
                    </div>
                    <div className='p-3 bg-blue-400/20 rounded-full'>
                      <Calendar className='h-8 w-8 text-blue-100' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-emerald-100 text-sm font-medium'>
                        Signed Reports
                      </p>
                      <p className='text-3xl font-bold mt-2'>
                        {stats.completedReports}
                      </p>
                      <p className='text-emerald-100 text-xs mt-1'>
                        This month
                      </p>
                    </div>
                    <div className='p-3 bg-emerald-400/20 rounded-full'>
                      <CheckCircle className='h-8 w-8 text-emerald-100' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-amber-100 text-sm font-medium'>
                        Awaiting Signature
                      </p>
                      <p className='text-3xl font-bold mt-2'>
                        {stats.pendingSignatures}
                      </p>
                    </div>
                    <div className='p-3 bg-amber-400/20 rounded-full'>
                      <Clock className='h-8 w-8 text-amber-100' />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-red-100 text-sm font-medium'>
                        High-Risk Patients
                      </p>
                      <p className='text-3xl font-bold mt-2'>
                        {stats.activeDoctors}
                      </p>
                      <p className='text-red-100 text-xs mt-1'>
                        Requiring attention
                      </p>
                    </div>
                    <div className='p-3 bg-red-400/20 rounded-full'>
                      <Shield className='h-8 w-8 text-red-100' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Grid */}
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8'>
              {/* Report Status Chart */}
              {reportStatusData && (
                <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-slate-900'>
                      <BarChart3 className='h-5 w-5 text-blue-600' />
                      Report Status Overview
                    </CardTitle>
                    <CardDescription>
                      Track completion rates across all report types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportStatusChart data={reportStatusData} />
                  </CardContent>
                </Card>
              )}

              {/* Validation Errors */}
              {validationErrorsData && (
                <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-slate-900'>
                      <AlertTriangle className='h-5 w-5 text-red-600' />
                      Validation Errors
                    </CardTitle>
                    <CardDescription>
                      Issues requiring immediate attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ValidationErrorsTable errors={validationErrorsData} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Second Row */}
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8'>
              {/* Recent Appointments */}
              {appointmentsData && employeesData && reportsData && (
                <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-slate-900'>
                      <Calendar className='h-5 w-5 text-emerald-600' />
                      Recent Appointments
                    </CardTitle>
                    <CardDescription>
                      Latest scheduled medical examinations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentAppointments
                      appointments={appointmentsData}
                      employees={employeesData}
                      reports={reportsData}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Workplace Health */}
              {workplaceHealthData && (
                <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-slate-900'>
                      <Users className='h-5 w-5 text-indigo-600' />
                      Workplace Health
                    </CardTitle>
                    <CardDescription>
                      Department-wise health metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WorkplaceHealthTable data={workplaceHealthData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Footer Info */}
        <Card className='border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white'>
          <CardContent className='p-6 sm:p-8'>
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6'>
              <div className='flex-1'>
                <h3 className='text-xl font-semibold mb-3 flex items-center gap-2'>
                  <CheckCircle className='h-6 w-6 text-emerald-400' />
                  Tableau Replacement Complete
                </h3>
                <p className='text-slate-300 leading-relaxed max-w-2xl'>
                  This dashboard replaces all core Tableau functionality: field
                  validation, report status tracking, appointment management,
                  and workplace health monitoring.
                </p>
              </div>
              <div className='flex flex-col gap-3 text-right'>
                <div className='flex items-center gap-2 text-emerald-400'>
                  <CheckCircle className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    No more shared logins
                  </span>
                </div>
                <div className='flex items-center gap-2 text-emerald-400'>
                  <CheckCircle className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Real-time validation
                  </span>
                </div>
                <div className='flex items-center gap-2 text-emerald-400'>
                  <Smartphone className='h-4 w-4' />
                  <span className='text-sm font-medium'>Mobile friendly</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
