import { ValidationError } from '@/types';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ValidationErrorsTableProps {
  errors: ValidationError[];
}

export default function ValidationErrorsTable({ errors }: ValidationErrorsTableProps) {
  return (
    <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#F2EFED' }}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5" style={{color: 'var(--teal-700)'}} />
        <h3 className="text-lg font-semibold">Validation Errors</h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{backgroundColor: 'var(--teal-700)'}}>
          {errors.length}
        </span>
      </div>
      
      {errors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-2" style={{color: 'var(--teal-600)'}} />
          <p>No validation errors found!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-off-white">
                <th className="text-left p-3 font-medium">Employee</th>
                <th className="text-left p-3 font-medium">Report Type</th>
                <th className="text-left p-3 font-medium">Issues</th>
                <th className="text-left p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((error, index) => (
                <tr key={`validation-error-${error.report_id}-${index}`} className="border-b hover:bg-off-white">
                  <td className="p-3 font-medium">{error.employee_name}</td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{backgroundColor: 'var(--teal-100)', color: 'var(--teal-800)'}}>
                      {error.type}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {error.errors.map((err, errIndex) => (
                        <span 
                          key={`error-${error.report_id}-${errIndex}`}
                          className="text-xs px-2 py-1 rounded" style={{backgroundColor: 'var(--teal-200)', color: 'var(--teal-800)'}}
                        >
                          {err}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <button className="text-white text-xs px-3 py-1 rounded transition-all duration-200" style={{backgroundColor: 'var(--teal-600)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--teal-700)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--teal-600)'}>
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