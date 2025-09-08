'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouteState } from '@/hooks/useRouteState';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Search,
  FileText,
  Calendar,
  Users,
  Stethoscope,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  Edit,
  Save,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';
import ProtectedRoute from '@/components/ProtectedRoute';

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
  user_updated?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FormData {
  [key: string]: any;
}

function ReportsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract filter parameters
  const organizationFilter = searchParams.get('organization');
  const organizationName = searchParams.get('organizationName');
  const siteFilter = searchParams.get('site');
  const siteName = searchParams.get('siteName');
  const costCenterFilter = searchParams.get('costCenter');
  const costCenterName = searchParams.get('costCenterName');
  const returnUrl = searchParams.get('returnUrl');
  const employeeFilter = searchParams.get('employee');

  const [allReports, setAllReports] = useState<MedicalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MedicalReport[]>([]);
  const [displayedReports, setDisplayedReports] = useState<MedicalReport[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(
    null
  );
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [leftPanelWidth, setLeftPanelWidth] = useRouteState<number>(
    'leftPanelWidth',
    40,
    { scope: 'path' }
  ); // percentage
  const [selectedReportId, setSelectedReportId] = useRouteState<string | null>(
    'selectedReportId',
    null,
    { scope: 'path' }
  );
  const [isResizing, setIsResizing] = useState(false);
  const [statusSummary, setStatusSummary] = useState<{ [key: string]: number }>(
    {}
  );

  // Edit states for form sections
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isEditingCardiovascular, setIsEditingCardiovascular] = useState(false);
  const [isEditingMentalHealth, setIsEditingMentalHealth] = useState(false);
  const [isEditingScreening, setIsEditingScreening] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<Partial<MedicalReport>>(
    {}
  );
  const [createFormLoading, setCreateFormLoading] = useState(false);

  // Fetch reports data
  // Fetch all reports data once
  const fetchAllReports = useCallback(async () => {
    try {
      setLoading(true);

      // Add filter if present
      const params = new URLSearchParams({
        page: '1',
        limit: '10000',
      });

      if (employeeFilter) {
        params.set('employee', employeeFilter);
      } else if (organizationFilter) {
        params.set('organization', organizationFilter);
      } else if (siteFilter) {
        params.set('site', siteFilter);
      } else if (costCenterFilter) {
        params.set('costCenter', costCenterFilter);
      }

      const reportsResponse = await fetch(`/api/reports?${params}`);
      const data = await reportsResponse.json();

      setAllReports(data.reports || []);

      // If there's an employee filter, automatically select the first report
      if (employeeFilter && data.reports && data.reports.length > 0) {
        const employeeReport = data.reports[0];
        setSelectedReport(employeeReport);
        // Fetch form data for the selected report
        try {
          setFormLoading(true);
          const response = await fetch(
            `/api/reports/form-data/${employeeReport.id}`
          );
          if (response.ok) {
            const formDataResponse = await response.json();
            setFormData(formDataResponse);
          }
        } catch (error) {
          console.error('Error fetching form data:', error);
        } finally {
          setFormLoading(false);
        }
      } else if (employeeFilter && data.reports && data.reports.length === 0) {
        // No reports found for this employee
        console.log('No reports found for employee:', employeeFilter);
      }

      // Calculate status summary - SIMPLE VERSION
      const summary: { [key: string]: number } = {
        Unassigned: 0,
        'Awaiting Doctor': 0,
        'In Progress': 0,
        Completed: 0,
        Reported: 0,
      };

      (data.reports || []).forEach((report: any) => {
        if (report.doctor === null && report.nurse === null) {
          summary['Unassigned']++;
        } else if (
          report.doctor === null &&
          report.column_5 === 'No' &&
          report.nurse_signature !== null
        ) {
          summary['Awaiting Doctor']++;
        } else if (
          report.doctor_signoff === 'Yes' &&
          report.column_5 === 'No'
        ) {
          summary['Completed']++;
        } else if (report.doctor_signoff === 'Yes') {
          summary['Reported']++;
        } else {
          summary['In Progress']++;
        }
      });

      setStatusSummary(summary);
      console.log('Status Summary:', summary);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationFilter, siteFilter, costCenterFilter, employeeFilter]);

  // Client-side filtering
  const filterReports = useCallback(
    (reports: MedicalReport[], search: string, status: string) => {
      let filtered = reports;

      if (search) {
        filtered = filtered.filter(report => {
          const employeeName =
            `${report.employee_name || ''} ${report.employee_surname || ''}`.trim();
          const doctorName =
            `${report.doctor_name || ''} ${report.doctor_surname || ''}`.trim();
          return (
            employeeName.toLowerCase().includes(search.toLowerCase()) ||
            doctorName.toLowerCase().includes(search.toLowerCase()) ||
            report.workplace_name
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            report.employee_work_email
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
            report.id.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      if (status !== 'all') {
        filtered = filtered.filter(report => {
          if (status === 'signed') return report.doctor_signoff === 'Yes';
          if (status === 'pending') return report.doctor_signoff !== 'Yes';
          return true;
        });
      }

      return filtered;
    },
    []
  );

  // Client-side pagination
  const paginateReports = useCallback(
    (reports: MedicalReport[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = reports.slice(startIndex, endIndex);

      const total = reports.length;
      const totalPages = Math.ceil(total / limit);

      setPagination({
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });

      return paginatedData;
    },
    []
  );

  // Smooth page transition
  const transitionToPage = useCallback(
    async (newPage: number) => {
      setPageTransitioning(true);

      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150));

      const paginated = paginateReports(
        filteredReports,
        newPage,
        pagination.limit
      );
      setDisplayedReports(paginated);

      setPageTransitioning(false);
    },
    [filteredReports, pagination.limit, paginateReports]
  );

  const updateURL = useCallback(
    (page: number, search: string, status: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);

      // Preserve employee filter if present
      if (employeeFilter) {
        params.set('employee', employeeFilter);
      }

      const newURL = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router, employeeFilter]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm, statusFilter);
    transitionToPage(newPage);
  };

  // Initial load
  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports]);

  // Handle filtering when search term, status, or all reports change
  useEffect(() => {
    const filtered = filterReports(allReports, searchTerm, statusFilter);
    setFilteredReports(filtered);

    // Reset to page 1 when filtering changes
    const page =
      searchTerm || statusFilter !== 'all'
        ? 1
        : parseInt(searchParams.get('page') || '1');
    const paginated = paginateReports(filtered, page, pagination.limit);
    setDisplayedReports(paginated);
  }, [
    allReports,
    searchTerm,
    statusFilter,
    filterReports,
    paginateReports,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredReports.length > 0) {
      transitionToPage(page);
    }
  }, [searchParams, pagination.page, filteredReports.length, transitionToPage]);

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

  const getNurseName = (report: MedicalReport) => {
    if (!report.nurse_name && !report.nurse_surname) {
      return 'Unassigned';
    }
    return report.nurse_name && report.nurse_surname
      ? `${report.nurse_name} ${report.nurse_surname}`
      : 'Unknown Nurse';
  };

  const handleReportClick = async (report: MedicalReport) => {
    setSelectedReport(report);
    setSelectedReportId(report.id);
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

  const handleSignReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/sign/${reportId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the selected report's signoff status
        if (selectedReport) {
          setSelectedReport({
            ...selectedReport,
            doctor_signoff: 'Yes',
            date_updated: new Date().toISOString(),
          });
        }

        // Refresh the reports list to show updated status
        await fetchAllReports();

        alert('Report signed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to sign report: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error signing report:', error);
      alert('Error signing report. Please try again.');
    }
  };

  // Modal functions
  const openCreateModal = () => {
    setCreateFormData({});
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      setCreateFormLoading(true);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setCreateFormData({});
        await fetchAllReports();
        alert('Report created successfully!');
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
        alert(`Failed to create report: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Error creating report. Please try again.');
    } finally {
      setCreateFormLoading(false);
    }
  };

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

  useEffect(() => {
    const restore = async () => {
      if (!selectedReport && selectedReportId) {
        const found = allReports.find(r => r.id === selectedReportId);
        if (found) {
          setSelectedReport(found);
          return;
        }
        try {
          const res = await fetch(`/api/reports/${selectedReportId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedReport(data);
          } else {
            setSelectedReportId(null);
          }
        } catch {
          setSelectedReportId(null);
        }
      }
    };
    restore();
  }, [selectedReportId, selectedReport, allReports]);
  if (loading) {
    return (
      <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card>
            <CardContent>
              <PageLoading
                text='Loading Medical Reports'
                subtitle='Fetching medical reports and examination data from OHMS database...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[4vw] py-6 max-w-full overflow-hidden'>
          {/* General Back Button */}
          <div className='mb-6 flex justify-start'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.back()}
              className='flex items-center space-x-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Back</span>
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className='glass-effect mb-4'>
            <CardContent className='p-4'>
              <div className='space-y-4'>
                <div className='flex gap-2'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='text'
                      placeholder='Search by employee, doctor, workplace, email, or report ID...'
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        updateURL(1, e.target.value, statusFilter);
                      }}
                      className='pl-9'
                    />
                  </div>
                  <Button
                    type='button'
                    onClick={() => updateURL(1, searchTerm, statusFilter)}
                    className='hover-lift'
                  >
                    Search
                  </Button>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Filter className='h-4 w-4 text-muted-foreground' />
                    <Select
                      value={statusFilter}
                      onValueChange={value => {
                        setStatusFilter(value);
                        updateURL(1, searchTerm, value);
                      }}
                    >
                      <SelectTrigger className='w-48'>
                        <SelectValue placeholder='Filter by status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Reports</SelectItem>
                        <SelectItem value='signed'>Signed by Doctor</SelectItem>
                        <SelectItem value='pending'>
                          Pending Signature
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditional Back Button and Filters */}
          {(returnUrl ||
            organizationFilter ||
            siteFilter ||
            costCenterFilter) && (
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {returnUrl && (
                  <Button
                    variant='outline'
                    onClick={() => router.push(returnUrl)}
                    className='flex items-center gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
                  >
                    <ArrowLeft className='h-4 w-4' />
                    Back to{' '}
                    {returnUrl.includes('organizations')
                      ? 'Organizations'
                      : returnUrl.includes('sites')
                        ? 'Sites'
                        : 'Cost Centers'}
                  </Button>
                )}

                {organizationFilter && organizationName && (
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='secondary'
                      className='flex items-center gap-2 text-sm px-3 py-1'
                    >
                      <Building2 className='h-4 w-4' />
                      {organizationName}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-4 w-4 p-0 ml-1 hover:bg-transparent'
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (searchTerm) params.set('search', searchTerm);
                          if (statusFilter !== 'all')
                            params.set('status', statusFilter);
                          const newURL = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
                          router.push(newURL);
                        }}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  </div>
                )}

                {siteFilter && siteName && (
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='secondary'
                      className='flex items-center gap-2 text-sm px-3 py-1'
                    >
                      <MapPin className='h-4 w-4' />
                      {siteName}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-4 w-4 p-0 ml-1 hover:bg-transparent'
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (searchTerm) params.set('search', searchTerm);
                          if (statusFilter !== 'all')
                            params.set('status', statusFilter);
                          const newURL = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
                          router.push(newURL);
                        }}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  </div>
                )}

                {costCenterFilter && costCenterName && (
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='secondary'
                      className='flex items-center gap-2 text-sm px-3 py-1'
                    >
                      <DollarSign className='h-4 w-4' />
                      {costCenterName}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-4 w-4 p-0 ml-1 hover:bg-transparent'
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (searchTerm) params.set('search', searchTerm);
                          if (statusFilter !== 'all')
                            params.set('status', statusFilter);
                          const newURL = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
                          router.push(newURL);
                        }}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            className={`resizable-container flex transition-all duration-300 animate-slide-up overflow-hidden ${selectedReport ? '' : 'justify-center'}`}
          >
            {/* Left Panel - Reports Table */}
            <div
              className='space-y-4'
              style={{
                width: selectedReport ? `${leftPanelWidth}%` : '100%',
                maxWidth: selectedReport ? `${leftPanelWidth}%` : '100%',
                paddingRight: selectedReport ? '12px' : '0',
              }}
            >
              {/* Reports Table */}
              <Card className='hover-lift'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-3 heading-montserrat-bold text-2xl'>
                        <FileText className='h-6 w-6 text-teal-600' />
                        <div>
                          <span className='medical-heading'>
                            Medical Reports
                          </span>
                          <span className='ml-2 text-lg font-medium text-gray-500'>
                            ({pagination.total})
                          </span>
                        </div>
                      </CardTitle>
                      <CardDescription className='mt-2 text-base text-gray-600'>
                        Comprehensive executive medical reports and health
                        assessments
                      </CardDescription>
                    </div>
                    <Button
                      className={`hover-lift ${selectedReport ? 'rounded-full w-10 h-10 p-0' : ''}`}
                      title={selectedReport ? 'Add Report' : 'Add Report'}
                      onClick={openCreateModal}
                    >
                      <Plus
                        className={`h-4 w-4 ${selectedReport ? '' : 'mr-2'}`}
                      />
                      {!selectedReport && 'Add Report'}
                    </Button>
                  </div>

                  {/* Status Summary */}
                  <div className='mt-4 grid grid-cols-5 gap-4 text-sm'>
                    <div className='text-center'>
                      <div className='font-semibold text-lg text-gray-600'>
                        {statusSummary['Unassigned'] || 0}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Unassigned
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-lg text-orange-600'>
                        {statusSummary['Awaiting Doctor'] || 0}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Awaiting Doctor
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-lg text-blue-600'>
                        {statusSummary['In Progress'] || 0}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        In Progress
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-lg text-green-600'>
                        {statusSummary['Completed'] || 0}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Completed
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='font-semibold text-lg text-teal-600'>
                        {statusSummary['Reported'] || 0}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Reported
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {displayedReports.length === 0 ? (
                    <div className='text-center py-12'>
                      <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-foreground mb-2'>
                        No reports found
                      </h3>
                      <p className='text-muted-foreground'>
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search criteria or filters.'
                          : 'No Executive Medical reports are available.'}
                      </p>
                    </div>
                  ) : (
                    <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Report ID</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Workplace</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody
                          className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                        >
                          {displayedReports.map(report => (
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
                                  <div className='text-sm text-muted-foreground truncate'>
                                    {report.employee_work_email}
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
                                <div className='flex items-center gap-2'>
                                  <Stethoscope className='h-4 w-4 text-muted-foreground' />
                                  <span
                                    className='text-sm truncate'
                                    title={getDoctorName(report)}
                                  >
                                    {getDoctorName(report)}
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
                                  title={report.workplace_name || 'N/A'}
                                >
                                  {report.workplace_name || 'N/A'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-2'>
                      <div className='text-sm text-muted-foreground'>
                        Showing {(pagination.page - 1) * pagination.limit + 1}{' '}
                        to{' '}
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}{' '}
                        of {pagination.total} results
                      </div>
                      <div className='flex items-center space-x-1 flex-wrap'>
                        {/* First Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.page === 1}
                          className='hover-lift'
                          title='Go to first page'
                        >
                          <ChevronsLeft className='h-4 w-4' />
                          <span
                            className={`${selectedReport && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            First
                          </span>
                        </Button>

                        {/* Previous Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPreviousPage}
                          className='hover-lift'
                          title='Go to previous page'
                        >
                          <ChevronLeft className='h-4 w-4' />
                          <span
                            className={`${selectedReport && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            Previous
                          </span>
                        </Button>

                        {/* Page Numbers */}
                        {Array.from(
                          {
                            length: Math.min(
                              selectedReport && leftPanelWidth < 50 ? 3 : 5,
                              pagination.totalPages
                            ),
                          },
                          (_, i) => {
                            const startPage = Math.max(
                              1,
                              pagination.page -
                                (selectedReport && leftPanelWidth < 50 ? 1 : 2)
                            );
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`reports-page-${page}`}
                                variant={
                                  page === pagination.page
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                onClick={() => handlePageChange(page)}
                                className='hover-lift min-w-[40px]'
                                title={`Go to page ${page}`}
                              >
                                {page}
                              </Button>
                            );
                          }
                        )}

                        {/* Next Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNextPage}
                          className='hover-lift'
                          title='Go to next page'
                        >
                          <span
                            className={`${selectedReport && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
                          >
                            Next
                          </span>
                          <ChevronRight className='h-4 w-4' />
                        </Button>

                        {/* Last Page */}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          disabled={pagination.page === pagination.totalPages}
                          className='hover-lift'
                          title='Go to last page'
                        >
                          <span
                            className={`${selectedReport && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
                          >
                            Last
                          </span>
                          <ChevronsRight className='h-4 w-4' />
                        </Button>
                      </div>
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

            {/* Right Panel - Form Preview */}
            <div
              className={`space-y-4 ${selectedReport ? 'animate-slide-up' : ''}`}
              style={{
                width: selectedReport
                  ? `calc(${100 - leftPanelWidth}% - 0px)`
                  : '0%',
                maxWidth: selectedReport
                  ? `calc(${100 - leftPanelWidth}% - 0px)`
                  : '0%',
                paddingLeft: selectedReport ? '0px' : '0',
                paddingRight: selectedReport ? '0px' : '0',
                overflow: selectedReport ? 'visible' : 'hidden',
              }}
            >
              {selectedReport && (
                <>
                  {/* Form Header Card */}
                  <Card className='glass-effect'>
                    <CardContent className='p-4 max-h-[120px] flex items-center'>
                      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4'>
                        <div className='space-y-2 flex-1'>
                          <CardTitle className='text-2xl flex items-center gap-3 heading-montserrat-bold'>
                            <FileText className='h-6 w-6 text-teal-600' />
                            <span className='medical-heading'>
                              {getEmployeeName(selectedReport)}
                            </span>
                          </CardTitle>
                          <CardDescription className='flex items-center gap-3 lg:ml-14'>
                            <Badge
                              variant='outline'
                              className='font-mono text-xs font-medium'
                            >
                              ID: {selectedReport.id}
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
                            PDF
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedReport(null);
                              setSelectedReportId(null);
                            }}
                            className='hover-lift'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Form Content Card */}
                  <Card className='hover-lift max-h-[575px] overflow-y-auto scrollbar-premium'>
                    <CardContent>
                      {formLoading ? (
                        <div className='text-center py-12'>
                          <div className='relative'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary mx-auto mb-4' />
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <FileText className='h-4 w-4 text-primary/30' />
                            </div>
                          </div>
                          <p className='text-muted-foreground'>
                            Loading form data...
                          </p>
                        </div>
                      ) : formData ? (
                        <div className='space-y-6'>
                          {/* Report Heading */}
                          <Card className='border-primary/20'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <FileText className='h-5 w-5' />
                                Report Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Report ID:
                                  </span>
                                  <span className='font-medium font-mono'>
                                    {formData.report_heading?.report_id}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Doctor:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.report_heading?.doctor_name ||
                                      'Unassigned'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Nurse:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.report_heading?.nurse_name ||
                                      'Unassigned'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Last Updated:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.report_heading?.date_updated
                                      ? new Date(
                                          formData.report_heading.date_updated
                                        ).toLocaleDateString()
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Personal Details */}
                          <Card className='border-green-500/20'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <Users className='h-5 w-5' />
                                Personal Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    ID:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.id}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Name:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.name}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Surname:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.surname}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Gender:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.gender}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    ID/Passport:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.id_or_passport}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Age:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.age}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Height:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.height_cm} cm
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Weight:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.weight_kg} kg
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    BMI:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.bmi}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    BMI Status:
                                  </span>
                                  <Badge variant='outline'>
                                    {formData.personal_details?.bmi_status}
                                  </Badge>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Blood Pressure:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.personal_details?.blood_pressure}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    BP Status:
                                  </span>
                                  <Badge variant='outline'>
                                    {
                                      formData.personal_details
                                        ?.blood_pressure_status
                                    }
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Clinical Examinations */}
                          <Card className='border-teal-200'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <Stethoscope className='h-5 w-5' />
                                Clinical Examinations
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-1 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    General Assessment:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.general_assessment || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Head & Neck (incl Thyroid):
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.head_neck_incl_thyroid || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Cardiovascular:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.cardiovascular || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Respiratory:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.respiratory || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Gastrointestinal:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.gastrointestinal || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Musculoskeletal:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.musculoskeletal || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Neurological:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.neurological || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Skin:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations?.skin ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Hearing Assessment:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.hearing_assessment || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Eyesight Status:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.clinical_examinations
                                      ?.eyesight_status || 'Not Done'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Lab Tests */}
                          <Card className='border-gray-200'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <FileText className='h-5 w-5' />
                                Lab Tests
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Full Blood Count & ESR:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests
                                      ?.full_blood_count_an_esr || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Kidney Function:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.kidney_function ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Liver Enzymes:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.liver_enzymes ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Vitamin D:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.vitamin_d ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Uric Acid:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.uric_acid ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    hs-CRP:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.hs_crp || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Homocysteine:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.homocysteine ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Total Cholesterol:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.total_cholesterol ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Fasting Glucose:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.fasting_glucose ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Insulin Level:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.insulin_level ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Thyroid Stimulating Hormone:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests
                                      ?.thyroid_stimulating_hormone ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Adrenal Response:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.adrenal_response ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Sex Hormones:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.sex_hormones ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    PSA:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.psa || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    HIV:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.lab_tests?.hiv || 'Not Done'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Special Investigations */}
                          <Card className='border-teal-200'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <FileText className='h-5 w-5' />
                                Special Investigations
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Resting ECG:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.resting_ecg || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Stress ECG:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.stress_ecg || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Lung Function:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.lung_function || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Urine Dipstix:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.urine_dipstix || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    KardioFit:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.kardiofit || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    NerveIQ Cardio:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.nerveiq_cardio || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    NerveIQ CNS:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.nerveiq_cns || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    NerveIQ:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations?.nerveiq ||
                                      'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Predicted VO2 Max:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.predicted_vo2_max || 'Not Done'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Body Fat Percentage:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.special_investigations
                                      ?.body_fat_percentage || 'Not Done'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Medical History */}
                          <Card className='border-gray-200'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <FileText className='h-5 w-5' />
                                Medical History
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    High Blood Pressure:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.medical_history
                                        ?.high_blood_pressure
                                    }
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    High Cholesterol:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.high_cholesterol}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Diabetes:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.diabetes}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Asthma:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.asthma}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Epilepsy:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.epilepsy}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Thyroid Disease:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.thyroid_disease}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Inflammatory Bowel Disease:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.medical_history
                                        ?.inflammatory_bowel_disease
                                    }
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Hepatitis:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.hepatitis}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Surgery:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.surgery}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Anxiety or Depression:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.medical_history
                                        ?.anxiety_or_depression
                                    }
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Bipolar Mood Disorder:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.medical_history
                                        ?.bipolar_mood_disorder
                                    }
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    HIV:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.hiv}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    TB:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.tb}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Disability:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.disability}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Cardiac Event in Family:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.medical_history
                                        ?.cardiac_event_in_family
                                    }
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Cancer Family:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.medical_history?.cancer_family}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Allergies */}
                          <Card className='border-teal-200'>
                            <CardHeader className='pb-3'>
                              <div className='flex items-center justify-between'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <AlertCircle className='h-5 w-5' />
                                  Allergies
                                </CardTitle>
                                {selectedReport?.doctor_signoff !== 'Yes' && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      setIsEditingAllergies(!isEditingAllergies)
                                    }
                                    className='hover-lift hover:border hover:border-border'
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-3 gap-x-6 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Environmental:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.allergies?.environmental}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Food:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.allergies?.food}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Medication:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.allergies?.medication}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Current Medication and Supplements */}
                          <Card className='border-gray-200'>
                            <CardHeader className='pb-3'>
                              <div className='flex items-center justify-between'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <FileText className='h-5 w-5' />
                                  Current Medication and Supplements
                                </CardTitle>
                                {selectedReport?.doctor_signoff !== 'Yes' && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      setIsEditingMedication(
                                        !isEditingMedication
                                      )
                                    }
                                    className='hover-lift hover:border hover:border-border'
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-1 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Chronic Medication:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.current_medication_supplements
                                        ?.chronic_medication
                                    }
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Vitamins/Supplements:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.current_medication_supplements
                                        ?.vitamins_supplements
                                    }
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Screening */}
                          <Card className='border-teal-200'>
                            <CardHeader className='pb-3'>
                              <div className='flex items-center justify-between'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <Search className='h-5 w-5' />
                                  Screening
                                </CardTitle>
                                {selectedReport?.doctor_signoff !== 'Yes' && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      setIsEditingScreening(!isEditingScreening)
                                    }
                                    className='hover-lift hover:border hover:border-border'
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Abdominal UltraSound:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.screening?.abdominal_ultrasound}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Colonoscopy:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.screening?.colonoscopy}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Gastroscopy:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.screening?.gastroscopy}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Bone Density Scan:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.screening?.bone_density_scan}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Annual Screening for Prostate:
                                  </span>
                                  <span className='font-medium'>
                                    {
                                      formData.screening
                                        ?.annual_screening_prostate
                                    }
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Mental Health */}
                          <Card className='border-gray-200'>
                            <CardHeader className='pb-3'>
                              <div className='flex items-center justify-between'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <Users className='h-5 w-5' />
                                  Mental Health
                                </CardTitle>
                                {selectedReport?.doctor_signoff !== 'Yes' && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      setIsEditingMentalHealth(
                                        !isEditingMentalHealth
                                      )
                                    }
                                    className='hover-lift hover:border hover:border-border'
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-3 text-sm'>
                              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Anxiety Level:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.mental_health?.anxiety_level ||
                                      'Not assessed'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Energy Level:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.mental_health?.energy_level ||
                                      'Not assessed'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Mood Level:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.mental_health?.mood_level ||
                                      'Not assessed'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Stress Level:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.mental_health?.stress_level ||
                                      'Not assessed'}
                                  </span>
                                </div>
                                <div className='flex gap-2'>
                                  <span className='text-muted-foreground'>
                                    Sleep Rating:
                                  </span>
                                  <span className='font-medium'>
                                    {formData.mental_health?.sleep_rating ||
                                      'Not assessed'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Cardiovascular/Stroke Risk */}
                          <Card className='border-teal-200'>
                            <CardHeader className='pb-3'>
                              <div className='flex items-center justify-between'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <Stethoscope className='h-5 w-5' />
                                  Cardiovascular/Stroke Risk
                                </CardTitle>
                                {selectedReport?.doctor_signoff !== 'Yes' && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      setIsEditingCardiovascular(
                                        !isEditingCardiovascular
                                      )
                                    }
                                    className='hover-lift hover:border hover:border-border'
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className='pt-0'>
                              {/* Risk factors table */}
                              <div className='bg-white rounded border divide-y mb-6'>
                                {formData.cardiovascular_stroke_risk &&
                                  Object.entries({
                                    'Age & Gender':
                                      formData.cardiovascular_stroke_risk
                                        .age_and_gender_risk,
                                    'Blood Pressure':
                                      formData.cardiovascular_stroke_risk
                                        .blood_pressure,
                                    Cholesterol:
                                      formData.cardiovascular_stroke_risk
                                        .cholesterol,
                                    Diabetes:
                                      formData.cardiovascular_stroke_risk
                                        .diabetes,
                                    Obesity:
                                      formData.cardiovascular_stroke_risk
                                        .obesity,
                                    'Waist to Hip Ratio':
                                      formData.cardiovascular_stroke_risk
                                        .waist_to_hip_ratio,
                                    'Overall Diet':
                                      formData.cardiovascular_stroke_risk
                                        .overall_diet,
                                    Exercise:
                                      formData.cardiovascular_stroke_risk
                                        .exercise,
                                    'Alcohol Consumption':
                                      formData.cardiovascular_stroke_risk
                                        .alcohol_consumption,
                                    Smoking:
                                      formData.cardiovascular_stroke_risk
                                        .smoking,
                                    'Stress Level':
                                      formData.cardiovascular_stroke_risk
                                        .stress_level,
                                    'Previous Cardiac Event':
                                      formData.cardiovascular_stroke_risk
                                        .previous_cardiac_event,
                                    'Cardiac History In Family':
                                      formData.cardiovascular_stroke_risk
                                        .cardiac_history_in_family,
                                    'Stroke History In Family':
                                      formData.cardiovascular_stroke_risk
                                        .stroke_history_in_family,
                                    'Reynolds Risk Score':
                                      formData.cardiovascular_stroke_risk
                                        .reynolds_risk_score,
                                  }).map(([factor, status]) => (
                                    <div
                                      key={factor}
                                      className='flex justify-between items-center px-3 py-2 text-sm'
                                    >
                                      <span>{factor}</span>
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                          status === 'At Risk'
                                            ? 'bg-red-100 text-red-800'
                                            : status === 'Medium Risk' ||
                                                status === 'Medium'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : status === 'Low Risk' ||
                                                  status === 'No Risk'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}
                                      >
                                        {status}
                                      </span>
                                    </div>
                                  ))}
                              </div>

                              {/* Risk Distribution Pie Chart */}
                              <div className='bg-white p-6 rounded border'>
                                <h5 className='font-semibold text-gray-900 text-center text-base mb-6'>
                                  Risk Distribution
                                </h5>
                                {(() => {
                                  const riskFactors =
                                    formData.cardiovascular_stroke_risk
                                      ? Object.values({
                                          age_gender:
                                            formData.cardiovascular_stroke_risk
                                              .age_and_gender_risk,
                                          blood_pressure:
                                            formData.cardiovascular_stroke_risk
                                              .blood_pressure,
                                          cholesterol:
                                            formData.cardiovascular_stroke_risk
                                              .cholesterol,
                                          diabetes:
                                            formData.cardiovascular_stroke_risk
                                              .diabetes,
                                          obesity:
                                            formData.cardiovascular_stroke_risk
                                              .obesity,
                                          waist_to_hip_ratio:
                                            formData.cardiovascular_stroke_risk
                                              .waist_to_hip_ratio,
                                          overall_diet:
                                            formData.cardiovascular_stroke_risk
                                              .overall_diet,
                                          exercise:
                                            formData.cardiovascular_stroke_risk
                                              .exercise,
                                          alcohol_consumption:
                                            formData.cardiovascular_stroke_risk
                                              .alcohol_consumption,
                                          smoking:
                                            formData.cardiovascular_stroke_risk
                                              .smoking,
                                          stress_level:
                                            formData.cardiovascular_stroke_risk
                                              .stress_level,
                                          previous_cardiac_event:
                                            formData.cardiovascular_stroke_risk
                                              .previous_cardiac_event,
                                          cardiac_history_in_family:
                                            formData.cardiovascular_stroke_risk
                                              .cardiac_history_in_family,
                                          stroke_history_in_family:
                                            formData.cardiovascular_stroke_risk
                                              .stroke_history_in_family,
                                          reynolds_risk_score:
                                            formData.cardiovascular_stroke_risk
                                              .reynolds_risk_score,
                                        })
                                      : [];

                                  const riskCounts = riskFactors.reduce(
                                    (acc: Record<string, number>, risk) => {
                                      const normalizedRisk =
                                        risk === 'No Risk' ||
                                        risk === 'Low Risk'
                                          ? 'Low Risk'
                                          : risk === 'Medium Risk' ||
                                              risk === 'Medium'
                                            ? 'Medium Risk'
                                            : 'At Risk';
                                      acc[normalizedRisk] =
                                        (acc[normalizedRisk] || 0) + 1;
                                      return acc;
                                    },
                                    {}
                                  );

                                  const total = Object.values(
                                    riskCounts
                                  ).reduce(
                                    (sum: number, count: number) => sum + count,
                                    0
                                  );
                                  const colors = {
                                    'Low Risk': '#0F766E',
                                    'Medium Risk': '#374151',
                                    'At Risk': '#6B7280',
                                  };

                                  // Create slices for pie chart
                                  const slices = Object.entries(riskCounts)
                                    .map(([status, count]) => ({
                                      status,
                                      count,
                                      percentage: Math.round(
                                        ((count as number) /
                                          (total as number)) *
                                          100
                                      ),
                                      color:
                                        colors[status as keyof typeof colors] ||
                                        '#6B7280',
                                    }))
                                    .filter(
                                      slice => (slice.count as number) > 0
                                    );

                                  // Sort by count descending
                                  slices.sort(
                                    (a, b) =>
                                      (b.count as number) - (a.count as number)
                                  );

                                  return (
                                    <div className='flex justify-center items-center gap-8'>
                                      {/* Pie Chart Visual */}
                                      <div className='relative'>
                                        <svg
                                          width='240'
                                          height='240'
                                          className='transform -rotate-90'
                                        >
                                          {(() => {
                                            let cumulativeAngle = 0;
                                            const radius = 100;
                                            const centerX = 120;
                                            const centerY = 120;

                                            return slices.map(
                                              (
                                                { status, percentage, color },
                                                index
                                              ) => {
                                                const angle =
                                                  (percentage / 100) * 360;
                                                const startAngle =
                                                  cumulativeAngle;
                                                const endAngle =
                                                  cumulativeAngle + angle;

                                                const startAngleRad =
                                                  (startAngle * Math.PI) / 180;
                                                const endAngleRad =
                                                  (endAngle * Math.PI) / 180;

                                                const x1 =
                                                  centerX +
                                                  radius *
                                                    Math.cos(startAngleRad);
                                                const y1 =
                                                  centerY +
                                                  radius *
                                                    Math.sin(startAngleRad);
                                                const x2 =
                                                  centerX +
                                                  radius *
                                                    Math.cos(endAngleRad);
                                                const y2 =
                                                  centerY +
                                                  radius *
                                                    Math.sin(endAngleRad);

                                                const largeArcFlag =
                                                  angle > 180 ? 1 : 0;

                                                const pathData = [
                                                  `M ${centerX} ${centerY}`,
                                                  `L ${x1} ${y1}`,
                                                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                  'Z',
                                                ].join(' ');

                                                cumulativeAngle += angle;

                                                return (
                                                  <path
                                                    key={status}
                                                    d={pathData}
                                                    fill={color}
                                                    stroke='#ffffff'
                                                    strokeWidth='2'
                                                  />
                                                );
                                              }
                                            );
                                          })()}
                                        </svg>
                                      </div>

                                      {/* Legend */}
                                      <div className='space-y-3'>
                                        {slices.map(
                                          ({
                                            status,
                                            count,
                                            percentage,
                                            color,
                                          }) => (
                                            <div
                                              key={status}
                                              className='flex items-center gap-3'
                                            >
                                              <div
                                                className='w-4 h-4 rounded-full'
                                                style={{
                                                  backgroundColor: color,
                                                }}
                                              ></div>
                                              <div className='flex flex-col'>
                                                <span className='font-medium text-gray-900'>
                                                  {status}
                                                </span>
                                                <span className='text-sm text-gray-600'>
                                                  {count as number} factors (
                                                  {percentage}%)
                                                </span>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Notes and Recommendations */}
                          {formData.notes_recommendations
                            ?.recommendation_text && (
                            <Card className='border-gray-200'>
                              <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <FileText className='h-5 w-5' />
                                  Notes and Recommendations
                                </CardTitle>
                              </CardHeader>
                              <CardContent className='pt-0'>
                                <div className='text-sm'>
                                  <p className='text-gray-700'>
                                    {
                                      formData.notes_recommendations
                                        .recommendation_text
                                    }
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Men's Health - Only show for male employees */}
                          {formData.mens_health?.recommendation_text && (
                            <Card className='border-teal-200'>
                              <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <Users className='h-5 w-5' />
                                  Men's Health
                                </CardTitle>
                              </CardHeader>
                              <CardContent className='pt-0'>
                                <div className='text-sm'>
                                  <p className='text-gray-700'>
                                    {formData.mens_health.recommendation_text}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Women's Health - Only show for female employees */}
                          {formData.womens_health?.recommendation_text && (
                            <Card className='border-teal-200'>
                              <CardHeader className='pb-3'>
                                <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                  <Users className='h-5 w-5' />
                                  Women's Health
                                </CardTitle>
                              </CardHeader>
                              <CardContent className='pt-0'>
                                <div className='text-sm'>
                                  <p className='text-gray-700'>
                                    {formData.womens_health.recommendation_text}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Overview */}
                          {formData.overview?.notes_text && (
                            <Card className='border-gray-200'>
                              <CardHeader className='pb-3'>
                                <div className='flex items-center justify-between'>
                                  <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                    <FileText className='h-5 w-5' />
                                    Overview
                                  </CardTitle>
                                  {selectedReport?.doctor_signoff !== 'Yes' && (
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        setIsEditingOverview(!isEditingOverview)
                                      }
                                      className='hover-lift hover:border hover:border-border'
                                    >
                                      <Edit className='h-4 w-4' />
                                    </Button>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className='pt-0'>
                                <div className='text-sm'>
                                  <p className='text-gray-700'>
                                    {formData.overview.notes_text}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Important Information and Disclaimer */}
                          <Card className='border-gray-200 border-l-4 border-l-gray-400'>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-lg flex items-center gap-2 section-heading heading-montserrat'>
                                <AlertCircle className='h-5 w-5' />
                                Important Information and Disclaimer
                              </CardTitle>
                            </CardHeader>
                            <CardContent className='pt-0'>
                              <div className='text-sm text-gray-700'>
                                <p className='whitespace-pre-line'>
                                  {
                                    formData.important_information_disclaimer
                                      ?.disclaimer_text
                                  }
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Sign Button - Only show when status is pending */}
                          {selectedReport?.doctor_signoff !== 'Yes' && (
                            <div className='pt-6 border-t border-border'>
                              <div className='flex justify-center'>
                                <Button
                                  onClick={() =>
                                    handleSignReport(selectedReport.id)
                                  }
                                  className='hover-lift px-8 py-3'
                                  size='lg'
                                >
                                  <FileText className='h-5 w-5 mr-2' />
                                  Sign Report
                                </Button>
                              </div>
                              <p className='text-center text-sm text-muted-foreground mt-2'>
                                Click to electronically sign this medical report
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <div className='flex flex-col items-center justify-center space-y-4'>
                            <AlertCircle className='h-12 w-12 text-muted-foreground' />
                            <div>
                              <h3 className='text-lg font-medium text-foreground mb-2'>
                                Failed to load form data
                              </h3>
                              <p className='text-muted-foreground'>
                                Please try selecting the report again.
                              </p>
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
                <Label htmlFor='employee_id'>Employee</Label>
                <Select
                  value={createFormData.employee_id || ''}
                  onValueChange={value =>
                    setCreateFormData({ ...createFormData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select employee' />
                  </SelectTrigger>
                  <SelectContent>
                    {/* You'll need to fetch employees list */}
                    <SelectItem value='employee1'>Employee 1</SelectItem>
                    <SelectItem value='employee2'>Employee 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='doctor'>Doctor</Label>
                <Select
                  value={createFormData.doctor || ''}
                  onValueChange={value =>
                    setCreateFormData({ ...createFormData, doctor: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select doctor' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='doctor1'>Dr. Smith</SelectItem>
                    <SelectItem value='doctor2'>Dr. Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='nurse'>Nurse</Label>
                <Select
                  value={createFormData.nurse || ''}
                  onValueChange={value =>
                    setCreateFormData({ ...createFormData, nurse: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select nurse' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='nurse1'>Nurse Wilson</SelectItem>
                    <SelectItem value='nurse2'>Nurse Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='workplace'>Workplace</Label>
                <Select
                  value={createFormData.workplace || ''}
                  onValueChange={value =>
                    setCreateFormData({ ...createFormData, workplace: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select workplace' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='workplace1'>Main Office</SelectItem>
                    <SelectItem value='workplace2'>Branch Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Report Type</Label>
                <Select
                  value={createFormData.type || ''}
                  onValueChange={value =>
                    setCreateFormData({ ...createFormData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select report type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='executive'>Executive Medical</SelectItem>
                    <SelectItem value='routine'>Routine Checkup</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value='comprehensive'>Comprehensive</SelectItem>
                    <SelectItem value='basic'>Basic</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder='Enter report notes...'
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
                  placeholder='Enter health recommendations...'
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createFormLoading}>
                {createFormLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className='mr-2 h-4 w-4' />
                    Create Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card className='w-96'>
            <CardContent>
              <PageLoading
                text='Initializing Reports'
                subtitle='Setting up medical reports management system...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  );
}
