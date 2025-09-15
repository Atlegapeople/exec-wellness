'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  Mail,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
  Users,
  ExternalLink,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';

interface CostCenter {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  organisation_id: string | null;
  department: string | null;
  cost_center: string | null;
  workplace_address: string | null;
  manager_name: string | null;
  manager_email: string | null;
  manager_contact_number: string | null;
  manager_responsible: boolean | null;
  person_responsible_for_account: string | null;
  person_responsible_for_account_email: string | null;
  notes_text: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  organisation_name?: string;
  employee_count?: number;
  medical_report_count?: number;
}

interface Organization {
  id: string;
  name: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function CostCentersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter parameters from URL
  const organizationFilter = searchParams.get('organization');
  const organizationName = searchParams.get('organizationName');
  const returnUrl = searchParams.get('returnUrl');

  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
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
  const [selectedCostCenter, setSelectedCostCenter] =
    useState<CostCenter | null>(null);
  const [formData, setFormData] = useState<Partial<CostCenter>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60);
  const [isResizing, setIsResizing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costCenterToDelete, setCostCenterToDelete] = useState<string | null>(
    null
  );

  const fetchCostCenters = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let url = `/api/cost-centers?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`;

      if (organizationFilter) {
        url += `&organization=${encodeURIComponent(organizationFilter)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cost centers');

      const data = await response.json();
      setCostCenters(data.costCenters);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch organizations');

      const data = await response.json();
      setOrganizations(data.organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    fetchCostCenters();
    fetchOrganizations();
  }, [organizationFilter]);

  const handleSearch = () => {
    fetchCostCenters(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchCostCenters(newPage, searchTerm);
  };

  const handleCreateCostCenter = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/cost-centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organisation_id:
            formData.organisation_id === 'none'
              ? null
              : formData.organisation_id,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create cost center');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchCostCenters(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating cost center:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCostCenter = async () => {
    if (!selectedCostCenter) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/cost-centers/${selectedCostCenter.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            organisation_id:
              formData.organisation_id === 'none'
                ? null
                : formData.organisation_id,
            user_updated: '1', // TODO: Use actual user ID from auth
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update cost center');

      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedCostCenter(null);
      fetchCostCenters(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating cost center:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCostCenter = async (id: string) => {
    setCostCenterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCostCenter = async () => {
    if (!costCenterToDelete) return;

    try {
      const response = await fetch(`/api/cost-centers/${costCenterToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete cost center');

      toast.success('Cost center deleted successfully!');
      fetchCostCenters(pagination.page, searchTerm);
      if (selectedCostCenter?.id === costCenterToDelete) {
        setSelectedCostCenter(null);
      }
    } catch (error) {
      console.error('Error deleting cost center:', error);
      toast.error('Failed to delete cost center. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setCostCenterToDelete(null);
    }
  };

  const openEditDialog = (costCenter: CostCenter) => {
    setFormData({
      ...costCenter,
      organisation_id: costCenter.organisation_id || 'none',
    });
    setSelectedCostCenter(costCenter);
    setIsEditDialogOpen(true);
  };

  const handleCostCenterClick = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleViewEmployees = (costCenter: CostCenter) => {
    if (!costCenter.organisation_id) return;

    const returnUrl = encodeURIComponent('/cost-centers');
    const orgFilter = encodeURIComponent(costCenter.organisation_id);
    const orgName = encodeURIComponent(
      costCenter.organisation_name || 'Organization'
    );
    router.push(
      `/employees?organization=${orgFilter}&organizationName=${orgName}&returnUrl=${returnUrl}`
    );
  };

  const handleViewReports = (costCenter: CostCenter) => {
    const returnUrl = encodeURIComponent('/cost-centers');
    const costCenterFilter = encodeURIComponent(costCenter.id);
    const costCenterName = encodeURIComponent(
      `${costCenter.department || 'Department'} - ${costCenter.cost_center || 'Cost Center'}`
    );
    router.push(
      `/reports?costCenter=${costCenterFilter}&costCenterName=${costCenterName}&returnUrl=${returnUrl}`
    );
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.cost-centers-container');
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
        {(returnUrl || organizationFilter) && (
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {returnUrl && (
                <Button
                  variant='outline'
                  onClick={() => router.push(returnUrl)}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to Organizations
                </Button>
              )}

              {organizationFilter && organizationName && (
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 text-blue-700 border-blue-200'
                  >
                    <Building2 className='h-3 w-3 mr-1' />
                    Filtered by: {decodeURIComponent(organizationName)}
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete('organization');
                      params.delete('organizationName');
                      router.push(`/cost-centers?${params.toString()}`);
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

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Cost Centers</h1>
            <p className='text-muted-foreground'>
              Manage cost centers and workplace information
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className='hover-lift'>
                <Plus className='h-4 w-4 mr-2' />
                Add Cost Center
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Create New Cost Center</DialogTitle>
                <DialogDescription>
                  Add a new cost center to the system
                </DialogDescription>
              </DialogHeader>

              <div className='grid grid-cols-2 gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='department'>Department</Label>
                  <Input
                    id='department'
                    value={formData.department || ''}
                    onChange={e =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder='Enter department name'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='cost_center'>Cost Center</Label>
                  <Input
                    id='cost_center'
                    value={formData.cost_center || ''}
                    onChange={e =>
                      setFormData({ ...formData, cost_center: e.target.value })
                    }
                    placeholder='Enter cost center code'
                  />
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='organisation_id'>Organization</Label>
                  <Select
                    value={formData.organisation_id || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, organisation_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select organization' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No Organization</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='workplace_address'>Workplace Address</Label>
                  <Textarea
                    id='workplace_address'
                    value={formData.workplace_address || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        workplace_address: e.target.value,
                      })
                    }
                    placeholder='Enter workplace address'
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='manager_name'>Manager Name</Label>
                  <Input
                    id='manager_name'
                    value={formData.manager_name || ''}
                    onChange={e =>
                      setFormData({ ...formData, manager_name: e.target.value })
                    }
                    placeholder='Enter manager name'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='manager_email'>Manager Email</Label>
                  <Input
                    id='manager_email'
                    type='email'
                    value={formData.manager_email || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        manager_email: e.target.value,
                      })
                    }
                    placeholder='Enter manager email'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='manager_contact_number'>
                    Manager Contact
                  </Label>
                  <Input
                    id='manager_contact_number'
                    value={formData.manager_contact_number || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        manager_contact_number: e.target.value,
                      })
                    }
                    placeholder='Enter manager contact number'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='person_responsible_for_account'>
                    Account Responsible Person
                  </Label>
                  <Input
                    id='person_responsible_for_account'
                    value={formData.person_responsible_for_account || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        person_responsible_for_account: e.target.value,
                      })
                    }
                    placeholder='Enter responsible person name'
                  />
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='person_responsible_for_account_email'>
                    Account Responsible Email
                  </Label>
                  <Input
                    id='person_responsible_for_account_email'
                    type='email'
                    value={formData.person_responsible_for_account_email || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        person_responsible_for_account_email: e.target.value,
                      })
                    }
                    placeholder='Enter responsible person email'
                  />
                </div>

                <div className='flex items-center space-x-2 col-span-2'>
                  <input
                    type='checkbox'
                    id='manager_responsible'
                    checked={formData.manager_responsible || false}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        manager_responsible: e.target.checked,
                      })
                    }
                    className='rounded border border-input'
                  />
                  <Label htmlFor='manager_responsible'>
                    Manager is responsible for this cost center
                  </Label>
                </div>

                <div className='space-y-2 col-span-2'>
                  <Label htmlFor='notes_text'>Notes</Label>
                  <Textarea
                    id='notes_text'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Enter any additional notes'
                    rows={3}
                  />
                </div>
              </div>

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
                <Button onClick={handleCreateCostCenter} disabled={submitting}>
                  {submitting && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  Create Cost Center
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className='cost-centers-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Cost Centers Table */}
          <div
            className='space-y-4'
            style={{
              width: selectedCostCenter ? `${leftPanelWidth}%` : '100%',
            }}
          >
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Cost Centers
                  </CardTitle>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pagination.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Active cost centers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Departments
                  </CardTitle>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      new Set(
                        costCenters.map(cc => cc.department).filter(Boolean)
                      ).size
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Unique departments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Managed Centers
                  </CardTitle>
                  <UserCheck className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {costCenters.filter(cc => cc.manager_responsible).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    With assigned managers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Employees
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {costCenters.reduce(
                      (sum, cc) => sum + (cc.employee_count || 0),
                      0
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Across all centers
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className='glass-effect'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='text'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder='Search by department, cost center, manager...'
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
                        fetchCostCenters(1, '');
                      }}
                      className='hover-lift'
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Centers Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-2xl'>
                  <DollarSign className='h-6 w-6' />
                  Cost Centers ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Cost center records and department information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {costCenters.length === 0 ? (
                  <div className='text-center py-12'>
                    <DollarSign className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No cost centers found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No cost centers available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Cost Center</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Manager</TableHead>
                          <TableHead>Employees</TableHead>
                          <TableHead>Reports</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costCenters.map(costCenter => (
                          <TableRow
                            key={costCenter.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedCostCenter?.id === costCenter.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleCostCenterClick(costCenter)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {costCenter.department || 'No Department'}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  ID: {costCenter.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant='secondary' className='font-mono'>
                                {costCenter.cost_center || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {costCenter.organisation_name ? (
                                <Badge
                                  variant='secondary'
                                  className='bg-blue-100 text-blue-800'
                                >
                                  {costCenter.organisation_name}
                                </Badge>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  No organization
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {costCenter.manager_name ? (
                                <div>
                                  <div className='font-medium'>
                                    {costCenter.manager_name}
                                  </div>
                                  {costCenter.manager_responsible && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      Responsible
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  No manager
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                  {costCenter.employee_count || 0}
                                </span>
                                <span className='text-sm text-muted-foreground'>
                                  employees
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                  {costCenter.medical_report_count || 0}
                                </span>
                                <span className='text-sm text-muted-foreground'>
                                  reports
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    openEditDialog(costCenter);
                                  }}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteCostCenter(costCenter.id);
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
                        First
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className='hover-lift'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        Previous
                      </Button>

                      <div className='flex items-center gap-1'>
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const startPage = Math.max(1, pagination.page - 2);
                            const page = startPage + i;
                            if (page > pagination.totalPages) return null;

                            return (
                              <Button
                                key={`cost-centers-page-${page}`}
                                variant={
                                  page === pagination.page
                                    ? 'default'
                                    : 'outline'
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
                      </div>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className='hover-lift'
                      >
                        Next
                        <ChevronRight className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className='hover-lift'
                      >
                        Last
                        <ChevronsRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resize Handle */}
          {selectedCostCenter && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Cost Center Details */}
          {selectedCostCenter && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftPanelWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedCostCenter.department || 'No Department'}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        <Badge variant='secondary' className='font-mono'>
                          {selectedCostCenter.cost_center || 'No Cost Center'}
                        </Badge>
                        {selectedCostCenter.organisation_name && (
                          <Badge
                            variant='secondary'
                            className='bg-blue-100 text-blue-800'
                          >
                            {selectedCostCenter.organisation_name}
                          </Badge>
                        )}
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedCostCenter.updated_by_name ||
                            selectedCostCenter.user_updated ||
                            'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedCostCenter.date_updated
                            ? new Date(
                                selectedCostCenter.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedCostCenter(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Cost Center Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <DollarSign className='h-4 w-4' />
                      Cost Center Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Department:
                        </span>
                        <span className='font-medium'>
                          {selectedCostCenter.department || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Cost Center:
                        </span>
                        <span className='font-medium font-mono'>
                          {selectedCostCenter.cost_center || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Organization:
                        </span>
                        <span className='font-medium'>
                          {selectedCostCenter.organisation_name || 'N/A'}
                        </span>
                      </div>
                      {selectedCostCenter.workplace_address && (
                        <div className='flex gap-2 items-start'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Address:
                          </span>
                          <span className='font-medium'>
                            {selectedCostCenter.workplace_address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manager Information */}
                  {(selectedCostCenter.manager_name ||
                    selectedCostCenter.manager_email) && (
                    <div className='space-y-3'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <UserCheck className='h-4 w-4' />
                        Manager Information
                      </h3>
                      <div className='space-y-3 text-sm'>
                        {selectedCostCenter.manager_name && (
                          <div className='flex gap-2 items-center'>
                            <UserCheck className='h-4 w-4 text-muted-foreground' />
                            <div className='flex-1'>
                              <div className='font-medium'>
                                {selectedCostCenter.manager_name}
                              </div>
                              {selectedCostCenter.manager_responsible && (
                                <Badge
                                  variant='outline'
                                  className='text-xs mt-1'
                                >
                                  Responsible Manager
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {selectedCostCenter.manager_email && (
                          <div className='flex gap-2 items-center'>
                            <Mail className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium text-xs break-all'>
                              {selectedCostCenter.manager_email}
                            </span>
                          </div>
                        )}
                        {selectedCostCenter.manager_contact_number && (
                          <div className='flex gap-2 items-center'>
                            <Phone className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium'>
                              {selectedCostCenter.manager_contact_number}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Account Responsible Information */}
                  {(selectedCostCenter.person_responsible_for_account ||
                    selectedCostCenter.person_responsible_for_account_email) && (
                    <div className='space-y-3'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                        <Users className='h-4 w-4' />
                        Account Responsible
                      </h3>
                      <div className='space-y-3 text-sm'>
                        {selectedCostCenter.person_responsible_for_account && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[60px]'>
                              Name:
                            </span>
                            <span className='font-medium'>
                              {
                                selectedCostCenter.person_responsible_for_account
                              }
                            </span>
                          </div>
                        )}
                        {selectedCostCenter.person_responsible_for_account_email && (
                          <div className='flex gap-2'>
                            <span className='text-muted-foreground min-w-[60px]'>
                              Email:
                            </span>
                            <span className='font-medium text-xs break-all'>
                              {
                                selectedCostCenter.person_responsible_for_account_email
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      Statistics
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {/* Employees Section */}
                      <div>
                        <div className='text-muted-foreground'>Employees</div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          {selectedCostCenter.employee_count || 0}{' '}
                          {(selectedCostCenter.employee_count || 0) === 1
                            ? 'employee'
                            : 'employees'}
                        </div>
                        <div className='text-xs text-muted-foreground mb-2'>
                          assigned to this cost center
                        </div>
                        {(selectedCostCenter.employee_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleViewEmployees(selectedCostCenter)
                            }
                            className='flex items-center gap-2'
                          >
                            <Users className='h-3 w-3' />
                            View Employees
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>

                      {/* Medical Reports Section */}
                      <div>
                        <div className='text-muted-foreground'>
                          Medical Reports
                        </div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <FileText className='h-4 w-4 text-muted-foreground' />
                          {selectedCostCenter.medical_report_count || 0}{' '}
                          {(selectedCostCenter.medical_report_count || 0) === 1
                            ? 'report'
                            : 'reports'}
                        </div>
                        <div className='text-xs text-muted-foreground mb-2'>
                          for employees in this cost center
                        </div>
                        {(selectedCostCenter.medical_report_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleViewReports(selectedCostCenter)
                            }
                            className='flex items-center gap-2'
                          >
                            <FileText className='h-3 w-3' />
                            View Reports
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedCostCenter.notes_text && (
                    <div className='space-y-3'>
                      <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                        Notes
                      </h3>
                      <div className='text-sm bg-muted/50 p-3 rounded-lg'>
                        {selectedCostCenter.notes_text}
                      </div>
                    </div>
                  )}

                  {/* System Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
                      Record Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Created:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedCostCenter.date_created)}
                        </span>
                      </div>
                      {selectedCostCenter.created_by_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Created By:
                          </span>
                          <span className='font-medium'>
                            {selectedCostCenter.created_by_name}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedCostCenter.date_updated)}
                        </span>
                      </div>
                      {selectedCostCenter.updated_by_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Updated By:
                          </span>
                          <span className='font-medium'>
                            {selectedCostCenter.updated_by_name}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Cost Center ID:
                        </span>
                        <span className='font-mono text-xs'>
                          {selectedCostCenter.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Cost Center</DialogTitle>
              <DialogDescription>
                Update cost center information
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-2 gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_department'>Department</Label>
                <Input
                  id='edit_department'
                  value={formData.department || ''}
                  onChange={e =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder='Enter department name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_cost_center'>Cost Center</Label>
                <Input
                  id='edit_cost_center'
                  value={formData.cost_center || ''}
                  onChange={e =>
                    setFormData({ ...formData, cost_center: e.target.value })
                  }
                  placeholder='Enter cost center code'
                />
              </div>

              <div className='space-y-2 col-span-2'>
                <Label htmlFor='edit_organisation_id'>Organization</Label>
                <Select
                  value={formData.organisation_id || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, organisation_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select organization' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No Organization</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 col-span-2'>
                <Label htmlFor='edit_workplace_address'>
                  Workplace Address
                </Label>
                <Textarea
                  id='edit_workplace_address'
                  value={formData.workplace_address || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      workplace_address: e.target.value,
                    })
                  }
                  placeholder='Enter workplace address'
                  rows={2}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_manager_name'>Manager Name</Label>
                <Input
                  id='edit_manager_name'
                  value={formData.manager_name || ''}
                  onChange={e =>
                    setFormData({ ...formData, manager_name: e.target.value })
                  }
                  placeholder='Enter manager name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_manager_email'>Manager Email</Label>
                <Input
                  id='edit_manager_email'
                  type='email'
                  value={formData.manager_email || ''}
                  onChange={e =>
                    setFormData({ ...formData, manager_email: e.target.value })
                  }
                  placeholder='Enter manager email'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_manager_contact_number'>
                  Manager Contact
                </Label>
                <Input
                  id='edit_manager_contact_number'
                  value={formData.manager_contact_number || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      manager_contact_number: e.target.value,
                    })
                  }
                  placeholder='Enter manager contact number'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_person_responsible_for_account'>
                  Account Responsible Person
                </Label>
                <Input
                  id='edit_person_responsible_for_account'
                  value={formData.person_responsible_for_account || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      person_responsible_for_account: e.target.value,
                    })
                  }
                  placeholder='Enter responsible person name'
                />
              </div>

              <div className='space-y-2 col-span-2'>
                <Label htmlFor='edit_person_responsible_for_account_email'>
                  Account Responsible Email
                </Label>
                <Input
                  id='edit_person_responsible_for_account_email'
                  type='email'
                  value={formData.person_responsible_for_account_email || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      person_responsible_for_account_email: e.target.value,
                    })
                  }
                  placeholder='Enter responsible person email'
                />
              </div>

              <div className='flex items-center space-x-2 col-span-2'>
                <input
                  type='checkbox'
                  id='edit_manager_responsible'
                  checked={formData.manager_responsible || false}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      manager_responsible: e.target.checked,
                    })
                  }
                  className='rounded border border-input'
                />
                <Label htmlFor='edit_manager_responsible'>
                  Manager is responsible for this cost center
                </Label>
              </div>

              <div className='space-y-2 col-span-2'>
                <Label htmlFor='edit_notes_text'>Notes</Label>
                <Textarea
                  id='edit_notes_text'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder='Enter any additional notes'
                  rows={3}
                />
              </div>
            </div>

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
              <Button onClick={handleEditCostCenter} disabled={submitting}>
                {submitting && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                Update Cost Center
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Cost Center</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this cost center? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCostCenter}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

export default function CostCentersPage() {
  return (
    // <ProtectedRoute>
    <DashboardLayout>
      <div className='p-6'>
        <h1 className='text-2xl font-bold'>Cost Centers</h1>
        <p className='text-muted-foreground'>
          Manage departmental cost centers
        </p>
      </div>
    </DashboardLayout>
    // </ProtectedRoute>
  );
}
