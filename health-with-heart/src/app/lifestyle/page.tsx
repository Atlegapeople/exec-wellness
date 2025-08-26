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
  DollarSign,
} from 'lucide-react';

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
    fetchOrganizations();
    fetchSites();
    fetchLocations();
    fetchCostCenters();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1, searchTerm);
  };

  const updateURL = useCallback(
    (page: number, search: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);

      const newURL = `/lifestyle${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm);
    transitionToPage(newPage);
  };

  const handleLifestyleClick = (lifestyle: Lifestyle) => {
    setSelectedLifestyle(lifestyle);
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

            {/* Navigation Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card
                className='hover-lift cursor-pointer'
                onClick={openOrganizationsModal}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <Building2 className='h-8 w-8 text-blue-600' />
                    <div>
                      <h3 className='font-semibold'>Organizations</h3>
                      <p className='text-sm text-muted-foreground'>
                        {organizations.length} organizations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className='hover-lift cursor-pointer'
                onClick={openSitesModal}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <MapPin className='h-8 w-8 text-green-600' />
                    <div>
                      <h3 className='font-semibold'>Sites</h3>
                      <p className='text-sm text-muted-foreground'>
                        {sites.length} sites
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className='hover-lift cursor-pointer'
                onClick={openLocationsModal}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <MapPin className='h-8 w-8 text-purple-600' />
                    <div>
                      <h3 className='font-semibold'>Locations</h3>
                      <p className='text-sm text-muted-foreground'>
                        {locations.length} locations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className='hover-lift cursor-pointer'
                onClick={openCostCentersModal}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <DollarSign className='h-8 w-8 text-orange-600' />
                    <div>
                      <h3 className='font-semibold'>Cost Centers</h3>
                      <p className='text-sm text-muted-foreground'>
                        {costCenters.length} cost centers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  <Button onClick={openCreateModal} className='hover-lift'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add New Record
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
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedLifestyle.user_updated || 'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedLifestyle.date_updated
                            ? new Date(
                                selectedLifestyle.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedLifestyle(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Smoking Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Cigarette className='h-4 w-4' />
                        {selectedLifestyle.smoking_header ||
                          'Smoking Information'}
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingSmoking && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingSmoking(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingSmoking ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() => setIsEditingSmoking(!isEditingSmoking)}
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingSmoking ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
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
                  </div>

                  <Separator />

                  {/* Alcohol Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Wine className='h-4 w-4' />
                        {selectedLifestyle.alcohol_header ||
                          'Alcohol Information'}
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingAlcohol && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingAlcohol(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingAlcohol ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() => setIsEditingAlcohol(!isEditingAlcohol)}
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingAlcohol ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
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
                            selectedLifestyle.auditc_result?.includes('No Risk')
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
                  </div>

                  <Separator />

                  {/* Exercise Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Dumbbell className='h-4 w-4' />
                        Exercise & Activity
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingExercise && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingExercise(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingExercise ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() =>
                            setIsEditingExercise(!isEditingExercise)
                          }
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingExercise ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
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
                  </div>

                  <Separator />

                  {/* Diet Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Apple className='h-4 w-4' />
                        {selectedLifestyle.diet_header || 'Diet Information'}
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingNutrition && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingNutrition(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingNutrition ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() =>
                            setIsEditingNutrition(!isEditingNutrition)
                          }
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingNutrition ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
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
                  </div>

                  <Separator />

                  {/* Sleep Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Moon className='h-4 w-4' />
                        {selectedLifestyle.sleep_header || 'Sleep Information'}
                      </h3>
                      <div className='flex gap-2'>
                        {isEditingSleep && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingSleep(false)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant={isEditingSleep ? 'default' : 'outline'}
                          size='sm'
                          className='hover-lift'
                          onClick={() => setIsEditingSleep(!isEditingSleep)}
                        >
                          <Edit className='h-3 w-3 mr-1' />
                          {isEditingSleep ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
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
                  </div>

                  {selectedLifestyle.notes_text && (
                    <>
                      <Separator />
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                            {selectedLifestyle.notes_header || 'Notes'}
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
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                            <Heart className='h-4 w-4' />
                            Recommendations
                          </h3>
                          <div className='flex gap-2'>
                            {isEditingRecommendations && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='hover-lift'
                                onClick={() =>
                                  setIsEditingRecommendations(false)
                                }
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant={
                                isEditingRecommendations ? 'default' : 'outline'
                              }
                              size='sm'
                              className='hover-lift'
                              onClick={() =>
                                setIsEditingRecommendations(
                                  !isEditingRecommendations
                                )
                              }
                            >
                              <Edit className='h-3 w-3 mr-1' />
                              {isEditingRecommendations ? 'Save' : 'Edit'}
                            </Button>
                          </div>
                        </div>
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
