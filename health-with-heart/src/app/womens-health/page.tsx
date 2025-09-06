'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Baby,
  Calendar,
  Shield,
  Eye,
  Ear,
  Brain,
  Zap,
} from 'lucide-react';
import { useRouteState } from '@/hooks/useRouteState';

interface WomensHealth {
  id: string;
  employee_id?: string;
  employee_name?: string;
  employee_surname?: string;
  report_id?: string;
  date_created?: Date;
  date_updated?: Date;
  user_created?: string;

  // Women's health specific fields from the new query
  gynaecological_symptoms?: string;
  yes_gynaecological_symptoms?: string;
  pap_header?: string;
  are_you_header?: string;
  hormonal_contraception?: string;
  hormonel_replacement_therapy?: string;
  pregnant?: string;
  pregnant_weeks?: string;
  breastfeeding?: string;
  concieve?: string;
  last_pap?: string;
  pap_date?: string;
  pap_result?: string;
  require_pap?: string;
  breast_symptoms?: string;
  breast_symptoms_yes?: string;
  mammogram_result?: string;
  last_mammogram?: string;
  breast_problems?: string;
  require_mamogram?: string;
  notes_header?: string;
  notes_text?: string;
  recommendation_text?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function WomensHealthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract employee filter from URL
  const employeeFilter = searchParams.get('employee');

  const [allWomensHealth, setAllWomensHealth] = useState<WomensHealth[]>([]);
  const [filteredWomensHealth, setFilteredWomensHealth] = useState<
    WomensHealth[]
  >([]);
  const [displayedWomensHealth, setDisplayedWomensHealth] = useState<
    WomensHealth[]
  >([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedWomensHealth, setSelectedWomensHealth] =
    useState<WomensHealth | null>(null);
  const [leftWidth, setLeftWidth] = useRouteState<number>('leftPanelWidth', 40, { scope: 'path' });
  const [selectedWomensHealthId, setSelectedWomensHealthId] = useRouteState<string | null>('selectedWomensHealthId', null, { scope: 'path' });
  const [isResizing, setIsResizing] = useState(false);

  // Editing states for different sections
  const [isEditingGynaecological, setIsEditingGynaecological] = useState(false);
  const [isEditingPap, setIsEditingPap] = useState(false);
  const [isEditingBreast, setIsEditingBreast] = useState(false);
  const [isEditingPregnancy, setIsEditingPregnancy] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRecommendations, setIsEditingRecommendations] =
    useState(false);

  // Editing data for inline editing
  const [editingData, setEditingData] = useState<Partial<WomensHealth>>({});

  // Page transition state
  const [pageTransitioning, setPageTransitioning] = useState(false);

  // CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingWomensHealth, setEditingWomensHealth] =
    useState<WomensHealth | null>(null);
  const [formData, setFormData] = useState<Partial<WomensHealth>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Handle women's health click
  const handleWomensHealthClick = (womensHealth: WomensHealth) => {
    setSelectedWomensHealth(womensHealth);
    setSelectedWomensHealthId(womensHealth.id);
  };

  // Inline editing functions
  const startEditing = (section: string) => {
    setEditingData(selectedWomensHealth || {});
    switch (section) {
      case 'gynaecological':
        setIsEditingGynaecological(true);
        break;
      case 'pap':
        setIsEditingPap(true);
        break;
      case 'breast':
        setIsEditingBreast(true);
        break;
      case 'pregnancy':
        setIsEditingPregnancy(true);
        break;
      case 'notes':
        setIsEditingNotes(true);
        break;
      case 'recommendations':
        setIsEditingRecommendations(true);
        break;
    }
  };

  const cancelEditing = (section: string) => {
    setEditingData({});
    switch (section) {
      case 'gynaecological':
        setIsEditingGynaecological(false);
        break;
      case 'pap':
        setIsEditingPap(false);
        break;
      case 'breast':
        setIsEditingBreast(false);
        break;
      case 'pregnancy':
        setIsEditingPregnancy(false);
        break;
      case 'notes':
        setIsEditingNotes(false);
        break;
      case 'recommendations':
        setIsEditingRecommendations(false);
        break;
    }
  };

  const saveEditing = async (section: string) => {
    if (!selectedWomensHealth?.id) return;

    try {
      setFormLoading(true);

      // Use PATCH endpoint for more efficient partial updates
      const response = await fetch('/api/womens-health', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedWomensHealth.id,
          section: section,
          ...editingData,
        }),
      });

      if (response.ok) {
        // Update local state
        const updatedData = await response.json();
        setSelectedWomensHealth(prev => ({ ...prev, ...updatedData }));

        // Refresh the main list
        fetchAllWomensHealth();

        // Exit edit mode
        cancelEditing(section);
        setEditingData({});

        // Show success message if there were changes
        if (updatedData.changedFields && updatedData.changedFields.length > 0) {
          console.log(
            `Successfully updated ${section} section:`,
            updatedData.message
          );
        } else {
          console.log('No changes detected');
        }
      } else {
        const errorData = await response.json();
        console.error('Error updating record:', errorData.error);
      }
    } catch (error) {
      console.error("Error updating women's health record:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Reset form data to empty state
  const resetFormData = () => {
    setFormData({
      employee_id: employeeFilter || '',
      report_id: '',
      gynaecological_symptoms: '',
      yes_gynaecological_symptoms: '',
      pap_header: '',
      are_you_header: '',
      hormonal_contraception: '',
      hormonel_replacement_therapy: '',
      pregnant: '',
      pregnant_weeks: '',
      breastfeeding: '',
      concieve: '',
      last_pap: '',
      pap_date: '',
      pap_result: '',
      require_pap: '',
      breast_symptoms: '',
      breast_symptoms_yes: '',
      mammogram_result: '',
      last_mammogram: '',
      breast_problems: '',
      require_mamogram: '',
      notes_header: '',
      notes_text: '',
      recommendation_text: '',
    });
  };

  // Open edit modal
  const openEditModal = (womensHealth: WomensHealth) => {
    console.log('Opening edit modal for:', womensHealth);
    console.log('Form data being set:', womensHealth);
    console.log('Gynecological symptoms:', womensHealth.gynaecological_symptoms);
    console.log('Breast symptoms:', womensHealth.breast_symptoms);
    console.log('Pregnant:', womensHealth.pregnant);
    setEditingWomensHealth(womensHealth);
    setFormData(womensHealth);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (womensHealth: WomensHealth) => {
    setSelectedWomensHealth(womensHealth);
    setIsDeleteModalOpen(true);
  };

  // Resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(
        20,
        Math.min(80, startWidth + (deltaX / window.innerWidth) * 100)
      );
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Fetch all women's health data
  const fetchAllWomensHealth = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL('/api/womens-health', window.location.origin);
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '10000');
      url.searchParams.set('_t', Date.now().toString());

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
      console.log('API response data:', data);
      console.log('First record sample:', data.womensHealth?.[0]);

      setAllWomensHealth(data.womensHealth || []);

      if (employeeFilter && data.womensHealth && data.womensHealth.length > 0) {
        const employeeWomensHealth = data.womensHealth[0];
        setSelectedWomensHealth(employeeWomensHealth);
      } else if (
        employeeFilter &&
        data.womensHealth &&
        data.womensHealth.length === 0
      ) {
        resetFormData();
        setIsCreateModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching women's health records:", error);
    } finally {
      setLoading(false);
    }
  }, [employeeFilter]);

  // Client-side filtering
  const filterWomensHealth = useCallback(
    (womensHealth: WomensHealth[], search: string) => {
      if (!search) return womensHealth;

      return womensHealth.filter(record => {
        try {
          const employeeName =
            `${record.employee_name || ''} ${record.employee_surname || ''}`.trim();
          const searchLower = search.toLowerCase();

          console.log('Filtering record:', record);
          console.log('Record fields:', {
            id: record.id,
            employee_id: record.employee_id,
            breast_symptoms: record.breast_symptoms,
            gynaecological_symptoms: record.gynaecological_symptoms,
            pap_result: record.pap_result,
          });

          return (
            (record.id &&
              typeof record.id === 'string' &&
              record.id.toLowerCase().includes(searchLower)) ||
            (record.employee_id &&
              typeof record.employee_id === 'string' &&
              record.employee_id.toLowerCase().includes(searchLower)) ||
            employeeName.toLowerCase().includes(searchLower) ||
            (record.breast_symptoms &&
              typeof record.breast_symptoms === 'string' &&
              record.breast_symptoms.toLowerCase().includes(searchLower)) ||
            (record.gynaecological_symptoms &&
              typeof record.gynaecological_symptoms === 'string' &&
              record.gynaecological_symptoms
                .toLowerCase()
                .includes(searchLower)) ||
            (record.pap_result &&
              typeof record.pap_result === 'string' &&
              record.pap_result.toLowerCase().includes(searchLower))
          );
        } catch (error) {
          console.error('Error filtering record:', error, record);
          return false;
        }
      });
    },
    []
  );

  // Helper function to get employee name
  const getEmployeeName = (womensHealth: WomensHealth) => {
    return womensHealth.employee_name && womensHealth.employee_surname
      ? `${womensHealth.employee_name} ${womensHealth.employee_surname}`
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

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(1, searchTerm);
  };

  // Update URL with search parameters
  const updateURL = useCallback(
    (page: number, search: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', page.toString());
      if (search) params.set('search', search);

      const newURL = `/womens-health${params.toString() ? `?${params.toString()}` : ''}`;
      router.replace(newURL, { scroll: false });
    },
    [router]
  );

  // Handle search filtering
  const handleSearchFilter = useCallback(
    (search: string) => {
      setSearchTerm(search);
      const filtered = filterWomensHealth(allWomensHealth, search);
      setFilteredWomensHealth(filtered);

      // Reset to first page when searching
      setPagination(prev => ({ ...prev, page: 1 }));
      setDisplayedWomensHealth(filtered.slice(0, pagination.limit));
    },
    [allWomensHealth, filterWomensHealth, pagination.limit]
  );

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateURL(newPage, searchTerm);
      const startIndex = (newPage - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      setDisplayedWomensHealth(
        filteredWomensHealth.slice(startIndex, endIndex)
      );
      setPagination(prev => ({ ...prev, page: newPage }));
    },
    [filteredWomensHealth, pagination.limit, updateURL, searchTerm]
  );

  // Update pagination info when filtered data changes
  const updatePagination = useCallback(() => {
    const total = filteredWomensHealth.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPreviousPage = pagination.page > 1;

    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    }));
  }, [filteredWomensHealth.length, pagination.limit, pagination.page]);

  // CRUD operations
  const handleCreate = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/womens-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        setFormData({});
        fetchAllWomensHealth();
      }
    } catch (error) {
      console.error("Error creating women's health record:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingWomensHealth?.id) return;

    try {
      setFormLoading(true);
      const response = await fetch('/api/womens-health', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingWomensHealth.id, ...formData }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingWomensHealth(null);
        setFormData({});
        fetchAllWomensHealth();
      }
    } catch (error) {
      console.error("Error updating women's health record:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWomensHealth?.id) return;

    try {
      const response = await fetch(
        `/api/womens-health?id=${selectedWomensHealth.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setSelectedWomensHealth(null);
        setIsDeleteModalOpen(false);
        fetchAllWomensHealth();
      }
    } catch (error) {
      console.error("Error deleting women's health record:", error);
    }
  };

  // Effects
  useEffect(() => {
    fetchAllWomensHealth();
    fetchEmployees();
  }, [fetchAllWomensHealth]);

  // Watch for URL changes and refetch if employee filter changes
  useEffect(() => {
    const currentEmployeeFilter = new URLSearchParams(
      window.location.search
    ).get('employee');
    if (currentEmployeeFilter !== employeeFilter) {
      console.log("URL changed - refetching women's health records");
      fetchAllWomensHealth();
    }
  }, [employeeFilter, fetchAllWomensHealth]);

  // Debug form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
    console.log('Conditional checks:', {
      gynaecological_symptoms: (formData.gynaecological_symptoms === 'Yes' || formData.gynaecological_symptoms === 'yes'),
      breast_symptoms: (formData.breast_symptoms === 'Yes' || formData.breast_symptoms === 'yes'),
      pregnant: (formData.pregnant === 'Yes' || formData.pregnant === 'yes')
    });
  }, [formData]);

  useEffect(() => {
    handleSearchFilter(searchTerm);
  }, [allWomensHealth, searchTerm, handleSearchFilter]);

  // Update pagination when filtered data changes
  useEffect(() => {
    updatePagination();
  }, [updatePagination]);

  useEffect(() => {
    const restore = async () => {
      if (!selectedWomensHealth && selectedWomensHealthId) {
        const found = allWomensHealth.find(w => w.id === selectedWomensHealthId);
        if (found) {
          setSelectedWomensHealth(found);
          return;
        }
        try {
          const res = await fetch(`/api/womens-health?search=${encodeURIComponent(selectedWomensHealthId)}`);
          if (res.ok) {
            const data = await res.json();
            const record = (data.womensHealth || []).find((r: any) => r.id === selectedWomensHealthId);
            if (record) setSelectedWomensHealth(record); else setSelectedWomensHealthId(null);
          } else {
            setSelectedWomensHealthId(null);
          }
        } catch {
          setSelectedWomensHealthId(null);
        }
      }
    };
    restore();
  }, [selectedWomensHealthId, selectedWomensHealth, allWomensHealth]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='container mx-auto p-6 space-y-6'>
        {/* Back Button */}
        <div className='flex justify-start'>
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
        <Card className='glass-effect mb-4'>
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

        {/* Data Table - Full Width when no selection, Resizable when selected */}
        {selectedWomensHealth ? (
          <div className='flex gap-4'>
            {/* Left Panel - Data Table */}
            <div style={{ width: `${leftWidth}%` }}>
              <Card className='hover-lift'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                        <Heart className='h-6 w-6' />
                        Women's Health ({filteredWomensHealth.length})
                      </CardTitle>
                      <CardDescription>
                        Women's health assessments and screenings
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        resetFormData();
                        setIsCreateModalOpen(true);
                      }}
                      className={`hover-lift ${selectedWomensHealth ? 'rounded-full w-10 h-10 p-0' : ''}`}
                    >
                      <Plus className='h-4 w-4' />
                      {!selectedWomensHealth && <span className='ml-2'>Add New Record</span>}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='max-h-[600px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Breast Health</TableHead>
                          <TableHead>PAP Results</TableHead>
                          <TableHead>Pregnancy</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody
                        className={`table-transition ${pageTransitioning ? 'transitioning' : ''}`}
                      >
                        {displayedWomensHealth.map(womensHealth => (
                          <TableRow
                            key={womensHealth.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedWomensHealth?.id === womensHealth.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() =>
                              handleWomensHealthClick(womensHealth)
                            }
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {getEmployeeName(womensHealth)}
                                </div>
                                <div className='text-sm text-muted-foreground truncate'>
                                  {womensHealth.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                {womensHealth.mammogram_result && (
                                  <Badge
                                    variant={
                                      womensHealth.mammogram_result === 'Normal'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                    className='text-xs'
                                  >
                                    {womensHealth.mammogram_result}
                                  </Badge>
                                )}
                                {!womensHealth.breast_symptoms &&
                                  !womensHealth.mammogram_result && (
                                    <span className='text-muted-foreground text-xs'>
                                      N/A
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                {womensHealth.pap_result && (
                                  <Badge
                                    variant={
                                      womensHealth.pap_result === 'Normal'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                    className='text-xs'
                                  >
                                    {womensHealth.pap_result}
                                  </Badge>
                                )}
                                {!womensHealth.gynaecological_symptoms &&
                                  !womensHealth.pap_result && (
                                    <span className='text-muted-foreground text-xs'>
                                      N/A
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                {womensHealth.pregnant && (
                                  <Badge
                                    variant={
                                      womensHealth.pregnant === 'Yes'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {womensHealth.pregnant === 'Yes'
                                      ? 'Pregnant'
                                      : 'Not Pregnant'}
                                  </Badge>
                                )}
                                {womensHealth.breastfeeding && (
                                  <Badge
                                    variant={
                                      womensHealth.breastfeeding === 'Yes'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className='text-xs'
                                  >
                                    {womensHealth.breastfeeding === 'Yes'
                                      ? 'Breastfeeding'
                                      : 'Not Breastfeeding'}
                                  </Badge>
                                )}
                                {!womensHealth.pregnant &&
                                  !womensHealth.breastfeeding && (
                                    <span className='text-muted-foreground text-xs'>
                                      N/A
                                    </span>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell className='text-sm'>
                              {womensHealth.date_created
                                ? new Date(
                                    womensHealth.date_created
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditModal(womensHealth);
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
                                    openDeleteModal(womensHealth);
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

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-2'>
                      <div className='text-sm text-muted-foreground'>
                        Showing{' '}
                        {filteredWomensHealth.length > 0
                          ? (pagination.page - 1) * pagination.limit + 1
                          : 0}{' '}
                        to{' '}
                        {Math.min(
                          pagination.page * pagination.limit,
                          filteredWomensHealth.length
                        )}{' '}
                        of {filteredWomensHealth.length} results
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
                            className={`${selectedWomensHealth && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                            className={`${selectedWomensHealth && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                          >
                            Previous
                          </span>
                        </Button>

                        {/* Page Numbers */}
                        {Array.from(
                          {
                            length: Math.min(
                              selectedWomensHealth && leftWidth < 50 ? 3 : 5,
                              pagination.totalPages
                            ),
                          },
                          (_, i) => {
                            const startPage = Math.max(
                              1,
                              pagination.page -
                                (selectedWomensHealth && leftWidth < 50 ? 1 : 2)
                            );
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`womens-health-page-${page}`}
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
                            className={`${selectedWomensHealth && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
                            className={`${selectedWomensHealth && leftWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
            {selectedWomensHealth && (
              <div
                className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
                onMouseDown={handleMouseDown}
                style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
              />
            )}

            {/* Right Panel - Women's Health Details */}
            {selectedWomensHealth && (
              <div
                className='space-y-4 animate-slide-up'
                style={{ width: `${100 - leftWidth}%` }}
              >
                <Card className='glass-effect'>
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-1'>
                        <CardTitle className='text-2xl medical-heading'>
                          Women's Health Assessment
                        </CardTitle>
                        <CardDescription className='flex items-center gap-2'>
                          <span className='text-lg font-medium'>
                            {getEmployeeName(selectedWomensHealth)}
                          </span>
                          <Badge variant='outline'>
                            {selectedWomensHealth.id}
                          </Badge>
                        </CardDescription>
                        {/* Last Updated Information */}
                        <div className='text-xs text-muted-foreground mt-2'>
                          <span>Last updated by </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.user_created || 'Unknown'}
                          </span>
                          <span> on </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.date_updated
                              ? new Date(
                                  selectedWomensHealth.date_updated
                                ).toLocaleString()
                              : selectedWomensHealth.date_created
                                ? new Date(
                                    selectedWomensHealth.date_created
                                  ).toLocaleString()
                                : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openDeleteModal(selectedWomensHealth)}
                          className='hover-lift text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedWomensHealthId(null)}
                          className='hover-lift'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                    {/* Gynecological Health Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Activity className='h-4 w-4' />
                          {selectedWomensHealth.pap_header ||
                            'Gynecological Health'}
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingGynaecological && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => cancelEditing('gynaecological')}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={
                              isEditingGynaecological ? 'default' : 'outline'
                            }
                            size='sm'
                            className='hover-lift'
                            onClick={() =>
                              isEditingGynaecological
                                ? saveEditing('gynaecological')
                                : startEditing('gynaecological')
                            }
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            ) : (
                              <Edit className='h-3 w-3 mr-1' />
                            )}
                            {isEditingGynaecological ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Symptoms:
                          </span>
                          {isEditingGynaecological ? (
                            <Select
                              value={editingData.gynaecological_symptoms || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  gynaecological_symptoms: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select symptoms' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.gynaecological_symptoms ||
                                'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Yes Symptoms:
                          </span>
                          {isEditingGynaecological ? (
                            <Input
                              value={
                                editingData.yes_gynaecological_symptoms || ''
                              }
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  yes_gynaecological_symptoms: e.target.value,
                                }))
                              }
                              className='w-[200px]'
                              placeholder='Enter symptoms description'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.yes_gynaecological_symptoms ||
                                'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Hormonal Contraception:
                          </span>
                          {isEditingGynaecological ? (
                            <Select
                              value={editingData.hormonal_contraception || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  hormonal_contraception: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select status' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.hormonal_contraception ||
                                'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            HRT:
                          </span>
                          {isEditingGynaecological ? (
                            <Select
                              value={
                                editingData.hormonel_replacement_therapy || ''
                              }
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  hormonel_replacement_therapy: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select status' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.hormonel_replacement_therapy ||
                                'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Pap Smear Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Shield className='h-4 w-4' />
                          {selectedWomensHealth.are_you_header || 'Pap Smear'}
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingPap && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => cancelEditing('pap')}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingPap ? 'default' : 'outline'}
                            size='sm'
                            className='hover-lift'
                            onClick={() =>
                              isEditingPap
                                ? saveEditing('pap')
                                : startEditing('pap')
                            }
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            ) : (
                              <Edit className='h-3 w-3 mr-1' />
                            )}
                            {isEditingPap ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Last Pap:
                          </span>
                          {isEditingPap ? (
                            <Input
                              value={editingData.last_pap || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  last_pap: e.target.value,
                                }))
                              }
                              className='w-[200px]'
                              placeholder='Enter last pap information'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.last_pap || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Pap Date:
                          </span>
                          {isEditingPap ? (
                            <Input
                              type='date'
                              value={editingData.pap_date || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  pap_date: e.target.value,
                                }))
                              }
                              className='w-[200px]'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.pap_date || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Result:
                          </span>
                          {isEditingPap ? (
                            <Select
                              value={editingData.pap_result || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  pap_result: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select result' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Normal'>Normal</SelectItem>
                                <SelectItem value='Abnormal'>
                                  Abnormal
                                </SelectItem>
                                <SelectItem value='Inconclusive'>
                                  Inconclusive
                                </SelectItem>
                                <SelectItem value='Not Done'>
                                  Not Done
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant={
                                selectedWomensHealth.pap_result?.includes(
                                  'Normal'
                                )
                                  ? 'secondary'
                                  : selectedWomensHealth.pap_result?.includes(
                                        'Abnormal'
                                      )
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {selectedWomensHealth.pap_result || 'N/A'}
                            </Badge>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Require Pap:
                          </span>
                          {isEditingPap ? (
                            <Select
                              value={editingData.require_pap || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  require_pap: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select requirement' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.require_pap || 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Breast Health Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Heart className='h-4 w-4' />
                          Breast Health
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingBreast && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => cancelEditing('breast')}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingBreast ? 'default' : 'outline'}
                            size='sm'
                            className='hover-lift'
                            onClick={() =>
                              isEditingBreast
                                ? saveEditing('breast')
                                : startEditing('breast')
                            }
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            ) : (
                              <Edit className='h-3 w-3 mr-1' />
                            )}
                            {isEditingBreast ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Symptoms:
                          </span>
                          {isEditingBreast ? (
                            <Select
                              value={editingData.breast_symptoms || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  breast_symptoms: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select symptoms' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.breast_symptoms || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Yes Symptoms:
                          </span>
                          {isEditingBreast ? (
                            <Input
                              value={editingData.breast_symptoms_yes || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  breast_symptoms_yes: e.target.value,
                                }))
                              }
                              className='w-[200px]'
                              placeholder='Enter symptoms description'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.breast_symptoms_yes ||
                                'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Mammogram Result:
                          </span>
                          {isEditingBreast ? (
                            <Select
                              value={editingData.mammogram_result || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  mammogram_result: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select result' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Normal'>Normal</SelectItem>
                                <SelectItem value='Abnormal'>
                                  Abnormal
                                </SelectItem>
                                <SelectItem value='Inconclusive'>
                                  Inconclusive
                                </SelectItem>
                                <SelectItem value='Not Done'>
                                  Not Done
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant={
                                selectedWomensHealth.mammogram_result?.includes(
                                  'Normal'
                                )
                                  ? 'secondary'
                                  : selectedWomensHealth.mammogram_result?.includes(
                                        'Abnormal'
                                      )
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {selectedWomensHealth.mammogram_result || 'N/A'}
                            </Badge>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Last Mammogram:
                          </span>
                          {isEditingBreast ? (
                            <Input
                              type='date'
                              value={editingData.last_mammogram || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  last_mammogram: e.target.value,
                                }))
                              }
                              className='w-[200px]'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.last_mammogram || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Problems:
                          </span>
                          {isEditingBreast ? (
                            <Input
                              value={editingData.breast_problems || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  breast_problems: e.target.value,
                                }))
                              }
                              className='w-[200px]'
                              placeholder='Enter breast problems'
                            />
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.breast_problems || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Require Mammogram:
                          </span>
                          {isEditingBreast ? (
                            <Select
                              value={editingData.require_mamogram || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  require_mamogram: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select requirement' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.require_mamogram || 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Pregnancy Information */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                          <Baby className='h-4 w-4' />
                          Pregnancy Status
                        </h3>
                        <div className='flex gap-2'>
                          {isEditingPregnancy && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='hover-lift'
                              onClick={() => cancelEditing('pregnancy')}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingPregnancy ? 'default' : 'outline'}
                            size='sm'
                            className='hover-lift'
                            onClick={() =>
                              isEditingPregnancy
                                ? saveEditing('pregnancy')
                                : startEditing('pregnancy')
                            }
                            disabled={formLoading}
                          >
                            {formLoading ? (
                              <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            ) : (
                              <Edit className='h-3 w-3 mr-1' />
                            )}
                            {isEditingPregnancy ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Pregnant:
                          </span>
                          {isEditingPregnancy ? (
                            <Select
                              value={editingData.pregnant || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  pregnant: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select status' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant={
                                selectedWomensHealth.pregnant === 'Yes'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {selectedWomensHealth.pregnant || 'No'}
                            </Badge>
                          )}
                        </div>
                        {(selectedWomensHealth.pregnant === 'Yes' ||
                          editingData.pregnant === 'Yes') && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Weeks:
                            </span>
                            {isEditingPregnancy ? (
                              <Input
                                type='number'
                                value={editingData.pregnant_weeks || ''}
                                onChange={e =>
                                  setEditingData(prev => ({
                                    ...prev,
                                    pregnant_weeks: e.target.value,
                                  }))
                                }
                                className='w-[200px]'
                                placeholder='Enter weeks'
                                min='0'
                                max='42'
                              />
                            ) : (
                              <span className='font-medium'>
                                {selectedWomensHealth.pregnant_weeks || 'N/A'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Breastfeeding:
                          </span>
                          {isEditingPregnancy ? (
                            <Select
                              value={editingData.breastfeeding || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  breastfeeding: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select status' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.breastfeeding || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Trying to Conceive:
                          </span>
                          {isEditingPregnancy ? (
                            <Select
                              value={editingData.concieve || ''}
                              onValueChange={value =>
                                setEditingData(prev => ({
                                  ...prev,
                                  concieve: value,
                                }))
                              }
                            >
                              <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Select status' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Yes'>Yes</SelectItem>
                                <SelectItem value='No'>No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='font-medium'>
                              {selectedWomensHealth.concieve || 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedWomensHealth.notes_text && (
                      <>
                        <Separator />
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                              {selectedWomensHealth.notes_header || 'Notes'}
                            </h3>
                            <div className='flex gap-2'>
                              {isEditingNotes && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='hover-lift'
                                  onClick={() => cancelEditing('notes')}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant={isEditingNotes ? 'default' : 'outline'}
                                size='sm'
                                className='hover-lift'
                                onClick={() =>
                                  isEditingNotes
                                    ? saveEditing('notes')
                                    : startEditing('notes')
                                }
                                disabled={formLoading}
                              >
                                {formLoading ? (
                                  <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                                ) : (
                                  <Edit className='h-3 w-3 mr-1' />
                                )}
                                {isEditingNotes ? 'Save' : 'Edit'}
                              </Button>
                            </div>
                          </div>
                          {isEditingNotes ? (
                            <Textarea
                              value={editingData.notes_text || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  notes_text: e.target.value,
                                }))
                              }
                              className='text-sm min-h-[80px]'
                              placeholder='Enter notes...'
                            />
                          ) : (
                            <div className='text-sm p-3 bg-muted rounded-lg'>
                              {selectedWomensHealth.notes_text}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {selectedWomensHealth.recommendation_text && (
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
                                    cancelEditing('recommendations')
                                  }
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant={
                                  isEditingRecommendations
                                    ? 'default'
                                    : 'outline'
                                }
                                size='sm'
                                className='hover-lift'
                                onClick={() =>
                                  isEditingRecommendations
                                    ? saveEditing('recommendations')
                                    : startEditing('recommendations')
                                }
                                disabled={formLoading}
                              >
                                {formLoading ? (
                                  <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                                ) : (
                                  <Edit className='h-3 w-3 mr-1' />
                                )}
                                {isEditingRecommendations ? 'Save' : 'Edit'}
                              </Button>
                            </div>
                          </div>
                          {isEditingRecommendations ? (
                            <Textarea
                              value={editingData.recommendation_text || ''}
                              onChange={e =>
                                setEditingData(prev => ({
                                  ...prev,
                                  recommendation_text: e.target.value,
                                }))
                              }
                              className='text-sm min-h-[80px]'
                              placeholder='Enter recommendations...'
                            />
                          ) : (
                            <div className='text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                              {selectedWomensHealth.recommendation_text}
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
        ) : (
          /* Full Width Table when no selection */
          <Card className='hover-lift'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-2xl medical-heading'>
                    <Heart className='h-6 w-6' />
                    Women's Health ({filteredWomensHealth.length})
                  </CardTitle>
                  <CardDescription>
                    Women's health assessments and screenings
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    resetFormData();
                    setIsCreateModalOpen(true);
                  }}
                  className={`hover-lift ${selectedWomensHealth ? 'rounded-full w-10 h-10 p-0' : ''}`}
                >
                  <Plus className='h-4 w-4' />
                  {!selectedWomensHealth && <span className='ml-2'>Add New Record</span>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='max-h-[600px] overflow-auto scrollbar-premium'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Breast Health</TableHead>
                      <TableHead>PAP Results</TableHead>
                      <TableHead>Pregnancy</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedWomensHealth.map(womensHealth => (
                      <TableRow
                        key={womensHealth.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedWomensHealth?.id === womensHealth.id
                            ? 'bg-muted border-l-4 border-l-primary'
                            : ''
                        }`}
                        onClick={() => handleWomensHealthClick(womensHealth)}
                      >
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {getEmployeeName(womensHealth)}
                            </div>
                            <div className='text-sm text-muted-foreground truncate'>
                              {womensHealth.employee_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            {womensHealth.mammogram_result && (
                              <Badge
                                variant={
                                  womensHealth.mammogram_result === 'Normal'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className='text-xs'
                              >
                                {womensHealth.mammogram_result}
                              </Badge>
                            )}
                            {!womensHealth.breast_symptoms &&
                              !womensHealth.mammogram_result && (
                                <span className='text-muted-foreground text-xs'>
                                  N/A
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            {womensHealth.pap_result && (
                              <Badge
                                variant={
                                  womensHealth.pap_result === 'Normal'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className='text-xs'
                              >
                                {womensHealth.pap_result}
                              </Badge>
                            )}
                            {!womensHealth.gynaecological_symptoms &&
                              !womensHealth.pap_result && (
                                <span className='text-muted-foreground text-xs'>
                                  N/A
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            {womensHealth.pregnant && (
                              <Badge
                                variant={
                                  womensHealth.pregnant === 'Yes'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className='text-xs'
                              >
                                {womensHealth.pregnant === 'Yes'
                                  ? 'Pregnant'
                                  : 'Not Pregnant'}
                              </Badge>
                            )}
                            {womensHealth.breastfeeding && (
                              <Badge
                                variant={
                                  womensHealth.breastfeeding === 'Yes'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className='text-xs'
                              >
                                {womensHealth.breastfeeding === 'Yes'
                                  ? 'Breastfeeding'
                                  : 'Not Breastfeeding'}
                              </Badge>
                            )}
                            {!womensHealth.pregnant &&
                              !womensHealth.breastfeeding && (
                                <span className='text-muted-foreground text-xs'>
                                  N/A
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className='text-sm'>
                          {womensHealth.date_created
                            ? new Date(
                                womensHealth.date_created
                              ).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={e => {
                                e.stopPropagation();
                                openEditModal(womensHealth);
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
                                openDeleteModal(womensHealth);
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className='flex items-center justify-between mt-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing{' '}
                    {filteredWomensHealth.length > 0
                      ? (pagination.page - 1) * pagination.limit + 1
                      : 0}{' '}
                    to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      filteredWomensHealth.length
                    )}{' '}
                    of {filteredWomensHealth.length} results
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      <ChevronsLeft className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <span className='text-sm'>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage}
                    >
                      <ChevronsRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Modal */}
        <Dialog 
          open={isCreateModalOpen} 
          onOpenChange={(open) => {
            setIsCreateModalOpen(open);
            if (!open) {
              resetFormData();
            }
          }}
        >
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create Women's Health Record</DialogTitle>
              <DialogDescription>
                Add a new women's health assessment record
              </DialogDescription>
            </DialogHeader>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id'>Employee</Label>
                <Select
                  value={formData.employee_id || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, employee_id: value }))
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
                <Label htmlFor='report_id'>Report ID</Label>
                <Input
                  value={formData.report_id || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, report_id: e.target.value }))
                  }
                  placeholder='Enter report ID (optional)'
                />
              </div>
            </div>

            <div className='space-y-6'>
              {/* Gynecological Health Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Gynecological Health</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='gynaecological_symptoms'>Gynecological Symptoms</Label>
                    <Select
                      value={formData.gynaecological_symptoms || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, gynaecological_symptoms: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.gynaecological_symptoms === 'Yes' || formData.gynaecological_symptoms === 'yes') && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='yes_gynaecological_symptoms'>Symptoms Description</Label>
                        <Input
                          value={formData.yes_gynaecological_symptoms || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, yes_gynaecological_symptoms: e.target.value }))
                          }
                          placeholder='Describe symptoms if yes'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='hormonal_contraception'>Hormonal Contraception</Label>
                        <Select
                          value={formData.hormonal_contraception || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, hormonal_contraception: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='hormonel_replacement_therapy'>Hormone Replacement Therapy</Label>
                        <Select
                          value={formData.hormonel_replacement_therapy || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, hormonel_replacement_therapy: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pap Smear Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Pap Smear</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='last_pap'>Last Pap Smear</Label>
                    <Input
                      type='date'
                      value={formData.last_pap || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, last_pap: e.target.value }))
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pap_date'>Pap Smear Date</Label>
                    <Input
                      type='date'
                      value={formData.pap_date || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, pap_date: e.target.value }))
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pap_result'>Pap Smear Result</Label>
                    <Select
                      value={formData.pap_result || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, pap_result: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select result' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Normal'>Normal</SelectItem>
                        <SelectItem value='Abnormal'>Abnormal</SelectItem>
                        <SelectItem value='Inconclusive'>Inconclusive</SelectItem>
                        <SelectItem value='Not Done'>Not Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='require_pap'>Require Pap Smear</Label>
                    <Select
                      value={formData.require_pap || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, require_pap: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select requirement' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Breast Health Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Breast Health</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='breast_symptoms'>Breast Symptoms</Label>
                    <Select
                      value={formData.breast_symptoms || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, breast_symptoms: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.breast_symptoms === 'Yes' || formData.breast_symptoms === 'yes') && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='breast_symptoms_yes'>Symptoms Description</Label>
                        <Input
                          value={formData.breast_symptoms_yes || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, breast_symptoms_yes: e.target.value }))
                          }
                          placeholder='Describe symptoms if yes'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='mammogram_result'>Mammogram Result</Label>
                        <Select
                          value={formData.mammogram_result || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, mammogram_result: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select result' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Normal'>Normal</SelectItem>
                            <SelectItem value='Abnormal'>Abnormal</SelectItem>
                            <SelectItem value='Inconclusive'>Inconclusive</SelectItem>
                            <SelectItem value='Not Done'>Not Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='last_mammogram'>Last Mammogram</Label>
                        <Input
                          type='date'
                          value={formData.last_mammogram || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, last_mammogram: e.target.value }))
                          }
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='breast_problems'>Breast Problems</Label>
                        <Input
                          value={formData.breast_problems || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, breast_problems: e.target.value }))
                          }
                          placeholder='Describe any breast problems'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='require_mamogram'>Require Mammogram</Label>
                        <Select
                          value={formData.require_mamogram || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, require_mamogram: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select requirement' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pregnancy Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Pregnancy Status</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='pregnant'>Pregnant</Label>
                    <Select
                      value={formData.pregnant || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, pregnant: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.pregnant === 'Yes' || formData.pregnant === 'yes') && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='pregnant_weeks'>Pregnancy Weeks</Label>
                        <Input
                          type='number'
                          value={formData.pregnant_weeks || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, pregnant_weeks: e.target.value }))
                          }
                          placeholder='Enter weeks'
                          min='0'
                          max='42'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='breastfeeding'>Breastfeeding</Label>
                        <Select
                          value={formData.breastfeeding || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, breastfeeding: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='concieve'>Trying to Conceive</Label>
                        <Select
                          value={formData.concieve || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, concieve: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes and Recommendations */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Notes & Recommendations</h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='notes_text'>Notes</Label>
                    <Textarea
                      id='notes_text'
                      placeholder='Enter additional notes...'
                      value={formData.notes_text || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, notes_text: e.target.value }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='recommendation_text'>Recommendations</Label>
                    <Textarea
                      id='recommendation_text'
                      placeholder='Enter recommendations...'
                      value={formData.recommendation_text || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          recommendation_text: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                </div>
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
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Women's Health Record</DialogTitle>
              <DialogDescription>
                Update the women's health assessment for{' '}
                {editingWomensHealth ? getEmployeeName(editingWomensHealth) : ''}.
              </DialogDescription>
            </DialogHeader>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <div className='space-y-2'>
                <Label htmlFor='employee_id_edit'>Employee</Label>
                <div className='p-3 bg-muted/30 rounded-lg border'>
                  <span className='text-sm'>
                    {editingWomensHealth ? getEmployeeName(editingWomensHealth) : 'Unknown Employee'}
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='report_id_edit'>Report ID</Label>
                <div className='p-3 bg-muted/30 rounded-lg border'>
                  <span className='text-sm'>
                    {formData.report_id || 'No report ID'}
                  </span>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              {/* Gynecological Health Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Gynecological Health</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='gynaecological_symptoms'>Gynecological Symptoms</Label>
                    <Select
                      value={formData.gynaecological_symptoms || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, gynaecological_symptoms: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.gynaecological_symptoms === 'Yes' || formData.gynaecological_symptoms === 'yes') && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='yes_gynaecological_symptoms'>Symptoms Description</Label>
                        <Input
                          value={formData.yes_gynaecological_symptoms || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, yes_gynaecological_symptoms: e.target.value }))
                          }
                          placeholder='Describe symptoms if yes'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='hormonal_contraception'>Hormonal Contraception</Label>
                        <Select
                          value={formData.hormonal_contraception || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, hormonal_contraception: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='hormonel_replacement_therapy'>Hormone Replacement Therapy</Label>
                        <Select
                          value={formData.hormonel_replacement_therapy || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, hormonel_replacement_therapy: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pap Smear Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Pap Smear</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='last_pap'>Last Pap Smear</Label>
                    <Input
                      value={formData.last_pap || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, last_pap: e.target.value }))
                      }
                      placeholder='When was last pap smear'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pap_date'>Pap Smear Date</Label>
                    <Input
                      type='date'
                      value={formData.pap_date || ''}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, pap_date: e.target.value }))
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pap_result'>Pap Smear Result</Label>
                    <Select
                      value={formData.pap_result || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, pap_result: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select result' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Normal'>Normal</SelectItem>
                        <SelectItem value='Abnormal'>Abnormal</SelectItem>
                        <SelectItem value='Inconclusive'>Inconclusive</SelectItem>
                        <SelectItem value='Not Done'>Not Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='require_pap'>Require Pap Smear</Label>
                    <Select
                      value={formData.require_pap || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, require_pap: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select requirement' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Breast Health Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Breast Health</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='breast_symptoms'>Breast Symptoms</Label>
                    <Select
                      value={formData.breast_symptoms || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, breast_symptoms: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.breast_symptoms === 'Yes' || formData.breast_symptoms === 'yes') && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='breast_symptoms_yes'>Symptoms Description</Label>
                        <Input
                          value={formData.breast_symptoms_yes || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, breast_symptoms_yes: e.target.value }))
                          }
                          placeholder='Describe symptoms if yes'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='mammogram_result'>Mammogram Result</Label>
                        <Select
                          value={formData.mammogram_result || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, mammogram_result: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select result' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Normal'>Normal</SelectItem>
                            <SelectItem value='Abnormal'>Abnormal</SelectItem>
                            <SelectItem value='Inconclusive'>Inconclusive</SelectItem>
                            <SelectItem value='Not Done'>Not Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='last_mammogram'>Last Mammogram</Label>
                        <Input
                          type='date'
                          value={formData.last_mammogram || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, last_mammogram: e.target.value }))
                          }
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='breast_problems'>Breast Problems</Label>
                        <Input
                          value={formData.breast_problems || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, breast_problems: e.target.value }))
                          }
                          placeholder='Describe any breast problems'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='require_mamogram'>Require Mammogram</Label>
                        <Select
                          value={formData.require_mamogram || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, require_mamogram: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select requirement' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pregnancy Section */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>Pregnancy Status</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='pregnant'>Pregnant</Label>
                    <Select
                      value={formData.pregnant || ''}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, pregnant: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Yes'>Yes</SelectItem>
                        <SelectItem value='No'>No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.pregnant === 'Yes' || formData.pregnant === 'yes') && (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='pregnant_weeks'>Pregnancy Weeks</Label>
                        <Input
                          type='number'
                          value={formData.pregnant_weeks || ''}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, pregnant_weeks: e.target.value }))
                          }
                          placeholder='Enter weeks'
                          min='0'
                          max='42'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='breastfeeding'>Breastfeeding</Label>
                        <Select
                          value={formData.breastfeeding || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, breastfeeding: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='concieve'>Trying to Conceive</Label>
                        <Select
                          value={formData.concieve || ''}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, concieve: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Yes'>Yes</SelectItem>
                            <SelectItem value='No'>No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes_text'>Notes</Label>
              <Textarea
                id='notes_text'
                placeholder='Enter additional notes...'
                value={formData.notes_text || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, notes_text: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='recommendation_text'>Recommendations</Label>
              <Textarea
                id='recommendation_text'
                placeholder='Enter recommendations...'
                value={formData.recommendation_text || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    recommendation_text: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={formLoading}>
                {formLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Women's Health Record</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the women's health record for{' '}
                <span className='font-semibold text-foreground'>
                  {selectedWomensHealth ? getEmployeeName(selectedWomensHealth) : 'Unknown Employee'}
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
              <Button variant='destructive' onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function WomensHealthPage() {
  return (
    <Suspense fallback={<div />}> 
      <WomensHealthPageContent />
    </Suspense>
  );
}
