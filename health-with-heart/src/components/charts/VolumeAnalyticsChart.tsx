'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  // Monthly Volume Chart
  const volumeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Appointment Volume & Completion Rates',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Number of Appointments'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Completion Rate (%)'
        },
        max: 100,
      },
    },
  };

  const volumeData = {
    labels: data.volume.map(v => new Date(v.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Total Appointments',
        data: data.volume.map(v => v.total_appointments),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Completed Reports',
        data: data.volume.map(v => v.completed_reports),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Completion Rate (%)',
        data: data.volume.map(v => v.completion_rate),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  // Daily Pattern Chart
  const dailyOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Daily Appointment Patterns (Current Month)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hour of Day'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Appointments'
        }
      },
    },
  };

  const dailyData = {
    labels: data.dailyPattern.map(d => `${d.hour}:00`),
    datasets: [
      {
        label: 'Appointments',
        data: data.dailyPattern.map(d => d.appointment_count),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Weekly Pattern Chart
  const weeklyOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Weekly Appointment Distribution',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Appointments'
        }
      },
    },
  };

  const weeklyData = {
    labels: data.weeklyPattern.map(w => w.day_name),
    datasets: [
      {
        label: 'Appointments',
        data: data.weeklyPattern.map(w => w.appointment_count),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Monthly Volume */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <Line data={volumeData} options={volumeOptions} />
      </div>

      {/* Daily and Weekly Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Pattern */}
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <Bar data={dailyData} options={dailyOptions} />
        </div>

        {/* Weekly Pattern */}
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <Bar data={weeklyData} options={weeklyOptions} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.volume.length > 0 && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <h3 className="font-semibold text-gray-800">This Month</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {data.volume[0]?.total_appointments || 0}
              </p>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <div className="mt-2 text-xs text-gray-500">
                {data.volume[0]?.completed_reports || 0} completed reports
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-semibold text-gray-800">Avg Turnaround</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {data.volume[0]?.avg_turnaround_days || 0}
              </p>
              <p className="text-sm text-gray-600">Days</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (data.volume[0]?.avg_turnaround_days || 0) <= 2 ? 'bg-green-100 text-green-800' :
                  (data.volume[0]?.avg_turnaround_days || 0) <= 5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {(data.volume[0]?.avg_turnaround_days || 0) <= 2 ? 'Excellent' :
                   (data.volume[0]?.avg_turnaround_days || 0) <= 5 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-semibold text-gray-800">Completion Rate</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {data.volume[0]?.completion_rate || 0}%
              </p>
              <p className="text-sm text-gray-600">Reports Completed</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (data.volume[0]?.completion_rate || 0) >= 90 ? 'bg-green-100 text-green-800' :
                  (data.volume[0]?.completion_rate || 0) >= 75 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {(data.volume[0]?.completion_rate || 0) >= 90 ? 'Excellent' :
                   (data.volume[0]?.completion_rate || 0) >= 75 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Peak Hours Analysis */}
      {data.dailyPattern.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">⏰ Peak Hours Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const peakHour = data.dailyPattern.reduce((prev, current) => 
                prev.appointment_count > current.appointment_count ? prev : current
              );
              const quietHour = data.dailyPattern.reduce((prev, current) => 
                prev.appointment_count < current.appointment_count ? prev : current
              );
              
              return (
                <>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{peakHour.hour}:00</div>
                    <div className="text-sm text-red-700">Peak Hour</div>
                    <div className="text-xs text-red-600">{peakHour.appointment_count} appointments</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{quietHour.hour}:00</div>
                    <div className="text-sm text-green-700">Quietest Hour</div>
                    <div className="text-xs text-green-600">{quietHour.appointment_count} appointments</div>
                  </div>
                </>
              );
            })()}
            
            {data.weeklyPattern.length > 0 && (() => {
              const busiestDay = data.weeklyPattern.reduce((prev, current) => 
                prev.appointment_count > current.appointment_count ? prev : current
              );
              const quietestDay = data.weeklyPattern.reduce((prev, current) => 
                prev.appointment_count < current.appointment_count ? prev : current
              );
              
              return (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{busiestDay.day_name}</div>
                    <div className="text-sm text-blue-700">Busiest Day</div>
                    <div className="text-xs text-blue-600">{busiestDay.appointment_count} appointments</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{quietestDay.day_name}</div>
                    <div className="text-sm text-yellow-700">Quietest Day</div>
                    <div className="text-xs text-yellow-600">{quietestDay.appointment_count} appointments</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}