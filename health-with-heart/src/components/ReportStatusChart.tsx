import { ReportStatusData } from '@/types';

interface ReportStatusChartProps {
  data: ReportStatusData[];
}

export default function ReportStatusChart({ data }: ReportStatusChartProps) {
  const totalReports = data.reduce((sum, item) => sum + item.total_reports, 0);
  const totalSigned = data.reduce((sum, item) => sum + item.signed_reports, 0);
  const totalPending = data.reduce((sum, item) => sum + item.pending_signature, 0);

  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Report Status Overview</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--teal-100)'}}>
          <div className="text-2xl font-bold" style={{color: 'var(--teal-700)'}}>{totalReports}</div>
          <div className="text-sm" style={{color: 'var(--teal-600)'}}>Total Reports</div>
        </div>
        <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--teal-200)'}}>
          <div className="text-2xl font-bold" style={{color: 'var(--teal-800)'}}>{totalSigned}</div>
          <div className="text-sm" style={{color: 'var(--teal-700)'}}>Signed</div>
        </div>
        <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--teal-50)'}}>
          <div className="text-2xl font-bold" style={{color: 'var(--teal-600)'}}>{totalPending}</div>
          <div className="text-sm" style={{color: 'var(--teal-500)'}}>Pending</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={`report-status-${item.report_type}-${index}`} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{item.report_type}</h4>
              <span className="text-sm font-semibold" style={{color: 'var(--teal-600)'}}>
                {item.completion_percentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="h-3 rounded-full transition-all duration-300"
                style={{backgroundColor: 'var(--teal-600)', width: `${item.completion_percentage}%`}}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{item.signed_reports} signed</span>
              <span>{item.pending_signature} pending</span>
              <span>{item.total_reports} total</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}