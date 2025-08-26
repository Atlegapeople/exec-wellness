'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Building2,
  Users,
  UserCheck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  Upload,
  Image,
  ExternalLink,
} from 'lucide-react';

interface Organization {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string;
  user_updated: string;
  name?: string;
  registration_number?: string;
  notes_header?: string;
  notes_text?: string;
  logo?: string;
  employee_count?: number;
  manager_count?: number;
  site_count?: number;
  medical_report_count?: number;
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

export default function OrganizationsPage() {
  const router = useRouter();
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
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Partial<Organization>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchOrganizations = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/organizations?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`
      );
      if (!response.ok) throw new Error('Failed to fetch organizations');

      const data = await response.json();
      setOrganizations(data.organizations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleSearch = () => {
    fetchOrganizations(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchOrganizations(newPage, searchTerm);
  };

  const handleCreateOrg = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create organization');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchOrganizations(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOrg = async () => {
    if (!selectedOrg) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/organizations/${selectedOrg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_updated: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to update organization');

      setIsEditDialogOpen(false);
      setFormData({});
      fetchOrganizations(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete organization');

      fetchOrganizations(pagination.page, searchTerm);
      if (selectedOrg?.id === id) {
        setSelectedOrg(null);
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const openEditDialog = (org: Organization) => {
    setFormData(org);
    setIsEditDialogOpen(true);
  };

  const handleOrgClick = (org: Organization) => {
    setSelectedOrg(org);
  };

  const handleViewEmployees = (org: Organization) => {
    // Navigate to employees page with organization filter and return URL
    const returnUrl = encodeURIComponent('/organizations');
    const orgFilter = encodeURIComponent(org.id);
    const orgName = encodeURIComponent(org.name || 'Organization');

    router.push(
      `/employees?organization=${orgFilter}&organizationName=${orgName}&returnUrl=${returnUrl}`
    );
  };

  const handleViewManagers = (org: Organization) => {
    // Navigate to managers page with organization filter and return URL
    const returnUrl = encodeURIComponent('/organizations');
    const orgFilter = encodeURIComponent(org.id);
    const orgName = encodeURIComponent(org.name || 'Organization');

    router.push(
      `/managers?organization=${orgFilter}&organizationName=${orgName}&returnUrl=${returnUrl}`
    );
  };

  const handleViewSites = (org: Organization) => {
    // Navigate to sites page with organization filter and return URL
    const returnUrl = encodeURIComponent('/organizations');
    const orgFilter = encodeURIComponent(org.id);
    const orgName = encodeURIComponent(org.name || 'Organization');

    router.push(
      `/sites?organization=${orgFilter}&organizationName=${orgName}&returnUrl=${returnUrl}`
    );
  };

  const handleViewReports = (org: Organization) => {
    // Navigate to reports page with organization filter and return URL
    const returnUrl = encodeURIComponent('/organizations');
    const orgFilter = encodeURIComponent(org.id);
    const orgName = encodeURIComponent(org.name || 'Organization');

    router.push(
      `/reports?organization=${orgFilter}&organizationName=${orgName}&returnUrl=${returnUrl}`
    );
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrg) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append('logo', file);
      formData.append('organizationId', selectedOrg.id);

      const response = await fetch('/api/organizations/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();

      // Update the selected organization with new logo path
      setSelectedOrg({
        ...selectedOrg,
        logo: data.logoPath,
      });

      // Refresh the organizations list
      fetchOrganizations(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.querySelector('.orgs-container');
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

  return (
    <DashboardLayout>
      <div className='pl-8 pr-[5vw] sm:pl-12 sm:pr-[6vw] lg:pl-16 lg:pr-[8vw] xl:pl-24 xl:pr-[10vw] py-6 max-w-full overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Organizations</h1>
            <p className='text-muted-foreground'>
              Manage client organizations and their information
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>
                  Add a new organization to the system.
                </DialogDescription>
              </DialogHeader>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='name'>Organization Name *</Label>
                  <Input
                    id='name'
                    value={formData.name || ''}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Enter organization name'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='registration_number'>
                    Registration Number
                  </Label>
                  <Input
                    id='registration_number'
                    value={formData.registration_number || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        registration_number: e.target.value,
                      })
                    }
                    placeholder='Enter registration number'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='notes_header'>Notes Header</Label>
                  <Input
                    id='notes_header'
                    value={formData.notes_header || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_header: e.target.value })
                    }
                    placeholder='Enter notes header'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='notes_text'>Notes</Label>
                  <Textarea
                    id='notes_text'
                    value={formData.notes_text || ''}
                    onChange={e =>
                      setFormData({ ...formData, notes_text: e.target.value })
                    }
                    placeholder='Enter notes'
                    rows={4}
                  />
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateOrg} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content with Split View */}
        <div className='orgs-container flex gap-0 overflow-hidden mb-6'>
          {/* Left Panel - Organizations List */}
          <div
            className='space-y-4 flex-shrink-0 flex flex-col'
            style={{
              width: selectedOrg ? `${leftPanelWidth}%` : '100%',
              maxWidth: selectedOrg ? `${leftPanelWidth}%` : '100%',
            }}
          >
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Organizations
                  </CardTitle>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pagination.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Client organizations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    With Registration
                  </CardTitle>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      organizations.filter(org => org.registration_number)
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Have registration numbers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Executive Medical
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {organizations.reduce(
                      (sum, org) =>
                        sum + parseInt(String(org.employee_count || 0)),
                      0
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Employees with Executive Medical reports
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Managers
                  </CardTitle>
                  <UserCheck className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {organizations.reduce(
                      (sum, org) =>
                        sum + parseInt(String(org.manager_count || 0)),
                      0
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Managers across all organizations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Sites
                  </CardTitle>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {organizations.reduce(
                      (sum, org) => sum + parseInt(String(org.site_count || 0)),
                      0
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Sites across all organizations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Medical Reports
                  </CardTitle>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {organizations.reduce(
                      (sum, org) =>
                        sum + parseInt(String(org.medical_report_count || 0)),
                      0
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Total medical reports
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className='glass-effect'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-4 w-full'>
                  <div className='flex-1 flex items-center gap-2'>
                    <Search className='h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search by organization name or registration number...'
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

            {/* Organizations Table */}
            <Card className='hover-lift flex-1 overflow-hidden'>
              <CardHeader>
                <CardTitle className='flex items-center gap-3 text-2xl'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <Building2 className='h-6 w-6 text-blue-600' />
                  </div>
                  <div>
                    <span>Organizations</span>
                    <span className='ml-2 text-lg font-medium text-gray-500'>
                      ({pagination.total})
                    </span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Click on any organization to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='overflow-hidden'>
                  {/* Sticky Header */}
                  <div className='bg-white border-b border-gray-200 px-6 py-3'>
                    <div className='grid grid-cols-9 gap-3 text-sm font-medium text-gray-500'>
                      <div>Name</div>
                      <div>Registration</div>
                      <div>Employees</div>
                      <div>Managers</div>
                      <div>Sites</div>
                      <div>Reports</div>
                      <div>Created</div>
                      <div>Updated</div>
                      <div>Actions</div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className='max-h-[55vh] overflow-auto scrollbar-thin'>
                    {loading ? (
                      <div className='grid grid-cols-9 gap-3 px-6 py-8'>
                        <div className='col-span-9 text-center'>
                          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2' />
                          <p>Loading organizations...</p>
                        </div>
                      </div>
                    ) : organizations.length === 0 ? (
                      <div className='grid grid-cols-9 gap-3 px-6 py-8'>
                        <div className='col-span-9 text-center'>
                          <Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                          <h3 className='text-lg font-medium text-foreground mb-2'>
                            No organizations found
                          </h3>
                          <p className='text-muted-foreground'>
                            No organizations match your search criteria.
                          </p>
                        </div>
                      </div>
                    ) : (
                      organizations.map(org => (
                        <div
                          key={org.id}
                          className={`grid grid-cols-9 gap-3 px-6 py-3 border-b border-gray-100 cursor-pointer hover:bg-muted/50 ${
                            selectedOrg?.id === org.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleOrgClick(org)}
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 flex-shrink-0'>
                              {org.logo ? (
                                <img
                                  src={`/${org.logo}`}
                                  alt={`${org.name} logo`}
                                  className='w-full h-full object-contain rounded border'
                                />
                              ) : (
                                <div className='w-full h-full bg-gray-100 rounded border flex items-center justify-center'>
                                  <Building2 className='h-5 w-5 text-gray-400' />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className='font-medium'>
                                {org.name || 'Unnamed Organization'}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                ID: {org.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                          <div>
                            {org.registration_number ? (
                              <Badge
                                variant='secondary'
                                className='bg-green-100 text-green-800'
                              >
                                {org.registration_number}
                              </Badge>
                            ) : (
                              <span className='text-sm text-muted-foreground'>
                                No registration
                              </span>
                            )}
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <Users className='h-4 w-4 text-muted-foreground' />
                              <span className='font-medium'>
                                {org.employee_count || 0}
                              </span>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Executive Medical{' '}
                              {(org.employee_count || 0) === 1
                                ? 'employee'
                                : 'employees'}
                            </div>
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <UserCheck className='h-4 w-4 text-muted-foreground' />
                              <span className='font-medium'>
                                {org.manager_count || 0}
                              </span>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {(org.manager_count || 0) === 1
                                ? 'manager'
                                : 'managers'}
                            </div>
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <MapPin className='h-4 w-4 text-muted-foreground' />
                              <span className='font-medium'>
                                {org.site_count || 0}
                              </span>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {(org.site_count || 0) === 1 ? 'site' : 'sites'}
                            </div>
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <FileText className='h-4 w-4 text-muted-foreground' />
                              <span className='font-medium'>
                                {org.medical_report_count || 0}
                              </span>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              medical{' '}
                              {(org.medical_report_count || 0) === 1
                                ? 'report'
                                : 'reports'}
                            </div>
                          </div>
                          <div>
                            {new Date(org.date_created).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(org.date_updated).toLocaleDateString()}
                          </div>
                          <div>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={e => {
                                  e.stopPropagation();
                                  openEditDialog(org);
                                }}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteOrg(org.id);
                                }}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className='flex items-center justify-between p-4 border-t'>
                    <div className='text-sm text-muted-foreground'>
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{' '}
                      of {pagination.total} records
                    </div>

                    <div className='flex items-center gap-2'>
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

                      <span className='text-sm font-medium px-3'>
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
          </div>

          {/* Resize Handle */}
          {selectedOrg && (
            <div
              className='w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors duration-200 flex-shrink-0 group'
              onMouseDown={handleMouseDown}
            >
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border group-hover:bg-primary/50 rounded-full transition-colors duration-200'></div>
            </div>
          )}

          {/* Right Panel - Organization Preview */}
          <div
            className={`${selectedOrg ? 'animate-slide-up' : ''} overflow-hidden`}
            style={{
              width: selectedOrg
                ? `calc(${100 - leftPanelWidth}% - 4px)`
                : '0%',
              maxWidth: selectedOrg
                ? `calc(${100 - leftPanelWidth}% - 4px)`
                : '0%',
              paddingLeft: selectedOrg ? '12px' : '0',
              paddingRight: selectedOrg ? '0px' : '0',
              overflow: selectedOrg ? 'visible' : 'hidden',
            }}
          >
            {selectedOrg && (
              <div className='space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin'>
                {/* Organization Header Card */}
                <Card className='glass-effect'>
                  <CardContent className='p-4 min-h-[120px] flex items-center'>
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start w-full gap-4'>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                          <div className='w-16 h-16 flex-shrink-0'>
                            {selectedOrg.logo ? (
                              <img
                                src={`/${selectedOrg.logo}`}
                                alt={`${selectedOrg.name} logo`}
                                className='w-full h-full object-contain rounded border'
                              />
                            ) : (
                              <div className='w-full h-full bg-gray-100 rounded border flex items-center justify-center'>
                                <Building2 className='h-8 w-8 text-gray-400' />
                              </div>
                            )}
                          </div>
                          <div>
                            <h2 className='text-xl font-semibold'>
                              {selectedOrg.name || 'Unnamed Organization'}
                            </h2>
                            {selectedOrg.registration_number && (
                              <div className='text-sm text-muted-foreground mt-1'>
                                Registration: {selectedOrg.registration_number}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <Badge variant='secondary'>
                            ID: {selectedOrg.id.substring(0, 8)}...
                          </Badge>
                          {selectedOrg.registration_number && (
                            <Badge
                              className='bg-green-100 text-green-800'
                              variant='secondary'
                            >
                              Registered
                            </Badge>
                          )}
                        </div>
                        {/* Last Updated Information */}
                        <div className='text-xs text-muted-foreground mt-2'>
                          <span>Last updated by </span>
                          <span className='font-medium'>
                            {selectedOrg.user_updated || 'Unknown'}
                          </span>
                          <span> on </span>
                          <span className='font-medium'>
                            {selectedOrg.date_updated
                              ? new Date(
                                  selectedOrg.date_updated
                                ).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedOrg(null)}
                          className='hover-lift'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Organization Details */}
                <Card className='border-blue-200'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Building2 className='h-5 w-5' />
                      Organization Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      <div>
                        <div className='text-muted-foreground'>
                          Organization Name
                        </div>
                        <div className='font-semibold'>
                          {selectedOrg.name || 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <div className='text-muted-foreground'>
                          Registration Number
                        </div>
                        <div className='font-semibold'>
                          {selectedOrg.registration_number || 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <div className='text-muted-foreground'>
                          Executive Medical Employees
                        </div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          {selectedOrg.employee_count || 0}{' '}
                          {(selectedOrg.employee_count || 0) === 1
                            ? 'employee'
                            : 'employees'}
                        </div>
                        {(selectedOrg.employee_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewEmployees(selectedOrg)}
                            className='flex items-center gap-2'
                          >
                            <Users className='h-3 w-3' />
                            View Employees
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      <div>
                        <div className='text-muted-foreground'>Managers</div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <UserCheck className='h-4 w-4 text-muted-foreground' />
                          {selectedOrg.manager_count || 0}{' '}
                          {(selectedOrg.manager_count || 0) === 1
                            ? 'manager'
                            : 'managers'}
                        </div>
                        {(selectedOrg.manager_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewManagers(selectedOrg)}
                            className='flex items-center gap-2'
                          >
                            <UserCheck className='h-3 w-3' />
                            View Managers
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      <div>
                        <div className='text-muted-foreground'>
                          Sites/Workplaces
                        </div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <MapPin className='h-4 w-4 text-muted-foreground' />
                          {selectedOrg.site_count || 0}{' '}
                          {(selectedOrg.site_count || 0) === 1
                            ? 'site'
                            : 'sites'}
                        </div>
                        {(selectedOrg.site_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewSites(selectedOrg)}
                            className='flex items-center gap-2'
                          >
                            <MapPin className='h-3 w-3' />
                            View Sites
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      <div>
                        <div className='text-muted-foreground'>
                          Medical Reports
                        </div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <FileText className='h-4 w-4 text-muted-foreground' />
                          {selectedOrg.medical_report_count || 0}{' '}
                          {(selectedOrg.medical_report_count || 0) === 1
                            ? 'report'
                            : 'reports'}
                        </div>
                        {(selectedOrg.medical_report_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewReports(selectedOrg)}
                            className='flex items-center gap-2'
                          >
                            <FileText className='h-3 w-3' />
                            View Reports
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                      <div className='lg:col-span-5'>
                        <div className='text-muted-foreground'>
                          Organization ID
                        </div>
                        <div className='font-semibold font-mono text-sm'>
                          {selectedOrg.id}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes Section */}
                {(selectedOrg.notes_header || selectedOrg.notes_text) && (
                  <Card className='border-purple-200'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {selectedOrg.notes_header && (
                        <div>
                          <div className='text-muted-foreground'>Header</div>
                          <div className='font-semibold'>
                            {selectedOrg.notes_header}
                          </div>
                        </div>
                      )}
                      {selectedOrg.notes_text && (
                        <div>
                          <div className='text-muted-foreground'>Notes</div>
                          <div className='font-medium whitespace-pre-wrap'>
                            {selectedOrg.notes_text}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Record Information */}
                <Card className='border-gray-200'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <FileText className='h-5 w-5' />
                      Record Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <div className='text-muted-foreground'>Created</div>
                        <div className='font-semibold'>
                          {new Date(selectedOrg.date_created).toLocaleString()}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {selectedOrg.created_by_name || 'System'}
                        </div>
                      </div>
                      <div>
                        <div className='text-muted-foreground'>
                          Last Updated
                        </div>
                        <div className='font-semibold'>
                          {new Date(selectedOrg.date_updated).toLocaleString()}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {selectedOrg.updated_by_name || 'System'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Logo Section */}
                <Card className='border-orange-200'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Image className='h-5 w-5' />
                      Organization Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {selectedOrg.logo ? (
                      <div className='space-y-4'>
                        <div>
                          <div className='text-muted-foreground mb-2'>
                            Current Logo
                          </div>
                          <div className='border rounded-lg p-4 bg-gray-50 flex justify-center'>
                            <img
                              src={`/${selectedOrg.logo}`}
                              alt='Organization Logo'
                              className='max-w-full h-auto max-h-32 object-contain border rounded'
                              onError={e => {
                                console.error(
                                  'Failed to load logo image:',
                                  selectedOrg.logo
                                );
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          File: {selectedOrg.logo.split('/').pop()}
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
                        <Image className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
                        <p className='text-muted-foreground'>
                          No logo uploaded
                        </p>
                      </div>
                    )}

                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={uploadingLogo}
                        onClick={() =>
                          document.getElementById('logo-upload')?.click()
                        }
                        className='flex items-center gap-2'
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className='h-4 w-4' />
                            {selectedOrg.logo ? 'Replace Logo' : 'Upload Logo'}
                          </>
                        )}
                      </Button>
                      <input
                        id='logo-upload'
                        type='file'
                        accept='image/*'
                        onChange={handleLogoUpload}
                        className='hidden'
                      />
                      <div className='text-xs text-muted-foreground'>
                        Supported formats: PNG, JPG, JPEG, GIF
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>
                Update the organization information below.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='edit_name'>Organization Name *</Label>
                <Input
                  id='edit_name'
                  value={formData.name || ''}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Enter organization name'
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='edit_registration_number'>
                  Registration Number
                </Label>
                <Input
                  id='edit_registration_number'
                  value={formData.registration_number || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      registration_number: e.target.value,
                    })
                  }
                  placeholder='Enter registration number'
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='edit_notes_header'>Notes Header</Label>
                <Input
                  id='edit_notes_header'
                  value={formData.notes_header || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_header: e.target.value })
                  }
                  placeholder='Enter notes header'
                />
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='edit_notes_text'>Notes</Label>
                <Textarea
                  id='edit_notes_text'
                  value={formData.notes_text || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes_text: e.target.value })
                  }
                  placeholder='Enter notes'
                  rows={4}
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
              <Button onClick={handleEditOrg} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Organization'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
