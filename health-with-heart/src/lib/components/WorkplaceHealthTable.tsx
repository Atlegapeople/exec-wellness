import { WorkplaceHealth } from '@/types';
import { Building2 } from 'lucide-react';

interface WorkplaceHealthTableProps {
  data: WorkplaceHealth[];
}

export default function WorkplaceHealthTable({ data }: WorkplaceHealthTableProps) {
  const calculateFitnessRate = (fitCount: number, totalReports: number) => {
    if (totalReports === 0) return '0';
    return ((fitCount / totalReports) * 100).toFixed(1);
  };

  return (
    <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#F2EFED' }}>
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5" style={{color: 'var(--teal)'}} />
        <h3 className="text-lg font-semibold" style={{color: 'var(--forest)'}}>Workplace Health Summary</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{backgroundColor: 'var(--sand)'}}>
              <th className="text-left p-3 font-medium" style={{color: 'var(--forest)'}}>Department</th>
              <th className="text-center p-3 font-medium" style={{color: 'var(--forest)'}}>Employees</th>
              <th className="text-center p-3 font-medium" style={{color: 'var(--forest)'}}>Reports</th>
              <th className="text-center p-3 font-medium" style={{color: 'var(--forest)'}}>Fit</th>
              <th className="text-center p-3 font-medium" style={{color: 'var(--forest)'}}>Not Fit</th>
              <th className="text-center p-3 font-medium" style={{color: 'var(--forest)'}}>Fitness Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((workplace, index) => {
              const fitnessRate = calculateFitnessRate(workplace.fit_for_work, workplace.medical_reports);
              
              return (
                <tr key={`workplace-${workplace.organisation_id}-${workplace.department}-${index}`} className="border-b hover:opacity-80">
                  <td className="p-3">
                    <div>
                      <div className="font-medium" style={{color: 'var(--forest)'}}>{workplace.department}</div>
                      <div className="text-xs" style={{color: 'var(--fern)'}}>{workplace.organisation_id}</div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold px-2.5 py-0.5 rounded-full" style={{backgroundColor: 'var(--duck-egg)', color: 'var(--teal)'}}>
                      {workplace.total_employees}
                    </span>
                  </td>
                  <td className="p-3 text-center font-medium" style={{color: 'var(--forest)'}}>
                    {workplace.medical_reports}
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold px-2.5 py-0.5 rounded-full" style={{backgroundColor: 'var(--sage)', color: 'var(--forest)'}}>
                      {workplace.fit_for_work}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span 
                      className="font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: workplace.not_fit > 0 ? 'var(--lily)' : 'var(--sand)',
                        color: workplace.not_fit > 0 ? 'var(--sunset)' : 'var(--fern)'
                      }}
                    >
                      {workplace.not_fit}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <div 
                        className="font-semibold"
                        style={{
                          color: parseFloat(fitnessRate) >= 95 ? 'var(--sage)' :
                                 parseFloat(fitnessRate) >= 85 ? 'var(--daisy)' :
                                 'var(--sunset)'
                        }}
                      >
                        {fitnessRate}%
                      </div>
                      <div className="w-12 rounded-full h-1.5 mt-1" style={{backgroundColor: 'var(--light-grey)'}}>
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${fitnessRate}%`,
                            backgroundColor: parseFloat(fitnessRate) >= 95 ? 'var(--sage)' :
                                           parseFloat(fitnessRate) >= 85 ? 'var(--daisy)' :
                                           'var(--sunset)'
                          }}
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
        <div className="text-center py-8" style={{color: 'var(--fern)'}}>
          <div className="text-4xl mb-2">🏢</div>
          <p>No workplace data available</p>
        </div>
      )}
    </div>
  );
}