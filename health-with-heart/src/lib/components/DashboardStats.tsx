'use client';

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Clock, CheckCircle2 } from "lucide-react"

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

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  status?: "good" | "warning" | "bad"
}

const MetricCard = ({ title, value, subtitle, icon, status }: MetricCardProps) => {
  const statusColors = {
    good: "text-green-600",
    warning: "text-yellow-600",
    bad: "text-red-600",
  }
  return (
    <Card className="flex-1 shadow-sm rounded-2xl">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm ${status ? statusColors[status] : "text-gray-400"}`}>
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface PeakCardProps {
  label: string
  value: string
  count: string
  color: string
}

const PeakCard = ({ label, value, count, color }: PeakCardProps) => (
  <Card className={`flex-1 shadow-sm rounded-2xl border-t-4 ${color}`}>
    <CardContent className="p-6 text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{count}</p>
    </CardContent>
  </Card>
)

interface DashboardStatsProps {
  data: VolumeData;
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  // Calculate metrics from data
  const currentVolume = data.volume[0];
  const turnaroundStatus = (currentVolume?.avg_turnaround_days || 0) <= 2 ? 'good' : 
                          (currentVolume?.avg_turnaround_days || 0) <= 5 ? 'warning' : 'bad';
  const completionStatus = (currentVolume?.completion_rate || 0) >= 90 ? 'good' :
                          (currentVolume?.completion_rate || 0) >= 75 ? 'warning' : 'bad';

  // Calculate peak hours
  const peakHour = data.dailyPattern.length > 0 ? 
    data.dailyPattern.reduce((prev, current) => 
      prev.appointment_count > current.appointment_count ? prev : current
    ) : null;
  
  const quietHour = data.dailyPattern.length > 0 ?
    data.dailyPattern.reduce((prev, current) => 
      prev.appointment_count < current.appointment_count ? prev : current
    ) : null;

  const busiestDay = data.weeklyPattern.length > 0 ?
    data.weeklyPattern.reduce((prev, current) => 
      prev.appointment_count > current.appointment_count ? prev : current
    ) : null;

  const quietestDay = data.weeklyPattern.length > 0 ?
    data.weeklyPattern.reduce((prev, current) => 
      prev.appointment_count < current.appointment_count ? prev : current
    ) : null;

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="This Month's Volume"
          value={currentVolume?.total_appointments || 0}
          subtitle={`${currentVolume?.completed_reports || 0} completed reports`}
          icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
        />
        <MetricCard
          title="Average Turnaround"
          value={`${currentVolume?.avg_turnaround_days || 0} Days`}
          subtitle={turnaroundStatus === 'good' ? 'Excellent' : turnaroundStatus === 'warning' ? 'Good' : 'Needs Improvement'}
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          status={turnaroundStatus}
        />
        <MetricCard
          title="Completion Rate"
          value={`${currentVolume?.completion_rate || 0}%`}
          subtitle="Reports Completed"
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
          status={completionStatus}
        />
      </div>

      {/* Peak Hours */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Peak Hours Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {peakHour && (
            <PeakCard 
              label="Peak Hour" 
              value={`${peakHour.hour}:00`} 
              count={`${peakHour.appointment_count} appointments`} 
              color="border-red-500" 
            />
          )}
          {quietHour && (
            <PeakCard 
              label="Quietest Hour" 
              value={`${quietHour.hour}:00`} 
              count={`${quietHour.appointment_count} appointments`} 
              color="border-green-500" 
            />
          )}
          {busiestDay && (
            <PeakCard 
              label="Busiest Day" 
              value={busiestDay.day_name} 
              count={`${busiestDay.appointment_count} appointments`} 
              color="border-blue-500" 
            />
          )}
          {quietestDay && (
            <PeakCard 
              label="Quietest Day" 
              value={quietestDay.day_name} 
              count={`${quietestDay.appointment_count} appointments`} 
              color="border-yellow-500" 
            />
          )}
        </div>
      </div>
    </div>
  )
}