'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAPI } from '@/hooks/useAPI';
import {
  Eye,
  Calendar,
  Building2,
  TrendingUp,
  Users,
  Activity,
  FileSpreadsheet,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface ClinicalExamsData {
  summaryStats: {
    total_examinations: number;
    total_employees: number;
    examination_types: number;
    average_positive_rate: number;
    most_common_exam: string;
    organizations_count: number;
  };
  chartData: Array<{
    examination_type: string;
    total_count: number;
    positive_count: number;
    negative_count: number;
    not_done_count: number;
    positive_percentage: number;
  }>;
  organizationData: Array<{
    organization_name: string;
    organization_id: string;
    total_examinations: number;
    total_employees: number;
    examination_types: number;
    positive_rate: number;
  }>;
  trendData: Array<{
    month: string;
    total_examinations: number;
    unique_employees: number;
    positive_results: number;
    negative_results: number;
  }>;
  detailedData: Array<{
    examination_type: string;
    result_status: string;
    count: number;
    organization_name: string;
  }>;
}

export default function ClinicalExaminationsAnalytics() {
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Build API URL with filters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedOrganization !== 'all')
      params.append('organization', selectedOrganization);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `/api/analytics/clinical-examinations${params.toString() ? '?' + params.toString() : ''}`;
  }, [selectedOrganization, startDate, endDate]);

  // Fetch data
  const { data: organizations } = useAPI<{ organizations: any[] }>(
    '/api/organizations?limit=1000'
  );
  const {
    data: clinicalData,
    loading,
    error,
    retry: refetch,
  } = useAPI<ClinicalExamsData>(apiUrl, [
    selectedOrganization,
    startDate,
    endDate,
  ]);

  const exportToCSV = () => {
    if (!clinicalData?.chartData) return;

    const csvData = [
      [
        'Examination Type',
        'Total Count',
        'Positive',
        'Negative',
        'Not Done',
        'Positive Rate %',
      ],
      ...clinicalData.chartData.map(item => [
        item.examination_type,
        item.total_count,
        item.positive_count,
        item.negative_count,
        item.not_done_count,
        item.positive_percentage,
      ]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `clinical-examinations-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSelectedOrganization('all');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 py-8'>
            <div className='flex items-center justify-center min-h-96'>
              <div className='text-center space-y-4'>
                <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto' />
                <h3 className='text-lg font-semibold'>
                  Loading Clinical Examinations Analytics
                </h3>
                <p className='text-muted-foreground'>
                  Processing examination data...
                </p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 py-8'>
            <Card className='border-destructive'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertCircle className='h-5 w-5 text-destructive' />
                  <h3 className='font-semibold text-destructive'>
                    Data Loading Error
                  </h3>
                </div>
                <p className='text-muted-foreground mb-4'>
                  Failed to load clinical examinations data. Please check your
                  database connection.
                </p>
                <Button onClick={() => refetch()} variant='destructive'>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 py-8 space-y-8'>
          {/* Header */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Eye className='h-6 w-6 text-primary' />
              <h1 className='text-3xl font-bold'>
                Clinical Examinations Analytics
              </h1>
            </div>
            <p className='text-muted-foreground'>
              Comprehensive analysis of clinical examination results and trends
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Filters & Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                <div className='space-y-2'>
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
                    <SelectTrigger className='h-10 border-border/60 hover:border-ring/60 transition-colors'>
                      <SelectValue placeholder='All Organizations' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Organizations</SelectItem>
                      {organizations?.organizations
                        ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                        ?.map((org: any) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
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
                      className='h-10 border-border/60 hover:border-ring/60 transition-colors cursor-pointer pr-8'
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

                <div className='space-y-2'>
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
                      className='h-10 border-border/60 hover:border-ring/60 transition-colors cursor-pointer pr-8'
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

                <div className='flex gap-2'>
                  <Button
                    onClick={clearFilters}
                    variant='outline'
                    size='sm'
                    className='h-10 px-4 border-border/60 hover:border-ring/60 hover:bg-accent/50 transition-all duration-200'
                  >
                    Clear Filters
                  </Button>
                  <Button onClick={exportToCSV} variant='outline' size='sm'>
                    <Download className='h-4 w-4 mr-2' />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          {clinicalData?.summaryStats && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Activity
                      className='h-5 w-5'
                      style={{ color: '#178089' }}
                    />
                    <span className='text-sm font-medium text-muted-foreground'>
                      Total Examinations
                    </span>
                  </div>
                  <div className='text-2xl font-bold mt-2'>
                    {clinicalData.summaryStats.total_examinations.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-5 w-5' style={{ color: '#B4CABC' }} />
                    <span className='text-sm font-medium text-muted-foreground'>
                      Total Employees
                    </span>
                  </div>
                  <div className='text-2xl font-bold mt-2'>
                    {clinicalData.summaryStats.total_employees.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Eye className='h-5 w-5' style={{ color: '#B6D9CE' }} />
                    <span className='text-sm font-medium text-muted-foreground'>
                      Exam Types
                    </span>
                  </div>
                  <div className='text-2xl font-bold mt-2'>
                    {clinicalData.summaryStats.examination_types}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <TrendingUp
                      className='h-5 w-5'
                      style={{ color: '#EAB75C' }}
                    />
                    <span className='text-sm font-medium text-muted-foreground'>
                      Avg Positive Rate
                    </span>
                  </div>
                  <div className='text-2xl font-bold mt-2'>
                    {clinicalData.summaryStats.average_positive_rate}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Building2
                      className='h-5 w-5'
                      style={{ color: '#D65241' }}
                    />
                    <span className='text-sm font-medium text-muted-foreground'>
                      Organizations
                    </span>
                  </div>
                  <div className='text-2xl font-bold mt-2'>
                    {clinicalData.summaryStats.organizations_count}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2
                      className='h-5 w-5'
                      style={{ color: '#759282' }}
                    />
                    <span className='text-sm font-medium text-muted-foreground'>
                      Top Exam
                    </span>
                  </div>
                  <div
                    className='text-sm font-bold mt-2 truncate'
                    title={clinicalData.summaryStats.most_common_exam}
                  >
                    {clinicalData.summaryStats.most_common_exam}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Examination Types Breakdown */}
          {clinicalData?.chartData && clinicalData.chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Examination Types Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of examination results by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {clinicalData.chartData.slice(0, 10).map((exam, index) => (
                    <div
                      key={exam.examination_type}
                      className='border rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium'>{exam.examination_type}</h4>
                        <Badge variant='outline'>
                          {exam.total_count} total
                        </Badge>
                      </div>

                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-green-500' />
                          <span>Normal: {exam.positive_count}</span>
                          <span className='text-muted-foreground'>
                            ({exam.positive_percentage}%)
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <XCircle className='h-4 w-4 text-red-500' />
                          <span>Abnormal: {exam.negative_count}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-gray-500' />
                          <span>Not Done: {exam.not_done_count}</span>
                        </div>
                      </div>

                      <div className='mt-3'>
                        <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                          <div className='h-full flex'>
                            <div
                              className='bg-green-500'
                              style={{
                                width: `${(exam.positive_count / exam.total_count) * 100}%`,
                              }}
                            ></div>
                            <div
                              className='bg-red-500'
                              style={{
                                width: `${(exam.negative_count / exam.total_count) * 100}%`,
                              }}
                            ></div>
                            <div
                              className='bg-gray-400'
                              style={{
                                width: `${(exam.not_done_count / exam.total_count) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Comparison */}
          {clinicalData?.organizationData &&
            clinicalData.organizationData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Building2 className='h-5 w-5' />
                    Organization Comparison
                  </CardTitle>
                  <CardDescription>
                    Performance metrics by organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {clinicalData.organizationData.map((org, index) => (
                      <div
                        key={org.organization_id}
                        className='border rounded-lg p-4'
                      >
                        <div className='flex items-center justify-between mb-3'>
                          <h4 className='font-medium'>
                            {org.organization_name}
                          </h4>
                          <Badge
                            variant={
                              org.positive_rate >= 80
                                ? 'default'
                                : org.positive_rate >= 60
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {org.positive_rate}% positive rate
                          </Badge>
                        </div>

                        <div className='grid grid-cols-3 gap-4 text-sm'>
                          <div>
                            <span className='text-muted-foreground'>
                              Examinations:
                            </span>
                            <div className='font-semibold'>
                              {org.total_examinations.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className='text-muted-foreground'>
                              Employees:
                            </span>
                            <div className='font-semibold'>
                              {org.total_employees.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className='text-muted-foreground'>
                              Exam Types:
                            </span>
                            <div className='font-semibold'>
                              {org.examination_types}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Trend Analysis */}
          {clinicalData?.trendData && clinicalData.trendData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <LineChart className='h-5 w-5' />
                  Monthly Trends (Last 12 Months)
                </CardTitle>
                <CardDescription>
                  Examination volume and result trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {clinicalData.trendData.map((trend, index) => (
                    <div key={trend.month} className='border rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium'>
                          {new Date(trend.month).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                          })}
                        </h4>
                        <Badge variant='outline'>
                          {trend.total_examinations} exams
                        </Badge>
                      </div>

                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <span className='text-muted-foreground'>
                            Employees:
                          </span>
                          <div className='font-semibold'>
                            {trend.unique_employees}
                          </div>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Positive:
                          </span>
                          <div className='font-semibold text-green-600'>
                            {trend.positive_results}
                          </div>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>
                            Negative:
                          </span>
                          <div className='font-semibold text-red-600'>
                            {trend.negative_results}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
