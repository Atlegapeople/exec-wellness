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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Stethoscope,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Target,
  Award
} from 'lucide-react';
import { PALETTE, CHART_SERIES_COLORS } from '@/lib/chartColors';

interface DoctorProductivity {
  doctor: string;
  total_reports: number;
  signed_reports: number;
  pending_reports: number;
  avg_turnaround_days: number;
  completion_rate: number;
  fit_outcomes: number;
  unfit_outcomes: number;
}

interface DoctorProductivityChartProps {
  data: DoctorProductivity[];
}


export default function DoctorProductivityChart({ data }: DoctorProductivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No doctor productivity data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Productivity</CardTitle>
          <CardDescription>Performance metrics for medical staff</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctor" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_reports" fill={PALETTE.primary.base} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}