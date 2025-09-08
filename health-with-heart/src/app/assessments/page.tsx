'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouteState } from '@/hooks/useRouteState';
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
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Activity,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ClipboardList,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { PageLoading } from '@/components/ui/loading';

interface AssessmentRecord {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string;
  user_updated: string;
  employee_id: string;
  report_id: string;
  assessment_complete?: boolean;
  assessment_type?: string;
  employee_name?: string;
  employee_surname?: string;
  employee_number?: string;
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

interface Employee {
  id: string;
  name: string;
  surname: string;
  employee_number: string;
  work_email: string;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentRecord | null>(null);
  const [formData, setFormData] = useState<Partial<AssessmentRecord>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useRouteState<number>(
    'leftPanelWidth',
    50,
    { scope: 'path' }
  ); // percentage
  const [selectedAssessmentId, setSelectedAssessmentId] = useRouteState<
    string | null
  >('selectedAssessmentId', null, { scope: 'path' });
  const [isResizing, setIsResizing] = useState(false);

  // Editing states for different sections
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);

  // Editing data for inline editing
  const [editingData, setEditingData] = useState<Partial<AssessmentRecord>>({});

  // Form states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] =
    useState<AssessmentRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchAssessments = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/assessments?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`
      );
      if (!response.ok) throw new Error('Failed to fetch assessments');

      const data = await response.json();
      console.log('API Response - first assessment:', data.assessments[0]);
      setAssessments(data.assessments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch employees');

      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchEmployees();
  }, []);

  const handleSearch = () => {
    fetchAssessments(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchAssessments(newPage, searchTerm);
  };

  const handleCreateAssessment = async () => {
    if (!formData.employee_id) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create assessment record');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchAssessments(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating assessment record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAssessment = async () => {
    if (!selectedAssessment) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/assessments/${selectedAssessment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            user_updated: '1', // TODO: Use actual user ID from auth
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update assessment record');

      setIsEditDialogOpen(false);
      setFormData({});
      fetchAssessments(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating assessment record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (!editingAssessment) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/assessments/${editingAssessment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assessment record');

      fetchAssessments(pagination.page, searchTerm);
      setIsDeleteModalOpen(false);
      setEditingAssessment(null);
    } catch (error) {
      console.error('Error deleting assessment record:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (assessment: AssessmentRecord) => {
    setFormData(assessment);
    setEditingAssessment(assessment);
    setIsEditDialogOpen(true);
  };

  const handleAssessmentClick = (assessment: AssessmentRecord) => {
    console.log('Selected assessment data:', assessment);
    setSelectedAssessment(assessment);
    setSelectedAssessmentId(assessment.id);
  };

  useEffect(() => {
    const restore = async () => {
      if (!selectedAssessment && selectedAssessmentId) {
        const found = assessments.find(a => a.id === selectedAssessmentId);
        if (found) {
          setSelectedAssessment(found);
          return;
        }
        try {
          const res = await fetch(`/api/assessments/${selectedAssessmentId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedAssessment(data);
          } else {
            setSelectedAssessmentId(null);
          }
        } catch {
          setSelectedAssessmentId(null);
        }
      }
    };
    restore();
  }, [selectedAssessmentId, selectedAssessment, assessments]);

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.assessments-container');
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

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Medical Assessments'
                  subtitle='Fetching executive medical assessment data from OHMS database...'
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
        <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden'>
          {/* Back Button */}
          <div className='mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.history.back()}
              className='flex items-center space-x-2'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Back</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Assessments
                </CardTitle>
                <ClipboardList className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{pagination.total}</div>
                <p className='text-xs text-muted-foreground'>
                  Executive Medical employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Complete</CardTitle>
                <Activity className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {assessments.filter(a => a.assessment_complete).length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Completed assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Incomplete
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {assessments.filter(a => !a.assessment_complete).length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Pending completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Insurance Type
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {
                    assessments.filter(a => a.assessment_type === 'Insurance')
                      .length
                  }
                </div>
                <p className='text-xs text-muted-foreground'>
                  Insurance assessments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className='glass-effect my-6'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-4 w-full'>
                <div className='flex-1 flex items-center gap-2'>
                  <Search className='h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by employee name or number...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className='flex-1'
                  />
                  <Button onClick={handleSearch}>Search</Button>
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
            </CardContent>
          </Card>

          {/* Main Content with Split View */}
          <div className='assessments-container flex gap-0 overflow-hidden mb-6'>
            {/* Left Panel - Assessments List */}
            <div
              className='space-y-4 flex-shrink-0 flex flex-col'
              style={{
                width: selectedAssessment ? `${leftPanelWidth}%` : '100%',
                maxWidth: selectedAssessment ? `${leftPanelWidth}%` : '100%',
              }}
            >
              {/* Assessments Table */}
              <Card className='hover-lift flex-1 overflow-hidden'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-3 text-2xl'>
                        <div className='p-2'>
                          <ClipboardList className='h-6 w-6 text-primary' />
                        </div>
                        <div>
                          <span>Assessment Records</span>
                          <span className='ml-2 text-lg font-medium text-gray-500'>
                            ({pagination.total})
                          </span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Click on any record to view detailed assessment
                        information
                      </CardDescription>
                    </div>
                    <Dialog
                      open={isCreateDialogOpen}
                      onOpenChange={setIsCreateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className={
                            selectedAssessment
                              ? 'rounded-full w-10 h-10 p-0'
                              : ''
                          }
                        >
                          <Plus className='h-4 w-4' />
                          {!selectedAssessment && (
                            <span className='ml-2'>Add Assessment</span>
                          )}
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='max-h-[450px] overflow-auto scrollbar-thin'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8'>
                              <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2' />
                              <p>Loading assessments...</p>
                            </TableCell>
                          </TableRow>
                        ) : assessments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8'>
                              <ClipboardList className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                              <h3 className='text-lg font-medium text-foreground mb-2'>
                                No assessments found
                              </h3>
                              <p className='text-muted-foreground'>
                                No assessment records match your search
                                criteria.
                              </p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          assessments.map(assessment => (
                            <TableRow
                              key={assessment.id}
                              className={`cursor-pointer hover:bg-muted/50 ${
                                selectedAssessment?.id === assessment.id
                                  ? 'bg-muted'
                                  : ''
                              }`}
                              onClick={() => handleAssessmentClick(assessment)}
                            >
                              <TableCell>
                                <div>
                                  <div className='font-medium'>
                                    {assessment.employee_name}{' '}
                                    {assessment.employee_surname}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    {assessment.employee_number}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant='secondary'>
                                  {assessment.assessment_type ||
                                    'Not specified'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    assessment.assessment_complete
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }
                                  variant='secondary'
                                >
                                  {assessment.assessment_complete
                                    ? 'Complete'
                                    : 'Incomplete'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  assessment.date_created
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      openEditDialog(assessment);
                                    }}
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditingAssessment(assessment);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

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
                            className={`${selectedAssessment && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                            className={`${selectedAssessment && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            Previous
                          </span>
                        </Button>

                        {/* Page Numbers */}
                        {Array.from(
                          {
                            length: Math.min(
                              selectedAssessment && leftPanelWidth < 50 ? 3 : 5,
                              pagination.totalPages
                            ),
                          },
                          (_, i) => {
                            const startPage = Math.max(
                              1,
                              pagination.page -
                                (selectedAssessment && leftPanelWidth < 50
                                  ? 1
                                  : 2)
                            );
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`assessments-page-${page}`}
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
                            className={`${selectedAssessment && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
                            className={`${selectedAssessment && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
            {selectedAssessment && (
              <div
                className='w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors duration-200 flex-shrink-0'
                onMouseDown={handleMouseDown}
              />
            )}

            {/* Right Panel - Assessment Preview */}
            <div
              className={`${selectedAssessment ? 'animate-slide-up' : ''} overflow-hidden`}
              style={{
                width: selectedAssessment
                  ? `calc(${100 - leftPanelWidth}% - 4px)`
                  : '0%',
                maxWidth: selectedAssessment
                  ? `calc(${100 - leftPanelWidth}% - 4px)`
                  : '0%',
                paddingLeft: selectedAssessment ? '12px' : '0',
                paddingRight: selectedAssessment ? '0px' : '0',
                overflow: selectedAssessment ? 'visible' : 'hidden',
              }}
            >
              {selectedAssessment && (
                <div className='space-y-4 min-h-[75vh] max-h-[85vh] overflow-y-auto scrollbar-thin'>
                  {/* Assessment Header Card */}
                  <Card className='glass-effect'>
                    <CardContent className='p-4 min-h-[120px] flex items-center'>
                      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4'>
                        <div className='space-y-3'>
                          <div>
                            <h2 className='text-xl font-semibold'>
                              {selectedAssessment.employee_name}{' '}
                              {selectedAssessment.employee_surname}
                            </h2>
                            <div className='text-sm text-muted-foreground mt-1'>
                              Employee #{selectedAssessment.employee_number} •{' '}
                              {selectedAssessment.employee_email}
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <Badge
                              className={
                                selectedAssessment.assessment_complete
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                              variant='secondary'
                            >
                              {selectedAssessment.assessment_complete
                                ? 'Complete'
                                : 'Incomplete'}
                            </Badge>
                            <Badge variant='secondary'>
                              {selectedAssessment.assessment_type ||
                                'Not specified'}
                            </Badge>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteAssessment()}
                            className='text-destructive hover:text-destructive hover:bg-destructive/10'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedAssessment(null);
                              setSelectedAssessmentId(null);
                            }}
                            className='text-muted-foreground hover:text-foreground hover:bg-muted'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assessment Details */}
                  <Card className='border-blue-200'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <ClipboardList className='h-5 w-5' />
                        Assessment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <div className='text-muted-foreground'>
                            Assessment Type
                          </div>
                          <div className='font-semibold'>
                            {selectedAssessment.assessment_type ||
                              'Not specified'}
                          </div>
                        </div>
                        <div>
                          <div className='text-muted-foreground'>Status</div>
                          <div className='font-semibold'>
                            {selectedAssessment.assessment_complete
                              ? 'Complete'
                              : 'Incomplete'}
                          </div>
                        </div>
                        <div>
                          <div className='text-muted-foreground'>Report ID</div>
                          <div className='font-semibold font-mono text-sm'>
                            {selectedAssessment.report_id}
                          </div>
                        </div>
                        <div>
                          <div className='text-muted-foreground'>
                            Employee ID
                          </div>
                          <div className='font-semibold font-mono text-sm'>
                            {selectedAssessment.employee_id}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Record Information */}
                  <Card className='border-gray-200'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Record Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <div className='text-muted-foreground'>Created</div>
                          <div className='font-semibold'>
                            {new Date(
                              selectedAssessment.date_created
                            ).toLocaleString()}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {selectedAssessment.created_by_name}
                          </div>
                        </div>
                        <div>
                          <div className='text-muted-foreground'>
                            Last Updated
                          </div>
                          <div className='font-semibold'>
                            {new Date(
                              selectedAssessment.date_updated
                            ).toLocaleString()}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {selectedAssessment.updated_by_name}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Edit Assessment Record</DialogTitle>
                <DialogDescription>
                  Update the assessment information below.
                </DialogDescription>
              </DialogHeader>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit_employee'>Employee</Label>
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
                          {employee.name} {employee.surname} (
                          {employee.employee_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_assessment_type'>Assessment Type</Label>
                  <Select
                    value={formData.assessment_type || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, assessment_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select assessment type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Insurance'>Insurance</SelectItem>
                      <SelectItem value='Pre-employment'>
                        Pre-employment
                      </SelectItem>
                      <SelectItem value='Annual'>Annual</SelectItem>
                      <SelectItem value='Exit'>Exit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_assessment_complete'>
                    Assessment Complete
                  </Label>
                  <Select
                    value={formData.assessment_complete?.toString() || ''}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        assessment_complete: value === 'true',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select completion status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='true'>Complete</SelectItem>
                      <SelectItem value='false'>Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditAssessment} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    'Update Assessment'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5 text-destructive' />
                  Delete Assessment Record
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this assessment record for{' '}
                  <span className='font-medium'>
                    {editingAssessment
                      ? `${editingAssessment.employee_name} ${editingAssessment.employee_surname}`
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
                  onClick={handleDeleteAssessment}
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
                      Delete Record
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
