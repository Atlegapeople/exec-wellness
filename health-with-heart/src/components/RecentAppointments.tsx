import { Appointment, Employee, MedicalReport } from '@/types';

interface RecentAppointmentsProps {
  appointments: Appointment[];
  employees: Employee[];
  reports: MedicalReport[];
}

export default function RecentAppointments({ appointments, employees, reports }: RecentAppointmentsProps) {
  const getEmployeeName = (appointment: any) => {
    return appointment.employee_name || 'Unknown Employee';
  };

  const getReportStatus = (reportId?: string) => {
    if (!reportId) return { status: 'No Report', color: 'gray' };
    
    const report = reports.find(r => r.id === reportId);
    if (!report) return { status: 'No Report', color: 'gray' };
    
    if (report.doctor_signoff) {
      return { status: 'Signed', color: 'green' };
    } else if (report.doctor) {
      return { status: 'Pending Signature', color: 'yellow' };
    } else {
      return { status: 'In Progress', color: 'blue' };
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const statusColors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-blue-500 text-xl">📋</div>
        <h3 className="text-lg font-semibold">Recent Appointments</h3>
      </div>
      
      <div className="space-y-3">
        {appointments.slice(0, 8).map((appointment) => {
          const reportStatus = getReportStatus(appointment.report_id);
          
          return (
            <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{getEmployeeName(appointment)}</h4>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColors[reportStatus.color as keyof typeof statusColors]}`}>
                      {reportStatus.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{appointment.type}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>⏰ {formatTime(appointment.start_datetime)} - {formatTime(appointment.end_datetime)}</span>
                    {appointment.notes && (
                      <span>📝 {appointment.notes}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {appointment.report_id ? (
                    <a 
                      href="/reports" 
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      View Report
                    </a>
                  ) : (
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded">
                      Create Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {appointments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>No recent appointments</p>
        </div>
      )}
    </div>
  );
}