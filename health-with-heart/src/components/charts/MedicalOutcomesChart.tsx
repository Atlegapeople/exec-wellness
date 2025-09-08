'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { CHART_SERIES_COLORS } from '@/lib/chartColors';

interface MedicalOutcome {
  outcomes: any[];
  trends: {
    month: string;
    total_reports: number;
    fit_count: number;
    unfit_count: number;
    fit_percentage: number;
  }[];
  ageGroups: {
    age_group: string;
    total_reports: number;
    fit_count: number;
    fit_percentage: number;
  }[];
}

interface MedicalOutcomesChartProps {
  data: MedicalOutcome;
}

export default function MedicalOutcomesChart({ data }: MedicalOutcomesChartProps) {
  console.log('MedicalOutcomesChart received data:', data);
  
  if (!data || !data.trends || !Array.isArray(data.trends)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load medical outcomes data</p>
          <p className="text-sm text-muted-foreground mt-2">Data structure is invalid</p>
        </div>
      </div>
    );
  }

  if (data.trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No medical outcomes data available</p>
          <p className="text-sm text-muted-foreground mt-2">No data found for the selected period</p>
        </div>
      </div>
    );
  }
  // Format trends data for Recharts
  const trendsData = data.trends.map(t => ({
    month: new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    fit_percentage: t.fit_percentage,
    total_reports: t.total_reports,
    fit_count: t.fit_count,
    unfit_count: t.unfit_count
  }));

  return (
    <div className="space-y-6" style={{ gap: "24px" }}>
      {/* Trends Chart */}
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
            Medical Report Volume Trends
          </CardTitle>
          <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
            Monthly comprehensive medical rates and total report volumes over last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#586D6A" }}
              />
              <YAxis 
                yAxisId="left"
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#586D6A" }}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#586D6A" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D7D9D9',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  name === 'fit_percentage' ? `${value}%` : value,
                  name === 'fit_percentage' ? 'Comprehensive Medical Rate' : 'Total Reports'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="fit_percentage" 
                stroke="#178089" 
                strokeWidth={3}
                dot={{ fill: "#178089", strokeWidth: 2, r: 4 }}
                name="fit_percentage"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="total_reports" 
                stroke="#B6D9CE" 
                strokeWidth={3}
                dot={{ fill: "#B6D9CE", strokeWidth: 2, r: 4 }}
                name="total_reports"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="p-0 mt-4">
          <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
            Medical trends over time <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Age Groups and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gap: "24px" }}>
        {/* Age Groups Chart */}
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
              Employee Fitness Rates by Age Group
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
              Percentage of employees medically fit for work across different age groups
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.ageGroups}
                  dataKey="fit_percentage"
                  nameKey="age_group"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, `Fitness Rate - ${name}`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Workforce health by age demographics <Users className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Key Insights */}
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
              Key Medical Insights
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
              Current fitness metrics and demographic analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.trends.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {data.trends[0]?.fit_percentage || 0}%
                    </p>
                    <p className="text-sm text-gray-600">Current Fitness Rate</p>
                    <p className="text-xs text-gray-500">
                      {data.trends[0]?.fit_count || 0} of {data.trends[0]?.total_reports || 0} reports
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {data.trends[0]?.total_reports || 0}
                    </p>
                    <p className="text-sm text-gray-600">Monthly Volume</p>
                    <p className="text-xs text-gray-500">Medical assessments</p>
                  </div>

                  {data.ageGroups.length > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      {(() => {
                        const lowestFitRate = data.ageGroups.reduce((prev, current) => 
                          prev.fit_percentage < current.fit_percentage ? prev : current
                        );
                        return (
                          <>
                            <p className="text-2xl font-bold text-purple-600">
                              {lowestFitRate.age_group}
                            </p>
                            <p className="text-sm text-gray-600">Highest Risk Group</p>
                            <p className="text-xs text-gray-500">
                              {lowestFitRate.fit_percentage}% fitness rate
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Age Group Details */}
                {data.ageGroups.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 text-gray-700">Age Group Breakdown</h4>
                    <div className="space-y-2">
                      {data.ageGroups.map((group, index) => (
                        <div key={`age-group-${index}-${group.age_group}`} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] }}
                            />
                            <span className="font-medium text-gray-700">{group.age_group}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{group.fit_percentage}%</div>
                            <div className="text-xs text-gray-500">{group.total_reports} reports</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Medical insights and analytics <BarChart3 className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}