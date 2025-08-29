'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Plus,
  Save,
  AlertCircle,
  DollarSign,
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
  user_created?: string;
  user_updated?: string;
}

interface FormData {
  [key: string]: any;
}

interface Employee {
  id: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;
  user_updated?: string;
  created_by?: string;
  updated_by?: string;
  section_header?: string;
  name: string;
  surname: string;
  id_number?: string;
  passport_number?: string;
  gender?: string;
  date_of_birth?: Date;
  ethnicity?: string;
  marriage_status?: string;
  no_of_children?: number;
  personal_email_address?: string;
  mobile_number?: string;
  section_header_2?: string;
  medical_aid?: string;
  medical_aid_number?: string;
  main_member?: boolean;
  main_member_name?: string;
  section_header_3?: string;
  work_email?: string;
  employee_number?: string;
  organisation?: string;
  organisation_name?: string;
  workplace?: string;
  workplace_name?: string;
  job?: string;
  notes_header?: string;
  notes_text?: string;
  work_startdate?: Date;
  manager_count?: number;
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
  const [selectedStaffType, setSelectedStaffType] = useState<
    'Doctor' | 'Nurse'
  >('Doctor');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<MedicalReport | null>(
    null
  );
  const [createFormData, setCreateFormData] = useState<Partial<MedicalReport>>(
    {}
  );
  const [editFormData, setEditFormData] = useState<Partial<MedicalReport>>({});
  const [modalFormLoading, setModalFormLoading] = useState(false);

  // Related entities state
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [relatedEntitiesLoading, setRelatedEntitiesLoading] = useState(false);

  // Modal state for related entities
  const [isOrganizationsModalOpen, setIsOrganizationsModalOpen] =
    useState(false);
  const [isSitesModalOpen, setIsSitesModalOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isCostCentersModalOpen, setIsCostCentersModalOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
  const { data: dashboardData, loading: dashboardLoading } =
    useAPI<DashboardData>(
      selectedDoctorId && selectedStaffType === 'Doctor'
        ? `/api/dashboard/my-dashboard?doctorId=${selectedDoctorId}`
        : selectedNurseId && selectedStaffType === 'Nurse'
          ? `/api/dashboard/my-dashboard?nurseId=${selectedNurseId}`
          : null,
      [selectedDoctorId, selectedNurseId, selectedStaffType]
    );

  const doctors =
    usersResponse?.users?.filter(user => user.type === 'Doctor') || [];
  const nurses =
    usersResponse?.users?.filter(user => user.type === 'Nurse') || [];

  // Auto-select first staff member if none selected
  useEffect(() => {
    if (
      selectedStaffType === 'Doctor' &&
      doctors.length > 0 &&
      !selectedDoctorId
    ) {
      setSelectedDoctorId(doctors[0].id);
    } else if (
      selectedStaffType === 'Nurse' &&
      nurses.length > 0 &&
      !selectedNurseId
    ) {
      setSelectedNurseId(nurses[0].id);
    }
  }, [doctors, nurses, selectedDoctorId, selectedNurseId, selectedStaffType]);

  // Reset selection when staff type changes
  useEffect(() => {
    setSelectedDoctorId('');
    setSelectedNurseId('');
    setSelectedReport(null);
    setSelectedEmployee(null);
    setFormData(null);
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
    setEmployeeLoading(true);

    try {
      // Fetch employee data
      const employeeResponse = await fetch(
        `/api/employees/${report.employee_id}`
      );
      if (employeeResponse.ok) {
        const employeeData = await employeeResponse.json();
        setSelectedEmployee(employeeData);
      } else {
        console.error('Failed to fetch employee data');
        setSelectedEmployee(null);
      }

      // Fetch form data
      const formResponse = await fetch(`/api/reports/form-data/${report.id}`);
      if (formResponse.ok) {
        const data = await formResponse.json();
        setFormData(data);
      } else {
        console.error('Failed to fetch form data');
        setFormData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setFormData(null);
      setSelectedEmployee(null);
    } finally {
      setFormLoading(false);
      setEmployeeLoading(false);
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
    // Open edit modal instead of navigating
    setEditingReport(selectedReport);
    setEditFormData(selectedReport);
    setIsEditModalOpen(true);
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    // Open delete modal instead of using window.confirm
    setEditingReport(selectedReport);
    setIsDeleteModalOpen(true);
  };

  const handleCreateReport = () => {
    // Open create modal instead of navigating
    setCreateFormData({});
    setIsCreateModalOpen(true);
  };

  // Fetch related entities for modals
  const fetchOrganizations = async () => {
    try {
      setRelatedEntitiesLoading(true);
      const response = await fetch('/api/organizations?limit=1000');
      const data = await response.json();
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setRelatedEntitiesLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      setRelatedEntitiesLoading(true);
      const response = await fetch('/api/sites?limit=1000');
      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setRelatedEntitiesLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setRelatedEntitiesLoading(true);
      const response = await fetch('/api/locations?limit=1000');
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setRelatedEntitiesLoading(false);
    }
  };

  const fetchCostCenters = async () => {
    try {
      setRelatedEntitiesLoading(true);
      const response = await fetch('/api/cost-centers?limit=1000');
      const data = await response.json();
      setCostCenters(data.costCenters || []);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
    } finally {
      setRelatedEntitiesLoading(false);
    }
  };

  // Modal open functions
  const openOrganizationsModal = () => {
    if (organizations.length === 0) {
      fetchOrganizations();
    }
    setIsOrganizationsModalOpen(true);
  };

  const openSitesModal = () => {
    if (sites.length === 0) {
      fetchSites();
    }
    setIsSitesModalOpen(true);
  };

  const openLocationsModal = () => {
    if (locations.length === 0) {
      fetchLocations();
    }
    setIsLocationsModalOpen(true);
  };

  const openCostCentersModal = () => {
    if (costCenters.length === 0) {
      fetchCostCenters();
    }
    setIsCostCentersModalOpen(true);
  };

  // CRUD modal functions
  const handleCreate = async () => {
    try {
      setModalFormLoading(true);

      console.log('handleCreate called with form data:', createFormData);

      // Validate required fields
      if (!createFormData.employee_id || !createFormData.type) {
        console.log(
          'Validation failed - employee_id:',
          createFormData.employee_id,
          'type:',
          createFormData.type
        );
        alert('Employee ID and Report Type are required fields');
        setModalFormLoading(false);
        return;
      }

      // Prepare the data for creation
      const reportData = {
        ...createFormData,
        user_created: dashboardData?.doctor?.id || 'system',
        user_updated: dashboardData?.doctor?.id || 'system',
        doctor: selectedStaffType === 'Doctor' ? selectedDoctorId : null,
        nurse: selectedStaffType === 'Nurse' ? selectedNurseId : null,
        type: 'Executive Medical', // Always set to Executive Medical
        sub_type: createFormData.sub_type || 'Initial',
        doctor_signoff: 'No',
        report_work_status: 'Draft',
      };

      console.log('Sending report data:', reportData);

      console.log('Making POST request to /api/reports...');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Report created successfully:', result);
        setIsCreateModalOpen(false);
        setCreateFormData({});
        // Refresh dashboard data
        refreshDashboardData();
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
        alert(`Failed to create report: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Error creating report. Please try again.');
    } finally {
      setModalFormLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setModalFormLoading(true);

      if (!editingReport?.id) {
        alert('No report selected for editing');
        return;
      }

      // Prepare the data for update
      const updateData = {
        ...editFormData,
        user_updated: dashboardData?.doctor?.id || 'system',
        doctor: selectedStaffType === 'Doctor' ? selectedDoctorId : null,
        nurse: selectedStaffType === 'Nurse' ? selectedNurseId : null,
        type: editFormData.type || 'Executive Medical',
        sub_type: editFormData.sub_type || 'Initial',
      };

      const response = await fetch(`/api/reports/${editingReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Report updated successfully:', result);
        setIsEditModalOpen(false);
        setEditingReport(null);
        setEditFormData({});
        // Refresh dashboard data
        refreshDashboardData();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
        alert(`Failed to update report: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report. Please try again.');
    } finally {
      setModalFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalFormLoading(true);

      if (!editingReport?.id) {
        alert('No report selected for deletion');
        return;
      }

      const response = await fetch(`/api/reports?id=${editingReport.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Report deleted successfully:', result);
        setIsDeleteModalOpen(false);
        setEditingReport(null);
        if (selectedReport?.id === editingReport?.id) {
          setSelectedReport(null);
        }
        // Refresh dashboard data
        refreshDashboardData();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`Failed to delete report: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report. Please try again.');
    } finally {
      setModalFormLoading(false);
    }
  };

  const openCreateModal = () => {
    console.log('Opening create modal, resetting form data');
    setCreateFormData({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (report: MedicalReport) => {
    setEditingReport(report);
    setEditFormData(report);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (report: MedicalReport) => {
    setEditingReport(report);
    setIsDeleteModalOpen(true);
  };

  // Resizing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const container = document.querySelector(
      '.resizable-container'
    ) as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

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

  // Fetch related entities on mount
  useEffect(() => {
    fetchOrganizations();
    fetchSites();
    fetchLocations();
    fetchCostCenters();
  }, []);

  // Function to refresh dashboard data
  const refreshDashboardData = () => {
    // This will trigger a re-fetch of the dashboard data
    // by changing the dependency in the useAPI hook
    if (selectedDoctorId && selectedStaffType === 'Doctor') {
      // Force refresh by updating the URL or triggering a refetch
      window.location.reload();
    }
  };

  if (usersLoading) {
    return (
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card className='glass-effect'>
            <CardContent className='flex items-center justify-center py-20'>
              <div className='text-center space-y-4'>
                <Loader2 className='h-16 w-16 animate-spin text-primary mx-auto' />
                <h3 className='text-lg font-semibold'>Loading Dashboard</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8 space-y-8 animate-slide-up'>
        {/* Header with Doctor Selection */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-6'>
              <Avatar className='h-16 w-16'>
                <AvatarFallback className='text-xl bg-primary/10 text-primary font-semibold'>
                  {dashboardData?.doctor
                    ? `${dashboardData.doctor.name.charAt(0)}${dashboardData.doctor.surname.charAt(0)}`
                    : 'KC'}
                </AvatarFallback>
              </Avatar>
              <div className='space-y-2'>
                <div>
                  <h1 className='text-3xl font-bold'>
                    {dashboardData?.doctor
                      ? `${selectedStaffType === 'Doctor' ? 'Dr.' : ''} ${dashboardData.doctor.name} ${dashboardData.doctor.surname}`
                      : `${selectedStaffType === 'Doctor' ? 'Dr.' : ''} Kim Comline`}
                  </h1>
                  <p className='text-muted-foreground'>{currentDate}</p>
                </div>
                <div className='flex items-center gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {dashboardData?.doctor?.email ||
                        'kim@healthwithheart.co.za'}
                    </span>
                  </div>
                  {dashboardData?.doctor?.mobile && (
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>
                        {dashboardData.doctor.mobile}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      ID: {dashboardData?.doctor?.id || '66f7afae87ea74da'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{selectedStaffType}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Selection */}
            <div className='flex items-center gap-4'>
              {/* Staff Type Selection */}
              <div className='w-32'>
                <Select
                  value={selectedStaffType}
                  onValueChange={(value: 'Doctor' | 'Nurse') =>
                    setSelectedStaffType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Doctor'>Doctors</SelectItem>
                    <SelectItem value='Nurse'>Nurses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Staff Member Selection */}
              <div className='w-80'>
                {selectedStaffType === 'Doctor' ? (
                  <Select
                    value={selectedDoctorId}
                    onValueChange={setSelectedDoctorId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a doctor' />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} {doctor.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={selectedNurseId}
                    onValueChange={setSelectedNurseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a nurse' />
                    </SelectTrigger>
                    <SelectContent>
                      {nurses.map(nurse => (
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
          <Card className='hover-lift gradient-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Reports
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats.totalReports || 0}
              </div>
              <p className='text-xs text-muted-foreground'>Executive Medical</p>
            </CardContent>
          </Card>

          <Card className='hover-lift gradient-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Employees
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats.totalEmployees || 0}
              </div>
              <p className='text-xs text-muted-foreground'>Unique employees</p>
            </CardContent>
          </Card>

          <Card className='hover-lift gradient-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Signed Reports
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats.signedReports || 0}
              </div>
              <p className='text-xs text-muted-foreground'>Completed</p>
            </CardContent>
          </Card>

          <Card className='hover-lift gradient-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Reports
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats.pendingReports || 0}
              </div>
              <p className='text-xs text-muted-foreground'>
                Awaiting signature
              </p>
            </CardContent>
          </Card>

          <Card className='hover-lift gradient-border'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Signoff Rate
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats.signoffRate || 0}%
              </div>
              <p className='text-xs text-muted-foreground'>Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card
            className='hover-lift cursor-pointer'
            onClick={openOrganizationsModal}
          >
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <Building2 className='h-8 w-8 text-blue-600' />
                <div>
                  <h3 className='font-semibold'>Organizations</h3>
                  <p className='text-sm text-muted-foreground'>
                    {organizations.length} organizations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='hover-lift cursor-pointer' onClick={openSitesModal}>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <MapPin className='h-8 w-8 text-green-600' />
                <div>
                  <h3 className='font-semibold'>Sites</h3>
                  <p className='text-sm text-muted-foreground'>
                    {sites.length} sites
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className='hover-lift cursor-pointer'
            onClick={openLocationsModal}
          >
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <MapPin className='h-8 w-8 text-purple-600' />
                <div>
                  <h3 className='font-semibold'>Locations</h3>
                  <p className='text-sm text-muted-foreground'>
                    {locations.length} locations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className='hover-lift cursor-pointer'
            onClick={openCostCentersModal}
          >
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <DollarSign className='h-8 w-8 text-orange-600' />
                <div>
                  <h3 className='font-semibold'>Cost Centers</h3>
                  <p className='text-sm text-muted-foreground'>
                    {costCenters.length} cost centers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Reports Grid with Split Panel */}
        <div
          className={`resizable-container flex transition-all duration-300 animate-slide-up overflow-hidden ${selectedReport ? '' : 'justify-center'}`}
        >
          {/* Left Panel - Reports Grid */}
          <div
            className='space-y-4'
            style={{
              width: selectedReport ? `${leftPanelWidth}%` : '100%',
              maxWidth: selectedReport ? `${leftPanelWidth}%` : '100%',
              paddingRight: selectedReport ? '12px' : '0',
            }}
          >
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-2xl'>
                      <div className='p-2 bg-teal-100 rounded-lg'>
                        <FileText className='h-6 w-6 text-teal-600' />
                      </div>
                      <div>
                        <span className='medical-heading'>My Reports</span>
                        <span className='ml-2 text-lg font-medium text-gray-500'>
                          ({dashboardData?.allReports?.length || 0})
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription className='mt-2 text-base text-gray-600'>
                      Complete list of all executive medical reports you have
                      created
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={handleCreateReport}
                      variant='default'
                      size='sm'
                      className='hover-lift'
                      title='Create new medical report'
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      New Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!dashboardData?.allReports ||
                dashboardData.allReports.length === 0 ? (
                  <div className='text-center py-12'>
                    <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No reports found
                    </h3>
                    <p className='text-muted-foreground'>
                      No Executive Medical reports are available for this
                      doctor.
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[600px] overflow-auto scrollbar-premium'>
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
                        {dashboardData.allReports.map(report => (
                          <TableRow
                            key={report.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedReport?.id === report.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleReportClick(report)}
                          >
                            <TableCell>
                              <div
                                className='font-mono text-xs text-muted-foreground'
                                title={report.id}
                              >
                                {report.id.slice(0, 8)}...
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {getEmployeeName(report)}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  ID: {report.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm'>
                                  {new Date(
                                    report.date_created
                                  ).toLocaleDateString('en-ZA', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  report.doctor_signoff === 'Yes'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className='flex items-center gap-1'
                              >
                                {report.doctor_signoff === 'Yes' ? (
                                  <CheckCircle className='h-3 w-3' />
                                ) : (
                                  <Clock className='h-3 w-3' />
                                )}
                                {report.doctor_signoff === 'Yes'
                                  ? 'Signed'
                                  : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span
                                className='text-sm truncate'
                                title={
                                  report.workplace_name ||
                                  report.workplace ||
                                  'N/A'
                                }
                              >
                                {report.workplace_name ||
                                  report.workplace ||
                                  'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className='text-sm truncate'
                                title={report.employee_work_email || 'N/A'}
                              >
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
              className='w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors duration-200 flex-shrink-0 relative group'
              onMouseDown={handleMouseDown}
            >
              <div className='absolute inset-y-0 -left-1 -right-1 hover:bg-primary/10 transition-colors duration-200'></div>
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border group-hover:bg-primary/50 rounded-full transition-colors duration-200'></div>
            </div>
          )}

          {/* Right Panel - Employee 360 View */}
          <div
            className={`space-y-4 ${selectedReport ? 'animate-slide-up' : ''}`}
            style={{
              width: selectedReport
                ? `calc(${100 - leftPanelWidth}% - 20px)`
                : '0%',
              maxWidth: selectedReport
                ? `calc(${100 - leftPanelWidth}% - 20px)`
                : '0%',
              paddingLeft: selectedReport ? '12px' : '0',
              paddingRight: selectedReport ? '20px' : '0',
              overflow: selectedReport ? 'visible' : 'hidden',
              height: selectedReport ? 'fit-content' : '0',
            }}
          >
            {selectedReport && (
              <>
                {/* Employee Header Card */}
                <Card className='glass-effect'>
                  <CardContent className='p-4 min-h-[120px] flex items-center'>
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4'>
                      <div className='space-y-2 flex-1'>
                        <CardTitle className='text-2xl flex items-center gap-3 heading-montserrat-bold'>
                          <div className='p-2 bg-teal-100 rounded-lg'>
                            <Users className='h-6 w-6 text-teal-600' />
                          </div>
                          <span className='medical-heading'>
                            {getEmployeeName(selectedReport)}
                          </span>
                        </CardTitle>
                        <CardDescription className='flex items-center gap-3 lg:ml-14'>
                          <Badge
                            variant='outline'
                            className='font-mono text-xs font-medium'
                          >
                            ID: {selectedReport.employee_id.slice(0, 12)}...
                          </Badge>
                          <Badge
                            variant={
                              selectedReport.doctor_signoff === 'Yes'
                                ? 'default'
                                : 'secondary'
                            }
                            className='font-medium'
                          >
                            {selectedReport.doctor_signoff === 'Yes'
                              ? '✓ Signed'
                              : '⏳ Pending'}
                          </Badge>
                        </CardDescription>
                        {/* Last Updated Information */}
                        <div className='text-xs text-muted-foreground mt-2 lg:ml-14'>
                          <span>Last updated by </span>
                          <span className='font-medium'>
                            {selectedReport.user_updated || 'Unknown'}
                          </span>
                          <span> on </span>
                          <span className='font-medium'>
                            {selectedReport.date_updated
                              ? new Date(
                                  selectedReport.date_updated
                                ).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <Button
                          onClick={handleEditReport}
                          variant='outline'
                          size='sm'
                          className='hover-lift'
                          title='Edit this medical report'
                        >
                          <Edit className='h-4 w-4 mr-1' />
                        </Button>
                        <Button
                          onClick={handleDeleteReport}
                          variant='destructive'
                          size='sm'
                          className='hover-lift'
                          title='Delete this medical report'
                        >
                          <Trash2 className='h-4 w-4 mr-1' />
                        </Button>
                        <Button
                          onClick={handleGeneratePDF}
                          disabled={!canGeneratePDF()}
                          variant={canGeneratePDF() ? 'default' : 'secondary'}
                          size='sm'
                          className='hover-lift'
                          title={
                            canGeneratePDF()
                              ? 'Generate PDF'
                              : 'PDF only available for signed reports'
                          }
                        >
                          <Download className='h-4 w-4 mr-1' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedReport(null);
                            setSelectedEmployee(null);
                            setFormData(null);
                          }}
                          className='hover-lift'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employee 360 View */}
                <Card className='hover-lift' style={{ maxHeight: '700px' }}>
                  <CardContent
                    className='h-full overflow-y-auto scrollbar-premium p-6'
                    style={{ maxHeight: '650px' }}
                  >
                    {employeeLoading ? (
                      <div className='text-center py-12'>
                        <div className='relative'>
                          <Loader2 className='h-8 w-8 animate-spin text-primary mx-auto mb-4' />
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <Users className='h-4 w-4 text-primary/30' />
                          </div>
                        </div>
                        <p className='text-muted-foreground'>
                          Loading employee data...
                        </p>
                      </div>
                    ) : selectedEmployee ? (
                      <Employee360View
                        employeeId={selectedEmployee.id}
                        employee={selectedEmployee}
                      />
                    ) : (
                      <div className='text-center py-12'>
                        <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                        <h3 className='text-lg font-medium text-foreground mb-2'>
                          Employee not found
                        </h3>
                        <p className='text-muted-foreground'>
                          Unable to load employee data for this report.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* My Team */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCheck className='h-5 w-5' />
                My Team
              </CardTitle>
              <CardDescription>
                Nurses you collaborate with on medical reports
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {dashboardData?.team.map(member => (
                <div key={member.id} className='p-4 rounded-lg border'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <h4 className='font-medium'>
                        {member.name} {member.surname}
                      </h4>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Mail className='h-3 w-3' />
                        {member.email}
                      </div>
                    </div>
                    <Badge variant='outline'>Nurse</Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.team || dashboardData.team.length === 0) && (
                <p className='text-sm text-muted-foreground'>
                  No team members found
                </p>
              )}
            </CardContent>
          </Card>

          {/* My Sites */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building2 className='h-5 w-5' />
                My Sites
              </CardTitle>
              <CardDescription>
                Sites where you conduct medical examinations
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {dashboardData?.sites.map(site => (
                <div key={site.site_name} className='p-4 rounded-lg border'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <h4 className='font-medium'>{site.site_name}</h4>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Users className='h-3 w-3' />
                        {site.employee_count} employees examined
                      </div>
                    </div>
                    <Badge variant='secondary'>{site.employee_count}</Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.sites || dashboardData.sites.length === 0) && (
                <p className='text-sm text-muted-foreground'>No sites found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Recent Reports */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Latest executive medical reports you've created
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {dashboardData?.recentReports.map(report => (
                <div key={report.id} className='p-4 rounded-lg border'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <h4 className='font-medium'>
                        {report.employee_name} {report.employee_surname}
                      </h4>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Clock className='h-3 w-3' />
                        {new Date(report.date_created).toLocaleDateString(
                          'en-ZA'
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={report.doctor_signoff ? 'default' : 'secondary'}
                    >
                      {report.doctor_signoff ? 'Signed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.recentReports ||
                dashboardData.recentReports.length === 0) && (
                <p className='text-sm text-muted-foreground'>
                  No recent reports found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Workplaces */}
          <Card className='hover-lift'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Briefcase className='h-5 w-5' />
                Top Workplaces
              </CardTitle>
              <CardDescription>
                Workplaces with most employees examined
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {dashboardData?.topWorkplaces.map((workplace, index) => (
                <div
                  key={`workplace-${index}-${workplace.workplace}`}
                  className='p-4 rounded-lg border'
                >
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <h4 className='font-medium'>{workplace.workplace}</h4>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Users className='h-3 w-3' />
                        {workplace.employee_count} employees
                      </div>
                    </div>
                    <Badge variant='outline'>{workplace.employee_count}</Badge>
                  </div>
                </div>
              )) || []}
              {(!dashboardData?.topWorkplaces ||
                dashboardData.topWorkplaces.length === 0) && (
                <p className='text-sm text-muted-foreground'>
                  No workplace data found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Medical Report</DialogTitle>
              <DialogDescription>
                Add a new executive medical report for an employee.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id'>Employee ID</Label>
                <Input
                  id='employee_id'
                  value={createFormData.employee_id || ''}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      employee_id: e.target.value,
                    })
                  }
                  placeholder='Enter employee ID'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Report Type</Label>
                <Input
                  id='type'
                  value='Executive Medical'
                  disabled
                  className='bg-muted'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='sub_type'>Sub Type</Label>
                <Select
                  value={createFormData.sub_type || ''}
                  onValueChange={value =>
                    setCreateFormData({ ...createFormData, sub_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select sub type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Initial'>Initial</SelectItem>
                    <SelectItem value='Follow-up'>Follow-up</SelectItem>
                    <SelectItem value='Annual'>Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='workplace'>Workplace</Label>
                <Input
                  id='workplace'
                  value={createFormData.workplace || ''}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      workplace: e.target.value,
                    })
                  }
                  placeholder='Enter workplace or cost center'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='line_manager'>Line Manager</Label>
                <Input
                  id='line_manager'
                  value={createFormData.line_manager || ''}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      line_manager: e.target.value,
                    })
                  }
                  placeholder='Enter line manager name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='manager_email'>Manager Email</Label>
                <Input
                  id='manager_email'
                  value={createFormData.manager_email || ''}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      manager_email: e.target.value,
                    })
                  }
                  placeholder='Enter manager email'
                  type='email'
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_text'>Notes</Label>
                <Textarea
                  id='notes_text'
                  value={createFormData.notes_text || ''}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      notes_text: e.target.value,
                    })
                  }
                  placeholder='Additional notes about the medical report...'
                  rows={3}
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='recommendation_text'>Recommendations</Label>
                <Textarea
                  id='recommendation_text'
                  value={createFormData.recommendation_text || ''}
                  onChange={e =>
                    setCreateFormData({
                      ...createFormData,
                      recommendation_text: e.target.value,
                    })
                  }
                  placeholder='Medical recommendations...'
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateModalOpen(false)}
                disabled={modalFormLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={modalFormLoading}>
                {modalFormLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Create Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Medical Report</DialogTitle>
              <DialogDescription>
                Update the medical report for{' '}
                {editingReport ? getEmployeeName(editingReport) : ''}.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id_edit'>Employee ID</Label>
                <Input
                  id='employee_id_edit'
                  value={editFormData.employee_id || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      employee_id: e.target.value,
                    })
                  }
                  placeholder='Enter employee ID'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type_edit'>Report Type</Label>
                <Select
                  value={editFormData.type || ''}
                  onValueChange={value =>
                    setEditFormData({ ...editFormData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select report type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Executive Medical'>
                      Executive Medical
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='sub_type_edit'>Sub Type</Label>
                <Select
                  value={editFormData.sub_type || ''}
                  onValueChange={value =>
                    setEditFormData({ ...editFormData, sub_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select sub type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Initial'>Initial</SelectItem>
                    <SelectItem value='Follow-up'>Follow-up</SelectItem>
                    <SelectItem value='Annual'>Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='workplace_edit'>Workplace</Label>
                <Input
                  id='workplace_edit'
                  value={editFormData.workplace || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      workplace: e.target.value,
                    })
                  }
                  placeholder='Enter workplace or cost center'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='line_manager_edit'>Line Manager</Label>
                <Input
                  id='line_manager_edit'
                  value={editFormData.line_manager || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      line_manager: e.target.value,
                    })
                  }
                  placeholder='Enter line manager name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='manager_email_edit'>Manager Email</Label>
                <Input
                  id='manager_email_edit'
                  value={editFormData.manager_email || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      manager_email: e.target.value,
                    })
                  }
                  placeholder='Enter manager email'
                  type='email'
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_text_edit'>Notes</Label>
                <Textarea
                  id='notes_text_edit'
                  value={editFormData.notes_text || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      notes_text: e.target.value,
                    })
                  }
                  placeholder='Additional notes about the medical report...'
                  rows={3}
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='recommendation_text_edit'>
                  Recommendations
                </Label>
                <Textarea
                  id='recommendation_text_edit'
                  value={editFormData.recommendation_text || ''}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      recommendation_text: e.target.value,
                    })
                  }
                  placeholder='Medical recommendations...'
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsEditModalOpen(false)}
                disabled={modalFormLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={modalFormLoading}>
                {modalFormLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Update Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <AlertCircle className='h-5 w-5 text-destructive' />
                Delete Medical Report
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this medical report for{' '}
                <span className='font-medium'>
                  {editingReport ? getEmployeeName(editingReport) : ''}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={modalFormLoading}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={modalFormLoading}
              >
                {modalFormLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Organizations Modal */}
        <Dialog
          open={isOrganizationsModalOpen}
          onOpenChange={setIsOrganizationsModalOpen}
        >
          <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Building2 className='h-5 w-5 text-blue-600' />
                Organizations
              </DialogTitle>
              <DialogDescription>
                View all organizations in the system
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {relatedEntitiesLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                  <span className='ml-2'>Loading organizations...</span>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {organizations.map(org => (
                    <Card key={org.id} className='hover-lift'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-lg'>
                          {org.name || 'Unnamed Organization'}
                        </CardTitle>
                        <CardDescription>
                          {org.registration_number &&
                            `Reg: ${org.registration_number}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Employees:
                          </span>
                          <Badge variant='outline'>
                            {org.employee_count || 0}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>Sites:</span>
                          <Badge variant='outline'>{org.site_count || 0}</Badge>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Managers:
                          </span>
                          <Badge variant='outline'>
                            {org.manager_count || 0}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Reports:
                          </span>
                          <Badge variant='outline'>
                            {org.medical_report_count || 0}
                          </Badge>
                        </div>
                        {org.notes_text && (
                          <div className='pt-2 border-t'>
                            <p className='text-sm text-muted-foreground'>
                              {org.notes_text}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Sites Modal */}
        <Dialog open={isSitesModalOpen} onOpenChange={setIsSitesModalOpen}>
          <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-green-600' />
                Sites
              </DialogTitle>
              <DialogDescription>
                View all sites in the system
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {relatedEntitiesLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                  <span className='ml-2'>Loading sites...</span>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {sites.map(site => (
                    <Card key={site.id} className='hover-lift'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-lg'>
                          {site.name || 'Unnamed Site'}
                        </CardTitle>
                        <CardDescription>
                          {site.organisation_name &&
                            `Org: ${site.organisation_name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        {site.address && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Address:
                            </span>
                            <p className='font-medium'>{site.address}</p>
                          </div>
                        )}
                        {site.site_admin_email && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Admin Email:
                            </span>
                            <p className='font-medium'>
                              {site.site_admin_email}
                            </p>
                          </div>
                        )}
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Employees:
                          </span>
                          <Badge variant='outline'>
                            {site.employee_count || 0}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Reports:
                          </span>
                          <Badge variant='outline'>
                            {site.medical_report_count || 0}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Locations Modal */}
        <Dialog
          open={isLocationsModalOpen}
          onOpenChange={setIsLocationsModalOpen}
        >
          <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-purple-600' />
                Locations
              </DialogTitle>
              <DialogDescription>
                View all locations in the system
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {relatedEntitiesLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                  <span className='ml-2'>Loading locations...</span>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {locations.map(location => (
                    <Card key={location.id} className='hover-lift'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-lg'>
                          {location.name || 'Unnamed Location'}
                        </CardTitle>
                        <CardDescription>
                          {location.site_name && `Site: ${location.site_name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        {location.address && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Address:
                            </span>
                            <p className='font-medium'>{location.address}</p>
                          </div>
                        )}
                        {location.manager_name && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Manager:
                            </span>
                            <p className='font-medium'>
                              {location.manager_name}
                            </p>
                          </div>
                        )}
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Employees:
                          </span>
                          <Badge variant='outline'>
                            {location.employee_count || 0}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cost Centers Modal */}
        <Dialog
          open={isCostCentersModalOpen}
          onOpenChange={setIsCostCentersModalOpen}
        >
          <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5 text-orange-600' />
                Cost Centers
              </DialogTitle>
              <DialogDescription>
                View all cost centers in the system
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {relatedEntitiesLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                  <span className='ml-2'>Loading cost centers...</span>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {costCenters.map(costCenter => (
                    <Card key={costCenter.id} className='hover-lift'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-lg'>
                          {costCenter.department || 'Unnamed Department'}
                        </CardTitle>
                        <CardDescription>
                          {costCenter.organisation_name &&
                            `Org: ${costCenter.organisation_name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        {costCenter.cost_center && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Cost Center:
                            </span>
                            <p className='font-medium'>
                              {costCenter.cost_center}
                            </p>
                          </div>
                        )}
                        {costCenter.workplace_address && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Address:
                            </span>
                            <p className='font-medium'>
                              {costCenter.workplace_address}
                            </p>
                          </div>
                        )}
                        {costCenter.manager_name && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Manager:
                            </span>
                            <p className='font-medium'>
                              {costCenter.manager_name}
                            </p>
                          </div>
                        )}
                        {costCenter.manager_email && (
                          <div className='text-sm'>
                            <span className='text-muted-foreground'>
                              Manager Email:
                            </span>
                            <p className='font-medium'>
                              {costCenter.manager_email}
                            </p>
                          </div>
                        )}
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Employees:
                          </span>
                          <Badge variant='outline'>
                            {costCenter.employee_count || 0}
                          </Badge>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            Reports:
                          </span>
                          <Badge variant='outline'>
                            {costCenter.medical_report_count || 0}
                          </Badge>
                        </div>
                        {costCenter.notes_text && (
                          <div className='pt-2 border-t'>
                            <p className='text-sm text-muted-foreground'>
                              {costCenter.notes_text}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
