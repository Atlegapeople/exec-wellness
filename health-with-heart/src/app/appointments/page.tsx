'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
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
  CheckCircle,
  Loader2,
} from 'lucide-react';

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

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract employee ID from URL if present
  const employeeId = searchParams.get('employee');

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
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // Section-specific edit states
  const [isEmployeeEditOpen, setIsEmployeeEditOpen] = useState(false);
  const [isAppointmentEditOpen, setIsAppointmentEditOpen] = useState(false);
  const [isReportEditOpen, setIsReportEditOpen] = useState(false);
  const [isCalendarEditOpen, setIsCalendarEditOpen] = useState(false);
  const [isNotesEditOpen, setIsNotesEditOpen] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all appointments data once
  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/appointments', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '10000'); // Get all appointments

      const response = await fetch(url.toString());
      const data = await response.json();

      setAllAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Helper function to find appointment by employee ID
  // If multiple appointments exist for the same employee, select the first one
  const findAppointmentByEmployeeId = (
    appointments: AppointmentWithEmployee[],
    employeeId: string
  ): AppointmentWithEmployee | null => {
    const employeeAppointments = appointments.filter(
      appointment => appointment.employee_id === employeeId
    );

    if (employeeAppointments.length === 0) {
      return null;
    }

    // If multiple appointments exist, select the first one
    return employeeAppointments[0];
  };

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
  }, []);

  // Auto-select appointment when employeeId is in URL and appointments are loaded
  useEffect(() => {
    if (employeeId && allAppointments.length > 0 && !selectedAppointment) {
      const appointmentToSelect = findAppointmentByEmployeeId(
        allAppointments,
        employeeId
      );
      if (appointmentToSelect) {
        setSelectedAppointment(appointmentToSelect);
      }
    }
  }, [employeeId, allAppointments, selectedAppointment]);

  // Handle filtering when search term or all appointments change
  useEffect(() => {
    const filtered = filterAppointments(allAppointments, searchTerm);
    setFilteredAppointments(filtered);

    // Reset to page 1 when filtering changes
    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateAppointments(filtered, page, pagination.limit);
    setDisplayedAppointments(paginated);

    // Auto-select appointment if employeeId is in URL and no appointment is currently selected
    if (employeeId && !selectedAppointment && filtered.length > 0) {
      const appointmentToSelect = findAppointmentByEmployeeId(
        filtered,
        employeeId
      );
      if (appointmentToSelect) {
        setSelectedAppointment(appointmentToSelect);
      }
    }
  }, [
    allAppointments,
    searchTerm,
    filterAppointments,
    paginateAppointments,
    pagination.limit,
    searchParams,
    employeeId,
    selectedAppointment,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1, searchTerm, employeeId || undefined);
  };

  const updateURL = useCallback(
    (page: number, search: string, employeeId?: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);
      if (employeeId) params.set('employee', employeeId);

      const newURL = `/appointments${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm, employeeId || undefined);
    transitionToPage(newPage);
  };

  const handleAppointmentClick = (appointment: AppointmentWithEmployee) => {
    setSelectedAppointment(appointment);
    // Update URL to include employee ID
    updateURL(pagination.page, searchTerm, appointment.employee_id);
  };

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
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Save section-specific data
  const handleSectionSave = async (sectionName: string) => {
    if (!selectedAppointment?.id) {
      console.error('No appointment record selected for saving');
      return;
    }

    try {
      setFormLoading(true);

      // Start with the complete existing record to preserve all data
      let updateData: any = { ...selectedAppointment };

      // Only update the specific fields for the section being edited
      switch (sectionName) {
        case 'employee':
          if (formData.employee_name !== undefined)
            updateData.employee_name = formData.employee_name;
          if (formData.employee_surname !== undefined)
            updateData.employee_surname = formData.employee_surname;
          if (formData.employee_email !== undefined)
            updateData.employee_email = formData.employee_email;
          break;
        case 'appointment':
          if (formData.type !== undefined) updateData.type = formData.type;
          if (formData.start_date !== undefined)
            updateData.start_date = formData.start_date;
          if (formData.end_date !== undefined)
            updateData.end_date = formData.end_date;
          if (formData.start_time !== undefined)
            updateData.start_time = formData.start_time;
          if (formData.end_time !== undefined)
            updateData.end_time = formData.end_time;
          if (formData.start_datetime !== undefined)
            updateData.start_datetime = formData.start_datetime;
          if (formData.end_datetime !== undefined)
            updateData.end_datetime = formData.end_datetime;
          break;
        case 'report':
          if (formData.report_id !== undefined)
            updateData.report_id = formData.report_id;
          break;
        case 'calendar':
          if (formData.calander_id !== undefined)
            updateData.calander_id = formData.calander_id;
          if (formData.calander_link !== undefined)
            updateData.calander_link = formData.calander_link;
          break;
        case 'notes':
          if (formData.notes !== undefined) updateData.notes = formData.notes;
          break;
        default:
          console.error(`Unknown section: ${sectionName}`);
          return;
      }

      console.log(`Saving ${sectionName} data:`, updateData);

      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        console.log(`${sectionName} saved successfully:`, updatedAppointment);

        // Update the selected appointment with new data
        setSelectedAppointment(
          updatedAppointment.appointment || updatedAppointment
        );

        // Refresh all appointments to get updated data
        await fetchAllAppointments();

        // Close the edit mode for the specific section
        switch (sectionName) {
          case 'employee':
            setIsEmployeeEditOpen(false);
            break;
          case 'appointment':
            setIsAppointmentEditOpen(false);
            break;
          case 'report':
            setIsReportEditOpen(false);
            break;
          case 'calendar':
            setIsCalendarEditOpen(false);
            break;
          case 'notes':
            setIsNotesEditOpen(false);
            break;
        }

        setFormData({});
        setSuccessMessage(
          `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section updated successfully!`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const error = await response.json();
        console.error(`${sectionName} save failed:`, error);
      }
    } catch (error) {
      console.error(`Error saving ${sectionName} data:`, error);
    } finally {
      setFormLoading(false);
    }
  };

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
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>Loading appointments...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
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
            {/* Search */}
            <Card className='glass-effect'>
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
                        updateURL(1, '', employeeId || undefined);
                      }}
                      className='hover-lift'
                    >
                      Clear
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                  <CalendarDays className='h-6 w-6' />
                  Appointments ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Medical appointment scheduling and records
                </CardDescription>
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
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
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
                width: `${100 - leftWidth}%`,
                maxWidth: `${100 - leftWidth}%`,
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
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsAppointmentEditOpen(true)}
                        className='hover-lift'
                        title='Edit appointment details'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSelectedAppointment(null);
                          // Remove employeeId from URL when closing appointment
                          updateURL(pagination.page, searchTerm);
                        }}
                        className='hover-lift'
                        title='Close appointment record'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Success Message */}
                {successMessage && (
                  <div className='px-6 pt-0 pb-3'>
                    <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                      <div className='flex items-center gap-2 text-green-700'>
                        <CheckCircle className='h-4 w-4' />
                        <span className='text-sm font-medium'>
                          {successMessage}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Employee Information */}
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        Employee Information
                      </h3>
                      {!isEmployeeEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsEmployeeEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit employee information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsEmployeeEditOpen(false)}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('employee')}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 animate-spin' />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isEmployeeEditOpen ? (
                      // Display current employee information
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
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='employee_name'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Name:
                          </Label>
                          <Input
                            id='employee_name'
                            value={
                              formData.employee_name !== undefined
                                ? formData.employee_name
                                : selectedAppointment.employee_name || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                employee_name: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter employee name'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='employee_surname'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Surname:
                          </Label>
                          <Input
                            id='employee_surname'
                            value={
                              formData.employee_surname !== undefined
                                ? formData.employee_surname
                                : selectedAppointment.employee_surname || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                employee_surname: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter employee surname'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='employee_email'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Email:
                          </Label>
                          <Input
                            id='employee_email'
                            value={
                              formData.employee_email !== undefined
                                ? formData.employee_email
                                : selectedAppointment.employee_email || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                employee_email: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter employee email'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Appointment Details */}
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        Appointment Details
                      </h3>
                      {!isAppointmentEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsAppointmentEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit appointment details'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsAppointmentEditOpen(false)}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('appointment')}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 animate-spin' />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isAppointmentEditOpen ? (
                      // Display current appointment details
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
                          <span className='font-medium'>
                            {formatDate(selectedAppointment.start_date)}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            End Date:
                          </span>
                          <span className='font-medium'>
                            {formatDate(selectedAppointment.end_date)}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Start Time:
                          </span>
                          <span className='font-medium'>
                            {formatTime(selectedAppointment.start_time)}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            End Time:
                          </span>
                          <span className='font-medium'>
                            {formatTime(selectedAppointment.end_time)}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Start DateTime:
                          </span>
                          <span className='font-medium'>
                            {formatDateTime(selectedAppointment.start_datetime)}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            End DateTime:
                          </span>
                          <span className='font-medium'>
                            {formatDateTime(selectedAppointment.end_datetime)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='type'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Type:
                          </Label>
                          <Input
                            id='type'
                            value={
                              formData.type !== undefined
                                ? formData.type
                                : selectedAppointment.type || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                type: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter appointment type'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='start_date'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Start Date:
                          </Label>
                          <Input
                            id='start_date'
                            type='date'
                            value={
                              formData.start_date !== undefined
                                ? formData.start_date
                                : selectedAppointment.start_date
                                  ? new Date(selectedAppointment.start_date)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                start_date: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='end_date'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            End Date:
                          </Label>
                          <Input
                            id='end_date'
                            type='date'
                            value={
                              formData.end_date !== undefined
                                ? formData.end_date
                                : selectedAppointment.end_date
                                  ? new Date(selectedAppointment.end_date)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                end_date: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='start_time'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Start Time:
                          </Label>
                          <Input
                            id='start_time'
                            type='time'
                            value={
                              formData.start_time !== undefined
                                ? formData.start_time
                                : selectedAppointment.start_time || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                start_time: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='end_time'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            End Time:
                          </Label>
                          <Input
                            id='end_time'
                            type='time'
                            value={
                              formData.end_time !== undefined
                                ? formData.end_time
                                : selectedAppointment.end_time || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                end_time: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Report Information */}
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        Report Information
                      </h3>
                      {!isReportEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsReportEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit report information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsReportEditOpen(false)}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('report')}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 animate-spin' />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isReportEditOpen ? (
                      // Display current report information
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
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='report_id'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Report ID:
                          </Label>
                          <Input
                            id='report_id'
                            value={
                              formData.report_id !== undefined
                                ? formData.report_id
                                : selectedAppointment.report_id || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                report_id: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter report ID'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Calendar Information */}
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <MapPin className='h-4 w-4' />
                        Calendar Information
                      </h3>
                      {!isCalendarEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsCalendarEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit calendar information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsCalendarEditOpen(false)}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('calendar')}
                            className='hover-lift h-8'
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 animate-spin' />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {!isCalendarEditOpen ? (
                      // Display current calendar information
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Calendar ID:
                          </span>
                          <span className='font-medium'>
                            {selectedAppointment.calander_id || 'N/A'}
                          </span>
                        </div>
                        {selectedAppointment.calander_link && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Calendar Link:
                            </span>
                            <a
                              href={selectedAppointment.calander_link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-primary hover:underline text-xs break-all'
                            >
                              View in Calendar
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='calander_id'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Calendar ID:
                          </Label>
                          <Input
                            id='calander_id'
                            value={
                              formData.calander_id !== undefined
                                ? formData.calander_id
                                : selectedAppointment.calander_id || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                calander_id: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter calendar ID'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='calander_link'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Calendar Link:
                          </Label>
                          <Input
                            id='calander_link'
                            value={
                              formData.calander_link !== undefined
                                ? formData.calander_link
                                : selectedAppointment.calander_link || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                calander_link: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter calendar link'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* System Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      Record Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created:
                        </span>
                        <span className='font-medium'>
                          {formatDateTime(selectedAppointment.date_created)}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created By:
                        </span>
                        <span className='font-medium'>
                          {selectedAppointment.created_by_name ||
                            selectedAppointment.user_created}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        <span className='font-medium'>
                          {formatDateTime(selectedAppointment.date_updated)}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Updated By:
                        </span>
                        <span className='font-medium'>
                          {selectedAppointment.updated_by_name ||
                            selectedAppointment.user_updated}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {(selectedAppointment.notes || isNotesEditOpen) && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                            Notes
                          </h3>
                          {!isNotesEditOpen ? (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setIsNotesEditOpen(true)}
                              className='hover-lift h-8 w-8 p-0'
                              title='Edit notes'
                            >
                              <Edit className='h-3 w-3' />
                            </Button>
                          ) : (
                            <div className='flex gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setIsNotesEditOpen(false)}
                                className='hover-lift h-8'
                                disabled={formLoading}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant='default'
                                size='sm'
                                onClick={() => handleSectionSave('notes')}
                                className='hover-lift h-8'
                                disabled={formLoading}
                              >
                                {formLoading ? (
                                  <Loader2 className='h-3 w-3 animate-spin' />
                                ) : (
                                  'Save'
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {!isNotesEditOpen ? (
                          // Display current notes
                          selectedAppointment.notes && (
                            <div className='text-sm p-3 bg-muted rounded-lg'>
                              {selectedAppointment.notes}
                            </div>
                          )
                        ) : (
                          // Show textarea for editing
                          <div className='space-y-2'>
                            <Textarea
                              id='notes'
                              value={
                                formData.notes !== undefined
                                  ? formData.notes
                                  : selectedAppointment.notes || ''
                              }
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  notes: e.target.value,
                                })
                              }
                              className='min-h-[100px] text-sm'
                              placeholder='Enter appointment notes...'
                            />
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
      </div>
    </DashboardLayout>
  );
}
