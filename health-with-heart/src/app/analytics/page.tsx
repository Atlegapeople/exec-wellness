'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAPI } from '@/hooks/useAPI';
import StaffProductivityChart from '@/components/charts/StaffProductivityChart';
import MedicalOutcomesChart from '@/components/charts/MedicalOutcomesChart';
import VolumeAnalyticsChart from '@/components/charts/VolumeAnalyticsChart';
import EmployeeInsightsChart from '@/components/charts/EmployeeInsightsChart';
import MedicalHistoryInsightsChart from '@/components/charts/MedicalHistoryInsightsChart';
import LifestyleInsightsChart from '@/components/charts/LifestyleInsightsChart';
import ClinicalExaminationsChart from '@/components/charts/ClinicalExaminationsChart';
import MentalHealthChart from '@/components/charts/MentalHealthChart';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Stethoscope,
  Users,
  Heart,
  Apple,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';

function AnalyticsContent() {
  const goBack = useBreadcrumbBack();
  const [activeTab, setActiveTab] = useState('clinical-examinations');
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch organizations for dropdown
  const { data: organizations } = useAPI<{ organizations: any[] }>(
    '/api/organizations?limit=1000'
  );

  // Debug: Log organizations data
  console.log('Organizations data:', organizations);

  // Build API URLs with memoization to prevent infinite re-renders
  const apiUrls = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedOrganization !== 'all')
      params.append('organization', selectedOrganization);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const paramString = params.toString();
    const queryString = paramString ? `?${paramString}` : '';

    return {
      staffProductivity: `/api/analytics/staff-productivity${queryString}`,
      medicalOutcomes: `/api/analytics/medical-outcomes${queryString}`,
      monthlyVolume: `/api/analytics/monthly-volume${queryString}`,
      employeeInsights: `/api/analytics/employee-insights${queryString}`,
      medicalHistory: `/api/analytics/medical-history${queryString}`,
      lifestyle: `/api/analytics/lifestyle${queryString}`,
      clinicalExaminations: `/api/analytics/clinical-examinations${queryString}`,
      mentalHealth: `/api/analytics/mental-health${queryString}`,
    };
  }, [selectedOrganization, startDate, endDate]);

  // Fetch analytics data with filtering - include URL dependencies to trigger refetch when filters change
  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
    retry: retryStaff,
  } = useAPI(apiUrls.staffProductivity, [apiUrls.staffProductivity]);
  const {
    data: outcomesData,
    loading: outcomesLoading,
    error: outcomesError,
    retry: retryOutcomes,
  } = useAPI(apiUrls.medicalOutcomes, [apiUrls.medicalOutcomes]);
  const {
    data: volumeData,
    loading: volumeLoading,
    error: volumeError,
    retry: retryVolume,
  } = useAPI(apiUrls.monthlyVolume, [apiUrls.monthlyVolume]);
  const {
    data: employeeData,
    loading: employeeLoading,
    error: employeeError,
    retry: retryEmployee,
  } = useAPI(apiUrls.employeeInsights, [apiUrls.employeeInsights]);
  const {
    data: medicalHistoryData,
    loading: medicalHistoryLoading,
    error: medicalHistoryError,
    retry: retryMedicalHistory,
  } = useAPI(apiUrls.medicalHistory, [apiUrls.medicalHistory]);
  const {
    data: lifestyleData,
    loading: lifestyleLoading,
    error: lifestyleError,
    retry: retryLifestyle,
  } = useAPI(apiUrls.lifestyle, [apiUrls.lifestyle]);
  const {
    data: clinicalExaminationsData,
    loading: clinicalExaminationsLoading,
    error: clinicalExaminationsError,
    retry: retryClinicalExaminations,
  } = useAPI(apiUrls.clinicalExaminations, [apiUrls.clinicalExaminations]);
  const {
    data: mentalHealthData,
    loading: mentalHealthLoading,
    error: mentalHealthError,
    retry: retryMentalHealth,
  } = useAPI(apiUrls.mentalHealth, [apiUrls.mentalHealth]);

  // Reset initial load state when data starts loading
  useEffect(() => {
    if (
      staffLoading ||
      outcomesLoading ||
      volumeLoading ||
      employeeLoading ||
      medicalHistoryLoading ||
      lifestyleLoading ||
      clinicalExaminationsLoading ||
      mentalHealthLoading
    ) {
      setIsInitialLoad(false);
    }
  }, [
    staffLoading,
    outcomesLoading,
    volumeLoading,
    employeeLoading,
    medicalHistoryLoading,
    lifestyleLoading,
    clinicalExaminationsLoading,
    mentalHealthLoading,
  ]);

  // Handle initial page load and prevent loading state from getting stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }, 5000); // Reset after 5 seconds if still in initial load state

    return () => clearTimeout(timer);
  }, [isInitialLoad]);

  // Reset initial load state on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsInitialLoad(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Mark initial load as complete when organizations are loaded
  useEffect(() => {
    if (organizations && !isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [organizations, isInitialLoad]);

  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tabs = [
    {
      id: 'clinical-examinations',
      name: 'Clinical Exams',
      icon: Eye,
      description: 'Clinical examination results and assessments',
    },
    {
      id: 'mental-health',
      name: 'Mental Health',
      icon: Activity,
      description: 'Mental health assessment insights and trends',
    },
    {
      id: 'medical-history',
      name: 'Medical History',
      icon: Heart,
      description: 'Medical condition insights and trends',
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle Analytics',
      icon: Apple,
      description: 'Lifestyle behavior insights and health patterns',
    },
    {
      id: 'employees',
      name: 'Patient Insights',
      icon: Users,
      description: 'Interactive patient analytics with drill-down',
    },
    {
      id: 'productivity',
      name: 'Staff Productivity',
      icon: Stethoscope,
      description: 'Performance metrics and efficiency for all medical staff',
    },
    {
      id: 'outcomes',
      name: 'Medical Outcomes',
      icon: BarChart3,
      description: 'Health trends and fitness analysis',
    },
    {
      id: 'volume',
      name: 'Volume Analytics',
      icon: TrendingUp,
      description: 'Appointment patterns and capacity',
    },
  ];

  const isLoading =
    (staffLoading ||
      outcomesLoading ||
      volumeLoading ||
      employeeLoading ||
      medicalHistoryLoading ||
      lifestyleLoading ||
      clinicalExaminationsLoading ||
      mentalHealthLoading) &&
    !isInitialLoad;
  const hasErrors =
    staffError ||
    outcomesError ||
    volumeError ||
    employeeError ||
    medicalHistoryError ||
    lifestyleError ||
    clinicalExaminationsError ||
    mentalHealthError;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up'>
          {/* Back Button */}
          <div className='mb-4'>
            <Button variant='outline' onClick={goBack} className='hover-lift'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          </div>

          {/* Page Header */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-6 w-6 text-primary' />
              <h1 className='text-3xl font-bold text-foreground'>
                Medical Analytics
              </h1>
            </div>
            <div className='space-y-4'>
              {/* Initial Loading State */}
              {isInitialLoad && (
                <div className='flex items-center justify-center p-12'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    <span className='text-lg'>
                      Loading analytics dashboard...
                    </span>
                  </div>
                </div>
              )}

              {/* Filters Section */}
              {!isInitialLoad && (
                <div className='flex flex-wrap items-end gap-4 p-6 border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm'>
                  <div className='flex flex-col gap-2'>
                    <Label
                      htmlFor='organization'
                      className='text-sm font-medium text-foreground'
                    >
                      Organization
                    </Label>
                    <Select
                      value={selectedOrganization}
                      onValueChange={setSelectedOrganization}
                    >
                      <SelectTrigger className='w-64 h-10 border-border/60 hover:border-ring/60 transition-colors'>
                        <SelectValue placeholder='All Organizations' />
                      </SelectTrigger>
                      <SelectContent className='z-[9999]'>
                        <SelectItem value='all'>All Organizations</SelectItem>
                        {organizations?.organizations
                          ?.sort((a: any, b: any) =>
                            a.name.localeCompare(b.name)
                          )
                          ?.map((org: any) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label
                      htmlFor='startDate'
                      className='text-sm font-medium text-foreground'
                    >
                      Start Date
                    </Label>
                    <div className='relative'>
                      <Input
                        id='startDate'
                        type='date'
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className='w-48 h-10 border-border/60 hover:border-ring/60 transition-colors cursor-pointer pr-8'
                        placeholder='Select start date'
                      />
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0'>
                        <svg
                          className='h-4 w-4 text-muted-foreground opacity-50'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label
                      htmlFor='endDate'
                      className='text-sm font-medium text-foreground'
                    >
                      End Date
                    </Label>
                    <div className='relative'>
                      <Input
                        id='endDate'
                        type='date'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className='w-48 h-10 border-border/60 hover:border-ring/60 transition-colors cursor-pointer pr-8'
                        placeholder='Select end date'
                      />
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0'>
                        <svg
                          className='h-4 w-4 text-muted-foreground opacity-50'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedOrganization('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    variant='outline'
                    size='sm'
                    className='h-10 px-4 border-border/60 hover:border-ring/60 hover:bg-accent/50 transition-all duration-200'
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Loading Indicator */}
              {!isInitialLoad && isLoading && (
                <div className='flex items-center justify-center p-8'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <Loader2 className='h-5 w-5 animate-spin' />
                    <span>Loading analytics data...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Loading State */}
          {!isInitialLoad && isLoading && (
            <Card className='glass-effect'>
              <CardContent className='flex items-center justify-center py-20'>
                <div className='text-center space-y-4'>
                  <div className='relative'>
                    <Loader2
                      className='h-16 w-16 animate-spin mx-auto'
                      style={{ color: '#178089' }}
                    />
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <BarChart3
                        className='h-8 w-8'
                        style={{ color: '#B6D9CE' }}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-lg font-semibold text-foreground'>
                      Loading Analytics Data
                    </h3>
                    <p className='text-muted-foreground'>
                      Analyzing medical insights and trends...
                    </p>
                  </div>
                  <div className='flex flex-wrap justify-center gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          clinicalExaminationsLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: clinicalExaminationsLoading
                            ? '#178089'
                            : clinicalExaminationsError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Clinical Examinations
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          mentalHealthLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: mentalHealthLoading
                            ? '#178089'
                            : mentalHealthError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Mental Health
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          medicalHistoryLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: medicalHistoryLoading
                            ? '#178089'
                            : medicalHistoryError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Medical History
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          lifestyleLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: lifestyleLoading
                            ? '#178089'
                            : lifestyleError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Lifestyle Analytics
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          employeeLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: employeeLoading
                            ? '#178089'
                            : employeeError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Patient Insights
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          staffLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: staffLoading
                            ? '#178089'
                            : staffError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Staff Productivity
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          outcomesLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: outcomesLoading
                            ? '#178089'
                            : outcomesError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Medical Outcomes
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          volumeLoading ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: volumeLoading
                            ? '#178089'
                            : volumeError
                              ? '#D65241'
                              : '#759282',
                        }}
                      ></div>
                      <span className='text-muted-foreground'>
                        Volume Analytics
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {!isInitialLoad && hasErrors && !isLoading && (
            <Card className='border-destructive'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertCircle className='h-5 w-5 text-destructive' />
                  <h3 className='font-semibold text-destructive'>
                    Data Loading Error
                  </h3>
                </div>
                <p className='text-muted-foreground mb-4'>
                  Some analytics data could not be loaded. Please check your
                  database connection.
                </p>
                <div className='space-y-2 mb-4'>
                  {staffError && (
                    <div className='text-sm text-destructive'>
                      • Staff Productivity: {staffError}
                    </div>
                  )}
                  {outcomesError && (
                    <div className='text-sm text-destructive'>
                      • Medical Outcomes: {outcomesError}
                    </div>
                  )}
                  {volumeError && (
                    <div className='text-sm text-destructive'>
                      • Volume Analytics: {volumeError}
                    </div>
                  )}
                  {employeeError && (
                    <div className='text-sm text-destructive'>
                      • Employee Insights: {employeeError}
                    </div>
                  )}
                  {medicalHistoryError && (
                    <div className='text-sm text-destructive'>
                      • Medical History: {medicalHistoryError}
                    </div>
                  )}
                  {lifestyleError && (
                    <div className='text-sm text-destructive'>
                      • Lifestyle Analytics: {lifestyleError}
                    </div>
                  )}
                  {clinicalExaminationsError && (
                    <div className='text-sm text-destructive'>
                      • Clinical Examinations: {clinicalExaminationsError}
                    </div>
                  )}
                  {mentalHealthError && (
                    <div className='text-sm text-destructive'>
                      • Mental Health: {mentalHealthError}
                    </div>
                  )}
                </div>
                <div className='flex gap-2'>
                  <Button
                    onClick={() => {
                      retryStaff();
                      retryOutcomes();
                      retryVolume();
                      retryEmployee();
                      retryMedicalHistory();
                      retryLifestyle();
                      retryClinicalExaminations();
                      retryMentalHealth();
                    }}
                    variant='outline'
                    className='hover-lift'
                  >
                    Retry All
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant='destructive'
                    className='hover-lift'
                  >
                    Reload Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Tabs */}
          {!isInitialLoad && !isLoading && !hasErrors && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='space-y-6'
            >
              <TabsList className='grid w-full grid-cols-8 lg:w-auto lg:grid-cols-8 analytics-tabs-list'>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className='flex items-center gap-2 analytics-tab-hover data-[state=active]:analytics-tab-active'
                    >
                      <Icon className='h-4 w-4 transition-colors duration-300' />
                      <span className='hidden sm:inline font-work-sans-medium'>
                        {tab.name}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Clinical Examinations Tab */}
              <TabsContent value='clinical-examinations' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardContent className='p-6'>
                    {clinicalExaminationsData ? (
                      <ClinicalExaminationsChart
                        data={clinicalExaminationsData}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mental Health Tab */}
              <TabsContent value='mental-health' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardContent className='p-6'>
                    {mentalHealthData ? (
                      <MentalHealthChart data={mentalHealthData} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical History Tab */}
              <TabsContent value='medical-history' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardContent className='p-6'>
                    {medicalHistoryData ? (
                      <MedicalHistoryInsightsChart data={medicalHistoryData} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lifestyle Analytics Tab */}
              <TabsContent value='lifestyle' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardContent className='p-6'>
                    {lifestyleData ? (
                      <LifestyleInsightsChart data={lifestyleData} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Patient Insights Tab */}
              <TabsContent value='employees' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardContent className='p-6'>
                    {employeeData ? (
                      <EmployeeInsightsChart data={employeeData} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Staff Productivity Tab */}
              <TabsContent value='productivity' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardContent className='p-6'>
                    {staffData ? (
                      <StaffProductivityChart data={staffData as any} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical Outcomes Tab */}
              <TabsContent value='outcomes' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <BarChart3 className='h-5 w-5 text-primary' />
                      Medical Outcomes & Trends
                    </CardTitle>
                    <CardDescription>
                      Health trends, fitness rates, and demographic analysis
                      across age groups.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {outcomesData ? (
                      <MedicalOutcomesChart data={outcomesData as any} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Volume Analytics Tab */}
              <TabsContent value='volume' className='space-y-6'>
                <Card className='hover-lift'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <TrendingUp className='h-5 w-5 text-primary' />
                      Volume & Capacity Analytics
                    </CardTitle>
                    <CardDescription>
                      Appointment patterns, peak hours analysis, and operational
                      efficiency metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {volumeData ? (
                      <VolumeAnalyticsChart data={volumeData as any} />
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Analytics Info Card */}
          <Card className='glass-effect'>
            <CardContent className='p-6'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                <div>
                  <h3 className='font-semibold text-foreground mb-2 flex items-center gap-2'>
                    <Activity className='h-5 w-5 text-primary' />
                    Advanced Medical Analytics
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Real-time insights from your OHMS database. Data
                    automatically updates as new medical reports and
                    appointments are processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function Analytics() {
  return (
    <Suspense
      fallback={
        <ProtectedRoute>
          <DashboardLayout>
            <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up'>
              <div className='flex items-center justify-center p-12'>
                <div className='flex items-center gap-3 text-muted-foreground'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span className='text-lg'>
                    Loading analytics dashboard...
                  </span>
                </div>
              </div>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
