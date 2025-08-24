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
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { BarChart3, Zap, Target, Clock, CheckCircle2 } from 'lucide-react';
import { CHART_SERIES_COLORS } from '@/lib/chartColors';
import DashboardStats from '@/components/DashboardStats';

interface VolumeData {
  volume: {
    month: string;
    total_appointments: number;
    completed_reports: number;
    signed_reports: number;
    completion_rate: number;
    avg_turnaround_days: number;
  }[];
  dailyPattern: {
    hour: number;
    appointment_count: number;
  }[];
  weeklyPattern: {
    day_of_week: number;
    day_name: string;
    appointment_count: number;
  }[];
}

interface VolumeAnalyticsChartProps {
  data: VolumeData;
}

export default function VolumeAnalyticsChart({ data }: VolumeAnalyticsChartProps) {
  // Format data for Recharts
  const volumeData = data.volume.map(v => ({
    month: new Date(v.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    total_appointments: v.total_appointments,
    completed_reports: v.completed_reports,
    signed_reports: v.signed_reports,
    completion_rate: v.completion_rate,
    avg_turnaround_days: v.avg_turnaround_days
  }));

  const dailyData = data.dailyPattern.map(d => ({
    hour: `${d.hour}:00`,
    appointment_count: d.appointment_count
  }));

  const weeklyData = data.weeklyPattern.map(w => ({
    day_name: w.day_name,
    appointment_count: w.appointment_count
  }));

  return (
    <div className="space-y-6" style={{ gap: "24px" }}>
      {/* Monthly Volume */}
      <Card 
        style={{ 
          background: "#FFFFFF", 
          border: "1px solid #E5E7EB", 
          borderRadius: "12px", 
          padding: "20px", 
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
        }}
      >
        <CardHeader className="p-0 mb-4">
          <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
            Monthly Appointment Volume & Completion Rates
          </CardTitle>
          <CardDescription style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
            Monthly trends showing appointment volumes and completion rates over time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={volumeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis 
                yAxisId="left"
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: "#9CA3AF" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [
                  name === 'completion_rate' ? `${value}%` : value,
                  name === 'total_appointments' ? 'Total Appointments' :
                  name === 'completed_reports' ? 'Completed Reports' : 'Completion Rate'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar yAxisId="left" dataKey="total_appointments" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="completed_reports" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="completion_rate" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="p-0 mt-4">
          <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
            Monthly appointment trends and performance <BarChart3 className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Daily and Weekly Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gap: "24px" }}>
        {/* Daily Pattern */}
        <Card 
          style={{ 
            background: "#FFFFFF", 
            border: "1px solid #E5E7EB", 
            borderRadius: "12px", 
            padding: "20px", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
          }}
        >
          <CardHeader className="p-0 mb-4">
            <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Daily Appointment Patterns
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
              Appointment distribution by hour of day (current month)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="hour" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [`${value} appointments`, 'Count']}
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Bar dataKey="appointment_count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Hourly appointment patterns <Clock className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Weekly Pattern */}
        <Card 
          style={{ 
            background: "#FFFFFF", 
            border: "1px solid #E5E7EB", 
            borderRadius: "12px", 
            padding: "20px", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
          }}
        >
          <CardHeader className="p-0 mb-4">
            <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
              Weekly Appointment Distribution
            </CardTitle>
            <CardDescription style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
              Appointment volume across days of the week
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="day_name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [`${value} appointments`, 'Count']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar dataKey="appointment_count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="p-0 mt-4">
            <div className="flex gap-2 items-center" style={{ color: "#374151", fontSize: "12px" }}>
              Weekly appointment distribution <Target className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Summary Stats using DashboardStats component */}
      <DashboardStats data={data} />
    </div>
  );
}