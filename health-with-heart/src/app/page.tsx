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
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                OHMS Dashboard
              </h1>
              <p className='text-sm text-gray-500'>
                Replacing Tableau • {currentDate}
              </p>
              {/* Connection Status */}
              <div className='flex items-center gap-2 mt-1'>
                {isLoading ? (
                  <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full'>
                    🔄 Loading...
                  </span>
                ) : isConnected ? (
                  <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                    🟢 Live OHMS Data
                  </span>
                ) : (
                  <span className='text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full'>
                    🟡 Mock Data (DB Offline)
                  </span>
                )}
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <a
                href='/reports'
                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
              >
                📄 Reports
              </a>
              <a
                href='/analytics'
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
              >
                📊 Analytics
              </a>
              <div className='text-sm text-gray-600'>
                Welcome, <span className='font-medium'>Dr. Smith</span>
              </div>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'>
                DS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Loading State */}
        {isLoading && (
          <div className='flex items-center justify-center py-20'>
            <div className='text-center'>
              <div className='relative'>
                <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-2xl'>🏥</span>
                </div>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Loading Medical Data
              </h3>
              <p className='text-gray-600'>Connecting to OHMS database...</p>
              <div className='mt-4 text-sm text-gray-500'>
                <div className='flex items-center justify-center gap-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${statsLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}
                  ></div>
                  <span>Dashboard Stats</span>
                </div>
                <div className='flex items-center justify-center gap-2 mt-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${appointmentsLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}
                  ></div>
                  <span>Appointments</span>
                </div>
                <div className='flex items-center justify-center gap-2 mt-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${reportsLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}
                  ></div>
                  <span>Medical Reports</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && hasErrors && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-8 text-center'>
            <div className='text-4xl mb-4'>⚠️</div>
            <h3 className='text-lg font-semibold text-red-800 mb-2'>
              Database Connection Error
            </h3>
            <p className='text-red-700 mb-4'>
              Unable to load live data from OHMS database. Please check your
              connection.
            </p>
            <div className='space-y-2 mb-6'>
              {statsError && (
                <div className='text-sm text-red-600'>
                  ❌ Dashboard statistics failed
                </div>
              )}
              {appointmentsError && (
                <div className='text-sm text-red-600'>
                  ❌ Appointments failed
                </div>
              )}
              {reportsError && (
                <div className='text-sm text-red-600'>
                  ❌ Medical reports failed
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors'
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Content - Only show when data is loaded */}
        {!isLoading && !hasErrors && stats && (
          <>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <StatCard
                title='Executive Medicals Today'
                value={stats.todayAppointments}
                icon='📋'
                color='blue'
              />
              <StatCard
                title='Signed Reports'
                value={stats.completedReports}
                icon='✅'
                color='green'
                subtitle='This month'
              />
              <StatCard
                title='Awaiting Signature'
                value={stats.pendingSignatures}
                icon='⏳'
                color='yellow'
              />
              <StatCard
                title='High-Risk Patients'
                value={stats.activeDoctors}
                icon='⚠️'
                color='red'
                subtitle='Requiring attention'
              />
            </div>

            {/* Main Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
              {/* Report Status Chart */}
              {reportStatusData && (
                <ReportStatusChart data={reportStatusData} />
              )}

              {/* Validation Errors */}
              {validationErrorsData && (
                <ValidationErrorsTable errors={validationErrorsData} />
              )}
            </div>

            {/* Second Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
              {/* Recent Appointments */}
              {appointmentsData && employeesData && reportsData && (
                <RecentAppointments
                  appointments={appointmentsData}
                  employees={employeesData}
                  reports={reportsData}
                />
              )}

              {/* Workplace Health */}
              {workplaceHealthData && (
                <WorkplaceHealthTable data={workplaceHealthData} />
              )}
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className='bg-white p-6 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                🎯 Tableau Replacement Complete
              </h3>
              <p className='text-sm text-gray-600'>
                This dashboard replaces all core Tableau functionality: field
                validation, report status tracking, appointment management, and
                workplace health monitoring.
              </p>
            </div>
            <div className='text-right'>
              <div className='text-sm text-green-600 font-semibold'>
                ✅ No more shared logins
              </div>
              <div className='text-sm text-green-600 font-semibold'>
                ✅ Real-time validation
              </div>
              <div className='text-sm text-green-600 font-semibold'>
                ✅ Mobile friendly
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
