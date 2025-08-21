import { WorkplaceHealth } from '@/types';
import { Building2 } from 'lucide-react';

interface WorkplaceHealthTableProps {
  data: WorkplaceHealth[];
}

export default function WorkplaceHealthTable({ data }: WorkplaceHealthTableProps) {
  const calculateFitnessRate = (fitCount: number, totalReports: number) => {
    if (totalReports === 0) return 0;
    return ((fitCount / totalReports) * 100).toFixed(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5" style={{color: 'var(--teal-700)'}} />
        <h3 className="text-lg font-semibold">Workplace Health Summary</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium">Department</th>
              <th className="text-center p-3 font-medium">Employees</th>
              <th className="text-center p-3 font-medium">Reports</th>
              <th className="text-center p-3 font-medium">Fit</th>
              <th className="text-center p-3 font-medium">Not Fit</th>
              <th className="text-center p-3 font-medium">Fitness Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((workplace, index) => {
              const fitnessRate = calculateFitnessRate(workplace.fit_for_work, workplace.medical_reports);
              
              return (
                <tr key={`workplace-${workplace.organisation_id}-${workplace.department}-${index}`} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{workplace.department}</div>
                      <div className="text-xs text-gray-500">{workplace.organisation_id}</div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold px-2.5 py-0.5 rounded-full" style={{backgroundColor: 'var(--teal-100)', color: 'var(--teal-800)'}}>
                      {workplace.total_employees}
                    </span>
                  </td>
                  <td className="p-3 text-center font-medium">
                    {workplace.medical_reports}
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold px-2.5 py-0.5 rounded-full" style={{backgroundColor: 'var(--teal-200)', color: 'var(--teal-800)'}}>
                      {workplace.fit_for_work}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-semibold px-2.5 py-0.5 rounded-full ${
                      workplace.not_fit > 0 
                        ? 'text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`} style={{
                      backgroundColor: workplace.not_fit > 0 ? 'var(--teal-600)' : undefined
                    }}>
                      {workplace.not_fit}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <div className={`font-semibold ${
                        parseFloat(fitnessRate) >= 95 ? 'text-green-600' :
                        parseFloat(fitnessRate) >= 85 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {fitnessRate}%
                      </div>
                      <div className="w-12 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            parseFloat(fitnessRate) >= 95 ? 'bg-green-500' :
                            parseFloat(fitnessRate) >= 85 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${fitnessRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏢</div>
          <p>No workplace data available</p>
        </div>
      )}
    </div>
  );
}