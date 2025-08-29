'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MenHealth } from '@/types';
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
  DollarSign,
  MapPin,
  FileText,
} from 'lucide-react';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function MensHealthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract employee filter from URL
  const employeeFilter = searchParams.get('employee');

  console.log('MensHealthPage render - employeeFilter:', employeeFilter);

  const [allMensHealth, setAllMensHealth] = useState<MenHealth[]>([]);
  const [filteredMensHealth, setFilteredMensHealth] = useState<MenHealth[]>([]);
  const [displayedMensHealth, setDisplayedMensHealth] = useState<MenHealth[]>(
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
  const [selectedMensHealth, setSelectedMensHealth] =
    useState<MenHealth | null>(null);
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMensHealth, setEditingMensHealth] = useState<MenHealth | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<MenHealth>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Related entities state
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [relatedEntitiesLoading, setRelatedEntitiesLoading] = useState(false);

  // Edit states for each section
  const [isEditingSmoking, setIsEditingSmoking] = useState(false);
  const [isEditingAlcohol, setIsEditingAlcohol] = useState(false);
  const [isEditingExercise, setIsEditingExercise] = useState(false);
  const [isEditingNutrition, setIsEditingNutrition] = useState(false);
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRecommendations, setIsEditingRecommendations] =
    useState(false);

  // Modal state
  const [isOrganizationsModalOpen, setIsOrganizationsModalOpen] =
    useState(false);
  const [isSitesModalOpen, setIsSitesModalOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isCostCentersModalOpen, setIsCostCentersModalOpen] = useState(false);

  // Fetch all men's health data
  const fetchAllMensHealth = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL('/api/mens-health', window.location.origin);
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

      console.log("Men's Health API Response:", data);
      console.log(
        "Total men's health records fetched:",
        data.mensHealth?.length || 0
      );

      setAllMensHealth(data.mensHealth || []);

      // If there's an employee filter, automatically select the first men's health record
      if (employeeFilter && data.mensHealth && data.mensHealth.length > 0) {
        const employeeMensHealth = data.mensHealth[0];
        console.log("Auto-selecting men's health record:", employeeMensHealth);
        setSelectedMensHealth(employeeMensHealth);
      } else if (
        employeeFilter &&
        data.mensHealth &&
        data.mensHealth.length === 0
      ) {
        // No men's health records found for this employee, open the create modal with employee ID pre-filled
        console.log(
          "No men's health records found for employee, opening create modal"
        );
        console.log('Setting form data with employee_id:', employeeFilter);
        setFormData({ employee_id: employeeFilter });
        setIsCreateModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching men's health records:", error);
    } finally {
      setLoading(false);
    }
  }, [employeeFilter]);

  // Client-side filtering
  const filterMensHealth = useCallback(
    (mensHealth: MenHealth[], search: string) => {
      if (!search) return mensHealth;

      return mensHealth.filter(record => {
        const employeeName =
          `${record.employee_name || ''} ${record.employee_surname || ''}`.trim();
        const searchLower = search.toLowerCase();
        return (
          record.id?.toString().toLowerCase().includes(searchLower) ||
          record.employee_id?.toString().toLowerCase().includes(searchLower) ||
          record.report_id?.toString().toLowerCase().includes(searchLower) ||
          employeeName.toLowerCase().includes(searchLower) ||
          record.employee_work_email
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          // Search in new men's health fields
          record.ever_diagnosed_with
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          record.prostate_enlarged
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          record.prostate_infection
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          record.prostate_cancer
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          record.testes_growth
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          record.erections?.toString().toLowerCase().includes(searchLower) ||
          record.require_urologist
            ?.toString()
            .toLowerCase()
            .includes(searchLower) ||
          record.notes_text?.toString().toLowerCase().includes(searchLower) ||
          // Legacy fields for backward compatibility
          record.psa_result?.toString().toLowerCase().includes(searchLower) ||
          record.heart_disease_risk
            ?.toString()
            .toLowerCase()
            .includes(searchLower)
        );
      });
    },
    []
  );

  // Helper function to get employee name
  const getEmployeeName = (mensHealth: MenHealth) => {
    return mensHealth.employee_name && mensHealth.employee_surname
      ? `${mensHealth.employee_name} ${mensHealth.employee_surname}`
      : 'Unknown Employee';
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

  // CRUD functions
  const handleCreate = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/mens-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({});
        await fetchAllMensHealth();
      } else {
        const error = await response.json();
        console.error('Create failed:', error);
      }
    } catch (error) {
      console.error("Error creating men's health record:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/mens-health', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingMensHealth?.id }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingMensHealth(null);
        setFormData({});
        await fetchAllMensHealth();
      } else {
        const error = await response.json();
        console.error('Update failed:', error);
      }
    } catch (error) {
      console.error("Error updating men's health record:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(
        `/api/mens-health?id=${editingMensHealth?.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setEditingMensHealth(null);
        if (selectedMensHealth?.id === editingMensHealth?.id) {
          setSelectedMensHealth(null);
        }
        await fetchAllMensHealth();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
      }
    } catch (error) {
      console.error("Error deleting men's health record:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (mensHealth: MenHealth) => {
    setEditingMensHealth(mensHealth);
    setFormData(mensHealth);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (mensHealth: MenHealth) => {
    setEditingMensHealth(mensHealth);
    setIsDeleteModalOpen(true);
  };

  // Client-side pagination
  const paginateMensHealth = useCallback(
    (mensHealth: MenHealth[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = mensHealth.slice(startIndex, endIndex);

      const total = mensHealth.length;
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

      const paginated = paginateMensHealth(
        filteredMensHealth,
        newPage,
        pagination.limit
      );
      setDisplayedMensHealth(paginated);

      setPageTransitioning(false);
    },
    [filteredMensHealth, pagination.limit, paginateMensHealth]
  );

  // Initial load
  useEffect(() => {
    fetchAllMensHealth();
    fetchEmployees();
    fetchOrganizations();
    fetchSites();
    fetchLocations();
    fetchCostCenters();
  }, [fetchAllMensHealth]);

  // Handle filtering when search term or all men's health records change
  useEffect(() => {
    const filtered = filterMensHealth(allMensHealth, searchTerm);
    setFilteredMensHealth(filtered);

    const page = searchTerm ? 1 : parseInt(searchParams.get('page') || '1');
    const paginated = paginateMensHealth(filtered, page, pagination.limit);
    setDisplayedMensHealth(paginated);
  }, [
    allMensHealth,
    searchTerm,
    filterMensHealth,
    paginateMensHealth,
    pagination.limit,
    searchParams,
  ]);

  // Handle page changes from URL
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== pagination.page && filteredMensHealth.length > 0) {
      transitionToPage(page);
    }
  }, [
    searchParams,
    pagination.page,
    filteredMensHealth.length,
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

      const newURL = `/mens-health${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleMensHealthClick = (mensHealth: MenHealth) => {
    console.log("Selected men's health data:", mensHealth);
    console.log(
      'Prostate enlarged type:',
      typeof mensHealth.prostate_enlarged,
      'Value:',
      mensHealth.prostate_enlarged
    );
    console.log(
      'Prostate infection type:',
      typeof mensHealth.prostate_infection,
      'Value:',
      mensHealth.prostate_infection
    );
    console.log(
      'Prostate cancer type:',
      typeof mensHealth.prostate_cancer,
      'Value:',
      mensHealth.prostate_cancer
    );
    setSelectedMensHealth(mensHealth);
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

      const container = document.querySelector('.mens-health-container');
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
      console.log("URL changed - refetching men's health records");
      fetchAllMensHealth();
    }
  }, [employeeFilter]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      employeeFilter,
      selectedMensHealth: selectedMensHealth?.id,
      allMensHealth: allMensHealth.length,
      loading,
    });
  }, [employeeFilter, selectedMensHealth?.id, allMensHealth.length, loading]);

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>
                Loading men\'s health data...
              </p>
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
        <div className='mb-6 flex justify-start'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.back()}
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back</span>
          </Button>
        </div>

        <div className='mens-health-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Lifestyle Table */}
          <div
            className='space-y-4 animate-slide-up'
            style={{ width: selectedMensHealth ? `${leftWidth}%` : '100%' }}
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

            {/* Men's Health Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                      <Activity className='h-6 w-6' />
                      Men's Health ({pagination.total})
                    </CardTitle>
                    <CardDescription>
                      Men's health assessments and screenings
                    </CardDescription>
                  </div>
                  <Button onClick={openCreateModal} className='hover-lift'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add New Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {displayedMensHealth.length === 0 ? (
                  <div className='text-center py-12'>
                    <Activity className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No men's health records found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : "No men's health records available."}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Prostate Status</TableHead>
                          <TableHead>Testicular Status</TableHead>
                          <TableHead>Urologist Required</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedMensHealth.map(mensHealth => (
                          <TableRow
                            key={mensHealth.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedMensHealth?.id === mensHealth.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleMensHealthClick(mensHealth)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {getEmployeeName(mensHealth)}
                                </div>
                                <div className='text-sm text-muted-foreground truncate'>
                                  {mensHealth.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                {mensHealth.prostate_enlarged && (
                                  <Badge
                                    variant={
                                      mensHealth.prostate_enlarged === 'Yes'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {mensHealth.prostate_enlarged === 'Yes'
                                      ? 'Enlarged'
                                      : 'Normal'}
                                  </Badge>
                                )}
                                {mensHealth.prostate_cancer && (
                                  <Badge
                                    variant={
                                      mensHealth.prostate_cancer === 'Yes'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {mensHealth.prostate_cancer === 'Yes'
                                      ? 'Cancer'
                                      : 'No Cancer'}
                                  </Badge>
                                )}
                                {!mensHealth.prostate_enlarged &&
                                  !mensHealth.prostate_cancer && (
                                    <span className='text-muted-foreground text-xs'>
                                      No data
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                {mensHealth.testes_growth && (
                                  <Badge
                                    variant={
                                      mensHealth.testes_growth === 'Yes'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {mensHealth.testes_growth === 'Yes'
                                      ? 'Growth'
                                      : 'Normal'}
                                  </Badge>
                                )}
                                {mensHealth.erections && (
                                  <Badge
                                    variant={
                                      mensHealth.erections === 'Normal'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                    className='text-xs'
                                  >
                                    {mensHealth.erections}
                                  </Badge>
                                )}
                                {!mensHealth.testes_growth &&
                                  !mensHealth.erections && (
                                    <span className='text-muted-foreground text-xs'>
                                      No data
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  mensHealth.require_urologist === 'Yes'
                                    ? 'destructive'
                                    : mensHealth.require_urologist === 'No'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {mensHealth.require_urologist || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {formatDate(mensHealth.date_created)}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(mensHealth);
                                  }}
                                  className='hover-lift'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='hover-lift text-destructive hover:text-destructive'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openDeleteModal(mensHealth);
                                  }}
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
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className='hover-lift'
                      >
                        <ChevronsLeft className='h-4 w-4' />
                        <span className='hidden sm:inline ml-1'>First</span>
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className='hover-lift'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        <span className='hidden sm:inline ml-1'>Previous</span>
                      </Button>

                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const startPage = Math.max(1, pagination.page - 2);
                          const page = startPage + i;
                          if (page > pagination.totalPages) return null;

                          return (
                            <Button
                              key={`lifestyle-page-${page}`}
                              variant={
                                page === pagination.page ? 'default' : 'outline'
                              }
                              size='sm'
                              onClick={() => handlePageChange(page)}
                              className='hover-lift min-w-[40px]'
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className='hover-lift'
                      >
                        <span className='hidden sm:inline mr-1'>Next</span>
                        <ChevronRight className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className='hover-lift'
                      >
                        <span className='hidden sm:inline mr-1'>Last</span>
                        <ChevronsRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resize Handle */}
          {selectedMensHealth && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Men's Health Details */}
          {selectedMensHealth && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        Men's Health Assessment
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <span className='text-lg font-medium'>
                          {getEmployeeName(selectedMensHealth)}
                        </span>
                        <Badge variant='outline'>{selectedMensHealth.id}</Badge>
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedMensHealth.user_updated || 'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedMensHealth.date_updated
                            ? new Date(
                                selectedMensHealth.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedMensHealth(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Report Information */}
                  {selectedMensHealth.report_id && (
                    <>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                            <FileText className='h-4 w-4' />
                            Report Information
                          </h3>
                        </div>
                        <div className='grid grid-cols-1 gap-3 text-sm'>
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Report ID:
                            </span>
                            <Badge variant='outline' className='font-mono'>
                              {selectedMensHealth.report_id}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* General Health Conditions */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        General Health Conditions
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Ever Diagnosed With:
                        </span>
                        <span className='font-medium'>
                          {selectedMensHealth.ever_diagnosed_with ||
                            'No data recorded'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Prostate Health Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        Prostate Health
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Prostate Enlarged:
                        </span>
                        {selectedMensHealth.prostate_enlarged ? (
                          <Badge
                            variant={
                              String(
                                selectedMensHealth.prostate_enlarged
                              ).toLowerCase() === 'yes' ||
                              selectedMensHealth.prostate_enlarged === true
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {String(selectedMensHealth.prostate_enlarged)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            No data recorded
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Prostate Infection:
                        </span>
                        {selectedMensHealth.prostate_infection ? (
                          <Badge
                            variant={
                              String(
                                selectedMensHealth.prostate_infection
                              ).toLowerCase() === 'yes' ||
                              selectedMensHealth.prostate_infection === true
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {String(selectedMensHealth.prostate_infection)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            No data recorded
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Prostate Cancer:
                        </span>
                        {selectedMensHealth.prostate_cancer ? (
                          <Badge
                            variant={
                              String(
                                selectedMensHealth.prostate_cancer
                              ).toLowerCase() === 'yes' ||
                              selectedMensHealth.prostate_cancer === true
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {String(selectedMensHealth.prostate_cancer)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            No data recorded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Testicular Health Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        Testicular Health
                      </h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Testes Growth:
                        </span>
                        {selectedMensHealth.testes_growth ? (
                          <Badge
                            variant={
                              String(
                                selectedMensHealth.testes_growth
                              ).toLowerCase() === 'yes' ||
                              selectedMensHealth.testes_growth === true
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {String(selectedMensHealth.testes_growth)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            No data recorded
                          </span>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Erections:
                        </span>
                        {selectedMensHealth.erections ? (
                          <Badge
                            variant={
                              String(
                                selectedMensHealth.erections
                              ).toLowerCase() === 'normal'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {String(selectedMensHealth.erections)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            No data recorded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Urologist Requirement */}
                  <Separator />
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        Urologist Consultation
                      </h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Urologist Required:
                        </span>
                        {selectedMensHealth.require_urologist ? (
                          <Badge
                            variant={
                              String(
                                selectedMensHealth.require_urologist
                              ).toLowerCase() === 'yes' ||
                              selectedMensHealth.require_urologist === true
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {String(selectedMensHealth.require_urologist)}
                          </Badge>
                        ) : (
                          <span className='text-muted-foreground'>
                            No data recorded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <Separator />
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        Clinical Notes
                      </h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      {selectedMensHealth.notes_header && (
                        <div className='text-sm font-medium text-foreground mb-2'>
                          {selectedMensHealth.notes_header}
                        </div>
                      )}
                      {selectedMensHealth.notes_text ? (
                        <div className='p-3 bg-muted/30 rounded-lg'>
                          <span className='text-muted-foreground'>
                            {selectedMensHealth.notes_text}
                          </span>
                        </div>
                      ) : (
                        <div className='p-3 bg-muted/30 rounded-lg'>
                          <span className='text-muted-foreground'>
                            No clinical notes recorded
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <Separator />
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        Health Recommendations
                      </h3>
                    </div>
                    <div className='space-y-3 text-sm'>
                      {selectedMensHealth.recommendation_text ? (
                        <div className='p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800'>
                          <span className='text-blue-800 dark:text-blue-200'>
                            {selectedMensHealth.recommendation_text}
                          </span>
                        </div>
                      ) : (
                        <div className='p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800'>
                          <span className='text-blue-800 dark:text-blue-200'>
                            No health recommendations recorded
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Men's Health Record</DialogTitle>
              <DialogDescription>
                Add a new men's health assessment for an employee.
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

              {/* General Health Conditions */}
              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='ever_diagnosed_with'>Ever Diagnosed With</Label>
                <Input
                  id='ever_diagnosed_with'
                  value={formData.ever_diagnosed_with || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      ever_diagnosed_with: e.target.value,
                    })
                  }
                  placeholder='Any previous diagnoses or conditions'
                />
              </div>

              {/* Prostate Health Section */}
              <div className='space-y-2'>
                <Label htmlFor='prostate_enlarged'>Prostate Enlarged</Label>
                <Select
                  value={formData.prostate_enlarged || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, prostate_enlarged: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='prostate_infection'>Prostate Infection</Label>
                <Select
                  value={formData.prostate_infection || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, prostate_infection: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='prostate_cancer'>Prostate Cancer</Label>
                <Select
                  value={formData.prostate_cancer || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, prostate_cancer: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Testicular Health Section */}
              <div className='space-y-2'>
                <Label htmlFor='testes_growth'>Testes Growth</Label>
                <Select
                  value={formData.testes_growth || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, testes_growth: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='erections'>Erections</Label>
                <Select
                  value={formData.erections || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, erections: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='require_urologist'>Require Urologist</Label>
                <Select
                  value={formData.require_urologist || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, require_urologist: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select requirement' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes and Recommendations */}
              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_header'>Notes Header</Label>
                <Input
                  id='notes_header'
                  value={formData.notes_header || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_header: e.target.value })
                  }
                  placeholder='Brief summary of notes'
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_text'>Clinical Notes</Label>
                <Textarea
                  id='notes_text'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder="Additional clinical notes about men's health assessment..."
                  rows={3}
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='recommendation_text'>
                  Health Recommendations
                </Label>
                <Textarea
                  id='recommendation_text'
                  value={formData.recommendation_text || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      recommendation_text: e.target.value,
                    })
                  }
                  placeholder="Health and men's health recommendations..."
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
              <DialogTitle>Edit Men's Health Record</DialogTitle>
              <DialogDescription>
                Update the men's health assessment for{' '}
                {editingMensHealth ? getEmployeeName(editingMensHealth) : ''}.
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

              {/* General Health Conditions */}
              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='ever_diagnosed_with_edit'>
                  Ever Diagnosed With
                </Label>
                <Input
                  id='ever_diagnosed_with_edit'
                  value={formData.ever_diagnosed_with || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      ever_diagnosed_with: e.target.value,
                    })
                  }
                  placeholder='Any previous diagnoses or conditions'
                />
              </div>

              {/* Prostate Health Section */}
              <div className='space-y-2'>
                <Label htmlFor='prostate_enlarged_edit'>
                  Prostate Enlarged
                </Label>
                <Select
                  value={formData.prostate_enlarged || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, prostate_enlarged: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='prostate_infection_edit'>
                  Prostate Infection
                </Label>
                <Select
                  value={formData.prostate_infection || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, prostate_infection: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='prostate_cancer_edit'>Prostate Cancer</Label>
                <Select
                  value={formData.prostate_cancer || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, prostate_cancer: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Testicular Health Section */}
              <div className='space-y-2'>
                <Label htmlFor='testes_growth_edit'>Testes Growth</Label>
                <Select
                  value={formData.testes_growth || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, testes_growth: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='erections_edit'>Erections</Label>
                <Select
                  value={formData.erections || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, erections: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='require_urologist_edit'>
                  Require Urologist
                </Label>
                <Select
                  value={formData.require_urologist || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, require_urologist: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select requirement' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Yes'>Yes</SelectItem>
                    <SelectItem value='No'>No</SelectItem>
                    <SelectItem value='Unknown'>Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes and Recommendations */}
              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_header_edit'>Notes Header</Label>
                <Input
                  id='notes_header_edit'
                  value={formData.notes_header || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_header: e.target.value })
                  }
                  placeholder='Brief summary of notes'
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='notes_text_edit'>Clinical Notes</Label>
                <Textarea
                  id='notes_text_edit'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder="Additional clinical notes about men's health assessment..."
                  rows={3}
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='recommendation_text_edit'>
                  Health Recommendations
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
                  placeholder="Health and men's health recommendations..."
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
                <AlertCircle className='h-5 w-4 text-destructive' />
                Delete Men's Health Record
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this men's health record for{' '}
                <span className='font-medium'>
                  {editingMensHealth ? getEmployeeName(editingMensHealth) : ''}
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
