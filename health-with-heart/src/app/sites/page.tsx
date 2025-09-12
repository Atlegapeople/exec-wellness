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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building2,
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
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/ui/loading';

interface Site {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  organisation_id: string | null;
  name: string | null;
  address: string | null;
  site_admin_email: string | null;
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


function SitesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter parameters from URL
  const organizationFilter = searchParams.get('organization');
  const organizationName = searchParams.get('organizationName');
  const returnUrl = searchParams.get('returnUrl');

  const [sites, setSites] = useState<Site[]>([]);
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
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState<Partial<Site>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60);
  const [isResizing, setIsResizing] = useState(false);

  const fetchSites = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let url = `/api/sites?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`;

      if (organizationFilter) {
        url += `&organization=${encodeURIComponent(organizationFilter)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch sites');

      const data = await response.json();
      setSites(data.sites);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching sites:', error);
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
    fetchSites();
    fetchOrganizations();
  }, []);

  const handleSearch = () => {
    fetchSites(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchSites(newPage, searchTerm);
  };

  const handleCreateSite = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/sites', {
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

      if (!response.ok) throw new Error('Failed to create site');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchSites(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating site:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSite = async () => {
    if (!selectedSite) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/sites/${selectedSite.id}`, {
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
      });

      if (!response.ok) throw new Error('Failed to update site');

      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedSite(null);
      fetchSites(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating site:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;

    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete site');

      fetchSites(pagination.page, searchTerm);
      if (selectedSite?.id === id) {
        setSelectedSite(null);
      }
    } catch (error) {
      console.error('Error deleting site:', error);
    }
  };

  const openEditDialog = (site: Site) => {
    setFormData({
      ...site,
      organisation_id: site.organisation_id || 'none',
    });
    setSelectedSite(site);
    setIsEditDialogOpen(true);
  };

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleViewEmployees = (site: Site) => {
    if (!site.organisation_id) return;

    const returnUrl = encodeURIComponent('/sites');
    const orgFilter = encodeURIComponent(site.organisation_id);
    const orgName = encodeURIComponent(
      site.organisation_name || 'Organization'
    );
    router.push(
      `/employees?organization=${orgFilter}&organizationName=${orgName}&returnUrl=${returnUrl}`
    );
  };

  const handleViewReports = (site: Site) => {
    const returnUrl = encodeURIComponent('/sites');
    const siteFilter = encodeURIComponent(site.id);
    const siteName = encodeURIComponent(site.name || 'Site');
    router.push(
      `/reports?site=${siteFilter}&siteName=${siteName}&returnUrl=${returnUrl}`
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

      const container = document.querySelector('.sites-container');
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

  if (loading && sites.length === 0) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='w-96'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>Loading sites...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className='px-8 sm:px-12 lg:px-16 xl:px-24 py-6'>
        {/* Back Button and Filter Info */}
        {(returnUrl || organizationFilter) && (
          <div className='mb-6'>
            <div className='flex items-center gap-4'>
              {returnUrl && (
                <Button
                  variant='outline'
                  onClick={() => router.push(decodeURIComponent(returnUrl))}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to{' '}
                  {returnUrl === '/organizations'
                    ? 'Organizations'
                    : 'Previous Page'}
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
                      router.push(`/sites?${params.toString()}`);
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
            <h1 className='text-3xl font-bold tracking-tight'>Sites</h1>
            <p className='text-muted-foreground'>
              Manage organizational sites and their information
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className='hover-lift'>
                <Plus className='h-4 w-4 mr-2' />
                Add Site
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Create New Site</DialogTitle>
                <DialogDescription>
                  Add a new site to the system
                </DialogDescription>
              </DialogHeader>

              <div className='grid grid-cols-1 gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Site Name</Label>
                  <Input
                    id='name'
                    value={formData.name || ''}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Enter site name'
                  />
                </div>

                <div className='space-y-2'>
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

                <div className='space-y-2'>
                  <Label htmlFor='address'>Address</Label>
                  <Textarea
                    id='address'
                    value={formData.address || ''}
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder='Enter site address'
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='site_admin_email'>Site Admin Email</Label>
                  <Input
                    id='site_admin_email'
                    type='email'
                    value={formData.site_admin_email || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        site_admin_email: e.target.value,
                      })
                    }
                    placeholder='Enter admin email address'
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
                <Button onClick={handleCreateSite} disabled={submitting}>
                  {submitting && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  Create Site
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className='sites-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Sites Table */}
          <div
            className='space-y-4'
            style={{ width: selectedSite ? `${leftPanelWidth}%` : '100%' }}
          >
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Sites
                  </CardTitle>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pagination.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Registered sites
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    With Organizations
                  </CardTitle>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {sites.filter(s => s.organisation_id).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Assigned to organizations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    With Admin Contact
                  </CardTitle>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {sites.filter(s => s.site_admin_email).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Have admin contact
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    With Address
                  </CardTitle>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {sites.filter(s => s.address).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Have physical address
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className='glass-effect'>
              <CardContent className='p-4'>
                <div className='flex gap-4'>
                  <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='text'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder='Search by name, address, or admin email...'
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
                        fetchSites(1, '');
                      }}
                      className='hover-lift'
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sites Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-2xl'>
                  <MapPin className='h-6 w-6' />
                  Sites ({pagination.total})
                </CardTitle>
                <CardDescription>Site records and information</CardDescription>
              </CardHeader>
              <CardContent>
                {sites.length === 0 ? (
                  <div className='text-center py-12'>
                    <MapPin className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No sites found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No sites available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Site</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Admin Email</TableHead>
                          <TableHead>Employees</TableHead>
                          <TableHead>Reports</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sites.map(site => (
                          <TableRow
                            key={site.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedSite?.id === site.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleSiteClick(site)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {site.name || 'Unnamed Site'}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  ID: {site.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {site.organisation_name ? (
                                <Badge
                                  variant='secondary'
                                  className='bg-blue-100 text-blue-800'
                                >
                                  {site.organisation_name}
                                </Badge>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  No organization
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-sm max-w-[200px] truncate'>
                              {site.address || 'N/A'}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {site.site_admin_email || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                  {site.employee_count || 0}
                                </span>
                                <span className='text-sm text-muted-foreground'>
                                  employees
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                  {site.medical_report_count || 0}
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
                                    openEditDialog(site);
                                  }}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteSite(site.id);
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
                                key={`sites-page-${page}`}
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
          {selectedSite && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Site Details */}
          {selectedSite && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftPanelWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedSite.name || 'Unnamed Site'}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        {selectedSite.organisation_name ? (
                          <Badge
                            variant='secondary'
                            className='bg-blue-100 text-blue-800'
                          >
                            {selectedSite.organisation_name}
                          </Badge>
                        ) : (
                          <Badge variant='outline'>No Organization</Badge>
                        )}
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedSite.updated_by_name ||
                            selectedSite.user_updated ||
                            'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedSite.date_updated
                            ? new Date(
                                selectedSite.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedSite(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Site Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      Site Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Site Name:
                        </span>
                        <span className='font-medium'>
                          {selectedSite.name || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Organization:
                        </span>
                        <span className='font-medium'>
                          {selectedSite.organisation_name || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2 items-start'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Address:
                        </span>
                        <span className='font-medium'>
                          {selectedSite.address || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Mail className='h-4 w-4' />
                      Contact Information
                    </h3>
                    <div className='space-y-3 text-sm'>
                      <div className='flex gap-2'>
                        <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div className='flex-1'>
                          <div className='text-muted-foreground text-xs'>
                            Site Admin Email
                          </div>
                          <span className='font-medium text-xs break-all'>
                            {selectedSite.site_admin_email || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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
                          {selectedSite.employee_count || 0}{' '}
                          {(selectedSite.employee_count || 0) === 1
                            ? 'employee'
                            : 'employees'}
                        </div>
                        <div className='text-xs text-muted-foreground mb-2'>
                          in organization
                        </div>
                        {(selectedSite.employee_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewEmployees(selectedSite)}
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
                          {selectedSite.medical_report_count || 0}{' '}
                          {(selectedSite.medical_report_count || 0) === 1
                            ? 'report'
                            : 'reports'}
                        </div>
                        <div className='text-xs text-muted-foreground mb-2'>
                          at this site
                        </div>
                        {(selectedSite.medical_report_count || 0) > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewReports(selectedSite)}
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
                          {formatDate(selectedSite.date_created)}
                        </span>
                      </div>
                      {selectedSite.created_by_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Created By:
                          </span>
                          <span className='font-medium'>
                            {selectedSite.created_by_name}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedSite.date_updated)}
                        </span>
                      </div>
                      {selectedSite.updated_by_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Updated By:
                          </span>
                          <span className='font-medium'>
                            {selectedSite.updated_by_name}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Site ID:
                        </span>
                        <span className='font-mono text-xs'>
                          {selectedSite.id}
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
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Site</DialogTitle>
              <DialogDescription>Update site information</DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_name'>Site Name</Label>
                <Input
                  id='edit_name'
                  value={formData.name || ''}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Enter site name'
                />
              </div>

              <div className='space-y-2'>
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

              <div className='space-y-2'>
                <Label htmlFor='edit_address'>Address</Label>
                <Textarea
                  id='edit_address'
                  value={formData.address || ''}
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder='Enter site address'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_site_admin_email'>Site Admin Email</Label>
                <Input
                  id='edit_site_admin_email'
                  type='email'
                  value={formData.site_admin_email || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      site_admin_email: e.target.value,
                    })
                  }
                  placeholder='Enter admin email address'
                />
              </div>
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setFormData({});
                  setSelectedSite(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSite} disabled={submitting}>
                {submitting && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                Update Site
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}


export default function SitesPage() {
  return (
    // <ProtectedRoute>
      <DashboardLayout>
        <div className='p-6'>
          <h1 className='text-2xl font-bold'>Sites</h1>
          <p className='text-muted-foreground'>Site locations and workplaces</p>
        </div>
      </DashboardLayout>
    // </ProtectedRoute>
  );
}
