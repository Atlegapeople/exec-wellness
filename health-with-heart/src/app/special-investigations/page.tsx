'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpecialInvestigation } from '@/types';
import { useRouteState } from '@/hooks/useRouteState';
import { useBreadcrumbBack } from '@/hooks/useBreadcrumbBack';
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
  TestTube2,
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
  Microscope,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  Brain,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/ui/loading';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function SpecialInvestigationsPageContent() {
  const router = useRouter();
  const goBack = useBreadcrumbBack();
  const searchParams = useSearchParams();

  // Extract employee filter from URL
  const employeeFilter = searchParams.get('employee');

  console.log(
    'SpecialInvestigationsPage render - employeeFilter:',
    employeeFilter
  );

  const [allInvestigations, setAllInvestigations] = useState<
    SpecialInvestigation[]
  >([]);
  const [filteredInvestigations, setFilteredInvestigations] = useState<
    SpecialInvestigation[]
  >([]);
  const [displayedInvestigations, setDisplayedInvestigations] = useState<
    SpecialInvestigation[]
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
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<SpecialInvestigation | null>(null);
  const [leftWidth, setLeftWidth] = useRouteState<number>(
    'leftPanelWidth',
    40,
    { scope: 'path' }
  );
  const [selectedInvestigationId, setSelectedInvestigationId] = useRouteState<
    string | null
  >('selectedInvestigationId', null, { scope: 'path' });
  const [isResizing, setIsResizing] = useState(false);

  // CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingInvestigation, setEditingInvestigation] =
    useState<SpecialInvestigation | null>(null);
  const [formData, setFormData] = useState<Partial<SpecialInvestigation>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Sub-section edit states
  const [isEditingCardiacTests, setIsEditingCardiacTests] = useState(false);
  const [isEditingLaboratoryTests, setIsEditingLaboratoryTests] =
    useState(false);
  const [isEditingRiskAssessment, setIsEditingRiskAssessment] = useState(false);
  const [isEditingSpecializedScreenings, setIsEditingSpecializedScreenings] =
    useState(false);
  const [isEditingSpecializedAssessments, setIsEditingSpecializedAssessments] =
    useState(false);

  // Sub-section form data
  const [cardiacTestsData, setCardiacTestsData] = useState({
    resting_ecg: '',
    stress_ecg: '',
    predicted_vo2_max: '',
    body_fat_percentage: '',
  });
  const [laboratoryTestsData, setLaboratoryTestsData] = useState({
    urine_dipstix: '',
    lung_function: '',
  });
  const [riskAssessmentData, setRiskAssessmentData] = useState({
    risk_category: '',
    risk_score: '',
    reynolds_cardiovascular_risk_score: '',
  });
  const [specializedScreeningsData, setSpecializedScreeningsData] = useState({
    colonscopy_required: false,
    gastroscopy: false,
    abdominal_ultrasound: false,
    osteroporosis_screen: false,
  });
  const [specializedAssessmentsData, setSpecializedAssessmentsData] = useState({
    nerveiq: '',
    notes_text: '',
    recommendation_text: '',
  });

  // Fetch all special investigations data
  const fetchAllInvestigations = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(
        '/api/special-investigations',
        window.location.origin
      );
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

      console.log('Special Investigations API Response:', data);
      console.log(
        'Total investigations fetched:',
        data.investigations?.length || 0
      );

      setAllInvestigations(data.investigations || []);

      // If there's an employee filter, automatically select the first investigation
      if (
        employeeFilter &&
        data.investigations &&
        data.investigations.length > 0
      ) {
        const employeeInvestigation = data.investigations[0];
        console.log('Auto-selecting investigation:', employeeInvestigation);
        setSelectedInvestigation(employeeInvestigation);
      } else if (
        employeeFilter &&
        data.investigations &&
        data.investigations.length === 0
      ) {
        // No investigations found for this employee, open the create modal with employee ID pre-filled
        console.log(
          'No investigations found for employee, opening create modal'
        );
        console.log('Setting form data with employee_id:', employeeFilter);
        setFormData({ employee_id: employeeFilter });
        setIsCreateModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching special investigations:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeFilter]);

  // Client-side filtering
  const filterInvestigations = useCallback(
    (investigations: SpecialInvestigation[], search: string) => {
      if (!search) return investigations;

      return investigations.filter(investigation => {
        const employeeName =
          `${investigation.employee_name || ''} ${investigation.employee_surname || ''}`.trim();
        const searchLower = search.toLowerCase();
        return (
          investigation.id?.toLowerCase().includes(searchLower) ||
          investigation.employee_id?.toLowerCase().includes(searchLower) ||
          investigation.report_id?.toLowerCase().includes(searchLower) ||
          employeeName.toLowerCase().includes(searchLower) ||
          investigation.employee_work_email
            ?.toLowerCase()
            .includes(searchLower) ||
          investigation.urine_dipstix?.toLowerCase().includes(searchLower) ||
          investigation.risk_category?.toLowerCase().includes(searchLower) ||
          investigation.lung_function?.toLowerCase().includes(searchLower)
        );
      });
    },
    []
  );

  // Helper function to get employee name
  const getEmployeeName = (investigation: SpecialInvestigation) => {
    return investigation.employee_name && investigation.employee_surname
      ? `${investigation.employee_name} ${investigation.employee_surname}`
      : 'Unknown Employee';
  };

  // Sub-section save functions
  const handleSaveCardiacTests = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/special-investigations/${selectedInvestigation?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cardiacTestsData),
        }
      );

      if (response.ok) {
        setIsEditingCardiacTests(false);
        // Refresh the data
        fetchAllInvestigations();
      }
    } catch (error) {
      console.error('Error saving cardiac tests:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveLaboratoryTests = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/special-investigations/${selectedInvestigation?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(laboratoryTestsData),
        }
      );

      if (response.ok) {
        setIsEditingLaboratoryTests(false);
        fetchAllInvestigations();
      }
    } catch (error) {
      console.error('Error saving laboratory tests:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveRiskAssessment = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/special-investigations/${selectedInvestigation?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(riskAssessmentData),
        }
      );

      if (response.ok) {
        setIsEditingRiskAssessment(false);
        fetchAllInvestigations();
      }
    } catch (error) {
      console.error('Error saving risk assessment:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveSpecializedScreenings = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/special-investigations/${selectedInvestigation?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(specializedScreeningsData),
        }
      );

      if (response.ok) {
        setIsEditingSpecializedScreenings(false);
        fetchAllInvestigations();
      }
    } catch (error) {
      console.error('Error saving specialized screenings:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveSpecializedAssessments = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/special-investigations/${selectedInvestigation?.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(specializedAssessmentsData),
        }
      );

      if (response.ok) {
        setIsEditingSpecializedAssessments(false);
        fetchAllInvestigations();
      }
    } catch (error) {
      console.error('Error saving specialized assessments:', error);
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
      const response = await fetch('/api/special-investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({});
        await fetchAllInvestigations();
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
      }
    } catch (error) {
      console.error('Error creating special investigation:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/special-investigations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingInvestigation?.id }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingInvestigation(null);
        setFormData({});
        await fetchAllInvestigations();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
      }
    } catch (error) {
      console.error('Error updating special investigation:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/special-investigations?id=${editingInvestigation?.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setEditingInvestigation(null);
        if (selectedInvestigation?.id === editingInvestigation?.id) {
          setSelectedInvestigation(null);
        }
        await fetchAllInvestigations();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
      }
    } catch (error) {
      console.error('Error deleting special investigation:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (investigation: SpecialInvestigation) => {
    setEditingInvestigation(investigation);
    setFormData(investigation);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (investigation: SpecialInvestigation) => {
    setEditingInvestigation(investigation);
    setIsDeleteModalOpen(true);
  };

  // Client-side pagination
  const paginateInvestigations = useCallback(
    (investigations: SpecialInvestigation[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = investigations.slice(startIndex, endIndex);

      const total = investigations.length;
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

      const paginated = paginateInvestigations(
        filteredInvestigations,
        newPage,
        pagination.limit
      );
      setDisplayedInvestigations(paginated);

      setPageTransitioning(false);
    },
    [filteredInvestigations, pagination.limit, paginateInvestigations]
  );

  // Initial load
  useEffect(() => {
    fetchAllInvestigations();
    fetchEmployees();
  }, [fetchAllInvestigations]);

  // Populate sub-section form data when investigation is selected
  useEffect(() => {
    if (selectedInvestigation) {
      setCardiacTestsData({
        resting_ecg: selectedInvestigation.resting_ecg || '',
        stress_ecg: selectedInvestigation.stress_ecg || '',
        predicted_vo2_max: selectedInvestigation.predicted_vo2_max || '',
        body_fat_percentage: selectedInvestigation.body_fat_percentage || '',
      });
      setLaboratoryTestsData({
        urine_dipstix: selectedInvestigation.urine_dipstix || '',
        lung_function: selectedInvestigation.lung_function || '',
      });
      setRiskAssessmentData({
        risk_category: selectedInvestigation.risk_category || '',
        risk_score: String(selectedInvestigation.risk_score || ''),
        reynolds_cardiovascular_risk_score:
          selectedInvestigation.reynolds_cardiovascular_risk_score || '',
      });
      setSpecializedScreeningsData({
        colonscopy_required: selectedInvestigation.colonscopy_required || false,
        gastroscopy: selectedInvestigation.gastroscopy || false,
        abdominal_ultrasound:
          selectedInvestigation.abdominal_ultrasound || false,
        osteroporosis_screen:
          selectedInvestigation.osteroporosis_screen || false,
      });
      setSpecializedAssessmentsData({
        nerveiq: selectedInvestigation.nerveiq || '',
        notes_text: selectedInvestigation.notes_text || '',
        recommendation_text: selectedInvestigation.recommendation_text || '',
      });
    }
  }, [selectedInvestigation]);

  // Handle filtering when search term or all investigations change
  useEffect(() => {
    const filtered = filterInvestigations(allInvestigations, searchTerm);
    setFilteredInvestigations(filtered);

    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateInvestigations(filtered, page, pagination.limit);
    setDisplayedInvestigations(paginated);
  }, [
    allInvestigations,
    searchTerm,
    filterInvestigations,
    paginateInvestigations,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredInvestigations.length > 0) {
      transitionToPage(page);
    }
  }, [
    searchParams,
    pagination.page,
    filteredInvestigations.length,
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

      const newURL = `/special-investigations${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleInvestigationClick = (investigation: SpecialInvestigation) => {
    setSelectedInvestigation(investigation);
    setSelectedInvestigationId(investigation.id);
  };

  useEffect(() => {
    const restore = async () => {
      if (!selectedInvestigation && selectedInvestigationId) {
        const found = allInvestigations.find(
          i => i.id === selectedInvestigationId
        );
        if (found) {
          setSelectedInvestigation(found);
          return;
        }
        try {
          const res = await fetch(
            `/api/special-investigations/${selectedInvestigationId}`
          );
          if (res.ok) {
            const data = await res.json();
            setSelectedInvestigation(data);
          } else {
            setSelectedInvestigationId(null);
          }
        } catch {
          setSelectedInvestigationId(null);
        }
      }
    };
    restore();
  }, [selectedInvestigationId, selectedInvestigation, allInvestigations]);

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

      const container = document.querySelector('.investigations-container');
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
      console.log('URL changed - refetching investigations');
      fetchAllInvestigations();
    }
  }, [employeeFilter]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      employeeFilter,
      selectedInvestigation: selectedInvestigation?.id,
      allInvestigations: allInvestigations.length,
      loading,
    });
  }, [
    employeeFilter,
    selectedInvestigation?.id,
    allInvestigations.length,
    loading,
  ]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-8'>
            <Card>
              <CardContent>
                <PageLoading
                  text='Loading Special Investigations'
                  subtitle='Fetching special investigation data from OHMS database...'
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
        <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
          {/* Back Button */}
          <div className='mb-6'>
            <Button variant='outline' onClick={goBack} className='hover-lift'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
          </div>

          {/* Search */}
          <Card className='glass-effect mb-4'>
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

          <div className='investigations-container flex gap-1 min-h-[700px]'>
            {/* Left Panel - Investigations Table */}
            <div
              className='space-y-4 animate-slide-up min-h-[700px]'
              style={{
                width: selectedInvestigation ? `${leftWidth}%` : '100%',
                minHeight: '700px',
              }}
            >
              {/* Special Investigations Table */}
              <Card className='hover-lift'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                        <TestTube2 className='h-6 w-6' />
                        Special Investigations ({pagination.total})
                      </CardTitle>
                      <CardDescription>
                        Specialized medical tests and diagnostic investigations
                      </CardDescription>
                    </div>
                    <Button
                      onClick={openCreateModal}
                      className={`hover-lift ${selectedInvestigation ? 'rounded-full w-10 h-10 p-0' : ''}`}
                    >
                      <Plus
                        className={`h-4 w-4 ${selectedInvestigation ? '' : 'mr-2'}`}
                      />
                      {!selectedInvestigation && 'Add New Investigation'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {displayedInvestigations.length === 0 ? (
                    <div className='text-center py-12'>
                      <TestTube2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-foreground mb-2'>
                        No investigations found
                      </h3>
                      <p className='text-muted-foreground'>
                        {searchTerm
                          ? 'Try adjusting your search criteria.'
                          : 'No special investigations available.'}
                      </p>
                    </div>
                  ) : (
                    <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Urine Test</TableHead>
                            <TableHead>Lung Function</TableHead>
                            <TableHead>Risk Category</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className='text-right'>
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody
                          className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                        >
                          {displayedInvestigations.map(investigation => (
                            <TableRow
                              key={investigation.id}
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedInvestigation?.id === investigation.id
                                  ? 'bg-muted border-l-4 border-l-primary'
                                  : ''
                              }`}
                              onClick={() =>
                                handleInvestigationClick(investigation)
                              }
                            >
                              <TableCell>
                                <div>
                                  <div className='font-medium'>
                                    {getEmployeeName(investigation)}
                                  </div>
                                  <div className='text-sm text-muted-foreground truncate'>
                                    {investigation.employee_work_email ||
                                      investigation.employee_id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    investigation.urine_dipstix === 'Normal'
                                      ? 'secondary'
                                      : investigation.urine_dipstix ===
                                          'Abnormal'
                                        ? 'destructive'
                                        : investigation.urine_dipstix ===
                                            'Irregularities but Acceptable'
                                          ? 'outline'
                                          : 'outline'
                                  }
                                >
                                  {investigation.urine_dipstix || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-sm'>
                                {investigation.lung_function || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    investigation.risk_category === 'Low'
                                      ? 'secondary'
                                      : investigation.risk_category === 'Medium'
                                        ? 'outline'
                                        : investigation.risk_category === 'High'
                                          ? 'destructive'
                                          : 'outline'
                                  }
                                >
                                  {investigation.risk_category || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-sm'>
                                {formatDate(investigation.date_created)}
                              </TableCell>
                              <TableCell className='text-right'>
                                <div className='flex items-center justify-end gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={e => {
                                      e.stopPropagation();
                                      openEditModal(investigation);
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
                                      openDeleteModal(investigation);
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
                            className={`${selectedInvestigation && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                            className={`${selectedInvestigation && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            Previous
                          </span>
                        </Button>

                        {/* Page Numbers */}
                        {Array.from(
                          {
                            length: Math.min(
                              selectedInvestigation && leftWidth < 50 ? 3 : 5,
                              pagination.totalPages
                            ),
                          },
                          (_, i) => {
                            const startPage = Math.max(
                              1,
                              pagination.page -
                                (selectedInvestigation && leftWidth < 50
                                  ? 1
                                  : 2)
                            );
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`investigation-page-${page}`}
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
                            className={`${selectedInvestigation && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
                            className={`${selectedInvestigation && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
            {selectedInvestigation && (
              <div
                className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
                onMouseDown={handleMouseDown}
                style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
              />
            )}

            {/* Right Panel - Investigation Details */}
            {selectedInvestigation && (
              <div
                className='space-y-4 animate-slide-up'
                style={{ width: `${100 - leftWidth}%` }}
              >
                <Card className='glass-effect'>
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-1'>
                        <CardTitle className='text-2xl medical-heading'>
                          Special Investigation
                        </CardTitle>
                        <CardDescription className='flex items-center gap-2'>
                          <span className='text-lg font-medium'>
                            {getEmployeeName(selectedInvestigation)}
                          </span>
                          <Badge variant='outline'>
                            {selectedInvestigation.id}
                          </Badge>
                        </CardDescription>
                        {/* Last Updated Information */}
                        <div className='text-xs text-muted-foreground mt-2'>
                          <span>Last updated by </span>
                          <span className='font-medium'>
                            {selectedInvestigation.user_updated || 'Unknown'}
                          </span>
                          <span> on </span>
                          <span className='font-medium'>
                            {selectedInvestigation.date_updated
                              ? new Date(
                                  selectedInvestigation.date_updated
                                ).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openDeleteModal(selectedInvestigation)}
                          className='hover-lift text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedInvestigation(null);
                            setSelectedInvestigationId(null);
                          }}
                          className='hover-lift'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-6 max-h-[500px] overflow-y-auto scrollbar-premium'>
                    {/* Cardiac Tests */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Heart className='h-4 w-4' />
                          Cardiac Tests
                        </h3>
                        {isEditingCardiacTests ? (
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setIsEditingCardiacTests(false)}
                              className='hover-lift'
                            >
                              Cancel
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleSaveCardiacTests}
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
                            onClick={() => setIsEditingCardiacTests(true)}
                            className='hover-lift'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      {isEditingCardiacTests ? (
                        <div className='space-y-3'>
                          <div className='grid grid-cols-1 gap-3 text-sm'>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Resting ECG:
                              </span>
                              <Input
                                value={cardiacTestsData.resting_ecg}
                                onChange={e =>
                                  setCardiacTestsData({
                                    ...cardiacTestsData,
                                    resting_ecg: e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter resting ECG results'
                              />
                            </div>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Stress ECG:
                              </span>
                              <Input
                                value={cardiacTestsData.stress_ecg}
                                onChange={e =>
                                  setCardiacTestsData({
                                    ...cardiacTestsData,
                                    stress_ecg: e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter stress ECG results'
                              />
                            </div>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                VO2 Max:
                              </span>
                              <Input
                                value={cardiacTestsData.predicted_vo2_max}
                                onChange={e =>
                                  setCardiacTestsData({
                                    ...cardiacTestsData,
                                    predicted_vo2_max: e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter VO2 Max value'
                              />
                            </div>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Body Fat %:
                              </span>
                              <Input
                                value={cardiacTestsData.body_fat_percentage}
                                onChange={e =>
                                  setCardiacTestsData({
                                    ...cardiacTestsData,
                                    body_fat_percentage: e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter body fat percentage'
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 gap-3 text-sm'>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Resting ECG:
                            </span>
                            <span className='font-medium'>
                              {selectedInvestigation.resting_ecg || 'N/A'}
                            </span>
                          </div>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Stress ECG:
                            </span>
                            <span className='font-medium'>
                              {selectedInvestigation.stress_ecg || 'N/A'}
                            </span>
                          </div>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              VO2 Max:
                            </span>
                            <span className='font-medium'>
                              {selectedInvestigation.predicted_vo2_max || 'N/A'}
                            </span>
                          </div>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Body Fat %:
                            </span>
                            <span className='font-medium'>
                              {selectedInvestigation.body_fat_percentage ||
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Laboratory Tests */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Microscope className='h-4 w-4' />
                          Laboratory Tests
                        </h3>
                        {isEditingLaboratoryTests ? (
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setIsEditingLaboratoryTests(false)}
                              className='hover-lift'
                            >
                              Cancel
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleSaveLaboratoryTests}
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
                            onClick={() => setIsEditingLaboratoryTests(true)}
                            className='hover-lift'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      {isEditingLaboratoryTests ? (
                        <div className='space-y-3'>
                          <div className='space-y-3 text-sm'>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Urine Dipstick:
                              </span>
                              <Select
                                value={laboratoryTestsData.urine_dipstix}
                                onValueChange={value =>
                                  setLaboratoryTestsData({
                                    ...laboratoryTestsData,
                                    urine_dipstix: value,
                                  })
                                }
                              >
                                <SelectTrigger className='flex-1'>
                                  <SelectValue placeholder='Select urine dipstick result' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='Normal'>Normal</SelectItem>
                                  <SelectItem value='Abnormal'>
                                    Abnormal
                                  </SelectItem>
                                  <SelectItem value='Not Tested'>
                                    Not Tested
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Lung Function:
                              </span>
                              <Input
                                value={laboratoryTestsData.lung_function}
                                onChange={e =>
                                  setLaboratoryTestsData({
                                    ...laboratoryTestsData,
                                    lung_function: e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter lung function results'
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='space-y-3 text-sm'>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Urine Dipstick:
                            </span>
                            <Badge
                              variant={
                                selectedInvestigation.urine_dipstix === 'Normal'
                                  ? 'secondary'
                                  : selectedInvestigation.urine_dipstix ===
                                      'Abnormal'
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {selectedInvestigation.urine_dipstix || 'N/A'}
                            </Badge>
                          </div>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Lung Function:
                            </span>
                            <span className='font-medium'>
                              {selectedInvestigation.lung_function || 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Risk Assessment */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Activity className='h-4 w-4' />
                          Risk Assessment
                        </h3>
                        {isEditingRiskAssessment ? (
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setIsEditingRiskAssessment(false)}
                              className='hover-lift'
                            >
                              Cancel
                            </Button>
                            <Button
                              size='sm'
                              onClick={handleSaveRiskAssessment}
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
                            onClick={() => setIsEditingRiskAssessment(true)}
                            className='hover-lift'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      {isEditingRiskAssessment ? (
                        <div className='space-y-3'>
                          <div className='grid grid-cols-1 gap-3 text-sm'>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Risk Category:
                              </span>
                              <Select
                                value={riskAssessmentData.risk_category}
                                onValueChange={value =>
                                  setRiskAssessmentData({
                                    ...riskAssessmentData,
                                    risk_category: value,
                                  })
                                }
                              >
                                <SelectTrigger className='flex-1'>
                                  <SelectValue placeholder='Select risk category' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='Low'>Low</SelectItem>
                                  <SelectItem value='Medium'>Medium</SelectItem>
                                  <SelectItem value='High'>High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Risk Score:
                              </span>
                              <Input
                                value={riskAssessmentData.risk_score}
                                onChange={e =>
                                  setRiskAssessmentData({
                                    ...riskAssessmentData,
                                    risk_score: e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter risk score'
                                type='number'
                              />
                            </div>
                            <div className='flex gap-2 items-center'>
                              <span className='text-muted-foreground min-w-[120px]'>
                                Reynolds Score:
                              </span>
                              <Input
                                value={
                                  riskAssessmentData.reynolds_cardiovascular_risk_score
                                }
                                onChange={e =>
                                  setRiskAssessmentData({
                                    ...riskAssessmentData,
                                    reynolds_cardiovascular_risk_score:
                                      e.target.value,
                                  })
                                }
                                className='flex-1'
                                placeholder='Enter Reynolds score'
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 gap-3 text-sm'>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Risk Category:
                            </span>
                            <Badge
                              variant={
                                selectedInvestigation.risk_category === 'Low'
                                  ? 'secondary'
                                  : selectedInvestigation.risk_category ===
                                      'Medium'
                                    ? 'outline'
                                    : selectedInvestigation.risk_category ===
                                        'High'
                                      ? 'destructive'
                                      : 'outline'
                              }
                            >
                              {selectedInvestigation.risk_category || 'N/A'}
                            </Badge>
                          </div>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Risk Score:
                            </span>
                            <Badge variant='outline'>
                              {selectedInvestigation.risk_score || 0}
                            </Badge>
                          </div>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Reynolds Score:
                            </span>
                            <span className='font-medium'>
                              {selectedInvestigation.reynolds_cardiovascular_risk_score ||
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Specialized Screenings */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <TestTube2 className='h-4 w-4' />
                          Specialized Screenings
                        </h3>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setIsEditingSpecializedScreenings(true)
                          }
                          className='hover-lift'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[140px]'>
                            Colonoscopy Required:
                          </span>
                          <Badge
                            variant={
                              selectedInvestigation.colonscopy_required
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedInvestigation.colonscopy_required
                              ? 'Yes'
                              : 'No'}
                          </Badge>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[140px]'>
                            Gastroscopy:
                          </span>
                          <Badge
                            variant={
                              selectedInvestigation.gastroscopy
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedInvestigation.gastroscopy ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[140px]'>
                            Abdominal Ultrasound:
                          </span>
                          <Badge
                            variant={
                              selectedInvestigation.abdominal_ultrasound
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedInvestigation.abdominal_ultrasound
                              ? 'Yes'
                              : 'No'}
                          </Badge>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[140px]'>
                            Osteoporosis Screen:
                          </span>
                          <Badge
                            variant={
                              selectedInvestigation.osteroporosis_screen
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedInvestigation.osteroporosis_screen
                              ? 'Yes'
                              : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Specialized Tests */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Brain className='h-4 w-4' />
                          Specialized Assessments
                        </h3>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setIsEditingSpecializedAssessments(true)
                          }
                          className='hover-lift'
                        >
                          <Edit className='h-3 w-3' />
                        </Button>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            NerveIQ:
                          </span>
                          <span className='font-medium'>
                            {selectedInvestigation.nerveiq || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            KardioFit:
                          </span>
                          <span className='font-medium'>
                            {selectedInvestigation.kardiofit || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            NerveIQ CNS:
                          </span>
                          <span className='font-medium'>
                            {selectedInvestigation.nerveiq_cns || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            NerveIQ Cardio:
                          </span>
                          <span className='font-medium'>
                            {selectedInvestigation.nerveiq_cardio || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            NerveIQ Group:
                          </span>
                          <span className='font-medium'>
                            {selectedInvestigation.nerveiq_group || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedInvestigation.notes_text && (
                      <>
                        <Separator />
                        <div className='space-y-3'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                            {selectedInvestigation.notes_header || 'Notes'}
                          </h3>
                          <div className='text-sm p-3 bg-muted rounded-lg'>
                            {selectedInvestigation.notes_text}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedInvestigation.recommendation_text && (
                      <>
                        <Separator />
                        <div className='space-y-3'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                            <Stethoscope className='h-4 w-4' />
                            Recommendations
                          </h3>
                          <div className='text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                            {selectedInvestigation.recommendation_text}
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
                <DialogTitle>Create New Special Investigation</DialogTitle>
                <DialogDescription>
                  Add a new specialized medical investigation for an employee.
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
                  <Label htmlFor='urine_dipstix'>Urine Dipstick Test</Label>
                  <Select
                    value={formData.urine_dipstix || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, urine_dipstix: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select result' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Normal'>Normal</SelectItem>
                      <SelectItem value='Abnormal'>Abnormal</SelectItem>
                      <SelectItem value='Irregularities but Acceptable'>
                        Irregularities but Acceptable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lung_function'>Lung Function Test</Label>
                  <Input
                    id='lung_function'
                    value={formData.lung_function || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        lung_function: e.target.value,
                      })
                    }
                    placeholder='Enter lung function results'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='risk_category'>Risk Category</Label>
                  <Select
                    value={formData.risk_category || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, risk_category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select risk category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Low'>Low Risk</SelectItem>
                      <SelectItem value='Medium'>Medium Risk</SelectItem>
                      <SelectItem value='High'>High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='risk_score'>Risk Score</Label>
                  <Input
                    id='risk_score'
                    type='number'
                    value={formData.risk_score || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        risk_score: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder='Numerical risk score'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='resting_ecg'>Resting ECG</Label>
                  <Input
                    id='resting_ecg'
                    value={formData.resting_ecg || ''}
                    onChange={e =>
                      setFormData({ ...formData, resting_ecg: e.target.value })
                    }
                    placeholder='Resting ECG results'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='stress_ecg'>Stress ECG</Label>
                  <Input
                    id='stress_ecg'
                    value={formData.stress_ecg || ''}
                    onChange={e =>
                      setFormData({ ...formData, stress_ecg: e.target.value })
                    }
                    placeholder='Stress ECG results'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='predicted_vo2_max'>Predicted VO2 Max</Label>
                  <Input
                    id='predicted_vo2_max'
                    value={formData.predicted_vo2_max || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        predicted_vo2_max: e.target.value,
                      })
                    }
                    placeholder='VO2 Max measurement'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='body_fat_percentage'>
                    Body Fat Percentage
                  </Label>
                  <Input
                    id='body_fat_percentage'
                    value={formData.body_fat_percentage || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        body_fat_percentage: e.target.value,
                      })
                    }
                    placeholder='Body fat percentage'
                  />
                </div>

                <div className='md:col-span-2 space-y-2'>
                  <Label htmlFor='notes_text'>Notes</Label>
                  <Textarea
                    id='notes_text'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Additional notes about investigation...'
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
                    placeholder='Medical recommendations based on investigation results...'
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
                      Create Investigation
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
                <DialogTitle>Edit Special Investigation</DialogTitle>
                <DialogDescription>
                  Update the investigation record for{' '}
                  {editingInvestigation
                    ? getEmployeeName(editingInvestigation)
                    : ''}
                  .
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
                      <SelectValue placeholder='Select employee'>
                        {formData.employee_id &&
                        employees.find(emp => emp.id === formData.employee_id)
                          ? `${employees.find(emp => emp.id === formData.employee_id)?.name} ${employees.find(emp => emp.id === formData.employee_id)?.surname}`
                          : 'Select employee'}
                      </SelectValue>
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
                  <Label htmlFor='urine_dipstix_edit'>
                    Urine Dipstick Test
                  </Label>
                  <Select
                    value={formData.urine_dipstix || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, urine_dipstix: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select result' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Normal'>Normal</SelectItem>
                      <SelectItem value='Abnormal'>Abnormal</SelectItem>
                      <SelectItem value='Irregularities but Acceptable'>
                        Irregularities but Acceptable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lung_function_edit'>Lung Function Test</Label>
                  <Input
                    id='lung_function_edit'
                    value={formData.lung_function || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        lung_function: e.target.value,
                      })
                    }
                    placeholder='Enter lung function results'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='risk_category_edit'>Risk Category</Label>
                  <Select
                    value={formData.risk_category || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, risk_category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select risk category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Low'>Low Risk</SelectItem>
                      <SelectItem value='Medium'>Medium Risk</SelectItem>
                      <SelectItem value='High'>High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='risk_score_edit'>Risk Score</Label>
                  <Input
                    id='risk_score_edit'
                    type='number'
                    value={formData.risk_score || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        risk_score: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder='Numerical risk score'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='resting_ecg_edit'>Resting ECG</Label>
                  <Input
                    id='resting_ecg_edit'
                    value={formData.resting_ecg || ''}
                    onChange={e =>
                      setFormData({ ...formData, resting_ecg: e.target.value })
                    }
                    placeholder='Resting ECG results'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='stress_ecg_edit'>Stress ECG</Label>
                  <Input
                    id='stress_ecg_edit'
                    value={formData.stress_ecg || ''}
                    onChange={e =>
                      setFormData({ ...formData, stress_ecg: e.target.value })
                    }
                    placeholder='Stress ECG results'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='predicted_vo2_max_edit'>
                    Predicted VO2 Max
                  </Label>
                  <Input
                    id='predicted_vo2_max_edit'
                    value={formData.predicted_vo2_max || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        predicted_vo2_max: e.target.value,
                      })
                    }
                    placeholder='VO2 Max measurement'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='body_fat_percentage_edit'>
                    Body Fat Percentage
                  </Label>
                  <Input
                    id='body_fat_percentage_edit'
                    value={formData.body_fat_percentage || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        body_fat_percentage: e.target.value,
                      })
                    }
                    placeholder='Body fat percentage'
                  />
                </div>

                <div className='md:col-span-2 space-y-2'>
                  <Label htmlFor='notes_text_edit'>Notes</Label>
                  <Textarea
                    id='notes_text_edit'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Additional notes about investigation...'
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
                    placeholder='Medical recommendations based on investigation results...'
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
                      Update Investigation
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
                  Delete Investigation Record
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this investigation record for{' '}
                  <span className='font-medium'>
                    {editingInvestigation
                      ? getEmployeeName(editingInvestigation)
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

export default function SpecialInvestigationsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Card>
            <CardContent>
              <PageLoading
                text='Initializing Special Investigations'
                subtitle='Setting up special investigations management system...'
              />
            </CardContent>
          </Card>
        </div>
      }
    >
      <SpecialInvestigationsPageContent />
    </Suspense>
  );
}
