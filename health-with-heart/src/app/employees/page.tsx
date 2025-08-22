'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Employee } from '@/types';
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
  ArrowLeft,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  UserRoundPlus,
} from 'lucide-react';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [displayedEmployees, setDisplayedEmployees] = useState<Employee[]>([]);
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // Fetch all employees data once
  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/employees', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '1000'); // Get all employees

      const response = await fetch(url.toString());
      const data = await response.json();

      setAllEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filterEmployees = useCallback(
    (employees: Employee[], search: string) => {
      if (!search) return employees;

      return employees.filter(employee => {
        const fullName = `${employee.name} ${employee.surname}`.toLowerCase();
        const searchLower = search.toLowerCase();

        return (
          fullName.includes(searchLower) ||
          employee.work_email?.toLowerCase().includes(searchLower) ||
          employee.employee_number?.toLowerCase().includes(searchLower) ||
          employee.mobile_number?.toLowerCase().includes(searchLower)
        );
      });
    },
    []
  );

  // Client-side pagination
  const paginateEmployees = useCallback(
    (employees: Employee[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = employees.slice(startIndex, endIndex);

      const total = employees.length;
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

      const paginated = paginateEmployees(
        filteredEmployees,
        newPage,
        pagination.limit
      );
      setDisplayedEmployees(paginated);

      setPageTransitioning(false);
    },
    [filteredEmployees, pagination.limit, paginateEmployees]
  );

  // Initial load
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Handle filtering when search term or all employees change
  useEffect(() => {
    const filtered = filterEmployees(allEmployees, searchTerm);
    setFilteredEmployees(filtered);

    // Reset to page 1 when filtering changes
    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateEmployees(filtered, page, pagination.limit);
    setDisplayedEmployees(paginated);
  }, [
    allEmployees,
    searchTerm,
    filterEmployees,
    paginateEmployees,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredEmployees.length > 0) {
      transitionToPage(page);
    }
  }, [
    searchParams,
    pagination.page,
    filteredEmployees.length,
    transitionToPage,
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

      const newURL = `/employees${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.employees-container');
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
              <p className='text-muted-foreground'>Loading employees...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        <div className='employees-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Employees Table */}
          <div
            className='space-y-4 animate-slide-up'
            style={{ width: selectedEmployee ? `${leftWidth}%` : '100%' }}
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
                      placeholder='Search by name, employee number, email...'
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

            {/* Employees Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex flex-row justify-between items-center flex-1'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                      <Users className='h-6 w-6' />
                      Employees ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                      Employee records and information
                    </CardDescription>
                  </div>

                  <Button
                    className={`hover-lift transition-all duration-300 ease-in-out ${
                      selectedEmployee
                        ? 'w-12 h-12 rounded-full p-0'
                        : 'px-4 py-2'
                    }`}
                  >
                    <UserRoundPlus
                      className={`${selectedEmployee ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`}
                    />
                    {!selectedEmployee && <span>Add Employee</span>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {displayedEmployees.length === 0 ? (
                  <div className='text-center py-12'>
                    <User className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No employees found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No employees available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Employee Number</TableHead>
                          <TableHead>Work Email</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Date of Birth</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedEmployees.map(employee => (
                          <TableRow
                            key={employee.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedEmployee?.id === employee.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {employee.name} {employee.surname}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {employee.mobile_number}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline'>
                                {employee.employee_number || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {employee.work_email || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant='secondary'>
                                {employee.gender || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatDate(employee.date_of_birth)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className='flex items-center justify-between pt-4 border-t'>
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
                          className={`${selectedEmployee && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                          className={`${selectedEmployee && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          Previous
                        </span>
                      </Button>

                      {/* Page Numbers */}
                      {Array.from(
                        {
                          length: Math.min(
                            selectedEmployee && leftWidth < 50 ? 3 : 5,
                            pagination.totalPages
                          ),
                        },
                        (_, i) => {
                          const startPage = Math.max(1, pagination.page - 2);
                          const page = startPage + i;
                          if (page > pagination.totalPages) return null;

                          return (
                            <Button
                              key={`employees-page-${page}`}
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
                          className={`${selectedEmployee && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                          className={`${selectedEmployee && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
          {selectedEmployee && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Employee Details */}
          {selectedEmployee && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedEmployee.name} {selectedEmployee.surname}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <Badge variant='outline'>
                          {selectedEmployee.employee_number}
                        </Badge>
                        <Badge variant='secondary'>
                          {selectedEmployee.gender}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedEmployee(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Personal Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <User className='h-4 w-4' />
                      {selectedEmployee.section_header ||
                        'Personal Information'}
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Full Name:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.name} {selectedEmployee.surname}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Employee #:
                        </span>
                        <Badge variant='outline'>
                          {selectedEmployee.employee_number || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          ID Number:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.id_number || 'N/A'}
                        </span>
                      </div>
                      {selectedEmployee.passport_number && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Passport:
                          </span>
                          <span className='font-medium'>
                            {selectedEmployee.passport_number}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Date of Birth:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.date_of_birth
                            ? formatDate(selectedEmployee.date_of_birth)
                            : 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Gender:
                        </span>
                        <Badge variant='secondary'>
                          {selectedEmployee.gender || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Ethnicity:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.ethnicity || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Marital Status:
                        </span>
                        <Badge variant='outline'>
                          {selectedEmployee.marriage_status || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Children:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.no_of_children || '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Phone className='h-4 w-4' />
                      Contact Information
                    </h3>
                    <div className='space-y-3 text-sm'>
                      <div className='flex gap-2'>
                        <Phone className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div className='flex-1'>
                          <div className='text-muted-foreground text-xs'>
                            Mobile
                          </div>
                          <span className='font-medium'>
                            {selectedEmployee.mobile_number || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div className='flex-1'>
                          <div className='text-muted-foreground text-xs'>
                            Personal Email
                          </div>
                          <span className='font-medium text-xs break-all'>
                            {selectedEmployee.personal_email_address || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div className='flex-1'>
                          <div className='text-muted-foreground text-xs'>
                            Work Email
                          </div>
                          <span className='font-medium text-xs break-all'>
                            {selectedEmployee.work_email || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Employment Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Briefcase className='h-4 w-4' />
                      {selectedEmployee.section_header_3 ||
                        'Employment Details'}
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Employee #:
                        </span>
                        <Badge variant='outline'>
                          {selectedEmployee.employee_number || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Job Title:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.job || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Organisation:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.organisation_name || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Workplace:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.workplace_name || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Start Date:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.work_startdate
                            ? formatDate(selectedEmployee.work_startdate)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Medical Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Heart className='h-4 w-4' />
                      {selectedEmployee.section_header_2 ||
                        'Medical Information'}
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Medical Aid:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.medical_aid || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Medical Aid #:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.medical_aid_number || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Main Member:
                        </span>
                        <Badge
                          variant={
                            selectedEmployee.main_member
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {selectedEmployee.main_member ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {selectedEmployee.main_member_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Main Member:
                          </span>
                          <span className='font-medium'>
                            {selectedEmployee.main_member_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* System Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Record Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.date_created
                            ? formatDate(selectedEmployee.date_created)
                            : 'N/A'}
                        </span>
                      </div>
                      {selectedEmployee.created_by && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Created By:
                          </span>
                          <span className='font-medium'>
                            {selectedEmployee.created_by}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        <span className='font-medium'>
                          {selectedEmployee.date_updated
                            ? formatDate(selectedEmployee.date_updated)
                            : 'N/A'}
                        </span>
                      </div>
                      {selectedEmployee.updated_by && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Updated By:
                          </span>
                          <span className='font-medium'>
                            {selectedEmployee.updated_by}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEmployee.notes_text && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          {selectedEmployee.notes_header || 'Notes'}
                        </h3>
                        <div className='text-sm p-3 bg-muted rounded-lg'>
                          {selectedEmployee.notes_text}
                        </div>
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
