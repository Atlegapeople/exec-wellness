'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LabTest } from '@/types';
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
  FlaskConical,
  Heart,
  Stethoscope,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Building2,
  Activity,
  Droplets,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  Zap,
  Shield,
  Beaker,
} from 'lucide-react';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function LabTestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract employee filter from URL
  const employeeFilter = searchParams.get('employee');

  console.log('LabTestsPage render - employeeFilter:', employeeFilter);

  const [allLabTests, setAllLabTests] = useState<LabTest[]>([]);
  const [filteredLabTests, setFilteredLabTests] = useState<LabTest[]>([]);
  const [displayedLabTests, setDisplayedLabTests] = useState<LabTest[]>([]);
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
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState<LabTest | null>(null);
  const [formData, setFormData] = useState<Partial<LabTest>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Sub-section edit states
  const [isEditingBasicBloodWork, setIsEditingBasicBloodWork] = useState(false);
  const [isEditingCardiovascularMarkers, setIsEditingCardiovascularMarkers] =
    useState(false);
  const [isEditingMetabolicPanel, setIsEditingMetabolicPanel] = useState(false);
  const [isEditingOrganFunction, setIsEditingOrganFunction] = useState(false);
  const [isEditingVitaminsHormones, setIsEditingVitaminsHormones] =
    useState(false);

  // Sub-section form data
  const [basicBloodWorkData, setBasicBloodWorkData] = useState({
    full_blood_count_an_esr: '',
    hiv: '',
  });
  const [cardiovascularMarkersData, setCardiovascularMarkersData] = useState({
    total_cholesterol: '',
    hdl: '',
    'hs-crp': '',
    homocysteine: '',
  });
  const [metabolicPanelData, setMetabolicPanelData] = useState({
    fasting_glucose: '',
    hba1c: '',
    insulin_level: '',
    uric_acid: '',
  });
  const [organFunctionData, setOrganFunctionData] = useState({
    kidney_function: '',
    liver_enzymes: '',
  });
  const [vitaminsHormonesData, setVitaminsHormonesData] = useState({
    vitamin_d: '',
    thyroid_stimulating_hormone: '',
    psa: '',
  });

  // Fetch all lab tests data
  const fetchAllLabTests = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL('/api/lab-tests', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '10000');
      url.searchParams.set('_t', Date.now().toString());

      // Add employee filter if present
      if (employeeFilter) {
        url.searchParams.set('employee', employeeFilter);
      }

      const response = await fetch(url.toString(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();

      console.log('Lab Tests API Response:', data);
      console.log('Total lab tests fetched:', data.labTests?.length || 0);

      setAllLabTests(data.labTests || []);

      // If there's an employee filter, automatically select the first lab test
      if (employeeFilter && data.labTests && data.labTests.length > 0) {
        const employeeLabTest = data.labTests[0];
        console.log('Auto-selecting lab test:', employeeLabTest);
        setSelectedLabTest(employeeLabTest);
      } else if (
        employeeFilter &&
        data.labTests &&
        data.labTests.length === 0
      ) {
        // No lab test found for this employee, open the create modal with employee ID pre-filled
        console.log('No lab test found for employee, opening create modal');
        console.log('Setting form data with employee_id:', employeeFilter);
        setFormData({ employee_id: employeeFilter });
        setIsCreateModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeFilter]);

  // Client-side filtering
  const filterLabTests = useCallback((labTests: LabTest[], search: string) => {
    if (!search) return labTests;

    return labTests.filter(labTest => {
      const employeeName =
        `${labTest.employee_name || ''} ${labTest.employee_surname || ''}`.trim();
      const searchLower = search.toLowerCase();
      return (
        labTest.id?.toLowerCase().includes(searchLower) ||
        labTest.employee_id?.toLowerCase().includes(searchLower) ||
        labTest.report_id?.toLowerCase().includes(searchLower) ||
        employeeName.toLowerCase().includes(searchLower) ||
        labTest.employee_work_email?.toLowerCase().includes(searchLower) ||
        labTest.vitamin_d?.toLowerCase().includes(searchLower) ||
        labTest.total_cholesterol?.toLowerCase().includes(searchLower) ||
        labTest.hiv?.toLowerCase().includes(searchLower)
      );
    });
  }, []);

  // Helper function to get employee name
  const getEmployeeName = (labTest: LabTest) => {
    return labTest.employee_name && labTest.employee_surname
      ? `${labTest.employee_name} ${labTest.employee_surname}`
      : 'Unknown Employee';
  };

  // Sub-section save functions
  const handleSaveBasicBloodWork = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/lab-tests/${selectedLabTest?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicBloodWorkData),
      });

      if (response.ok) {
        setIsEditingBasicBloodWork(false);
        fetchAllLabTests();
      }
    } catch (error) {
      console.error('Error saving basic blood work:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveCardiovascularMarkers = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/lab-tests/${selectedLabTest?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardiovascularMarkersData),
      });

      if (response.ok) {
        setIsEditingCardiovascularMarkers(false);
        fetchAllLabTests();
      }
    } catch (error) {
      console.error('Error saving cardiovascular markers:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveMetabolicPanel = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/lab-tests/${selectedLabTest?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metabolicPanelData),
      });

      if (response.ok) {
        setIsEditingMetabolicPanel(false);
        fetchAllLabTests();
      }
    } catch (error) {
      console.error('Error saving metabolic panel:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveOrganFunction = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/lab-tests/${selectedLabTest?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organFunctionData),
      });

      if (response.ok) {
        setIsEditingOrganFunction(false);
        fetchAllLabTests();
      }
    } catch (error) {
      console.error('Error saving organ function:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveVitaminsHormones = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/lab-tests/${selectedLabTest?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vitaminsHormonesData),
      });

      if (response.ok) {
        setIsEditingVitaminsHormones(false);
        fetchAllLabTests();
      }
    } catch (error) {
      console.error('Error saving vitamins & hormones:', error);
    } finally {
      setFormLoading(false);
    }
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
      const response = await fetch('/api/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        // Preserve employee_id if it came from URL parameter
        if (employeeFilter) {
          setFormData({ employee_id: employeeFilter });
        } else {
          setFormData({});
        }
        await fetchAllLabTests();
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
      }
    } catch (error) {
      console.error('Error creating lab test:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/lab-tests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingLabTest?.id }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingLabTest(null);
        setFormData({});
        await fetchAllLabTests();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
      }
    } catch (error) {
      console.error('Error updating lab test:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`/api/lab-tests?id=${editingLabTest?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setEditingLabTest(null);
        if (selectedLabTest?.id === editingLabTest?.id) {
          setSelectedLabTest(null);
        }
        await fetchAllLabTests();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
      }
    } catch (error) {
      console.error('Error deleting lab test:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    // Preserve employee_id if it's already set (e.g., from URL parameter)
    const currentEmployeeId = formData.employee_id;
    console.log('openCreateModal - currentEmployeeId:', currentEmployeeId);
    setFormData(currentEmployeeId ? { employee_id: currentEmployeeId } : {});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (labTest: LabTest) => {
    setEditingLabTest(labTest);
    setFormData(labTest);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (labTest: LabTest) => {
    setEditingLabTest(labTest);
    setIsDeleteModalOpen(true);
  };

  const closeCreateModal = () => {
    // If employee_id came from URL parameter, preserve it; otherwise reset form
    console.log(
      'closeCreateModal - employeeFilter:',
      employeeFilter,
      'formData.employee_id:',
      formData.employee_id
    );
    if (employeeFilter && !formData.employee_id) {
      console.log('Preserving employee_id from URL:', employeeFilter);
      setFormData({ employee_id: employeeFilter });
    } else {
      console.log('Resetting form data');
      setFormData({});
    }
    setIsCreateModalOpen(false);
  };

  // Client-side pagination
  const paginateLabTests = useCallback(
    (labTests: LabTest[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = labTests.slice(startIndex, endIndex);

      const total = labTests.length;
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

      const paginated = paginateLabTests(
        filteredLabTests,
        newPage,
        pagination.limit
      );
      setDisplayedLabTests(paginated);

      setPageTransitioning(false);
    },
    [filteredLabTests, pagination.limit, paginateLabTests]
  );

  // Initial load
  useEffect(() => {
    fetchAllLabTests();
    fetchEmployees();
  }, [fetchAllLabTests]);

  // Populate sub-section form data when lab test is selected
  useEffect(() => {
    if (selectedLabTest) {
      setBasicBloodWorkData({
        full_blood_count_an_esr: selectedLabTest.full_blood_count_an_esr || '',
        hiv: selectedLabTest.hiv || '',
      });
      setCardiovascularMarkersData({
        total_cholesterol: selectedLabTest.total_cholesterol || '',
        hdl: selectedLabTest.hdl || '',
        'hs-crp': selectedLabTest['hs-crp'] || '',
        homocysteine: selectedLabTest.homocysteine || '',
      });
      setMetabolicPanelData({
        fasting_glucose: selectedLabTest.fasting_glucose || '',
        hba1c: selectedLabTest.hba1c || '',
        insulin_level: selectedLabTest.insulin_level || '',
        uric_acid: selectedLabTest.uric_acid || '',
      });
      setOrganFunctionData({
        kidney_function: selectedLabTest.kidney_function || '',
        liver_enzymes: selectedLabTest.liver_enzymes || '',
      });
      setVitaminsHormonesData({
        vitamin_d: selectedLabTest.vitamin_d || '',
        thyroid_stimulating_hormone:
          selectedLabTest.thyroid_stimulating_hormone || '',
        psa: selectedLabTest.psa || '',
      });
    }
  }, [selectedLabTest]);

  // Handle filtering when search term or all lab tests change
  useEffect(() => {
    const filtered = filterLabTests(allLabTests, searchTerm);
    setFilteredLabTests(filtered);

    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateLabTests(filtered, page, pagination.limit);
    setDisplayedLabTests(paginated);
  }, [
    allLabTests,
    searchTerm,
    filterLabTests,
    paginateLabTests,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredLabTests.length > 0) {
      transitionToPage(page);
    }
  }, [
    searchParams,
    pagination.page,
    filteredLabTests.length,
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

      const newURL = `/lab-tests${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleLabTestClick = (labTest: LabTest) => {
    setSelectedLabTest(labTest);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Helper function to get result badge variant
  const getResultBadgeVariant = (result: string | undefined) => {
    if (!result) return 'outline';
    const resultLower = result.toLowerCase();
    if (resultLower === 'normal') return 'secondary';
    if (resultLower === 'abnormal') return 'destructive';
    if (resultLower.includes('out of range')) return 'outline';
    if (resultLower.includes('not required')) return 'secondary';
    return 'outline';
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.lab-tests-container');
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

  // Watch for URL changes and refetch if employee filter changes
  useEffect(() => {
    const currentEmployeeFilter = new URLSearchParams(
      window.location.search
    ).get('employee');
    if (currentEmployeeFilter !== employeeFilter) {
      console.log('URL changed - refetching lab tests');
      fetchAllLabTests();
    }
  }, [employeeFilter]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      employeeFilter,
      selectedLabTest: selectedLabTest?.id,
      allLabTests: allLabTests.length,
      loading,
    });
  }, [employeeFilter, selectedLabTest?.id, allLabTests.length, loading]);

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>Loading lab tests...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        {/* Back Button */}
        <div className='mb-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.back()}
            className='flex items-center space-x-2 hover-lift'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back</span>
          </Button>
        </div>

                    {/* Search */}
                    <Card className='glass-effect mb-6'>
              <CardContent className='p-4'>
                <form onSubmit={handleSearch} className='flex gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='text'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder='Search by employee name, test results...'
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


          <div className='lab-tests-container flex gap-1 min-h-[700px]'>
           {/* Left Panel - Lab Tests Table */}
           <div
             className='space-y-4 animate-slide-up min-h-[700px]'
             style={{ width: selectedLabTest ? `${leftWidth}%` : '100%' }}
           >

            {/* Lab Tests Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                      <FlaskConical className='h-6 w-6' />
                      Lab Tests ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                      Laboratory test results and blood work analysis
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={openCreateModal} 
                    className={`hover-lift ${selectedLabTest ? 'rounded-full w-10 h-10 p-0' : ''}`}
                  >
                    <Plus className='h-4 w-4' />
                    {!selectedLabTest && <span className='ml-2'>Add New Lab Test</span>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {displayedLabTests.length === 0 ? (
                  <div className='text-center py-12'>
                    <FlaskConical className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No lab tests found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No lab tests available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Vitamin D</TableHead>
                          <TableHead>Cholesterol</TableHead>
                          <TableHead>HIV Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedLabTests.map(labTest => (
                          <TableRow
                            key={labTest.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedLabTest?.id === labTest.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleLabTestClick(labTest)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {getEmployeeName(labTest)}
                                </div>
                                <div className='text-sm text-muted-foreground truncate'>
                                  {labTest.employee_work_email ||
                                    labTest.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getResultBadgeVariant(
                                  labTest.vitamin_d
                                )}
                              >
                                {labTest.vitamin_d || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getResultBadgeVariant(
                                  labTest.total_cholesterol
                                )}
                              >
                                {labTest.total_cholesterol || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  labTest.hiv === 'Negative'
                                    ? 'secondary'
                                    : labTest.hiv === 'Positive'
                                      ? 'destructive'
                                      : 'outline'
                                }
                              >
                                {labTest.hiv || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatDate(labTest.date_created)}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(labTest);
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
                                    openDeleteModal(labTest);
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
                          className={`${selectedLabTest && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                          className={`${selectedLabTest && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          Previous
                        </span>
                      </Button>

                      {/* Page Numbers */}
                      {Array.from(
                        {
                          length: Math.min(
                            selectedLabTest && leftWidth < 50 ? 3 : 5,
                            pagination.totalPages
                          ),
                        },
                        (_, i) => {
                          const startPage = Math.max(
                            1,
                            pagination.page -
                              (selectedLabTest && leftWidth < 50 ? 1 : 2)
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
                          className={`${selectedLabTest && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
                          className={`${selectedLabTest && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
          {selectedLabTest && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Lab Test Details */}
          {selectedLabTest && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        Lab Test Results
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <span className='text-lg font-medium'>
                          {getEmployeeName(selectedLabTest)}
                        </span>
                        <Badge variant='outline'>{selectedLabTest.id}</Badge>
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedLabTest.user_updated || 'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedLabTest.date_updated
                            ? new Date(
                                selectedLabTest.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                                         <div className='flex items-center gap-2'>
                       <Button
                         variant='ghost'
                         size='sm'
                         onClick={() => openDeleteModal(selectedLabTest)}
                         className='hover-lift text-destructive hover:text-destructive'
                       >
                         <Trash2 className='h-4 w-4' />
                       </Button>
                       <Button
                         variant='ghost'
                         size='sm'
                         onClick={() => setSelectedLabTest(null)}
                         className='hover-lift'
                       >
                         <X className='h-4 w-4' />
                       </Button>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[500px] overflow-y-auto scrollbar-premium'>
                  {/* Basic Blood Work */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Droplets className='h-4 w-4' />
                        Basic Blood Work
                      </h3>
                      {isEditingBasicBloodWork ? (
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsEditingBasicBloodWork(false)}
                            className='hover-lift'
                          >
                            Cancel
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleSaveBasicBloodWork}
                            disabled={formLoading}
                            className='hover-lift'
                          >
                            {formLoading ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className='mr-2 h-4 w-4' />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsEditingBasicBloodWork(true)}
                          className='hover-lift'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Full Blood Count:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.full_blood_count_an_esr
                          )}
                        >
                          {selectedLabTest.full_blood_count_an_esr || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          HIV Status:
                        </span>
                        <Badge
                          variant={
                            selectedLabTest.hiv === 'Negative'
                              ? 'secondary'
                              : selectedLabTest.hiv === 'Positive'
                                ? 'destructive'
                                : 'outline'
                          }
                        >
                          {selectedLabTest.hiv || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cardiovascular Markers */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Heart className='h-4 w-4' />
                        Cardiovascular Markers
                      </h3>
                      {isEditingCardiovascularMarkers ? (
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              setIsEditingCardiovascularMarkers(false)
                            }
                            className='hover-lift'
                          >
                            Cancel
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleSaveCardiovascularMarkers}
                            disabled={formLoading}
                            className='hover-lift'
                          >
                            {formLoading ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className='mr-2 h-4 w-4' />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setIsEditingCardiovascularMarkers(true)
                          }
                          className='hover-lift'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                    <div className='space-y-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Total Cholesterol:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.total_cholesterol
                          )}
                        >
                          {selectedLabTest.total_cholesterol || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          HDL:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(selectedLabTest.hdl)}
                        >
                          {selectedLabTest.hdl || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          HS-CRP:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest['hs-crp']
                          )}
                        >
                          {selectedLabTest['hs-crp'] || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Homocysteine:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.homocysteine
                          )}
                        >
                          {selectedLabTest.homocysteine || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Metabolic Panel */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        Metabolic Panel
                      </h3>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditingMetabolicPanel(true)}
                        className='hover-lift'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Fasting Glucose:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.fasting_glucose
                          )}
                        >
                          {selectedLabTest.fasting_glucose || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          HbA1c:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(selectedLabTest.hba1c)}
                        >
                          {selectedLabTest.hba1c || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Insulin Level:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.insulin_level
                          )}
                        >
                          {selectedLabTest.insulin_level || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Uric Acid:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.uric_acid
                          )}
                        >
                          {selectedLabTest.uric_acid || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Organ Function */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Shield className='h-4 w-4' />
                        Organ Function
                      </h3>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditingOrganFunction(true)}
                        className='hover-lift'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Kidney Function:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.kidney_function
                          )}
                        >
                          {selectedLabTest.kidney_function || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Liver Enzymes:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.liver_enzymes
                          )}
                        >
                          {selectedLabTest.liver_enzymes || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Vitamins & Hormones */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        Vitamins & Hormones
                      </h3>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditingVitaminsHormones(true)}
                        className='hover-lift'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Vitamin D:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.vitamin_d
                          )}
                        >
                          {selectedLabTest.vitamin_d || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          TSH:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.thyroid_stimulating_hormone
                          )}
                        >
                          {selectedLabTest.thyroid_stimulating_hormone || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          PSA:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(selectedLabTest.psa)}
                        >
                          {selectedLabTest.psa || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Hormones:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.hormones
                          )}
                        >
                          {selectedLabTest.hormones || 'N/A'}
                        </Badge>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[140px]'>
                          Adrenal Response:
                        </span>
                        <Badge
                          variant={getResultBadgeVariant(
                            selectedLabTest.adrenal_response
                          )}
                        >
                          {selectedLabTest.adrenal_response || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedLabTest.notes_text && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                          {selectedLabTest.notes_header || 'Notes'}
                        </h3>
                        <div className='text-sm p-3 bg-muted rounded-lg'>
                          {selectedLabTest.notes_text}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedLabTest.recommendation_text && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Stethoscope className='h-4 w-4' />
                          Recommendations
                        </h3>
                        <div className='text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                          {selectedLabTest.recommendation_text}
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
              <DialogTitle>Create New Lab Test</DialogTitle>
              <DialogDescription>
                Add new laboratory test results for an employee.
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
                <Label htmlFor='vitamin_d'>Vitamin D</Label>
                <Select
                  value={formData.vitamin_d || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, vitamin_d: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                    <SelectItem value='Not required'>Not required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='total_cholesterol'>Total Cholesterol</Label>
                <Select
                  value={formData.total_cholesterol || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, total_cholesterol: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                    <SelectItem value='Not required'>Not required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='hiv'>HIV Status</Label>
                <Select
                  value={formData.hiv || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, hiv: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Negative'>Negative</SelectItem>
                    <SelectItem value='Positive'>Positive</SelectItem>
                    <SelectItem value='Not tested'>Not tested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='full_blood_count_an_esr'>
                  Full Blood Count & ESR
                </Label>
                <Select
                  value={formData.full_blood_count_an_esr || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, full_blood_count_an_esr: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='kidney_function'>Kidney Function</Label>
                <Select
                  value={formData.kidney_function || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, kidney_function: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='liver_enzymes'>Liver Enzymes</Label>
                <Select
                  value={formData.liver_enzymes || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, liver_enzymes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='fasting_glucose'>Fasting Glucose</Label>
                <Select
                  value={formData.fasting_glucose || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, fasting_glucose: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='thyroid_stimulating_hormone'>TSH</Label>
                <Select
                  value={formData.thyroid_stimulating_hormone || ''}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      thyroid_stimulating_hormone: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                    <SelectItem value='Not required'>Not required</SelectItem>
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
                  placeholder='Additional notes about lab results...'
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
                  placeholder='Medical recommendations based on lab results...'
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={closeCreateModal}>
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
                    Create Lab Test
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
              <DialogTitle>Edit Lab Test</DialogTitle>
              <DialogDescription>
                Update the lab test results for{' '}
                {editingLabTest ? getEmployeeName(editingLabTest) : ''}.
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
                   disabled
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
                   disabled
                 />
               </div>

              <div className='space-y-2'>
                <Label htmlFor='vitamin_d_edit'>Vitamin D</Label>
                <Select
                  value={formData.vitamin_d || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, vitamin_d: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                    <SelectItem value='Not required'>Not required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='total_cholesterol_edit'>
                  Total Cholesterol
                </Label>
                <Select
                  value={formData.total_cholesterol || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, total_cholesterol: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                    <SelectItem value='Not required'>Not required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='hiv_edit'>HIV Status</Label>
                <Select
                  value={formData.hiv || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, hiv: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Negative'>Negative</SelectItem>
                    <SelectItem value='Positive'>Positive</SelectItem>
                    <SelectItem value='Not tested'>Not tested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='full_blood_count_an_esr_edit'>
                  Full Blood Count & ESR
                </Label>
                <Select
                  value={formData.full_blood_count_an_esr || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, full_blood_count_an_esr: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='kidney_function_edit'>Kidney Function</Label>
                <Select
                  value={formData.kidney_function || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, kidney_function: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='liver_enzymes_edit'>Liver Enzymes</Label>
                <Select
                  value={formData.liver_enzymes || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, liver_enzymes: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='fasting_glucose_edit'>Fasting Glucose</Label>
                <Select
                  value={formData.fasting_glucose || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, fasting_glucose: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='thyroid_stimulating_hormone_edit'>TSH</Label>
                <Select
                  value={formData.thyroid_stimulating_hormone || ''}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      thyroid_stimulating_hormone: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select result' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Out of range but acceptable'>
                      Out of range but acceptable
                    </SelectItem>
                    <SelectItem value='Not required'>Not required</SelectItem>
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
                  placeholder='Additional notes about lab results...'
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
                  placeholder='Medical recommendations based on lab results...'
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
                    Update Lab Test
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
                Delete Lab Test
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lab test for{' '}
                <span className='font-medium'>
                  {editingLabTest ? getEmployeeName(editingLabTest) : ''}
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
                    Delete Lab Test
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

export default function LabTestsPage() {
  return (
    <Suspense fallback={<div />}> 
      <LabTestsPageContent />
    </Suspense>
  );
}
