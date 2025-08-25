'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lifestyle } from '@/types';
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
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Search,
  Activity,
  Heart,
  Coffee,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Building2,
  Cigarette,
  Wine,
  Dumbbell,
  Apple,
  Moon,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { selectDisplayedData } from 'recharts/types/state/selectors/axisSelectors';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function LifestylePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allLifestyles, setAllLifestyles] = useState<Lifestyle[]>([]);
  const [filteredLifestyles, setFilteredLifestyles] = useState<Lifestyle[]>([]);
  const [displayedLifestyles, setDisplayedLifestyles] = useState<Lifestyle[]>(
    []
  );
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
  const [selectedLifestyle, setSelectedLifestyle] = useState<Lifestyle | null>(
    null
  );
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLifestyle, setEditingLifestyle] = useState<Lifestyle | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Lifestyle>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Section-specific edit states
  const [isSmokingEditOpen, setIsSmokingEditOpen] = useState(false);
  const [isAlcoholEditOpen, setIsAlcoholEditOpen] = useState(false);
  const [isExerciseEditOpen, setIsExerciseEditOpen] = useState(false);
  const [isDietEditOpen, setIsDietEditOpen] = useState(false);
  const [isSleepEditOpen, setIsSleepEditOpen] = useState(false);

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch all lifestyle data
  const fetchAllLifestyles = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/lifestyle', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '10000');
      url.searchParams.set('_t', Date.now().toString());

      const response = await fetch(url.toString(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();

      console.log('Lifestyle API Response:', data);
      console.log('Total lifestyles fetched:', data.lifestyles?.length || 0);

      setAllLifestyles(data.lifestyles || []);
    } catch (error) {
      console.error('Error fetching lifestyles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filterLifestyles = useCallback(
    (lifestyles: Lifestyle[], search: string) => {
      if (!search) return lifestyles;

      return lifestyles.filter(lifestyle => {
        const employeeName =
          `${lifestyle.employee_name || ''} ${lifestyle.employee_surname || ''}`.trim();
        const searchLower = search.toLowerCase();
        return (
          lifestyle.id?.toLowerCase().includes(searchLower) ||
          lifestyle.employee_id?.toLowerCase().includes(searchLower) ||
          lifestyle.report_id?.toLowerCase().includes(searchLower) ||
          employeeName.toLowerCase().includes(searchLower) ||
          lifestyle.employee_work_email?.toLowerCase().includes(searchLower) ||
          lifestyle.auditc_result?.toLowerCase().includes(searchLower) ||
          lifestyle.tics_result?.toLowerCase().includes(searchLower)
        );
      });
    },
    []
  );

  // Helper function to get employee name
  const getEmployeeName = (lifestyle: Lifestyle) => {
    return lifestyle.employee_name && lifestyle.employee_surname
      ? `${lifestyle.employee_name} ${lifestyle.employee_surname}`
      : 'Unknown Employee';
  };

  // Helper function to find lifestyle by employee ID
  // If an employee has multiple lifestyle records, select the first one
  const findLifestyleByEmployeeId = (
    lifestyles: Lifestyle[],
    employeeId: string
  ): Lifestyle | null => {
    const employeeLifestyles = lifestyles.filter(
      lifestyle => lifestyle.employee_id === employeeId
    );
    // Return the first lifestyle record if multiple exist, otherwise return null
    return employeeLifestyles.length > 0 ? employeeLifestyles[0] : null;
  };

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
      const response = await fetch('/api/lifestyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({});
        await fetchAllLifestyles();
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
      }
    } catch (error) {
      console.error('Error creating lifestyle:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/lifestyle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingLifestyle?.id }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingLifestyle(null);
        setFormData({});
        await fetchAllLifestyles();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
      }
    } catch (error) {
      console.error('Error updating lifestyle:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/lifestyle?id=${editingLifestyle?.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setEditingLifestyle(null);
        if (selectedLifestyle?.id === editingLifestyle?.id) {
          setSelectedLifestyle(null);
        }
        await fetchAllLifestyles();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
      }
    } catch (error) {
      console.error('Error deleting lifestyle:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Save section-specific data
  const handleSectionSave = async (sectionName: string) => {
    if (!selectedLifestyle?.id) {
      console.error('No lifestyle record selected for saving');
      return;
    }

    try {
      setFormLoading(true);

      // Start with the complete existing record to preserve all data
      let updateData: any = { ...selectedLifestyle };

      // Only update the specific fields for the section being edited
      switch (sectionName) {
        case 'smoking':
          if (formData.smoke !== undefined) updateData.smoke = formData.smoke;
          if (formData.smoke_qty !== undefined)
            updateData.smoke_qty = formData.smoke_qty;
          if (formData.smoke_years !== undefined)
            updateData.smoke_years = formData.smoke_years;
          if (formData.smoking_duration !== undefined)
            updateData.smoking_duration = formData.smoking_duration;
          break;
        case 'alcohol':
          if (formData.alochol_frequency !== undefined)
            updateData.alochol_frequency = formData.alochol_frequency;
          if (formData.alocohol_qty !== undefined)
            updateData.alocohol_qty = formData.alocohol_qty;
          if (formData.alcohol_excess !== undefined)
            updateData.alcohol_excess = formData.alcohol_excess;
          if (formData.alcohol_score !== undefined)
            updateData.alcohol_score = formData.alcohol_score;
          if (formData.auditc_result !== undefined)
            updateData.auditc_result = formData.auditc_result;
          if (formData.auditc_notes !== undefined)
            updateData.auditc_notes = formData.auditc_notes;
          break;
        case 'exercise':
          if (formData.exercise !== undefined)
            updateData.exercise = formData.exercise;
          if (formData.excercise_frequency !== undefined)
            updateData.excercise_frequency = formData.excercise_frequency;
          if (formData.excercise_minutes !== undefined)
            updateData.excercise_minutes = formData.excercise_minutes;
          if (formData.sitting_hours !== undefined)
            updateData.sitting_hours = formData.sitting_hours;
          break;
        case 'diet':
          if (formData.eatout_frequency !== undefined)
            updateData.eatout_frequency = formData.eatout_frequency;
          if (formData.fruitveg_frequency !== undefined)
            updateData.fruitveg_frequency = formData.fruitveg_frequency;
          if (formData.sugar_consumption !== undefined)
            updateData.sugar_consumption = formData.sugar_consumption;
          if (formData.diet_overall !== undefined)
            updateData.diet_overall = formData.diet_overall;
          break;
        case 'sleep':
          if (formData.sleep_hours !== undefined)
            updateData.sleep_hours = formData.sleep_hours;
          if (formData.sleep_rating !== undefined)
            updateData.sleep_rating = formData.sleep_rating;
          if (formData.sleep_rest !== undefined)
            updateData.sleep_rest = formData.sleep_rest;
          break;
        default:
          console.error(`Unknown section: ${sectionName}`);
          return;
      }

      console.log(`Saving ${sectionName} data:`, updateData);

      const response = await fetch('/api/lifestyle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedLifestyle = await response.json();
        console.log(`${sectionName} saved successfully:`, updatedLifestyle);

        // Update the selected lifestyle with new data
        setSelectedLifestyle(updatedLifestyle.lifestyle || updatedLifestyle);

        // Refresh all lifestyles to get updated data
        await fetchAllLifestyles();

        // Close the edit mode for the specific section
        switch (sectionName) {
          case 'smoking':
            setIsSmokingEditOpen(false);
            break;
          case 'alcohol':
            setIsAlcoholEditOpen(false);
            break;
          case 'exercise':
            setIsExerciseEditOpen(false);
            break;
          case 'diet':
            setIsDietEditOpen(false);
            break;
          case 'sleep':
            setIsSleepEditOpen(false);
            break;
        }

        // Clear form data after successful save
        setFormData({});

        // Show success feedback
        setSuccessMessage(
          `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section updated successfully!`
        );
        setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
        console.log(`${sectionName} section updated successfully`);
      } else {
        const error = await response.json();
        console.error(`${sectionName} save failed:`, error);
        // You can add error handling/display here
      }
    } catch (error) {
      console.error(`Error saving ${sectionName} data:`, error);
      // You can add error handling/display here
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (lifestyle: Lifestyle) => {
    setEditingLifestyle(lifestyle);
    setFormData(lifestyle);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (lifestyle: Lifestyle) => {
    setEditingLifestyle(lifestyle);
    setIsDeleteModalOpen(true);
  };

  // Client-side pagination
  const paginateLifestyles = useCallback(
    (lifestyles: Lifestyle[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = lifestyles.slice(startIndex, endIndex);

      const total = lifestyles.length;
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

      await new Promise(resolve => setTimeout(resolve, 150));

      const paginated = paginateLifestyles(
        filteredLifestyles,
        newPage,
        pagination.limit
      );
      setDisplayedLifestyles(paginated);

      setPageTransitioning(false);
    },
    [filteredLifestyles, pagination.limit, paginateLifestyles]
  );

  // Initial load
  useEffect(() => {
    fetchAllLifestyles();
    fetchEmployees();
  }, []);

  // Handle filtering when search term or all lifestyles change
  useEffect(() => {
    const filtered = filterLifestyles(allLifestyles, searchTerm);
    setFilteredLifestyles(filtered);

    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateLifestyles(filtered, page, pagination.limit);
    setDisplayedLifestyles(paginated);
  }, [
    allLifestyles,
    searchTerm,
    filterLifestyles,
    paginateLifestyles,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredLifestyles.length > 0) {
      transitionToPage(page);
    }
  }, [
    searchParams,
    pagination.page,
    filteredLifestyles.length,
    transitionToPage,
  ]);

  // Auto-select lifestyle when employee ID is in URL and lifestyles are loaded
  useEffect(() => {
    const employeeId = searchParams.get('employee');
    if (employeeId && allLifestyles.length > 0 && !selectedLifestyle) {
      const lifestyleToSelect = findLifestyleByEmployeeId(
        allLifestyles,
        employeeId
      );
      if (lifestyleToSelect) {
        setSelectedLifestyle(lifestyleToSelect);
      }
    }
  }, [searchParams, allLifestyles, selectedLifestyle]);

  // Re-check for employee ID when filtered lifestyles change (e.g., after search)
  useEffect(() => {
    const employeeId = searchParams.get('employee');
    if (employeeId && filteredLifestyles.length > 0) {
      const lifestyleToSelect = findLifestyleByEmployeeId(
        filteredLifestyles,
        employeeId
      );
      if (lifestyleToSelect && !selectedLifestyle) {
        setSelectedLifestyle(lifestyleToSelect);
      }
    }
  }, [filteredLifestyles, searchParams, selectedLifestyle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeId = searchParams.get('employee');
    updateURL(1, searchTerm, employeeId || undefined);
  };

  const updateURL = useCallback(
    (page: number, search: string, employeeId?: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);
      if (employeeId) params.set('employee', employeeId);

      const newURL = `/lifestyle${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    const employeeId = searchParams.get('employee');
    updateURL(newPage, searchTerm, employeeId || undefined);
    transitionToPage(newPage);
  };

  const handleLifestyleClick = (lifestyle: Lifestyle) => {
    setSelectedLifestyle(lifestyle);
    // Update URL to include employee ID
    updateURL(pagination.page, searchTerm, lifestyle.employee_id);
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

      const container = document.querySelector('.lifestyle-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

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
              <p className='text-muted-foreground'>Loading lifestyle data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        <div className='lifestyle-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Lifestyle Table */}
          <div
            className='space-y-4 animate-slide-up'
            style={{ width: selectedLifestyle ? `${leftWidth}%` : '100%' }}
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
                      placeholder='Search by employee name, ID, email...'
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
                        const employeeId = searchParams.get('employee');
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

            {/* Lifestyle Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                      <Activity className='h-6 w-6' />
                      Lifestyle Records ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                      Employee lifestyle assessments and health data
                    </CardDescription>
                  </div>
                  <Button
                    onClick={openCreateModal}
                    className={`hover-lift transition-all duration-300 ease-in-out ${
                      selectedLifestyle
                        ? 'w-12 h-12 rounded-full p-0'
                        : 'px-4 py-2'
                    }`}
                  >
                    <Plus
                      className={`${selectedLifestyle ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`}
                    />
                    {!selectedLifestyle && <span>New Record</span>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {displayedLifestyles.length === 0 ? (
                  <div className='text-center py-12'>
                    <Activity className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No lifestyle records found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No lifestyle records available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Smoking</TableHead>
                          <TableHead>Alcohol Risk</TableHead>
                          <TableHead>Exercise</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedLifestyles.map(lifestyle => (
                          <TableRow
                            key={lifestyle.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedLifestyle?.id === lifestyle.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleLifestyleClick(lifestyle)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {getEmployeeName(lifestyle)}
                                </div>
                                <div className='text-sm text-muted-foreground truncate'>
                                  {lifestyle.employee_work_email ||
                                    lifestyle.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  lifestyle.smoke ? 'destructive' : 'secondary'
                                }
                              >
                                {lifestyle.smoke ? 'Smoker' : 'Non-smoker'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  lifestyle.auditc_result?.includes('No Risk')
                                    ? 'secondary'
                                    : lifestyle.auditc_result?.includes(
                                          'Low Risk'
                                        )
                                      ? 'secondary'
                                      : lifestyle.auditc_result?.includes(
                                            'Risk'
                                          ) &&
                                          !lifestyle.auditc_result?.includes(
                                            'No Risk'
                                          ) &&
                                          !lifestyle.auditc_result?.includes(
                                            'Low Risk'
                                          )
                                        ? 'destructive'
                                        : 'outline'
                                }
                              >
                                {lifestyle.auditc_result || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {lifestyle.excercise_frequency || 'N/A'}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatDate(lifestyle.date_created)}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(lifestyle);
                                  }}
                                  className='hover-lift'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openDeleteModal(lifestyle);
                                  }}
                                  className='hover-lift text-destructive hover:text-destructive'
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
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className='hover-lift'
                      >
                        <ChevronsLeft className='h-4 w-4' />
                        <span
                          className={`${selectedLifestyle && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          First
                        </span>
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className='hover-lift'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        <span
                          className={`${selectedLifestyle && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          Previous
                        </span>
                      </Button>

                      {Array.from(
                        {
                          length: Math.min(
                            selectedLifestyle && leftWidth < 50 ? 3 : 5,
                            pagination.totalPages
                          ),
                        },
                        (_, i) => {
                          const startPage = Math.max(
                            1,
                            pagination.page -
                              (selectedLifestyle && leftWidth < 50 ? 1 : 2)
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
                          className={`${selectedLifestyle && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
                          className={`${selectedLifestyle && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
          {selectedLifestyle && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Lifestyle Details */}
          {selectedLifestyle && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        Lifestyle Assessment
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <span className='text-lg font-medium'>
                          {getEmployeeName(selectedLifestyle)}
                        </span>
                        <Badge variant='outline'>{selectedLifestyle.id}</Badge>
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditModal(selectedLifestyle)}
                        className='hover-lift'
                        title='Edit lifestyle record'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSelectedLifestyle(null);
                          // Remove employeeId from URL when closing lifestyle
                          updateURL(pagination.page, searchTerm);
                        }}
                        className='hover-lift'
                        title='Close lifestyle record'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Success Message */}
                  {successMessage && (
                    <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-lg'>
                      <div className='flex items-center gap-2 text-green-700'>
                        <CheckCircle className='h-4 w-4' />
                        <span className='text-sm font-medium'>
                          {successMessage}
                        </span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Smoking Information */}
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Cigarette className='h-4 w-4' />
                        {selectedLifestyle.smoking_header ||
                          'Smoking Information'}
                      </h3>
                      {!isSmokingEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsSmokingEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit smoking information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsSmokingEditOpen(false)}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Cancel editing'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('smoking')}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Save changes'
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

                    {!isSmokingEditOpen ? (
                      // Display current smoking information
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Smoker:
                          </span>
                          <Badge
                            variant={
                              selectedLifestyle.smoke
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {selectedLifestyle.smoke ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        {selectedLifestyle.smoke_qty && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Quantity:
                            </span>
                            <span className='font-medium'>
                              {selectedLifestyle.smoke_qty}
                            </span>
                          </div>
                        )}
                        {selectedLifestyle.smoke_years && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Years:
                            </span>
                            <span className='font-medium'>
                              {selectedLifestyle.smoke_years}
                            </span>
                          </div>
                        )}
                        {selectedLifestyle.smoking_duration && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Duration:
                            </span>
                            <span className='font-medium'>
                              {selectedLifestyle.smoking_duration}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='smoke'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Smoker:
                          </Label>
                          <Select
                            value={formData.smoke ? 'true' : 'false'}
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                smoke: value === 'true',
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='false'>No</SelectItem>
                              <SelectItem value='true'>Yes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='smoke_qty'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Quantity:
                          </Label>
                          <Input
                            id='smoke_qty'
                            value={
                              formData.smoke_qty !== undefined
                                ? formData.smoke_qty
                                : selectedLifestyle.smoke_qty || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                smoke_qty: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 5 cigarettes per day'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='smoke_years'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Years:
                          </Label>
                          <Input
                            id='smoke_years'
                            value={
                              formData.smoke_years !== undefined
                                ? formData.smoke_years
                                : selectedLifestyle.smoke_years || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                smoke_years: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 10 years'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='smoking_duration'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Duration:
                          </Label>
                          <Input
                            id='smoking_duration'
                            value={
                              formData.smoking_duration !== undefined
                                ? formData.smoking_duration
                                : selectedLifestyle.smoking_duration || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                smoking_duration: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 2 hours per day'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Alcohol Information */}
                  <div className='space-y-3' id='alcohol'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Wine className='h-4 w-4' />
                        {selectedLifestyle.alcohol_header ||
                          'Alcohol Information'}
                      </h3>
                      {!isAlcoholEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsAlcoholEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit alcohol information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsAlcoholEditOpen(false)}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Cancel editing'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('alcohol')}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Save changes'
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

                    {!isAlcoholEditOpen ? (
                      // Display current alcohol information
                      <div className='space-y-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Frequency:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.alochol_frequency || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Quantity:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.alocohol_qty || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Excess:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.alcohol_excess || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Total Score:
                          </span>
                          <Badge variant='outline'>
                            {selectedLifestyle.alcohol_score || 0}
                          </Badge>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            AUDIT-C Result:
                          </span>
                          <Badge
                            variant={
                              selectedLifestyle.auditc_result?.includes(
                                'No Risk'
                              )
                                ? 'secondary'
                                : selectedLifestyle.auditc_result?.includes(
                                      'Low Risk'
                                    )
                                  ? 'secondary'
                                  : selectedLifestyle.auditc_result?.includes(
                                        'Risk'
                                      ) &&
                                      !selectedLifestyle.auditc_result?.includes(
                                        'No Risk'
                                      ) &&
                                      !selectedLifestyle.auditc_result?.includes(
                                        'Low Risk'
                                      )
                                    ? 'destructive'
                                    : 'outline'
                            }
                          >
                            {selectedLifestyle.auditc_result || 'N/A'}
                          </Badge>
                        </div>
                        {selectedLifestyle.auditc_notes && (
                          <div className='p-3 bg-muted rounded-lg'>
                            <p className='text-xs text-muted-foreground mb-1'>
                              Notes:
                            </p>
                            <p>{selectedLifestyle.auditc_notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='space-y-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='alcohol_frequency'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Frequency:
                          </Label>
                          <Select
                            value={
                              formData.alochol_frequency ||
                              selectedLifestyle.alochol_frequency ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                alochol_frequency: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select frequency' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Never'>Never</SelectItem>
                              <SelectItem value='1/month'>
                                Monthly or less
                              </SelectItem>
                              <SelectItem value='2-4 times/month'>
                                2-4 times a month
                              </SelectItem>
                              <SelectItem value='2-3 times/week'>
                                2-3 times a week
                              </SelectItem>
                              <SelectItem value='4+ times/week'>
                                4 or more times a week
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='alcohol_qty'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Quantity:
                          </Label>
                          <Input
                            id='alcohol_qty'
                            value={
                              formData.alocohol_qty !== undefined
                                ? formData.alocohol_qty
                                : selectedLifestyle.alocohol_qty || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                alocohol_qty: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 2 drinks per session'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='alcohol_excess'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Excess:
                          </Label>
                          <Input
                            id='alcohol_excess'
                            value={
                              formData.alcohol_excess !== undefined
                                ? formData.alcohol_excess
                                : selectedLifestyle.alcohol_excess || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                alcohol_excess: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 6+ drinks per session'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='alcohol_score'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Total Score:
                          </Label>
                          <Input
                            id='alcohol_score'
                            type='number'
                            value={
                              formData.alcohol_score !== undefined
                                ? formData.alcohol_score
                                : selectedLifestyle.alcohol_score || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                alcohol_score: parseInt(e.target.value) || 0,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='0'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='auditc_result'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            AUDIT-C Result:
                          </Label>
                          <Select
                            value={
                              formData.auditc_result ||
                              selectedLifestyle.auditc_result ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                auditc_result: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select result' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='No Risk'>No Risk</SelectItem>
                              <SelectItem value='Low Risk'>Low Risk</SelectItem>
                              <SelectItem value='Medium Risk'>
                                Medium Risk
                              </SelectItem>
                              <SelectItem value='High Risk'>
                                High Risk
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='auditc_notes'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Notes:
                          </Label>
                          <Textarea
                            id='auditc_notes'
                            value={
                              formData.auditc_notes !== undefined
                                ? formData.auditc_notes
                                : selectedLifestyle.auditc_notes || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                auditc_notes: e.target.value,
                              })
                            }
                            className='h-8 text-sm min-h-[32px]'
                            placeholder='Additional notes about alcohol consumption...'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Exercise Information */}
                  <div className='space-y-3' id='exercise-and-activity'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Dumbbell className='h-4 w-4' />
                        Exercise & Activity
                      </h3>
                      {!isExerciseEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsExerciseEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit exercise & activity information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsExerciseEditOpen(false)}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Cancel editing'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('exercise')}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Save changes'
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

                    {!isExerciseEditOpen ? (
                      // Display current exercise information
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Exercise:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.exercise || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Frequency:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.excercise_frequency || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Duration:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.excercise_minutes || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Sitting Hours:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.sitting_hours || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='exercise'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Exercise:
                          </Label>
                          <Input
                            id='exercise'
                            value={
                              formData.exercise !== undefined
                                ? formData.exercise
                                : selectedLifestyle.exercise || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                exercise: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='Enter exercise type'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='exercise_frequency'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Frequency:
                          </Label>
                          <Select
                            value={
                              formData.excercise_frequency ||
                              selectedLifestyle.excercise_frequency ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                excercise_frequency: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select frequency' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Never'>Never</SelectItem>
                              <SelectItem value='Seldom'>Seldom</SelectItem>
                              <SelectItem value='Once or twice a week'>
                                1-2 times per week
                              </SelectItem>
                              <SelectItem value='3 times a week'>
                                3 times per week
                              </SelectItem>
                              <SelectItem value='4 times a week'>
                                4 times per week
                              </SelectItem>
                              <SelectItem value='Daily or more often'>
                                Daily or more
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='exercise_duration'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Duration:
                          </Label>
                          <Select
                            value={
                              formData.excercise_minutes ||
                              selectedLifestyle.excercise_minutes ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                excercise_minutes: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select duration' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="I don't exercise">
                                Don't exercise
                              </SelectItem>
                              <SelectItem value='30 minutes'>
                                30 minutes
                              </SelectItem>
                              <SelectItem value='60 minutes'>
                                60 minutes
                              </SelectItem>
                              <SelectItem value='More than150 mins'>
                                More than 150 mins
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='sitting_hours'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Sitting Hours:
                          </Label>
                          <Input
                            id='sitting_hours'
                            value={
                              formData.sitting_hours !== undefined
                                ? formData.sitting_hours
                                : selectedLifestyle.sitting_hours || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                sitting_hours: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 8 hours'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Diet Information */}
                  <div className='space-y-3' id='diet'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Apple className='h-4 w-4' />
                        {selectedLifestyle.diet_header || 'Diet Information'}
                      </h3>
                      {!isDietEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsDietEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit diet information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsDietEditOpen(false)}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Cancel editing'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('diet')}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Save changes'
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

                    {!isDietEditOpen ? (
                      // Display current diet information
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Eat Out:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.eatout_frequency || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Fruit & Veg:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.fruitveg_frequency || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Sugar:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.sugar_consumption || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Overall:
                          </span>
                          <Badge variant='outline'>
                            {selectedLifestyle.diet_overall || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='eatout_frequency'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Eat Out:
                          </Label>
                          <Select
                            value={
                              formData.eatout_frequency ||
                              selectedLifestyle.eatout_frequency ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                eatout_frequency: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select frequency' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Never'>Never</SelectItem>
                              <SelectItem value='Rarely'>Rarely</SelectItem>
                              <SelectItem value='Sometimes'>
                                Sometimes
                              </SelectItem>
                              <SelectItem value='Often'>Often</SelectItem>
                              <SelectItem value='Very Often'>
                                Very Often
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='fruitveg_frequency'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Fruit & Veg:
                          </Label>
                          <Select
                            value={
                              formData.fruitveg_frequency ||
                              selectedLifestyle.fruitveg_frequency ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                fruitveg_frequency: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select frequency' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Never'>Never</SelectItem>
                              <SelectItem value='Rarely'>Rarely</SelectItem>
                              <SelectItem value='Sometimes'>
                                Sometimes
                              </SelectItem>
                              <SelectItem value='Often'>Often</SelectItem>
                              <SelectItem value='Daily'>Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='sugar_consumption'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Sugar:
                          </Label>
                          <Select
                            value={
                              formData.sugar_consumption ||
                              selectedLifestyle.sugar_consumption ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                sugar_consumption: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select consumption' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='None'>None</SelectItem>
                              <SelectItem value='Low'>Low</SelectItem>
                              <SelectItem value='Moderate'>Moderate</SelectItem>
                              <SelectItem value='High'>High</SelectItem>
                              <SelectItem value='Very High'>
                                Very High
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='diet_overall'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Overall:
                          </Label>
                          <Select
                            value={
                              formData.diet_overall ||
                              selectedLifestyle.diet_overall ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                diet_overall: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select rating' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Poor'>Poor</SelectItem>
                              <SelectItem value='Fair'>Fair</SelectItem>
                              <SelectItem value='Good but could be better'>
                                Good but could be better
                              </SelectItem>
                              <SelectItem value='Good with a large variety of fruit and veg, and low sugar'>
                                Excellent
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Sleep Information */}
                  <div className='space-y-3' id='sleep'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Moon className='h-4 w-4' />
                        {selectedLifestyle.sleep_header || 'Sleep Information'}
                      </h3>
                      {!isSleepEditOpen ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsSleepEditOpen(true)}
                          className='hover-lift h-8 w-8 p-0'
                          title='Edit sleep information'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsSleepEditOpen(false)}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Cancel editing'
                            disabled={formLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => handleSectionSave('sleep')}
                            className='hover-lift h-6 px-2 text-xs'
                            title='Save changes'
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

                    {!isSleepEditOpen ? (
                      // Display current sleep information
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Sleep Hours:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.sleep_hours || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Sleep Rating:
                          </span>
                          <Badge variant='outline'>
                            {selectedLifestyle.sleep_rating || 'N/A'}
                          </Badge>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Rest Quality:
                          </span>
                          <span className='font-medium'>
                            {selectedLifestyle.sleep_rest || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Show input fields for editing
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='sleep_hours'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Sleep Hours:
                          </Label>
                          <Input
                            id='sleep_hours'
                            value={
                              formData.sleep_hours !== undefined
                                ? formData.sleep_hours
                                : selectedLifestyle.sleep_hours || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                sleep_hours: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., 8 hours'
                          />
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='sleep_rating'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Sleep Rating:
                          </Label>
                          <Select
                            value={
                              formData.sleep_rating ||
                              selectedLifestyle.sleep_rating ||
                              ''
                            }
                            onValueChange={value =>
                              setFormData({
                                ...formData,
                                sleep_rating: value,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select quality' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Poor'>Poor</SelectItem>
                              <SelectItem value='Ok, could be better'>
                                Ok, could be better
                              </SelectItem>
                              <SelectItem value='Good'>Good</SelectItem>
                              <SelectItem value='Excellent'>
                                Excellent
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Label
                            htmlFor='sleep_rest'
                            className='text-muted-foreground min-w-[120px] text-xs'
                          >
                            Rest Quality:
                          </Label>
                          <Input
                            id='sleep_rest'
                            value={
                              formData.sleep_rest !== undefined
                                ? formData.sleep_rest
                                : selectedLifestyle.sleep_rest || ''
                            }
                            onChange={e =>
                              setFormData({
                                ...formData,
                                sleep_rest: e.target.value,
                              })
                            }
                            className='h-8 text-sm'
                            placeholder='e.g., Restful, Light, Deep'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedLifestyle.notes_text && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          {selectedLifestyle.notes_header || 'Notes'}
                        </h3>
                        <div className='text-sm p-3 bg-muted rounded-lg'>
                          {selectedLifestyle.notes_text}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedLifestyle.recommendation_text && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Heart className='h-4 w-4' />
                          Recommendations
                        </h3>
                        <div className='text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                          {selectedLifestyle.recommendation_text}
                        </div>
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
              <DialogTitle>Create New Lifestyle Record</DialogTitle>
              <DialogDescription>
                Add a new lifestyle assessment for an employee.
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
                <Label htmlFor='smoke'>Smoking Status</Label>
                <Select
                  value={formData.smoke ? 'true' : 'false'}
                  onValueChange={value =>
                    setFormData({ ...formData, smoke: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select smoking status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='false'>Non-smoker</SelectItem>
                    <SelectItem value='true'>Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='smoke_qty'>Smoking Quantity</Label>
                <Input
                  id='smoke_qty'
                  value={formData.smoke_qty || ''}
                  onChange={e =>
                    setFormData({ ...formData, smoke_qty: e.target.value })
                  }
                  placeholder='e.g., 5 cigarettes per day'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='alochol_frequency'>Alcohol Frequency</Label>
                <Select
                  value={formData.alochol_frequency || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, alochol_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select frequency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Never'>Never</SelectItem>
                    <SelectItem value='1/month'>Monthly or less</SelectItem>
                    <SelectItem value='2-4 times/month'>
                      2-4 times a month
                    </SelectItem>
                    <SelectItem value='2-3 times/week'>
                      2-3 times a week
                    </SelectItem>
                    <SelectItem value='4+ times/week'>
                      4 or more times a week
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='auditc_result'>AUDIT-C Result</Label>
                <Select
                  value={formData.auditc_result || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, auditc_result: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='No Risk'>No Risk</SelectItem>
                    <SelectItem value='Low Risk'>Low Risk</SelectItem>
                    <SelectItem value='Medium Risk'>Medium Risk</SelectItem>
                    <SelectItem value='High Risk'>High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excercise_frequency'>Exercise Frequency</Label>
                <Select
                  value={formData.excercise_frequency || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, excercise_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select frequency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Never'>Never</SelectItem>
                    <SelectItem value='Seldom'>Seldom</SelectItem>
                    <SelectItem value='Once or twice a week'>
                      1-2 times per week
                    </SelectItem>
                    <SelectItem value='3 times a week'>
                      3 times per week
                    </SelectItem>
                    <SelectItem value='4 times a week'>
                      4 times per week
                    </SelectItem>
                    <SelectItem value='Daily or more often'>
                      Daily or more
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excercise_minutes'>Exercise Duration</Label>
                <Select
                  value={formData.excercise_minutes || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, excercise_minutes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select duration' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I don't exercise">
                      Don't exercise
                    </SelectItem>
                    <SelectItem value='30 minutes'>30 minutes</SelectItem>
                    <SelectItem value='60 minutes'>60 minutes</SelectItem>
                    <SelectItem value='More than150 mins'>
                      More than 150 mins
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='diet_overall'>Overall Diet Rating</Label>
                <Select
                  value={formData.diet_overall || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, diet_overall: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select rating' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Poor'>Poor</SelectItem>
                    <SelectItem value='Fair'>Fair</SelectItem>
                    <SelectItem value='Good but could be better'>
                      Good but could be better
                    </SelectItem>
                    <SelectItem value='Good with a large variety of fruit and veg, and low sugar'>
                      Excellent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='sleep_rating'>Sleep Quality</Label>
                <Select
                  value={formData.sleep_rating || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, sleep_rating: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select quality' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Poor'>Poor</SelectItem>
                    <SelectItem value='Ok, could be better'>
                      Ok, could be better
                    </SelectItem>
                    <SelectItem value='Good'>Good</SelectItem>
                    <SelectItem value='Excellent'>Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_text'>Notes</Label>
                <Textarea
                  id='notes_text'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder='Additional notes about lifestyle assessment...'
                  rows={3}
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='recommendation_text'>Recommendations</Label>
                <Textarea
                  id='recommendation_text'
                  value={formData.recommendation_text || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      recommendation_text: e.target.value,
                    })
                  }
                  placeholder='Health and lifestyle recommendations...'
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
                    Create Record
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
              <DialogTitle>Edit Lifestyle Record</DialogTitle>
              <DialogDescription>
                Update the lifestyle assessment for{' '}
                {editingLifestyle ? getEmployeeName(editingLifestyle) : ''}.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id_edit'>Employee</Label>
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
                <Label htmlFor='report_id_edit'>Report ID</Label>
                <Input
                  id='report_id_edit'
                  value={formData.report_id || ''}
                  onChange={e =>
                    setFormData({ ...formData, report_id: e.target.value })
                  }
                  placeholder='Link to medical report'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='smoke_edit'>Smoking Status</Label>
                <Select
                  value={formData.smoke ? 'true' : 'false'}
                  onValueChange={value =>
                    setFormData({ ...formData, smoke: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select smoking status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='false'>Non-smoker</SelectItem>
                    <SelectItem value='true'>Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='smoke_qty_edit'>Smoking Quantity</Label>
                <Input
                  id='smoke_qty_edit'
                  value={formData.smoke_qty || ''}
                  onChange={e =>
                    setFormData({ ...formData, smoke_qty: e.target.value })
                  }
                  placeholder='e.g., 5 cigarettes per day'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='alochol_frequency_edit'>
                  Alcohol Frequency
                </Label>
                <Select
                  value={formData.alochol_frequency || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, alochol_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select frequency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Never'>Never</SelectItem>
                    <SelectItem value='1/month'>Monthly or less</SelectItem>
                    <SelectItem value='2-4 times/month'>
                      2-4 times a month
                    </SelectItem>
                    <SelectItem value='2-3 times/week'>
                      2-3 times a week
                    </SelectItem>
                    <SelectItem value='4+ times/week'>
                      4 or more times a week
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='auditc_result_edit'>AUDIT-C Result</Label>
                <Select
                  value={formData.auditc_result || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, auditc_result: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='No Risk'>No Risk</SelectItem>
                    <SelectItem value='Low Risk'>Low Risk</SelectItem>
                    <SelectItem value='Medium Risk'>Medium Risk</SelectItem>
                    <SelectItem value='High Risk'>High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excercise_frequency_edit'>
                  Exercise Frequency
                </Label>
                <Select
                  value={formData.excercise_frequency || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, excercise_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select frequency' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Never'>Never</SelectItem>
                    <SelectItem value='Seldom'>Seldom</SelectItem>
                    <SelectItem value='Once or twice a week'>
                      1-2 times per week
                    </SelectItem>
                    <SelectItem value='3 times a week'>
                      3 times per week
                    </SelectItem>
                    <SelectItem value='4 times a week'>
                      4 times per week
                    </SelectItem>
                    <SelectItem value='Daily or more often'>
                      Daily or more
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='excercise_minutes_edit'>
                  Exercise Duration
                </Label>
                <Select
                  value={formData.excercise_minutes || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, excercise_minutes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select duration' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I don't exercise">
                      Don't exercise
                    </SelectItem>
                    <SelectItem value='30 minutes'>30 minutes</SelectItem>
                    <SelectItem value='60 minutes'>60 minutes</SelectItem>
                    <SelectItem value='More than150 mins'>
                      More than 150 mins
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='diet_overall_edit'>Overall Diet Rating</Label>
                <Select
                  value={formData.diet_overall || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, diet_overall: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select rating' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Poor'>Poor</SelectItem>
                    <SelectItem value='Fair'>Fair</SelectItem>
                    <SelectItem value='Good but could be better'>
                      Good but could be better
                    </SelectItem>
                    <SelectItem value='Good with a large variety of fruit and veg, and low sugar'>
                      Excellent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='sleep_rating_edit'>Sleep Quality</Label>
                <Select
                  value={formData.sleep_rating || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, sleep_rating: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select quality' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Poor'>Poor</SelectItem>
                    <SelectItem value='Ok, could be better'>
                      Ok, could be better
                    </SelectItem>
                    <SelectItem value='Good'>Good</SelectItem>
                    <SelectItem value='Excellent'>Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_text_edit'>Notes</Label>
                <Textarea
                  id='notes_text_edit'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder='Additional notes about lifestyle assessment...'
                  rows={3}
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='recommendation_text_edit'>
                  Recommendations
                </Label>
                <Textarea
                  id='recommendation_text_edit'
                  value={formData.recommendation_text || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      recommendation_text: e.target.value,
                    })
                  }
                  placeholder='Health and lifestyle recommendations...'
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Update Record
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
                Delete Lifestyle Record
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lifestyle record for{' '}
                <span className='font-medium'>
                  {editingLifestyle ? getEmployeeName(editingLifestyle) : ''}
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
                    Delete Record
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
