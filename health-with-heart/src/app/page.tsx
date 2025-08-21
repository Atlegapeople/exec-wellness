'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Loader2
} from 'lucide-react';
import {
  DashboardStats,
  ReportStatusData,
  ValidationError,
  Appointment,
  Employee,
  MedicalReport,
  WorkplaceHealth
} from '@/types';
import {
  mockDashboardStats,
  mockReportStatus,
  mockValidationErrors,
  mockAppointments,
  mockEmployees,
  mockMedicalReports,
  mockWorkplaceHealth
} from '@/lib/mockData';

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch live data from OHMS database
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useAPI<DashboardStats>('/api/dashboard/stats');
  const { data: reportStatus, loading: reportLoading, error: reportError } = useAPI<ReportStatusData[]>('/api/reports/status');
  const { data: validationErrors, loading: validationLoading, error: validationError } = useAPI<ValidationError[]>('/api/validation/errors');
  const { data: appointments, loading: appointmentsLoading, error: appointmentsError } = useAPI<Appointment[]>('/api/appointments/recent');
  const { data: employees, loading: employeesLoading, error: employeesError } = useAPI<Employee[]>('/api/employees');
  const { data: reports, loading: reportsLoading, error: reportsError } = useAPI<{reports: MedicalReport[], pagination: any}>('/api/reports');
  const { data: workplaceHealth, loading: workplaceLoading, error: workplaceError } = useAPI<WorkplaceHealth[]>('/api/workplace/health');

  // Only use live data when loaded, otherwise show loading
  const stats = dashboardStats;
  const reportStatusData = reportStatus;
  const validationErrorsData = validationErrors;
  const appointmentsData = appointments;
  const employeesData = employees;
  const reportsData = reports?.reports || [];
  const workplaceHealthData = workplaceHealth;

  // Show connection status
  const isConnected = !statsError && !reportError && !validationError && !appointmentsError;
  const isLoading = statsLoading || reportLoading || validationLoading || appointmentsLoading;
  const hasErrors = statsError || reportError || validationError || appointmentsError;

  return (
    <DashboardLayout>
      <div className="px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up">
        {/* Loading State */}
        {isLoading && (
          <Card className="glass-effect">
            <CardContent className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-primary/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Loading Medical Data</h3>
                  <p className="text-muted-foreground">Connecting to OHMS database...</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statsLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-muted-foreground">Dashboard Stats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${appointmentsLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-muted-foreground">Appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${reportsLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-muted-foreground">Medical Reports</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="container-query space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-lift gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="hover-lift gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completedReports || 0}</div>
                <p className="text-xs text-muted-foreground">Executive Medical reports</p>
              </CardContent>
            </Card>
            <Card className="hover-lift gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingSignatures || 0}</div>
                <p className="text-xs text-muted-foreground">-3% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="hover-lift gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeDoctors || 0}</div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-balance">Quick Actions</CardTitle>
              <CardDescription>Access frequently used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 hover-lift justify-start" asChild>
                  <a href="/employees">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Manage Employees</h3>
                        <p className="text-sm text-muted-foreground">View and edit employee records</p>
                      </div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto p-4 hover-lift justify-start" asChild>
                  <a href="/reports">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--teal-100)'}}>
                        <FileText className="h-5 w-5" style={{color: 'var(--teal-600)'}} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Medical Reports</h3>
                        <p className="text-sm text-muted-foreground">Generate and manage reports</p>
                      </div>
                    </div>
                  </a>
                </Button>
                <Button variant="outline" className="h-auto p-4 hover-lift justify-start" asChild>
                  <a href="/analytics">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'var(--teal-200)'}}>
                        <TrendingUp className="h-5 w-5" style={{color: 'var(--teal-700)'}} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Analytics</h3>
                        <p className="text-sm text-muted-foreground">View insights and trends</p>
                      </div>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Report Status */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Report Status Overview</CardTitle>
                <CardDescription>Medical report completion progress</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportStatusChart data={reportStatusData || mockReportStatus} />
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Latest scheduled medical appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAppointments 
                  appointments={appointmentsData || mockAppointments}
                  employees={employeesData || mockEmployees}
                  reports={reportsData || mockMedicalReports}
                />
              </CardContent>
            </Card>
          </div>

          {/* Full Width Sections */}
          <div className="space-y-8">
            {/* Validation Errors */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Validation Errors</CardTitle>
                <CardDescription>Issues requiring attention in medical records</CardDescription>
              </CardHeader>
              <CardContent>
                <ValidationErrorsTable errors={validationErrorsData || mockValidationErrors} />
              </CardContent>
            </Card>

            {/* Workplace Health */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Workplace Health Summary</CardTitle>
                <CardDescription>Health metrics across different departments</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkplaceHealthTable data={workplaceHealthData || mockWorkplaceHealth} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}