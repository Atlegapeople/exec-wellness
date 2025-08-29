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
  employee_work_email?: string;
  breast_exam?: string;
  breast_findings?: string;
  pap_smear?: string;
  pap_smear_result?: string;
  mammogram?: string;
  mammogram_result?: string;
  gynecological_exam?: string;
  gynecological_findings?: string;
  menstrual_health?: string;
  pregnancy_status?: string;
  family_planning?: string;
  fertility_concerns?: string;
  menopause_status?: string;
  bone_health?: string;
  osteoporosis_screening?: string;
  heart_disease_risk?: string;
  blood_pressure?: string;
  cholesterol_level?: string;
  diabetes_risk?: string;
  stress_level?: string;
  anxiety_level?: string;
  depression_screening?: string;
  sleep_quality?: string;
  energy_level?: string;
  sexual_health?: string;
  sexual_concerns?: string;
  exercise_frequency?: string;
  diet_quality?: string;
  alcohol_consumption?: string;
  smoking_status?: string;
  weight_management?: string;
  cancer_screening?: string;
  vaccination_status?: string;
  dental_health?: string;
  vision_health?: string;
  hearing_health?: string;
  workplace_stress?: string;
  ergonomic_issues?: string;
  chemical_exposure?: string;
  physical_demands?: string;
  notes_text?: string;
  recommendation_text?: string;
  date_created?: Date;
  date_updated?: Date;
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

  // CRUD state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingWomensHealth, setEditingWomensHealth] =
    useState<WomensHealth | null>(null);
  const [formData, setFormData] = useState<Partial<WomensHealth>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

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
        const employeeName =
          `${record.employee_name || ''} ${record.employee_surname || ''}`.trim();
        const searchLower = search.toLowerCase();
        return (
          record.id?.toLowerCase().includes(searchLower) ||
          record.employee_id?.toLowerCase().includes(searchLower) ||
          employeeName.toLowerCase().includes(searchLower) ||
          record.employee_work_email?.toLowerCase().includes(searchLower) ||
          record.breast_findings?.toLowerCase().includes(searchLower) ||
          record.heart_disease_risk?.toLowerCase().includes(searchLower)
        );
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

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Women's Health</h1>
            <p className='text-muted-foreground'>
              Manage women's health assessments and screenings
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center space-x-2'
          >
            <Plus className='h-4 w-4' />
            <span>Add Record</span>
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

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Women's Health Records</CardTitle>
            <CardDescription>
              {filteredWomensHealth.length} records found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='max-h-[500px] overflow-auto scrollbar-premium'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Breast Health</TableHead>
                    <TableHead>Gynecological</TableHead>
                    <TableHead>Cardiovascular</TableHead>
                    <TableHead>Mental Health</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedWomensHealth.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {getEmployeeName(record)}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {record.employee_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge
                            variant={
                              record.breast_exam ? 'default' : 'secondary'
                            }
                          >
                            {record.breast_exam || 'Not Examined'}
                          </Badge>
                          {record.mammogram && (
                            <Badge variant='outline'>{record.mammogram}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge
                            variant={record.pap_smear ? 'default' : 'secondary'}
                          >
                            {record.pap_smear || 'Not Done'}
                          </Badge>
                          {record.gynecological_exam && (
                            <Badge variant='outline'>
                              {record.gynecological_exam}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge
                            variant={
                              record.heart_disease_risk
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {record.heart_disease_risk || 'Not Assessed'}
                          </Badge>
                          {record.blood_pressure && (
                            <Badge variant='outline'>
                              {record.blood_pressure}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <Badge
                            variant={
                              record.stress_level ? 'default' : 'secondary'
                            }
                          >
                            {record.stress_level || 'Not Assessed'}
                          </Badge>
                          {record.anxiety_level && (
                            <Badge variant='outline'>
                              {record.anxiety_level}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setSelectedWomensHealth(record);
                            }}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setEditingWomensHealth(record);
                              setFormData(record);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              setSelectedWomensHealth(record);
                              setIsDeleteModalOpen(true);
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
