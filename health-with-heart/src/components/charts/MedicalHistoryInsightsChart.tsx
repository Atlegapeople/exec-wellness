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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Heart,
  FileText,
  TrendingUp,
  Activity,
  Pill,
  AlertTriangle,
  Users,
  Calendar
} from 'lucide-react';
import { PALETTE, CHART_SERIES_COLORS, getBadgeClass } from '@/lib/chartColors';

const MedicalHistoryInsightsChart = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Medical History Analytics</h2>
        <p className="text-muted-foreground">Comprehensive medical condition insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{data.totalReports.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{data.totalPatients.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Medical Conditions</p>
                <p className="text-2xl font-bold">{data.conditionBreakdown.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">On Medication</p>
                <p className="text-2xl font-bold">{data.medicationAnalysis.medicationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Medical Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: '#424242' }} />
              Top Medical Conditions
            </CardTitle>
            <CardDescription>
              Most prevalent conditions among patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={data.topConditions.slice(0, 8)}
                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="condition" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={11}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'affectedPatients' ? `${value} patients` : `${value}%`,
                    name === 'affectedPatients' ? 'Affected Patients' : 'Prevalence Rate'
                  ]}
                />
                <Bar dataKey="affectedPatients" fill={PALETTE.secondary.alert} name="Affected Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Report Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#424242' }} />
              Report Type Distribution
            </CardTitle>
            <CardDescription>
              Medical report types across the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.reportTypeBreakdown}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {data.reportTypeBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} records (${data.reportTypeBreakdown.find((item: any) => item.type === name)?.percentage}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" style={{ color: '#424242' }} />
              Current Medication Status
            </CardTitle>
            <CardDescription>
              Percentage of patients currently on prescribed medication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'On Medication', value: data.medicationAnalysis.onMedication },
                    { name: 'Not on Medication', value: data.medicationAnalysis.notOnMedication }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  <Cell fill={PALETTE.secondary.warning} />
                  <Cell fill={PALETTE.primary.base} />
                </Pie>
                <Tooltip formatter={(value, name) => [
                  `${value} patients (${Math.round(((value as number) / (data.medicationAnalysis.onMedication + data.medicationAnalysis.notOnMedication)) * 100)}%)`, 
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medical Reports Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#424242' }} />
              Medical Reports Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reportCount" 
                  stroke={PALETTE.teal} 
                  name="Medical Reports" 
                />
                <Line 
                  type="monotone" 
                  dataKey="patientCount" 
                  stroke={PALETTE.duckEgg} 
                  name="Unique Patients" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Conditions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" style={{ color: '#424242' }} />
            Detailed Medical Conditions Analysis
          </CardTitle>
          <CardDescription>
            Complete breakdown of all medical conditions with prevalence rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-2">
              {data.conditionBreakdown
                .filter((condition: any) => condition.yesCount > 0)
                .slice(0, 20)
                .map((condition: any, index: number) => (
                <div key={`condition-${index}-${condition.condition}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {condition.condition ? 
                        condition.condition.toLowerCase().split(' ').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') 
                        : 'Unknown'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {condition.yesCount} of {condition.totalResponses} patients
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={getBadgeClass(condition.prevalenceRate, { good: 5, warning: 15 })}
                    >
                      {condition.prevalenceRate}%
                    </Badge>
                    <div 
                      className="w-16 h-2 bg-muted rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(condition.prevalenceRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalHistoryInsightsChart;