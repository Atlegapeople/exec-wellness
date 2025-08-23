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
  Activity,
  TrendingUp,
  Cigarette,
  Wine,
  Dumbbell,
  Apple,
  Moon,
  Pill,
  Users,
  FileText
} from 'lucide-react';
import { PALETTE, CHART_SERIES_COLORS, getBadgeClass } from '@/lib/chartColors'

const LifestyleInsightsChart = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Lifestyle Analytics</h2>
        <p className="text-muted-foreground">Comprehensive lifestyle behavior insights and health patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#00897B' }} />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{data.totalRecords.toLocaleString()}</p>
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
              <Cigarette className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Smoking Rate</p>
                <p className="text-2xl font-bold text-red-600">{data.smokingAnalysis.smokingRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Drug Usage</p>
                <p className="text-2xl font-bold text-red-600">{data.drugsAnalysis.drugUsageRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smoking Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cigarette className="h-5 w-5" style={{ color: '#424242' }} />
              Smoking Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Smokers', value: data.smokingAnalysis.smokers },
                    { name: 'Non-Smokers', value: data.smokingAnalysis.nonSmokers }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                >
                  <Cell fill={PALETTE.secondary.alert} />
                  <Cell fill={PALETTE.primary.base} />
                </Pie>
                <Tooltip formatter={(value, name) => [
                  `${value} patients (${Math.round((value as number / (data.smokingAnalysis.smokers + data.smokingAnalysis.nonSmokers)) * 100)}%)`, 
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alcohol Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" style={{ color: '#424242' }} />
              Alcohol Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={data.alcoholAnalysis.riskBreakdown.slice(0, 6)}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="risk" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={11}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} patients (${data.alcoholAnalysis.riskBreakdown.find((item: any) => item.risk === name)?.percentage}%)`,
                  'Risk Level'
                ]} />
                <Bar dataKey="count" fill={PALETTE.secondary.warning} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Exercise Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" style={{ color: '#424242' }} />
              Exercise Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={data.exerciseAnalysis.breakdown.slice(0, 8)}
                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="frequency" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={10}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} patients (${data.exerciseAnalysis.breakdown.find((item: any) => item.frequency === name)?.percentage}%)`,
                  'Exercise Frequency'
                ]} />
                <Bar dataKey="count" fill={PALETTE.primary.base} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diet Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" style={{ color: '#424242' }} />
              Diet Quality Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.dietAnalysis.overallBreakdown}
                  dataKey="count"
                  nameKey="rating"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                >
                  {data.dietAnalysis.overallBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [
                  `${value} patients (${data.dietAnalysis.overallBreakdown.find((item: any) => item.rating === name)?.percentage}%)`, 
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" style={{ color: '#424242' }} />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={data.sleepAnalysis.qualityBreakdown.slice(0, 6)}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="quality" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={11}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} patients (${data.sleepAnalysis.qualityBreakdown.find((item: any) => item.quality === name)?.percentage}%)`,
                  'Sleep Quality'
                ]} />
                <Bar dataKey="count" fill={PALETTE.supporting.blue} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lifestyle Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" style={{ color: '#424242' }} />
              Lifestyle Assessment Timeline
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
                  dataKey="recordCount" 
                  stroke={PALETTE.primary.base} 
                  name="Assessments" 
                />
                <Line 
                  type="monotone" 
                  dataKey="patientCount" 
                  stroke={PALETTE.supporting.blue} 
                  name="Unique Patients" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alcohol Frequency Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" style={{ color: '#424242' }} />
              Alcohol Consumption Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alcoholAnalysis.breakdown
                .filter((item: any) => item.frequency !== 'Unknown')
                .slice(0, 6)
                .map((item: any, index: number) => (
                <div key={item.frequency} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.frequency ? 
                        item.frequency.toLowerCase().split(' ').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') 
                        : 'Unknown'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} patients
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={getBadgeClass(item.percentage, { good: 10, warning: 25 })}
                    >
                      {item.percentage}%
                    </Badge>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: '#424242' }} />
              Exercise Duration Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.exerciseAnalysis.durationBreakdown
                .filter((item: any) => item.duration !== 'Unknown')
                .slice(0, 6)
                .map((item: any, index: number) => (
                <div key={item.duration} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.duration ? 
                        item.duration.toLowerCase().split(' ').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ') 
                        : 'Unknown'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} patients
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={getBadgeClass(item.percentage, { good: 30, warning: 15 })}
                    >
                      {item.percentage}%
                    </Badge>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sleep Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" style={{ color: '#424242' }} />
              Sleep Duration Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sleepAnalysis.hoursBreakdown
                .filter((item: any) => item.hours !== 'Unknown')
                .slice(0, 6)
                .map((item: any, index: number) => (
                <div key={item.hours} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.hours} Hours</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} patients
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={getBadgeClass(item.percentage, { good: 25, warning: 15 })}
                    >
                      {item.percentage}%
                    </Badge>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifestyleInsightsChart;