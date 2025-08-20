import { ReportStatusData } from '@/types';

interface ReportStatusChartProps {
  data: ReportStatusData[];
}

export default function ReportStatusChart({ data }: ReportStatusChartProps) {
  const totalReports = data.reduce((sum, item) => sum + item.total_reports, 0);
  const totalSigned = data.reduce((sum, item) => sum + item.signed_reports, 0);
  const totalPending = data.reduce(
    (sum, item) => sum + item.pending_signature,
    0
  );

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border'>
      <h3 className='text-lg font-semibold mb-4'>Report Status Overview</h3>

      {/* Summary Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='text-center p-4 bg-blue-50 rounded-lg'>
          <div className='text-2xl font-bold text-blue-600'>{totalReports}</div>
          <div className='text-sm text-blue-600'>Total Reports</div>
        </div>
        <div className='text-center p-4 bg-green-50 rounded-lg'>
          <div className='text-2xl font-bold text-green-600'>{totalSigned}</div>
          <div className='text-sm text-green-600'>Signed</div>
        </div>
        <div className='text-center p-4 bg-yellow-50 rounded-lg'>
          <div className='text-2xl font-bold text-yellow-600'>
            {totalPending}
          </div>
          <div className='text-sm text-yellow-600'>Pending</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className='space-y-4'>
        {data.map((item, index) => (
          <div key={index} className='border rounded-lg p-4'>
            <div className='flex justify-between items-center mb-2'>
              <h4 className='font-medium'>{item.report_type}</h4>
              <span className='text-sm font-semibold text-green-600'>
                {item.completion_percentage.toFixed(1)}%
              </span>
            </div>

            <div className='w-full bg-gray-200 rounded-full h-3 mb-2'>
              <div
                className='bg-green-500 h-3 rounded-full transition-all duration-300'
                style={{ width: `${item.completion_percentage}%` }}
              ></div>
            </div>

            <div className='flex justify-between text-sm text-gray-600'>
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
