'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  User,
  Heart,
  Shield,
  Pill,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface MedicalHistory {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  employee_id: string;
  conditions_header: string | null;
  hiv: string | null;
  high_blood_pressure: boolean;
  high_cholesterol: boolean;
  diabetes: boolean;
  thyroid_disease: boolean;
  asthma: boolean;
  epilepsy: boolean;
  bipolar_mood_disorder: boolean;
  anxiety_or_depression: boolean;
  inflammatory_bowel_disease: boolean;
  tb: boolean;
  hepatitis: boolean;
  other: string | null;
  notes: string | null;
  disability_header: string | null;
  disability: boolean;
  disability_type: string | null;
  disabilty_desription: string | null;
  allergies_header: string | null;
  medication: boolean;
  medication_type: string | null;
  medication_severity: string | null;
  environmental: boolean;
  environmental_type: string | null;
  enviromental_severity: string | null;
  food: boolean;
  food_type: string | null;
  food_severity: string | null;
  on_medication: boolean;
  chronic_medication: string | null;
  vitamins_or_supplements: string | null;
  family_history_header: string | null;
  family_conditions: string | null;
  heart_attack: boolean;
  heart_attack_60: string | null;
  cancer_family: boolean;
  type_cancer: string | null;
  age_of_cancer: string | null;
  family_members: string | null;
  other_family: string | null;
  surgery_header: string | null;
  surgery: boolean;
  surgery_type: string | null;
  surgery_year: string | null;
  notes_header: string | null;
  notes_text: string | null;
  recommendation_text: string | null;
  employee_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface Employee {
  id: string;
  name: string;
  surname: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function MedicalHistoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter parameters from URL
  const employeeFilter = searchParams.get('employee');
  const employeeName = searchParams.get('employeeName');
  const returnUrl = searchParams.get('returnUrl');

  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>(
    []
  );
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
  const [selectedMedicalHistory, setSelectedMedicalHistory] =
    useState<MedicalHistory | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalHistory>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useRouteState<number>('leftPanelWidth', 60, { scope: 'path' });
  const [selectedMedicalHistoryId, setSelectedMedicalHistoryId] = useRouteState<string | null>('selectedMedicalHistoryId', null, { scope: 'path' });
  const [isResizing, setIsResizing] = useState(false);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMedicalHistory, setDeletingMedicalHistory] =
    useState<MedicalHistory | null>(null);

  // Edit states for each section
  const [isEditingDisability, setIsEditingDisability] = useState(false);
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);
  const [isEditingFamilyHistory, setIsEditingFamilyHistory] = useState(false);
  const [isEditingSurgery, setIsEditingSurgery] = useState(false);
  const [isEditingRecommendations, setIsEditingRecommendations] =
    useState(false);

  const fetchMedicalHistories = useCallback(
    async (page = 1, search = '') => {
      try {
        setLoading(true);
        let url = `/api/medical-history?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`;

        if (employeeFilter) {
          url += `&employee=${encodeURIComponent(employeeFilter)}`;
        }

        console.log('Fetching medical histories from URL:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch medical histories');

        const data = await response.json();
        console.log('API Response:', data);
        console.log('Medical histories found:', data.medicalHistories?.length);
        console.log('Employee filter:', employeeFilter);

        setMedicalHistories(data.medicalHistories);
        setPagination(data.pagination);

        // If there's an employee filter, automatically select the first medical history
        if (
          employeeFilter &&
          data.medicalHistories &&
          data.medicalHistories.length > 0
        ) {
          const employeeMedicalHistory = data.medicalHistories[0];
          console.log(
            'Auto-selecting medical history:',
            employeeMedicalHistory
          );
          console.log(
            'Setting selectedMedicalHistory to:',
            employeeMedicalHistory.id
          );
          setSelectedMedicalHistory(employeeMedicalHistory);
          console.log('selectedMedicalHistory set successfully');
        } else if (
          employeeFilter &&
          data.medicalHistories &&
          data.medicalHistories.length === 0
        ) {
          // No medical histories found for this employee, open the create modal with employee ID pre-filled
          console.log(
            'No medical histories found for employee, opening create modal'
          );
          console.log('Setting form data with employee_id:', employeeFilter);
          setFormData({ employee_id: employeeFilter });
          setIsCreateDialogOpen(true);
        } else if (selectedMedicalHistory) {
          // If there's a selected medical history, pre-populate with that employee
          console.log('Pre-populating form with selected employee:', selectedMedicalHistory.employee_id);
          setFormData({ employee_id: selectedMedicalHistory.employee_id });
          setIsCreateDialogOpen(true);
        } else {
          console.log('No auto-selection:', {
            employeeFilter,
            medicalHistoriesLength: data.medicalHistories?.length,
            hasData: !!data.medicalHistories,
          });
        }
      } catch (error) {
        console.error('Error fetching medical histories:', error);
      } finally {
        setLoading(false);
      }
    },
    [employeeFilter]
  );

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch employees');

      const data = await response.json();
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchMedicalHistories();
    fetchEmployees();
  }, [fetchMedicalHistories]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      employeeFilter,
      selectedMedicalHistory: selectedMedicalHistory?.id,
      medicalHistories: medicalHistories.length,
      loading,
    });
  }, [
    employeeFilter,
    selectedMedicalHistory?.id,
    medicalHistories.length,
    loading,
  ]);

  const handleSearch = () => {
    fetchMedicalHistories(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchMedicalHistories(newPage, searchTerm);
  };

  const handleCreateMedicalHistory = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/medical-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create medical history');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchMedicalHistories(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating medical history:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMedicalHistory = async () => {
    if (!selectedMedicalHistory) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/medical-history/${selectedMedicalHistory.id}`,
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

      if (!response.ok) throw new Error('Failed to update medical history');

      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedMedicalHistory(null);
      fetchMedicalHistories(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating medical history:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicalHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/medical-history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete medical history');

      fetchMedicalHistories(pagination.page, searchTerm);
      if (selectedMedicalHistory?.id === id) {
        setSelectedMedicalHistory(null);
      }
    } catch (error) {
      console.error('Error deleting medical history:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingMedicalHistory) return;

    try {
      await handleDeleteMedicalHistory(deletingMedicalHistory.id);
      setIsDeleteModalOpen(false);
      setDeletingMedicalHistory(null);
    } catch (error) {
      console.error('Error in delete modal:', error);
    }
  };

  const openEditDialog = (history: MedicalHistory) => {
    setFormData(history);
    setSelectedMedicalHistory(history);
    setSelectedMedicalHistoryId(history.id);
    setIsEditDialogOpen(true);
  };

  const openDeleteModal = (medicalHistory: MedicalHistory) => {
    setDeletingMedicalHistory(medicalHistory);
    setIsDeleteModalOpen(true);
  };

  const handleMedicalHistoryClick = (history: MedicalHistory) => {
    setSelectedMedicalHistory(history);
    setSelectedMedicalHistoryId(history.id);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getConditionsBadges = (medicalHistory: MedicalHistory) => {
    const conditions = [];
    if (medicalHistory.high_blood_pressure) conditions.push('High BP');
    if (medicalHistory.diabetes) conditions.push('Diabetes');
    if (medicalHistory.asthma) conditions.push('Asthma');
    if (medicalHistory.anxiety_or_depression)
      conditions.push('Anxiety/Depression');
    if (medicalHistory.tb) conditions.push('TB');
    return conditions.slice(0, 3); // Show only first 3
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.medical-history-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 30% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 80);
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const restore = async () => {
      if (!selectedMedicalHistory && selectedMedicalHistoryId) {
        const found = medicalHistories.find(m => m.id === selectedMedicalHistoryId);
        if (found) {
          setSelectedMedicalHistory(found);
          return;
        }
        try {
          const res = await fetch(`/api/medical-history/${selectedMedicalHistoryId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedMedicalHistory(data);
          } else {
            setSelectedMedicalHistoryId(null);
          }
        } catch {
          setSelectedMedicalHistoryId(null);
        }
      }
    };
    restore();
  }, [selectedMedicalHistoryId, selectedMedicalHistory, medicalHistories]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center min-h-[600px]'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden'>
        {/* Back Button and Filters */}
        {(returnUrl || employeeFilter) && (
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {returnUrl && (
                <Button
                  variant='outline'
                  onClick={() => router.push(returnUrl)}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back
                </Button>
              )}

              {employeeFilter && employeeName && (
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 text-blue-700 border-blue-200'
                  >
                    <User className='h-3 w-3 mr-1' />
                    Filtered by: {decodeURIComponent(employeeName)}
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete('employee');
                      params.delete('employeeName');
                      router.push(`/medical-history?${params.toString()}`);
                    }}
                    className='h-6 w-6 p-0'
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className='mb-6'>
          <Button
            variant='outline'
            onClick={() => router.back()}
            className='flex items-center gap-2 hover-lift'
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Records
                  </CardTitle>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pagination.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Medical history records
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    High BP Cases
                  </CardTitle>
                  <Heart className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      medicalHistories.filter(mh => mh.high_blood_pressure)
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    High blood pressure cases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Diabetes Cases
                  </CardTitle>
                  <Activity className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {medicalHistories.filter(mh => mh.diabetes).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Diabetes cases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    On Medication
                  </CardTitle>
                  <Pill className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {medicalHistories.filter(mh => mh.on_medication).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Currently on medication
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className='glass-effect my-6'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='text'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder='Search by employee name or notes...'
                      className='pl-9'
                      onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} className='hover-lift'>
                    Search
                  </Button>
                  {searchTerm && (
                    <Button
                      variant='outline'
                      onClick={() => {
                        setSearchTerm('');
                        fetchMedicalHistories(1, '');
                      }}
                      className='hover-lift'
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

        {/* Header */}

        <div className='medical-history-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Medical History Table */}
          <div
            className='space-y-4'
            style={{
              width: selectedMedicalHistory ? `${leftPanelWidth}%` : '100%',
            }}
          >


            {/* Medical History Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl text-primary'>
                      <FileText className='h-6 w-6 text-primary' />
                      Medical History ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                      Employee medical history records
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className={selectedMedicalHistory ? 'rounded-full w-10 h-10 p-0' : ''}>
                        <Plus className='h-4 w-4' />
                        {!selectedMedicalHistory && (
                          <>
                            <span className='ml-2'>Add Record</span>
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {medicalHistories.length === 0 ? (
                  <div className='text-center py-12'>
                    <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No medical history found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No medical history records available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Conditions</TableHead>
                          <TableHead>Medications</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicalHistories.map(medicalHistory => (
                          <TableRow
                            key={medicalHistory.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedMedicalHistory?.id === medicalHistory.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() =>
                              handleMedicalHistoryClick(medicalHistory)
                            }
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {medicalHistory.employee_name ||
                                    'Unknown Employee'}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  ID: {medicalHistory.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-wrap gap-1'>
                                {getConditionsBadges(medicalHistory).map(
                                  (condition, index) => (
                                    <Badge
                                      key={index}
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {condition}
                                    </Badge>
                                  )
                                )}
                                {getConditionsBadges(medicalHistory).length ===
                                  0 && (
                                  <span className='text-sm text-muted-foreground'>
                                    None
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {medicalHistory.on_medication ? (
                                <Badge
                                  variant='outline'
                                  className='bg-blue-100 text-blue-800'
                                >
                                  On Medication
                                </Badge>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  None
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatDate(medicalHistory.date_updated)}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditDialog(medicalHistory);
                                  }}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openDeleteModal(medicalHistory);
                                  }}
                                  className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
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
                        <span className='hidden sm:inline ml-1'>
                          {selectedMedicalHistory && leftPanelWidth < 50 ? '' : 'First'}
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
                        <span className='hidden sm:inline ml-1'>
                          {selectedMedicalHistory && leftPanelWidth < 50 ? '' : 'Previous'}
                        </span>
                      </Button>

                      {/* Page Numbers */}
                      <div className='flex items-center space-x-1'>
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const startPage = Math.max(1, pagination.page - 2);
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`medical-history-page-${page}`}
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
                      </div>

                      {/* Next Page */}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className='hover-lift'
                        title='Go to next page'
                      >
                        <span className='hidden sm:inline mr-1'>
                          {selectedMedicalHistory && leftPanelWidth < 50 ? '' : 'Next'}
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
                        <span className='hidden sm:inline mr-1'>
                          {selectedMedicalHistory && leftPanelWidth < 50 ? '' : 'Last'}
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
          {selectedMedicalHistory && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Medical History Details */}
          {selectedMedicalHistory && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftPanelWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedMedicalHistory.employee_name ||
                          'Unknown Employee'}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <Badge variant='outline'>
                          Updated:{' '}
                          {formatDate(selectedMedicalHistory.date_updated)}
                        </Badge>
                        {selectedMedicalHistory.on_medication && (
                          <Badge
                            variant='secondary'
                            className='bg-blue-100 text-blue-800'
                          >
                            On Medication
                          </Badge>
                        )}
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedMedicalHistory.updated_by_name ||
                            selectedMedicalHistory.user_updated ||
                            'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedMedicalHistory.date_updated
                            ? new Date(
                                selectedMedicalHistory.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openDeleteModal(selectedMedicalHistory)}
                        className='hover-lift text-destructive hover:text-destructive hover:bg-destructive/10'
                        title='Delete medical history'
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => { setSelectedMedicalHistory(null); setSelectedMedicalHistoryId(null); }}
                        className='hover-lift'
                        title='Close details'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Medical Conditions */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Heart className='h-4 w-4' />
                        Medical Conditions
                      </h3>
                    </div>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${selectedMedicalHistory.high_blood_pressure ? 'bg-red-500' : 'bg-gray-300'}`}
                        />
                        <span>High Blood Pressure</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${selectedMedicalHistory.diabetes ? 'bg-red-500' : 'bg-gray-300'}`}
                        />
                        <span>Diabetes</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${selectedMedicalHistory.asthma ? 'bg-red-500' : 'bg-gray-300'}`}
                        />
                        <span>Asthma</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${selectedMedicalHistory.anxiety_or_depression ? 'bg-red-500' : 'bg-gray-300'}`}
                        />
                        <span>Anxiety/Depression</span>
                      </div>
                    </div>
                    {selectedMedicalHistory.notes_text && (
                      <div className='mt-3 p-3 bg-muted/50 rounded-lg'>
                        <p className='text-sm'>
                          {selectedMedicalHistory.notes_text}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  {selectedMedicalHistory.on_medication && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Pill className='h-4 w-4' />
                          Current Medications
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingMedication && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => setIsEditingMedication(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={
                              isEditingMedication ? 'default' : 'ghost'
                            }
                            size='sm'
                            className='hover-lift rounded-md w-8 h-8 p-0 hover:border hover:border-border'
                            onClick={() =>
                              setIsEditingMedication(!isEditingMedication)
                            }
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='text-sm space-y-2'>
                        {selectedMedicalHistory.chronic_medication && (
                          <div>
                            <span className='font-medium'>
                              Chronic Medication:{' '}
                            </span>
                            <span>
                              {selectedMedicalHistory.chronic_medication}
                            </span>
                          </div>
                        )}
                        {selectedMedicalHistory.vitamins_or_supplements && (
                          <div>
                            <span className='font-medium'>Supplements: </span>
                            <span>
                              {selectedMedicalHistory.vitamins_or_supplements}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {(selectedMedicalHistory.medication ||
                    selectedMedicalHistory.food) && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Shield className='h-4 w-4' />
                          Allergies
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingAllergies && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => setIsEditingAllergies(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingAllergies ? 'default' : 'ghost'}
                            size='sm'
                            className='hover-lift rounded-md w-8 h-8 p-0 hover:border hover:border-border'
                            onClick={() =>
                              setIsEditingAllergies(!isEditingAllergies)
                            }
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='text-sm space-y-2'>
                        {selectedMedicalHistory.medication &&
                          selectedMedicalHistory.medication_type && (
                            <div>
                              <span className='font-medium'>Medication: </span>
                              <span>
                                {selectedMedicalHistory.medication_type}
                              </span>
                            </div>
                          )}
                        {selectedMedicalHistory.food &&
                          selectedMedicalHistory.food_type && (
                            <div>
                              <span className='font-medium'>Food: </span>
                              <span>{selectedMedicalHistory.food_type}</span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Family History */}
                  {selectedMedicalHistory.family_conditions && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          Family History
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingFamilyHistory && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => setIsEditingFamilyHistory(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={
                              isEditingFamilyHistory ? 'default' : 'ghost'
                            }
                            size='sm'
                            className='hover-lift rounded-md w-8 h-8 p-0 hover:border hover:border-border'
                            onClick={() =>
                              setIsEditingFamilyHistory(!isEditingFamilyHistory)
                            }
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='p-3 bg-muted/50 rounded-lg'>
                        <p className='text-sm'>
                          {selectedMedicalHistory.family_conditions}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Surgery History */}
                  {selectedMedicalHistory.surgery && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          Surgery History
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingSurgery && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => setIsEditingSurgery(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingSurgery ? 'default' : 'ghost'}
                            size='sm'
                            className='hover-lift rounded-md w-8 h-8 p-0 hover:border hover:border-border'
                            onClick={() =>
                              setIsEditingSurgery(!isEditingSurgery)
                            }
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='text-sm space-y-2'>
                        {selectedMedicalHistory.surgery_type && (
                          <div>
                            <span className='font-medium'>Type: </span>
                            <span>{selectedMedicalHistory.surgery_type}</span>
                          </div>
                        )}
                        {selectedMedicalHistory.surgery_year && (
                          <div>
                            <span className='font-medium'>Year: </span>
                            <span>{selectedMedicalHistory.surgery_year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {selectedMedicalHistory.recommendation_text && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          Recommendations
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingRecommendations && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => setIsEditingRecommendations(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={
                              isEditingRecommendations ? 'default' : 'ghost'
                            }
                            size='sm'
                            className='hover-lift rounded-md w-8 h-8 p-0 hover:border hover:border-border'
                            onClick={() =>
                              setIsEditingRecommendations(
                                !isEditingRecommendations
                              )
                            }
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                        <p className='text-sm text-blue-800'>
                          {selectedMedicalHistory.recommendation_text}
                        </p>
                      </div>
                    </div>
                  )}


                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create Medical History</DialogTitle>
              <DialogDescription>
                Add new medical history information
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='conditions' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='conditions'>Conditions</TabsTrigger>
                <TabsTrigger value='allergies'>Allergies</TabsTrigger>
                <TabsTrigger value='medications'>Medications</TabsTrigger>
                <TabsTrigger value='family'>Family History</TabsTrigger>
                <TabsTrigger value='surgery'>Surgery</TabsTrigger>
              </TabsList>

              <div className='space-y-4'>
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
              </div>

              <TabsContent value='conditions' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='high_blood_pressure'
                      checked={formData.high_blood_pressure || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          high_blood_pressure: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='high_blood_pressure'>
                      High Blood Pressure
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='high_cholesterol'
                      checked={formData.high_cholesterol || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          high_cholesterol: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='high_cholesterol'>High Cholesterol</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='diabetes'
                      checked={formData.diabetes || false}
                      onChange={e =>
                        setFormData({ ...formData, diabetes: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='diabetes'>Diabetes</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='thyroid_disease'
                      checked={formData.thyroid_disease || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          thyroid_disease: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='thyroid_disease'>Thyroid Disease</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='asthma'
                      checked={formData.asthma || false}
                      onChange={e =>
                        setFormData({ ...formData, asthma: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='asthma'>Asthma</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='epilepsy'
                      checked={formData.epilepsy || false}
                      onChange={e =>
                        setFormData({ ...formData, epilepsy: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='epilepsy'>Epilepsy</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='bipolar_mood_disorder'
                      checked={formData.bipolar_mood_disorder || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          bipolar_mood_disorder: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='bipolar_mood_disorder'>
                      Bipolar/Mood Disorder
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='anxiety_or_depression'
                      checked={formData.anxiety_or_depression || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          anxiety_or_depression: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='anxiety_or_depression'>
                      Anxiety/Depression
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='inflammatory_bowel_disease'
                      checked={formData.inflammatory_bowel_disease || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          inflammatory_bowel_disease: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='inflammatory_bowel_disease'>
                      Inflammatory Bowel Disease
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='tb'
                      checked={formData.tb || false}
                      onChange={e =>
                        setFormData({ ...formData, tb: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='tb'>Tuberculosis (TB)</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='hepatitis'
                      checked={formData.hepatitis || false}
                      onChange={e =>
                        setFormData({ ...formData, hepatitis: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='hepatitis'>Hepatitis</Label>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='other'>Other Conditions</Label>
                  <Input
                    id='other'
                    value={formData.other || ''}
                    onChange={e =>
                      setFormData({ ...formData, other: e.target.value })
                    }
                    placeholder='Specify other medical conditions'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes_text'>Notes</Label>
                  <Textarea
                    id='notes_text'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Additional notes about conditions'
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value='allergies' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='medication'
                      checked={formData.medication || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          medication: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='medication'>Medication Allergies</Label>
                  </div>
                  {formData.medication && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='medication_type'>Medication Type</Label>
                      <Input
                        id='medication_type'
                        value={formData.medication_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            medication_type: e.target.value,
                          })
                        }
                        placeholder='Specify medication allergy'
                      />
                      <Label htmlFor='medication_severity'>Severity</Label>
                      <Select
                        value={formData.medication_severity || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            medication_severity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select severity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mild'>Mild</SelectItem>
                          <SelectItem value='moderate'>Moderate</SelectItem>
                          <SelectItem value='severe'>Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='environmental'
                      checked={formData.environmental || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          environmental: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='environmental'>Environmental Allergies</Label>
                  </div>
                  {formData.environmental && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='environmental_type'>Environmental Type</Label>
                      <Input
                        id='environmental_type'
                        value={formData.environmental_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            environmental_type: e.target.value,
                          })
                        }
                        placeholder='Specify environmental allergy'
                      />
                      <Label htmlFor='enviromental_severity'>Severity</Label>
                      <Select
                        value={formData.enviromental_severity || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            enviromental_severity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select severity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mild'>Mild</SelectItem>
                          <SelectItem value='moderate'>Moderate</SelectItem>
                          <SelectItem value='severe'>Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='food'
                      checked={formData.food || false}
                      onChange={e =>
                        setFormData({ ...formData, food: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='food'>Food Allergies</Label>
                  </div>
                  {formData.food && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='food_type'>Food Type</Label>
                      <Input
                        id='food_type'
                        value={formData.food_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            food_type: e.target.value,
                          })
                        }
                        placeholder='Specify food allergy'
                      />
                      <Label htmlFor='food_severity'>Severity</Label>
                      <Select
                        value={formData.food_severity || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            food_severity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select severity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mild'>Mild</SelectItem>
                          <SelectItem value='moderate'>Moderate</SelectItem>
                          <SelectItem value='severe'>Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='medications' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='on_medication'
                      checked={formData.on_medication || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          on_medication: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='on_medication'>Currently on Medication</Label>
                  </div>
                  {formData.on_medication && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='chronic_medication'>Chronic Medication</Label>
                      <Textarea
                        id='chronic_medication'
                        value={formData.chronic_medication || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            chronic_medication: e.target.value,
                          })
                        }
                        placeholder='List current medications'
                        rows={3}
                      />
                      <Label htmlFor='vitamins_or_supplements'>
                        Vitamins or Supplements
                      </Label>
                      <Textarea
                        id='vitamins_or_supplements'
                        value={formData.vitamins_or_supplements || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            vitamins_or_supplements: e.target.value,
                          })
                        }
                        placeholder='List vitamins and supplements'
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='family' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='family_conditions'>Family Medical Conditions</Label>
                    <Textarea
                      id='family_conditions'
                      value={formData.family_conditions || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          family_conditions: e.target.value,
                        })
                      }
                      placeholder='Describe family medical history'
                      rows={4}
                    />
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='heart_attack'
                      checked={formData.heart_attack || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          heart_attack: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='heart_attack'>Family History of Heart Attack</Label>
                  </div>
                  {formData.heart_attack && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='heart_attack_60'>Under 60 years old?</Label>
                      <Select
                        value={formData.heart_attack_60 || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            heart_attack_60: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='yes'>Yes</SelectItem>
                          <SelectItem value='no'>No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='cancer_family'
                      checked={formData.cancer_family || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          cancer_family: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='cancer_family'>Family History of Cancer</Label>
                  </div>
                  {formData.cancer_family && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='type_cancer'>Type of Cancer</Label>
                      <Input
                        id='type_cancer'
                        value={formData.type_cancer || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            type_cancer: e.target.value,
                          })
                        }
                        placeholder='Specify type of cancer'
                      />
                      <Label htmlFor='age_of_cancer'>Age at Diagnosis</Label>
                      <Input
                        id='age_of_cancer'
                        value={formData.age_of_cancer || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            age_of_cancer: e.target.value,
                          })
                        }
                        placeholder='Age when diagnosed'
                      />
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label htmlFor='family_members'>Affected Family Members</Label>
                    <Input
                      id='family_members'
                      value={formData.family_members || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          family_members: e.target.value,
                        })
                      }
                      placeholder='List affected family members'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='other_family'>Other Family History</Label>
                    <Textarea
                      id='other_family'
                      value={formData.other_family || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          other_family: e.target.value,
                        })
                      }
                      placeholder='Other family medical history'
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='surgery' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='surgery'
                      checked={formData.surgery || false}
                      onChange={e =>
                        setFormData({ ...formData, surgery: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='surgery'>Previous Surgery</Label>
                  </div>
                  {formData.surgery && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='surgery_type'>Type of Surgery</Label>
                      <Input
                        id='surgery_type'
                        value={formData.surgery_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            surgery_type: e.target.value,
                          })
                        }
                        placeholder='Specify type of surgery'
                      />
                      <Label htmlFor='surgery_year'>Year of Surgery</Label>
                      <Input
                        id='surgery_year'
                        value={formData.surgery_year || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            surgery_year: e.target.value,
                          })
                        }
                        placeholder='Year (e.g., 2020)'
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateMedicalHistory} disabled={submitting}>
                {submitting && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                Create Medical History
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Similar structure to Create Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <div className='text-lg font-medium text-primary mb-2'>
                {selectedMedicalHistory?.employee_name || 'Unknown Employee'}
              </div>
              <DialogTitle>
                Edit Medical History
              </DialogTitle>
              <DialogDescription>
                Update medical history information
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='conditions' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='conditions'>Conditions</TabsTrigger>
                <TabsTrigger value='allergies'>Allergies</TabsTrigger>
                <TabsTrigger value='medications'>Medications</TabsTrigger>
                <TabsTrigger value='family'>Family History</TabsTrigger>
                <TabsTrigger value='surgery'>Surgery</TabsTrigger>
              </TabsList>

              <TabsContent value='conditions' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_high_blood_pressure'
                      checked={formData.high_blood_pressure || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          high_blood_pressure: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_high_blood_pressure'>
                      High Blood Pressure
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_high_cholesterol'
                      checked={formData.high_cholesterol || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          high_cholesterol: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_high_cholesterol'>High Cholesterol</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_diabetes'
                      checked={formData.diabetes || false}
                      onChange={e =>
                        setFormData({ ...formData, diabetes: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_diabetes'>Diabetes</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_thyroid_disease'
                      checked={formData.thyroid_disease || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          thyroid_disease: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_thyroid_disease'>Thyroid Disease</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_asthma'
                      checked={formData.asthma || false}
                      onChange={e =>
                        setFormData({ ...formData, asthma: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_asthma'>Asthma</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_epilepsy'
                      checked={formData.epilepsy || false}
                      onChange={e =>
                        setFormData({ ...formData, epilepsy: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_epilepsy'>Epilepsy</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_bipolar_mood_disorder'
                      checked={formData.bipolar_mood_disorder || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          bipolar_mood_disorder: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_bipolar_mood_disorder'>
                      Bipolar/Mood Disorder
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_anxiety_or_depression'
                      checked={formData.anxiety_or_depression || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          anxiety_or_depression: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_anxiety_or_depression'>
                      Anxiety/Depression
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_inflammatory_bowel_disease'
                      checked={formData.inflammatory_bowel_disease || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          inflammatory_bowel_disease: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_inflammatory_bowel_disease'>
                      Inflammatory Bowel Disease
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_tb'
                      checked={formData.tb || false}
                      onChange={e =>
                        setFormData({ ...formData, tb: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_tb'>Tuberculosis (TB)</Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_hepatitis'
                      checked={formData.hepatitis || false}
                      onChange={e =>
                        setFormData({ ...formData, hepatitis: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_hepatitis'>Hepatitis</Label>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_other'>Other Conditions</Label>
                  <Input
                    id='edit_other'
                    value={formData.other || ''}
                    onChange={e =>
                      setFormData({ ...formData, other: e.target.value })
                    }
                    placeholder='Specify other medical conditions'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit_notes_text'>Notes</Label>
                  <Textarea
                    id='edit_notes_text'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Additional notes about conditions'
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value='allergies' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_medication'
                      checked={formData.medication || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          medication: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_medication'>Medication Allergies</Label>
                  </div>
                  {formData.medication && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_medication_type'>Medication Type</Label>
                      <Input
                        id='edit_medication_type'
                        value={formData.medication_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            medication_type: e.target.value,
                          })
                        }
                        placeholder='Specify medication allergy'
                      />
                      <Label htmlFor='edit_medication_severity'>Severity</Label>
                      <Select
                        value={formData.medication_severity || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            medication_severity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select severity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mild'>Mild</SelectItem>
                          <SelectItem value='moderate'>Moderate</SelectItem>
                          <SelectItem value='severe'>Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_environmental'
                      checked={formData.environmental || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          environmental: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_environmental'>Environmental Allergies</Label>
                  </div>
                  {formData.environmental && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_environmental_type'>Environmental Type</Label>
                      <Input
                        id='edit_environmental_type'
                        value={formData.environmental_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            environmental_type: e.target.value,
                          })
                        }
                        placeholder='Specify environmental allergy'
                      />
                      <Label htmlFor='edit_enviromental_severity'>Severity</Label>
                      <Select
                        value={formData.enviromental_severity || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            enviromental_severity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select severity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mild'>Mild</SelectItem>
                          <SelectItem value='moderate'>Moderate</SelectItem>
                          <SelectItem value='severe'>Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_food'
                      checked={formData.food || false}
                      onChange={e =>
                        setFormData({ ...formData, food: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_food'>Food Allergies</Label>
                  </div>
                  {formData.food && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_food_type'>Food Type</Label>
                      <Input
                        id='edit_food_type'
                        value={formData.food_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            food_type: e.target.value,
                          })
                        }
                        placeholder='Specify food allergy'
                      />
                      <Label htmlFor='edit_food_severity'>Severity</Label>
                      <Select
                        value={formData.food_severity || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            food_severity: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select severity' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='mild'>Mild</SelectItem>
                          <SelectItem value='moderate'>Moderate</SelectItem>
                          <SelectItem value='severe'>Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='medications' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_on_medication'
                      checked={formData.on_medication || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          on_medication: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_on_medication'>Currently on Medication</Label>
                  </div>
                  {formData.on_medication && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_chronic_medication'>Chronic Medication</Label>
                      <Textarea
                        id='edit_chronic_medication'
                        value={formData.chronic_medication || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            chronic_medication: e.target.value,
                          })
                        }
                        placeholder='List current medications'
                        rows={3}
                      />
                      <Label htmlFor='edit_vitamins_or_supplements'>
                        Vitamins or Supplements
                      </Label>
                      <Textarea
                        id='edit_vitamins_or_supplements'
                        value={formData.vitamins_or_supplements || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            vitamins_or_supplements: e.target.value,
                          })
                        }
                        placeholder='List vitamins and supplements'
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='family' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='edit_family_conditions'>Family Medical Conditions</Label>
                    <Textarea
                      id='edit_family_conditions'
                      value={formData.family_conditions || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          family_conditions: e.target.value,
                        })
                      }
                      placeholder='Describe family medical history'
                      rows={4}
                    />
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_heart_attack'
                      checked={formData.heart_attack || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          heart_attack: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_heart_attack'>Family History of Heart Attack</Label>
                  </div>
                  {formData.heart_attack && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_heart_attack_60'>Under 60 years old?</Label>
                      <Select
                        value={formData.heart_attack_60 || ''}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            heart_attack_60: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='yes'>Yes</SelectItem>
                          <SelectItem value='no'>No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_cancer_family'
                      checked={formData.cancer_family || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          cancer_family: e.target.checked,
                        })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_cancer_family'>Family History of Cancer</Label>
                  </div>
                  {formData.cancer_family && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_type_cancer'>Type of Cancer</Label>
                      <Input
                        id='edit_type_cancer'
                        value={formData.type_cancer || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            type_cancer: e.target.value,
                          })
                        }
                        placeholder='Specify type of cancer'
                      />
                      <Label htmlFor='edit_age_of_cancer'>Age at Diagnosis</Label>
                      <Input
                        id='edit_age_of_cancer'
                        value={formData.age_of_cancer || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            age_of_cancer: e.target.value,
                          })
                        }
                        placeholder='Age when diagnosed'
                      />
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label htmlFor='edit_family_members'>Affected Family Members</Label>
                    <Input
                      id='edit_family_members'
                      value={formData.family_members || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          family_members: e.target.value,
                        })
                      }
                      placeholder='List affected family members'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='edit_other_family'>Other Family History</Label>
                    <Textarea
                      id='edit_other_family'
                      value={formData.other_family || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          other_family: e.target.value,
                        })
                      }
                      placeholder='Other family medical history'
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='surgery' className='space-y-4'>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='edit_surgery'
                      checked={formData.surgery || false}
                      onChange={e =>
                        setFormData({ ...formData, surgery: e.target.checked })
                      }
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='edit_surgery'>Previous Surgery</Label>
                  </div>
                  {formData.surgery && (
                    <div className='space-y-2 ml-6'>
                      <Label htmlFor='edit_surgery_type'>Type of Surgery</Label>
                      <Input
                        id='edit_surgery_type'
                        value={formData.surgery_type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            surgery_type: e.target.value,
                          })
                        }
                        placeholder='Specify type of surgery'
                      />
                      <Label htmlFor='edit_surgery_year'>Year of Surgery</Label>
                      <Input
                        id='edit_surgery_year'
                        value={formData.surgery_year || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            surgery_year: e.target.value,
                          })
                        }
                        placeholder='Year (e.g., 2020)'
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditMedicalHistory} disabled={submitting}>
                {submitting && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                Update Medical History
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Trash2 className='h-5 w-5 text-destructive' />
                Delete Medical History
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the medical history for{' '}
                <span className='font-medium'>
                  {deletingMedicalHistory
                    ? deletingMedicalHistory.employee_name || 'Unknown Employee'
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete Medical History
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function MedicalHistoryPage() {
  return (
    <Suspense fallback={<div />}> 
      <MedicalHistoryPageContent />
    </Suspense>
  );
}
