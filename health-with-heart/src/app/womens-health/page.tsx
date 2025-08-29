'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function WomensHealthPage() {
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
  const [leftWidth, setLeftWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);

  // Editing states for different sections
  const [isEditingGynaecological, setIsEditingGynaecological] = useState(false);
  const [isEditingPap, setIsEditingPap] = useState(false);
  const [isEditingBreast, setIsEditingBreast] = useState(false);
  const [isEditingPregnancy, setIsEditingPregnancy] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRecommendations, setIsEditingRecommendations] =
    useState(false);

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
  };

  // Open edit modal
  const openEditModal = (womensHealth: WomensHealth) => {
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
        setFormData({ employee_id: employeeFilter });
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

  // Handle search
  const handleSearch = useCallback(
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
      const startIndex = (newPage - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      setDisplayedWomensHealth(
        filteredWomensHealth.slice(startIndex, endIndex)
      );
      setPagination(prev => ({ ...prev, page: newPage }));
    },
    [filteredWomensHealth, pagination.limit]
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

  useEffect(() => {
    const filtered = filterWomensHealth(allWomensHealth, searchTerm);
    setFilteredWomensHealth(filtered);

    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, page: 1 }));

    // Update displayed data for first page
    setDisplayedWomensHealth(filtered.slice(0, pagination.limit));
  }, [allWomensHealth, searchTerm, filterWomensHealth, pagination.limit]);

  // Update pagination when filtered data changes
  useEffect(() => {
    updatePagination();
  }, [updatePagination]);

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
            className='flex items-center space-x-2'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Back</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex space-x-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                  <Input
                    placeholder='Search by employee name, ID, or findings...'
                    value={searchTerm}
                    onChange={e => handleSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Label htmlFor='page-size' className='text-sm'>
                  Page Size:
                </Label>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={value => {
                    const newLimit = parseInt(value);
                    setPagination(prev => ({
                      ...prev,
                      limit: newLimit,
                      page: 1,
                    }));
                    setDisplayedWomensHealth(
                      filteredWomensHealth.slice(0, newLimit)
                    );
                  }}
                >
                  <SelectTrigger className='w-20'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='25'>25</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                      onClick={() => setIsCreateModalOpen(true)}
                      className='hover-lift'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add New Record
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
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
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          disabled={!pagination.hasNextPage}
                        >
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
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setSelectedWomensHealth(null)}
                        className='hover-lift'
                      >
                        <X className='h-4 w-4' />
                      </Button>
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
                              onClick={() => setIsEditingGynaecological(false)}
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
                              setIsEditingGynaecological(
                                !isEditingGynaecological
                              )
                            }
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            {isEditingGynaecological ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Symptoms:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.gynaecological_symptoms ||
                              'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Yes Symptoms:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.yes_gynaecological_symptoms ||
                              'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Hormonal Contraception:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.hormonal_contraception ||
                              'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            HRT:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.hormonel_replacement_therapy ||
                              'N/A'}
                          </span>
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
                              onClick={() => setIsEditingPap(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingPap ? 'default' : 'outline'}
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingPap(!isEditingPap)}
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            {isEditingPap ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Last Pap:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.last_pap || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Pap Date:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.pap_date || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Result:
                          </span>
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
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Require Pap:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.require_pap || 'N/A'}
                          </span>
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
                              onClick={() => setIsEditingBreast(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingBreast ? 'default' : 'outline'}
                            size='sm'
                            className='hover-lift'
                            onClick={() => setIsEditingBreast(!isEditingBreast)}
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            {isEditingBreast ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Symptoms:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.breast_symptoms || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Yes Symptoms:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.breast_symptoms_yes || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Mammogram Result:
                          </span>
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
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Last Mammogram:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.last_mammogram || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Problems:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.breast_problems || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Require Mammogram:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.require_mamogram || 'N/A'}
                          </span>
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
                              onClick={() => setIsEditingPregnancy(false)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            variant={isEditingPregnancy ? 'default' : 'outline'}
                            size='sm'
                            className='hover-lift'
                            onClick={() =>
                              setIsEditingPregnancy(!isEditingPregnancy)
                            }
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            {isEditingPregnancy ? 'Save' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm'>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Pregnant:
                          </span>
                          <Badge
                            variant={
                              selectedWomensHealth.pregnant === 'Yes'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {selectedWomensHealth.pregnant || 'No'}
                          </Badge>
                        </div>
                        {selectedWomensHealth.pregnant === 'Yes' && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[120px]'>
                              Weeks:
                            </span>
                            <span className='font-medium'>
                              {selectedWomensHealth.pregnant_weeks || 'N/A'}
                            </span>
                          </div>
                        )}
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Breastfeeding:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.breastfeeding || 'N/A'}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Trying to Conceive:
                          </span>
                          <span className='font-medium'>
                            {selectedWomensHealth.concieve || 'N/A'}
                          </span>
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
                                  onClick={() => setIsEditingNotes(false)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                variant={isEditingNotes ? 'default' : 'outline'}
                                size='sm'
                                className='hover-lift'
                                onClick={() =>
                                  setIsEditingNotes(!isEditingNotes)
                                }
                              >
                                <Edit className='h-3 w-3 mr-1' />
                                {isEditingNotes ? 'Save' : 'Edit'}
                              </Button>
                            </div>
                          </div>
                          <div className='text-sm p-3 bg-muted rounded-lg'>
                            {selectedWomensHealth.notes_text}
                          </div>
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
                                    setIsEditingRecommendations(false)
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
                            {selectedWomensHealth.recommendation_text}
                          </div>
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
                  onClick={() => setIsCreateModalOpen(true)}
                  className='hover-lift'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add New Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='max-h-[500px] overflow-auto scrollbar-premium'>
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
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create Women's Health Record</DialogTitle>
              <DialogDescription>
                Add a new women's health assessment record
              </DialogDescription>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4'>
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
                <Label htmlFor='breast_exam'>Breast Exam</Label>
                <Select
                  value={formData.breast_exam || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, breast_exam: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Not Done'>Not Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='pap_smear'>Pap Smear</Label>
                <Select
                  value={formData.pap_smear || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, pap_smear: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Not Done'>Not Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='mammogram'>Mammogram</Label>
                <Select
                  value={formData.mammogram || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, mammogram: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Not Done'>Not Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='heart_disease_risk'>Heart Disease Risk</Label>
                <Select
                  value={formData.heart_disease_risk || ''}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      heart_disease_risk: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select risk level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Not Assessed'>Not Assessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='stress_level'>Stress Level</Label>
                <Select
                  value={formData.stress_level || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, stress_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select stress level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Not Assessed'>Not Assessed</SelectItem>
                  </SelectContent>
                </Select>
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
                Update the women's health assessment record
              </DialogDescription>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='breast_exam'>Breast Exam</Label>
                <Select
                  value={formData.breast_exam || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, breast_exam: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Not Done'>Not Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='pap_smear'>Pap Smear</Label>
                <Select
                  value={formData.pap_smear || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, pap_smear: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Not Done'>Not Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='mammogram'>Mammogram</Label>
                <Select
                  value={formData.mammogram || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, mammogram: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Abnormal'>Abnormal</SelectItem>
                    <SelectItem value='Not Done'>Not Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='heart_disease_risk'>Heart Disease Risk</Label>
                <Select
                  value={formData.heart_disease_risk || ''}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      heart_disease_risk: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select risk level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Not Assessed'>Not Assessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='stress_level'>Stress Level</Label>
                <Select
                  value={formData.stress_level || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, stress_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select stress level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Not Assessed'>Not Assessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='anxiety_level'>Anxiety Level</Label>
                <Select
                  value={formData.anxiety_level || ''}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, anxiety_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select anxiety level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Medium'>Medium</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Not Assessed'>Not Assessed</SelectItem>
                  </SelectContent>
                </Select>
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
                Are you sure you want to delete this women's health record? This
                action cannot be undone.
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
