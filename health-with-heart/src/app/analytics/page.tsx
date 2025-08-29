'use client';

import { useState } from 'react';
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
import DashboardLayout from '@/components/DashboardLayout';
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
  ArrowLeft,
} from 'lucide-react';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('clinical-examinations');

  // Fetch analytics data
  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
  } = useAPI('/api/analytics/staff-productivity');
  const {
    data: outcomesData,
    loading: outcomesLoading,
    error: outcomesError,
  } = useAPI('/api/analytics/medical-outcomes');
  const {
    data: volumeData,
    loading: volumeLoading,
    error: volumeError,
  } = useAPI('/api/analytics/monthly-volume');
  const {
    data: employeeData,
    loading: employeeLoading,
    error: employeeError,
  } = useAPI('/api/analytics/employee-insights');
  const {
    data: medicalHistoryData,
    loading: medicalHistoryLoading,
    error: medicalHistoryError,
  } = useAPI('/api/analytics/medical-history');
  const {
    data: lifestyleData,
    loading: lifestyleLoading,
    error: lifestyleError,
  } = useAPI('/api/analytics/lifestyle');
  const {
    data: clinicalExaminationsData,
    loading: clinicalExaminationsLoading,
    error: clinicalExaminationsError,
  } = useAPI('/api/analytics/clinical-examinations');
  const {
    data: mentalHealthData,
    loading: mentalHealthLoading,
    error: mentalHealthError,
  } = useAPI('/api/analytics/mental-health');

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
    staffLoading ||
    outcomesLoading ||
    volumeLoading ||
    employeeLoading ||
    medicalHistoryLoading ||
    lifestyleLoading ||
    clinicalExaminationsLoading ||
    mentalHealthLoading;
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
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up'>
        {/* Back Button */}
        <div className='mb-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.history.back()}
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back</span>
          </Button>
        </div>

        {/* Page Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <BarChart3 className='h-6 w-6 text-primary' />
            <h1 className='text-3xl font-bold text-foreground'>
              Medical Analytics
            </h1>
          </div>
          <p className='text-muted-foreground'>
            Advanced insights for clinical decision making and operational
            excellence
          </p>
        </div>
        {/* Loading State */}
        {isLoading && (
          <Card className='glass-effect'>
            <CardContent className='flex items-center justify-center py-20'>
              <div className='text-center space-y-4'>
                <div className='relative'>
                  <Loader2 className='h-16 w-16 animate-spin text-primary mx-auto' />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <BarChart3 className='h-8 w-8 text-primary/30' />
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
                      className={`w-2 h-2 rounded-full ${clinicalExaminationsLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>
                      Clinical Examinations
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${mentalHealthLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>Mental Health</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${medicalHistoryLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>
                      Medical History
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${lifestyleLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>
                      Lifestyle Analytics
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${employeeLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>
                      Patient Insights
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${staffLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>
                      Staff Productivity
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${outcomesLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
                    ></div>
                    <span className='text-muted-foreground'>
                      Medical Outcomes
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${volumeLoading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}
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
        {hasErrors && !isLoading && (
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
              <Button
                onClick={() => window.location.reload()}
                variant='destructive'
                className='hover-lift'
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tabs */}
        {!isLoading && !hasErrors && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-8 lg:w-auto lg:grid-cols-8'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className='flex items-center gap-2'
                  >
                    <Icon className='h-4 w-4' />
                    <span className='hidden sm:inline'>{tab.name}</span>
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
                  Real-time insights from your OHMS database. Data automatically
                  updates as new medical reports and appointments are processed.
                </p>
              </div>
              <div className='flex flex-col gap-2'>
                <Badge
                  variant='default'
                  className='bg-green-500/10 text-green-600 border-green-500/20'
                >
                  <CheckCircle className='h-3 w-3 mr-1' />
                  Live database connection
                </Badge>
                <Badge
                  variant='default'
                  className='bg-green-500/10 text-green-600 border-green-500/20'
                >
                  <CheckCircle className='h-3 w-3 mr-1' />
                  Real-time analytics
                </Badge>
                <Badge
                  variant='default'
                  className='bg-green-500/10 text-green-600 border-green-500/20'
                >
                  <CheckCircle className='h-3 w-3 mr-1' />
                  Interactive visualizations
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
