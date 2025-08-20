'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

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
    console.error('Invalid data structure for MedicalOutcomesChart:', data);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Chart Error</h3>
        <p className="text-red-700">Unable to load medical outcomes data. Data structure is invalid.</p>
      </div>
    );
  }

  if (data.trends.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold">No Data Available</h3>
        <p className="text-yellow-700">No medical outcomes data found for the selected period.</p>
      </div>
    );
  }
  // Trends Line Chart
  const trendsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Medical Report Volume Trends - Last 12 Months',
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
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Comprehensive Medical Rate (%)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Reports'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const trendsData = {
    labels: data.trends.map(t => new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: 'Comprehensive Medical Rate (%)',
        data: data.trends.map(t => t.fit_percentage),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Total Reports',
        data: data.trends.map(t => t.total_reports),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  // Age Groups Doughnut Chart
  const ageGroupsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Medical Report Distribution by Age Group',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const ageGroup = data.ageGroups[context.dataIndex];
            return [
              `${ageGroup.age_group}: ${ageGroup.fit_percentage}%`,
              `Total Reports: ${ageGroup.total_reports}`,
              `Fit: ${ageGroup.fit_count}`
            ];
          }
        }
      }
    },
  };

  const ageGroupsData = {
    labels: data.ageGroups.map(ag => ag.age_group),
    datasets: [
      {
        data: data.ageGroups.map(ag => ag.fit_percentage),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <Line data={trendsData} options={trendsOptions} />
      </div>

      {/* Age Groups and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Groups Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <Doughnut data={ageGroupsData} options={ageGroupsOptions} />
        </div>

        {/* Key Insights */}
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h3 className="text-lg font-semibold mb-4">📊 Key Medical Insights</h3>
          
          {data.trends.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <h4 className="font-semibold text-green-800">Current Fitness Rate</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {data.trends[0]?.fit_percentage || 0}%
                </p>
                <p className="text-sm text-green-700">
                  {data.trends[0]?.fit_count || 0} out of {data.trends[0]?.total_reports || 0} employees
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 text-xl">📈</span>
                  <h4 className="font-semibold text-blue-800">Monthly Volume</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {data.trends[0]?.total_reports || 0}
                </p>
                <p className="text-sm text-blue-700">
                  Medical assessments this month
                </p>
              </div>

              {data.ageGroups.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-600 text-xl">👥</span>
                    <h4 className="font-semibold text-purple-800">Highest Risk Group</h4>
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
                        <p className="text-sm text-purple-700">
                          {lowestFitRate.fit_percentage}% fitness rate
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Age Group Details */}
          {data.ageGroups.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Age Group Breakdown</h4>
              <div className="space-y-2">
                {data.ageGroups.map((group, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{group.age_group}</span>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{group.fit_percentage}%</div>
                      <div className="text-xs text-gray-600">{group.total_reports} reports</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}