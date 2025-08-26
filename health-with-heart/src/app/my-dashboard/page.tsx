'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import { useAPI } from '@/hooks/useAPI';
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Heart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  Stethoscope,
  Loader2,
  UserCheck,
  Download,
  X,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import Employee360View from '@/components/Employee360View';

interface MedicalReport {
  id: string;
  date_created: string;
  date_updated: string;
  employee_id: string;
  type: string;
  sub_type: string;
  doctor: string;
  doctor_signoff: string;
  doctor_signature: string;
  nurse: string;
  nurse_signature: string;
  report_work_status: string;
  notes_text: string;
  recommendation_text: string;
  employee_work_email: string;
  employee_personal_email: string;
  manager_email: string;
  doctor_email: string;
  workplace: string;
  line_manager: string;
  line_manager2: string;
  employee_name: string;
  employee_surname: string;
  doctor_name: string;
  doctor_surname: string;
  nurse_name: string;
  nurse_surname: string;
  workplace_name: string;
}

interface FormData {
  [key: string]: any;
}

interface DashboardData {
  doctor: {
    id: string;
    name: string;
    surname: string;
    email: string;
    type: string;
    mobile?: string;
  };
  stats: {
    totalReports: number;
    totalEmployees: number;
    signedReports: number;
    pendingReports: number;
    signoffRate: number;
  };
  team: Array<{
    id: string;
    name: string;
    surname: string;
    email: string;
  }>;
  sites: Array<{
    site_name: string;
    employee_count: number;
  }>;
  reportsOverTime: Array<{
    month: string;
    report_count: number;
  }>;
  repeatEmployees: Array<{
    employee_id: string;
    report_count: number;
  }>;
  topWorkplaces: Array<{
    workplace: string;
    employee_count: number;
  }>;
  recentReports: Array<{
    id: string;
    employee_name: string;
    employee_surname: string;
    date_created: string;
    doctor_signoff: string | null;
  }>;
  allReports: Array<{
    id: string;
    date_created: string;
    date_updated: string;
    employee_id: string;
    type: string;
    sub_type: string;
    doctor: string;
    doctor_signoff: string;
    doctor_signature: string;
    nurse: string;
    nurse_signature: string;
    report_work_status: string;
    notes_text: string;
    recommendation_text: string;
    employee_work_email: string;
    employee_personal_email: string;
    manager_email: string;
    doctor_email: string;
    workplace: string;
    line_manager: string;
    line_manager2: string;
    employee_name: string;
    employee_surname: string;
    doctor_name: string;
    doctor_surname: string;
    nurse_name: string;
    nurse_surname: string;
    workplace_name: string;
  }>;
}

export default function MyDashboard() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedNurseId, setSelectedNurseId] = useState<string>('');
  const [selectedStaffType, setSelectedStaffType] = useState<'Doctor' | 'Nurse'>('Doctor');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch users (doctors only)
  const { data: usersResponse, loading: usersLoading } = useAPI<{
    users: Array<{
      id: string;
      name: string;
      surname: string;
      email: string;
      type: string;
    }>;
    pagination: any;
  }>('/api/users?limit=10000');

  // Fetch dashboard data for selected staff member
  const { data: dashboardData, loading: dashboardLoading } = useAPI<DashboardData>(
    (selectedDoctorId && selectedStaffType === 'Doctor') ? `/api/dashboard/my-dashboard?doctorId=${selectedDoctorId}` :
    (selectedNurseId && selectedStaffType === 'Nurse') ? `/api/dashboard/my-dashboard?nurseId=${selectedNurseId}` :
    null,
    [selectedDoctorId, selectedNurseId, selectedStaffType]
  );

  const doctors = usersResponse?.users?.filter(user => user.type === 'Doctor') || [];
  const nurses = usersResponse?.users?.filter(user => user.type === 'Nurse') || [];

  // Auto-select first staff member if none selected
  useEffect(() => {
    if (selectedStaffType === 'Doctor' && doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    } else if (selectedStaffType === 'Nurse' && nurses.length > 0 && !selectedNurseId) {
      setSelectedNurseId(nurses[0].id);
    }
  }, [doctors, nurses, selectedDoctorId, selectedNurseId, selectedStaffType]);

  // Reset selection when staff type changes
  useEffect(() => {
    setSelectedDoctorId('');
    setSelectedNurseId('');
  }, [selectedStaffType]);

  // Helper functions
  const getEmployeeName = (report: MedicalReport) => {
    return report.employee_name && report.employee_surname 
      ? `${report.employee_name} ${report.employee_surname}` 
      : 'Unknown Employee';
  };

  const getDoctorName = (report: MedicalReport) => {
    if (!report.doctor_name && !report.doctor_surname) {
      return 'Unassigned';
    }
    return report.doctor_name && report.doctor_surname 
      ? `Dr. ${report.doctor_name} ${report.doctor_surname}` 
      : 'Unknown Doctor';
  };

  // Report click handler
  const handleReportClick = async (report: MedicalReport) => {
    setSelectedReport(report);
    setFormLoading(true);
    
    try {
      const response = await fetch(`/api/reports/form-data/${report.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        console.error('Failed to fetch form data');
        setFormData(null);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      setFormData(null);
    } finally {
      setFormLoading(false);
    }
  };

  // PDF generation handler
  const handleGeneratePDF = async () => {
    if (!selectedReport) return;
    
    try {
      const response = await fetch(`/api/reports/pdf/${selectedReport.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Executive_Medical_Report_${selectedReport.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const canGeneratePDF = () => {
    return selectedReport?.doctor_signoff === 'Yes';
  };

  // CRUD operations
  const handleEditReport = () => {
    if (!selectedReport) return;
    // Navigate to edit page or open edit modal
    window.open(`/reports/edit/${selectedReport.id}`, '_blank');
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the medical report for ${getEmployeeName(selectedReport)}? This action cannot be undone.`);
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Report deleted successfully');
        setSelectedReport(null);
        setFormData(null);
        // Refresh dashboard data
        window.location.reload();
      } else {
        alert('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    }
  };

  const handleCreateReport = () => {
    // Navigate to create new report page
    window.open('/reports/create', '_blank');
  };

  // Resizing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const container = document.querySelector('.resizable-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
    setLeftPanelWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (usersLoading) {
    return (
      <DashboardLayout>
        <div className="px-8 sm:px-12 lg:px-16 xl:px-24 py-8">
          <Card className="glass-effect">
            <CardContent className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <h3 className="text-lg font-semibold">Loading Dashboard</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up">
        {/* Header with Doctor Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
                  {dashboardData?.doctor ? 
                    `${dashboardData.doctor.name.charAt(0)}${dashboardData.doctor.surname.charAt(0)}` : 
                    'KC'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-bold">
                    {dashboardData?.doctor ? 
                      `${selectedStaffType === 'Doctor' ? 'Dr.' : ''} ${dashboardData.doctor.name} ${dashboardData.doctor.surname}` : 
                      `${selectedStaffType === 'Doctor' ? 'Dr.' : ''} Kim Comline`}
                  </h1>
                  <p className="text-muted-foreground">{currentDate}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{dashboardData?.doctor?.email || 'kim@healthwithheart.co.za'}</span>
                  </div>
                  {dashboardData?.doctor?.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{dashboardData.doctor.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">ID: {dashboardData?.doctor?.id || '66f7afae87ea74da'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedStaffType}</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Staff Selection */}
            <div className="flex items-center gap-4">
              {/* Staff Type Selection */}
              <div className="w-32">
                <Select value={selectedStaffType} onValueChange={(value: 'Doctor' | 'Nurse') => setSelectedStaffType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doctor">Doctors</SelectItem>
                    <SelectItem value="Nurse">Nurses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Staff Member Selection */}
              <div className="w-80">
                {selectedStaffType === 'Doctor' ? (
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} {doctor.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedNurseId} onValueChange={setSelectedNurseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nurse" />
                    </SelectTrigger>
                    <SelectContent>
                      {nurses.map((nurse) => (
                        <SelectItem key={nurse.id} value={nurse.id}>
                          {nurse.name} {nurse.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover-lift gradient-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.totalReports || 0}</div>
              <p className="text-xs text-muted-foreground">Executive Medical</p>
            </CardContent>
          </Card>

          <Card className="hover-lift gradient-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.totalEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">Unique employees</p>
            </CardContent>
          </Card>

          <Card className="hover-lift gradient-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signed Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.signedReports || 0}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="hover-lift gradient-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.pendingReports || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting signature</p>
            </CardContent>
          </Card>

          <Card className="hover-lift gradient-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signoff Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.signoffRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* All Reports Grid with Split Panel */}
        <div className={`resizable-container flex transition-all duration-300 animate-slide-up overflow-hidden ${selectedReport ? '' : 'justify-center'}`}>
          
          {/* Left Panel - Reports Grid */}
          <div 
            className="space-y-4" 
            style={{ 
              width: selectedReport ? `${leftPanelWidth}%` : '100%',
              maxWidth: selectedReport ? `${leftPanelWidth}%` : '100%',
              paddingRight: selectedReport ? '12px' : '0'
            }}
          >
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 heading-montserrat-bold text-2xl">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <FileText className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <span className="medical-heading">My Reports</span>
                        <span className="ml-2 text-lg font-medium text-gray-500">({dashboardData?.allReports?.length || 0})</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="mt-2 text-base text-gray-600">
                      Complete list of all executive medical reports you have created
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCreateReport}
                      variant="default"
                      size="sm"
                      className="hover-lift"
                      title="Create new medical report"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(!dashboardData?.allReports || dashboardData.allReports.length === 0) ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
                    <p className="text-muted-foreground">
                      No Executive Medical reports are available for this doctor.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-auto scrollbar-premium">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Report ID</TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Date Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Workplace</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.allReports.map((report) => (
                          <TableRow 
                            key={report.id} 
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedReport?.id === report.id ? 'bg-muted border-l-4 border-l-primary' : ''
                            }`}
                            onClick={() => handleReportClick(report)}
                          >
                            <TableCell>
                              <div className="font-mono text-xs text-muted-foreground" title={report.id}>
                                {report.id.slice(0, 8)}...
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {getEmployeeName(report)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {report.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(report.date_created).toLocaleDateString('en-ZA', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={report.doctor_signoff === 'Yes' ? 'default' : 'secondary'} className="flex items-center gap-1">
                                {report.doctor_signoff === 'Yes' ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {report.doctor_signoff === 'Yes' ? 'Signed' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm truncate" title={report.workplace_name || report.workplace || 'N/A'}>
                                {report.workplace_name || report.workplace || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm truncate" title={report.employee_work_email || 'N/A'}>
                                {report.employee_work_email || 'N/A'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resize Handle */}
          {selectedReport && (
            <div 
              className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors duration-200 flex-shrink-0 relative group"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -left-1 -right-1 hover:bg-primary/10 transition-colors duration-200"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border group-hover:bg-primary/50 rounded-full transition-colors duration-200"></div>
            </div>
          )}

          {/* Right Panel - Form Preview */}
          <div 
            className={`space-y-4 ${selectedReport ? 'animate-slide-up' : ''}`}
            style={{ 
              width: selectedReport ? `calc(${100 - leftPanelWidth}% - 20px)` : '0%',
              maxWidth: selectedReport ? `calc(${100 - leftPanelWidth}% - 20px)` : '0%',
              paddingLeft: selectedReport ? '12px' : '0',
              paddingRight: selectedReport ? '20px' : '0',
              overflow: selectedReport ? 'visible' : 'hidden',
              height: selectedReport ? 'fit-content' : '0'
            }}
          >
            {selectedReport && (
              <>


                 

                {/* Form Header Card */}
                <Card className="glass-effect">
                  <CardContent className="p-4 min-h-[120px] flex items-center">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-2xl flex items-center gap-3 heading-montserrat-bold">
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <FileText className="h-6 w-6 text-teal-600" />
                          </div>
                          <span className="medical-heading">{getEmployeeName(selectedReport)}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3 lg:ml-14">
                          <Badge variant="outline" className="font-mono text-xs font-medium">
                            ID: {selectedReport.id.slice(0, 12)}...
                          </Badge>
                          <Badge variant={selectedReport.doctor_signoff === 'Yes' ? 'default' : 'secondary'} className="font-medium">
                            {selectedReport.doctor_signoff === 'Yes' ? '✓ Signed' : '⏳ Pending'}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={handleEditReport}
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                          title="Edit this medical report"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={handleDeleteReport}
                          variant="outline"
                          size="sm"
                          className="hover-lift text-red-600 hover:text-red-700 hover:border-red-300"
                          title="Delete this medical report"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          onClick={handleGeneratePDF}
                          disabled={!canGeneratePDF()}
                          variant={canGeneratePDF() ? 'default' : 'secondary'}
                          size="sm"
                          className="hover-lift"
                          title={canGeneratePDF() ? 'Generate PDF' : 'PDF only available for signed reports'}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(null)}
                          className="hover-lift"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Content Card */}
                <Card className="hover-lift" style={{ maxHeight: '565px' }}>
                  <CardContent className="h-full overflow-y-auto scrollbar-premium" style={{ maxHeight: '525px' }}>
                    {formLoading ? (
                      <div className="text-center py-12">
                        <div className="relative">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary/30" />
                          </div>
                        </div>
                        <p className="text-muted-foreground">Loading form data...</p>
                      </div>
                    ) : formData ? (
                      <div className="space-y-6">
                        {/* Report Heading */}
                        <Card className="border-primary/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <FileText className="h-5 w-5" />
                              Report Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Report ID:</span>
                                <span className="font-medium font-mono">{formData.report_heading?.report_id}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Doctor:</span>
                                <span className="font-medium">{formData.report_heading?.doctor_name || 'Unassigned'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Nurse:</span>
                                <span className="font-medium">{formData.report_heading?.nurse_name || 'Unassigned'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Last Updated:</span>
                                <span className="font-medium">{formData.report_heading?.date_updated ? new Date(formData.report_heading.date_updated).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Personal Details */}
                        <Card className="border-green-500/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <Users className="h-5 w-5" />
                              Personal Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">ID:</span>
                                <span className="font-medium">{formData.personal_details?.id}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{formData.personal_details?.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Surname:</span>
                                <span className="font-medium">{formData.personal_details?.surname}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Gender:</span>
                                <span className="font-medium">{formData.personal_details?.gender}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">ID/Passport:</span>
                                <span className="font-medium">{formData.personal_details?.id_or_passport}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Age:</span>
                                <span className="font-medium">{formData.personal_details?.age}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Height:</span>
                                <span className="font-medium">{formData.personal_details?.height_cm} cm</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Weight:</span>
                                <span className="font-medium">{formData.personal_details?.weight_kg} kg</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">BMI:</span>
                                <span className="font-medium">{formData.personal_details?.bmi}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">BMI Status:</span>
                                <Badge variant="outline">{formData.personal_details?.bmi_status}</Badge>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Blood Pressure:</span>
                                <span className="font-medium">{formData.personal_details?.blood_pressure}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">BP Status:</span>
                                <Badge variant="outline">{formData.personal_details?.blood_pressure_status}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Clinical Examinations */}
                        <Card className="border-teal-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <Stethoscope className="h-5 w-5" />
                              Clinical Examinations
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-1 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">General Assessment:</span>
                                <span className="font-medium">{formData.clinical_examinations?.general_assessment || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Head & Neck (incl Thyroid):</span>
                                <span className="font-medium">{formData.clinical_examinations?.head_neck_incl_thyroid || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Cardiovascular:</span>
                                <span className="font-medium">{formData.clinical_examinations?.cardiovascular || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Respiratory:</span>
                                <span className="font-medium">{formData.clinical_examinations?.respiratory || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Gastrointestinal:</span>
                                <span className="font-medium">{formData.clinical_examinations?.gastrointestinal || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Musculoskeletal:</span>
                                <span className="font-medium">{formData.clinical_examinations?.musculoskeletal || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Neurological:</span>
                                <span className="font-medium">{formData.clinical_examinations?.neurological || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Skin:</span>
                                <span className="font-medium">{formData.clinical_examinations?.skin || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Hearing Assessment:</span>
                                <span className="font-medium">{formData.clinical_examinations?.hearing_assessment || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Eyesight Status:</span>
                                <span className="font-medium">{formData.clinical_examinations?.eyesight_status || 'Not Done'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Lab Tests */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <FileText className="h-5 w-5" />
                              Lab Tests
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Full Blood Count & ESR:</span>
                                <span className="font-medium">{formData.lab_tests?.full_blood_count_an_esr || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Kidney Function:</span>
                                <span className="font-medium">{formData.lab_tests?.kidney_function || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Liver Enzymes:</span>
                                <span className="font-medium">{formData.lab_tests?.liver_enzymes || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Vitamin D:</span>
                                <span className="font-medium">{formData.lab_tests?.vitamin_d || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Uric Acid:</span>
                                <span className="font-medium">{formData.lab_tests?.uric_acid || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">hs-CRP:</span>
                                <span className="font-medium">{formData.lab_tests?.hs_crp || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Homocysteine:</span>
                                <span className="font-medium">{formData.lab_tests?.homocysteine || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Total Cholesterol:</span>
                                <span className="font-medium">{formData.lab_tests?.total_cholesterol || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Fasting Glucose:</span>
                                <span className="font-medium">{formData.lab_tests?.fasting_glucose || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Insulin Level:</span>
                                <span className="font-medium">{formData.lab_tests?.insulin_level || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Thyroid Stimulating Hormone:</span>
                                <span className="font-medium">{formData.lab_tests?.thyroid_stimulating_hormone || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Adrenal Response:</span>
                                <span className="font-medium">{formData.lab_tests?.adrenal_response || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Sex Hormones:</span>
                                <span className="font-medium">{formData.lab_tests?.sex_hormones || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">PSA:</span>
                                <span className="font-medium">{formData.lab_tests?.psa || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">HIV:</span>
                                <span className="font-medium">{formData.lab_tests?.hiv || 'Not Done'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Special Investigations */}
                        <Card className="border-teal-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <FileText className="h-5 w-5" />
                              Special Investigations
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Resting ECG:</span>
                                <span className="font-medium">{formData.special_investigations?.resting_ecg || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Stress ECG:</span>
                                <span className="font-medium">{formData.special_investigations?.stress_ecg || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Lung Function:</span>
                                <span className="font-medium">{formData.special_investigations?.lung_function || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Urine Dipstix:</span>
                                <span className="font-medium">{formData.special_investigations?.urine_dipstix || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">KardioFit:</span>
                                <span className="font-medium">{formData.special_investigations?.kardiofit || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">NerveIQ Cardio:</span>
                                <span className="font-medium">{formData.special_investigations?.nerveiq_cardio || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">NerveIQ CNS:</span>
                                <span className="font-medium">{formData.special_investigations?.nerveiq_cns || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">NerveIQ:</span>
                                <span className="font-medium">{formData.special_investigations?.nerveiq || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Predicted VO2 Max:</span>
                                <span className="font-medium">{formData.special_investigations?.predicted_vo2_max || 'Not Done'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Body Fat Percentage:</span>
                                <span className="font-medium">{formData.special_investigations?.body_fat_percentage || 'Not Done'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Medical History */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <FileText className="h-5 w-5" />
                              Medical History
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">High Blood Pressure:</span>
                                <span className="font-medium">{formData.medical_history?.high_blood_pressure}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">High Cholesterol:</span>
                                <span className="font-medium">{formData.medical_history?.high_cholesterol}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Diabetes:</span>
                                <span className="font-medium">{formData.medical_history?.diabetes}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Asthma:</span>
                                <span className="font-medium">{formData.medical_history?.asthma}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Epilepsy:</span>
                                <span className="font-medium">{formData.medical_history?.epilepsy}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Thyroid Disease:</span>
                                <span className="font-medium">{formData.medical_history?.thyroid_disease}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Inflammatory Bowel Disease:</span>
                                <span className="font-medium">{formData.medical_history?.inflammatory_bowel_disease}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Hepatitis:</span>
                                <span className="font-medium">{formData.medical_history?.hepatitis}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Surgery:</span>
                                <span className="font-medium">{formData.medical_history?.surgery}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Anxiety or Depression:</span>
                                <span className="font-medium">{formData.medical_history?.anxiety_or_depression}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Bipolar Mood Disorder:</span>
                                <span className="font-medium">{formData.medical_history?.bipolar_mood_disorder}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">HIV:</span>
                                <span className="font-medium">{formData.medical_history?.hiv}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">TB:</span>
                                <span className="font-medium">{formData.medical_history?.tb}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Disability:</span>
                                <span className="font-medium">{formData.medical_history?.disability}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Cardiac Event in Family:</span>
                                <span className="font-medium">{formData.medical_history?.cardiac_event_in_family}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Cancer Family:</span>
                                <span className="font-medium">{formData.medical_history?.cancer_family}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Allergies */}
                        <Card className="border-teal-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <AlertTriangle className="h-5 w-5" />
                              Allergies
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Environmental:</span>
                                <span className="font-medium">{formData.allergies?.environmental}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Food:</span>
                                <span className="font-medium">{formData.allergies?.food}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Medication:</span>
                                <span className="font-medium">{formData.allergies?.medication}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Current Medication and Supplements */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <FileText className="h-5 w-5" />
                              Current Medication and Supplements
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-1 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Chronic Medication:</span>
                                <span className="font-medium">{formData.current_medication_supplements?.chronic_medication}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Vitamins/Supplements:</span>
                                <span className="font-medium">{formData.current_medication_supplements?.vitamins_supplements}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Screening */}
                        <Card className="border-teal-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <Search className="h-5 w-5" />
                              Screening
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Abdominal UltraSound:</span>
                                <span className="font-medium">{formData.screening?.abdominal_ultrasound}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Colonoscopy:</span>
                                <span className="font-medium">{formData.screening?.colonoscopy}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Gastroscopy:</span>
                                <span className="font-medium">{formData.screening?.gastroscopy}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Bone Density Scan:</span>
                                <span className="font-medium">{formData.screening?.bone_density_scan}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Annual Screening for Prostate:</span>
                                <span className="font-medium">{formData.screening?.annual_screening_prostate}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Mental Health */}
                        <Card className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <Users className="h-5 w-5" />
                              Mental Health
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Anxiety Level:</span>
                                <span className="font-medium">{formData.mental_health?.anxiety_level || 'Not assessed'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Energy Level:</span>
                                <span className="font-medium">{formData.mental_health?.energy_level || 'Not assessed'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Mood Level:</span>
                                <span className="font-medium">{formData.mental_health?.mood_level || 'Not assessed'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Stress Level:</span>
                                <span className="font-medium">{formData.mental_health?.stress_level || 'Not assessed'}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-muted-foreground">Sleep Rating:</span>
                                <span className="font-medium">{formData.mental_health?.sleep_rating || 'Not assessed'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Cardiovascular/Stroke Risk */}
                        <Card className="border-teal-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <Stethoscope className="h-5 w-5" />
                              Cardiovascular/Stroke Risk
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                          
                          {/* Risk factors table */}
                          <div className="bg-white rounded border divide-y mb-6">
                            {formData.cardiovascular_stroke_risk && Object.entries({
                              'Age & Gender': formData.cardiovascular_stroke_risk.age_and_gender_risk,
                              'Blood Pressure': formData.cardiovascular_stroke_risk.blood_pressure,
                              'Cholesterol': formData.cardiovascular_stroke_risk.cholesterol,
                              'Diabetes': formData.cardiovascular_stroke_risk.diabetes,
                              'Obesity': formData.cardiovascular_stroke_risk.obesity,
                              'Waist to Hip Ratio': formData.cardiovascular_stroke_risk.waist_to_hip_ratio,
                              'Overall Diet': formData.cardiovascular_stroke_risk.overall_diet,
                              'Exercise': formData.cardiovascular_stroke_risk.exercise,
                              'Alcohol Consumption': formData.cardiovascular_stroke_risk.alcohol_consumption,
                              'Smoking': formData.cardiovascular_stroke_risk.smoking,
                              'Stress Level': formData.cardiovascular_stroke_risk.stress_level,
                              'Previous Cardiac Event': formData.cardiovascular_stroke_risk.previous_cardiac_event,
                              'Cardiac History In Family': formData.cardiovascular_stroke_risk.cardiac_history_in_family,
                              'Stroke History In Family': formData.cardiovascular_stroke_risk.stroke_history_in_family,
                              'Reynolds Risk Score': formData.cardiovascular_stroke_risk.reynolds_risk_score
                            }).map(([factor, status]) => (
                              <div key={factor} className="flex justify-between items-center px-3 py-2 text-sm">
                                <span>{factor}</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  status === 'At Risk' ? 'bg-red-100 text-red-800' :
                                  status === 'Medium Risk' || status === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  status === 'Low Risk' || status === 'No Risk' ? 'bg-green-100 text-green-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {status}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Risk Distribution Pie Chart */}
                          <div className="bg-white p-6 rounded border">
                            <h5 className="font-semibold text-gray-900 text-center text-base mb-6">Risk Distribution</h5>
                            {(() => {
                              const riskFactors = formData.cardiovascular_stroke_risk ? Object.values({
                                age_gender: formData.cardiovascular_stroke_risk.age_and_gender_risk,
                                blood_pressure: formData.cardiovascular_stroke_risk.blood_pressure,
                                cholesterol: formData.cardiovascular_stroke_risk.cholesterol,
                                diabetes: formData.cardiovascular_stroke_risk.diabetes,
                                obesity: formData.cardiovascular_stroke_risk.obesity,
                                waist_to_hip_ratio: formData.cardiovascular_stroke_risk.waist_to_hip_ratio,
                                overall_diet: formData.cardiovascular_stroke_risk.overall_diet,
                                exercise: formData.cardiovascular_stroke_risk.exercise,
                                alcohol_consumption: formData.cardiovascular_stroke_risk.alcohol_consumption,
                                smoking: formData.cardiovascular_stroke_risk.smoking,
                                stress_level: formData.cardiovascular_stroke_risk.stress_level,
                                previous_cardiac_event: formData.cardiovascular_stroke_risk.previous_cardiac_event,
                                cardiac_history_in_family: formData.cardiovascular_stroke_risk.cardiac_history_in_family,
                                stroke_history_in_family: formData.cardiovascular_stroke_risk.stroke_history_in_family,
                                reynolds_risk_score: formData.cardiovascular_stroke_risk.reynolds_risk_score
                              }) : [];
                              
                              const riskCounts = riskFactors.reduce((acc: Record<string, number>, risk) => {
                                const normalizedRisk = risk === 'No Risk' || risk === 'Low Risk' ? 'Low Risk' : 
                                                    risk === 'Medium Risk' || risk === 'Medium' ? 'Medium Risk' : 'At Risk';
                                acc[normalizedRisk] = (acc[normalizedRisk] || 0) + 1;
                                return acc;
                              }, {});
                              
                              const total = Object.values(riskCounts).reduce((sum: number, count) => sum + count, 0);
                              const colors = {
                                'Low Risk': '#0F766E',
                                'Medium Risk': '#374151', 
                                'At Risk': '#6B7280'
                              };
                              
                              // Create slices for pie chart
                              const slices = Object.entries(riskCounts).map(([status, count]) => ({
                                status,
                                count,
                                percentage: Math.round((count / total) * 100),
                                color: colors[status as keyof typeof colors] || '#6B7280'
                              })).filter(slice => slice.count > 0);
                              
                              // Sort by count descending
                              slices.sort((a, b) => b.count - a.count);
                              
                              return (
                                <div className="flex justify-center items-center gap-8">
                                  {/* Pie Chart Visual */}
                                  <div className="relative">
                                    <svg width="240" height="240" className="transform -rotate-90">
                                      {(() => {
                                        let cumulativeAngle = 0;
                                        const radius = 100;
                                        const centerX = 120;
                                        const centerY = 120;
                                        
                                        return slices.map(({ status, percentage, color }, index) => {
                                          const angle = (percentage / 100) * 360;
                                          const startAngle = cumulativeAngle;
                                          const endAngle = cumulativeAngle + angle;
                                          
                                          const startAngleRad = (startAngle * Math.PI) / 180;
                                          const endAngleRad = (endAngle * Math.PI) / 180;
                                          
                                          const x1 = centerX + radius * Math.cos(startAngleRad);
                                          const y1 = centerY + radius * Math.sin(startAngleRad);
                                          const x2 = centerX + radius * Math.cos(endAngleRad);
                                          const y2 = centerY + radius * Math.sin(endAngleRad);
                                          
                                          const largeArcFlag = angle > 180 ? 1 : 0;
                                          
                                          const pathData = [
                                            `M ${centerX} ${centerY}`,
                                            `L ${x1} ${y1}`,
                                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                            'Z'
                                          ].join(' ');
                                          
                                          cumulativeAngle += angle;
                                          
                                          return (
                                            <path
                                              key={status}
                                              d={pathData}
                                              fill={color}
                                              stroke="#ffffff"
                                              strokeWidth="2"
                                            />
                                          );
                                        });
                                      })()}
                                    </svg>
                                  </div>
                                  
                                  {/* Legend */}
                                  <div className="space-y-3">
                                    {slices.map(({ status, count, percentage, color }) => (
                                      <div key={status} className="flex items-center gap-3">
                                        <div 
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: color }}
                                        ></div>
                                        <div className="flex flex-col">
                                          <span className="font-medium text-gray-900">{status}</span>
                                          <span className="text-sm text-gray-600">{count} factors ({percentage}%)</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          </CardContent>
                        </Card>

                        {/* Notes and Recommendations */}
                        {formData.notes_recommendations?.recommendation_text && (
                          <Card className="border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                                <FileText className="h-5 w-5" />
                                Notes and Recommendations
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-sm">
                                <p className="text-gray-700">{formData.notes_recommendations.recommendation_text}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Men's Health - Only show for male employees */}
                        {formData.mens_health?.recommendation_text && (
                          <Card className="border-teal-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                                <Users className="h-5 w-5" />
                                Men's Health
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-sm">
                                <p className="text-gray-700">{formData.mens_health.recommendation_text}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Women's Health - Only show for female employees */}
                        {formData.womens_health?.recommendation_text && (
                          <Card className="border-teal-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                                <Users className="h-5 w-5" />
                                Women's Health
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-sm">
                                <p className="text-gray-700">{formData.womens_health.recommendation_text}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Overview */}
                        {formData.overview?.notes_text && (
                          <Card className="border-gray-200">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                                <FileText className="h-5 w-5" />
                                Overview
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-sm">
                                <p className="text-gray-700">{formData.overview.notes_text}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Important Information and Disclaimer */}
                        <Card className="border-gray-200 border-l-4 border-l-gray-400">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2 section-heading heading-montserrat">
                              <AlertTriangle className="h-5 w-5" />
                              Important Information and Disclaimer
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-sm text-gray-700">
                              <p className="whitespace-pre-line">{formData.important_information_disclaimer?.disclaimer_text}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Failed to load form data</h3>
                            <p className="text-muted-foreground">Please try selecting the report again.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Team */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                My Team
              </CardTitle>
              <CardDescription>Nurses you collaborate with on medical reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.team.map((member) => (
                <div key={member.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{member.name} {member.surname}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                    <Badge variant="outline">Nurse</Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.team || dashboardData.team.length === 0) && (
                <p className="text-sm text-muted-foreground">No team members found</p>
              )}
            </CardContent>
          </Card>

          {/* My Sites */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                My Sites
              </CardTitle>
              <CardDescription>Sites where you conduct medical examinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.sites.map((site) => (
                <div key={site.site_name} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{site.site_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {site.employee_count} employees examined
                      </div>
                    </div>
                    <Badge variant="secondary">{site.employee_count}</Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.sites || dashboardData.sites.length === 0) && (
                <p className="text-sm text-muted-foreground">No sites found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
              <CardDescription>Latest executive medical reports you've created</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentReports.map((report) => (
                <div key={report.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {report.employee_name} {report.employee_surname}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(report.date_created).toLocaleDateString('en-ZA')}
                      </div>
                    </div>
                    <Badge variant={report.doctor_signoff ? 'default' : 'secondary'}>
                      {report.doctor_signoff ? 'Signed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.recentReports || dashboardData.recentReports.length === 0) && (
                <p className="text-sm text-muted-foreground">No recent reports found</p>
              )}
            </CardContent>
          </Card>

          {/* Top Workplaces */}
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Top Workplaces
              </CardTitle>
              <CardDescription>Workplaces with most employees examined</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.topWorkplaces.map((workplace, index) => (
                <div key={`workplace-${index}-${workplace.workplace}`} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{workplace.workplace}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {workplace.employee_count} employees
                      </div>
                    </div>
                    <Badge variant="outline">{workplace.employee_count}</Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.topWorkplaces || dashboardData.topWorkplaces.length === 0) && (
                <p className="text-sm text-muted-foreground">No workplace data found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}