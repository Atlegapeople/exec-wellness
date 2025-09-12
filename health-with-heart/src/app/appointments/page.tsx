'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouteState } from '@/hooks/useRouteState';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';
import { useRouter, useSearchParams } from 'next/navigation';
import { Appointment } from '@/types';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Calendar,
  Clock,
  User,
  FileText,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  Edit,
  Plus,
  Save,
  Loader2,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';

interface AppointmentWithEmployee extends Appointment {
  employee_name?: string;
  employee_surname?: string;
  employee_email?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function AppointmentsPageContent() {
  const router = useRouter();
  const goBack = useBreadcrumbBack();
  const searchParams = useSearchParams();

  // Extract employee filter from URL
  const employeeFilter = searchParams.get('employee');

  console.log('AppointmentsPage render - employeeFilter:', employeeFilter);

  const [allAppointments, setAllAppointments] = useState<
    AppointmentWithEmployee[]
  >([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    AppointmentWithEmployee[]
  >([]);
  const [displayedAppointments, setDisplayedAppointments] = useState<
    AppointmentWithEmployee[]
  >([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 29,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithEmployee | null>(null);
  const [leftWidth, setLeftWidth] = useRouteState<number>(
    'leftPanelWidth',
    40,
    { scope: 'path' }
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useRouteState<
    string | null
  >('selectedAppointmentId', null, { scope: 'path' });
  const [isResizing, setIsResizing] = useState(false);
  const [animationLoading, setAnimationLoading] = useState(true);
  const [calendarAnimationData, setCalendarAnimationData] = useState(null);

  // Edit states for each section
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [isEditingCalendar, setIsEditingCalendar] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] =
    useState<AppointmentWithEmployee | null>(null);

  // Load calendar animation
  useEffect(() => {
    fetch('/animation/calendar.json')
      .then(response => response.json())
      .then(data => {
        setCalendarAnimationData(data);
        setAnimationLoading(false);
      })
      .catch(error => {
        console.error('Error loading calendar animation:', error);
        setAnimationLoading(false);
      });
  }, []);

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // CRUD functions
  const handleCreate = async () => {
    try {
      setFormLoading(true);

      // Validate required fields
      if (!formData.employee_id) {
        toast.error('Please select an employee');
        return;
      }
      if (!formData.type) {
        toast.error('Please select an appointment type');
        return;
      }
      if (!formData.start_date) {
        toast.error('Please select a start date');
        return;
      }

      // Log the data being sent for debugging
      console.log('Creating appointment with data:', formData);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointment created successfully:', result);
        setIsCreateModalOpen(false);
        setFormData({});
        await fetchAllAppointments();
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
        toast.error(
          `Failed to create appointment: ${error.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(
        'Error creating appointment. Please check the console for details.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const openDeleteModal = (appointment: AppointmentWithEmployee) => {
    setDeletingAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingAppointment) return;

    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/appointments/${deletingAppointment.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setDeletingAppointment(null);
        if (selectedAppointment?.id === deletingAppointment.id) {
          setSelectedAppointment(null);
          setSelectedAppointmentId(null);
        }
        await fetchAllAppointments();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Fetch all appointments data once
  const fetchAllAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL('/api/appointments', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '10000'); // Get all appointments

      // Add employee filter if present
      if (employeeFilter) {
        url.searchParams.set('employee', employeeFilter);
        console.log('Fetching appointments for employee:', employeeFilter);
      }

      console.log('Fetching appointments from URL:', url.toString());
      const response = await fetch(url.toString());
      const data = await response.json();

      console.log('Appointments API response:', data);
      setAllAppointments(data.appointments || []);

      // If there's an employee filter, automatically select the first appointment
      if (employeeFilter && data.appointments && data.appointments.length > 0) {
        const employeeAppointment = data.appointments[0];
        console.log('Auto-selecting appointment:', employeeAppointment);
        setSelectedAppointment(employeeAppointment);
        setSelectedAppointmentId(employeeAppointment.id);
      } else if (
        employeeFilter &&
        data.appointments &&
        data.appointments.length === 0
      ) {
        // No appointments found for this employee, open the create modal with employee ID pre-filled
        console.log('No appointments found for employee, opening create modal');
        console.log('Setting form data with employee_id:', employeeFilter);
        setFormData({ employee_id: employeeFilter });
        setIsCreateModalOpen(true);
      } else if (employeeFilter) {
        console.log('No appointments found for employee:', employeeFilter);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, setSelectedAppointmentId]);

  // Client-side filtering
  const filterAppointments = useCallback(
    (appointments: AppointmentWithEmployee[], search: string) => {
      if (!search) return appointments;

      return appointments.filter(appointment => {
        const fullName =
          `${appointment.employee_name} ${appointment.employee_surname}`.toLowerCase();
        const searchLower = search.toLowerCase();

        return (
          fullName.includes(searchLower) ||
          appointment.type?.toLowerCase().includes(searchLower) ||
          appointment.notes?.toLowerCase().includes(searchLower) ||
          appointment.employee_email?.toLowerCase().includes(searchLower)
        );
      });
    },
    []
  );

  // Client-side pagination
  const paginateAppointments = useCallback(
    (appointments: AppointmentWithEmployee[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = appointments.slice(startIndex, endIndex);

      const total = appointments.length;
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

      const paginated = paginateAppointments(
        filteredAppointments,
        newPage,
        pagination.limit
      );
      setDisplayedAppointments(paginated);

      setPageTransitioning(false);
    },
    [filteredAppointments, pagination.limit, paginateAppointments]
  );

  // Initial load
  useEffect(() => {
    fetchAllAppointments();
    fetchEmployees();
  }, [fetchAllAppointments]);

  // Handle filtering when search term or all appointments change
  useEffect(() => {
    const filtered = filterAppointments(allAppointments, searchTerm);
    setFilteredAppointments(filtered);

    // Reset to page 1 when filtering changes
    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateAppointments(filtered, page, pagination.limit);
    setDisplayedAppointments(paginated);
  }, [
    allAppointments,
    searchTerm,
    filterAppointments,
    paginateAppointments,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredAppointments.length > 0) {
      transitionToPage(page);
    }
  }, [
    searchParams,
    pagination.page,
    filteredAppointments.length,
    transitionToPage,
  ]);

  // Watch for URL changes and refetch if employee filter changes
  useEffect(() => {
    const currentEmployeeFilter = searchParams.get('employee');
    console.log(
      'URL change detected - current:',
      currentEmployeeFilter,
      'previous:',
      employeeFilter
    );
    if (currentEmployeeFilter !== employeeFilter) {
      console.log('URL changed - refetching appointments');
      fetchAllAppointments();
    }
  }, [searchParams, employeeFilter, fetchAllAppointments]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      employeeFilter,
      selectedAppointment: selectedAppointment?.id,
      allAppointments: allAppointments.length,
      loading,
    });
  }, [
    employeeFilter,
    selectedAppointment?.id,
    allAppointments.length,
    loading,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1, searchTerm);
  };

  const updateURL = useCallback(
    (page: number, search: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);

      // Preserve employee filter if present
      if (employeeFilter) {
        params.set('employee', employeeFilter);
      }

      const newURL = `/appointments${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router, employeeFilter]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleAppointmentClick = (appointment: AppointmentWithEmployee) => {
    setSelectedAppointment(appointment);
    setSelectedAppointmentId(appointment.id);
  };

  // Hide right panel on cold load without an employee filter,
  // but preserve if a previous selection exists for this route
  useEffect(() => {
    if (!employeeFilter) {
      if (!selectedAppointmentId) {
        setSelectedAppointment(null);
        setSelectedAppointmentId(null);
      }
    }
  }, [employeeFilter, selectedAppointmentId, setSelectedAppointmentId]);

  // Restore selected appointment when data changes
  useEffect(() => {
    const restore = async () => {
      if (!selectedAppointment && selectedAppointmentId) {
        const found = allAppointments.find(a => a.id === selectedAppointmentId);
        if (found) {
          setSelectedAppointment(found);
          return;
        }
        try {
          const res = await fetch(`/api/appointments/${selectedAppointmentId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedAppointment(data);
          } else {
            setSelectedAppointmentId(null);
          }
        } catch {
          setSelectedAppointmentId(null);
        }
      }
    };
    restore();
  }, [
    selectedAppointmentId,
    selectedAppointment,
    allAppointments,
    setSelectedAppointmentId,
  ]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'N/A';
    return time;
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.appointments-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(constrainedWidth);
    },
    [isResizing, setLeftWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (loading) {
    return (
      // <ProtectedRoute>
      <DashboardLayout>
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
          <Card>
            <CardContent>
              <PageLoading
                text='Loading Appointments'
                subtitle='Fetching medical appointment data from OHMS database...'
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      // </ProtectedRoute>
    );
  }

  return (
    // <ProtectedRoute>
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        {/* Back Button */}
        <div className='mb-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={goBack}
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back</span>
          </Button>
        </div>

        {/* Search */}
        <Card className='glass-effect my-6'>
          <CardContent className='p-4'>
            <form onSubmit={handleSearch} className='flex gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search by type, employee name, notes...'
                  className='pl-9'
                />
              </div>
              <Button type='submit' className='hover-lift'>
                Search
              </Button>
              {searchTerm && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setSearchTerm('');
                    updateURL(1, '');
                  }}
                  className='hover-lift'
                >
                  Clear
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <div className='appointments-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Appointments Table */}
          <div
            className='space-y-4 animate-slide-up'
            style={{
              width: selectedAppointment ? `${leftWidth}%` : '100%',
              maxWidth: selectedAppointment ? `${leftWidth}%` : '100%',
              paddingRight: selectedAppointment ? '12px' : '0',
            }}
          >
            {/* Appointments Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                      <CalendarDays className='h-6 w-6' />
                      Appointments ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                      Medical appointment scheduling and records
                    </CardDescription>
                  </div>
                  <Button
                    onClick={openCreateModal}
                    className={`hover-lift ${selectedAppointment ? 'rounded-full p-2' : ''}`}
                    title={selectedAppointment ? 'Add New Appointment' : ''}
                  >
                    <Plus className='h-4 w-4' />
                    {!selectedAppointment && (
                      <span className='ml-2'>Add New Appointment</span>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {displayedAppointments.length === 0 ? (
                  <div className='text-center py-12'>
                    <CalendarDays className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No appointments found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No appointments available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[600px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedAppointments.map(appointment => (
                          <TableRow
                            key={appointment.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedAppointment?.id === appointment.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {appointment.employee_name}{' '}
                                  {appointment.employee_surname}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {appointment.employee_email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className='text-xs'>
                                {appointment.type || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatDate(appointment.start_date)}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatTime(appointment.start_time)} -{' '}
                              {formatTime(appointment.end_time)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  appointment.report_id
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {appointment.report_id
                                  ? 'With Report'
                                  : 'Scheduled'}
                              </Badge>
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
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
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
                          className={`${selectedAppointment && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                          className={`${selectedAppointment && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          Previous
                        </span>
                      </Button>

                      {/* Page Numbers */}
                      {Array.from(
                        {
                          length: Math.min(
                            selectedAppointment && leftWidth < 50 ? 3 : 5,
                            pagination.totalPages
                          ),
                        },
                        (_, i) => {
                          const startPage = Math.max(
                            1,
                            pagination.page -
                              (selectedAppointment && leftWidth < 50 ? 1 : 2)
                          );
                          const page = startPage + i;
                          if (page > pagination.totalPages) return null;

                          return (
                            <Button
                              key={`appointments-page-${page}`}
                              variant={
                                page === pagination.page ? 'default' : 'outline'
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
                          className={`${selectedAppointment && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
                        >
                          Next
                        </span>
                        <ChevronRight className='h-4 w-4' />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className='hover-lift'
                        title='Go to last page'
                      >
                        <span
                          className={`${selectedAppointment && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
          {selectedAppointment && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Appointment Details */}
          {selectedAppointment && (
            <div
              className='space-y-4 animate-slide-up'
              style={{
                width: selectedAppointment ? `${100 - leftWidth}%` : '0',
                maxWidth: selectedAppointment ? `${100 - leftWidth}%` : '0',
                paddingLeft: '12px',
                overflow: 'visible',
              }}
            >
              <Card className='glass-effect max-h-screen overflow-y-auto scrollbar-premium'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedAppointment.type}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <Badge variant='outline'>
                          {selectedAppointment.employee_name}{' '}
                          {selectedAppointment.employee_surname}
                        </Badge>
                        <Badge
                          variant={
                            selectedAppointment.report_id
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {selectedAppointment.report_id
                            ? 'With Report'
                            : 'Scheduled'}
                        </Badge>
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedAppointment.updated_by_name || 'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {formatDateTime(selectedAppointment.date_updated)}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openDeleteModal(selectedAppointment)}
                        className='hover-lift text-destructive hover:text-destructive hover:bg-destructive/10'
                        title='Delete appointment'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSelectedAppointment(null);
                          setSelectedAppointmentId(null);
                        }}
                        className='hover-lift'
                        title='Close details'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Report Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      Report Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Report ID:
                        </span>
                        {selectedAppointment.report_id ? (
                          <Badge variant='default'>
                            {selectedAppointment.report_id}
                          </Badge>
                        ) : (
                          <Badge variant='secondary'>No Report</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Employee Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <User className='h-4 w-4' />
                      Employee Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Name:
                        </span>
                        <span className='font-medium'>
                          {selectedAppointment.employee_name}{' '}
                          {selectedAppointment.employee_surname}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Email:
                        </span>
                        <span className='font-medium text-xs break-all'>
                          {selectedAppointment.employee_email || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Employee ID:
                        </span>
                        <Badge variant='outline'>
                          {selectedAppointment.employee_id}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Appointment Details */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        Appointment Details
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingAppointment && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingAppointment(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingAppointment ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() =>
                            setIsEditingAppointment(!isEditingAppointment)
                          }
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingAppointment ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Type:
                        </span>
                        <Badge variant='outline'>
                          {selectedAppointment.type}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Start Date:
                        </span>
                        {isEditingAppointment ? (
                          <Input
                            type='date'
                            defaultValue={
                              selectedAppointment.start_date
                                ? new Date(selectedAppointment.start_date)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            className='w-40'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatDate(selectedAppointment.start_date)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          End Date:
                        </span>
                        {isEditingAppointment ? (
                          <Input
                            type='date'
                            defaultValue={
                              selectedAppointment.end_date
                                ? new Date(selectedAppointment.end_date)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            className='w-40'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatDate(selectedAppointment.end_date)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Start Time:
                        </span>
                        {isEditingAppointment ? (
                          <Input
                            type='time'
                            defaultValue={selectedAppointment.start_time || ''}
                            className='w-32'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatTime(selectedAppointment.start_time)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          End Time:
                        </span>
                        {isEditingAppointment ? (
                          <Input
                            type='time'
                            defaultValue={selectedAppointment.end_time || ''}
                            className='w-32'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatTime(selectedAppointment.end_time)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Start DateTime:
                        </span>
                        {isEditingAppointment ? (
                          <Input
                            type='datetime-local'
                            defaultValue={
                              selectedAppointment.start_datetime
                                ? new Date(selectedAppointment.start_datetime)
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                            }
                            className='w-48'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatDateTime(selectedAppointment.start_datetime)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          End DateTime:
                        </span>
                        {isEditingAppointment ? (
                          <Input
                            type='datetime-local'
                            defaultValue={
                              selectedAppointment.end_datetime
                                ? new Date(selectedAppointment.end_datetime)
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                            }
                            className='w-48'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatDateTime(selectedAppointment.end_datetime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Calendar Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <MapPin className='h-4 w-4' />
                        Calendar Information
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingCalendar && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingCalendar(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingCalendar ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() =>
                            setIsEditingCalendar(!isEditingCalendar)
                          }
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingCalendar ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Calendar ID:
                        </span>
                        {isEditingCalendar ? (
                          <Input
                            defaultValue={selectedAppointment.calander_id || ''}
                            className='w-48'
                            placeholder='Calendar ID'
                          />
                        ) : (
                          <span className='font-medium'>
                            {selectedAppointment.calander_id || 'N/A'}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Calendar Link:
                        </span>
                        {isEditingCalendar ? (
                          <Input
                            defaultValue={
                              selectedAppointment.calander_link || ''
                            }
                            className='flex-1'
                            placeholder='Calendar link URL'
                          />
                        ) : selectedAppointment.calander_link ? (
                          <a
                            href={selectedAppointment.calander_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:underline text-xs break-all'
                          >
                            View in Calendar
                          </a>
                        ) : (
                          <span className='text-muted-foreground'>No link</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* System Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        Record Information
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingRecord && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingRecord(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingRecord ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() => setIsEditingRecord(!isEditingRecord)}
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingRecord ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created:
                        </span>
                        {isEditingRecord ? (
                          <Input
                            type='datetime-local'
                            defaultValue={
                              selectedAppointment.date_created
                                ? new Date(selectedAppointment.date_created)
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                            }
                            className='w-48'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatDateTime(selectedAppointment.date_created)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created By:
                        </span>
                        {isEditingRecord ? (
                          <Input
                            defaultValue={
                              selectedAppointment.created_by_name ||
                              selectedAppointment.user_created ||
                              ''
                            }
                            className='w-48'
                            placeholder='Created by'
                          />
                        ) : (
                          <span className='font-medium'>
                            {selectedAppointment.created_by_name ||
                              selectedAppointment.user_created}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        {isEditingRecord ? (
                          <Input
                            type='datetime-local'
                            defaultValue={
                              selectedAppointment.date_updated
                                ? new Date(selectedAppointment.date_updated)
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                            }
                            className='w-48'
                          />
                        ) : (
                          <span className='font-medium'>
                            {formatDateTime(selectedAppointment.date_updated)}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Updated By:
                        </span>
                        {isEditingRecord ? (
                          <Input
                            defaultValue={
                              selectedAppointment.updated_by_name ||
                              selectedAppointment.user_updated ||
                              ''
                            }
                            className='w-48'
                            placeholder='Updated by'
                          />
                        ) : (
                          <span className='font-medium'>
                            {selectedAppointment.updated_by_name ||
                              selectedAppointment.user_updated}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                            Notes
                          </h3>
                          <div className='flex gap-2'>
                            {isEditingNotes && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='hover-lift'
                                onClick={() => setIsEditingNotes(false)}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant={isEditingNotes ? 'default' : 'outline'}
                              size='sm'
                              className='hover-lift'
                              onClick={() => setIsEditingNotes(!isEditingNotes)}
                            >
                              <Edit className='h-3 w-3 mr-1' />
                              {isEditingNotes ? 'Save' : 'Edit'}
                            </Button>
                          </div>
                        </div>
                        {isEditingNotes ? (
                          <textarea
                            defaultValue={selectedAppointment.notes || ''}
                            className='w-full p-3 text-sm bg-background border border-input rounded-lg resize-none min-h-[100px]'
                            placeholder='Enter appointment notes...'
                          />
                        ) : (
                          <div className='text-sm p-3 bg-muted rounded-lg'>
                            {selectedAppointment.notes}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new medical appointment for an employee.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id'>Employee</Label>
                <Select
                  value={formData.employee_id || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, employee_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select employee' />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} {employee.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Appointment Type</Label>
                <Select
                  value={formData.type || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select appointment type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='General Checkup'>
                      General Checkup
                    </SelectItem>
                    <SelectItem value='Follow-up'>Follow-up</SelectItem>
                    <SelectItem value='Specialist Consultation'>
                      Specialist Consultation
                    </SelectItem>
                    <SelectItem value='Emergency'>Emergency</SelectItem>
                    <SelectItem value='Pre-employment'>
                      Pre-employment
                    </SelectItem>
                    <SelectItem value='Annual Physical'>
                      Annual Physical
                    </SelectItem>
                    <SelectItem value='Vaccination'>Vaccination</SelectItem>
                    <SelectItem value='Other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='start_date'>Start Date</Label>
                <Input
                  id='start_date'
                  type='date'
                  value={
                    formData.start_date
                      ? new Date(formData.start_date)
                          .toISOString()
                          .split('T')[0]
                      : ''
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      start_date: new Date(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='end_date'>End Date</Label>
                <Input
                  id='end_date'
                  type='date'
                  value={
                    formData.end_date
                      ? new Date(formData.end_date).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      end_date: new Date(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='start_time'>Start Time</Label>
                <Input
                  id='start_time'
                  type='time'
                  value={formData.start_time || ''}
                  onChange={e =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='end_time'>End Time</Label>
                <Input
                  id='end_time'
                  type='time'
                  value={formData.end_time || ''}
                  onChange={e =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='start_datetime'>Start DateTime</Label>
                <Input
                  id='start_datetime'
                  type='datetime-local'
                  value={
                    formData.start_datetime
                      ? new Date(formData.start_datetime)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      start_datetime: new Date(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='end_datetime'>End DateTime</Label>
                <Input
                  id='end_datetime'
                  type='datetime-local'
                  value={
                    formData.end_datetime
                      ? new Date(formData.end_datetime)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      end_datetime: new Date(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='report_id'>Report ID (Optional)</Label>
                <Input
                  id='report_id'
                  value={formData.report_id || ''}
                  onChange={e =>
                    setFormData({ ...formData, report_id: e.target.value })
                  }
                  placeholder='Link to medical report'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='calander_id'>Calendar ID (Optional)</Label>
                <Input
                  id='calander_id'
                  value={formData.calander_id || ''}
                  onChange={e =>
                    setFormData({ ...formData, calander_id: e.target.value })
                  }
                  placeholder='Calendar identifier'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='calander_link'>Calendar Link (Optional)</Label>
                <Input
                  id='calander_link'
                  value={formData.calander_link || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      calander_link: e.target.value,
                    })
                  }
                  placeholder='Calendar URL'
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={formData.notes || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder='Additional notes about the appointment...'
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
              <Button onClick={handleCreate} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Create Appointment
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
                <Trash2 className='h-5 w-5 text-destructive' />
                Delete Appointment
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this appointment for{' '}
                <span className='font-medium'>
                  {deletingAppointment
                    ? `${deletingAppointment.employee_name} ${deletingAppointment.employee_surname}`
                    : ''}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete Appointment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    // </ProtectedRoute>
  );
}
export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card className='w-96'>
            <CardContent>
              <PageLoading
                text='Initializing Appointments'
                subtitle='Setting up appointment management system...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <AppointmentsPageContent />
    </Suspense>
  );
}
