'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import { 
  Stethoscope,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { PALETTE, CHART_SERIES_COLORS } from '@/lib/chartColors';
import { StaffProductivityPieChart } from './StaffProductivityPieChart';

interface StaffProductivity {
  staff_name: string;
  staff_role: 'Doctor' | 'Nurse';
  total_reports: number;
  signed_reports: number;
  unsigned_reports: number;
  signing_rate_pct: number;
}

interface WeeklyTrend {
  week_start: string;
  unsigned_reports: number;
}

interface TopUnsigned {
  staff_name: string;
  unsigned_reports: number;
}

interface StaffProductivityChartProps {
  data: {
    staff: StaffProductivity[];
    weeklyTrend: WeeklyTrend[];
    topUnsigned: TopUnsigned[];
  };
}


export default function StaffProductivityChart({ data }: StaffProductivityChartProps) {
  console.log('Staff Productivity Data:', data);
  
  if (!data || !data.staff || data.staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No staff productivity data available</p>
          <p className="text-sm text-muted-foreground mt-2">Data length: {data?.staff?.length || 0}</p>
        </div>
      </div>
    );
  }

  // Process staff data - now includes both doctors and nurses
  const staffData = data.staff;
  const weeklyTrendData = data.weeklyTrend || [];
  const topUnsignedData = data.topUnsigned || [];
  
  const topPerformers = staffData.sort((a, b) => b.signing_rate_pct - a.signing_rate_pct).slice(0, 10);
  
  const doctorData = staffData.filter(item => item.staff_role === 'Doctor');
  const nurseData = staffData.filter(item => item.staff_role === 'Nurse');

  const totalReports = staffData.reduce((sum, item) => sum + parseInt(item.total_reports?.toString() || '0'), 0);
  const totalSigned = staffData.reduce((sum, item) => sum + parseInt(item.signed_reports?.toString() || '0'), 0);
  const totalUnsigned = staffData.reduce((sum, item) => sum + parseInt(item.unsigned_reports?.toString() || '0'), 0);
  const overallSigningRate = totalReports > 0 ? Math.round((totalSigned / totalReports) * 100) : 0;

  // Doctor signing overview data
  const signingOverviewData = [
    {
      status: 'Signed Reports',
      count: totalSigned,
      percentage: overallSigningRate,
      fill: "var(--color-signed)"
    },
    {
      status: 'Unsigned Reports', 
      count: totalUnsigned,
      percentage: 100 - overallSigningRate,
      fill: "var(--color-unsigned)"
    }
  ];

  const pieChartConfig = {
    count: {
      label: "Reports",
    },
    signed: {
      label: "Signed Reports",
      color: PALETTE.primary.base,
    },
    unsigned: {
      label: "Unsigned Reports", 
      color: PALETTE.secondary.alert,
    },
  };
  
  console.log('Signing Overview Data:', signingOverviewData);
  console.log('Total Signed:', totalSigned);
  console.log('Total Unsigned:', totalUnsigned);
  console.log('Overall Signing Rate:', overallSigningRate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-teal-600" />
              <div>
                <p className="text-2xl font-bold">{doctorData.length + nurseData.length}</p>
                <p className="text-sm text-muted-foreground">Medical Staff</p>
                <p className="text-xs text-muted-foreground">{doctorData.length} Doctors, {nurseData.length} Nurses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-sage-600" />
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-fern-600" />
              <div>
                <p className="text-2xl font-bold">{overallSigningRate}%</p>
                <p className="text-sm text-muted-foreground">Signing Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-daisy-600" />
              <div>
                <p className="text-2xl font-bold">{totalUnsigned}</p>
                <p className="text-sm text-muted-foreground">Unsigned Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gap: "24px" }}>
        <Card 
          style={{ 
            background: "#FFFFFF", 
            border: "1px solid #D7D9D9", 
            borderRadius: "12px", 
            padding: "20px", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
          }}
        >
          <CardHeader className="p-0 mb-4">
            <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Staff Report Volume
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
              Total reports processed by staff member
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topPerformers}
                margin={{
                  top: 20,
                  bottom: 60,
                  left: 20,
                  right: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
                <XAxis
                  dataKey="staff_name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: "#586D6A" }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#586D6A" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D7D9D9',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [value, 'Total Reports']}
                  labelFormatter={(label) => `Staff: ${label}`}
                />
                <Bar 
                  dataKey="total_reports" 
                  fill="#178089" 
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    position="top"
                    offset={8}
                    style={{ fill: "#374151", fontSize: "12px" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Top performing medical staff <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        <Card 
          style={{ 
            background: "#FFFFFF", 
            border: "1px solid #D7D9D9", 
            borderRadius: "12px", 
            padding: "20px", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
          }}
        >
          <CardHeader className="p-0 mb-4">
            <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Doctor vs Nurse Volume Comparison
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
              Report volume comparison by role
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { 
                    role: 'Doctors', 
                    total_reports: doctorData.reduce((sum, item) => sum + parseInt(item.total_reports?.toString() || '0'), 0),
                    staff_count: doctorData.length
                  },
                  { 
                    role: 'Nurses', 
                    total_reports: nurseData.reduce((sum, item) => sum + parseInt(item.total_reports?.toString() || '0'), 0),
                    staff_count: nurseData.length
                  }
                ]}
                margin={{
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20,
                }}
                barCategoryGap={24}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
                <XAxis
                  dataKey="role"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: "#586D6A" }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#586D6A" }}
                  domain={[0, 1000]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D7D9D9',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name, props) => [
                    name === 'total_reports' ? `${value} reports` : `${value} staff`,
                    name === 'total_reports' ? 'Total Reports' : 'Staff Count'
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey="total_reports" 
                  fill="#B6D9CE" 
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    position="top"
                    offset={8}
                    style={{ fill: "#374151", fontSize: "12px" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Role-based productivity comparison <Users className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>

      <StaffProductivityPieChart 
        totalSigned={totalSigned}
        totalUnsigned={totalUnsigned}
        overallSigningRate={overallSigningRate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Doctor Productivity</CardTitle>
          <CardDescription>Signing rates for doctors only</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={doctorData.sort((a, b) => b.signing_rate_pct - a.signing_rate_pct)}
              margin={{
                top: 20,
                bottom: 60,
                left: 20,
                right: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="staff_name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={100}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <YAxis 
                domain={[0, 100]} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value}%`, 'Signing Rate']}
                labelFormatter={(label) => `Doctor: ${label}`}
              />
              <Bar 
                dataKey="signing_rate_pct" 
                fill={PALETTE.primary.base} 
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  position="top"
                  offset={8}
                  className="fill-foreground text-xs"
                  formatter={(value: any) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Doctor signing performance <Stethoscope className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Executive Medical report signing rates by doctor
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nurse Report Volume</CardTitle>
          <CardDescription>Reports assigned to nurses (signing not implemented)</CardDescription>
        </CardHeader>
        <CardContent>
          {nurseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={nurseData
                  .sort((a, b) => b.total_reports - a.total_reports)
                  .slice(0, 10)
                }
                margin={{
                  top: 20,
                  bottom: 60,
                  left: 20,
                  right: 20,
                }}
              >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="staff_name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={100}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <YAxis 
                domain={[0, 100]} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  name === 'total_reports' ? `${value} reports (0% signed)` : `${value}%`,
                  name === 'total_reports' ? 'Reports Assigned' : 'Signing Rate'
                ]}
                labelFormatter={(label) => `Nurse: ${label}`}
              />
              <Bar 
                dataKey="total_reports" 
                fill={PALETTE.secondary.warning} 
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  position="top"
                  offset={8}
                  className="fill-foreground text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground">No nurse productivity data available</p>
                <p className="text-sm text-muted-foreground mt-2">No nurses have reports assigned</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Nurse signing performance <Users className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Reports assigned to nurses - signing feature needs implementation
          </div>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Signing Status Breakdown</CardTitle>
            <CardDescription>Signed vs Unsigned reports by doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topPerformers.slice(0, 8)}
                margin={{
                  top: 20,
                  bottom: 60,
                  left: 20,
                  right: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="staff_name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="signed_reports" stackId="a" fill={PALETTE.primary.base} />
                <Bar dataKey="unsigned_reports" stackId="a" fill={PALETTE.secondary.alert} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Report signing status <FileText className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Teal: Signed reports, Red: Unsigned reports
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Staff</CardTitle>
            <CardDescription>Medical staff with highest signing rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((staff, index) => (
                <div key={`staff-${index}-${staff.staff_name}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{staff.staff_name}</p>
                        <Badge 
                          className={staff.staff_role === 'Doctor' ? "bg-teal-100 text-teal-700 border-teal-200" : "bg-blue-100 text-blue-700 border-blue-200"}
                        >
                          {staff.staff_role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {staff.signed_reports}/{staff.total_reports} reports signed
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={staff.signing_rate_pct >= 90 ? "default" : staff.signing_rate_pct >= 70 ? "secondary" : "destructive"}
                  >
                    {staff.signing_rate_pct}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gap: "24px" }}>
        <Card 
          style={{ 
            background: "#FFFFFF", 
            border: "1px solid #D7D9D9", 
            borderRadius: "12px", 
            padding: "20px", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
          }}
        >
          <CardHeader className="p-0 mb-4">
            <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Weekly Unsigned Reports Trend
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
              Unsigned Executive Medical reports by week
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={weeklyTrendData.map(item => ({
                  ...item,
                  week_start: new Date(item.week_start).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                }))}
                margin={{
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
                <XAxis
                  dataKey="week_start"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: "#586D6A" }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#586D6A" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D7D9D9',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [`${value} reports`, 'Unsigned Reports']}
                  labelFormatter={(label) => `Week of ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="unsigned_reports" 
                  stroke="#D65241" 
                  strokeWidth={3}
                                      dot={{ fill: "#D65241", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Weekly trend of unsigned reports <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        <Card 
          style={{ 
            background: "#FFFFFF", 
            border: "1px solid #D7D9D9", 
            borderRadius: "12px", 
            padding: "20px", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
          }}
        >
          <CardHeader className="p-0 mb-4">
            <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Top Staff with Unsigned Reports
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
              Staff members with most unsigned Executive Medical reports
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topUnsignedData}
                margin={{
                  top: 20,
                  bottom: 60,
                  left: 20,
                  right: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
                <XAxis
                  dataKey="staff_name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: "#586D6A" }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#586D6A" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D7D9D9',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [`${value} reports`, 'Unsigned Reports']}
                  labelFormatter={(label) => `Staff: ${label}`}
                />
                <Bar 
                  dataKey="unsigned_reports" 
                  fill="#D65241" 
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList
                    position="top"
                    offset={8}
                    style={{ fill: "#374151", fontSize: "12px" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Staff requiring attention <AlertTriangle className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}