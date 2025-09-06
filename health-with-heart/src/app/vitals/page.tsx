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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Heart,
  Activity,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  FileText,
  X,
  ArrowLeft,
} from 'lucide-react';

interface VitalRecord {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string;
  user_updated: string;
  employee_id: string;
  report_id: string;
  weight_kg?: number;
  height_cm?: number;
  weight?: number; // fallback
  height?: number; // fallback
  bmi: number;
  bmi_category: string;
  bmi_status?: string;
  waist?: number;
  waist_circumference?: number; // fallback
  waist_hip_ratio?: number;
  waist_hip_interpretation?: string;
  whtr?: number;
  whtr_status?: string;
  chest_measurement_inspiration?: number;
  chest_measurement_expiration?: number;
  pulse_rate?: number;
  pulse_rhythm?: string;
  pulse_rythm?: string; // database column name
  pulse_character?: string;
  pulse_status?: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  bp_systolic?: number; // fallback
  bp_diastolic?: number; // fallback
  bp_systolic_high?: boolean;
  bp_diastolic_high?: boolean;
  bp_category?: string;
  blood_pressure_status?: string;
  systolic_warning?: string;
  diastolic_warning?: string;
  glucose_state?: string;
  glucose_level?: number;
  glucose_category?: string;
  glucose_status?: string;
  urinalysis_done?: string;
  urinalysis_result?: string;
  urinalysis_findings?: string;
  additional_notes?: string;
  notes_text?: string;
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

export default function VitalsPage() {
  // Extract employee filter from URL (client-side only)
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setEmployeeFilter(params.get('employee'));
    }
  }, []);

  console.log('VitalsPage render - employeeFilter:', employeeFilter);

  const [vitals, setVitals] = useState<VitalRecord[]>([]);
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
  const [selectedVital, setSelectedVital] = useState<VitalRecord | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useRouteState<number>('leftPanelWidth', 50, { scope: 'path' }); // percentage
  const [selectedVitalId, setSelectedVitalId] = useRouteState<string | null>('selectedVitalId', null, { scope: 'path' });
  const [formData, setFormData] = useState<Partial<VitalRecord>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const fetchVitals = useCallback(
    async (page = 1, search = '') => {
      try {
        setLoading(true);
        const url = new URL(
          '/api/vitals',
          typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
        );
        url.searchParams.set('page', page.toString());
        url.searchParams.set('limit', pagination.limit.toString());

        // Add employee filter if present
        if (employeeFilter) {
          url.searchParams.set('employee', employeeFilter);
        }

        // Add search term if present
        if (search) {
          url.searchParams.set('search', search);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch vitals');

        const data = await response.json();
        console.log('API Response - first vital:', data.vitals[0]);
        console.log(
          'API Response - systolic_warning in first vital:',
          data.vitals[0]?.systolic_warning
        );
        console.log(
          'API Response - diastolic_warning in first vital:',
          data.vitals[0]?.diastolic_warning
        );
        console.log(
          'API Response - glucose_status in first vital:',
          data.vitals[0]?.glucose_status
        );
        console.log(
          'API Response - notes_text in first vital:',
          data.vitals[0]?.notes_text
        );
        console.log(
          'API Response - additional_notes in first vital:',
          data.vitals[0]?.additional_notes
        );
        setVitals(data.vitals);
        setPagination(data.pagination);

        // If there's an employee filter, automatically select the first vital
        if (employeeFilter && data.vitals && data.vitals.length > 0) {
          const employeeVital = data.vitals[0];
          console.log('Auto-selecting vital:', employeeVital);
          setSelectedVital(employeeVital);
          setSelectedVitalId(employeeVital.id);
        } else if (employeeFilter && data.vitals && data.vitals.length === 0) {
          // No vitals found for this employee, open the create modal with employee ID pre-filled
          console.log('No vitals found for employee, opening create modal');
          console.log('Setting form data with employee_id:', employeeFilter);
          setFormData({ employee_id: employeeFilter });
          setIsCreateDialogOpen(true);
        }
      } catch (error) {
        console.error('Error fetching vitals:', error);
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
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchVitals();
    fetchEmployees();
  }, [fetchVitals]);

  const handleSearch = () => {
    fetchVitals(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchVitals(newPage, searchTerm);
  };

  const handleCreateVital = async () => {
    if (!formData.employee_id) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create vital record');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchVitals(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating vital record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVital = async () => {
    if (!selectedVital) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/vitals/${selectedVital.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_updated: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to update vital record');

      setIsEditDialogOpen(false);
      setFormData({});
      fetchVitals(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating vital record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVital = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vital record?')) return;

    try {
      const response = await fetch(`/api/vitals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vital record');

      fetchVitals(pagination.page, searchTerm);
      if (selectedVital?.id === id) {
        setSelectedVital(null);
        setSelectedVitalId(null);
      }
    } catch (error) {
      console.error('Error deleting vital record:', error);
    }
  };

  const openEditDialog = (vital: VitalRecord) => {
    setFormData(vital);
    setIsEditDialogOpen(true);
  };

  const handleVitalClick = (vital: VitalRecord) => {
    console.log('Selected vital - glucose_status:', vital.glucose_status);
    console.log(
      'Selected vital - glucose_status type:',
      typeof vital.glucose_status
    );
    console.log(
      'Selected vital - glucose_status truthy:',
      !!vital.glucose_status
    );
    console.log(
      'Selected vital - systolic_warning:',
      vital.systolic_warning,
      'type:',
      typeof vital.systolic_warning
    );
    console.log(
      'Selected vital - diastolic_warning:',
      vital.diastolic_warning,
      'type:',
      typeof vital.diastolic_warning
    );
    console.log('Selected vital - notes_text:', vital.notes_text);
    console.log('Selected vital - additional_notes:', vital.additional_notes);
    setSelectedVital(vital);
    setSelectedVitalId(vital.id);
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.vitals-container');
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

  const getBMIBadgeColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'underweight':
        return 'bg-blue-100 text-blue-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'overweight':
        return 'bg-yellow-100 text-yellow-800';
      case 'class i obesity':
      case 'class ii obesity':
      case 'class iii obesity':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBPBadgeColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper functions to get weight and height (handle different column names)
  const getWeight = (vital: VitalRecord) => vital.weight_kg || vital.weight;
  const getHeight = (vital: VitalRecord) => vital.height_cm || vital.height;

  // Helper functions for blood pressure (handle different column names)
  const getSystolicBP = (vital: VitalRecord) =>
    vital.systolic_bp || vital.bp_systolic;
  const getDiastolicBP = (vital: VitalRecord) =>
    vital.diastolic_bp || vital.bp_diastolic;

  // Helper function for waist measurement
  const getWaist = (vital: VitalRecord) =>
    vital.waist || vital.waist_circumference;

  // Helper function for pulse rhythm
  const getPulseRhythm = (vital: VitalRecord) => {
    return vital.pulse_rythm || vital.pulse_rhythm;
  };

  // Helper function for systolic warning (with debug logging)
  const getSystolicWarning = (vital: VitalRecord) => {
    console.log('Systolic warning data:', {
      systolic_warning: vital.systolic_warning,
      systolic_bp: vital.systolic_bp,
      bp_systolic: vital.bp_systolic,
      bp_systolic_high: vital.bp_systolic_high,
    });
    return vital.systolic_warning;
  };

  // Helper function for diastolic warning (with debug logging)
  const getDiastolicWarning = (vital: VitalRecord) => {
    console.log('Diastolic warning data:', {
      diastolic_warning: vital.diastolic_warning,
      diastolic_bp: vital.diastolic_bp,
      bp_diastolic: vital.bp_diastolic,
      bp_diastolic_high: vital.bp_diastolic_high,
    });
    return vital.diastolic_warning;
  };

  // Watch for URL changes and refetch if employee filter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentEmployeeFilter = new URLSearchParams(window.location.search).get('employee');
    if (currentEmployeeFilter !== employeeFilter) {
      console.log('URL changed - refetching vitals');
      fetchVitals();
    }
  }, [employeeFilter, fetchVitals]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Current state:', {
      employeeFilter,
      selectedVital: selectedVital?.id,
      vitals: vitals.length,
      loading,
    });
  }, [employeeFilter, selectedVital?.id, vitals.length, loading]);

  useEffect(() => {
    const restore = async () => {
      if (!selectedVital && selectedVitalId) {
        const found = vitals.find(v => v.id === selectedVitalId);
        if (found) {
          setSelectedVital(found);
          return;
        }
        try {
          const res = await fetch(`/api/vitals/${selectedVitalId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedVital(data);
          } else {
            setSelectedVitalId(null);
          }
        } catch {
          setSelectedVitalId(null);
        }
      }
    };
    restore();
  }, [selectedVitalId, selectedVital, vitals]);

  return (
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
                    Total Records
                  </CardTitle>
                  <Heart className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pagination.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Vital records in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Unique Employees
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {new Set(vitals.map(v => v.employee_id)).size}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Employees with vitals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    High BP Cases
                  </CardTitle>
                  <Activity className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      vitals.filter(
                        v =>
                          (v.blood_pressure_status || v.bp_category) === 'High'
                      ).length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Requiring attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Obesity Cases
                  </CardTitle>
                  <TrendingUp className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      vitals.filter(v =>
                        (v.bmi_status || v.bmi_category)?.includes('Obesity')
                      ).length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>BMI above 30</p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className='glass-effect my-6'>
              <CardContent className='p-4 min-h-[80px] flex items-center'>
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
        <div className='vitals-container flex gap-0 overflow-hidden mb-6'>
          {/* Left Panel - Vitals List */}
          <div
            className='space-y-4 flex-shrink-0 flex flex-col'
            style={{
              width: selectedVital ? `${leftPanelWidth}%` : '100%',
              maxWidth: selectedVital ? `${leftPanelWidth}%` : '100%',
            }}
          >


            {/* Vitals Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-3 text-2xl'>
                      <div className='p-2 bg-teal-100 rounded-lg'>
                        <Heart className='h-6 w-6 text-teal-600' />
                      </div>
                      <div>
                        <span>Vital Records</span>
                        <span className='ml-2 text-lg font-medium text-gray-500'>
                          ({pagination.total})
                        </span>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Click on any record to view detailed vital signs and
                      measurements
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Vital
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className='max-h-[60vh] overflow-auto scrollbar-thin'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Weight/Height</TableHead>
                        <TableHead>BMI</TableHead>
                        <TableHead>Blood Pressure</TableHead>
                        <TableHead>Pulse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className='text-center py-8'>
                            <Loader2 className='h-6 w-6 animate-spin mx-auto mb-2' />
                            Loading vitals...
                          </TableCell>
                        </TableRow>
                      ) : vitals.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className='text-center py-8 text-muted-foreground'
                          >
                            No vital records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        vitals.map(vital => (
                          <TableRow
                            key={vital.id}
                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedVital?.id === vital.id ? 'bg-muted' : ''
                            }`}
                            onClick={() => handleVitalClick(vital)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {vital.employee_name} {vital.employee_surname}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {vital.employee_number}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                vital.date_created
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                <div>{getWeight(vital)}kg</div>
                                <div className='text-muted-foreground'>
                                  {getHeight(vital)}cm
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                <div className='font-mono text-sm'>
                                  {vital.bmi?.toFixed(1)}
                                </div>
                                <Badge
                                  className={getBMIBadgeColor(
                                    vital.bmi_status || vital.bmi_category
                                  )}
                                  variant='secondary'
                                >
                                  {vital.bmi_status || vital.bmi_category}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='space-y-1'>
                                <div className='text-sm'>
                                  {getSystolicBP(vital)}/{getDiastolicBP(vital)}
                                </div>
                                <Badge
                                  className={getBPBadgeColor(
                                    vital.blood_pressure_status ||
                                      vital.bp_category ||
                                      ''
                                  )}
                                  variant='secondary'
                                >
                                  {vital.blood_pressure_status ||
                                    vital.bp_category}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                <div>{vital.pulse_rate} bpm</div>
                                {vital.pulse_status ? (
                                  <div className='text-muted-foreground'>
                                    {vital.pulse_status}
                                  </div>
                                ) : getPulseRhythm(vital) ? (
                                  <div className='text-muted-foreground'>
                                    {getPulseRhythm(vital)}
                                  </div>
                                ) : null}
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
                          className={`${selectedVital && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
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
                          className={`${selectedVital && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} ml-1`}
                        >
                          Previous
                        </span>
                      </Button>

                      {/* Page Numbers */}
                      {Array.from(
                        {
                          length: Math.min(
                            selectedVital && leftPanelWidth < 50 ? 3 : 5,
                            pagination.totalPages
                          ),
                        },
                        (_, i) => {
                          const startPage = Math.max(
                            1,
                            pagination.page -
                              (selectedVital && leftPanelWidth < 50 ? 1 : 2)
                          );
                          const page = startPage + i;
                          if (page > pagination.totalPages) return null;

                          return (
                            <Button
                              key={`vitals-page-${page}`}
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
                          className={`${selectedVital && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
                          className={`${selectedVital && leftPanelWidth < 50 ? 'hidden' : 'hidden sm:inline'} mr-1`}
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
          {selectedVital && (
            <div
              className='w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors duration-200 flex-shrink-0 relative group'
              onMouseDown={handleMouseDown}
            >
              <div className='absolute inset-y-0 -left-1 -right-1 hover:bg-primary/10 transition-colors duration-200'></div>
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border group-hover:bg-primary/50 rounded-full transition-colors duration-200'></div>
            </div>
          )}

          {/* Right Panel - Vital Preview */}
          <div
            className={`${selectedVital ? 'animate-slide-up' : ''} overflow-hidden`}
            style={{
              width: selectedVital
                ? `calc(${100 - leftPanelWidth}% - 4px)`
                : '0%',
              maxWidth: selectedVital
                ? `calc(${100 - leftPanelWidth}% - 4px)`
                : '0%',
              paddingLeft: selectedVital ? '12px' : '0',
              paddingRight: selectedVital ? '0px' : '0',
              overflow: selectedVital ? 'visible' : 'hidden',
            }}
          >
            {selectedVital && (
              <div className='space-y-4 min-h-[70vh] max-h-[82vh] overflow-y-auto scrollbar-thin'>
                {/* Vital Header Card */}
                <Card className='glass-effect'>
                  <CardContent className='p-4 min-h-[120px] flex items-center'>
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4'>
                      <div className='space-y-2 flex-1'>
                        <CardTitle className='text-2xl flex items-center gap-3'>
                          <div className='p-2 bg-teal-100 rounded-lg'>
                            <Heart className='h-6 w-6 text-teal-600' />
                          </div>
                          <span>
                            {selectedVital.employee_name}{' '}
                            {selectedVital.employee_surname}
                          </span>
                        </CardTitle>
                        <CardDescription className='flex items-center gap-3 lg:ml-14'>
                          <Badge
                            variant='outline'
                            className='font-mono text-xs font-medium'
                          >
                            ID: {selectedVital.id.slice(0, 12)}...
                          </Badge>
                          <Badge variant='outline' className='font-medium'>
                            {selectedVital.employee_number}
                          </Badge>
                          <Badge variant='secondary' className='font-medium'>
                            {new Date(
                              selectedVital.date_created
                            ).toLocaleDateString()}
                          </Badge>
                        </CardDescription>
                        {/* Last Updated Information */}
                        <div className='text-xs text-muted-foreground mt-2 lg:ml-14'>
                          <span>Last updated by </span>
                          <span className='font-medium'>
                            {selectedVital.user_updated || 'Unknown'}
                          </span>
                          <span> on </span>
                          <span className='font-medium'>
                            {selectedVital.date_updated
                              ? new Date(
                                  selectedVital.date_updated
                                ).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openEditDialog(selectedVital)}
                          className='hover-lift'
                        >
                          <Edit className='h-4 w-4 mr-1' />
                          Edit
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteVital(selectedVital.id)}
                          className='hover-lift'
                        >
                          <Trash2 className='h-4 w-4 mr-1' />
                          Delete
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => { setSelectedVital(null); setSelectedVitalId(null); }}
                          className='hover-lift'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vital Details Card */}
                <Card className='hover-lift max-h-screen overflow-y-auto scrollbar-thin'>
                  <CardContent className='p-6'>
                    <div className='space-y-6'>
                      {/* Physical Measurements */}
                      <Card className='border-primary/20'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-lg flex items-center gap-2'>
                            <TrendingUp className='h-5 w-5' />
                            Physical Measurements
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                          <div>
                            <div className='text-muted-foreground'>Weight</div>
                            <div className='font-semibold text-lg'>
                              {getWeight(selectedVital)} kg
                            </div>
                          </div>
                          <div>
                            <div className='text-muted-foreground'>Height</div>
                            <div className='font-semibold text-lg'>
                              {getHeight(selectedVital)} cm
                            </div>
                          </div>
                          <div>
                            <div className='text-muted-foreground'>BMI</div>
                            <div className='font-semibold text-lg'>
                              {selectedVital.bmi?.toFixed(1)}
                            </div>
                            <Badge
                              className={getBMIBadgeColor(
                                selectedVital.bmi_status ||
                                  selectedVital.bmi_category
                              )}
                              variant='secondary'
                            >
                              {selectedVital.bmi_status ||
                                selectedVital.bmi_category}
                            </Badge>
                          </div>
                          <div>
                            <div className='text-muted-foreground'>
                              Waist Circumference
                            </div>
                            <div className='font-semibold text-lg'>
                              {getWaist(selectedVital)} cm
                            </div>
                          </div>
                          {selectedVital.chest_measurement_inspiration && (
                            <div>
                              <div className='text-muted-foreground'>
                                Chest (Inspiration)
                              </div>
                              <div className='font-semibold text-lg'>
                                {selectedVital.chest_measurement_inspiration} cm
                              </div>
                            </div>
                          )}
                          {selectedVital.chest_measurement_expiration && (
                            <div>
                              <div className='text-muted-foreground'>
                                Chest (Expiration)
                              </div>
                              <div className='font-semibold text-lg'>
                                {selectedVital.chest_measurement_expiration} cm
                              </div>
                            </div>
                          )}
                          {selectedVital.whtr && (
                            <div>
                              <div className='text-muted-foreground'>
                                Waist-to-Height Ratio
                              </div>
                              <div className='font-semibold text-lg'>
                                {selectedVital.whtr?.toFixed(3)}
                              </div>
                              {selectedVital.whtr_status && (
                                <div className='text-sm text-muted-foreground'>
                                  {selectedVital.whtr_status}
                                </div>
                              )}
                            </div>
                          )}
                          {selectedVital.waist_hip_ratio && (
                            <div className='md:col-span-2'>
                              <div className='text-muted-foreground'>
                                Waist-Hip Ratio
                              </div>
                              <div className='font-semibold text-lg'>
                                {selectedVital.waist_hip_ratio?.toFixed(4)}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {selectedVital.waist_hip_interpretation}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Vital Signs */}
                      <Card className='border-blue-200'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-lg flex items-center gap-2'>
                            <Activity className='h-5 w-5' />
                            Vital Signs
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
                          <div>
                            <div className='text-muted-foreground'>
                              Pulse Rate
                            </div>
                            <div className='font-semibold text-lg'>
                              {selectedVital.pulse_rate} bpm
                            </div>
                            {selectedVital.pulse_status && (
                              <div className='text-sm text-muted-foreground'>
                                Status: {selectedVital.pulse_status}
                              </div>
                            )}
                            {getPulseRhythm(selectedVital) && (
                              <div className='text-sm text-muted-foreground'>
                                Rhythm: {getPulseRhythm(selectedVital)}
                              </div>
                            )}
                            {selectedVital.pulse_character && (
                              <div className='text-sm text-muted-foreground'>
                                Character: {selectedVital.pulse_character}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className='text-muted-foreground'>
                              Blood Pressure
                            </div>
                            <div className='font-semibold text-lg'>
                              {getSystolicBP(selectedVital)}/
                              {getDiastolicBP(selectedVital)} mmHg
                            </div>
                            <Badge
                              className={getBPBadgeColor(
                                selectedVital.blood_pressure_status ||
                                  selectedVital.bp_category ||
                                  ''
                              )}
                              variant='secondary'
                            >
                              {selectedVital.blood_pressure_status ||
                                selectedVital.bp_category}
                            </Badge>
                            {getSystolicWarning(selectedVital) &&
                              typeof getSystolicWarning(selectedVital) ===
                                'string' && (
                                <div className='text-xs text-amber-600 mt-1'>
                                  ⚠ Systolic:{' '}
                                  {getSystolicWarning(selectedVital)}
                                </div>
                              )}
                            {getDiastolicWarning(selectedVital) &&
                              typeof getDiastolicWarning(selectedVital) ===
                                'string' && (
                                <div className='text-xs text-amber-600 mt-1'>
                                  ⚠ Diastolic:{' '}
                                  {getDiastolicWarning(selectedVital)}
                                </div>
                              )}
                            {(selectedVital.bp_systolic_high ||
                              selectedVital.bp_diastolic_high) &&
                              !(
                                typeof selectedVital.systolic_warning ===
                                'string'
                              ) &&
                              !(
                                typeof selectedVital.diastolic_warning ===
                                'string'
                              ) && (
                                <div className='text-xs text-red-600 mt-1'>
                                  ⚠ High reading detected
                                </div>
                              )}
                          </div>
                          <div>
                            <div className='text-muted-foreground'>
                              Glucose Level
                            </div>
                            <div className='font-semibold text-lg'>
                              {selectedVital.glucose_level} mmol/L
                            </div>
                            {selectedVital.glucose_status && (
                              <Badge className='mt-1' variant='secondary'>
                                {selectedVital.glucose_status}
                              </Badge>
                            )}
                            <div className='text-sm text-muted-foreground'>
                              {selectedVital.glucose_state}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {selectedVital.glucose_category}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Laboratory Tests */}
                      {selectedVital.urinalysis_done && (
                        <Card className='border-green-200'>
                          <CardHeader className='pb-3'>
                            <CardTitle className='text-lg flex items-center gap-2'>
                              <FileText className='h-5 w-5' />
                              Laboratory Tests
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='space-y-3 text-sm'>
                            <div>
                              <div className='text-muted-foreground'>
                                Urinalysis
                              </div>
                              <div className='font-semibold'>
                                {selectedVital.urinalysis_done}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {selectedVital.urinalysis_result}
                              </div>
                              {selectedVital.urinalysis_findings && (
                                <div className='text-sm text-muted-foreground mt-1'>
                                  Findings: {selectedVital.urinalysis_findings}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Notes - DEBUG: Always show to check data */}
                      <Card className='border-yellow-200'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-lg flex items-center gap-2'>
                            <FileText className='h-5 w-5' />
                            Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div>
                            <h4 className='font-medium text-sm text-muted-foreground mb-1'>
                              Clinical Notes
                            </h4>
                            {selectedVital.notes_text ? (
                              <p className='text-sm whitespace-pre-wrap'>
                                {selectedVital.notes_text}
                              </p>
                            ) : (
                              <p className='text-sm text-muted-foreground italic'>
                                No clinical notes (notes_text:{' '}
                                {String(selectedVital.notes_text)})
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className='font-medium text-sm text-muted-foreground mb-1'>
                              Additional Notes
                            </h4>
                            {selectedVital.additional_notes ? (
                              <p className='text-sm whitespace-pre-wrap'>
                                {selectedVital.additional_notes}
                              </p>
                            ) : (
                              <p className='text-sm text-muted-foreground italic'>
                                No additional notes (additional_notes:{' '}
                                {String(selectedVital.additional_notes)})
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Record Information */}
                      <Card className='border-gray-200'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='text-lg flex items-center gap-2'>
                            <Users className='h-5 w-5' />
                            Record Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <div className='text-muted-foreground'>Created</div>
                            <div className='font-semibold'>
                              {new Date(
                                selectedVital.date_created
                              ).toLocaleString()}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {selectedVital.created_by_name}
                            </div>
                          </div>
                          <div>
                            <div className='text-muted-foreground'>
                              Last Updated
                            </div>
                            <div className='font-semibold'>
                              {new Date(
                                selectedVital.date_updated
                              ).toLocaleString()}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {selectedVital.updated_by_name}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Vital Record</DialogTitle>
              <DialogDescription>
                Update the vital signs and clinical measurements.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_weight_kg'>Weight (kg)</Label>
                <Input
                  id='edit_weight_kg'
                  type='number'
                  step='0.1'
                  value={formData.weight_kg || formData.weight || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      weight_kg: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_height_cm'>Height (cm)</Label>
                <Input
                  id='edit_height_cm'
                  type='number'
                  value={formData.height_cm || formData.height || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      height_cm: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_bmi_status'>BMI Status</Label>
                <Select
                  value={formData.bmi_status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, bmi_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select BMI status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Underweight'>Underweight</SelectItem>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Overweight'>Overweight</SelectItem>
                    <SelectItem value='Class I Obesity'>
                      Class I Obesity
                    </SelectItem>
                    <SelectItem value='Class II Obesity'>
                      Class II Obesity
                    </SelectItem>
                    <SelectItem value='Class III Obesity'>
                      Class III Obesity
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_waist'>Waist Circumference (cm)</Label>
                <Input
                  id='edit_waist'
                  type='number'
                  value={formData.waist || formData.waist_circumference || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      waist: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_chest_measurement_inspiration'>
                  Chest Inspiration (cm)
                </Label>
                <Input
                  id='edit_chest_measurement_inspiration'
                  type='number'
                  value={formData.chest_measurement_inspiration || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      chest_measurement_inspiration: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_chest_measurement_expiration'>
                  Chest Expiration (cm)
                </Label>
                <Input
                  id='edit_chest_measurement_expiration'
                  type='number'
                  value={formData.chest_measurement_expiration || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      chest_measurement_expiration: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_whtr'>Waist-to-Height Ratio</Label>
                <Input
                  id='edit_whtr'
                  type='number'
                  step='0.001'
                  value={formData.whtr || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      whtr: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_whtr_status'>WHTR Status</Label>
                <Select
                  value={formData.whtr_status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, whtr_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select WHTR status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Low Risk'>Low Risk</SelectItem>
                    <SelectItem value='Moderate Risk'>Moderate Risk</SelectItem>
                    <SelectItem value='High Risk'>High Risk</SelectItem>
                    <SelectItem value='Very High Risk'>
                      Very High Risk
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_pulse_rate'>Pulse Rate (bpm)</Label>
                <Input
                  id='edit_pulse_rate'
                  type='number'
                  value={formData.pulse_rate || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      pulse_rate: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_pulse_status'>Pulse Status</Label>
                <Select
                  value={formData.pulse_status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, pulse_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select pulse status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='Bradycardia'>Bradycardia</SelectItem>
                    <SelectItem value='Tachycardia'>Tachycardia</SelectItem>
                    <SelectItem value='Irregular'>Irregular</SelectItem>
                    <SelectItem value='Weak'>Weak</SelectItem>
                    <SelectItem value='Strong'>Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_pulse_rythm'>Pulse Rhythm</Label>
                <Select
                  value={formData.pulse_rythm || formData.pulse_rhythm || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, pulse_rythm: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select pulse rhythm' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Regular'>Regular</SelectItem>
                    <SelectItem value='Irregular'>Irregular</SelectItem>
                    <SelectItem value='Regularly Irregular'>
                      Regularly Irregular
                    </SelectItem>
                    <SelectItem value='Irregularly Irregular'>
                      Irregularly Irregular
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_systolic_bp'>Systolic BP</Label>
                <Input
                  id='edit_systolic_bp'
                  type='number'
                  value={formData.systolic_bp || formData.bp_systolic || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      systolic_bp: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_diastolic_bp'>Diastolic BP</Label>
                <Input
                  id='edit_diastolic_bp'
                  type='number'
                  value={formData.diastolic_bp || formData.bp_diastolic || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      diastolic_bp: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_blood_pressure_status'>BP Status</Label>
                <Select
                  value={formData.blood_pressure_status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, blood_pressure_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select BP status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Elevated'>Elevated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_systolic_warning'>Systolic Warning</Label>
                <Input
                  id='edit_systolic_warning'
                  type='text'
                  value={formData.systolic_warning || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      systolic_warning: e.target.value,
                    })
                  }
                  placeholder='Enter systolic warning message'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_diastolic_warning'>
                  Diastolic Warning
                </Label>
                <Input
                  id='edit_diastolic_warning'
                  type='text'
                  value={formData.diastolic_warning || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      diastolic_warning: e.target.value,
                    })
                  }
                  placeholder='Enter diastolic warning message'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_glucose_level'>Glucose Level</Label>
                <Input
                  id='edit_glucose_level'
                  type='number'
                  step='0.1'
                  value={formData.glucose_level || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      glucose_level: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_glucose_status'>Glucose Status</Label>
                <Select
                  value={formData.glucose_status || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, glucose_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select glucose status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Normal'>Normal</SelectItem>
                    <SelectItem value='High'>High</SelectItem>
                    <SelectItem value='Low'>Low</SelectItem>
                    <SelectItem value='Pre-diabetic'>Pre-diabetic</SelectItem>
                    <SelectItem value='Diabetic'>Diabetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='edit_notes_text'>Clinical Notes</Label>
                <Textarea
                  id='edit_notes_text'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder='Enter clinical notes and observations'
                  className='min-h-[80px]'
                />
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='edit_additional_notes'>Additional Notes</Label>
                <Textarea
                  id='edit_additional_notes'
                  value={formData.additional_notes || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      additional_notes: e.target.value,
                    })
                  }
                  placeholder='Enter any additional notes or observations'
                  className='min-h-[80px]'
                />
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
              <Button onClick={handleEditVital} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Record'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
