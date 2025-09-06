'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Stethoscope,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Heart,
  Users,
  Building2,
  Calendar
} from 'lucide-react';

// Professional chart colors using new palette
const COLORS = {
  normal: '#178089', // Teal
  abnormal: '#D65241', // Sunset  
  notDone: '#D7D9D9', // Light Grey
  primary: '#B6D9CE', // Duck Egg
  secondary: '#F5D8DC', // Lily
  accent: '#EAB75C', // Daisy
};

const CHART_COLORS = [
  '#178089', '#B6D9CE', '#B4CABC', '#759282', '#EAB75C', 
  '#E19985', '#F5D8DC', '#EDBABE', '#EADC99', '#D65241'
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 border rounded-lg shadow-lg" style={{ backgroundColor: '#F2EFED' }}>
        <p className="font-medium mb-2" style={{ color: '#111827' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: '#586D6A' }}>{entry.dataKey}:</span>
            <span className="font-medium">
              {formatter ? formatter(entry.value) : entry.value?.toLocaleString() || '0'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Safe data access helper
const safeGet = (obj: any, path: string, defaultValue: any = 0) => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Error boundary component
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-red-200 rounded-lg">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Chart rendering error</p>
            <p className="text-sm text-muted-foreground">Please refresh the page or contact support</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ClinicalExaminationsChart = ({ data }: { data: any }) => {
  // Enhanced data validation
  if (!data || typeof data !== 'object') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Invalid data format</p>
      </div>
    );
  }

  if (!data.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Safe destructuring with defaults
  const summaryStats = data.summaryStats || {};
  const chartData = Array.isArray(data.chartData) ? data.chartData : [];
  const organizationData = Array.isArray(data.organizationData) ? data.organizationData : [];
  const trendData = Array.isArray(data.trendData) ? data.trendData : [];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No clinical examinations data found</p>
      </div>
    );
  }

  // Sort chart data by total count for better visualization
  const sortedChartData = [...chartData]
    .filter(exam => exam && typeof exam === 'object')
    .sort((a, b) => (safeGet(b, 'total_count', 0) - safeGet(a, 'total_count', 0)));
  
  const topExaminations = sortedChartData.slice(0, 8);

  // Safe summary stats access
  const totalExaminations = safeGet(summaryStats, 'total_examinations', 0);
  const totalEmployees = safeGet(summaryStats, 'total_employees', 0);
  const examinationTypes = safeGet(summaryStats, 'examination_types', 0);
  const averagePositiveRate = safeGet(summaryStats, 'average_positive_rate', 0);
  const organizationsCount = safeGet(summaryStats, 'organizations_count', 0);
  const mostCommonExam = safeGet(summaryStats, 'most_common_exam', 'N/A');

  return (
    <ChartErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Clinical Examinations Analytics</h2>
          <p className="text-muted-foreground">Real-time assessment results and examination trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: '#178089' }} />
                <div>
                  <p className="text-sm text-muted-foreground">Total Examinations</p>
                  <p className="text-2xl font-bold">{totalExaminations.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: '#B4CABC' }} />
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{totalEmployees.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" style={{ color: '#B6D9CE' }} />
                <div>
                  <p className="text-sm text-muted-foreground">Exam Types</p>
                  <p className="text-2xl font-bold">{examinationTypes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: '#EAB75C' }} />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Positive Rate</p>
                  <p className="text-2xl font-bold">{averagePositiveRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: '#D65241' }} />
                <div>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                  <p className="text-2xl font-bold">{organizationsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" style={{ color: '#759282' }} />
                <div>
                  <p className="text-sm text-muted-foreground">Top Exam</p>
                  <p className="text-sm font-bold truncate" title={mostCommonExam}>
                    {mostCommonExam}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bar Chart - Top Examinations by Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Examinations by Volume
              </CardTitle>
              <CardDescription>Most frequently performed clinical examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={topExaminations.map(exam => ({
                    name: (exam.examination_type || '').replace(' Assessment', ''),
                    total: safeGet(exam, 'total_count', 0),
                    normal: safeGet(exam, 'positive_count', 0),
                    abnormal: safeGet(exam, 'negative_count', 0),
                    notDone: safeGet(exam, 'not_done_count', 0)
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2EFED" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                    stroke="#586D6A"
                  />
                  <YAxis stroke="#586D6A" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="normal" fill={COLORS.normal} name="Normal" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="abnormal" fill={COLORS.abnormal} name="Abnormal" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="notDone" fill={COLORS.notDone} name="Not Done" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Overall Results Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Overall Results Distribution
              </CardTitle>
              <CardDescription>Distribution of all clinical examination results</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'Normal',
                        value: sortedChartData.reduce((sum, exam) => sum + safeGet(exam, 'positive_count', 0), 0),
                        fill: COLORS.normal
                      },
                      {
                        name: 'Abnormal', 
                        value: sortedChartData.reduce((sum, exam) => sum + safeGet(exam, 'negative_count', 0), 0),
                        fill: COLORS.abnormal
                      },
                      {
                        name: 'Not Done',
                        value: sortedChartData.reduce((sum, exam) => sum + safeGet(exam, 'not_done_count', 0), 0),
                        fill: COLORS.notDone
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {[COLORS.normal, COLORS.abnormal, COLORS.notDone].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), '']}
                    labelFormatter={(label) => `${label} Results`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Organization Performance Charts */}
        {organizationData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Horizontal Bar Chart - Organization Positive Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Positive Rates
                </CardTitle>
                <CardDescription>Percentage of normal results by organization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="horizontal"
                    data={organizationData
                      .filter((org: any) => org && typeof org === 'object')
                      .map((org: any) => ({
                        name: (org.organization_name || '').length > 20 
                          ? (org.organization_name || '').substring(0, 20) + '...' 
                          : org.organization_name || 'Unknown',
                        positive_rate: safeGet(org, 'positive_rate', 0),
                        total_examinations: safeGet(org, 'total_examinations', 0)
                      }))}
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2EFED" />
                    <XAxis type="number" domain={[0, 100]} stroke="#586D6A" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#586D6A" 
                      fontSize={10}
                      width={90}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value}%`, 
                        'Positive Rate'
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar 
                      dataKey="positive_rate" 
                      fill={COLORS.primary}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Examinations by Organization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Examinations by Organization
                </CardTitle>
                <CardDescription>Distribution of total examinations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        // Sort organizations by examination count
                        const sortedOrgs = organizationData
                          .filter((org: any) => org && typeof org === 'object')
                          .sort((a: any, b: any) => safeGet(b, 'total_examinations', 0) - safeGet(a, 'total_examinations', 0));
                        
                        // Take top 6 organizations
                        const topOrgs = sortedOrgs.slice(0, 6);
                        const otherOrgs = sortedOrgs.slice(6);
                        
                        // Calculate total for "Others" category
                        const othersTotal = otherOrgs.reduce((sum: number, org: any) => 
                          sum + safeGet(org, 'total_examinations', 0), 0);
                        
                        // Create chart data
                        const chartData = topOrgs.map((org: any, index: number) => ({
                          name: org.organization_name || 'Unknown',
                          value: safeGet(org, 'total_examinations', 0),
                          fill: CHART_COLORS[index % CHART_COLORS.length],
                          originalName: org.organization_name || 'Unknown'
                        }));
                        
                        // Add "Others" category if there are remaining organizations
                        if (othersTotal > 0) {
                          chartData.push({
                            name: `Others (${otherOrgs.length} orgs)`,
                            value: othersTotal,
                            fill: CHART_COLORS[6 % CHART_COLORS.length],
                            originalName: `Others (${otherOrgs.length} organizations)`
                          });
                        }
                        
                        return chartData;
                      })()}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ percent, value }) => {
                        const percentage = (percent || 0) * 100;
                        // Only show labels for slices larger than 2%
                        if (percentage >= 2) {
                          return `${percentage.toFixed(1)}%`;
                        }
                        return null;
                      }}
                      labelLine={false}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => {
                        // Calculate total from all data points
                        const allData = organizationData
                          .filter((org: any) => org && typeof org === 'object')
                          .map((org: any) => safeGet(org, 'total_examinations', 0));
                        const total = allData.reduce((sum: number, val: number) => sum + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return [
                          `${value.toLocaleString()} (${percentage}%)`, 
                          'Examinations'
                        ];
                      }}
                      labelFormatter={(label: string, payload: any) => {
                        return payload?.[0]?.payload?.originalName || label;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={80}
                      formatter={(value: string, entry: any) => {
                        const name = entry.payload?.originalName || value;
                        return name.length > 20 ? name.substring(0, 20) + '...' : name;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Trends Charts */}
        {trendData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Line Chart - Examination Volume Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Examination Volume
                </CardTitle>
                <CardDescription>Total examinations and unique employees over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[...trendData]
                      .filter(trend => trend && typeof trend === 'object')
                      .reverse()
                      .map(trend => ({
                        month: new Date(safeGet(trend, 'month', new Date())).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                        examinations: safeGet(trend, 'total_examinations', 0),
                        employees: safeGet(trend, 'unique_employees', 0)
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2EFED" />
                    <XAxis dataKey="month" stroke="#586D6A" fontSize={12} />
                    <YAxis stroke="#586D6A" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="examinations" 
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      name="Total Examinations"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="employees" 
                      stroke={COLORS.secondary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
                      name="Unique Employees"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Area Chart - Results Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Monthly Results Trends
                </CardTitle>
                <CardDescription>Normal vs abnormal results over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[...trendData]
                      .filter(trend => trend && typeof trend === 'object')
                      .reverse()
                      .map(trend => ({
                        month: new Date(safeGet(trend, 'month', new Date())).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                        positive: safeGet(trend, 'positive_results', 0),
                        negative: safeGet(trend, 'negative_results', 0)
                      }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2EFED" />
                    <XAxis dataKey="month" stroke="#586D6A" fontSize={12} />
                    <YAxis stroke="#586D6A" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stackId="1"
                      stroke={COLORS.normal}
                      fill={COLORS.normal}
                      fillOpacity={0.6}
                      name="Normal Results"
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stackId="1"
                      stroke={COLORS.abnormal}
                      fill={COLORS.abnormal}
                      fillOpacity={0.6}
                      name="Abnormal Results"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Examination Types Breakdown - Stacked Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Examination Results Breakdown
            </CardTitle>
            <CardDescription>Normal, abnormal, and not done results for each examination type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={sortedChartData.map(exam => ({
                  name: (exam.examination_type || '').replace(' Assessment', '').replace(' Function', ''),
                  normal: safeGet(exam, 'positive_count', 0),
                  abnormal: safeGet(exam, 'negative_count', 0),
                  notDone: safeGet(exam, 'not_done_count', 0),
                  total: safeGet(exam, 'total_count', 0)
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={10}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #D7D9D9',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="normal" 
                  stackId="results"
                  fill={COLORS.normal} 
                  name="Normal"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="abnormal" 
                  stackId="results"
                  fill={COLORS.abnormal} 
                  name="Abnormal"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="notDone" 
                  stackId="results"
                  fill={COLORS.notDone} 
                  name="Not Done"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Complete Examination Results
            </CardTitle>
            <CardDescription>Detailed breakdown of all clinical examinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedChartData.map((exam, index) => {
                const getBadgeVariant = (percentage: number) => {
                  if (percentage >= 90) return "default";
                  if (percentage >= 75) return "secondary";
                  return "destructive";
                };

                const positiveCount = safeGet(exam, 'positive_count', 0);
                const negativeCount = safeGet(exam, 'negative_count', 0);
                const notDoneCount = safeGet(exam, 'not_done_count', 0);
                const totalCount = safeGet(exam, 'total_count', 0);
                const positivePercentage = safeGet(exam, 'positive_percentage', 0);
                const examinationType = exam.examination_type || 'Unknown Examination';

                return (
                  <div key={`${examinationType}-${index}`} className="flex items-center justify-between p-4 border rounded-lg transition-colors" style={{ borderColor: '#D7D9D9' }}>
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{examinationType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {totalCount.toLocaleString()} total examinations
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{positiveCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Normal</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-red-600">{negativeCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Abnormal</div>
                      </div>

                      <div className="text-center">
                        <div className="font-bold" style={{ color: '#586D6A' }}>{notDoneCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Not Done</div>
                      </div>
                    </div>

                    <Badge variant={getBadgeVariant(positivePercentage)}>
                      {positivePercentage}% normal
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ChartErrorBoundary>
  );
};

export default ClinicalExaminationsChart;