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
  MapPin,
  Building2,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { PageLoading } from '@/components/ui/loading';

interface Location {
  id: string;
  date_created: string;
  date_updated: string;
  user_created: string | null;
  user_updated: string | null;
  site_id: string | null;
  name: string | null;
  address: string | null;
  manager: string | null;
  created_by_name?: string;
  updated_by_name?: string;
  site_name?: string;
  manager_name?: string;
  employee_count?: number;
}

interface Site {
  id: string;
  name: string;
}

interface Manager {
  id: string;
  manager_name: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function LocationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter parameters from URL
  const siteFilter = searchParams.get('site');
  const siteName = searchParams.get('siteName');
  const returnUrl = searchParams.get('returnUrl');

  const [locations, setLocations] = useState<Location[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<Location>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(60);
  const [isResizing, setIsResizing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const fetchLocations = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let url = `/api/locations?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(search)}`;

      if (siteFilter) {
        url += `&site=${encodeURIComponent(siteFilter)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch locations');

      const data = await response.json();
      setLocations(data.locations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch sites');

      const data = await response.json();
      setSites(data.sites);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/managers?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch managers');

      const data = await response.json();
      setManagers(data.managers);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchSites();
    fetchManagers();
  }, [siteFilter]);

  const handleSearch = () => {
    fetchLocations(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchLocations(newPage, searchTerm);
  };

  const handleCreateLocation = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          site_id: formData.site_id === 'none' ? null : formData.site_id,
          manager: formData.manager === 'none' ? null : formData.manager,
          user_created: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to create location');

      setIsCreateDialogOpen(false);
      setFormData({});
      fetchLocations(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          site_id: formData.site_id === 'none' ? null : formData.site_id,
          manager: formData.manager === 'none' ? null : formData.manager,
          user_updated: '1', // TODO: Use actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to update location');

      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedLocation(null);
      fetchLocations(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    setLocationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    try {
      const response = await fetch(`/api/locations/${locationToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete location');

      toast.success('Location deleted successfully!');
      fetchLocations(pagination.page, searchTerm);
      if (selectedLocation?.id === locationToDelete) {
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  const openEditDialog = (location: Location) => {
    setFormData({
      ...location,
      site_id: location.site_id || 'none',
      manager: location.manager || 'none',
    });
    setSelectedLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleViewSite = (location: Location) => {
    if (!location.site_name || !location.site_id) return;

    const returnUrl = encodeURIComponent('/locations');
    const siteFilter = encodeURIComponent(location.site_id);
    const siteName = encodeURIComponent(location.site_name);
    router.push(
      `/sites?site=${siteFilter}&siteName=${siteName}&returnUrl=${returnUrl}`
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

      const container = document.querySelector('.locations-container');
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
        {(returnUrl || siteFilter) && (
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {returnUrl && (
                <Button
                  variant='outline'
                  onClick={() => router.push(returnUrl)}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to Sites
                </Button>
              )}

              {siteFilter && siteName && (
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 text-blue-700 border-blue-200'
                  >
                    <MapPin className='h-3 w-3 mr-1' />
                    Filtered by: {decodeURIComponent(siteName)}
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete('site');
                      params.delete('siteName');
                      router.push(`/locations?${params.toString()}`);
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
            <h1 className='text-3xl font-bold tracking-tight'>Locations</h1>
            <p className='text-muted-foreground'>
              Manage specific locations within sites
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className='hover-lift'>
                <Plus className='h-4 w-4 mr-2' />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Create New Location</DialogTitle>
                <DialogDescription>
                  Add a new location to the system
                </DialogDescription>
              </DialogHeader>

              <div className='grid grid-cols-1 gap-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Location Name</Label>
                  <Input
                    id='name'
                    value={formData.name || ''}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Enter location name'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='site_id'>Site</Label>
                  <Select
                    value={formData.site_id || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, site_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select site' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No Site</SelectItem>
                      {sites.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
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
                    placeholder='Enter location address'
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='manager'>Manager</Label>
                  <Select
                    value={formData.manager || ''}
                    onValueChange={value =>
                      setFormData({ ...formData, manager: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select manager' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No Manager</SelectItem>
                      {managers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.manager_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button onClick={handleCreateLocation} disabled={submitting}>
                  {submitting && (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  )}
                  Create Location
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className='locations-container flex gap-1 min-h-[600px]'>
          {/* Left Panel - Locations Table */}
          <div
            className='space-y-4'
            style={{ width: selectedLocation ? `${leftPanelWidth}%` : '100%' }}
          >
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Locations
                  </CardTitle>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pagination.total}</div>
                  <p className='text-xs text-muted-foreground'>
                    Active locations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Sites</CardTitle>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      new Set(locations.map(l => l.site_id).filter(Boolean))
                        .size
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Sites with locations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Managed Locations
                  </CardTitle>
                  <UserCheck className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {locations.filter(l => l.manager).length}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    With assigned managers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Addresses
                  </CardTitle>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      locations.filter(l => l.address && l.address.trim())
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Locations with addresses
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
                      placeholder='Search by location name or address...'
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
                        fetchLocations(1, '');
                      }}
                      className='hover-lift'
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Locations Table */}
            <Card className='hover-lift'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-2xl'>
                  <MapPin className='h-6 w-6' />
                  Locations ({pagination.total})
                </CardTitle>
                <CardDescription>
                  Location records and site information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locations.length === 0 ? (
                  <div className='text-center py-12'>
                    <MapPin className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>
                      No locations found
                    </h3>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? 'Try adjusting your search criteria.'
                        : 'No locations available.'}
                    </p>
                  </div>
                ) : (
                  <div className='max-h-[500px] overflow-auto scrollbar-premium'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Location</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Manager</TableHead>
                          <TableHead>Employees</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map(location => (
                          <TableRow
                            key={location.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedLocation?.id === location.id
                                ? 'bg-muted border-l-4 border-l-primary'
                                : ''
                            }`}
                            onClick={() => handleLocationClick(location)}
                          >
                            <TableCell>
                              <div>
                                <div className='font-medium'>
                                  {location.name || 'Unnamed Location'}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  ID: {location.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {location.site_name ? (
                                <Badge
                                  variant='secondary'
                                  className='bg-blue-100 text-blue-800'
                                >
                                  {location.site_name}
                                </Badge>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  No site
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-sm max-w-[200px] truncate'>
                              {location.address || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {location.manager_name ? (
                                <div className='font-medium'>
                                  {location.manager_name}
                                </div>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  No manager
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <span className='text-sm text-muted-foreground'>
                                  N/A
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
                                    openEditDialog(location);
                                  }}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteLocation(location.id);
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
                                key={`locations-page-${page}`}
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
          {selectedLocation && (
            <div
              className='w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex-shrink-0'
              onMouseDown={handleMouseDown}
              style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
            />
          )}

          {/* Right Panel - Location Details */}
          {selectedLocation && (
            <div
              className='space-y-4 animate-slide-up'
              style={{ width: `${100 - leftPanelWidth}%` }}
            >
              <Card className='glass-effect'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div className='space-y-1'>
                      <CardTitle className='text-2xl medical-heading'>
                        {selectedLocation.name || 'Unnamed Location'}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-2'>
                        {selectedLocation.site_name && (
                          <Badge variant='secondary' className='bg-blue-800'>
                            {selectedLocation.site_name}
                          </Badge>
                        )}
                        {selectedLocation.manager_name && (
                          <Badge variant='outline'>
                            Manager: {selectedLocation.manager_name}
                          </Badge>
                        )}
                      </CardDescription>
                      {/* Last Updated Information */}
                      <div className='text-xs text-muted-foreground mt-2'>
                        <span>Last updated by </span>
                        <span className='font-medium'>
                          {selectedLocation.updated_by_name ||
                            selectedLocation.user_updated ||
                            'Unknown'}
                        </span>
                        <span> on </span>
                        <span className='font-medium'>
                          {selectedLocation.date_updated
                            ? new Date(
                                selectedLocation.date_updated
                              ).toLocaleString()
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedLocation(null)}
                      className='hover-lift'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-premium'>
                  {/* Location Information */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      Location Information
                    </h3>
                    <div className='grid grid-cols-1 gap-3 text-sm'>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Name:
                        </span>
                        <span className='font-medium'>
                          {selectedLocation.name || 'N/A'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Site:
                        </span>
                        <span className='font-medium'>
                          {selectedLocation.site_name || 'N/A'}
                        </span>
                      </div>
                      {selectedLocation.address && (
                        <div className='flex gap-2 items-start'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Address:
                          </span>
                          <span className='font-medium'>
                            {selectedLocation.address}
                          </span>
                        </div>
                      )}
                      {selectedLocation.manager_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Manager:
                          </span>
                          <span className='font-medium'>
                            {selectedLocation.manager_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className='space-y-3'>
                    <h3 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2'>
                      <Building2 className='h-4 w-4' />
                      Site Information
                    </h3>
                    <div className='grid grid-cols-1 gap-4'>
                      {/* Site Information */}
                      <div>
                        <div className='text-muted-foreground'>
                          Site Information
                        </div>
                        <div className='font-semibold flex items-center gap-2 mb-2'>
                          <Building2 className='h-4 w-4 text-muted-foreground' />
                          {selectedLocation.site_name || 'No site assigned'}
                        </div>
                        <div className='text-xs text-muted-foreground mb-2'>
                          {selectedLocation.site_name
                            ? 'Location within site'
                            : 'Standalone location'}
                        </div>
                        {selectedLocation.site_name && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewSite(selectedLocation)}
                            className='flex items-center gap-2'
                          >
                            <Building2 className='h-3 w-3' />
                            View Site
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
                          {formatDate(selectedLocation.date_created)}
                        </span>
                      </div>
                      {selectedLocation.created_by_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Created By:
                          </span>
                          <span className='font-medium'>
                            {selectedLocation.created_by_name}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Last Updated:
                        </span>
                        <span className='font-medium'>
                          {formatDate(selectedLocation.date_updated)}
                        </span>
                      </div>
                      {selectedLocation.updated_by_name && (
                        <div className='flex gap-2'>
                          <span className='text-muted-foreground min-w-[120px]'>
                            Updated By:
                          </span>
                          <span className='font-medium'>
                            {selectedLocation.updated_by_name}
                          </span>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <span className='text-muted-foreground min-w-[120px]'>
                          Location ID:
                        </span>
                        <span className='font-mono text-xs'>
                          {selectedLocation.id}
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
              <DialogTitle>Edit Location</DialogTitle>
              <DialogDescription>Update location information</DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_name'>Location Name</Label>
                <Input
                  id='edit_name'
                  value={formData.name || ''}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Enter location name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_site_id'>Site</Label>
                <Select
                  value={formData.site_id || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, site_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select site' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No Site</SelectItem>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
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
                  placeholder='Enter location address'
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit_manager'>Manager</Label>
                <Select
                  value={formData.manager || ''}
                  onValueChange={value =>
                    setFormData({ ...formData, manager: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select manager' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No Manager</SelectItem>
                    {managers.map(manager => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.manager_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button onClick={handleEditLocation} disabled={submitting}>
                {submitting && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                )}
                Update Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Location</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this location? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteLocation}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

export default function LocationsPage() {
  return (
    // <ProtectedRoute>
    <DashboardLayout>
      <div className='p-6'>
        <h1 className='text-2xl font-bold'>Locations</h1>
        <p className='text-muted-foreground'>Specific locations within sites</p>
      </div>
    </DashboardLayout>
    // </ProtectedRoute>
  );
}
