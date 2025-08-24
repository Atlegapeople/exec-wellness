import { Appointment, Employee, MedicalReport } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, User, Users, StickyNote } from 'lucide-react';

interface RecentAppointmentsProps {
  appointments: Appointment[];
  employees?: Employee[];
  reports?: MedicalReport[];
}

export default function RecentAppointments({ appointments, employees = [], reports = [] }: RecentAppointmentsProps) {
  const getEmployeeName = (appointment: any) => {
    return appointment.employee_name || 'Unknown Employee';
  };

  const getReportStatus = (reportId?: string) => {
    if (!reportId || !reports) return { status: 'No Report', variant: 'secondary' as const };
    
    const report = reports.find(r => r.id === reportId);
    if (!report) return { status: 'No Report', variant: 'secondary' as const };
    
    if (report.doctor_signoff) {
      return { status: 'Signed', variant: 'default' as const };
    } else if (report.doctor) {
      return { status: 'Pending Signature', variant: 'outline' as const };
    } else {
      return { status: 'In Progress', variant: 'secondary' as const };
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No recent appointments</p>
        <p className="text-sm">Appointments will appear here when scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.slice(0, 6).map((appointment) => {
        const reportStatus = getReportStatus(appointment.report_id);
        
        return (
          <div key={appointment.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors hover-lift">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm truncate">{getEmployeeName(appointment)}</h4>
                <Badge variant={reportStatus.variant} className="text-xs">
                  {reportStatus.status}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{appointment.type}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(appointment.start_datetime)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(appointment.start_datetime)} - {formatTime(appointment.end_datetime)}
                </span>
              </div>
              
              {appointment.notes && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <StickyNote className="h-3 w-3" />
                  <span className="truncate">{appointment.notes}</span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {appointment.report_id ? (
                <Button variant="outline" size="sm" asChild>
                  <a href="/reports">
                    <FileText className="h-4 w-4 mr-1" />
                    View Report
                  </a>
                </Button>
              ) : (
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Create Report
                </Button>
              )}
            </div>
          </div>
        );
      })}
      
      {appointments.length > 6 && (
        <div className="text-center pt-4 border-t">
          <Button variant="outline" asChild>
            <a href="/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              View All Appointments ({appointments.length})
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}