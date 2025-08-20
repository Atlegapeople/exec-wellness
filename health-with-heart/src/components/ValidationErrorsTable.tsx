import { ValidationError } from '@/types';

interface ValidationErrorsTableProps {
  errors: ValidationError[];
}

export default function ValidationErrorsTable({
  errors,
}: ValidationErrorsTableProps) {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='text-red-500 text-xl'>🔴</div>
        <h3 className='text-lg font-semibold'>Validation Errors</h3>
        <span className='bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'>
          {errors.length}
        </span>
      </div>

      {errors.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <div className='text-4xl mb-2'>✅</div>
          <p>No validation errors found!</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-gray-50'>
                <th className='text-left p-3 font-medium'>Employee</th>
                <th className='text-left p-3 font-medium'>Report Type</th>
                <th className='text-left p-3 font-medium'>Issues</th>
                <th className='text-left p-3 font-medium'>Action</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((error, index) => (
                <tr key={index} className='border-b hover:bg-gray-50'>
                  <td className='p-3 font-medium'>{error.employee_name}</td>
                  <td className='p-3'>
                    <span className='bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'>
                      {error.type}
                    </span>
                  </td>
                  <td className='p-3'>
                    <div className='flex flex-wrap gap-1'>
                      {error.errors.map((err, errIndex) => (
                        <span
                          key={errIndex}
                          className='bg-red-100 text-red-800 text-xs px-2 py-1 rounded'
                        >
                          {err}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='p-3'>
                    <button className='bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors'>
                      Fix Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
