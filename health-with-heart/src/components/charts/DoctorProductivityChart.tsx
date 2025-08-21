'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doctor Productivity - Last 3 Months',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const doctor = data[context.dataIndex];
            return [
              `Completion Rate: ${doctor.completion_rate}%`,
              `Avg Turnaround: ${doctor.avg_turnaround_days} days`,
              `Fit Outcomes: ${doctor.fit_outcomes}`,
              `Unfit Outcomes: ${doctor.unfit_outcomes}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Reports'
        }
      },
    },
  };

  const chartData = {
    labels: data.map(d => d.doctor),
    datasets: [
      {
        label: 'Signed Reports',
        data: data.map(d => d.signed_reports),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pending Reports',
        data: data.map(d => d.pending_reports),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <Bar data={chartData} options={options} />
      
      {/* Performance Summary Table */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4">Performance Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Doctor</th>
                <th className="text-center p-3 font-medium">Total Reports</th>
                <th className="text-center p-3 font-medium">Completion Rate</th>
                <th className="text-center p-3 font-medium">Avg Turnaround</th>
                <th className="text-center p-3 font-medium">Fit Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doctor, index) => {
                const fitRate = doctor.total_reports > 0 
                  ? Math.round((doctor.fit_outcomes / doctor.total_reports) * 100) 
                  : 0;
                
                return (
                  <tr key={`doctor-${doctor.doctor}-${index}`} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{doctor.doctor}</td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {doctor.total_reports}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        doctor.completion_rate >= 90 ? 'bg-green-100 text-green-800' :
                        doctor.completion_rate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doctor.completion_rate}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        doctor.avg_turnaround_days <= 2 ? 'bg-green-100 text-green-800' :
                        doctor.avg_turnaround_days <= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doctor.avg_turnaround_days} days
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        fitRate >= 80 ? 'bg-green-100 text-green-800' :
                        fitRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {fitRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}